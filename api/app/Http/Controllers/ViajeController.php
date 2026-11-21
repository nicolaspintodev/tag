<?php

namespace App\Http\Controllers;

use App\Models\Carga;
use App\Models\Viaje;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ViajeController extends Controller
{
    public function index(Request $request)
    {
        $query = Viaje::select('viajes.*')->with([
            'cliente',
            'proveedor',
            'tractora',
            'acoplado',
            'unidades',
            'chofer',
            'carga',
            'gastos',
            'anticipos',
            'documento',
            'liquidaciones',
        ]);

        if ($request->boolean('archivados')) {
            $query->onlyTrashed();
        }

        if ($request->filled('search')) {
            $search = $request->get('search');
            $cleanSearch = preg_replace('/^[PT]-0*/i', '', $search);
            $query->where(function ($q) use ($search, $cleanSearch) {
                $q->where('viajes.id', 'like', "%{$cleanSearch}%")
                    ->orWhere('origen', 'like', "%{$search}%")
                    ->orWhere('destino', 'like', "%{$search}%")
                    ->orWhereHas('chofer', function ($cq) use ($search) {
                        $cq->where('nombre', 'like', "%{$search}%")
                            ->orWhere('apellido', 'like', "%{$search}%");
                    })
                    ->orWhereHas('cliente', function ($pq) use ($search) {
                        $pq->where('razon_social', 'like', "%{$search}%");
                    });
            });
        }

        if ($request->filled('fecha_desde')) {
            $query->whereDate('fecha_salida', '>=', $request->get('fecha_desde'));
        }

        if ($request->filled('fecha_hasta')) {
            $query->whereDate('fecha_salida', '<=', $request->get('fecha_hasta'));
        }

        if ($request->filled('estado_facturacion')) {
            $query->where('estado_facturacion', $request->get('estado_facturacion'));
        }

        if ($request->filled('estado')) {
            $query->where('estado', $request->get('estado'));
        }

        if ($request->filled('facturado') && $request->boolean('facturado')) {
            $query->where('facturado', true);
        }

        if ($request->filled('liquidado') && $request->boolean('liquidado')) {
            $query->where('liquidado', true);
        }

        if ($request->filled('sort_by') && $request->filled('sort_dir')) {
            $sortBy = $request->get('sort_by');
            $sortDir = strtolower($request->get('sort_dir'));

            if ($sortBy === 'estado' && in_array($sortDir, ['planificado', 'iniciado', 'terminado'])) {
                $query->orderByRaw('CASE WHEN estado = ? THEN 0 ELSE 1 END', [$sortDir])
                    ->orderBy('viajes.id', 'desc');
            } else {
                $dir = $sortDir === 'asc' ? 'asc' : 'desc';
                if ($sortBy === 'id') {
                    $query->orderBy('viajes.id', $dir);
                } elseif ($sortBy === 'cliente') {
                    $query->leftJoin('clientes', 'viajes.cliente_id', '=', 'clientes.id')
                        ->orderBy('clientes.razon_social', $dir);
                } elseif ($sortBy === 'proveedor') {
                    $query->leftJoin('proveedores', 'viajes.proveedor_id', '=', 'proveedores.id')
                        ->orderBy('proveedores.razon_social', $dir);
                } elseif ($sortBy === 'chofer') {
                    $query->leftJoin('choferes', 'viajes.chofer_id', '=', 'choferes.id')
                        ->orderBy('choferes.nombre', $dir);
                } elseif ($sortBy === 'unidad') {
                    $query->leftJoin('viaje_unidad', 'viajes.id', '=', 'viaje_unidad.viaje_id')
                        ->leftJoin('unidades', 'viaje_unidad.unidad_id', '=', 'unidades.id')
                        ->orderBy('unidades.marca', $dir)->orderBy('unidades.patente', $dir);
                } elseif ($sortBy === 'ruta') {
                    $query->orderBy('origen', $dir);
                } elseif ($sortBy === 'precio_pactado') {
                    $query->orderBy('viajes.precio_pactado', $dir);
                } elseif ($sortBy === 'costo_proveedor') {
                    $query->orderBy('viajes.costo_proveedor', $dir);
                } else {
                    $query->orderBy('viajes.id', 'desc');
                }
            }
        } else {
            $query->orderBy('viajes.id', 'desc');
        }

        $viajes = $query->get();

        return response()->json($viajes);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'cliente_id' => 'nullable|exists:clientes,id',
            'proveedor_id' => 'nullable|exists:proveedores,id',
            'tractora_id' => 'nullable|exists:unidades,id',
            'acoplado_id' => 'nullable|exists:unidades,id',
            'origen' => 'required|string',
            'destino' => 'required|string',
            'precio_pactado' => 'required|numeric|min:0',
            'costo_proveedor' => 'nullable|numeric|min:0',
            'unidades' => 'nullable|array',
            'unidades.*' => 'exists:unidades,id',
            'chofer_id' => 'required|exists:choferes,id',
            'km_recorrido' => 'nullable|integer|min:0',
            'fecha_salida' => 'required|date',
            'hora_salida' => 'nullable|string',
            'fecha_llegada' => 'nullable|date',
            'hora_llegada' => 'nullable|string',
            'observaciones' => 'nullable|string',
            'estado' => 'nullable|in:planificado,iniciado,terminado',
            'facturado' => 'nullable|boolean',
            'liquidado' => 'nullable|boolean',

            // Tarifa
            'tipo_tarifa' => 'nullable|string',
            'tarifa_valor' => 'nullable|numeric|min:0',
            'tarifa_base' => 'nullable|numeric|min:0',

            // Carga
            'carga.peso_kg' => 'nullable|numeric|min:0',

            // Reglas de negocio
            'chofer_id' => ['required', 'exists:choferes,id', function ($attribute, $value, $fail) use ($request) {
                $estado = $request->input('estado', 'planificado');
                if ($estado === 'iniciado') {
                    $conflict = Viaje::where('chofer_id', $value)
                        ->where('estado', 'iniciado')
                        ->exists();
                    if ($conflict) {
                        $fail('El chofer ya tiene un viaje Iniciado.');
                    }
                }
            }],
            'tractora_id' => ['nullable', 'exists:unidades,id', function ($attribute, $value, $fail) use ($request) {
                $estado = $request->input('estado', 'planificado');
                if ($estado === 'iniciado') {
                    if (empty($value)) {
                        $fail('Un viaje Iniciado debe tener una tractora asignada.');
                    }
                    $conflict = Viaje::where('tractora_id', $value)
                        ->where('estado', 'iniciado')
                        ->exists();
                    if ($conflict) {
                        $fail('La tractora ya está en un viaje Iniciado.');
                    }
                }
            }],
            'acoplado_id' => ['nullable', 'exists:unidades,id', function ($attribute, $value, $fail) use ($request) {
                $estado = $request->input('estado', 'planificado');
                $tractoraId = $request->input('tractora_id');
                if ($estado === 'iniciado') {
                    if (! empty($value) && empty($tractoraId)) {
                        $fail('No se puede asignar acoplado sin tractora.');
                    }
                    if (! empty($value)) {
                        $conflict = Viaje::where('acoplado_id', $value)
                            ->where('estado', 'iniciado')
                            ->exists();
                        if ($conflict) {
                            $fail('El acoplado ya está en un viaje Iniciado.');
                        }
                    }
                } else {
                    // Validar acoplado sin tractora en cualquier estado
                    if (! empty($value) && empty($tractoraId)) {
                        $fail('No se puede asignar acoplado sin tractora.');
                    }
                }
            }],
            'estado' => ['nullable', 'in:planificado,iniciado,terminado', function ($attribute, $value, $fail) use ($request) {
                $facturado = (bool) $request->input('facturado', false);
                $liquidado = (bool) $request->input('liquidado', false);
                if (($facturado || $liquidado) && $value !== 'terminado') {
                    $fail('Solo los viajes Terminados pueden ser facturados/liquidados.');
                }
            }],
            'facturado' => ['nullable', 'boolean', function ($attribute, $value, $fail) use ($request) {
                $estado = $request->input('estado', 'planificado');
                if ($value && $estado !== 'terminado') {
                    $fail('Solo los viajes Terminados pueden ser facturados.');
                }
            }],
            'liquidado' => ['nullable', 'boolean', function ($attribute, $value, $fail) use ($request) {
                $estado = $request->input('estado', 'planificado');
                if ($value && $estado !== 'terminado') {
                    $fail('Solo los viajes Terminados pueden ser liquidados.');
                }
            }],
        ]);

        if (empty($validated['estado'])) {
            $validated['estado'] = 'planificado';
        }

        $viaje = Viaje::create([
            'chofer_id' => $validated['chofer_id'],
            'cliente_id' => $validated['cliente_id'] ?? null,
            'proveedor_id' => $validated['proveedor_id'] ?? null,
            'tractora_id' => $validated['tractora_id'] ?? null,
            'acoplado_id' => $validated['acoplado_id'] ?? null,
            'estado' => $validated['estado'],
            'facturado' => $validated['facturado'] ?? false,
            'liquidado' => $validated['liquidado'] ?? false,
            'origen' => $validated['origen'],
            'destino' => $validated['destino'],
            'fecha_salida' => $validated['fecha_salida'],
            'hora_salida' => $validated['hora_salida'] ?? null,
            'fecha_llegada' => $validated['fecha_llegada'] ?? null,
            'hora_llegada' => $validated['hora_llegada'] ?? null,
            'precio_pactado' => $validated['precio_pactado'],
            'costo_proveedor' => $validated['costo_proveedor'] ?? 0,
            'km_recorrido' => $validated['km_recorrido'] ?? 0,
            'tipo_tarifa' => $validated['tipo_tarifa'] ?? null,
            'tarifa_valor' => $validated['tarifa_valor'] ?? null,
            'tarifa_base' => $validated['tarifa_base'] ?? null,
            'observaciones' => $validated['observaciones'] ?? null,
        ]);

        if (! empty($validated['unidades'])) {
            $viaje->unidades()->sync($validated['unidades']);
        }

        if (! empty($request->input('carga'))) {
            Carga::create([
                'viaje_id' => $viaje->id,
                'descripcion' => $validated['carga']['descripcion'] ?? null,
                'tipo_carga' => $validated['carga']['tipo_carga'] ?? null,
                'peso_kg' => $validated['carga']['peso_kg'] ?? null,
                'cantidad_bultos' => $validated['carga']['cantidad_bultos'] ?? null,
                'requiere_refrigeracion' => $validated['carga']['requiere_refrigeracion'] ?? false,
            ]);
        }

        $viaje->load(['cliente', 'proveedor', 'unidades', 'chofer', 'carga', 'gastos', 'anticipos', 'documento', 'liquidaciones']);

        return response()->json($viaje, 201);
    }

    public function update(Request $request, Viaje $viaje)
    {
        $validated = $request->validate([
            'cliente_id' => 'nullable|exists:clientes,id',
            'proveedor_id' => 'nullable|exists:proveedores,id',
            'tractora_id' => 'nullable|exists:unidades,id',
            'acoplado_id' => 'nullable|exists:unidades,id',
            'origen' => 'nullable|string',
            'destino' => 'nullable|string',
            'precio_pactado' => 'nullable|numeric|min:0',
            'costo_proveedor' => 'nullable|numeric|min:0',
            'unidades' => 'nullable|array',
            'unidades.*' => 'exists:unidades,id',
            'chofer_id' => 'nullable|exists:choferes,id',
            'km_recorrido' => 'nullable|integer|min:0',
            'fecha_salida' => 'required|date',
            'hora_salida' => 'nullable|string',
            'fecha_llegada' => 'nullable|date',
            'hora_llegada' => 'nullable|string',
            'observaciones' => 'nullable|string',
            'estado' => 'nullable|in:planificado,iniciado,terminado',
            'facturado' => 'nullable|boolean',
            'liquidado' => 'nullable|boolean',

            // Tarifa
            'tipo_tarifa' => 'nullable|string',
            'tarifa_valor' => 'nullable|numeric|min:0',
            'tarifa_base' => 'nullable|numeric|min:0',

            // Carga
            'carga.peso_kg' => 'nullable|numeric|min:0',

            // Reglas de negocio
            'chofer_id' => ['nullable', 'exists:choferes,id', function ($attribute, $value, $fail) use ($request, $viaje) {
                $estado = $request->input('estado', $viaje->estado->value);
                if ($estado === 'iniciado' && ! empty($value)) {
                    $conflict = Viaje::where('chofer_id', $value)
                        ->where('estado', 'iniciado')
                        ->where('id', '!=', $viaje->id)
                        ->exists();
                    if ($conflict) {
                        $fail('El chofer ya tiene un viaje Iniciado.');
                    }
                }
            }],
            'tractora_id' => ['nullable', 'exists:unidades,id', function ($attribute, $value, $fail) use ($request, $viaje) {
                $estado = $request->input('estado', $viaje->estado->value);
                $tractoraId = $request->input('tractora_id', $viaje->tractora_id);
                if ($estado === 'iniciado') {
                    if (empty($value) && empty($tractoraId)) {
                        $fail('Un viaje Iniciado debe tener una tractora asignada.');
                    }
                    $conflict = Viaje::where('tractora_id', $value)
                        ->where('estado', 'iniciado')
                        ->where('id', '!=', $viaje->id)
                        ->exists();
                    if ($conflict) {
                        $fail('La tractora ya está en un viaje Iniciado.');
                    }
                }
            }],
            'acoplado_id' => ['nullable', 'exists:unidades,id', function ($attribute, $value, $fail) use ($request, $viaje) {
                $estado = $request->input('estado', $viaje->estado->value);
                $tractoraId = $request->input('tractora_id', $viaje->tractora_id);
                if ($estado === 'iniciado') {
                    if (! empty($value) && empty($tractoraId)) {
                        $fail('No se puede asignar acoplado sin tractora.');
                    }
                    if (! empty($value)) {
                        $conflict = Viaje::where('acoplado_id', $value)
                            ->where('estado', 'iniciado')
                            ->where('id', '!=', $viaje->id)
                            ->exists();
                        if ($conflict) {
                            $fail('El acoplado ya está en un viaje Iniciado.');
                        }
                    }
                } else {
                    // Validar acoplado sin tractora en cualquier estado
                    if (! empty($value) && empty($tractoraId)) {
                        $fail('No se puede asignar acoplado sin tractora.');
                    }
                }
            }],
            'estado' => ['nullable', 'in:planificado,iniciado,terminado', function ($attribute, $value, $fail) use ($request, $viaje) {
                $facturado = (bool) $request->input('facturado', $viaje->facturado);
                $liquidado = (bool) $request->input('liquidado', $viaje->liquidado);
                if (($facturado || $liquidado) && $value !== 'terminado') {
                    $fail('Solo los viajes Terminados pueden ser facturados/liquidados.');
                }
            }],
            'facturado' => ['nullable', 'boolean', function ($attribute, $value, $fail) use ($request, $viaje) {
                $estado = $request->input('estado', $viaje->estado->value);
                if ($value && $estado !== 'terminado') {
                    $fail('Solo los viajes Terminados pueden ser facturados.');
                }
            }],
            'liquidado' => ['nullable', 'boolean', function ($attribute, $value, $fail) use ($request, $viaje) {
                $estado = $request->input('estado', $viaje->estado->value);
                if ($value && $estado !== 'terminado') {
                    $fail('Solo los viajes Terminados pueden ser liquidados.');
                }
            }],
        ]);

        $updateData = [
            'chofer_id' => $validated['chofer_id'] ?? $viaje->chofer_id,
            'cliente_id' => $validated['cliente_id'] ?? $viaje->cliente_id,
            'proveedor_id' => $validated['proveedor_id'] ?? $viaje->proveedor_id,
            'tractora_id' => $validated['tractora_id'] ?? $viaje->tractora_id,
            'acoplado_id' => $validated['acoplado_id'] ?? $viaje->acoplado_id,
            'estado' => $validated['estado'] ?? $viaje->estado,
            'origen' => $validated['origen'] ?? $viaje->origen,
            'destino' => $validated['destino'] ?? $viaje->destino,
            'fecha_salida' => $validated['fecha_salida'],
            'hora_salida' => $validated['hora_salida'] ?? $viaje->hora_salida,
            'fecha_llegada' => $validated['fecha_llegada'] ?? $viaje->fecha_llegada,
            'hora_llegada' => $validated['hora_llegada'] ?? $viaje->hora_llegada,
            'precio_pactado' => $validated['precio_pactado'] ?? $viaje->precio_pactado,
            'costo_proveedor' => $validated['costo_proveedor'] ?? $viaje->costo_proveedor,
            'km_recorrido' => $validated['km_recorrido'] ?? $viaje->km_recorrido,
            'tipo_tarifa' => $validated['tipo_tarifa'] ?? $viaje->tipo_tarifa,
            'tarifa_valor' => $validated['tarifa_valor'] ?? $viaje->tarifa_valor,
            'tarifa_base' => $validated['tarifa_base'] ?? $viaje->tarifa_base,
            'observaciones' => $validated['observaciones'] ?? $viaje->observaciones,
        ];

        // Solo permitir facturado/liquidado si estado = terminado
        if ($validated['estado'] === 'terminado' || $viaje->estado === 'terminado') {
            if (array_key_exists('facturado', $validated)) {
                $updateData['facturado'] = $validated['facturado'];
            }
            if (array_key_exists('liquidado', $validated)) {
                $updateData['liquidado'] = $validated['liquidado'];
            }
        }

        $viaje->update($updateData);

        if (array_key_exists('unidades', $validated)) {
            $viaje->unidades()->sync($validated['unidades'] ?? []);
        }

        if (! empty($request->input('carga'))) {
            $cargaData = [
                'descripcion' => $validated['carga']['descripcion'] ?? null,
                'tipo_carga' => $validated['carga']['tipo_carga'] ?? null,
                'peso_kg' => $validated['carga']['peso_kg'] ?? null,
                'cantidad_bultos' => $validated['carga']['cantidad_bultos'] ?? null,
                'requiere_refrigeracion' => $validated['carga']['requiere_refrigeracion'] ?? false,
            ];

            if ($viaje->carga) {
                $viaje->carga->update($cargaData);
            } else {
                $cargaData['viaje_id'] = $viaje->id;
                Carga::create($cargaData);
            }
        }

        $viaje->refresh();
        $viaje->load(['cliente', 'proveedor', 'unidades', 'chofer', 'carga', 'gastos', 'anticipos', 'documento', 'liquidaciones']);

        return response()->json($viaje, 200);
    }

    public function show($id)
    {
        $viaje = Viaje::withTrashed()->with([
            'cliente',
            'proveedor',
            'unidades',
            'chofer',
            'carga',
            'gastos',
            'anticipos',
            'documento',
            'liquidaciones',
        ])->findOrFail($id);

        return response()->json($viaje);
    }

    public function destroy(Viaje $viaje)
    {
        $viaje->delete();

        return response()->json(['message' => 'Viaje archivado']);
    }

    public function restore($id)
    {
        $viaje = Viaje::withTrashed()->findOrFail($id);
        $viaje->restore();

        return response()->json(['message' => 'Viaje restaurado']);
    }

    public function cambiarEstado(Request $request, Viaje $viaje)
    {
        $validated = $request->validate([
            'estado' => 'required|string|in:planificado,iniciado,terminado',
        ]);

        $viaje->update(['estado' => $validated['estado']]);

        return response()->json($viaje->fresh(['cliente', 'proveedor', 'unidades', 'chofer']));
    }

    public function disponiblesParaLiquidacion(Request $request)
    {
        $validated = $request->validate([
            'tipo' => 'required|string|in:cliente,proveedor',
            'cliente_id' => 'required_if:tipo,cliente|exists:clientes,id',
            'proveedor_id' => 'required_if:tipo,proveedor|exists:proveedores,id',
            'fecha_desde' => 'nullable|date',
            'fecha_hasta' => 'nullable|date',
            'ordenar_precio' => 'nullable|string|in:asc,desc',
        ]);

        $tipo = $validated['tipo'];
        $targetId = $tipo === 'cliente' ? $validated['cliente_id'] : $validated['proveedor_id'];

        $query = Viaje::query()
            ->where('liquidado', false);

        if ($tipo === 'cliente') {
            $query->where('cliente_id', $targetId);
        } else {
            $query->where('proveedor_id', $targetId);
        }

        // Excluir viajes ya en otra liquidación del mismo tipo (excluir archivadas)
        $subQuery = DB::table('liquidacion_viaje')
            ->join('liquidaciones', 'liquidaciones.id', '=', 'liquidacion_viaje.liquidacion_id')
            ->where('liquidaciones.tipo', $tipo)
            ->whereNull('liquidaciones.deleted_at')
            ->select('liquidacion_viaje.viaje_id');

        $query->whereNotIn('viajes.id', $subQuery);

        if ($request->filled('fecha_desde')) {
            $query->whereDate('fecha_salida', '>=', $validated['fecha_desde']);
        }
        if ($request->filled('fecha_hasta')) {
            $query->whereDate('fecha_salida', '<=', $validated['fecha_hasta']);
        }

        $orden = $validated['ordenar_precio'] ?? 'desc';
        $precioColumn = $tipo === 'cliente' ? 'precio_pactado' : 'costo_proveedor';
        $query->orderBy($precioColumn, $orden === 'asc' ? 'asc' : 'desc');

        $viajes = $query->with(['cliente', 'proveedor', 'unidades', 'chofer', 'documento', 'gastos', 'anticipos'])
            ->get();

        return response()->json($viajes);
    }

    public function disponiblesPorEntidad(Request $request)
    {
        $validated = $request->validate([
            'tipo' => 'required|string|in:cliente,proveedor',
            'fecha_desde' => 'nullable|date',
            'fecha_hasta' => 'nullable|date',
        ]);

        $tipo = $validated['tipo'];
        $column = $tipo === 'cliente' ? 'cliente_id' : 'proveedor_id';

        $query = Viaje::query()
            ->where('liquidado', false);

        $subQuery = \DB::table('liquidacion_viaje')
            ->join('liquidaciones', 'liquidaciones.id', '=', 'liquidacion_viaje.liquidacion_id')
            ->where('liquidaciones.tipo', $tipo)
            ->whereNull('liquidaciones.deleted_at')
            ->select('liquidacion_viaje.viaje_id');
        $query->whereNotIn('viajes.id', $subQuery);

        if ($request->filled('fecha_desde')) {
            $query->whereDate('fecha_salida', '>=', $validated['fecha_desde']);
        }
        if ($request->filled('fecha_hasta')) {
            $query->whereDate('fecha_salida', '<=', $validated['fecha_hasta']);
        }

        $counts = $query->selectRaw("{$column} as id, count(*) as cantidad")
            ->whereNotNull($column)
            ->groupBy($column)
            ->orderBy('cantidad', 'desc')
            ->get()
            ->map(fn ($r) => ['id' => (int) $r->id, 'cantidad' => (int) $r->cantidad])
            ->values();

        return response()->json($counts);
    }
}
