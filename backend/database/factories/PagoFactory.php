<?php

namespace Database\Factories;
use App\Enums\EstadoPagoSlug;
use App\Enums\MetodoPagoSlug;
use App\Models\EstadoPago;
use App\Models\MetodoPago;
use App\Models\Pago;
use App\Models\Solicitud;
use Illuminate\Database\Eloquent\Factories\Factory;

class PagoFactory extends Factory
{
    protected $model = Pago::class;

    public function definition(): array
    {
        return [
            'solicitud_id' => Solicitud::inRandomOrder()->first()->id,
            'importe' => fake()->randomFloat(2, 40, 120),
            'metodo_pago_id' => MetodoPago::where('slug', MetodoPagoSlug::EFECTIVO->value)->first()->id,
            'estado_pago_id' => EstadoPago::where('slug', EstadoPagoSlug::PAGADO->value)->first()->id,
            'created_at' => fake()->dateTimeThisYear(),
        ];
    }
}