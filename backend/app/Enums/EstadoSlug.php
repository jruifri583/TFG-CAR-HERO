<?php

namespace App\Enums;

enum EstadoSlug: string
{
    case PENDIENTE = 'pendiente';
    case ASIGNADO = 'asignado';
    case EN_RECOGIDA = 'en_recogida';
    case EN_ITV = 'en_itv';
    case RETORNANDO = 'retornando';
    case CANCELADO = 'cancelado';
    case FINALIZADO = 'finalizado';

    public static function orden(): array
    {
        return [
            self::PENDIENTE->value,
            self::ASIGNADO->value,
            self::EN_RECOGIDA->value,
            self::EN_ITV->value,
            self::RETORNANDO->value,
        ];
    }
}
