<?php

namespace App\Http\Controllers;

use App\Models\Factura;
use App\Models\Liquidacion;
use App\Models\Viaje;
use Illuminate\Http\Request;

class LiquidacionController extends Controller
{
    public function index(Request $request)
    {
        $query = Liquidacion::query();

        if ($request->boolean('archivados')) {
            $query->onlyTrashed();
        }

        if ($request->filled('tipo')) {
            $query->where('tipo', $request->get('tipo'));
        }

        if ($request->has('cliente_id')) {
            $query->where('cliente_id', $request->get('cliente_id'));
        }

        if ($request->has('proveedor_id')) {
            $query->where('proveedor_id', $request->get('proveedor_id'));
        }

        return response()->json(
            $query->with(['cliente', 'proveedor', 'viajes' => function ($q) {
                $q->with(['chofer', 'unidades', 'cliente', 'documento', 'gastos', 'anticipos']);
            }])
                ->orderBy('created_at', 'desc')
                ->get()
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'tipo' => 'required|string|in:cliente,proveedor',
            'cliente_id' => 'nullable|exists:clientes,id',
            'proveedor_id' => 'nullable|exists:proveedores,id',
            'fecha_emision' => 'required|date',
            'notas' => 'nullable|string',
            'estado' => 'nullable|string|in:borrador,pendiente',
            'viajes' => 'nullable|array',
            'viajes.*.viaje_id' => 'required|exists:viajes,id',
            'viajes.*.monto' => 'nullable|numeric|min:0',
            'viajes.*.iva_monto' => 'nullable|numeric|min:0',
        ]);

        if ($validated['tipo'] === 'cliente' && empty($validated['cliente_id'])) {
            return response()->json(['message' => 'cliente_id es requerido para liquidaciones de cliente'], 422);
        }
        if ($validated['tipo'] === 'proveedor' && empty($validated['proveedor_id'])) {
            return response()->json(['message' => 'proveedor_id es requerido para liquidaciones de proveedor'], 422);
        }

        $viajesData = $validated['viajes'] ?? [];
        unset($validated['viajes']);

        $validated['numero'] = $this->generateNumero($validated['tipo']);
        $validated['total'] = 0;
        $validated['estado'] = $validated['estado'] ?? 'borrador';

        $liquidacion = Liquidacion::create($validated);

        if (! empty($viajesData)) {
            $itemsToAttach = [];
            foreach ($viajesData as $item) {
                $viaje = Viaje::findOrFail($item['viaje_id']);
                $monto = $item['monto'] ?? ($liquidacion->tipo === 'proveedor'
                    ? ($viaje->costo_proveedor_ajustado ?? $viaje->costo_viaje ?? 0)
                    : $viaje->precio_pactado);
                $ivaMonto = $item['iva_monto'] ?? 0;

                $itemsToAttach[$viaje->id] = ['monto' => $monto, 'iva_monto' => $ivaMonto];
            }
            $liquidacion->viajes()->attach($itemsToAttach);
            $this->recalcularTotal($liquidacion);
        }

        // Si estado es pendiente, marcar viajes como liquidados
        if ($liquidacion->estado === 'pendiente') {
            $liquidacion->viajes()->update(['liquidado' => true]);
        }

