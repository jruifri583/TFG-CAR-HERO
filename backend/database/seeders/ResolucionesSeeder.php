<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Resolucion;

class ResolucionesSeeder extends Seeder
{
    public function run()
    {
        Resolucion::firstOrCreate(['slug' => 'pendiente', 'nombre' => 'pendiente']);
        Resolucion::firstOrCreate(['slug' => 'favorable', 'nombre' => 'favorable']);
        Resolucion::firstOrCreate(['slug' => 'desfavorable', 'nombre' => 'desfavorable']);
    }
}
