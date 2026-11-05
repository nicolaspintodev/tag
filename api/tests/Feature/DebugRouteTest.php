<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DebugRouteTest extends TestCase
{
    use RefreshDatabase;

    public function test_ruta_debug_viajes_no_existe(): void
    {
        $this->actingAsUser();
        $this->getJson('/api/debug-viajes')->assertNotFound();
    }
}
