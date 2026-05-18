<?php

namespace App\Http\Requests;

use App\Enums\EstadoSlug;
use Illuminate\Validation\Rule;
use App\Models\Estado;
use App\Models\Solicitud;

class StoreSolicitudRequest extends SolicitudRequest
{

    public function authorize(): bool
    {

        // Usamos automáticamente la policy 'create' del modelo Solicitud
        return $this->user()->can('create', Solicitud::class);
    }

    protected function prepareForValidation()
    {
        $user = $this->user();

        if ($user && !$user->isAdmin()) {
            $this->merge([
                'user_cliente_id' => $user->id,
            ]);
        }

        if (!$this->has('estado_id') || ($user && $user->isCustomer())) {

            $estadoPendiente = Estado::where('slug', 'pendiente')->first();

            if ($estadoPendiente) {
                $this->merge([
                    'estado_id' => $estadoPendiente->id,
                ]);
            }
        }
    }

    // Reglas de validación
    public function rules(): array
    {
        $estadosAbiertosIds = Estado::whereIn('slug', [
            EstadoSlug::PENDIENTE->value,
            EstadoSlug::ASIGNADO->value,
            EstadoSlug::EN_RECOGIDA->value,
            EstadoSlug::EN_ITV->value,
            EstadoSlug::RETORNANDO->value,
        ])->pluck('id')->toArray();

        return array_merge($this->commonValidations(), [
            'direccion' => ['required', 'string', 'max:255'],
            'vehiculo_id' => [
                'required',
                'exists:vehiculos,id',
                Rule::unique('solicitudes', 'vehiculo_id')
                    ->whereIn('estado_id', $estadosAbiertosIds)
            ],
        ]);
    }

    // Mensajes de error
    public function messages(): array
    {
        return array_merge($this->baseMessages(), [
            'vehiculo_id.required' => 'Debes seleccionar un vehículo.',
            'vehiculo_id.unique' => 'Este vehículo ya tiene una solicitud activa.',
             'direccion.required' => 'La dirección es obligatoria.',
        ]);
    }
}
