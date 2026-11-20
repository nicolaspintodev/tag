<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;

class HealthController extends Controller
{
    public function index()
    {
        $db = 'ok';
        try {
            DB::connection()->getPdo();
        } catch (\Throwable $e) {
            $db = 'error';
        }

        $status = $db === 'ok' ? 'ok' : 'degraded';

        return response()->json([
            'status' => $status,
            'timestamp' => now()->toIso8601String(),
            'database' => $db,
        ], $status === 'ok' ? 200 : 503);
    }
}
