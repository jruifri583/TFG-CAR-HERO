<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('solicitudes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_cliente_id')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('vehiculo_id')->constrained('vehiculos')->onDelete('cascade');
            $table->foreignId('user_empleado_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('direccion', 255);
            $table->decimal('latitud', 10, 7)->nullable();
            $table->decimal('longitud', 10, 7)->nullable();
            $table->foreignId('estado_id')->constrained('estados');
            $table->foreignId('resolucion_id')->nullable()->constrained('resoluciones')->onDelete('set null');
            $table->date('fecha_programada')->nullable()->index();
            $table->dateTime('hora_recogida')->nullable();
            $table->dateTime('hora_itv')->nullable();
            $table->dateTime('hora_entrega')->nullable();
            $table->unsignedBigInteger('pago_id')->nullable();
            $table->text('notas')->nullable();
            $table->timestamps();

            // Índices para campos de ordenación frecuente
            $table->index('created_at');
        });
    }
    public function down(): void { Schema::dropIfExists('solicitudes'); }
};