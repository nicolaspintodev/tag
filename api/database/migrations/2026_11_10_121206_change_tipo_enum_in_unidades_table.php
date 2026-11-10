<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // SQLite no soporta enum nativo, usar check constraint
        // Para MySQL/PostgreSQL se podría usar enum nativo

        // 1. Agregar columna temporal con check constraint
        Schema::table('unidades', function (Blueprint $table) {
            $table->string('tipo_enum')->nullable()->after('modelo');
        });

        // 2. Migrar datos existentes
        DB::statement("
            UPDATE unidades 
            SET tipo_enum = CASE 
                WHEN LOWER(tipo) IN ('camión', 'camion', 'tractora', 'tractor') THEN 'tractora'
                WHEN LOWER(tipo) IN ('acoplado', 'acoplado') THEN 'acoplado'
                WHEN LOWER(tipo) IN ('semi', 'semirremolque', 'semi-remolque') THEN 'semirremolque'
                ELSE 'tractora'
            END
        ");

        // 3. Agregar check constraint y default
        Schema::table('unidades', function (Blueprint $table) {
            $table->string('tipo_enum')->default('tractora')->change();
        });

        // SQLite: check constraint via raw SQL
        DB::statement("
            ALTER TABLE unidades ADD CONSTRAINT check_tipo_enum 
            CHECK (tipo_enum IN ('tractora', 'acoplado', 'semirremolque'))
        ");

        // 4. Drop columna vieja y rename nueva
        Schema::table('unidades', function (Blueprint $table) {
            $table->dropColumn('tipo');
            $table->renameColumn('tipo_enum', 'tipo');
        });
    }

    public function down(): void
    {
        Schema::table('unidades', function (Blueprint $table) {
            $table->string('tipo_enum')->nullable()->after('modelo');
        });

        DB::statement("
            UPDATE unidades 
            SET tipo_enum = CASE 
                WHEN tipo = 'tractora' THEN 'Camión'
                WHEN tipo = 'acoplado' THEN 'Acoplado'
                WHEN tipo = 'semirremolque' THEN 'Semi'
                ELSE 'Camión'
            END
        ");

        Schema::table('unidades', function (Blueprint $table) {
            $table->dropColumn('tipo');
            $table->renameColumn('tipo_enum', 'tipo');
        });
    }
};
