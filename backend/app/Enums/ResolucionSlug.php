<?php
namespace App\Enums;

enum ResolucionSlug: string
{
    case PENDIENTE = 'pendiente';
    case FAVORABLE = 'favorable';
    case DESFAVORABLE = 'desfavorable';
}