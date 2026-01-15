<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('solicitudes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cliente_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('vehiculo_id')->constrained('vehiculos')->cascadeOnDelete();
            $table->foreignId('empleado_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('direccion_recogida');
            $table->decimal('latitud', 10, 7)->nullable();
            $table->decimal('longitud', 10, 7)->nullable();
            $table->enum('estado_servicio', ['pendiente', 'asignado', 'en_recogida', 'en_itv', 'retornando', 'finalizado'])->default('pendiente');
            $table->enum('resolucion_itv', ['pendiente', 'favorable', 'desfavorable'])->default('pendiente');
            $table->dateTime('fecha_programada')->nullable();
            $table->dateTime('hora_recogida')->nullable();
            $table->dateTime('hora_itv')->nullable();
            $table->dateTime('hora_entrega')->nullable();
            $table->decimal('precio', 10, 2)->nullable();
            $table->text('notas')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('solicitudes');
    }
};
