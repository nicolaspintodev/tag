<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ApiAuthTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create([
            'email' => 'operador@tag.com',
            'password' => 'Secreto123!',
        ]);
    }

    public function test_endpoints_require_auth(): void
    {
        $response = $this->getJson('/api/viajes');
        $response->assertStatus(401);
    }

    public function test_login_public(): void
    {
        $response = $this->postJson('/api/login', [
            'email' => 'operador@tag.com',
            'password' => 'Secreto123!',
        ]);
        $response->assertOk();
    }

    public function test_logout_requires_auth(): void
    {
        $response = $this->postJson('/api/logout');
        $response->assertStatus(401);
    }

    public function test_user_endpoint_requires_auth(): void
    {
        $response = $this->getJson('/api/user');
        $response->assertStatus(401);
    }

    public function test_cors_still_works_on_unauthenticated(): void
    {
        $response = $this->withHeaders(['Origin' => 'http://localhost:5173'])
            ->getJson('/api/viajes');
        $response->assertStatus(401)
            ->assertHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
    }
}
