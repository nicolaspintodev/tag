<?php

namespace App\Http\Controllers;

use App\Models\Factura;
use Illuminate\Http\Request;

class FacturaController extends Controller
{
    public function index(Request $request)
    {
        $query = Factura::query();

        if ($request->boolean('archivados')) {
            $query->onlyTrashed();
        }

        if ($request->has('liquidacion_id')) {
            $query->where('liquidacion_id', $request->get('liquidacion_id'));
        }

        if ($request->filled('tipo')) {
            $query->where('tipo', $request->get('tipo'));
        }

        if ($request->filled('estado')) {
            $query->where('estado', $request->get('estado'));
        }

        if ($request->filled('fecha_desde')) {
            $query->whereDate('fecha_emision', '>=', $request->get('fecha_desde'));
        }

        if ($request->filled('fecha_hasta')) {
            $query->whereDate('fecha_emision', '<=', $request->get('fecha_hasta'));
        }

        if ($request->filled('estado_facturacion')) {
            $query->whereHas('liquidacion.viajes', function ($q) use ($request) {
                $q->where('estado_facturacion', $request->get('estado_facturacion'));
            });
        }

        return response()->json(
            $query->with(['liquidacion', 'liquidacion.cliente', 'liquidacion.proveedor', 'liquidacion.viajes'])
                ->orderBy('fecha_emision', 'desc')
                ->paginate(10)
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'liquidacion_id' => 'required|exists:liquidaciones,id',
            'numero' => 'required|string|unique:facturas,numero',
            'tipo' => 'required|in:A,B,C,M',
            'punto_venta' => 'required|string|max:4|regex:/^\d{4}$/',
            'fecha_emision' => 'required|date',
            'fecha_vencimiento' => 'nullable|date|after_or_equal:fecha_emision',
            'monto_neto' => 'required|numeric|min:0',
            'iva' => 'required|numeric|min:0',
            'monto_total' => 'required|numeric|min:0',
            'estado' => 'nullable|in:borrador,emitida,anulada,pagada',
            'cae' => 'nullable|string|max:20',
            'cae_vencimiento' => 'nullable|date|after_or_equal:fecha_emision',
            'notas' => 'nullable|string',
        ]);

        $factura = Factura::create($validated);

        return response()->json($factura->load('liquidacion'), 201);
    }

    public function show($id)
    {
        $factura = Factura::withTrashed()
            ->with(['liquidacion', 'liquidacion.cliente', 'liquidacion.proveedor', 'liquidacion.viajes'])
            ->findOrFail($id);

        return response()->json($factura);
    }

    public function update(Request $request, $id)
    {
        $factura = Factura::withTrashed()->findOrFail($id);

        $validated = $request->validate([
            'numero' => 'sometimes|required|string|unique:facturas,numero,'.$id,
            'tipo' => 'sometimes|required|in:A,B,C,M',
            'punto_venta' => 'sometimes|required|string|max:4|regex:/^\d{4}$/',
            'fecha_emision' => 'sometimes|required|date',
            'fecha_vencimiento' => 'nullable|date|after_or_equal:fecha_emision',
            'monto_neto' => 'sometimes|required|numeric|min:0',
            'iva' => 'sometimes|required|numeric|min:0',
            'monto_total' => 'sometimes|required|numeric|min:0',
            'estado' => 'sometimes|required|in:borrador,emitida,anulada,pagada',
            'cae' => 'nullable|string|max:20',
            'cae_vencimiento' => 'nullable|date|after_or_equal:fecha_emision',
            'notas' => 'nullable|string',
        ]);

        $factura->update($validated);

        return response()->json($factura->load('liquidacion'));
    }

    public function destroy($id)
    {
        $factura = Factura::findOrFail($id);
        $factura->delete();

        return response()->json(['message' => 'Factura archivada']);
    }

    public function restore($id)
    {
        $factura = Factura::withTrashed()->findOrFail($id);
        $factura->restore();

        return response()->json(['message' => 'Factura restaurada']);
    }
}
