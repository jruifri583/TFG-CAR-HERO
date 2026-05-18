<?php

namespace App\Policies;

use App\Models\Solicitud;
use App\Models\User;

class SolicitudPolicy
{
    public function before(User $user, $ability)
    {
        if ($user->isAdmin()) return true;
    }

    // Determinar si el usuario puede ver cualquier modelo.
    public function viewAny(User $user): bool
    {
        return true;
    }

    // Determinar si el usuario puede ver el modelo.
    public function view(User $user, Solicitud $solicitud): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        if ($user->isCustomer()) {
            return (int) $user->id === (int) $solicitud->user_cliente_id;
        }

        if ($user->isEmployee()) {
            return !is_null($solicitud->user_empleado_id)
                && (int) $user->id === (int) $solicitud->user_empleado_id;
        }

        return false;
    }

    // Determinar si el usuario puede crear modelos.
    public function create(User $user): bool
    {
        return $user->isAdmin() || $user->isCustomer();
    }

    // Determinar si el usuario puede actualizar el modelo.
    public function update(User $user, Solicitud $solicitud): bool
    {
        if ($user->isAdmin()) return true;

        // Solo bloqueamos al empleado si YA está finalizada
        if ($solicitud->isFinalizado()) {
            return false;
        }

        return $user->isEmployee() && $solicitud->user_empleado_id === $user->id;
    }

    // Determinar si el cliente puede cancelar su propia solicitud.
    // Condición: debe ser su propia solicitud, no estar ya finalizada y la fecha_programada no debe haber pasado.
    public function cancel(User $user, Solicitud $solicitud): bool
    {
        if ($user->isAdmin()) return true;

        if (!$user->isCustomer()) return false;

        if ((int) $user->id !== (int) $solicitud->user_cliente_id) return false;

        // Already terminal states
        $slug = $solicitud->estado?->slug;
        if (in_array($slug, [\App\Enums\EstadoSlug::CANCELADO->value, \App\Enums\EstadoSlug::FINALIZADO->value])) {
            return false;
        }

        // If fecha_programada is set and has already passed → cannot cancel
        if ($solicitud->fecha_programada && $solicitud->fecha_programada->isPast()) {
            return false;
        }

        return true;
    }

    // Determinar si el usuario puede eliminar el modelo.
    public function delete(User $user, Solicitud $solicitud): bool
    {
        return false;
    }

    // Determinar si el usuario puede restaurar el modelo.
    public function restore(User $user, Solicitud $solicitud): bool
    {
        return false;
    }

    // Determinar si el usuario puede eliminar permanentemente el modelo.
    public function forceDelete(User $user, Solicitud $solicitud): bool
    {
        return false;
    }
}
