<?php

namespace Tests\Feature;

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
        $viajeLiquidado = $this->crearViaje(['id' => 2, 'liquidado' => true, 'precio_pactado' => 2000]);
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
