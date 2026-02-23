<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\MetodoPago;

class MetodosPagoSeeder extends Seeder
{
    public function run()
    {
        MetodoPago::firstOrCreate(['slug' => 'efectivo', 'nombre' => 'Efectivo']);
        MetodoPago::firstOrCreate(['slug' => 'tarjeta', 'nombre' => 'Tarjeta']);
        MetodoPago::firstOrCreate(['slug' => 'transferencia', 'nombre' => 'Transferencia']);
    }
}
