<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('choferes', function (Blueprint $table) {
            $table->string('cuil')->unique()->nullable()->after('dni');
            $table->dropColumn('linti_vencimiento');
        });
    }

    public function down(): void
    {
        Schema::table('choferes', function (Blueprint $table) {
            $table->dropColumn('cuil');
            $table->date('linti_vencimiento')->nullable()->after('licencia_vencimiento');
        });
    }
};
