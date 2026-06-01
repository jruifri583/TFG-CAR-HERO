<?php

namespace App\Policies;
use App\Models\Pago;
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
    
     
    public function create(User $user, Solicitud $solicitud): bool
    {
        return false;
    }

    public function update(User $user, Pago $pago): bool
    {
        return false;
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
