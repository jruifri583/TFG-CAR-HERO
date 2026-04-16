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
        $estados       = Estado::all()->keyBy('slug');
        $resoluciones  = Resolucion::all()->keyBy('slug');
        $empleados     = User::whereIn('rol_id', \App\Models\Rol::where('slug', 'empleado')->select('id'))->pluck('id')->toArray();
        $clientes      = User::whereIn('rol_id', \App\Models\Rol::where('slug', 'cliente')->select('id'))->pluck('id')->toArray();
        $estadosPagados = EstadoPago::where('slug', 'pagado')->first()->id;
        $estadosPendientes = EstadoPago::where('slug', 'pendiente')->first()->id;

        if (empty($clientes)) {
            $this->command->warn('No hay clientes suficientes para crear solicitudes.');
            return;
        }

        $grupos = [
            ['slug' => EstadoSlug::FINALIZADO->value,  'count' => 20, 'pago' => true,  'historial' => true],
            ['slug' => EstadoSlug::ASIGNADO->value,    'count' => 15, 'pago' => false, 'historial' => false],
            ['slug' => EstadoSlug::EN_RECOGIDA->value, 'count' => 10, 'pago' => false, 'historial' => false],
            ['slug' => EstadoSlug::EN_ITV->value,      'count' => 5,  'pago' => false, 'historial' => false],
            ['slug' => EstadoSlug::RETORNANDO->value,  'count' => 5,  'pago' => false, 'historial' => false],
            ['slug' => EstadoSlug::CANCELADO->value,   'count' => 3,  'pago' => false, 'historial' => false],
            ['slug' => EstadoSlug::PENDIENTE->value,   'count' => 7,  'pago' => false, 'historial' => false],
        ];

        // Registro de vehículos usados por año: "vehiculo_id_año"
        $vehiculosUsados = [];

        foreach ($grupos as $grupo) {
            $estadoId = $estados[$grupo['slug']]->id;
            $necesitaEmpleado = !in_array($grupo['slug'], [
                EstadoSlug::PENDIENTE->value,
                EstadoSlug::CANCELADO->value,
            ]);

            $i = 0;
            $intentos = 0;
            $maxIntentos = $grupo['count'] * 10;

            while ($i < $grupo['count'] && $intentos < $maxIntentos) {
                $intentos++;

                $createdAt = Carbon::now()->subDays(fake()->numberBetween(1, 365));
                $fechaProgramada = $createdAt->copy()->addDays(fake()->numberBetween(1, 14));
                $anio = $createdAt->year;

                $clienteId = fake()->randomElement($clientes);

                // Solo vehículos del cliente
                $vehiculosCliente = Vehiculo::where('user_id', $clienteId)->pluck('id')->toArray();

                if (empty($vehiculosCliente)) continue;

                // Filtrar vehículos ya usados en ese año
                $vehiculosDisponibles = array_values(array_filter(
                    $vehiculosCliente,
                    fn($vId) => !in_array("{$vId}_{$anio}", $vehiculosUsados)
                ));

                if (empty($vehiculosDisponibles)) continue;

                $vehiculoId = fake()->randomElement($vehiculosDisponibles);
                $vehiculosUsados[] = "{$vehiculoId}_{$anio}";

                $empleadoId = $necesitaEmpleado && !empty($empleados)
                    ? fake()->randomElement($empleados)
                    : null;

                $resolucionSlug = $grupo['slug'] === EstadoSlug::FINALIZADO->value
                    ? fake()->randomElement([ResolucionSlug::FAVORABLE->value, ResolucionSlug::DESFAVORABLE->value])
                    : ResolucionSlug::PENDIENTE->value;
                $resolucionId = $resoluciones[$resolucionSlug]->id;

                $horaRecogida = in_array($grupo['slug'], [
                    EstadoSlug::EN_RECOGIDA->value,
                    EstadoSlug::EN_ITV->value,
                    EstadoSlug::RETORNANDO->value,
                    EstadoSlug::FINALIZADO->value,
                ]) ? $fechaProgramada->copy()->setTime(fake()->numberBetween(8, 11), 0) : null;

                $horaItv = in_array($grupo['slug'], [
                    EstadoSlug::EN_ITV->value,
                    EstadoSlug::RETORNANDO->value,
                    EstadoSlug::FINALIZADO->value,
                ]) ? $fechaProgramada->copy()->setTime(fake()->numberBetween(10, 13), 0) : null;

                $horaEntrega = $grupo['slug'] === EstadoSlug::FINALIZADO->value
                    ? $fechaProgramada->copy()->setTime(fake()->numberBetween(14, 18), 0)
                    : null;

                $importeCobro = $necesitaEmpleado ? fake()->randomFloat(2, 45, 250) : null;

                $solicitudId = DB::table('solicitudes')->insertGetId([
                    'user_cliente_id'  => $clienteId,
                    'vehiculo_id'      => $vehiculoId,
                    'user_empleado_id' => $empleadoId,
                    'direccion'        => fake()->address(),
                    'estado_id'        => $estadoId,
                    'resolucion_id'    => $resolucionId,
                    'importe_cobro'    => $importeCobro,
                    'fecha_programada' => $fechaProgramada->toDateString(),
                    'hora_recogida'    => $horaRecogida,
                    'hora_itv'         => $horaItv,
                    'hora_entrega'     => $horaEntrega,
                    'notas'            => fake()->optional(0.4)->sentence(),
                    'pago_id'          => null,
                    'created_at'       => $createdAt,
                    'updated_at'       => $createdAt,
                ]);

                if ($grupo['pago']) {
                    $metodoId = fake()->randomElement(MetodoPago::pluck('id')->toArray());
                    // Si el estado es finalizado y el método es transferencia, el pago nace pendiente
                    $esTransferencia = MetodoPago::find($metodoId)->slug === 'transferencia';
                    $estadoPagoId = $esTransferencia ? $estadosPendientes : $estadosPagados;

                    $pagoId = DB::table('pagos')->insertGetId([
                        'solicitud_id'   => $solicitudId,
                        'importe'        => $importeCobro ?? fake()->randomFloat(2, 50, 300),
                        'metodo_pago_id' => $metodoId,
                        'estado_pago_id' => $estadoPagoId,
                        'created_at'     => $horaEntrega ?? $createdAt,
                        'updated_at'     => $horaEntrega ?? $createdAt,
                    ]);

                    DB::table('solicitudes')->where('id', $solicitudId)->update(['pago_id' => $pagoId]);
                }

                if ($grupo['historial']) {
                    DB::table('historiales')->insert([
                        'solicitud_id'  => $solicitudId,
                        'fecha_itv'     => $horaItv ? $horaItv->toDateString() : $fechaProgramada->toDateString(),
                        'resolucion_id' => $resolucionId,
                        'notas'         => fake()->optional(0.3)->sentence(),
                        'created_at'    => $horaEntrega ?? $createdAt,
                        'updated_at'    => $horaEntrega ?? $createdAt,
                    ]);
                }

                $i++;
            }

            if ($intentos >= $maxIntentos) {
                $this->command->warn("No se pudieron crear todas las solicitudes para {$grupo['slug']}.");
            }
        }
    }
}