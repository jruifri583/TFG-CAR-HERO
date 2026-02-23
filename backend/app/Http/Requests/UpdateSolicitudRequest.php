<?php

namespace App\Http\Requests;



class UpdateSolicitudRequest extends SolicitudRequest
{
    /**
     * solo administrador y empleado
     */
    public function authorize(): bool
    {
        $solicitud = $this->route('solicitud');

        return $this->user()->can('update', $solicitud);
    }


    /**
     * Reglas de validación
     */
    public function rules(): array
    {
        $user = $this->user();
        $solicitud = $this->route('solicitud');

        $rules = $this->commonValidations();

        // 1. Ajuste de estado_id: En el common es 'required', 
        $rules['estado_id'] = ['nullable', 'exists:estados,id'];

        // 2. Ajuste de empleado:
        if (!$user->isAdmin()) {
            $rules['user_empleado_id'] = ['nullable']; // Evitamos que falle si no es admin
        }

        // 3. Ajuste de fecha programada:
        if ($user->isEmployee() || $user->isCustomer() || ($user->isAdmin() && $solicitud->fecha_programada !== null)) {
            unset($rules['fecha_programada']);
        }

        return $rules;
    }
}
