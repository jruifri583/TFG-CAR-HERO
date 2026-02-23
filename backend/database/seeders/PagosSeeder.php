<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Pago;

class PagosSeeder extends Seeder
{
    public function run()
    {
        Pago::factory()->count(4)->create();
    }
}