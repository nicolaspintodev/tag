<?php

namespace Tests\Feature;

use App\Models\Proveedor;
use App\Models\Unidad;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UnidadApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->actingAsUser();
    }

    /** @test */
    public function test_unidades_index_returns_list()
    {
        $proveedor = Proveedor::create([
            'razon_social' => 'Proveedor Test',
            'cuit' => '30-22222222-2',
        ]);

        Unidad::create([
            'patente' => 'ABC-123',
            'tipo' => 'tractora',
            'marca' => 'Mercedes',
            'proveedor_id' => $proveedor->id,
        ]);

        Unidad::create([
            'patente' => 'DEF-456',
            'tipo' => 'acoplado',
            'marca' => 'Scania',
            'proveedor_id' => null,
        ]);

        $response = $this->getJson('/api/unidades');

        $response->assertOk()
            ->assertJsonCount(2)
            ->assertJsonFragment(['patente' => 'ABC-123'])
            ->assertJsonFragment(['patente' => 'DEF-456']);
    }

    /** @test */
    public function test_unidades_index_filters_by_tipo()
    {
        $proveedor = Proveedor::create([
            'razon_social' => 'Proveedor Test',
            'cuit' => '30-22222222-2',
        ]);

        Unidad::create(['patente' => 'TRACT-001', 'tipo' => 'tractora', 'proveedor_id' => $proveedor->id]);
        Unidad::create(['patente' => 'ACOP-001', 'tipo' => 'acoplado', 'proveedor_id' => $proveedor->id]);
        Unidad::create(['patente' => 'SEMI-001', 'tipo' => 'semirremolque', 'proveedor_id' => null]);
        Unidad::create(['patente' => 'TRACT-002', 'tipo' => 'tractora', 'proveedor_id' => null]);

        // Filtrar tractora
        $response = $this->getJson('/api/unidades?tipo=tractora');
        $response->assertOk()->assertJsonCount(2)
            ->assertJsonFragment(['patente' => 'TRACT-001'])
            ->assertJsonFragment(['patente' => 'TRACT-002']);

        // Filtrar acoplado
        $response = $this->getJson('/api/unidades?tipo=acoplado');
        $response->assertOk()->assertJsonCount(1)
            ->assertJsonFragment(['patente' => 'ACOP-001']);

        // Filtrar semirremolque
        $response = $this->getJson('/api/unidades?tipo=semirremolque');
        $response->assertOk()->assertJsonCount(1)
            ->assertJsonFragment(['patente' => 'SEMI-001']);
    }

    /** @test */
    public function test_unidades_index_filters_by_proveedor()
    {
        $proveedor1 = Proveedor::create([
            'razon_social' => 'Proveedor 1',
            'cuit' => '30-11111111-1',
        ]);

        $proveedor2 = Proveedor::create([
            'razon_social' => 'Proveedor 2',
            'cuit' => '30-22222222-2',
        ]);

        Unidad::create(['patente' => 'TRACT-001', 'tipo' => 'tractora', 'proveedor_id' => $proveedor1->id]);
        Unidad::create(['patente' => 'ACOP-001', 'tipo' => 'acoplado', 'proveedor_id' => $proveedor2->id]);
        Unidad::create(['patente' => 'SEMI-001', 'tipo' => 'semirremolque', 'proveedor_id' => null]);

        // Filtrar por proveedor específico
        $response = $this->getJson("/api/unidades?proveedor_id={$proveedor1->id}");
        $response->assertOk()->assertJsonCount(1)
            ->assertJsonFragment(['patente' => 'TRACT-001']);

        // Filtrar por propios (null)
        $response = $this->getJson('/api/unidades?proveedor_id=propio');
        $response->assertOk()->assertJsonCount(1)
            ->assertJsonFragment(['patente' => 'SEMI-001']);
    }

    /** @test */
    public function test_unidades_store_creates_unidad()
    {
        $proveedor = Proveedor::create([
            'razon_social' => 'Proveedor Test',
            'cuit' => '30-22222222-2',
        ]);

        $response = $this->postJson('/api/unidades', [
            'patente' => 'ABC-123',
            'tipo' => 'tractora',
            'marca' => 'Mercedes',
            'modelo' => 'Actros',
            'anio' => 2023,
            'numero' => 'UN-001',
            'vtv_vencimiento' => '2027-12-31',
            'seguro_vencimiento' => '2027-12-31',
            'proveedor_id' => $proveedor->id,
            'activo' => true,
        ]);

        $response->assertCreated()
            ->assertJsonFragment(['patente' => 'ABC-123'])
            ->assertJsonFragment(['tipo' => 'tractora'])
            ->assertJsonFragment(['numero' => 'UN-001']);

        $this->assertDatabaseHas('unidades', [
            'patente' => 'ABC-123',
            'tipo' => 'tractora',
        ]);
    }

    /** @test */
    public function test_unidades_store_validates_required()
    {
        $response = $this->postJson('/api/unidades', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['patente']);
    }

    /** @test */
    public function test_unidades_store_validates_patente_unique()
    {
        $proveedor = Proveedor::create([
            'razon_social' => 'Proveedor Test',
            'cuit' => '30-22222222-2',
        ]);

        Unidad::create([
            'patente' => 'ABC-123',
            'tipo' => 'tractora',
            'proveedor_id' => $proveedor->id,
        ]);

        $response = $this->postJson('/api/unidades', [
            'patente' => 'ABC-123',
            'tipo' => 'tractora',
            'proveedor_id' => $proveedor->id,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['patente']);
    }

    /** @test */
    public function test_unidades_store_validates_tipo_enum()
    {
        $proveedor = Proveedor::create([
            'razon_social' => 'Proveedor Test',
            'cuit' => '30-22222222-2',
        ]);

        // Tipo inválido -> error
        $response = $this->postJson('/api/unidades', [
            'patente' => 'ABC-123',
            'tipo' => 'invalido',
            'proveedor_id' => $proveedor->id,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['tipo']);

        // Tipos válidos -> OK
        foreach (['tractora', 'acoplado', 'semirremolque'] as $tipoValido) {
            $response = $this->postJson('/api/unidades', [
                'patente' => 'TEST-'.strtoupper($tipoValido).'-'.rand(100, 999),
                'tipo' => $tipoValido,
                'proveedor_id' => $proveedor->id,
            ]);
            $this->assertNotEquals(422, $response->status(), "Tipo '$tipoValido' debería ser válido");
        }
    }

    /** @test */
    public function test_unidades_store_validates_numero_unique_per_proveedor()
    {
        $proveedor = Proveedor::create([
            'razon_social' => 'Proveedor Test',
            'cuit' => '30-22222222-2',
        ]);

        Unidad::create([
            'patente' => 'AAA-111',
            'tipo' => 'tractora',
            'numero' => 'UN-001',
            'proveedor_id' => $proveedor->id,
        ]);

        // Mismo número, mismo proveedor -> error
        $response = $this->postJson('/api/unidades', [
            'patente' => 'BBB-222',
            'tipo' => 'tractora',
            'numero' => 'UN-001',
            'proveedor_id' => $proveedor->id,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['numero']);

        // Mismo número, proveedor distinto -> OK
        $proveedor2 = Proveedor::create([
            'razon_social' => 'Proveedor 2',
            'cuit' => '30-33333333-3',
        ]);

        $response = $this->postJson('/api/unidades', [
            'patente' => 'CCC-333',
            'tipo' => 'tractora',
            'numero' => 'UN-001',
            'proveedor_id' => $proveedor2->id,
        ]);

        $response->assertCreated();

        // Mismo número, ambos propios (null) -> error
        Unidad::create([
            'patente' => 'DDD-444',
            'tipo' => 'acoplado',
            'numero' => 'UN-002',
            'proveedor_id' => null,
        ]);

        $response = $this->postJson('/api/unidades', [
            'patente' => 'EEE-555',
            'tipo' => 'tractora',
            'numero' => 'UN-002',
            'proveedor_id' => null,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['numero']);
    }

    /** @test */
    public function test_unidades_show_returns_unidad()
    {
        $unidad = Unidad::create([
            'patente' => 'ABC-123',
            'tipo' => 'tractora',
            'marca' => 'Mercedes',
        ]);

        $response = $this->getJson("/api/unidades/{$unidad->id}");

        $response->assertOk()
            ->assertJsonFragment(['id' => $unidad->id, 'patente' => 'ABC-123']);
    }

    /** @test */
    public function test_unidades_show_returns_soft_deleted()
    {
        $unidad = Unidad::create([
            'patente' => 'ABC-123',
            'tipo' => 'tractora',
        ]);
        $unidad->delete();

        $response = $this->getJson("/api/unidades/{$unidad->id}");

        $response->assertOk()
            ->assertJsonFragment(['id' => $unidad->id, 'patente' => 'ABC-123']);
    }

    /** @test */
    public function test_unidades_update_modifies_unidad()
    {
        $unidad = Unidad::create([
            'patente' => 'ABC-123',
            'tipo' => 'tractora',
            'marca' => 'Mercedes',
        ]);

        $response = $this->putJson("/api/unidades/{$unidad->id}", [
            'marca' => 'Scania',
            'modelo' => 'R450',
        ]);

        $response->assertOk()
            ->assertJsonFragment(['marca' => 'Scania'])
            ->assertJsonFragment(['modelo' => 'R450']);

        $this->assertDatabaseHas('unidades', [
            'id' => $unidad->id,
            'marca' => 'Scania',
        ]);
    }

    /** @test */
    public function test_unidades_update_validates_uniques()
    {
        $proveedor = Proveedor::create([
            'razon_social' => 'Proveedor Test',
            'cuit' => '30-22222222-2',
        ]);

        $unidad1 = Unidad::create([
            'patente' => 'AAA-111',
            'tipo' => 'tractora',
            'proveedor_id' => $proveedor->id,
        ]);

        Unidad::create([
            'patente' => 'BBB-222',
            'tipo' => 'tractora',
            'proveedor_id' => $proveedor->id,
        ]);

        // Intentar actualizar unidad1 con patente de unidad2 -> error
        $response = $this->putJson("/api/unidades/{$unidad1->id}", [
            'patente' => 'BBB-222',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['patente']);

        // Actualizar con misma patente (excluyendo self) -> OK
        $response = $this->putJson("/api/unidades/{$unidad1->id}", [
            'patente' => 'AAA-111',
        ]);

        $response->assertOk();
    }

    /** @test */
    public function test_unidades_update_validates_tipo_enum()
    {
        $unidad = Unidad::create([
            'patente' => 'ABC-123',
            'tipo' => 'tractora',
        ]);

        // Tipo inválido -> error
        $response = $this->putJson("/api/unidades/{$unidad->id}", [
            'tipo' => 'invalido',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['tipo']);

        // Tipos válidos -> OK
        foreach (['tractora', 'acoplado', 'semirremolque'] as $tipoValido) {
            $response = $this->putJson("/api/unidades/{$unidad->id}", [
                'tipo' => $tipoValido,
            ]);
            $this->assertNotEquals(422, $response->status(), "Tipo '$tipoValido' debería ser válido en update");
        }
    }

    /** @test */
    public function test_unidades_destroy_soft_deletes()
    {
        $unidad = Unidad::create([
            'patente' => 'ABC-123',
            'tipo' => 'tractora',
        ]);

        $response = $this->deleteJson("/api/unidades/{$unidad->id}");

        $response->assertOk()
            ->assertJsonFragment(['message' => 'Unidad archivada exitosamente']);

        $this->assertSoftDeleted('unidades', ['id' => $unidad->id]);
    }

    /** @test */
    public function test_unidades_restore_recovers_unidad()
    {
        $unidad = Unidad::create([
            'patente' => 'ABC-123',
            'tipo' => 'tractora',
        ]);
        $unidad->delete();

        $response = $this->postJson("/api/unidades/{$unidad->id}/restore");

        $response->assertOk()
            ->assertJsonFragment(['message' => 'Unidad restaurada exitosamente']);

        $this->assertDatabaseHas('unidades', [
            'id' => $unidad->id,
            'deleted_at' => null,
        ]);
    }

    /** @test */
    public function test_unidades_archivados_only_trashed()
    {
        Unidad::create([
            'patente' => 'ACTIVO-001',
            'tipo' => 'tractora',
        ]);

        $unidadEliminada = Unidad::create([
            'patente' => 'ELIMINADO-001',
            'tipo' => 'acoplado',
        ]);
        $unidadEliminada->delete();

        // Sin filtro: solo activos
        $response = $this->getJson('/api/unidades');
        $response->assertOk()->assertJsonCount(1);

        // Con filtro archivados: solo eliminados
        $response = $this->getJson('/api/unidades?archivados=true');
        $response->assertOk()->assertJsonCount(1)
            ->assertJsonFragment(['patente' => 'ELIMINADO-001']);
    }

    /** @test */
    public function test_unidades_search_filters()
    {
        Unidad::create(['patente' => 'ABC-123', 'tipo' => 'tractora', 'marca' => 'Mercedes', 'modelo' => 'Actros', 'numero' => 'UN-001']);
        Unidad::create(['patente' => 'DEF-456', 'tipo' => 'acoplado', 'marca' => 'Scania', 'modelo' => 'R450', 'numero' => 'UN-002']);
        Unidad::create(['patente' => 'GHI-789', 'tipo' => 'semirremolque', 'marca' => 'Volvo', 'modelo' => 'FH16', 'numero' => 'UN-003']);

        // Buscar por patente
        $response = $this->getJson('/api/unidades?search=ABC-123');
        $response->assertOk()->assertJsonCount(1);

        // Buscar por marca
        $response = $this->getJson('/api/unidades?search=Scania');
        $response->assertOk()->assertJsonCount(1);

        // Buscar por modelo
        $response = $this->getJson('/api/unidades?search=Actros');
        $response->assertOk()->assertJsonCount(1);

        // Buscar por numero
        $response = $this->getJson('/api/unidades?search=UN-002');
        $response->assertOk()->assertJsonCount(1);
    }
}
