<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Vehiculo;

class VehiculoPolicy
{
    // Determinar si el usuario puede ver cualquier vehiculo.
    public function viewAny(User $user): bool
    {
        return $user->isAdmin() || $user->isCustomer();
    }

    // Determinar si el usuario puede ver el vehiculo.
    public function view(User $user, Vehiculo $vehiculo): bool
    {
        if ($user->isAdmin()) {
            return true;
        }
        return $vehiculo->user_id === $user->id;
    }

    // Determinar si el usuario puede crear vehiculos.
    public function create(User $user): bool
    {
        return $user->isAdmin() || $user->isCustomer();
    }

    // Determinar si el usuario puede actualizar el vehiculo.
    public function update(User $user, Vehiculo $vehiculo): bool
    {
        return $user->isAdmin() || $user->isCustomer();
    }

    // Determinar si el usuario puede eliminar el vehiculo.
    public function delete(User $user, Vehiculo $vehiculo): bool
    {
        return $user->isAdmin() || $user->isCustomer();
    }

    // Determinar si el usuario puede restaurar el vehiculo.
    public function restore(User $user, Vehiculo $vehiculo): bool
    {
        return false;
    }

    // Determinar si el usuario puede eliminar permanentemente el vehiculo.
    public function forceDelete(User $user, Vehiculo $vehiculo): bool
    {
        return false;
    }
}
