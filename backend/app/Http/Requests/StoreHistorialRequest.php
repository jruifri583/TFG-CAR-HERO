<?php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Models\Historial;

class StoreHistorialRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Usamos automáticamente la policy 'create' del modelo Historial
        return $this->user()->can('create', Historial::class);
    }

    public function rules(): array
    {
        return [
            'solicitud_id' => 'required|exists:solicitudes,id',
        ];
    }

}