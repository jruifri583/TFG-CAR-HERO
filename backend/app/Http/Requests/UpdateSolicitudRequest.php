<?php

namespace App\Http\Requests;



class UpdateSolicitudRequest extends SolicitudRequest
{
    // solo administrador y empleado
    public function authorize(): bool
    {
        $solicitud = $this->route('solicitud');

        return $this->user()->can('update', $solicitud);
    }


    // Reglas de validación
    public function rules(): array
    {
        $user = $this->user();
        $solicitud = $this->route('solicitud');

        $rules = $this->commonValidations();

        // 1. Ajuste de estado_id: En el common es 'required', 
        $rules['estado_id'] = ['nullable', 'exists:estados,id'];

        // 2. Ajuste de empleado:
        if ($user->isAdmin()) {
            $rules['user_empleado_id'] = ['required', 'exists:users,id'];
        } else {
            $rules['user_empleado_id'] = ['nullable'];
        }

        // 3. Ajuste de fecha programada:
        if ($user->isAdmin()) {
            $rules['fecha_programada'] = ['required', 'date'];
        } else {
            unset($rules['fecha_programada']);
        }

        // 4. Importe de cobro: sólo el admin puede definirlo
        if ($user->isAdmin()) {
            $rules['importe_cobro'] = ['required', 'numeric', 'min:0', 'max:99999.99'];
        }

        return $rules;
    }
}
