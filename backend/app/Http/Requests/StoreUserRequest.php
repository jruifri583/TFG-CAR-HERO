<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Models\User;


class StoreUserRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {

        // Usamos automáticamente la policy 'create' del modelo User
        return $this->user()->can('create', User::class);
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'email' => 'required|email|unique:users,email|max:150',
            'password' => 'required|min:6|max:20|confirmed',
            'nombre' => 'nullable|string|max:255',
            'apellidos' => 'nullable|string|max:255',
            'nif' => 'nullable|string|max:20|unique:users,nif',
            'telefono' => 'nullable|string|max:50',
            'direccion' => 'nullable|string|max:255',
            'rol_id' => 'nullable|exists:roles,id',
            'activo'   => 'nullable|boolean',
        ];
    }

    /**
     * Mensajes personalizados
     */
    public function messages(): array
    {
        return [
            'email.required' => 'El correo electrónico es obligatorio.',
            'email.email' => 'El correo electrónico no tiene un formato válido.',
            'email.max' => 'El correo electrónico no puede exceder los 150 caracteres.',
            'email.unique' => 'El correo electrónico ya está registrado.',
            'password.required' => 'La contraseña es obligatoria.',
            'password.string' => 'La contraseña debe ser una cadena de texto.',
            'password.min' => 'La contraseña debe tener al menos 6 caracteres.',
            'password.confirmed' => 'La confirmación de la contraseña no coincide.',
            'nombre.string' => 'El nombre debe ser una cadena de texto.',
            'nombre.max' => 'El nombre no puede exceder los 255 caracteres.',
            'apellidos.string' => 'Los apellidos deben ser una cadena de texto.',
            'apellidos.max' => 'Los apellidos no pueden exceder los 255 caracteres.',
            'nif.string' => 'El NIF debe ser una cadena de texto.',
            'nif.max' => 'El NIF no puede exceder los 20 caracteres.',
            'nif.unique' => 'El NIF ya está registrado.',
            'telefono.string' => 'El teléfono debe ser una cadena de texto.',
            'telefono.max' => 'El teléfono no puede exceder los 50 caracteres.',
            'direccion.string' => 'La dirección debe ser una cadena de texto.',
            'direccion.max' => 'La dirección no puede exceder los 255 caracteres.',
        ];
    }
}
