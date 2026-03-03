<?php

namespace Database\Seeders;
use App\Models\Vehiculo;

use Illuminate\Database\Seeder;

class VehiculosSeeder extends Seeder
{
    public function run()
    {
        Vehiculo::factory()->count(50)->create();
    }
}
