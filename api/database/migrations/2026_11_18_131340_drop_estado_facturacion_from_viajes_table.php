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
            $table->dropIndex('viajes_estado_facturacion_index');
            $table->dropColumn('estado_facturacion');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('viajes', function (Blueprint $table) {
            $table->string('estado_facturacion')->default('pendiente')->after('liquidado');
            $table->index('estado_facturacion');
        });
    }
};
