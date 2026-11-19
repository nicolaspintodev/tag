<?php

namespace Tests\Feature;

use App\Models\Cliente;
use App\Models\Liquidacion;
use App\Models\Proveedor;
use App\Models\Viaje;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LiquidacionWizardTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->actingAsUser();

        $this->cliente = Cliente::create([
            'razon_social' => 'Cliente Test',
            'cuit' => '30-11111111-1',
        ]);
        $this->proveedor = Proveedor::create([
            'razon_social' => 'Proveedor Test',
            'cuit' => '30-22222222-2',
        ]);
    }

    /** @test */
    public function test_disponibles_para_liquidacion_filtra_por_cliente_y_estado(): void
    {
        // Viaje disponible: terminado, no liquidado, del cliente
        $viajeOk = Viaje::create([
            'cliente_id' => $this->cliente->id,
            'estado' => 'terminado',
            'liquidado' => false,
            'precio_pactado' => 100000,
            'origen' => 'CABA',
            'destino' => 'Rosario',
            'fecha_salida' => '2026-07-15',
        ]);

        // Viaje NO disponible: liquidado=true
        Viaje::create([
            'cliente_id' => $this->cliente->id,
            'estado' => 'terminado',
            'liquidado' => true,
            'precio_pactado' => 50000,
            'origen' => 'CABA',
            'destino' => 'Rosario',
            'fecha_salida' => '2026-07-15',
        ]);

        // Viaje NO disponible: en otra liquidación mismo tipo
        $liqExistente = Liquidacion::create(['tipo' => 'cliente', 'cliente_id' => $this->cliente->id, 'estado' => 'borrador', 'fecha_emision' => now()->toDateString(), 'numero' => 'LIQ-C-0001']);
        $viajeEnOtraLiq = Viaje::create(['cliente_id' => $this->cliente->id, 'estado' => 'terminado', 'liquidado' => false, 'precio_pactado' => 75000, 'origen' => 'CABA', 'destino' => 'Rosario', 'fecha_salida' => '2026-07-15']);
        $liqExistente->viajes()->attach($viajeEnOtraLiq->id, ['monto' => 50000]);

        // Viaje NO disponible: estado planificado (no terminado)
        Viaje::create([
            'cliente_id' => $this->cliente->id,
            'estado' => 'planificado',
            'liquidado' => false,
            'precio_pactado' => 60000,
            'origen' => 'CABA',
            'destino' => 'Rosario',
            'fecha_salida' => '2026-07-15',
        ]);

        $response = $this->getJson('/api/viajes/disponibles-para-liquidacion?tipo=cliente&cliente_id=' . $this->cliente->id);

        $response->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.id', $viajeOk->id);
    }

    /** @test */
    public function test_disponibles_para_liquidacion_tipo_proveedor(): void
    {
        $viajeOk = Viaje::create([
            'proveedor_id' => $this->proveedor->id,
            'estado' => 'terminado',
            'liquidado' => false,
            'costo_proveedor' => 80000,
            'origen' => 'CABA',
            'destino' => 'Rosario',
            'fecha_salida' => '2026-07-15',
        ]);

        Viaje::create([
            'proveedor_id' => $this->proveedor->id,
            'estado' => 'terminado',
            'liquidado' => true,
            'costo_proveedor' => 50000,
            'origen' => 'CABA',
            'destino' => 'Rosario',
            'fecha_salida' => '2026-07-15',
        ]);

        $response = $this->getJson('/api/viajes/disponibles-para-liquidacion?tipo=proveedor&proveedor_id=' . $this->proveedor->id);

        $response->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.id', $viajeOk->id);
    }

    /** @test */
    public function test_disponibles_para_liquidacion_ordenar_precio_asc(): void
    {
        Viaje::create([
            'cliente_id' => $this->cliente->id,
            'estado' => 'terminado',
            'liquidado' => false,
            'precio_pactado' => 200000,
            'origen' => 'CABA',
            'destino' => 'Rosario',
            'fecha_salida' => '2026-07-15',
        ]);
        $viajeBarato = Viaje::create([
            'cliente_id' => $this->cliente->id,
            'estado' => 'terminado',
            'liquidado' => false,
            'precio_pactado' => 50000,
            'origen' => 'CABA',
            'destino' => 'Rosario',
            'fecha_salida' => '2026-07-15',
        ]);

        $response = $this->getJson('/api/viajes/disponibles-para-liquidacion?tipo=cliente&cliente_id=' . $this->cliente->id . '&ordenar_precio=asc');

        $response->assertOk()
            ->assertJsonPath('0.id', $viajeBarato->id);
    }

    /** @test */
    public function test_disponibles_para_liquidacion_filtro_fechas(): void
    {
        $viajeEnRango = Viaje::create([
            'cliente_id' => $this->cliente->id,
            'estado' => 'terminado',
            'liquidado' => false,
            'precio_pactado' => 100000,
            'origen' => 'CABA',
            'destino' => 'Rosario',
            'fecha_salida' => '2026-07-15',
        ]);
        Viaje::create([
            'cliente_id' => $this->cliente->id,
            'estado' => 'terminado',
            'liquidado' => false,
            'precio_pactado' => 50000,
            'origen' => 'CABA',
            'destino' => 'Rosario',
            'fecha_salida' => '2026-06-01',
        ]);

        $response = $this->getJson('/api/viajes/disponibles-para-liquidacion?tipo=cliente&cliente_id=' . $this->cliente->id . '&fecha_desde=2026-07-01&fecha_hasta=2026-07-31');

        $response->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.id', $viajeEnRango->id);
    }

    /** @test */
    public function test_store_liquidacion_con_iva_monto(): void
    {
        $cliente = Cliente::create([
            'razon_social' => 'Cliente Test 2',
            'cuit' => '30-33333333-3',
        ]);
        $viaje1 = Viaje::create([
            'cliente_id' => $cliente->id,
            'estado' => 'terminado',
            'liquidado' => false,
            'precio_pactado' => 100000,
            'origen' => 'CABA',
            'destino' => 'Rosario',
            'fecha_salida' => '2026-07-15',
        ]);
        $viaje2 = Viaje::create([
            'cliente_id' => $cliente->id,
            'estado' => 'terminado',
            'liquidado' => false,
            'precio_pactado' => 200000,
            'origen' => 'CABA',
            'destino' => 'Rosario',
            'fecha_salida' => '2026-07-15',
        ]);

        $response = $this->postJson('/api/liquidaciones', [
            'tipo' => 'cliente',
            'cliente_id' => $cliente->id,
            'fecha_emision' => now()->toDateString(),
            'estado' => 'borrador',
            'viajes' => [
                ['viaje_id' => $viaje1->id, 'monto' => 100000, 'iva_monto' => 21000],
                ['viaje_id' => $viaje2->id, 'monto' => 200000, 'iva_monto' => 42000],
            ],
        ]);

        $response->assertCreated()
            ->assertJsonPath('estado', 'borrador')
            ->assertJsonPath('total', '300000.00');

        $this->assertDatabaseHas('liquidacion_viaje', [
            'liquidacion_id' => $response->json('id'),
            'viaje_id' => $viaje1->id,
            'monto' => 100000,
            'iva_monto' => 21000,
        ]);
    }

    /** @test */
    public function test_store_liquidacion_pendiente_marca_viajes_liquidados(): void
    {
        $cliente = Cliente::create([
            'razon_social' => 'Cliente Test 3',
            'cuit' => '30-44444444-4',
        ]);
        $viaje = Viaje::create([
            'cliente_id' => $cliente->id,
            'estado' => 'terminado',
            'liquidado' => false,
            'precio_pactado' => 100000,
            'origen' => 'CABA',
            'destino' => 'Rosario',
            'fecha_salida' => '2026-07-15',
        ]);

        $this->postJson('/api/liquidaciones', [
            'tipo' => 'cliente',
            'cliente_id' => $cliente->id,
            'fecha_emision' => now()->toDateString(),
            'estado' => 'pendiente',
            'viajes' => [['viaje_id' => $viaje->id, 'monto' => 100000, 'iva_monto' => 21000]],
        ]);

        $this->assertDatabaseHas('viajes', ['id' => $viaje->id, 'liquidado' => true]);
    }
}