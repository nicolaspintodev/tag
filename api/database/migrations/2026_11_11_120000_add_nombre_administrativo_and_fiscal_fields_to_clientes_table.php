<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('clientes', function (Blueprint $table) {
            $table->string('nombre_administrativo')->nullable()->after('razon_social');
            $table->string('condicion_iva')->nullable()->after('email');
            $table->string('ingresos_brutos')->nullable()->after('condicion_iva');
            $table->string('localidad')->nullable()->after('ingresos_brutos');
            $table->string('provincia')->nullable()->after('localidad');
            $table->string('codigo_postal')->nullable()->after('provincia');
        });
    }

    public function down(): void
    {
        Schema::table('clientes', function (Blueprint $table) {
            $table->dropColumn([
                'nombre_administrativo',
                'condicion_iva',
                'ingresos_brutos',
                'localidad',
                'provincia',
                'codigo_postal',
            ]);
        });
    }
};
