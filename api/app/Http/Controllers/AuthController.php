<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Laravel\Sanctum\PersonalAccessToken;

class AuthController extends Controller
{
    private const MAX_INTENTOS = 5;

    private const DECAIMIENTO_SEGUNDOS = 60;

    public function login(Request $request): JsonResponse
    {
        $datos = $request->validate([
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ]);

        $email = Str::lower(trim($datos['email']));
        $clave = 'login:'.$email.'|'.$request->ip();

        if (RateLimiter::tooManyAttempts($clave, self::MAX_INTENTOS)) {
            $segundos = RateLimiter::availableIn($clave);

            return response()
                ->json(['message' => "Demasiados intentos. Probá de nuevo en {$segundos} segundos."], 429)
                ->header('Retry-After', (string) $segundos);
        }

        $usuario = User::where('email', $email)->first();

        if (! $usuario || ! Hash::check($datos['password'], $usuario->password)) {
            RateLimiter::hit($clave, self::DECAIMIENTO_SEGUNDOS);

            return response()->json(['message' => 'Credenciales inválidas'], 401);
        }

        RateLimiter::clear($clave);

        return response()->json([
            'token' => $usuario->createToken('api')->plainTextToken,
            'user' => $usuario->only(['id', 'name', 'email']),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $token = $request->user()->currentAccessToken();

        if ($token instanceof PersonalAccessToken) {
            $token->delete();
        }

        return response()->json(null, 204);
    }
}
