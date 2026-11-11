<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class Cuit implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $digits = preg_replace('/\D/', '', (string) $value);

        if (strlen($digits) !== 11 || ! $this->digitoVerificadorValido($digits)) {
            $fail('El CUIT no es válido (formato esperado 20-XXXXXXXX-X).');
        }
    }

    private function digitoVerificadorValido(string $digits): bool
    {
        $weights = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
        $sum = 0;

        for ($i = 0; $i < 10; $i++) {
            $sum += (int) $digits[$i] * $weights[$i];
        }

        $check = 11 - ($sum % 11);

        if ($check === 11) {
            $check = 0;
        } elseif ($check === 10) {
            $check = 9;
        }

        return $check === (int) $digits[10];
    }
}
