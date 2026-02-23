<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('pagos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('solicitud_id')->constrained('solicitudes')->onDelete('cascade');
            $table->decimal('importe', 10, 2);
            $table->foreignId('metodo_pago_id')->nullable()->constrained('metodos_pago');
            $table->foreignId('estado_pago_id')->default(1)->constrained('estados_pago');
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('pagos'); }
};