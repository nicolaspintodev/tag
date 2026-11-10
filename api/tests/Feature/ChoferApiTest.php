<?php

namespace Tests\Feature;

use App\Models\Chofer;
use App\Models\Proveedor;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ChoferApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->actingAsUser();
    }

    /** @test */
    public function test_choferes_index_returns_list()
    {
        $proveedor = Proveedor::create([
            'razon_social' => 'Proveedor Test',
            'cuit' => '30-22222222-2',
        ]);

        Chofer::create([
            'proveedor_id' => $proveedor->id,
            'nombre' => 'Juan',
            'apellido' => 'Perez',
            'dni' => '30.111.111',
        ]);

        Chofer::create([
            'proveedor_id' => null,
            'nombre' => 'Pedro',
            'apellido' => 'Gomez',
            'dni' => '30.222.222',
        ]);

        $response = $this->getJson('/api/choferes');

        $response->assertOk()
            ->assertJsonCount(2)
            ->assertJsonFragment(['nombre' => 'Juan'])
            ->assertJsonFragment(['nombre' => 'Pedro']);
    }

    /** @test */
    public function test_choferes_index_filters_by_proveedor()
    {
        $proveedor1 = Proveedor::create([
            'razon_social' => 'Proveedor 1',
            'cuit' => '30-11111111-1',
        ]);

        $proveedor2 = Proveedor::create([
            'razon_social' => 'Proveedor 2',
            'cuit' => '30-22222222-2',
        ]);

        Chofer::create([
            'proveedor_id' => $proveedor1->id,
            'nombre' => 'Chofer Proveedor 1',
            'apellido' => 'Test',
        ]);

        Chofer::create([
            'proveedor_id' => $proveedor2->id,
            'nombre' => 'Chofer Proveedor 2',
            'apellido' => 'Test',
        ]);

        Chofer::create([
            'proveedor_id' => null,
            'nombre' => 'Chofer Propio',
            'apellido' => 'Test',
        ]);

        // Filtrar por proveedor específico
        $response = $this->getJson("/api/choferes?proveedor_id={$proveedor1->id}");
        $response->assertOk()->assertJsonCount(1)
            ->assertJsonFragment(['nombre' => 'Chofer Proveedor 1']);

        // Filtrar por propios (null)
        $response = $this->getJson('/api/choferes?proveedor_id=propio');
        $response->assertOk()->assertJsonCount(1)
            ->assertJsonFragment(['nombre' => 'Chofer Propio']);
    }

    /** @test */
    public function test_choferes_store_creates_chofer()
    {
        $proveedor = Proveedor::create([
            'razon_social' => 'Proveedor Test',
            'cuit' => '30-22222222-2',
        ]);

        $response = $this->postJson('/api/choferes', [
            'nombre' => 'Juan',
            'apellido' => 'Perez',
            'dni' => '30.111.111',
            'cuil' => '20-12345678-9',
            'telefono' => '11-4444-5555',
            'email' => 'juan@test.com',
            'direccion' => 'Calle 123',
            'fecha_nacimiento' => '1990-01-15',
            'licencia_vencimiento' => '2028-01-15',
            'proveedor_id' => $proveedor->id,
            'numero' => 'CH-001',
            'activo' => true,
        ]);

        $response->assertCreated()
            ->assertJsonFragment(['nombre' => 'Juan', 'apellido' => 'Perez'])
            ->assertJsonFragment(['cuil' => '20-12345678-9'])
            ->assertJsonFragment(['numero' => 'CH-001']);

        $this->assertDatabaseHas('choferes', [
            'nombre' => 'Juan',
            'apellido' => 'Perez',
            'cuil' => '20-12345678-9',
        ]);
    }

    /** @test */
    public function test_choferes_store_validates_required()
    {
        $response = $this->postJson('/api/choferes', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['nombre', 'apellido']);
    }

    /** @test */
    public function test_choferes_store_validates_dni_unique()
    {
        $proveedor = Proveedor::create([
            'razon_social' => 'Proveedor Test',
            'cuit' => '30-22222222-2',
        ]);

        Chofer::create([
            'proveedor_id' => $proveedor->id,
            'nombre' => 'Juan',
            'apellido' => 'Perez',
            'dni' => '30.111.111',
        ]);

        $response = $this->postJson('/api/choferes', [
            'nombre' => 'Pedro',
            'apellido' => 'Gomez',
            'dni' => '30.111.111',
            'proveedor_id' => $proveedor->id,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['dni']);
    }

    /** @test */
    public function test_choferes_store_validates_cuil_unique()
    {
        $proveedor = Proveedor::create([
            'razon_social' => 'Proveedor Test',
            'cuit' => '30-22222222-2',
        ]);

        Chofer::create([
            'proveedor_id' => $proveedor->id,
            'nombre' => 'Juan',
            'apellido' => 'Perez',
            'cuil' => '20-12345678-9',
        ]);

        $response = $this->postJson('/api/choferes', [
            'nombre' => 'Pedro',
            'apellido' => 'Gomez',
            'cuil' => '20-12345678-9',
            'proveedor_id' => $proveedor->id,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['cuil']);
    }

    /** @test */
    public function test_choferes_store_validates_numero_unique_per_proveedor()
    {
        $proveedor = Proveedor::create([
            'razon_social' => 'Proveedor Test',
            'cuit' => '30-22222222-2',
        ]);

        Chofer::create([
            'proveedor_id' => $proveedor->id,
            'nombre' => 'Juan',
            'apellido' => 'Perez',
            'numero' => 'CH-001',
        ]);

        // Mismo número, mismo proveedor -> error
        $response = $this->postJson('/api/choferes', [
            'nombre' => 'Pedro',
            'apellido' => 'Gomez',
            'numero' => 'CH-001',
            'proveedor_id' => $proveedor->id,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['numero']);

        // Mismo número, proveedor distinto -> OK
        $proveedor2 = Proveedor::create([
            'razon_social' => 'Proveedor 2',
            'cuit' => '30-33333333-3',
        ]);

        $response = $this->postJson('/api/choferes', [
            'nombre' => 'Luis',
            'apellido' => 'Martinez',
            'numero' => 'CH-001',
            'proveedor_id' => $proveedor2->id,
        ]);

        $response->assertCreated();

        // Mismo número, ambos propios (null) -> error
        Chofer::create([
            'proveedor_id' => null,
            'nombre' => 'Carlos',
            'apellido' => 'Lopez',
            'numero' => 'CH-002',
        ]);

        $response = $this->postJson('/api/choferes', [
            'nombre' => 'Ana',
            'apellido' => 'Garcia',
            'numero' => 'CH-002',
            'proveedor_id' => null,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['numero']);
    }

    /** @test */
    public function test_choferes_show_returns_chofer()
    {
        $chofer = Chofer::create([
            'nombre' => 'Juan',
            'apellido' => 'Perez',
            'dni' => '30.111.111',
        ]);

        $response = $this->getJson("/api/choferes/{$chofer->id}");

        $response->assertOk()
            ->assertJsonFragment(['id' => $chofer->id, 'nombre' => 'Juan']);
    }

    /** @test */
    public function test_choferes_show_returns_soft_deleted()
    {
        $chofer = Chofer::create([
            'nombre' => 'Juan',
            'apellido' => 'Perez',
        ]);
        $chofer->delete();

        $response = $this->getJson("/api/choferes/{$chofer->id}");

        $response->assertOk()
            ->assertJsonFragment(['id' => $chofer->id, 'nombre' => 'Juan']);
    }

    /** @test */
    public function test_choferes_update_modifies_chofer()
    {
        $chofer = Chofer::create([
            'nombre' => 'Juan',
            'apellido' => 'Perez',
            'dni' => '30.111.111',
        ]);

        $response = $this->putJson("/api/choferes/{$chofer->id}", [
            'nombre' => 'Juan Carlos',
            'telefono' => '11-9999-8888',
        ]);

        $response->assertOk()
            ->assertJsonFragment(['nombre' => 'Juan Carlos'])
            ->assertJsonFragment(['telefono' => '11-9999-8888']);

        $this->assertDatabaseHas('choferes', [
            'id' => $chofer->id,
            'nombre' => 'Juan Carlos',
        ]);
    }

    /** @test */
    public function test_choferes_update_validates_uniques()
    {
        $proveedor = Proveedor::create([
            'razon_social' => 'Proveedor Test',
            'cuit' => '30-22222222-2',
        ]);

        $chofer1 = Chofer::create([
            'proveedor_id' => $proveedor->id,
            'nombre' => 'Juan',
            'apellido' => 'Perez',
            'dni' => '30.111.111',
            'cuil' => '20-11111111-1',
        ]);

        Chofer::create([
            'proveedor_id' => $proveedor->id,
            'nombre' => 'Pedro',
            'apellido' => 'Gomez',
            'dni' => '30.222.222',
            'cuil' => '20-22222222-2',
        ]);

        // Intentar actualizar chofer1 con DNI de chofer2 -> error
        $response = $this->putJson("/api/choferes/{$chofer1->id}", [
            'dni' => '30.222.222',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['dni']);

        // Intentar actualizar chofer1 con CUIL de chofer2 -> error
        $response = $this->putJson("/api/choferes/{$chofer1->id}", [
            'cuil' => '20-22222222-2',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['cuil']);

        // Actualizar con mismo DNI/CUIL (excluyendo self) -> OK
        $response = $this->putJson("/api/choferes/{$chofer1->id}", [
            'dni' => '30.111.111',
            'cuil' => '20-11111111-1',
        ]);

        $response->assertOk();
    }

    /** @test */
    public function test_choferes_destroy_soft_deletes()
    {
        $chofer = Chofer::create([
            'nombre' => 'Juan',
            'apellido' => 'Perez',
        ]);

        $response = $this->deleteJson("/api/choferes/{$chofer->id}");

        $response->assertOk()
            ->assertJsonFragment(['message' => 'Chofer archivado exitosamente']);

        $this->assertSoftDeleted('choferes', ['id' => $chofer->id]);
    }

    /** @test */
    public function test_choferes_restore_recovers_chofer()
    {
        $chofer = Chofer::create([
            'nombre' => 'Juan',
            'apellido' => 'Perez',
        ]);
        $chofer->delete();

        $response = $this->postJson("/api/choferes/{$chofer->id}/restore");

        $response->assertOk()
            ->assertJsonFragment(['message' => 'Chofer restaurado exitosamente']);

        $this->assertDatabaseHas('choferes', [
            'id' => $chofer->id,
            'deleted_at' => null,
        ]);
    }

    /** @test */
    public function test_choferes_archivados_only_trashed()
    {
        Chofer::create([
            'nombre' => 'Activo',
            'apellido' => 'Uno',
        ]);

        $choferEliminado = Chofer::create([
            'nombre' => 'Eliminado',
            'apellido' => 'Dos',
        ]);
        $choferEliminado->delete();

        // Sin filtro: solo activos
        $response = $this->getJson('/api/choferes');
        $response->assertOk()->assertJsonCount(1);

        // Con filtro archivados: solo eliminados
        $response = $this->getJson('/api/choferes?archivados=true');
        $response->assertOk()->assertJsonCount(1)
            ->assertJsonFragment(['nombre' => 'Eliminado']);
    }

    /** @test */
    public function test_choferes_search_filters()
    {
        Chofer::create(['nombre' => 'Juan', 'apellido' => 'Perez', 'dni' => '30.111.111', 'email' => 'juan@test.com', 'telefono' => '11-3333-1111']);
        Chofer::create(['nombre' => 'Pedro', 'apellido' => 'Gomez', 'dni' => '30.222.222', 'email' => 'pedro@test.com', 'telefono' => '11-2222-2222']);
        Chofer::create(['nombre' => 'Luis', 'apellido' => 'Martinez', 'dni' => '30.333.333', 'numero' => 'CH-001']);

        // Buscar por nombre
        $response = $this->getJson('/api/choferes?search=Juan');
        $response->assertOk()->assertJsonCount(1);

        // Buscar por apellido
        $response = $this->getJson('/api/choferes?search=Gomez');
        $response->assertOk()->assertJsonCount(1);

        // Buscar por DNI
        $response = $this->getJson('/api/choferes?search=30.222');
        $response->assertOk()->assertJsonCount(1);

        // Buscar por email
        $response = $this->getJson('/api/choferes?search=pedro@test');
        $response->assertOk()->assertJsonCount(1);

        // Buscar por telefono
        $response = $this->getJson('/api/choferes?search=3333');
        $response->assertOk()->assertJsonCount(1);

        // Buscar por numero
        $response = $this->getJson('/api/choferes?search=CH-001');
        $response->assertOk()->assertJsonCount(1);
    }
}