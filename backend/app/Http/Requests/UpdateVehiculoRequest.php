<?php

namespace App\Http\Requests;




class UpdateVehiculoRequest extends VehiculoRequest
{
    public function authorize(): bool
    {
        // Usamos automáticamente la policy 'update' del modelo Vehiculo
        return $this->user()->can('update', $this->route('vehiculo'));
    }

    public function rules(): array
    {
        $vehiculoId = $this->route('vehiculo')->id;

        return array_merge($this->commonValidations(), [
            'matricula' => 'required|string|unique:vehiculos,matricula,' . $vehiculoId,
            'vin' => 'nullable|string|min:5|max:17|unique:vehiculos,vin,' . $vehiculoId,
        ]);
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
