<?php

namespace Tests;

use App\Models\User;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Laravel\Sanctum\Sanctum;

trait ActsAsAuthenticated
{
    protected User $authenticatedUser;

    protected function actingAsUser(User $user = null): User
    {
        $this->authenticatedUser = $user ?? User::factory()->create([
            'email' => 'operador@tag.com',
            'password' => 'Secreto123!',
        ]);

        Sanctum::actingAs($this->authenticatedUser, ['*']);

        return $this->authenticatedUser;
    }
}

abstract class TestCase extends BaseTestCase
{
    use ActsAsAuthenticated;
}