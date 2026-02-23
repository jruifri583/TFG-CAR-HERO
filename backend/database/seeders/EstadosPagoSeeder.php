<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\EstadoPago;

class EstadosPagoSeeder extends Seeder
{
    public function run()
    {
        EstadoPago::firstOrCreate(['slug' => 'pendiente', 'nombre' => 'Pendiente']);
        EstadoPago::firstOrCreate(['slug' => 'pagado', 'nombre' => 'Pagado']);
        EstadoPago::firstOrCreate(['slug' => 'rechazado', 'nombre' => 'Rechazado']);
    }
}
