<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('liquidacion_viaje', function (Blueprint $table) {
            $table->decimal('iva_monto', 15, 2)->default(0)->after('monto');
        });
    }

    public function down(): void
    {
        Schema::table('liquidacion_viaje', function (Blueprint $table) {
            $table->dropColumn('iva_monto');
        });
    }
};