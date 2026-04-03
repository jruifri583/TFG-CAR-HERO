<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

abstract class VehiculoRequest extends FormRequest
{
    protected function commonValidations(): array
    {
        return [
            'user_id' => ['sometimes', 'exists:users,id'],
            'marca' => ['nullable', 'string', 'max:100'],
            'modelo' => ['nullable', 'string', 'max:100'],
            'año' => ['nullable', 'integer'],
            'kilometros' => ['nullable', 'integer'],
            'fecha_ultima_itv' => ['nullable', 'date'],
            'imagen' => ['nullable', 'image', 'max:2048'],
        ];
    }

    protected function baseMessages(): array
    {
        return [
            'user_id.sometimes' => 'Debes seleccionar un usuario.',
            'user_id.exists' => 'El usuario seleccionado no existe.',
            'kilometros.integer' => 'Los kilómetros deben ser un número entero.',
            'fecha_ultima_itv.date' => 'La fecha de última ITV debe ser válida.',
        ];
    }
}