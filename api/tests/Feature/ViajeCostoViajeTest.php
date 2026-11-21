<?php

namespace Tests\Feature;

use App\Models\Chofer;
use App\Models\Cliente;
use App\Models\Unidad;
use App\Models\Viaje;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ViajeCostoViajeTest extends TestCase
{
    use RefreshDatabase;

    private function crearViaje(array $overrides = []): Viaje
    {
        $chofer = Chofer::create([
            'nombre' => 'Juan',
            'apellido' => 'Garcia',
            'dni' => '30.111.111',
        ]);

        $cliente = Cliente::create([
            'razon_social' => 'Cliente Test',
            'cuit' => '30-11111111-1',
        ]);

        $tractora = Unidad::create([
            'marca' => 'Scania',
            'modelo' => 'R450',
            'patente' => 'TRA-001',
            'anio' => 2023,
            'tipo' => 'tractora',
        ]);

        return Viaje::create(array_merge([
            'chofer_id' => $chofer->id,
            'cliente_id' => $cliente->id,
            'tractora_id' => $tractora->id,
            'origen' => 'CABA',
            'destino' => 'Rosario',
            'fecha_salida' => '2026-07-15',
            'precio_pactado' => 780000,
            'costo_proveedor' => 80000,
            'estado' => 'planificado',
        ], $overrides));
    }

    public function test_crear_viaje_calcula_costo_viaje_desde_costo_proveedor(): void
    {
        $viaje = $this->crearViaje(['costo_proveedor' => 80000]);

        $this->assertEquals(80000, (float) $viaje->fresh()->costo_viaje);
    }

    public function test_actualizar_costo_proveedor_recalcula_costo_viaje(): void
    {
        $viaje = $this->crearViaje(['costo_proveedor' => 80000]);

        $viaje->update(['costo_proveedor' => 95000]);

        $this->assertEquals(95000, (float) $viaje->fresh()->costo_viaje);
    }
}
