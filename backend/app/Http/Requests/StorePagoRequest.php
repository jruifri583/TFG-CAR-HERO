<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Models\Pago;

class StorePagoRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();

        // Actualización: la policy 'update' ya maneja el acceso del cliente
        if ($this->isMethod('PUT') || $this->isMethod('PATCH')) {
            $pago = $this->route('pago');
            return $user->can('update', $pago);
        }

        // Creación: admin y empleados siempre pueden
        if ($user->isAdmin() || $user->isEmployee()) {
            return true;
        }

        // Cliente: sólo puede crear un pago si la solicitud le pertenece
        if ($user->isCustomer()) {
            $solicitudId = $this->input('solicitud_id');
            $solicitud = \App\Models\Solicitud::find($solicitudId);
            return $solicitud && $solicitud->user_cliente_id === $user->id;
        }

        return false;
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $solicitudId = $this->input('solicitud_id');
            $solicitud = \App\Models\Solicitud::find($solicitudId);
            $pago = $this->route('pago');

            if ($solicitud && $solicitud->pago) {
                // If we are creating (no $pago) or updating a different pago, fail
                if (!$pago || $pago->id !== $solicitud->pago->id) {
                    $validator->errors()->add('solicitud_id', 'Esta solicitud ya tiene un pago registrado.');
                }
            }
        });
    }

    public function rules(): array
    {
        $isUpdate = $this->isMethod('PUT') || $this->isMethod('PATCH');

        return [
            'solicitud_id'   => 'required|exists:solicitudes,id',
            'importe'        => ($isUpdate ? 'sometimes|' : 'required|') . 'numeric|min:0|max:99999999.99',
            'metodo_pago_id' => 'nullable|exists:metodos_pago,id',
            'estado_pago_id' => 'required|exists:estados_pago,id',
        ];
    }

    public function messages(): array
    {
        return [
            'solicitud_id.required'   => 'Debe seleccionar una solicitud.',
            'importe.required'        => 'El importe es obligatorio.',
            'importe.numeric'         => 'El importe debe ser un número válido.',
            'importe.min'             => 'El importe no puede ser negativo.',
            'importe.max'             => 'El importe no puede superar los 99,999,999.99.',
            'estado_pago_id.required' => 'Debe seleccionar un estado de pago.',
        ];
    }
}
