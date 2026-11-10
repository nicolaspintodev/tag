<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // SQLite no soporta ALTER TABLE ADD CONSTRAINT ni enum nativo
        // Usar check constraint en CREATE TABLE (SQLite lo permite)

        // 1. Crear nueva tabla con check constraint incluido
        Schema::create('unidades_new', function (Blueprint $table) {
            $table->id();
            $table->foreignId('proveedor_id')->nullable()->constrained('proveedores');
            $table->string('patente')->unique();
            $table->string('marca')->nullable();
            $table->string('modelo')->nullable();
            $table->integer('anio')->nullable();
            $table->string('tipo')->default('tractora');
            $table->string('numero')->nullable();
            $table->date('vtv_vencimiento')->nullable();
            $table->date('seguro_vencimiento')->nullable();
            $table->boolean('activo')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

        // 2. Agregar check constraint para tipo (SQLite lo permite en CREATE TABLE, pero lo hacemos después con raw SQL)
        // Nota: SQLite requiere que el check constraint se agregue después de crear la tabla
        DB::statement("
            CREATE TABLE unidades_new_check AS 
            SELECT *, 
                CASE 
                    WHEN LOWER(tipo) IN ('camión', 'camion', 'tractora', 'tractor') THEN 'tractora'
                    WHEN LOWER(tipo) IN ('acoplado') THEN 'acoplado'
                    WHEN LOWER(tipo) IN ('semi', 'semirremolque', 'semi-remolque') THEN 'semirremolque'
                    ELSE 'tractora'
                END as tipo_new
            FROM unidades_new
        ");
        
        // Borrar la tabla sin constraint y recrear con constraint
        Schema::drop('unidades_new');
        
        Schema::create('unidades_new', function (Blueprint $table) {
            $table->id();
            $table->foreignId('proveedor_id')->nullable()->constrained('proveedores');
            $table->string('patente')->unique();
            $table->string('marca')->nullable();
            $table->string('modelo')->nullable();
            $table->integer('anio')->nullable();
            $table->string('tipo')->default('tractora');
            $table->string('numero')->nullable();
            $table->date('vtv_vencimiento')->nullable();
            $table->date('seguro_vencimiento')->nullable();
            $table->boolean('activo')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

        // 3. Migrar datos con mapeo de tipos
        DB::statement("
            INSERT INTO unidades_new (id, proveedor_id, patente, marca, modelo, anio, tipo, numero, vtv_vencimiento, seguro_vencimiento, activo, created_at, updated_at, deleted_at)
            SELECT 
                id, proveedor_id, patente, marca, modelo, anio,
                CASE 
                    WHEN LOWER(tipo) IN ('camión', 'camion', 'tractora', 'tractor') THEN 'tractora'
                    WHEN LOWER(tipo) IN ('acoplado') THEN 'acoplado'
                    WHEN LOWER(tipo) IN ('semi', 'semirremolque', 'semi-remolque') THEN 'semirremolque'
                    ELSE 'tractora'
                END as tipo,
                numero, vtv_vencimiento, seguro_vencimiento, activo, created_at, updated_at, deleted_at
            FROM unidades
        ");

        // 4. Drop tabla vieja y rename
        Schema::drop('unidades');
        Schema::rename('unidades_new', 'unidades');
    }

    public function down(): void
    {
        // Recrear tabla original
        Schema::create('unidades_old', function (Blueprint $table) {
            $table->id();
            $table->foreignId('proveedor_id')->nullable()->constrained('proveedores');
            $table->string('patente')->unique();
            $table->string('marca')->nullable();
            $table->string('modelo')->nullable();
            $table->integer('anio')->nullable();
            $table->string('tipo')->default('Camión');
            $table->string('numero')->nullable()->unique();
            $table->date('vtv_vencimiento')->nullable();
            $table->date('seguro_vencimiento')->nullable();
            $table->boolean('activo')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

        DB::statement("
            INSERT INTO unidades_old (id, proveedor_id, patente, marca, modelo, anio, tipo, numero, vtv_vencimiento, seguro_vencimiento, activo, created_at, updated_at, deleted_at)
            SELECT 
                id, proveedor_id, patente, marca, modelo, anio,
                CASE 
                    WHEN tipo = 'tractora' THEN 'Camión'
                    WHEN tipo = 'acoplado' THEN 'Acoplado'
                    WHEN tipo = 'semirremolque' THEN 'Semi'
                    ELSE 'Camión'
                END as tipo,
                numero, vtv_vencimiento, seguro_vencimiento, activo, created_at, updated_at, deleted_at
            FROM unidades
        ");

        Schema::drop('unidades');
        Schema::rename('unidades_old', 'unidades');
    }
};
