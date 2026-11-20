<?php

use App\Http\Controllers\AnticipoController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ChoferController;
use App\Http\Controllers\ClienteController;
use App\Http\Controllers\DocumentoController;
use App\Http\Controllers\FacturaController;
use App\Http\Controllers\GastoController;
use App\Http\Controllers\LiquidacionController;
use App\Http\Controllers\ProveedorController;
use App\Http\Controllers\UnidadController;
use App\Http\Controllers\ViajeController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::post('/logout', [AuthController::class, 'logout']);

    // Custom viaje routes (must be before apiResource to avoid {viaje} parameter matching)
    Route::get('/viajes/disponibles-para-liquidacion', [ViajeController::class, 'disponiblesParaLiquidacion']);
    Route::get('/viajes/disponibles-por-entidad', [ViajeController::class, 'disponiblesPorEntidad']);
    Route::patch('/viajes/{viaje}/estado', [ViajeController::class, 'cambiarEstado']);

    // Resources with Restore capability
    $resources = [
        'viajes' => ViajeController::class,
        'unidades' => UnidadController::class,
        'choferes' => ChoferController::class,
        'clientes' => ClienteController::class,
        'proveedores' => ProveedorController::class,
        'gastos' => GastoController::class,
        'anticipos' => AnticipoController::class,
        'documentos' => DocumentoController::class,
        'facturas' => FacturaController::class,
    ];

    foreach ($resources as $name => $controller) {
        Route::apiResource($name, $controller);
        Route::post("/{$name}/{id}/restore", [$controller, 'restore']);
    }

    // Liquidaciones (with custom endpoints)
    Route::apiResource('liquidaciones', LiquidacionController::class);
    Route::post('/liquidaciones/{id}/restore', [LiquidacionController::class, 'restore']);
    Route::get('/liquidaciones/{id}/viajes-disponibles', [LiquidacionController::class, 'viajesDisponibles']);
    Route::post('/liquidaciones/{id}/viajes', [LiquidacionController::class, 'agregarViajes']);
    Route::delete('/liquidaciones/{id}/viajes/{viajeId}', [LiquidacionController::class, 'quitarViaje']);
    Route::put('/liquidaciones/{id}/viajes/{viajeId}/monto', [LiquidacionController::class, 'actualizarMonto']);
    Route::put('/liquidaciones/{id}/estado', [LiquidacionController::class, 'cambiarEstado']);
    Route::put('/liquidaciones/{id}/detalle', [LiquidacionController::class, 'updateDetalle']);
    Route::post('/liquidaciones/{id}/facturar', [LiquidacionController::class, 'generarFactura']);

    // Documento file uploads
    Route::post('/documentos/{id}/archivos', [DocumentoController::class, 'storeArchivo']);
    Route::delete('/documentos/{documentoId}/archivos/{archivoId}', [DocumentoController::class, 'destroyArchivo']);
});
