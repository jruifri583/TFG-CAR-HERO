<?php
namespace App\Enums;

enum MetodoPagoSlug: string
{
    case EFECTIVO = 'efectivo';
    case TARJETA = 'tarjeta';
    case TRANSFERENCIA = 'transferencia';
}
