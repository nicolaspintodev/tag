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
        Schema::table('viajes', function (Blueprint $table) {
            // Cambiar enum estado a nuevos valores
            $table->dropColumn('estado');
            $table->enum('estado', ['planificado', 'iniciado', 'terminado'])
                  ->default('planificado')
                  ->after('proveedor_id');
            
            // Flags facturado y liquidado (solo aplicables si estado = terminado)
            $table->boolean('facturado')->default(false)->after('estado');
            $table->boolean('liquidado')->default(false)->after('facturado');
            
            // Índices para filtros
            $table->index(['estado', 'facturado', 'liquidado']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('viajes', function (Blueprint $table) {
            $table->dropColumn(['facturado', 'liquidado']);
            $table->dropColumn('estado');
            $table->enum('estado', ['pendiente', 'en_curso', 'finalizado', 'liquidado', 'cancelado'])
                  ->default('pendiente')
                  ->after('proveedor_id');
        });
    }
};
