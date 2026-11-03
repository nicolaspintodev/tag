<?php

namespace App\Support;

use Illuminate\Validation\Rules\Password;

class PasswordPolicy
{
    public static function rule(): Password
    {
        return Password::min((int) config('security.password.min_length', 8))
            ->mixedCase()
            ->numbers()
            ->symbols();
    }
}
