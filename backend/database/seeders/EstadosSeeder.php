<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Estado;

class EstadosSeeder extends Seeder
{
    public function run()
    {
        Estado::firstOrCreate(['slug' => 'pendiente', 'nombre' => 'pendiente']);
        Estado::firstOrCreate(['slug' => 'asignado', 'nombre' => 'asignado']);
        Estado::firstOrCreate(['slug' => 'en_recogida', 'nombre' => 'en_recogida']);
        Estado::firstOrCreate(['slug' => 'en_itv', 'nombre' => 'en_itv']);
        Estado::firstOrCreate(['slug' => 'retornando', 'nombre' => 'retornando']);
        Estado::firstOrCreate(['slug' => 'finalizado', 'nombre' => 'finalizado']);
        Estado::firstOrCreate(['slug' => 'cancelado', 'nombre' => 'cancelado']);
    }
}