        return response()->json($liquidacion->load(['cliente', 'proveedor', 'viajes']), 201);
    }

    public function show($id)
    {
        $liquidacion = Liquidacion::withTrashed()
            ->with(['cliente', 'proveedor', 'viajes' => function ($q) {
                $q->with(['chofer', 'unidades', 'cliente', 'documento', 'gastos', 'anticipos']);
            }, 'factura'])
            ->findOrFail($id);

        return response()->json($liquidacion);
    }

    public function update(Request $request, $id)
    {
        $liquidacion = Liquidacion::withTrashed()->findOrFail($id);

        if ($liquidacion->estado !== 'borrador') {
            return response()->json(['message' => 'Solo se puede editar una liquidación en estado borrador'], 422);
        }

        $validated = $request->validate([
            'notas' => 'nullable|string',
            'fecha_emision' => 'sometimes|required|date',
        ]);

        $liquidacion->update($validated);

        return response()->json($liquidacion->load(['cliente', 'proveedor', 'viajes']));
    }

    public function destroy($id)
    {
        $liquidacion = Liquidacion::findOrFail($id);
        $liquidacion->delete();

        return response()->json(['message' => 'Liquidación archivada']);
    }

    public function restore($id)
    {
        $liquidacion = Liquidacion::withTrashed()->findOrFail($id);
        $liquidacion->restore();

        return response()->json(['message' => 'Liquidación restaurada']);
    }

    public function viajesDisponibles(Request $request, $id)
    {
        $liquidacion = Liquidacion::findOrFail($id);

        if ($liquidacion->estado !== 'borrador') {
            return response()->json(['message' => 'Solo se pueden consultar viajes disponibles en estado borrador'], 422);
        }

        $query = Viaje::query()
            ->where('estado', '!=', 'cancelado')
            ->where('liquidado', false);

        if ($liquidacion->tipo === 'cliente') {
            $query->where('cliente_id', $liquidacion->cliente_id);
        } else {
            $query->where('proveedor_id', $liquidacion->proveedor_id);
        }

        if ($request->filled('fecha_desde')) {
            $query->whereDate('fecha_salida', '>=', $request->get('fecha_desde'));
        }

        if ($request->filled('fecha_hasta')) {
            $query->whereDate('fecha_salida', '<=', $request->get('fecha_hasta'));
        }

        if ($request->filled('origen')) {
            $query->where('origen', 'like', "%{$request->get('origen')}%");
        }

        if ($request->filled('destino')) {
            $query->where('destino', 'like', "%{$request->get('destino')}%");
        }

        $viajesYaEnLiquidacion = $liquidacion->viajes()->pluck('viajes.id');
        $query->whereNotIn('viajes.id', $viajesYaEnLiquidacion);

        $viajesYaEnMismoTipo = \DB::table('liquidacion_viaje')
            ->join('liquidaciones', 'liquidaciones.id', '=', 'liquidacion_viaje.liquidacion_id')
            ->whereNull('liquidaciones.deleted_at')
            ->where('liquidaciones.tipo', $liquidacion->tipo)
            ->where('liquidaciones.id', '!=', $liquidacion->id)
            ->pluck('liquidacion_viaje.viaje_id');
        $query->whereNotIn('viajes.id', $viajesYaEnMismoTipo);

        $viajes = $query->with(['cliente', 'proveedor', 'unidades', 'chofer', 'documento', 'gastos', 'anticipos'])
            ->orderBy('fecha_salida', 'desc')
            ->get();

        return response()->json($viajes);
    }

    public function agregarViajes(Request $request, $id)
    {
        $liquidacion = Liquidacion::findOrFail($id);

        if ($liquidacion->estado !== 'borrador') {
            return response()->json(['message' => 'Solo se pueden agregar viajes en estado borrador'], 422);
        }

        $validated = $request->validate([
            'viajes' => 'required|array',
            'viajes.*.viaje_id' => 'required|exists:viajes,id',
            'viajes.*.monto' => 'nullable|numeric|min:0',
            'viajes.*.iva_monto' => 'nullable|numeric|min:0',
        ]);

        foreach ($validated['viajes'] as $item) {
            $viaje = Viaje::findOrFail($item['viaje_id']);
            $monto = $item['monto'] ?? ($liquidacion->tipo === 'proveedor'
                ? ($viaje->costo_proveedor_ajustado ?? $viaje->costo_viaje ?? 0)
                : $viaje->precio_pactado);
            $ivaMonto = $item['iva_monto'] ?? 0;

            $liquidacion->viajes()->attach($item['viaje_id'], ['monto' => $monto, 'iva_monto' => $ivaMonto]);
        }

        $this->recalcularTotal($liquidacion);

        return response()->json($liquidacion->load(['cliente', 'proveedor', 'viajes']));
    }

    public function quitarViaje($id, $viajeId)
    {
        $liquidacion = Liquidacion::findOrFail($id);

        if ($liquidacion->estado !== 'borrador') {
            return response()->json(['message' => 'Solo se pueden quitar viajes en estado borrador'], 422);
        }

        $liquidacion->viajes()->detach($viajeId);

        $this->recalcularTotal($liquidacion);

        return response()->json($liquidacion->load(['cliente', 'proveedor', 'viajes']));
    }

    public function actualizarMonto(Request $request, $id, $viajeId)
    {
        $liquidacion = Liquidacion::findOrFail($id);

        if ($liquidacion->estado !== 'borrador') {
            return response()->json(['message' => 'Solo se pueden editar montos en estado borrador'], 422);
        }

        $validated = $request->validate([
            'monto' => 'required|numeric|min:0',
        ]);

        $liquidacion->viajes()->updateExistingPivot($viajeId, ['monto' => $validated['monto']]);

        $this->recalcularTotal($liquidacion);

        return response()->json($liquidacion->load(['cliente', 'proveedor', 'viajes']));
    }

    public function cambiarEstado(Request $request, $id)
    {
        $liquidacion = Liquidacion::findOrFail($id);

        $validated = $request->validate([
            'estado' => 'required|string|in:borrador,pendiente,facturada',
        ]);

        $liquidacion->update(['estado' => $validated['estado']]);

        return response()->json($liquidacion->load(['cliente', 'proveedor', 'viajes']));
    }

    public function updateDetalle(Request $request, $id)
    {
        $liquidacion = Liquidacion::findOrFail($id);

        if ($liquidacion->estado !== 'borrador') {
            return response()->json(['message' => 'Solo se puede editar una liquidación en estado borrador'], 422);
        }

        if ($request->filled('estado') && $request->get('estado') !== 'pendiente') {
            return response()->json(['message' => 'El único cambio de estado permitido es a pendiente'], 422);
        }

        $validated = $request->validate([
            'notas' => 'nullable|string',
            'fecha_emision' => 'required|date',
            'viajes' => 'required|array',
            'viajes.*.viaje_id' => 'required|integer|exists:viajes,id',
            'viajes.*.monto' => 'required|numeric|min:0',
            'viajes.*.iva_monto' => 'required|numeric|min:0',
            'estado' => 'nullable|string|in:pendiente',
        ]);

        $viajeIds = collect($validated['viajes'])->pluck('viaje_id');
        if ($viajeIds->count() !== $viajeIds->unique()->count()) {
            return response()->json(['message' => 'Los viajes no pueden repetirse'], 422);
        }

        $error = null;

        \DB::transaction(function () use (&$error, &$liquidacion, $id, $validated, $viajeIds) {
            $liquidacion = Liquidacion::whereKey($id)->lockForUpdate()->firstOrFail();

            if ($liquidacion->estado !== 'borrador') {
                $error = response()->json(['message' => 'Solo se puede editar una liquidación en estado borrador'], 422);
                return;
            }

            $entityColumn = $liquidacion->tipo === 'cliente' ? 'cliente_id' : 'proveedor_id';
            $entityId = $liquidacion->tipo === 'cliente' ? $liquidacion->cliente_id : $liquidacion->proveedor_id;
            $viajes = Viaje::whereIn('id', $viajeIds)->lockForUpdate()->get();

            if ($viajes->count() !== $viajeIds->count()) {
                $error = response()->json(['message' => 'Uno de los viajes no existe'], 422);
                return;
            }

            foreach ($viajes as $viaje) {
                if ((int) $viaje->{$entityColumn} !== (int) $entityId) {
                    $error = response()->json(['message' => 'Un viaje no pertenece a la entidad de la liquidación'], 422);
                    return;
                }
                if ($viaje->liquidado) {
                    $error = response()->json(['message' => 'Un viaje ya está liquidado'], 422);
                    return;
                }
            }

            $viajesEnOtras = \DB::table('liquidacion_viaje')
                ->join('liquidaciones', 'liquidaciones.id', '=', 'liquidacion_viaje.liquidacion_id')
                ->whereNull('liquidaciones.deleted_at')
                ->where('liquidaciones.tipo', $liquidacion->tipo)
                ->where('liquidaciones.id', '!=', $liquidacion->id)
                ->whereIn('liquidacion_viaje.viaje_id', $viajeIds)
                ->lockForUpdate()
                ->first();

            if ($viajesEnOtras) {
                $error = response()->json(['message' => 'Un viaje ya está incluido en otra liquidación'], 422);
                return;
            }

            $liquidacion->update([
                'notas' => $validated['notas'] ?? null,
                'fecha_emision' => $validated['fecha_emision'],
            ]);

            $sync = $viajeIds->mapWithKeys(function ($viajeId) use ($validated) {
                $item = collect($validated['viajes'])->firstWhere('viaje_id', $viajeId);
                return [$viajeId => [
                    'monto' => $item['monto'],
                    'iva_monto' => $item['iva_monto'],
                ]];
            })->all();

            $liquidacion->viajes()->sync($sync);
            $this->recalcularTotal($liquidacion);

            if (($validated['estado'] ?? null) === 'pendiente') {
                $liquidacion->update(['estado' => 'pendiente']);
                Viaje::whereIn('id', $viajeIds)->update(['liquidado' => true]);
            }
        });

        if ($error) {
            return $error;
        }

        return response()->json($liquidacion->load([
            'cliente',
            'proveedor',
            'viajes',
            'factura',
        ]));
    }

    private function generateNumero(string $tipo): string
    {
        $prefijo = $tipo === 'cliente' ? 'LIQ-C' : 'LIQ-P';
        $ultimo = Liquidacion::withTrashed()->where('numero', 'like', "{$prefijo}-%")
            ->latest('id')
            ->first();

        if ($ultimo && preg_match('/(\d+)$/', $ultimo->numero, $matches)) {
            $siguiente = intval($matches[1]) + 1;
        } else {
            $siguiente = 1;
        }

        return $prefijo.'-'.str_pad($siguiente, 4, '0', STR_PAD_LEFT);
    }

    public function generarFactura(Request $request, $id)
    {
        $liquidacion = Liquidacion::findOrFail($id);

        if ($liquidacion->tipo !== 'cliente') {
            return response()->json(['message' => 'Solo liquidaciones de cliente generan factura'], 422);
        }
        if ($liquidacion->estado !== 'pendiente') {
            return response()->json(['message' => 'Solo liquidaciones pendientes pueden facturarse'], 422);
        }

        $validated = $request->validate([
            'numero' => 'required|string|unique:facturas,numero',
            'tipo' => 'required|in:A,B,C',
            'punto_venta' => 'required|string|max:4|regex:/^\d{4}$/',
            'fecha_emision' => 'required|date',
            'fecha_vencimiento' => 'nullable|date|after_or_equal:fecha_emision',
            'monto_neto' => 'required|numeric|min:0',
            'iva' => 'required|numeric|min:0',
            'monto_total' => 'required|numeric|min:0',
            'cae' => 'nullable|string|max:20',
            'cae_vencimiento' => 'nullable|date|after_or_equal:fecha_emision',
        ]);

        \DB::transaction(function () use ($liquidacion, $validated) {
            $factura = Factura::create(array_merge($validated, [
                'liquidacion_id' => $liquidacion->id,
                'estado' => 'emitida',
            ]));

            // Actualizar viajes vinculados
            $liquidacion->viajes()->update(['estado_facturacion' => 'facturado']);

            // Cambiar estado liquidación
            $liquidacion->update(['estado' => 'facturada']);
        });

        return response()->json($liquidacion->load(['factura', 'viajes']), 201);
    }

    private function recalcularTotal(Liquidacion $liquidacion): void
    {
        $total = \DB::table('liquidacion_viaje')
            ->where('liquidacion_id', $liquidacion->id)
            ->sum('monto');
        $liquidacion->update(['total' => $total]);
    }
}
