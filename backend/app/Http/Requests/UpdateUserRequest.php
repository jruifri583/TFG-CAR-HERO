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
            'nif' => 'nullable|string|max:20',
            'email'     => [
                'required',
                'email',
                Rule::unique('users')->ignore($this->route('user')),
            ],
            'rol_id'    => [
                Rule::requiredIf(function () use ($currentUser) {
                    return $currentUser instanceof User && $currentUser->isAdmin();
                }),
                'exists:roles,id',
            ],
            'activo' => 'sometimes|boolean',
            'password'  => 'nullable|min:8|confirmed',
            'telefono'  => 'nullable|string|max:20',
            'direccion' => 'nullable|string|max:255',
        ];
    }
}
