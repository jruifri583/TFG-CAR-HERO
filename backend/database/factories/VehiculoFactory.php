<?php

namespace Database\Factories;
use App\Models\User;
use App\Enums\RolSlug;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Vehiculo>
 */
class VehiculoFactory extends Factory
{
    // Definición del modelo por defecto
    public function definition(): array
    {
        static $clienteId = null;

        $clienteId = User::whereHas('rol', function ($q) {
        $q->where('slug', RolSlug::CLIENTE->value);
    })
    ->inRandomOrder()
    ->value('id');

        return [
            'user_id'    => $clienteId,
            'matricula'  => fake()->unique()->bothify('####-???'),
            'vin'        => fake()->unique()->regexify('[A-HJ-NPR-Z0-9]{17}'),
            'marca'      => fake()->randomElement(['Toyota', 'Seat', 'BMW', 'Ford', 'Audi', 'BYD', 'VW', 'Mercedes', 'Renault']),
            'modelo'     => fake()->word(),
            'año' => fake()->year(),
            'kilometros' => fake()->numberBetween(1000, 200000),
            'fecha_ultima_itv' => fake()->randomElement([
                fake()->dateTimeBetween('-10 months', 'now'),       // ITV reciente (sin alerta)
                fake()->dateTimeBetween('-13 months', '-11 months'), // ITV próxima (alerta)
                fake()->dateTimeBetween('-36 months', '-13 months'), // ITV caducada (alerta)
            ])->format('Y-m-d'),
        ];
    }
}