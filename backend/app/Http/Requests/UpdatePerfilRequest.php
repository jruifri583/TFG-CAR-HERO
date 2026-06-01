<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class UpdatePerfilRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    // Reglas de validación
    public function rules(): array
    {
        $user = $this->user();

        return [
            'nombre'    => 'sometimes|nullable|string|max:255',
            'apellidos' => 'sometimes|nullable|string|max:255',
            'nif'       => 'sometimes|nullable|string|max:20',
            'telefono'  => 'sometimes|nullable|string|max:50',
            'direccion' => 'sometimes|nullable|string|max:255',
            'ciudad'    => 'sometimes|nullable|string|max:100',
            'codigo_postal' => 'sometimes|nullable|string|max:10',
            'direcciones' => 'sometimes|nullable|array',
            'direcciones.*.alias' => 'nullable|string|max:100',
            'direcciones.*.direccion' => 'required|string|max:255',
            'direcciones.*.ciudad' => 'nullable|string|max:100',
            'direcciones.*.codigo_postal' => 'nullable|string|max:10',
            'email'     => 'sometimes|nullable|email|unique:users,email,' . ($user ? $user->id : 'NULL'),
            'current_password' => [
                'nullable',
                function ($attribute, $value, $fail) use ($user) {
                    if ($this->filled('password')) {
                        if ($user && !Hash::check($value, $user->password)) {
                            $fail('La contraseña actual es incorrecta.');
                        }
                    }
                }
            ],
            'password'  => [
                'sometimes',
                'nullable',
                'string',
                function ($attribute, $value, $fail) {
                    if ($this->filled('password') && empty($this->input('current_password'))) {
                        $fail('Debe ingresar su contraseña actual para establecer una nueva.');
                    }
                },
                Password::min(8)
                    ->letters()
                    ->mixedCase()
                    ->numbers()
                    ->symbols(),
            ],
        ];
    }

    // Mensajes de error
    public function messages(): array
    {
        return [
            'nombre.string' => 'El nombre debe ser válido.',
            'nombre.max' => 'El nombre no puede superar los 255 caracteres.',
            'apellidos.max' => 'Los apellidos no pueden superar los 255 caracteres.',
            'nif.unique' => 'El NIF ya está registrado.',
            'nif.max' => 'El NIF no puede superar los 20 caracteres.',
            'telefono.max' => 'El teléfono no puede superar los 50 caracteres.',
            'direccion.max' => 'La dirección no puede superar los 255 caracteres.',
            'current_password.current_password' => 'La contraseña actual es incorrecta.',
        ];
    }
}