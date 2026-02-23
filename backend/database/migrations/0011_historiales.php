<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('historiales', function (Blueprint $table) {
            $table->id();
            $table->foreignId('solicitud_id')
                ->unique()
                ->constrained('solicitudes')
                ->onDelete('cascade');
            $table->date('fecha_itv');
            $table->foreignId('resolucion_id')->constrained('resoluciones');
            $table->text('notas')->nullable();
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('historiales');
    }
};
