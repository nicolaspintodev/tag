<?php

namespace App\Enums;

enum TipoLiquidacion: string
{
    case CLIENTE = 'cliente';
    case PROVEEDOR = 'proveedor';
    case CHOFER = 'chofer';

    public function prefijo(): string
    {
        return match ($this) {
            self::CLIENTE => 'LIQ-C',
            self::PROVEEDOR => 'LIQ-P',
            self::CHOFER => 'LIQ-CH',
        };
    }

    public function entidadIdColumn(): string
    {
        return match ($this) {
            self::CLIENTE => 'cliente_id',
            self::PROVEEDOR => 'proveedor_id',
            self::CHOFER => 'chofer_id',
        };
    }

    public function entityTable(): string
    {
        return match ($this) {
            self::CLIENTE => 'clientes',
            self::PROVEEDOR => 'proveedores',
            self::CHOFER => 'choferes',
        };
    }

    public function label(): string
    {
        return match ($this) {
            self::CLIENTE => 'Cliente',
            self::PROVEEDOR => 'Proveedor',
            self::CHOFER => 'Chofer',
        };
    }

    public function precioColumn(): string
    {
        return match ($this) {
            self::CLIENTE => 'precio_pactado',
            self::PROVEEDOR => 'costo_proveedor',
            self::CHOFER => 'costo_viaje',
        };
    }
}
