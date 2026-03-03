<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Pago;
use App\Models\Solicitud;

class PagosSeeder extends Seeder
{
    public function run()
    {
        Solicitud::inRandomOrder()
            ->limit(10)
            ->get()
            ->each(function ($solicitud) {
                Pago::factory()->create([
                    'solicitud_id' => $solicitud->id,
                ]);
            });
    }
}