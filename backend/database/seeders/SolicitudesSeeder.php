<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Solicitud;
use App\Models\User;
use App\Models\Vehiculo;
use App\Models\Estado;
use App\Models\Resolucion;
use App\Models\Pago;
use App\Models\MetodoPago;
use App\Models\EstadoPago;
use App\Models\Historial;
use App\Enums\EstadoSlug;
use App\Enums\ResolucionSlug;
use Carbon\Carbon;

class SolicitudesSeeder extends Seeder
{
    public function run()
    {
        // Cargamos IDs en memoria para no repetir queries en el bucle
        $estados = Estado::all()->keyBy('slug');
        $resoluciones = Resolucion::all()->keyBy('slug');
        $empleados = User::whereIn('rol_id', \App\Models\Rol::where('slug', 'empleado')->select('id'))->pluck('id')->toArray();
        $clientes  = User::whereIn('rol_id', \App\Models\Rol::where('slug', 'cliente')->select('id'))->pluck('id')->toArray();
        $vehiculos = Vehiculo::pluck('id')->toArray();
        $metodosPago   = MetodoPago::pluck('id')->toArray();
        $estadosPagados = EstadoPago::where('nombre', 'pagado')->pluck('id')->first()
                        ?? EstadoPago::first()->id;

        if (empty($clientes) || empty($vehiculos)) {
            $this->command->warn('No hay clientes o vehículos suficientes para crear solicitudes.');
            return;
        }

        // ---------------------------------------------------------------------------
        // Distribución: 60 solicitudes repartidas a lo largo de los últimos 12 meses
        //
        //   - 20 FINALIZADAS  (con resolución, pago e historial)
        //   - 15 ASIGNADAS    (con empleado asignado)
        //   - 10 EN_RECOGIDA
        //   - 5  EN_ITV
        //   - 5  RETORNANDO
        //   - 3  CANCELADAS
        //   - 7  PENDIENTES   (recientes, sin empleado)
        // ---------------------------------------------------------------------------

        $grupos = [
            ['slug' => EstadoSlug::FINALIZADO->value,  'count' => 20, 'pago' => true,  'historial' => true],
            ['slug' => EstadoSlug::ASIGNADO->value,    'count' => 15, 'pago' => false, 'historial' => false],
            ['slug' => EstadoSlug::EN_RECOGIDA->value, 'count' => 10, 'pago' => false, 'historial' => false],
            ['slug' => EstadoSlug::EN_ITV->value,      'count' => 5,  'pago' => false, 'historial' => false],
            ['slug' => EstadoSlug::RETORNANDO->value,  'count' => 5,  'pago' => false, 'historial' => false],
            ['slug' => EstadoSlug::CANCELADO->value,   'count' => 3,  'pago' => false, 'historial' => false],
            ['slug' => EstadoSlug::PENDIENTE->value,   'count' => 7,  'pago' => false, 'historial' => false],
        ];

        foreach ($grupos as $grupo) {
            $estadoId = $estados[$grupo['slug']]->id;

            // Para estados activos (no pendientes) asignamos empleado
            $necesitaEmpleado = !in_array($grupo['slug'], [EstadoSlug::PENDIENTE->value, EstadoSlug::CANCELADO->value]);

            for ($i = 0; $i < $grupo['count']; $i++) {
                // Fecha aleatoria en los últimos 12 meses
                $createdAt = Carbon::now()->subDays(fake()->numberBetween(1, 365));
                $fechaProgramada = $createdAt->copy()->addDays(fake()->numberBetween(1, 14));

                $clienteId  = fake()->randomElement($clientes);
                $vehiculoId = fake()->randomElement($vehiculos);
                $empleadoId = $necesitaEmpleado && !empty($empleados)
                    ? fake()->randomElement($empleados)
                    : null;

                // Resolución: las finalizadas tienen una resolución real, el resto pendiente
                $resolucionSlug = $grupo['slug'] === EstadoSlug::FINALIZADO->value
                    ? fake()->randomElement([ResolucionSlug::FAVORABLE->value, ResolucionSlug::DESFAVORABLE->value])
                    : ResolucionSlug::PENDIENTE->value;
                $resolucionId = $resoluciones[$resolucionSlug]->id;

                // Horas según estado
                $horaRecogida = in_array($grupo['slug'], [
                    EstadoSlug::EN_RECOGIDA->value, EstadoSlug::EN_ITV->value,
                    EstadoSlug::RETORNANDO->value,  EstadoSlug::FINALIZADO->value,
                ]) ? $fechaProgramada->copy()->setTime(fake()->numberBetween(8, 11), 0) : null;

                $horaItv = in_array($grupo['slug'], [
                    EstadoSlug::EN_ITV->value, EstadoSlug::RETORNANDO->value, EstadoSlug::FINALIZADO->value,
                ]) ? $fechaProgramada->copy()->setTime(fake()->numberBetween(10, 13), 0) : null;

                $horaEntrega = $grupo['slug'] === EstadoSlug::FINALIZADO->value
                    ? $fechaProgramada->copy()->setTime(fake()->numberBetween(14, 18), 0)
                    : null;

                // Insertamos directo con DB para evitar disparar los observers del modelo
                $solicitudId = DB::table('solicitudes')->insertGetId([
                    'user_cliente_id'  => $clienteId,
                    'vehiculo_id'      => $vehiculoId,
                    'user_empleado_id' => $empleadoId,
                    'direccion'        => fake()->address(),
                    'estado_id'        => $estadoId,
                    'resolucion_id'    => $resolucionId,
                    'fecha_programada' => $fechaProgramada->toDateString(),
                    'hora_recogida'    => $horaRecogida,
                    'hora_itv'         => $horaItv,
                    'hora_entrega'     => $horaEntrega,
                    'notas'            => fake()->optional(0.4)->sentence(),
                    'pago_id'          => null,
                    'created_at'       => $createdAt,
                    'updated_at'       => $createdAt,
                ]);

                // Pago + Historial para finalizadas
                if ($grupo['pago']) {
                    $pagoId = DB::table('pagos')->insertGetId([
                        'solicitud_id'   => $solicitudId,
                        'importe'        => fake()->randomFloat(2, 50, 300),
                        'metodo_pago_id' => fake()->randomElement($metodosPago),
                        'estado_pago_id' => $estadosPagados,
                        'created_at'     => $horaEntrega ?? $createdAt,
                        'updated_at'     => $horaEntrega ?? $createdAt,
                    ]);

                    // Actualizar pago_id en solicitud
                    DB::table('solicitudes')->where('id', $solicitudId)->update(['pago_id' => $pagoId]);
                }

                if ($grupo['historial']) {
                    DB::table('historiales')->insert([
                        'solicitud_id'  => $solicitudId,
                        'fecha_itv'     => $horaItv ? $horaItv->toDateString() : $fechaProgramada->toDateString(),
                        'resolucion_id' => $resolucionId,
                        'notas'         => fake()->optional(0.3)->sentence(),
                    ]);
                }
            }
        }
    }
}