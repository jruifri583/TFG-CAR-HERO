<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Historial;

class HistorialesSeeder extends Seeder
{
    public function run()
    {
        Historial::factory()->count(1)->create();
    }
}