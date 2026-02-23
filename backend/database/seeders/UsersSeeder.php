<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Rol;
use App\Enums\RolSlug;
use Faker\Factory as Faker;

class UsersSeeder extends Seeder
{
    public function run()
    {
        $faker = Faker::create('es_ES');

        $administradorRol = Rol::where('slug', RolSlug::ADMINISTRADOR)->first();
        User::firstOrCreate(
            ['email' => 'admin@gmail.com'],
            [
                'nombre' => $faker->firstName(),
                'apellidos' => $faker->lastName(),
                'password' => Hash::make('admin'),
                'rol_id' => $administradorRol->id,
                'activo' => true,
            ]
        );
        $empleadoRol = Rol::where('slug', RolSlug::EMPLEADO)->first();
        User::firstOrCreate(
            ['email' => 'empleado@gmail.com'],
            [
                'nombre' => $faker->firstName(),
                'apellidos' => $faker->lastName(),
                'password' => Hash::make('empleado'),
                'rol_id' => $empleadoRol->id,
                'activo' => true,
            ]
        );
        $clienteRol = Rol::where('slug', RolSlug::CLIENTE)->first();
        User::firstOrCreate(
            ['email' => 'cliente@gmail.com'],
            [
                'nombre' => $faker->firstName(),
                'apellidos' => $faker->lastName(),
                'password' => Hash::make('cliente'),
                'rol_id' => $clienteRol->id,
                'activo' => true,
            ]
        );

        User::factory()
            ->count(20)
            ->create([
                'activo' => true,
            ]);
    }
}
