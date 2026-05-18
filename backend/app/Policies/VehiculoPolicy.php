<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Vehiculo;

class VehiculoPolicy
{
    // Determinar si el usuario puede ver cualquier modelo.
    public function viewAny(User $user): bool
    {
        return $user->isAdmin() || $user->isCustomer();
    }

    // Determinar si el usuario puede ver el modelo.
    public function view(User $user, Vehiculo $vehiculo): bool
    {
        if ($user->isAdmin()) {
            return true;
        }
        return $vehiculo->user_id === $user->id;
    }

    // Determinar si el usuario puede crear modelos.
    public function create(User $user): bool
    {
        return $user->isAdmin() || $user->isCustomer();
    }

    // Determinar si el usuario puede actualizar el modelo.
    public function update(User $user, Vehiculo $vehiculo): bool
    {
        return $user->isAdmin() || $user->isCustomer();
    }

    // Determinar si el usuario puede eliminar el modelo.
    public function delete(User $user, Vehiculo $vehiculo): bool
    {
        return $user->isAdmin() || $user->isCustomer();
    }

    // Determinar si el usuario puede restaurar el modelo.
    public function restore(User $user, Vehiculo $vehiculo): bool
    {
        return false;
    }

    // Determinar si el usuario puede eliminar permanentemente el modelo.
    public function forceDelete(User $user, Vehiculo $vehiculo): bool
    {
        return false;
    }
}
