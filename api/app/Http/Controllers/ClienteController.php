<?php

namespace App\Http\Controllers;

use App\Models\Cliente;
use App\Rules\Cuit;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ClienteController extends Controller
{
    public function index(Request $request)
    {
        $query = Cliente::query();

        if ($request->boolean('archivados')) {
            $query->onlyTrashed();
        }

        if ($request->has('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('razon_social', 'like', "%{$search}%")
                    ->orWhere('nombre_administrativo', 'like', "%{$search}%")
                    ->orWhere('cuit', 'like', "%{$search}%")
                    ->orWhere('contacto', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        return response()->json(
            $query->orderByRaw('COALESCE(nombre_administrativo, razon_social) asc')->get()
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate($this->rules());

        $cliente = Cliente::create($validated);

        return response()->json($cliente, 201);
    }

    public function show($id)
    {
        $cliente = Cliente::withTrashed()->findOrFail($id);

        return response()->json($cliente);
    }

    public function update(Request $request, $id)
    {
        $cliente = Cliente::withTrashed()->findOrFail($id);

        $validated = $request->validate($this->rules((int) $id));

        $cliente->update($validated);

        return response()->json($cliente);
    }

    private function rules(?int $id = null): array
    {
        $sometimes = $id ? 'sometimes|' : '';

        return [
            'razon_social' => $sometimes.'required|string',
            'nombre_administrativo' => 'nullable|string',
            'cuit' => array_filter([
                $id ? 'sometimes' : null,
                'required',
                'string',
                Rule::unique('clientes', 'cuit')->ignore($id),
                new Cuit,
            ]),
            'direccion' => 'nullable|string',
            'telefono' => 'nullable|string',
            'email' => 'nullable|email',
            'contacto' => 'nullable|string',
            'notas' => 'nullable|string',
            'condicion_iva' => ['nullable', Rule::in(Cliente::CONDICIONES_IVA)],
            'ingresos_brutos' => 'nullable|string',
            'localidad' => 'nullable|string',
            'provincia' => 'nullable|string',
            'codigo_postal' => 'nullable|string',
        ];
    }

    public function destroy($id)
    {
        $cliente = Cliente::findOrFail($id);
        $cliente->delete();

        return response()->json(['message' => 'Cliente archivado exitosamente']);
    }

    public function restore($id)
    {
        $cliente = Cliente::withTrashed()->findOrFail($id);
        $cliente->restore();

        return response()->json(['message' => 'Cliente restaurado exitosamente']);
    }
}
