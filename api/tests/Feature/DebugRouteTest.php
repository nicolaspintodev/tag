<?php

namespace Tests\Feature;

use Tests\TestCase;

class DebugRouteTest extends TestCase
{
    public function test_ruta_debug_viajes_no_existe(): void
    {
        $this->getJson('/api/debug-viajes')->assertNotFound();
    }
}
