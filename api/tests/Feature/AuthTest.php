<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\PersonalAccessToken;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    private function crearUsuario(array $atributos = []): User
    {
        return User::factory()->create(array_merge([
            'email' => 'operador@tag.com',
            'password' => 'Secreto123!',
        ], $atributos));
    }

    public function test_login_con_credenciales_validas_devuelve_token_y_usuario(): void
    {
        $this->crearUsuario();

        $response = $this->postJson('/api/login', [
            'email' => 'operador@tag.com',
            'password' => 'Secreto123!',
        ]);

        $response->assertOk()
            ->assertJsonStructure(['token', 'user' => ['id', 'name', 'email']])
            ->assertJsonPath('user.email', 'operador@tag.com');

        $this->assertNotEmpty($response->json('token'));
        $this->assertDatabaseCount('personal_access_tokens', 1);
    }

    public function test_login_no_expone_password_ni_remember_token(): void
    {
        $this->crearUsuario();

        $this->postJson('/api/login', [
            'email' => 'operador@tag.com',
            'password' => 'Secreto123!',
        ])
            ->assertOk()
            ->assertJsonMissingPath('user.password')
            ->assertJsonMissingPath('user.remember_token');
    }

    public function test_login_falla_con_password_incorrecta(): void
    {
        $this->crearUsuario();

        $this->postJson('/api/login', [
            'email' => 'operador@tag.com',
            'password' => 'incorrecta',
        ])
            ->assertStatus(401)
            ->assertJson(['message' => 'Credenciales inválidas']);

        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    public function test_login_falla_con_email_inexistente(): void
    {
        $this->postJson('/api/login', [
            'email' => 'nadie@tag.com',
            'password' => 'Secreto123!',
        ])
            ->assertStatus(401)
            ->assertJson(['message' => 'Credenciales inválidas']);
    }

    public function test_login_normaliza_email_con_mayusculas_y_espacios(): void
    {
        $this->crearUsuario();

        $this->postJson('/api/login', [
            'email' => '  Operador@TAG.com  ',
            'password' => 'Secreto123!',
        ])
            ->assertOk()
            ->assertJsonPath('user.email', 'operador@tag.com');
    }

    public function test_login_no_permite_usuarios_eliminados(): void
    {
        $usuario = $this->crearUsuario();
        $usuario->delete();

        $this->postJson('/api/login', [
            'email' => 'operador@tag.com',
            'password' => 'Secreto123!',
        ])->assertStatus(401);
    }

    public function test_login_valida_payload(): void
    {
        $this->postJson('/api/login', [
            'email' => 'no-es-un-email',
            'password' => ['arreglo'],
        ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['email', 'password']);
    }

    public function test_endpoint_user_requiere_token(): void
    {
        $this->getJson('/api/user')->assertStatus(401);
    }

    public function test_endpoint_user_devuelve_usuario_autenticado(): void
    {
        $this->crearUsuario();

        $login = $this->postJson('/api/login', [
            'email' => 'operador@tag.com',
            'password' => 'Secreto123!',
        ])->assertOk();

        $this->withHeader('Authorization', 'Bearer '.$login->json('token'))
            ->getJson('/api/user')
            ->assertOk()
            ->assertJsonPath('email', 'operador@tag.com');
    }

    public function test_logout_revoca_el_token_actual(): void
    {
        $usuario = $this->crearUsuario();
        $token = $usuario->createToken('api')->plainTextToken;

        $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/logout')
            ->assertNoContent();

        $this->assertDatabaseCount('personal_access_tokens', 0);
        $this->assertNull(PersonalAccessToken::findToken($token));

        // Los guards cachean el usuario resuelto entre requests del mismo test.
        $this->app['auth']->forgetGuards();

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/user')
            ->assertStatus(401);
    }

    public function test_logout_sin_token_devuelve_401(): void
    {
        $this->postJson('/api/logout')->assertStatus(401);
    }

    public function test_login_bloquea_tras_cinco_intentos_fallidos(): void
    {
        $this->crearUsuario();

        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/login', [
                'email' => 'operador@tag.com',
                'password' => 'incorrecta',
            ])->assertStatus(401);
        }

        $response = $this->postJson('/api/login', [
            'email' => 'operador@tag.com',
            'password' => 'Secreto123!',
        ]);

        $response->assertStatus(429)
            ->assertJsonStructure(['message'])
            ->assertHeader('Retry-After');

        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    public function test_login_exitoso_reinicia_el_contador_de_intentos(): void
    {
        $this->crearUsuario();

        for ($i = 0; $i < 4; $i++) {
            $this->postJson('/api/login', [
                'email' => 'operador@tag.com',
                'password' => 'incorrecta',
            ])->assertStatus(401);
        }

        $this->postJson('/api/login', [
            'email' => 'operador@tag.com',
            'password' => 'Secreto123!',
        ])->assertOk();

        $this->postJson('/api/login', [
            'email' => 'operador@tag.com',
            'password' => 'incorrecta',
        ])->assertStatus(401);
    }

    public function test_limite_de_intentos_es_independiente_por_email(): void
    {
        $this->crearUsuario();
        $this->crearUsuario(['email' => 'otro@tag.com']);

        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/login', [
                'email' => 'operador@tag.com',
                'password' => 'incorrecta',
            ])->assertStatus(401);
        }

        $this->postJson('/api/login', [
            'email' => 'operador@tag.com',
            'password' => 'incorrecta',
        ])->assertStatus(429);

        $this->postJson('/api/login', [
            'email' => 'otro@tag.com',
            'password' => 'Secreto123!',
        ])->assertOk();
    }

    public function test_limite_de_intentos_es_independiente_por_ip(): void
    {
        $this->crearUsuario();

        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/login', [
                'email' => 'operador@tag.com',
                'password' => 'incorrecta',
            ])->assertStatus(401);
        }

        $this->postJson('/api/login', [
            'email' => 'operador@tag.com',
            'password' => 'incorrecta',
        ])->assertStatus(429);

        $this->withServerVariables(['REMOTE_ADDR' => '203.0.113.9'])
            ->postJson('/api/login', [
                'email' => 'operador@tag.com',
                'password' => 'Secreto123!',
            ])->assertOk();
    }
}
