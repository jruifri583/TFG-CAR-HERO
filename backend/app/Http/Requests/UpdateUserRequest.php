<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
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
            'current_password' => [
                'nullable',
                function ($attribute, $value, $fail) use ($currentUser) {
                    $targetUser = $this->route('user');
                    if ($this->filled('password') && $currentUser->id === $targetUser->id) {
                        if (!\Illuminate\Support\Facades\Hash::check($value, $currentUser->password)) {
                            $fail('La contraseña actual es incorrecta.');
                        }
                    }
                }
            ],
            'password'  => [
                'nullable',
                'string',
                'confirmed',
                function ($attribute, $value, $fail) use ($currentUser) {
                    $targetUser = $this->route('user');
                    if ($currentUser->id === $targetUser->id && empty($this->input('current_password'))) {
                        $fail('Debe ingresar su contraseña actual para establecer una nueva.');
                    }
                },
                Password::min(8)
                    ->letters()
                    ->mixedCase()
                    ->numbers()
                    ->symbols(),
            ],
            'telefono'  => 'nullable|string|max:50',
            'direccion' => 'nullable|string|max:255',
            'ciudad' => 'nullable|string|max:100',
            'codigo_postal' => 'nullable|string|max:10',
            'direcciones' => 'sometimes|array',
            'direcciones.*.alias' => 'nullable|string|max:100',
            'direcciones.*.direccion' => 'nullable|string|max:255',
            'direcciones.*.ciudad' => 'nullable|string|max:100',
            'direcciones.*.codigo_postal' => 'nullable|string|max:10',
        ];
    }

    public function messages(): array
    {
        return [
            'email.required' => 'El correo electrónico es obligatorio.',
            'email.email' => 'El correo electrónico no tiene un formato válido.',
            'email.max' => 'El correo electrónico no puede exceder los 150 caracteres.',
            'email.unique' => 'El correo electrónico ya está registrado.',
            'password.min' => 'La contraseña debe tener al menos 8 caracteres.',
            'password.letters' => 'La contraseña debe contener al menos una letra.',
            'password.mixed' => 'La contraseña debe contener mayúsculas y minúsculas.',
            'password.numbers' => 'La contraseña debe contener al menos un número.',
            'password.symbols' => 'La contraseña debe contener al menos un carácter especial.',
            'password.confirmed' => 'La confirmación de la contraseña no coincide.',
            'nif.max' => 'El NIF no puede exceder los 20 caracteres.',
            'telefono.max' => 'El teléfono no puede exceder los 50 caracteres.',
            'direccion.max' => 'La dirección no puede exceder los 255 caracteres.',
            'ciudad.string' => 'La ciudad debe ser una cadena de texto.',
            'ciudad.max' => 'La ciudad no puede exceder los 100 caracteres.',
            'codigo_postal.string' => 'El código postal debe ser una cadena de texto.',
            'codigo_postal.max' => 'El código postal no puede exceder los 10 caracteres.',
        ];
    }
}
