<?php

namespace App\Policies;

use App\Models\Solicitud;
use App\Models\User;

class PagoPolicy
{
    public function before(User $user, $ability)
    {
        return $user->isAdmin() || $user->isEmployee();
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
