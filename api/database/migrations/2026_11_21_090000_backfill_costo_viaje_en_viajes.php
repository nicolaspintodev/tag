<?php

use App\Models\Viaje;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        Viaje::where('costo_viaje', 0)
            ->chunkById(200, function ($viajes) {
                foreach ($viajes as $viaje) {
                    $viaje->recalcularCostoViaje();
                }
            });
    }

    public function down(): void {}
};
