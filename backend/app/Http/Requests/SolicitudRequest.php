<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

abstract class SolicitudRequest extends FormRequest
{
    protected function commonValidations(): array
    {
        return [
            'user_cliente_id' => ['nullable', 'exists:users,id'],
            'user_empleado_id' => ['nullable', 'exists:users,id'],
            'estado_id' => ['required', 'exists:estados,id'],
            'resolucion_id' => ['nullable', 'exists:resoluciones,id'],
            'precio' => [
                'nullable',
                'numeric',
                'min:0',
                'max:99999999.99',
                'regex:/^\d+(\.\d{1,2})?$/',
            ],
            'fecha_programada' => ['nullable', 'date'],
            'hora_recogida' => ['nullable', 'date'],
            'hora_itv' => ['nullable', 'date'],
            'hora_entrega' => ['nullable', 'date'],
            'notas' => ['nullable', 'string', 'max:500'],
        ];
    }

    protected function baseMessages(): array
    {
        return [
            'precio.numeric' => 'El precio debe ser un número.',
            'notas.max' => 'Las notas no pueden superar los 500 caracteres.',
        ];
    }
}