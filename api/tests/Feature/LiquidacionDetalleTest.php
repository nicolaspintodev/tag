<?php

namespace Tests\Feature;

use App\Models\Chofer;
use App\Models\Cliente;
use App\Models\Liquidacion;
use App\Models\Proveedor;
use App\Models\Viaje;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LiquidacionDetalleTest extends TestCase
{
    use RefreshDatabase;

    private $cliente;

    private $proveedor;

    private $chofer;

    protected function setUp(): void
    {
        parent::setUp();
        $this->actingAsUser();

        $this->cliente = Cliente::create([
            'razon_social' => 'Cliente Detalle',
            'cuit' => '30-11111111-1',
        ]);
        $this->proveedor = Proveedor::create([
            'razon_social' => 'Proveedor Detalle',
            'cuit' => '30-22222222-2',
        ]);
        $this->chofer = Chofer::create([
            'nombre' => 'Juan',
            'apellido' => 'Garcia',
            'dni' => '30.333.333',
        ]);
    }

    private function crearViaje(array $overrides = []): Viaje
    {
        return Viaje::create(array_merge([
            'cliente_id' => $this->cliente->id,
            'proveedor_id' => null,
            'origen' => 'CABA',
            'destino' => 'Rosario',
            'fecha_salida' => '2026-11-20',
            'precio_pactado' => 1000,
            'costo_proveedor' => 700,
            'estado' => 'terminado',
        ], $overrides));
    }

    private function crearLiquidacion(array $overrides = []): Liquidacion
    {
        return Liquidacion::create(array_merge([
            'numero' => 'LIQ-DET-0001',
            'tipo' => 'cliente',
            'cliente_id' => $this->cliente->id,
            'proveedor_id' => null,
            'fecha_emision' => '2026-11-20',
            'total' => 0,
            'estado' => 'borrador',
        ], $overrides));
    }

    public function test_guarda_datos_y_viajes_en_borrador(): void
    {
        $viaje = $this->crearViaje();
        $liquidacion = $this->crearLiquidacion();

        $response = $this->putJson("/api/liquidaciones/{$liquidacion->id}/detalle", [
            'notas' => 'Observaciones nuevas',
            'fecha_emision' => '2026-11-21',
            'viajes' => [
                ['viaje_id' => $viaje->id, 'monto' => 1000, 'iva_monto' => 210],
            ],
        ]);

        $response->assertOk()->assertJsonCount(1, 'viajes');
        $this->assertDatabaseHas('liquidaciones', [
            'id' => $liquidacion->id,
            'notas' => 'Observaciones nuevas',
            'total' => 1000,
            'estado' => 'borrador',
        ]);
        $this->assertSame('2026-11-21', $liquidacion->fresh()->fecha_emision->toDateString());
        $this->assertDatabaseHas('liquidacion_viaje', [
            'liquidacion_id' => $liquidacion->id,
            'viaje_id' => $viaje->id,
            'monto' => 1000,
            'iva_monto' => 210,
        ]);
    }

    public function test_update_detalle_actualiza_precio_pactado_en_borrador(): void
    {
        $viaje = $this->crearViaje(['precio_pactado' => 1000]);
        $liquidacion = $this->crearLiquidacion();

        $this->putJson("/api/liquidaciones/{$liquidacion->id}/detalle", [
            'fecha_emision' => '2026-11-20',
            'viajes' => [
                ['viaje_id' => $viaje->id, 'monto' => 1500],
            ],
        ])->assertOk();

        $this->assertDatabaseHas('viajes', [
            'id' => $viaje->id,
            'precio_pactado' => 1500,
        ]);
    }

    public function test_update_detalle_actualiza_costo_proveedor_en_borrador(): void
    {
        $viaje = $this->crearViaje([
            'cliente_id' => null,
            'proveedor_id' => $this->proveedor->id,
            'costo_proveedor' => 700,
        ]);
        $liquidacion = $this->crearLiquidacion([
            'tipo' => 'proveedor',
            'cliente_id' => null,
            'proveedor_id' => $this->proveedor->id,
        ]);

        $this->putJson("/api/liquidaciones/{$liquidacion->id}/detalle", [
            'fecha_emision' => '2026-11-20',
            'viajes' => [
                ['viaje_id' => $viaje->id, 'monto' => 1500],
            ],
        ])->assertOk();

        $this->assertDatabaseHas('viajes', [
            'id' => $viaje->id,
            'costo_proveedor' => 1500,
        ]);
    }

    public function test_update_detalle_actualiza_costo_viaje_en_borrador(): void
    {
        $viaje = $this->crearViaje([
            'chofer_id' => $this->chofer->id,
            'costo_viaje' => 800,
        ]);
        $liquidacion = $this->crearLiquidacion([
            'tipo' => 'chofer',
            'cliente_id' => null,
            'chofer_id' => $this->chofer->id,
        ]);

        $this->putJson("/api/liquidaciones/{$liquidacion->id}/detalle", [
            'fecha_emision' => '2026-11-20',
            'viajes' => [
                ['viaje_id' => $viaje->id, 'monto' => 1500],
            ],
        ])->assertOk();

        $this->assertDatabaseHas('viajes', [
            'id' => $viaje->id,
            'costo_viaje' => 1500,
        ]);
    }

    public function test_recalcula_iva_e_ignora_valor_manipulado(): void
    {
        $viaje = $this->crearViaje();
        $liquidacion = $this->crearLiquidacion();

        $response = $this->putJson("/api/liquidaciones/{$liquidacion->id}/detalle", [
            'fecha_emision' => '2026-11-21',
            'viajes' => [
                ['viaje_id' => $viaje->id, 'monto' => 1000, 'iva_monto' => 999],
            ],
        ]);

        $response->assertOk();
        $this->assertDatabaseHas('liquidacion_viaje', [
            'liquidacion_id' => $liquidacion->id,
            'viaje_id' => $viaje->id,
            'monto' => 1000,
            'iva_monto' => 210,
        ]);
    }

    public function test_calcula_iva_cuando_no_se_envia_iva_monto(): void
    {
        $viaje = $this->crearViaje();
        $liquidacion = $this->crearLiquidacion();

        $response = $this->putJson("/api/liquidaciones/{$liquidacion->id}/detalle", [
            'fecha_emision' => '2026-11-21',
            'viajes' => [
                ['viaje_id' => $viaje->id, 'monto' => 1000],
            ],
        ]);

        $response->assertOk();
        $this->assertDatabaseHas('liquidacion_viaje', [
            'liquidacion_id' => $liquidacion->id,
            'viaje_id' => $viaje->id,
            'monto' => 1000,
            'iva_monto' => 210,
        ]);
    }

    public function test_rechaza_viaje_duplicado(): void
    {
        $viaje = $this->crearViaje();
        $liquidacion = $this->crearLiquidacion();

        $response = $this->putJson("/api/liquidaciones/{$liquidacion->id}/detalle", [
            'fecha_emision' => '2026-11-20',
            'viajes' => [
                ['viaje_id' => $viaje->id, 'monto' => 1000, 'iva_monto' => 210],
                ['viaje_id' => $viaje->id, 'monto' => 2000, 'iva_monto' => 420],
            ],
        ]);

        $response->assertStatus(422)->assertJsonFragment(['message' => 'Los viajes no pueden repetirse']);
        $this->assertDatabaseCount('liquidacion_viaje', 0);
    }

    public function test_rechaza_viaje_de_otra_entidad(): void
    {
        $otroCliente = Cliente::create([
            'razon_social' => 'Otro Cliente',
            'cuit' => '30-33333333-3',
        ]);
        $viaje = $this->crearViaje(['cliente_id' => $otroCliente->id]);
        $liquidacion = $this->crearLiquidacion();

        $response = $this->putJson("/api/liquidaciones/{$liquidacion->id}/detalle", [
            'fecha_emision' => '2026-11-20',
            'viajes' => [
                ['viaje_id' => $viaje->id, 'monto' => 1000, 'iva_monto' => 210],
            ],
        ]);

        $response->assertStatus(422)->assertJsonFragment(['message' => 'Un viaje no pertenece a la entidad de la liquidación']);
    }

    public function test_transicion_a_pendiente_marca_viajes_como_liquidados(): void
    {
        $viaje = $this->crearViaje();
        $liquidacion = $this->crearLiquidacion();

        $response = $this->putJson("/api/liquidaciones/{$liquidacion->id}/detalle", [
            'fecha_emision' => '2026-11-20',
            'viajes' => [
                ['viaje_id' => $viaje->id, 'monto' => 1000, 'iva_monto' => 210],
            ],
            'estado' => 'pendiente',
        ]);

        $response->assertOk();
        $this->assertDatabaseHas('liquidaciones', [
            'id' => $liquidacion->id,
            'estado' => 'pendiente',
        ]);
        $this->assertDatabaseHas('viajes', [
            'id' => $viaje->id,
            'liquidado' => 1,
        ]);
    }

    public function test_rechaza_guardar_liquidacion_pendiente(): void
    {
        $liquidacion = $this->crearLiquidacion(['estado' => 'pendiente']);

        $response = $this->putJson("/api/liquidaciones/{$liquidacion->id}/detalle", [
            'fecha_emision' => '2026-11-20',
            'viajes' => [],
        ]);

        $response->assertStatus(422)
            ->assertJsonFragment(['message' => 'Solo se puede editar una liquidación en estado borrador']);
    }

    public function test_rechaza_estado_facturada(): void
    {
        $liquidacion = $this->crearLiquidacion();

        $response = $this->putJson("/api/liquidaciones/{$liquidacion->id}/detalle", [
            'fecha_emision' => '2026-11-20',
            'viajes' => [],
            'estado' => 'facturada',
        ]);

        $response->assertStatus(422)
            ->assertJsonFragment(['message' => 'El único cambio de estado permitido es a pendiente']);
    }

    public function test_agrega_y_quita_viajes_en_una_sola_llamada(): void
    {
        $viajeViejo = $this->crearViaje(['id' => 1, 'precio_pactado' => 1000]);
        $viajeNuevo = $this->crearViaje(['id' => 2, 'precio_pactado' => 2000]);
        $liquidacion = $this->crearLiquidacion();
        $liquidacion->viajes()->attach($viajeViejo->id, ['monto' => 1000, 'iva_monto' => 210]);

        $response = $this->putJson("/api/liquidaciones/{$liquidacion->id}/detalle", [
            'fecha_emision' => '2026-11-20',
            'viajes' => [
                ['viaje_id' => $viajeNuevo->id, 'monto' => 2000, 'iva_monto' => 420],
            ],
        ]);

        $response->assertOk()->assertJsonCount(1, 'viajes');
        $this->assertDatabaseMissing('liquidacion_viaje', [
            'liquidacion_id' => $liquidacion->id,
            'viaje_id' => $viajeViejo->id,
        ]);
        $this->assertDatabaseHas('liquidacion_viaje', [
            'liquidacion_id' => $liquidacion->id,
            'viaje_id' => $viajeNuevo->id,
            'monto' => 2000,
            'iva_monto' => 420,
        ]);
        $this->assertDatabaseHas('liquidaciones', ['id' => $liquidacion->id, 'total' => 2000]);
    }

    public function test_rechaza_viaje_liquidado(): void
    {
        $viaje = $this->crearViaje(['liquidado_cliente' => true]);
        $liquidacion = $this->crearLiquidacion();

        $response = $this->putJson("/api/liquidaciones/{$liquidacion->id}/detalle", [
            'fecha_emision' => '2026-11-20',
            'viajes' => [
                ['viaje_id' => $viaje->id, 'monto' => 1000, 'iva_monto' => 210],
            ],
        ]);

        $response->assertStatus(422)
            ->assertJsonFragment(['message' => 'Un viaje ya está liquidado para este concepto']);
        $this->assertDatabaseCount('liquidacion_viaje', 0);
    }

    public function test_rechaza_viaje_en_otra_liquidacion_activa(): void
    {
        $viaje = $this->crearViaje();
        $otraLiquidacion = $this->crearLiquidacion(['numero' => 'LIQ-OTRA-0001']);
        $otraLiquidacion->viajes()->attach($viaje->id, ['monto' => 1000, 'iva_monto' => 210]);
        $liquidacion = $this->crearLiquidacion(['numero' => 'LIQ-ACTUAL-0001']);

        $response = $this->putJson("/api/liquidaciones/{$liquidacion->id}/detalle", [
            'fecha_emision' => '2026-11-20',
            'viajes' => [
                ['viaje_id' => $viaje->id, 'monto' => 1000, 'iva_monto' => 210],
            ],
        ]);

        $response->assertStatus(422)
            ->assertJsonFragment(['message' => 'Un viaje ya está incluido en otra liquidación']);
        $this->assertDatabaseCount('liquidacion_viaje', 1);
    }

    public function test_rechaza_estado_borrador_en_payload(): void
    {
        $liquidacion = $this->crearLiquidacion();

        $response = $this->putJson("/api/liquidaciones/{$liquidacion->id}/detalle", [
            'fecha_emision' => '2026-11-20',
            'viajes' => [],
            'estado' => 'borrador',
        ]);

        $response->assertStatus(422)
            ->assertJsonFragment(['message' => 'El único cambio de estado permitido es a pendiente']);
    }

    public function test_rechaza_guardar_liquidacion_facturada(): void
    {
        $liquidacion = $this->crearLiquidacion(['estado' => 'facturada']);

        $response = $this->putJson("/api/liquidaciones/{$liquidacion->id}/detalle", [
            'fecha_emision' => '2026-11-20',
            'viajes' => [],
        ]);

        $response->assertStatus(422)
            ->assertJsonFragment(['message' => 'Solo se puede editar una liquidación en estado borrador']);
    }

    public function test_viajes_disponibles_rechaza_liquidacion_pendiente(): void
    {
        $liquidacion = $this->crearLiquidacion(['estado' => 'pendiente']);

        $response = $this->getJson("/api/liquidaciones/{$liquidacion->id}/viajes-disponibles");

        $response->assertStatus(422)
            ->assertJsonFragment(['message' => 'Solo se pueden consultar viajes disponibles en estado borrador']);
    }

    public function test_viajes_disponibles_excluye_liquidados_y_ignora_archivadas(): void
    {
        $viajeLibre = $this->crearViaje(['id' => 1, 'precio_pactado' => 1000]);
        $viajeLiquidado = $this->crearViaje(['id' => 2, 'liquidado_cliente' => true, 'precio_pactado' => 2000]);
        $viajeEnArchivada = $this->crearViaje(['id' => 3, 'precio_pactado' => 3000]);

        $archivada = $this->crearLiquidacion(['numero' => 'LIQ-ARCH-0001']);
        $archivada->viajes()->attach($viajeEnArchivada->id, ['monto' => 3000, 'iva_monto' => 0]);
        $archivada->delete();

        $liquidacion = $this->crearLiquidacion(['numero' => 'LIQ-ACT-0001']);

        $response = $this->getJson("/api/liquidaciones/{$liquidacion->id}/viajes-disponibles");

        $response->assertOk()
            ->assertJsonFragment(['id' => $viajeLibre->id])
            ->assertJsonMissing(['id' => $viajeLiquidado->id])
            ->assertJsonFragment(['id' => $viajeEnArchivada->id]);
    }
}
