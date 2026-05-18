<?php

namespace App\Policies;

use App\Models\Solicitud;
use App\Models\User;

class PagoPolicy
{
    public function before(User $user, $ability)
    {
        if ($user->isAdmin() || $user->isEmployee()) {
            return true;
        }
        return null;
    }
    
    // Permitir acceso a la visualización de solicitudes.
     
    public function create(User $user, Solicitud $solicitud): bool
    {
        return $user->isAdmin() || $user->isEmployee() && $solicitud->isFinalizado();
    }

    // El cliente puede confirmar el pago de su propia solicitud.
    public function update(User $user, \App\Models\Pago $pago): bool
    {
        if ($user->isAdmin() || $user->isEmployee()) {
            return true;
        }
        // El cliente puede actualizar el pago si la solicitud le pertenece
        return $pago->solicitud?->user_cliente_id === $user->id;
    }

    public function delete(User $user, Solicitud $solicitud): bool
    {
        return false;
    }

    public function restore(User $user, Solicitud $solicitud): bool
    {
        return false;
    }

    public function forceDelete(User $user, Solicitud $solicitud): bool
    {
        return false;
    }
}
