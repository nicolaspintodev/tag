<?php

namespace App\Models;

use App\Enums\EstadoViaje;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Validation\ValidationException;

class Viaje extends Model
{
    use SoftDeletes;

    protected static function booted(): void
    {
        static::creating(function (Viaje $viaje) {
            if (is_null($viaje->nro_viaje)) {
                $viaje->nro_viaje = (self::max('nro_viaje') ?? 0) + 1;
            }
        });

        static::saving(function (Viaje $viaje) {
            // Auto-set terminado cuando se marcan facturado/liquidado
            if (($viaje->isDirty('facturado') && $viaje->facturado) ||
                ($viaje->isDirty('liquidado') && $viaje->liquidado)) {
                $viaje->estado = EstadoViaje::TERMINADO;
            }

            // Validar reglas de negocio
            $viaje->validateBusinessRules();
        });
    }

    protected $table = 'viajes';

    protected $appends = ['codigo_viaje', 'costo_proveedor_ajustado'];

    public function getCodigoViajeAttribute()
    {
        $tipo = $this->proveedor_id !== null ? 'T' : 'P';

        return $tipo.'-'.str_pad($this->id, 5, '0', STR_PAD_LEFT);
    }

    protected $fillable = [
        'nro_viaje',
        'chofer_id',
        'cliente_id',
        'proveedor_id',
        'tractora_id',
        'acoplado_id',
        'estado',
        'facturado',
        'liquidado',
        'estado_facturacion',
        'origen',
        'destino',
        'fecha_salida',
        'hora_salida',
        'fecha_llegada',
        'hora_llegada',
        'precio_pactado',
        'costo_proveedor',
        'costo_viaje',
        'km_recorrido',
        'tipo_tarifa',
        'tarifa_valor',
        'tarifa_base',
        'observaciones',
        'created_by',
        'updated_by',
    ];

    protected function casts(): array
    {
        return [
            'estado' => EstadoViaje::class,
            'facturado' => 'boolean',
            'liquidado' => 'boolean',
            'estado_facturacion' => 'string',
            'fecha_salida' => 'date',
            'fecha_llegada' => 'date',
            'precio_pactado' => 'decimal:2',
            'costo_proveedor' => 'decimal:2',
            'costo_viaje' => 'decimal:2',
            'km_recorrido' => 'integer',
            'tarifa_valor' => 'decimal:2',
            'tarifa_base' => 'decimal:2',
        ];
    }

    public function getCostoProveedorAjustadoAttribute(): float
    {
        $gastos = $this->relationLoaded('gastos') ? $this->gastos : $this->gastos()->withoutTrashed()->get();
        $anticipos = $this->relationLoaded('anticipos') ? $this->anticipos->sum('monto') : $this->anticipos()->withoutTrashed()->sum('monto');

        $propioReintegro = $gastos->where('clase', 'propio')->where('reintegro', true)->sum('monto');
        $terceroReintegro = $gastos->where('clase', 'proveedor')->where('reintegro', true)->sum('monto');

        $costoProveedorBase = $this->costo_proveedor ?? 0;

        return (float) $costoProveedorBase - (float) $anticipos + (float) $terceroReintegro;
    }

    public function getFacturadoAttribute(): bool
    {
        return (bool) ($this->attributes['facturado'] ?? false);
    }

    public function getLiquidadoAttribute(): bool
    {
        return (bool) ($this->attributes['liquidado'] ?? false);
    }

    public function getPuedeFacturarseAttribute(): bool
    {
        return $this->estado->value === 'terminado' && ! $this->attributes['facturado'];
    }

    public function getPuedeLiquidarseAttribute(): bool
    {
        return $this->estado->value === 'terminado' && ! $this->attributes['liquidado'];
    }

    // ---------- Relaciones ----------

    public function unidades(): BelongsToMany
    {
        return $this->belongsToMany(Unidad::class, 'viaje_unidad');
    }

    // Accesor retrocompatible: primera unidad del viaje
    public function getUnidadAttribute()
    {
        return $this->unidades->first();
    }

    public function chofer(): BelongsTo
    {
        return $this->belongsTo(Chofer::class);
    }

