<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Historial;

class HistorialPolicy
{
    
    public function view(User $user, Historial $historial)
    {
        if ($user->isAdmin()) {
            return true; // Admin ve todo
        }

        if ($user->isEmployee()) {
            return $historial->solicitud->user_empleado_id === $user->id;
        }

        if ($user->isCustomer()) {
            return $historial->solicitud->user_cliente_id === $user->id;
        }
        return false;
    }

    
    public function viewAny(User $user)
    {
        return $user->isAdmin() || $user->isEmployee() || $user->isCustomer();
    }
}
