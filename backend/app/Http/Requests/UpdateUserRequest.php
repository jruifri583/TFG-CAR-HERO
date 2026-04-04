<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Models\User;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->route('user');
        return $this->user()->can('update', $user);
    }

    public function rules(): array
    {
        /** @var User $currentUser */
        $currentUser = $this->user();

        return [
            'nombre'    => 'nullable|string|max:255',
            'apellidos' => 'nullable|string|max:255',
            'nif'       => 'nullable|string|max:20',
            'email'     => [
                'required',
                'email',
                'max:150',
                Rule::unique('users')->ignore($this->route('user')),
            ],
            'rol_id'    => [
                Rule::requiredIf(function () use ($currentUser) {
                    return $currentUser instanceof User && $currentUser->isAdmin();
                }),
                'exists:roles,id',
            ],
            'activo'    => 'sometimes|boolean',
            'password'  => 'nullable|string|min:6|max:20|confirmed',
            'telefono'  => 'nullable|string|max:50',
            'direccion' => 'nullable|string|max:255',
        ];
    }

    public function messages(): array
    {
        return [
            'email.required' => 'El correo electrónico es obligatorio.',
            'email.email' => 'El correo electrónico no tiene un formato válido.',
            'email.max' => 'El correo electrónico no puede exceder los 150 caracteres.',
            'email.unique' => 'El correo electrónico ya está registrado.',
            'password.min' => 'La contraseña debe tener al menos 6 caracteres.',
            'password.max' => 'La contraseña no puede exceder los 20 caracteres.',
            'password.confirmed' => 'La confirmación de la contraseña no coincide.',
            'nif.max' => 'El NIF no puede exceder los 20 caracteres.',
            'telefono.max' => 'El teléfono no puede exceder los 50 caracteres.',
            'direccion.max' => 'La dirección no puede exceder los 255 caracteres.',
        ];
    }
}
