<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Solicitud;

class SolicitudesSeeder extends Seeder
{
    public function run()
    {
        Solicitud::factory()->count(4)->create();
    }
}