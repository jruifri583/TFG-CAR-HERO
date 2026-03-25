<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $existingIndexes = collect(DB::select('SHOW INDEX FROM solicitudes'))
            ->pluck('Key_name');

        if (!$existingIndexes->contains('solicitudes_created_at_index')) {
            DB::statement('ALTER TABLE solicitudes ADD INDEX solicitudes_created_at_index (created_at)');
        }

        if (!$existingIndexes->contains('solicitudes_fecha_programada_index')) {
            DB::statement('ALTER TABLE solicitudes ADD INDEX solicitudes_fecha_programada_index (fecha_programada)');
        }
    }

    public function down(): void
    {
        $existingIndexes = collect(DB::select('SHOW INDEX FROM solicitudes'))
            ->pluck('Key_name');

        if ($existingIndexes->contains('solicitudes_created_at_index')) {
            DB::statement('ALTER TABLE solicitudes DROP INDEX solicitudes_created_at_index');
        }

        if ($existingIndexes->contains('solicitudes_fecha_programada_index')) {
            DB::statement('ALTER TABLE solicitudes DROP INDEX solicitudes_fecha_programada_index');
        }
    }
};
