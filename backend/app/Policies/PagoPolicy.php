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
        // El cliente sólo puede pasar al método 'update' (confirmar pago)
        // Para el resto (create, delete...) retornamos null para que evalúe el método concreto
        return null;
    }
    /**
     * Determine whether the user can view any models.
     */
   
    /**
     * Determine whether the user can create models.
     */
    public function create(User $user, Solicitud $solicitud): bool
    {
        return $user->isAdmin() || $user->isEmployee() && $solicitud->isFinalizado();
    }

    
    /**
     * Determine whether the user can update the model.
     * El cliente puede confirmar el pago de su propia solicitud.
     */
    public function update(User $user, \App\Models\Pago $pago): bool
    {
        if ($user->isAdmin() || $user->isEmployee()) {
            return true;
        }
        // El cliente puede actualizar el pago si la solicitud le pertenece
        return $pago->solicitud?->user_cliente_id === $user->id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Solicitud $solicitud): bool
    {
        return false;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Solicitud $solicitud): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Solicitud $solicitud): bool
    {
        return false;
    }
}
