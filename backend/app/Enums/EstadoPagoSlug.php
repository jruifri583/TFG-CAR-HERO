<?php
namespace App\Enums;

enum EstadoPagoSlug: string
{
    case PENDIENTE = 'pendiente';
    case PAGADO = 'pagado';
}