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
            $table->foreignId('tractora_id')->nullable()->constrained('unidades')->after('proveedor_id');
            $table->foreignId('acoplado_id')->nullable()->constrained('unidades')->after('tractora_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('viajes', function (Blueprint $table) {
            $table->dropForeign(['tractora_id']);
            $table->dropForeign(['acoplado_id']);
            $table->dropColumn(['tractora_id', 'acoplado_id']);
        });
    }
};
