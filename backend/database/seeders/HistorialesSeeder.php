<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Historial;
use App\Models\Solicitud;

class HistorialesSeeder extends Seeder
{
    public function run()
    {
        Solicitud::inRandomOrder()
            ->limit(10)
            ->get()
            ->each(function ($solicitud) {
                Historial::factory()->create([
                    'solicitud_id' => $solicitud->id,
                ]);
            });
    }
}