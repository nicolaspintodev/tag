<?php

namespace Tests\Feature;

use App\Support\PasswordPolicy;
use Illuminate\Support\Facades\Validator;
use Tests\TestCase;

class PasswordPolicyTest extends TestCase
{
    private function esValida(string $password): bool
    {
        return Validator::make(
            ['password' => $password],
            ['password' => [PasswordPolicy::rule()]],
        )->passes();
    }

    public function test_acepta_password_que_cumple_la_politica(): void
    {
        $this->assertTrue($this->esValida('Abcdef1!'));
    }

    public function test_rechaza_password_corta(): void
    {
        $this->assertFalse($this->esValida('Ab1!'));
    }

    public function test_rechaza_password_sin_mayuscula(): void
    {
        $this->assertFalse($this->esValida('abcdef1!'));
    }

    public function test_rechaza_password_sin_minuscula(): void
    {
        $this->assertFalse($this->esValida('ABCDEF1!'));
    }

    public function test_rechaza_password_sin_numero(): void
    {
        $this->assertFalse($this->esValida('Abcdefg!'));
    }

    public function test_rechaza_password_sin_simbolo(): void
    {
        $this->assertFalse($this->esValida('Abcdef12'));
    }
}
