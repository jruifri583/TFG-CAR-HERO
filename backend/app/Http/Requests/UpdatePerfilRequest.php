<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;



class UpdatePerfilRequest extends FormRequest
{
   public function authorize(): bool
    {
        return Auth::user()->id === $this->route('user')->id;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'nombre' => 'nullable|string|max:255',
            'apellidos' => 'nullable|string|max:255',
            'nif' => 'nullable|string|max:20|unique:users,nif,',
            'telefono' => 'nullable|string|max:20',
            'direccion' => 'nullable|string|max:255',
        ];
    }

    /**
     * Mensajes de error personalizados
     */
    public function messages(): array
    {
        return [
            'nombre.max' => 'El nombre no puede superar los 255 caracteres.',
            'apellidos.max' => 'Los apellidos no pueden superar los 255 caracteres.',
            'nif.unique' => 'El NIF ya está registrado.',
            'nif.max' => 'El NIF no puede superar los 20 caracteres.',
            'telefono.max' => 'El teléfono no puede superar los 20 caracteres.',
            'direccion.max' => 'La dirección no puede superar los 255 caracteres.',
        ];
    }
}