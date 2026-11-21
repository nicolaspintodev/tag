<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add chofer_id to liquidaciones
        Schema::table('liquidaciones', function (Blueprint $table) {
            $table->foreignId('chofer_id')->nullable()->constrained('choferes')->after('proveedor_id');
            $table->index(['tipo', 'chofer_id', 'estado']);
        });

        // Add per-concept liquidado flags to viajes
        Schema::table('viajes', function (Blueprint $table) {
            $table->boolean('liquidado_cliente')->default(false)->after('liquidado');
            $table->boolean('liquidado_proveedor')->default(false)->after('liquidado_cliente');
            $table->boolean('liquidado_chofer')->default(false)->after('liquidado_proveedor');
        });

        // Backfill flags from liquidacion_viaje pivot
        $this->backfillFlags();
    }

    public function down(): void
    {
        Schema::table('liquidaciones', function (Blueprint $table) {
            $table->dropIndex(['tipo', 'chofer_id', 'estado']);
            $table->dropForeign(['chofer_id']);
            $table->dropColumn('chofer_id');
        });

        Schema::table('viajes', function (Blueprint $table) {
            $table->dropColumn(['liquidado_cliente', 'liquidado_proveedor', 'liquidado_chofer']);
        });
    }

    private function backfillFlags(): void
    {
        // Backfill using raw SQL (Eloquent not available in migrations)
        $rows = DB::select('
                SELECT v.id, l.tipo
                FROM viajes v
                JOIN liquidacion_viaje lv ON lv.viaje_id = v.id
                JOIN liquidaciones l ON l.id = lv.liquidacion_id
            ');

        foreach ($rows as $row) {
            $updates = [];
            if ($row->tipo === 'cliente') {
                $updates['liquidado_cliente'] = 1;
            }
            if ($row->tipo === 'proveedor') {
                $updates['liquidado_proveedor'] = 1;
            }
            if ($row->tipo === 'chofer') {
                $updates['liquidado_chofer'] = 1;
            }
            if (! empty($updates)) {
                DB::table('viajes')->where('id', $row->id)->update($updates);
            }
        }

        // Also set aggregate liquidado as OR of the three flags (for legacy UI)
        DB::statement('UPDATE viajes SET liquidado = (liquidado_cliente OR liquidado_proveedor OR liquidado_chofer)');
    }
};