    public function cliente(): BelongsTo
    {
        return $this->belongsTo(Cliente::class);
    }

    public function proveedor(): BelongsTo
    {
        return $this->belongsTo(Proveedor::class);
    }

    public function tractora(): BelongsTo
    {
        return $this->belongsTo(Unidad::class, 'tractora_id');
    }

    public function acoplado(): BelongsTo
    {
        return $this->belongsTo(Unidad::class, 'acoplado_id');
    }

    public function carga(): HasOne
    {
        return $this->hasOne(Carga::class);
    }

    public function anticipos(): HasMany
    {
        return $this->hasMany(Anticipo::class);
    }

    public function gastos(): HasMany
    {
        return $this->hasMany(Gasto::class);
    }

    public function documento(): HasOne
    {
        return $this->hasOne(Documento::class);
    }

    public function liquidaciones(): BelongsToMany
    {
        return $this->belongsToMany(Liquidacion::class, 'liquidacion_viaje', 'viaje_id', 'liquidacion_id')
            ->withPivot('monto')
            ->withTimestamps();
    }

    // ---------- Costo ----------

    public function recalcularCostoViaje(): void
    {
        $gastos = $this->gastos()->withoutTrashed()->get();
        $anticipos = $this->anticipos()->withoutTrashed()->sum('monto');

        $propioSinReintegro = $gastos->where('clase', 'propio')->where('reintegro', false)->sum('monto');
        $terceroReintegro = $gastos->where('clase', 'proveedor')->where('reintegro', true)->sum('monto');

        $costoProveedorBase = $this->costo_proveedor ?? 0;

        $this->costo_viaje = $costoProveedorBase - $anticipos + $propioSinReintegro + $terceroReintegro;
        $this->save();
    }

    // ---------- Auditoría ----------

    public function creador(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function modificador(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function validateBusinessRules(): void
    {
        $errors = [];

        // Regla: iniciado requiere chofer Y tractora
        if ($this->estado === EstadoViaje::INICIADO) {
            if (empty($this->chofer_id)) {
                $errors['chofer_id'] = 'Un viaje Iniciado debe tener un chofer asignado.';
            }
            if (empty($this->tractora_id)) {
                $errors['tractora_id'] = 'Un viaje Iniciado debe tener una tractora asignada.';
            }

            // Exclusividad de recursos solo en iniciado
            $this->validateResourceExclusivity($errors);
        }

        // Regla: no acoplado sin tractora
        if ($this->acoplado_id && empty($this->tractora_id)) {
            $errors['acoplado_id'] = 'No se puede asignar acoplado sin tractora.';
        }

        // Regla: facturado/liquidado solo en terminado
        if (($this->facturado || $this->liquidado) && $this->estado !== EstadoViaje::TERMINADO) {
            $errors['estado'] = 'Solo los viajes Terminados pueden ser facturados/liquidados.';
        }

        if (!empty($errors)) {
            throw ValidationException::withMessages($errors);
        }
    }

    protected function validateResourceExclusivity(array &$errors): void
    {
        if ($this->chofer_id) {
            $existing = self::where('chofer_id', $this->chofer_id)
                ->where('estado', EstadoViaje::INICIADO)
                ->where('id', '!=', $this->id ?? 0)
                ->exists();
            if ($existing) {
                $errors['chofer_id'] = 'El chofer ya tiene un viaje Iniciado.';
            }
        }

        if ($this->tractora_id) {
            $existing = self::where('tractora_id', $this->tractora_id)
                ->where('estado', EstadoViaje::INICIADO)
                ->where('id', '!=', $this->id ?? 0)
                ->exists();
            if ($existing) {
                $errors['tractora_id'] = 'La tractora ya está en un viaje Iniciado.';
            }
        }

        if ($this->acoplado_id) {
            $existing = self::where('acoplado_id', $this->acoplado_id)
                ->where('estado', EstadoViaje::INICIADO)
                ->where('id', '!=', $this->id ?? 0)
                ->exists();
            if ($existing) {
                $errors['acoplado_id'] = 'El acoplado ya está en un viaje Iniciado.';
            }
        }
    }
}
