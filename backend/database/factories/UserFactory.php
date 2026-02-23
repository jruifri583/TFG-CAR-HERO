<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\User;
use App\Models\Rol;
use App\Enums\RolSlug;

class UserFactory extends Factory
{
    protected $model = User::class;

    public function definition(): array
    {
        return [
            'nombre' => $this->faker->firstName(),
            'apellidos' => $this->faker->lastName(),
            'email' => $this->faker->unique()->safeEmail(),
            'direccion' => $this->faker->address(),
            'telefono' => $this->faker->phoneNumber(),
            'nif' => strtoupper($this->faker->bothify('########?')),
            'password' => bcrypt('password'), 
            'rol_id' => Rol::where('slug', RolSlug::CLIENTE->value)->first()->id, 
            'activo' => true,
        ];
    }
}
