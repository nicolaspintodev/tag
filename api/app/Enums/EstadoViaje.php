<?php

namespace App\Enums;

enum EstadoViaje: string
{
    case PLANIFICADO = 'planificado';
    case INICIADO = 'iniciado';
    case TERMINADO = 'terminado';
}
