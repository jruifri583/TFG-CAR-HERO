<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('mensajes_contacto', function (Blueprint $table) {
            $table->text('respuesta')->nullable()->after('mensaje');
            $table->timestamp('respondido_at')->nullable()->after('leido_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('mensajes_contacto', function (Blueprint $table) {
            $table->dropColumn(['respuesta', 'respondido_at']);
        });
    }
};
