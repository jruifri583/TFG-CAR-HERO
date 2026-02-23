<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Rol;
use Illuminate\Support\Facades\Auth;
use App\Http\Requests\UpdatePerfilRequest;
use Illuminate\Http\JsonResponse;

class PerfilController extends Controller
{
    public function show(User $user): JsonResponse
    {
        /** @var User $auth */
        $auth = Auth::user();

        if (!$auth->isAdmin() && $auth->id !== $user->id) {
            return response()->json([
                'message' => 'No autorizado'
            ], 403);
        }

        return response()->json([
            'data' => $user->load('rol')
        ]);
    }

    public function edit(User $user): JsonResponse
    {
        /** @var User $auth */
        $auth = Auth::user();

        if (!$auth->isAdmin() && $auth->id !== $user->id) {
            return response()->json([
                'message' => 'No autorizado'
            ], 403);
        }

        return response()->json([
            'user' => $user->load('rol'),
            'roles' => Rol::all()
        ]);
    }

    public function update(UpdatePerfilRequest $request, User $user): JsonResponse
    {
        /** @var User $auth */
        $auth = Auth::user();

        if (!$auth->isAdmin() && $auth->id !== $user->id) {
            return response()->json([
                'message' => 'No autorizado'
            ], 403);
        }

        $user->update($request->validated());

        return response()->json([
            'message' => 'Perfil actualizado correctamente',
            'data' => $user->fresh()
        ]);
    }
}