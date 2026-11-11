<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Cliente extends Model
{
    use SoftDeletes;

    public const CONDICIONES_IVA = [
        'responsable_inscripto',
        'monotributo',
        'exento',
        'consumidor_final',
        'no_categorizado',
    ];

    protected $table = 'clientes';

    protected $fillable = [
        'razon_social',
        'nombre_administrativo',
        'cuit',
        'direccion',
        'telefono',
        'email',
        'contacto',
        'notas',
        'condicion_iva',
        'ingresos_brutos',
        'localidad',
        'provincia',
        'codigo_postal',
    ];

    public function getNombreMostrarAttribute(): string
    {
        return $this->nombre_administrativo ?: $this->razon_social;
    }

    public function viajes(): HasMany
    {
        return $this->hasMany(Viaje::class);
    }

    public function liquidaciones(): HasMany
    {
        return $this->hasMany(Liquidacion::class);
    }
}
