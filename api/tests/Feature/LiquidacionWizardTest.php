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
    public function test_disponibles_para_liquidacion_incluye_todos_los_estados_no_liquidados(): void
    {
        // Viaje disponible: terminado, no liquidado, del cliente
        $viajeOk = Viaje::create([
            'cliente_id' => $this->cliente->id,
            'estado' => 'terminado',
            'liquidado_cliente' => false,
            'precio_pactado' => 100000,
            'origen' => 'CABA',
            'destino' => 'Rosario',
            'fecha_salida' => '2026-07-15',
        ]);

        // Viaje NO disponible: liquidado_cliente=true
        Viaje::create([
            'cliente_id' => $this->cliente->id,
            'estado' => 'terminado',
            'liquidado_cliente' => true,
            'precio_pactado' => 50000,
            'origen' => 'CABA',
            'destino' => 'Rosario',
            'fecha_salida' => '2026-07-15',
        ]);

        // Viaje NO disponible: en otra liquidación mismo tipo
        $liqExistente = Liquidacion::create(['tipo' => 'cliente', 'cliente_id' => $this->cliente->id, 'estado' => 'borrador', 'fecha_emision' => now()->toDateString(), 'numero' => 'LIQ-C-0001']);
        $viajeEnOtraLiq = Viaje::create(['cliente_id' => $this->cliente->id, 'estado' => 'terminado', 'liquidado_cliente' => false, 'precio_pactado' => 75000, 'origen' => 'CABA', 'destino' => 'Rosario', 'fecha_salida' => '2026-07-15']);
        $liqExistente->viajes()->attach($viajeEnOtraLiq->id, ['monto' => 50000]);

        // Viaje disponible: planificado, no liquidado (todos los estados se listan)
        $viajePlanificado = Viaje::create([
            'cliente_id' => $this->cliente->id,
            'estado' => 'planificado',
            'liquidado_cliente' => false,
            'precio_pactado' => 60000,
            'origen' => 'CABA',
            'destino' => 'Rosario',
            'fecha_salida' => '2026-07-15',
        ]);

        $response = $this->getJson('/api/viajes/disponibles-para-liquidacion?tipo=cliente&cliente_id='.$this->cliente->id);

        $response->assertOk()
            ->assertJsonCount(2)
            ->assertJsonFragment(['id' => $viajeOk->id])
            ->assertJsonFragment(['id' => $viajePlanificado->id]);
    }

    /** @test */
    public function test_disponibles_para_liquidacion_tipo_proveedor(): void
    {
        $viajeOk = Viaje::create([
            'proveedor_id' => $this->proveedor->id,
            'estado' => 'terminado',
            'liquidado_proveedor' => false,
            'costo_proveedor' => 80000,
            'origen' => 'CABA',
            'destino' => 'Rosario',
            'fecha_salida' => '2026-07-15',
        ]);

        Viaje::create([
            'proveedor_id' => $this->proveedor->id,
            'estado' => 'terminado',
            'liquidado_proveedor' => true,
            'costo_proveedor' => 50000,
            'origen' => 'CABA',
            'destino' => 'Rosario',
            'fecha_salida' => '2026-07-15',
        ]);

        $response = $this->getJson('/api/viajes/disponibles-para-liquidacion?tipo=proveedor&proveedor_id='.$this->proveedor->id);

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

        $response = $this->getJson('/api/viajes/disponibles-para-liquidacion?tipo=cliente&cliente_id='.$this->cliente->id.'&ordenar_precio=asc');

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

        $response = $this->getJson('/api/viajes/disponibles-para-liquidacion?tipo=cliente&cliente_id='.$this->cliente->id.'&fecha_desde=2026-07-01&fecha_hasta=2026-07-31');

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
    public function test_store_deriva_iva_e_ignora_valor_manipulado(): void
    {
        $viaje = Viaje::create([
            'cliente_id' => $this->cliente->id,
            'estado' => 'terminado',
            'liquidado' => false,
            'precio_pactado' => 1000,
            'origen' => 'CABA',
            'destino' => 'Rosario',
            'fecha_salida' => '2026-07-15',
        ]);

        $response = $this->postJson('/api/liquidaciones', [
            'tipo' => 'cliente',
            'cliente_id' => $this->cliente->id,
            'fecha_emision' => now()->toDateString(),
            'estado' => 'borrador',
            'viajes' => [
                ['viaje_id' => $viaje->id, 'monto' => 1000, 'iva_monto' => 999],
            ],
        ]);

        $response->assertCreated();
        $this->assertDatabaseHas('liquidacion_viaje', [
            'liquidacion_id' => $response->json('id'),
            'viaje_id' => $viaje->id,
            'monto' => 1000,
            'iva_monto' => 210,
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

    /** @test */
    public function test_disponibles_por_entidad_cliente(): void
    {
        $cliente1 = Cliente::create([
            'razon_social' => 'Cliente Uno',
            'cuit' => '30-55555555-5',
        ]);
        $cliente2 = Cliente::create([
            'razon_social' => 'Cliente Dos',
            'cuit' => '30-66666666-6',
        ]);

        // 3 disponibles para cliente1
        for ($i = 0; $i < 3; $i++) {
            Viaje::create([
                'cliente_id' => $cliente1->id,
                'estado' => 'terminado',
                'liquidado_cliente' => false,
                'precio_pactado' => 100000,
                'origen' => 'CABA',
                'destino' => 'Rosario',
                'fecha_salida' => '2026-07-15',
            ]);
        }

        // 1 en otra liquidación mismo tipo (debe excluirse)
        $liq = Liquidacion::create(['tipo' => 'cliente', 'cliente_id' => $cliente1->id, 'estado' => 'borrador', 'fecha_emision' => now()->toDateString(), 'numero' => 'LIQ-C-0002']);
        $vExcluido = Viaje::create(['cliente_id' => $cliente1->id, 'estado' => 'terminado', 'liquidado_cliente' => false, 'precio_pactado' => 75000, 'origen' => 'CABA', 'destino' => 'Rosario', 'fecha_salida' => '2026-07-15']);
        $liq->viajes()->attach($vExcluido->id, ['monto' => 50000]);

        // 1 liquidado (debe excluirse)
        Viaje::create(['cliente_id' => $cliente1->id, 'estado' => 'terminado', 'liquidado_cliente' => true, 'precio_pactado' => 60000, 'origen' => 'CABA', 'destino' => 'Rosario', 'fecha_salida' => '2026-07-15']);

        // 1 planificado (también cuenta: todos los estados no liquidados)
        Viaje::create(['cliente_id' => $cliente1->id, 'estado' => 'planificado', 'liquidado_cliente' => false, 'precio_pactado' => 60000, 'origen' => 'CABA', 'destino' => 'Rosario', 'fecha_salida' => '2026-07-15']);

        // 2 para cliente2 (no deben aparecer en respuesta de cliente1)
        for ($i = 0; $i < 2; $i++) {
            Viaje::create([
                'cliente_id' => $cliente2->id,
                'estado' => 'terminado',
                'liquidado_cliente' => false,
                'precio_pactado' => 100000,
                'origen' => 'CABA',
                'destino' => 'Rosario',
                'fecha_salida' => '2026-07-15',
            ]);
        }

        $response = $this->getJson('/api/viajes/disponibles-por-entidad?tipo=cliente&fecha_desde=2026-07-01&fecha_hasta=2026-07-31');

        $response->assertOk()
            ->assertJsonCount(2)
            ->assertJsonFragment(['id' => $cliente1->id, 'cantidad' => 4])
            ->assertJsonFragment(['id' => $cliente2->id, 'cantidad' => 2]);
    }

    /** @test */
    public function test_disponibles_por_entidad_proveedor(): void
    {
        $prov1 = Proveedor::create([
            'razon_social' => 'Proveedor Uno',
            'cuit' => '30-77777777-7',
        ]);
        $prov2 = Proveedor::create([
            'razon_social' => 'Proveedor Dos',
            'cuit' => '30-88888888-8',
        ]);

        for ($i = 0; $i < 2; $i++) {
            Viaje::create([
                'proveedor_id' => $prov1->id,
                'estado' => 'terminado',
                'liquidado_proveedor' => false,
                'costo_proveedor' => 80000,
                'origen' => 'CABA',
                'destino' => 'Rosario',
                'fecha_salida' => '2026-07-15',
            ]);
        }
        for ($i = 0; $i < 5; $i++) {
            Viaje::create([
                'proveedor_id' => $prov2->id,
                'estado' => 'terminado',
                'liquidado_proveedor' => false,
                'costo_proveedor' => 80000,
                'origen' => 'CABA',
                'destino' => 'Rosario',
                'fecha_salida' => '2026-07-15',
            ]);
        }

        $response = $this->getJson('/api/viajes/disponibles-por-entidad?tipo=proveedor');

        $response->assertOk()
            ->assertJsonCount(2)
            ->assertJsonFragment(['id' => $prov1->id, 'cantidad' => 2])
            ->assertJsonFragment(['id' => $prov2->id, 'cantidad' => 5]);
    }

    /** @test */
    public function test_disponibles_por_entidad_respeta_fechas(): void
    {
        $cliente = Cliente::create([
            'razon_social' => 'Cliente Fechas',
            'cuit' => '30-99999999-9',
        ]);
        Viaje::create([
            'cliente_id' => $cliente->id,
            'estado' => 'terminado',
            'liquidado' => false,
            'precio_pactado' => 100000,
            'origen' => 'CABA',
            'destino' => 'Rosario',
            'fecha_salida' => '2026-01-15',
        ]);
        Viaje::create([
            'cliente_id' => $cliente->id,
            'estado' => 'terminado',
            'liquidado' => false,
            'precio_pactado' => 50000,
            'origen' => 'CABA',
            'destino' => 'Rosario',
            'fecha_salida' => '2026-07-15',
        ]);

        $response = $this->getJson('/api/viajes/disponibles-por-entidad?tipo=cliente&fecha_desde=2026-07-01&fecha_hasta=2026-07-31');

        $response->assertOk()
            ->assertJsonCount(1)
            ->assertJsonFragment(['id' => $cliente->id, 'cantidad' => 1]);
    }

    /** @test */
    public function test_disponibles_para_liquidacion_incluye_viajes_de_liquidaciones_archivadas(): void
    {
        $cuit = '30-'.mt_rand(10000000, 99999999).'-'.mt_rand(1, 9);
        $cliente = Cliente::create([
            'razon_social' => 'Cliente Archivado '.$cuit,
            'cuit' => $cuit,
        ]);

        // Viaje disponible (no en ninguna liquidación)
        $v1 = Viaje::create([
            'cliente_id' => $cliente->id,
            'estado' => 'terminado',
            'liquidado' => false,
            'precio_pactado' => 100000,
            'origen' => 'CABA',
            'destino' => 'Rosario',
            'fecha_salida' => '2026-07-15',
        ]);

        // Liquidación archivada (soft deleted) con un viaje
        $liqArchivada = Liquidacion::create([
            'tipo' => 'cliente',
            'cliente_id' => $cliente->id,
            'estado' => 'borrador',
            'fecha_emision' => now()->toDateString(),
            'numero' => 'LIQ-C-ARCH01',
        ]);
        $vArchivado = Viaje::create([
            'cliente_id' => $cliente->id,
            'estado' => 'terminado',
            'liquidado' => false,
            'precio_pactado' => 80000,
            'origen' => 'CABA',
            'destino' => 'Rosario',
            'fecha_salida' => '2026-07-15',
        ]);
        $liqArchivada->viajes()->attach($vArchivado->id, ['monto' => 80000]);
        $liqArchivada->delete(); // soft delete

        $response = $this->getJson('/api/viajes/disponibles-para-liquidacion?tipo=cliente&cliente_id='.$cliente->id);

        $response->assertOk()
            ->assertJsonCount(2) // ambos viajes deben estar disponibles
            ->assertJsonFragment(['id' => $v1->id])
            ->assertJsonFragment(['id' => $vArchivado->id]);
    }

    /** @test */
    public function test_disponibles_por_entidad_incluye_viajes_de_liquidaciones_archivadas(): void
    {
        $cuit = '30-'.mt_rand(10000000, 99999999).'-'.mt_rand(1, 9);
        $cliente = Cliente::create([
            'razon_social' => 'Cliente Archivado Count '.$cuit,
            'cuit' => $cuit,
        ]);

        // 3 viajes disponibles
        for ($i = 0; $i < 3; $i++) {
            Viaje::create([
                'cliente_id' => $cliente->id,
                'estado' => 'terminado',
                'liquidado' => false,
                'precio_pactado' => 100000,
                'origen' => 'CABA',
                'destino' => 'Rosario',
                'fecha_salida' => '2026-07-15',
            ]);
        }

        // Liquidación archivada con 2 viajes
        $liqArchivada = Liquidacion::create([
            'tipo' => 'cliente',
            'cliente_id' => $cliente->id,
            'estado' => 'borrador',
            'fecha_emision' => now()->toDateString(),
            'numero' => 'LIQ-C-ARCH02',
        ]);
        for ($i = 0; $i < 2; $i++) {
            $v = Viaje::create([
                'cliente_id' => $cliente->id,
                'estado' => 'terminado',
                'liquidado' => false,
                'precio_pactado' => 80000,
                'origen' => 'CABA',
                'destino' => 'Rosario',
                'fecha_salida' => '2026-07-15',
            ]);
            $liqArchivada->viajes()->attach($v->id, ['monto' => 80000]);
        }
        $liqArchivada->delete(); // soft delete

        $response = $this->getJson('/api/viajes/disponibles-por-entidad?tipo=cliente');

        $response->assertOk();
        $data = $response->json();
        $found = collect($data)->firstWhere('id', $cliente->id);
        $this->assertNotNull($found, 'Cliente should be in response');
        $this->assertEquals(5, $found['cantidad'], 'Archived liquidaciones should not block viajes');
    }
}
