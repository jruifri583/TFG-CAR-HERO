<?php

namespace Database\Factories;

use App\Models\Solicitud;
use App\Models\User;
use App\Models\Vehiculo;
use App\Enums\EstadoSlug;
use App\Models\Estado;
use App\Models\Resolucion;
use App\Enums\ResolucionSlug;
use Illuminate\Database\Eloquent\Factories\Factory;

class SolicitudFactory extends Factory
{
    protected $model = Solicitud::class;

    public function definition(): array
    {
        return [
            'user_cliente_id' => User::inRandomOrder()->first()->id,
            'vehiculo_id' => Vehiculo::inRandomOrder()->first()->id,
            'user_empleado_id' => null, 
            'direccion' => fake()->address(),
            'estado_id' => Estado::where('slug', EstadoSlug::PENDIENTE->value)->first()->id,     
            'resolucion_id' => Resolucion::where('slug', ResolucionSlug::PENDIENTE->value)->first()->id, 
            'fecha_programada' => fake()->dateTimeBetween('now', '+2 weeks'),
            'hora_recogida' => null,
            'hora_itv' => null,
            'hora_entrega' => null,
            'notas' => fake()->optional()->sentence(),
            'pago_id' => null,
        ];
    }
}