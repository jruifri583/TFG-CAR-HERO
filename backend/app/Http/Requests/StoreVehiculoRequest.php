<?php

namespace App\Http\Requests;
use App\Models\Vehiculo;



class StoreVehiculoRequest extends VehiculoRequest
{
    public function authorize(): bool
    {
        // Usamos automáticamente la policy 'create' del modelo Vehiculo
        return $this->user()->can('create', Vehiculo::class);
    }

    public function rules(): array
    {

        return array_merge($this->commonValidations(), [
            'matricula' => 'required|string|max:20|unique:vehiculos,matricula',
            'vin' => 'required|string|min:5|max:17|unique:vehiculos,vin',
        ]);
    }

    protected function prepareForValidation()
    {
        $user = $this->user();

        if ($user && !$user->isAdmin()) {
            $this->merge([
                'user_id' => $user->id,
            ]);
        }
    }

    public function messages(): array
    {
        return array_merge($this->baseMessages(), [
            'matricula.required' => 'La matrícula es obligatoria.',
            'matricula.unique' => 'Esta matrícula ya está registrada.',
            'matricula.max' => 'La matrícula no puede tener más de 20 caracteres.',
            'vin.required' => 'El VIN es obligatorio.',
            'vin.unique' => 'Este VIN ya está registrado.',
            'vin.min' => 'El VIN debe tener al menos 5 caracteres.',
            'vin.max' => 'El VIN no puede tener más de 17 caracteres.',
        ]);
    }
}
