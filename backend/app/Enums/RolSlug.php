<?php
namespace App\Enums;

enum RolSlug: string
{
    case ADMINISTRADOR = 'administrador';
    case EMPLEADO = 'empleado';
    case CLIENTE = 'cliente';
}
