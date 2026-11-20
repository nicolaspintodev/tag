<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CorsTest extends TestCase
{
    use RefreshDatabase;

    private array $origenes = [
        'http://localhost:5173',
        'https://logisticatag.com.ar',
    ];

    private function conOrigenesPermitidos(): void
    {
        config(['cors.allowed_origins' => $this->origenes]);
    }

    public function test_origen_local_permitido_recibe_cabecera_cors(): void
    {
        $this->actingAsUser();
        $this->conOrigenesPermitidos();

        $this->withHeaders(['Origin' => 'http://localhost:5173'])
            ->getJson('/api/user')
            ->assertHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
    }

    public function test_origen_de_produccion_permitido_recibe_cabecera_cors(): void
    {
        $this->actingAsUser();
        $this->conOrigenesPermitidos();

        $this->withHeaders(['Origin' => 'https://logisticatag.com.ar'])
            ->getJson('/api/user')
            ->assertHeader('Access-Control-Allow-Origin', 'https://logisticatag.com.ar');
    }

    public function test_origen_ajeno_no_recibe_cabecera_cors(): void
    {
        $this->actingAsUser();
        $this->conOrigenesPermitidos();

        $this->withHeaders(['Origin' => 'https://sitio-ajeno.example'])
            ->getJson('/api/user')
            ->assertHeaderMissing('Access-Control-Allow-Origin');
    }

    public function test_preflight_permite_metodos_y_headers_configurados(): void
    {
        $this->actingAsUser();
        $this->conOrigenesPermitidos();

        $response = $this->call('OPTIONS', '/api/user', [], [], [], [
            'HTTP_ORIGIN' => 'http://localhost:5173',
            'HTTP_ACCESS_CONTROL_REQUEST_METHOD' => 'GET',
            'HTTP_ACCESS_CONTROL_REQUEST_HEADERS' => 'Authorization, Content-Type',
        ]);

        $response->assertNoContent();
        $response->assertHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
        $response->assertHeader('Access-Control-Allow-Methods');
        $response->assertHeader('Access-Control-Allow-Headers');
    }

    public function test_allowlist_por_defecto_no_permite_cualquier_origen(): void
    {
        $config = require config_path('cors.php');

        $this->assertNotContains('*', $config['allowed_origins']);
        $this->assertContains('http://localhost:5173', $config['allowed_origins']);
        $this->assertContains('https://logisticatag.com.ar', $config['allowed_origins']);
    }
}
