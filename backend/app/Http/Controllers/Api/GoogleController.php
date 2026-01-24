<?php

namespace App\Http\Controllers\Api;

use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Google\Client as Google_Client;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Exception;

class GoogleController extends Controller
{

    public function loginWithGoogle(Request $request)
{
    try {
        Log::info('ID Token recibido', ['id_token' => $request->input('id_token')]);

        $request->validate(['id_token' => 'required|string']);
        $idToken = $request->input('id_token');

        $client = new \Google\Client(['client_id' => env('GOOGLE_CLIENT_ID')]);
        $payload = $client->verifyIdToken($idToken);

        if (!$payload) {
            Log::warning('Token de Google inválido', ['id_token' => $idToken]);
            return response()->json(['error' => 'Token de Google no válido'], 401);
        }

        Log::info('Payload de Google', $payload);

        $user = User::updateOrCreate(
            ['email' => $payload['email']],
            [
                'nombre' => $payload['name'] ?? 'Sin nombre',
                'google_id' => $payload['sub'] ?? null,
                'imagen' => $payload['picture'] ?? null,
                'password' => bcrypt(Str::random(16)),
                'rol_id' => 3,
                'activo' => true,
            ]
        );

        Log::info('Usuario creado o actualizado', ['user' => $user->toArray()]);

        // Aquí es donde normalmente da error
        $token = Auth::guard('api')->login($user);
        if (!$token) {
            Log::error('JWT no generado', ['user' => $user->toArray()]);
            return response()->json(['error' => 'JWT no generado'], 500);
        }

        Log::info('Token JWT generado', ['token' => $token]);

        return response()->json([
            'access_token' => $token,
            'user' => $user
        ]);

    } catch (\Exception $e) {
        Log::error('Error login Google', [
            'message' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);
        return response()->json(['error' => 'Error en el servidor'], 500);
    }
}

}   