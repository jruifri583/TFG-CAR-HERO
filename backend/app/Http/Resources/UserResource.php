<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Enums\RolSlug;

class UserResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'nombre' => $this->nombre,
            'apellidos' => $this->apellidos,
            'email' => $this->email,
            'telefono' => $this->telefono,
            'direccion' => $this->direccion,
            'ciudad' => $this->ciudad,
            'codigo_postal' => $this->codigo_postal,
            'nif' => $this->nif,
            'imagen' => $this->imagen,
            'activo' => (bool) $this->activo,
            'created_at' => $this->created_at?->toDateTimeString(),
            'direcciones' => $this->direcciones ? $this->direcciones->map(function ($dir) {
                return [
                    'id' => $dir->id,
                    'alias' => $dir->alias,
                    'direccion' => $dir->direccion,
                    'ciudad' => $dir->ciudad,
                    'codigo_postal' => $dir->codigo_postal,
                ];
            }) : [],
            'direcciones_anteriores' => $this->when(
                str_contains($request->url(), 'api/users') || str_contains($request->url(), 'api/me'),
                fn() => collect([$this->direccion]) // fallback
            ),
            'rol' => [
                'id' => $this->rol?->id,
                'nombre' => $this->rol?->nombre,
                'slug' => $this->rol?->slug,
            ],
        ];
    }
}
