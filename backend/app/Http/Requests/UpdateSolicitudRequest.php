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
        if ($user->isAdmin()) {
            $rules['user_empleado_id'] = [
                'nullable', 
                'exists:users,id',
                function ($attribute, $value, $fail) use ($solicitud) {
                    if ($value) {
                        $fecha = $this->has('fecha_programada') 
                            ? $this->input('fecha_programada') 
                            : $solicitud->fecha_programada;

                        if (empty($fecha)) {
                            $fail('No se puede asignar un empleado si no hay una fecha programada.');
                        }
                    }
                }
            ];
        } else {
            $rules['user_empleado_id'] = ['nullable'];
        }

        // 3. Ajuste de fecha programada:
        if ($user->isAdmin() && $solicitud->fecha_programada === null) {
            $rules['fecha_programada'] = [
                'nullable',
                'date',
                function ($attribute, $value, $fail) use ($solicitud) {
                    if (empty($value)) {
                        $empleado = $this->has('user_empleado_id') 
                            ? $this->input('user_empleado_id') 
                            : $solicitud->user_empleado_id;

                        if ($empleado) {
                            $fail('La fecha programada es obligatoria si hay un empleado asignado.');
                        }
                    }
                }
            ];
        } else {
            unset($rules['fecha_programada']);
        }

        return $rules;
    }
}
