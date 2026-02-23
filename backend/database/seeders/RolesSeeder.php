<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Rol;

class RolesSeeder extends Seeder
{
    public function run()
    {
        Rol::firstOrCreate(['slug' => 'administrador', 'nombre' => 'Administrador']);
        Rol::firstOrCreate(['slug' => 'empleado', 'nombre' => 'Empleado']);
        Rol::firstOrCreate(['slug' => 'cliente', 'nombre' => 'Cliente']);
    }
}
