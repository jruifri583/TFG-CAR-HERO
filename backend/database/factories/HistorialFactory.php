<?php

namespace Database\Factories;

use App\Models\Historial;
use App\Models\Solicitud;
use App\Models\Resolucion;
use App\Enums\ResolucionSlug;
use Illuminate\Database\Eloquent\Factories\Factory;

class HistorialFactory extends Factory
{
    protected $model = Historial::class;

    public function definition(): array
    {
        return [
            'solicitud_id' => Solicitud::inRandomOrder()->first()->id,
            'fecha_itv' => fake()->date(),
            'resolucion_id' => Resolucion::where('slug', ResolucionSlug::FAVORABLE->value)->first()->id,
            'notas' => fake()->optional()->sentence(),
        ];
    }
}