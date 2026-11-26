<?php

namespace Tests\Feature;

use App\Models\Chofer;
use App\Models\Cliente;
use App\Models\Factura;
use App\Models\Liquidacion;
use App\Models\Viaje;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ViajeProcesosDocumentosTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->actingAsUser();
    }

    public function test_index_y_show_incluyen_factura_de_la_liquidacion(): void
    {
        $cliente = Cliente::create([
            'razon_social' => 'Cliente Procesos',
            'cuit' => '30-11111111-1',
        ]);
        $chofer = Chofer::create([
            'nombre' => 'Ana',
            'apellido' => 'Perez',
            'dni' => '30.111.111',
        ]);
        $viaje = Viaje::create([
            'chofer_id' => $chofer->id,
            'cliente_id' => $cliente->id,
            'origen' => 'CABA',
            'destino' => 'Rosario',
            'fecha_salida' => '2026-11-26',
            'precio_pactado' => 1000,
            'estado' => 'terminado',
        ]);
        $liquidacion = Liquidacion::create([
            'numero' => 'LIQ-PROC-0001',
            'tipo' => 'cliente',
            'cliente_id' => $cliente->id,
            'fecha_emision' => '2026-11-26',
            'total' => 1210,
            'estado' => 'facturada',
        ]);
        $liquidacion->viajes()->attach($viaje->id, [
            'monto' => 1000,
            'iva_monto' => 210,
        ]);
        Factura::create([
            'liquidacion_id' => $liquidacion->id,
            'numero' => 'FACT-PROC-0001',
            'fecha_emision' => '2026-11-26',
            'monto_neto' => 1000,
            'iva' => 210,
            'monto_total' => 1210,
        ]);

        $this->getJson('/api/viajes')
            ->assertOk()
            ->assertJsonPath('0.liquidaciones.0.factura.numero', 'FACT-PROC-0001');

        $this->getJson("/api/viajes/{$viaje->id}")
            ->assertOk()
            ->assertJsonPath('liquidaciones.0.factura.numero', 'FACT-PROC-0001');
    }
}
