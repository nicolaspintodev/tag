<?php

namespace Tests\Feature;

use App\Models\Cliente;
use Database\Seeders\ClienteSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ClienteApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->actingAsUser();
    }

    /** @test */
    public function test_clientes_index_returns_list()
    {
        Cliente::create(['razon_social' => 'Cliente Uno SA', 'cuit' => '20-12345678-6']);
        Cliente::create(['razon_social' => 'Cliente Dos SRL', 'cuit' => '30-71234567-1']);

        $response = $this->getJson('/api/clientes');

        $response->assertOk()
            ->assertJsonCount(2)
            ->assertJsonFragment(['razon_social' => 'Cliente Uno SA'])
            ->assertJsonFragment(['razon_social' => 'Cliente Dos SRL']);
    }

    /** @test */
    public function test_clientes_search_filters()
    {
        Cliente::create(['razon_social' => 'Tabacalera del Norte SA', 'nombre_administrativo' => 'Tabacal', 'cuit' => '20-12345678-6']);
        Cliente::create(['razon_social' => 'Transportes González SRL', 'nombre_administrativo' => 'González', 'cuit' => '30-71234567-1']);

        $response = $this->getJson('/api/clientes?search=Tabacal');
        $response->assertOk()->assertJsonCount(1)
            ->assertJsonFragment(['razon_social' => 'Tabacalera del Norte SA']);

        $response = $this->getJson('/api/clientes?search=González');
        $response->assertOk()->assertJsonCount(1)
            ->assertJsonFragment(['razon_social' => 'Transportes González SRL']);

        $response = $this->getJson('/api/clientes?search=30-71234567-1');
        $response->assertOk()->assertJsonCount(1);
    }

    /** @test */
    public function test_clientes_archivados_only_trashed()
    {
        Cliente::create(['razon_social' => 'Activo', 'cuit' => '20-12345678-6']);
        $eliminado = Cliente::create(['razon_social' => 'Eliminado', 'cuit' => '30-71234567-1']);
        $eliminado->delete();

        $response = $this->getJson('/api/clientes');
        $response->assertOk()->assertJsonCount(1);

        $response = $this->getJson('/api/clientes?archivados=true');
        $response->assertOk()->assertJsonCount(1)
            ->assertJsonFragment(['razon_social' => 'Eliminado']);
    }

    /** @test */
    public function test_clientes_store_creates_cliente()
    {
        $response = $this->postJson('/api/clientes', [
            'razon_social' => 'Tabacalera del Norte SA',
            'nombre_administrativo' => 'Tabacal',
            'cuit' => '20-12345678-6',
            'direccion' => 'Ruta 9 Km 120',
            'telefono' => '381-444-5555',
            'email' => 'contacto@tabacal.com.ar',
            'contacto' => 'Ana Pérez',
            'condicion_iva' => 'responsable_inscripto',
            'ingresos_brutos' => '123-456789-0',
            'localidad' => 'San Miguel de Tucumán',
            'provincia' => 'Tucumán',
            'codigo_postal' => '4000',
        ]);

        $response->assertCreated()
            ->assertJsonFragment(['razon_social' => 'Tabacalera del Norte SA'])
            ->assertJsonFragment(['nombre_administrativo' => 'Tabacal'])
            ->assertJsonFragment(['condicion_iva' => 'responsable_inscripto']);

        $this->assertDatabaseHas('clientes', [
            'cuit' => '20-12345678-6',
            'nombre_administrativo' => 'Tabacal',
            'provincia' => 'Tucumán',
            'codigo_postal' => '4000',
        ]);
    }

    /** @test */
    public function test_clientes_store_validates_required()
    {
        $response = $this->postJson('/api/clientes', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['razon_social', 'cuit']);
    }

    /** @test */
    public function test_clientes_store_validates_cuit_format()
    {
        $response = $this->postJson('/api/clientes', [
            'razon_social' => 'CUIT Inválido SA',
            'cuit' => '20-12345678-9',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['cuit']);
    }

    /** @test */
    public function test_clientes_store_validates_cuit_unique()
    {
        Cliente::create(['razon_social' => 'Existente', 'cuit' => '20-12345678-6']);

        $response = $this->postJson('/api/clientes', [
            'razon_social' => 'Duplicado SA',
            'cuit' => '20-12345678-6',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['cuit']);
    }

    /** @test */
    public function test_clientes_show_returns_cliente()
    {
        $cliente = Cliente::create(['razon_social' => 'Cliente Uno SA', 'cuit' => '20-12345678-6']);

        $response = $this->getJson("/api/clientes/{$cliente->id}");

        $response->assertOk()
            ->assertJsonFragment(['id' => $cliente->id, 'razon_social' => 'Cliente Uno SA']);
    }

    /** @test */
    public function test_clientes_show_returns_soft_deleted()
    {
        $cliente = Cliente::create(['razon_social' => 'Cliente Uno SA', 'cuit' => '20-12345678-6']);
        $cliente->delete();

        $response = $this->getJson("/api/clientes/{$cliente->id}");

        $response->assertOk()
            ->assertJsonFragment(['id' => $cliente->id, 'razon_social' => 'Cliente Uno SA']);
    }

    /** @test */
    public function test_clientes_update_modifies_cliente()
    {
        $cliente = Cliente::create(['razon_social' => 'Cliente Uno SA', 'cuit' => '20-12345678-6']);

        $response = $this->putJson("/api/clientes/{$cliente->id}", [
            'nombre_administrativo' => 'Uno',
            'telefono' => '11-9999-8888',
            'condicion_iva' => 'monotributo',
        ]);

        $response->assertOk()
            ->assertJsonFragment(['nombre_administrativo' => 'Uno'])
            ->assertJsonFragment(['condicion_iva' => 'monotributo']);

        $this->assertDatabaseHas('clientes', [
            'id' => $cliente->id,
            'nombre_administrativo' => 'Uno',
            'condicion_iva' => 'monotributo',
        ]);
    }

    /** @test */
    public function test_clientes_update_validates_condicion_iva()
    {
        $cliente = Cliente::create(['razon_social' => 'Cliente Uno SA', 'cuit' => '20-12345678-6']);

        $response = $this->putJson("/api/clientes/{$cliente->id}", [
            'condicion_iva' => 'inventada',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['condicion_iva']);
    }

    /** @test */
    public function test_clientes_destroy_soft_deletes()
    {
        $cliente = Cliente::create(['razon_social' => 'Cliente Uno SA', 'cuit' => '20-12345678-6']);

        $response = $this->deleteJson("/api/clientes/{$cliente->id}");

        $response->assertOk()
            ->assertJsonFragment(['message' => 'Cliente archivado exitosamente']);

        $this->assertSoftDeleted('clientes', ['id' => $cliente->id]);
    }

    /** @test */
    public function test_clientes_restore_recovers_cliente()
    {
        $cliente = Cliente::create(['razon_social' => 'Cliente Uno SA', 'cuit' => '20-12345678-6']);
        $cliente->delete();

        $response = $this->postJson("/api/clientes/{$cliente->id}/restore");

        $response->assertOk()
            ->assertJsonFragment(['message' => 'Cliente restaurado exitosamente']);

        $this->assertDatabaseHas('clientes', [
            'id' => $cliente->id,
            'deleted_at' => null,
        ]);
    }

    /** @test */
    public function test_cliente_nombre_mostrar_uses_administrativo_with_fallback()
    {
        $conAdmin = Cliente::create([
            'razon_social' => 'Tabacalera del Norte SA',
            'nombre_administrativo' => 'Tabacal',
            'cuit' => '20-12345678-6',
        ]);

        $sinAdmin = Cliente::create([
            'razon_social' => 'Transportes González SRL',
            'cuit' => '30-71234567-1',
        ]);

        $this->assertSame('Tabacal', $conAdmin->nombre_mostrar);
        $this->assertSame('Transportes González SRL', $sinAdmin->nombre_mostrar);
    }

    /** @test */
    public function test_cliente_seeder_creates_between_10_and_15_clientes()
    {
        $this->seed(ClienteSeeder::class);

        $count = Cliente::count();

        $this->assertGreaterThanOrEqual(10, $count);
        $this->assertLessThanOrEqual(15, $count);
    }
}
