<?php

namespace App\Http\Controllers\Api;
use Illuminate\Support\Str;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Google_Client;
use App\Models\User;

use Illuminate\Support\Facades\Auth;
use Exception;

class GoogleController extends Controller
{
    public function loginWithGoogle(Request $request)
    {
        try {
            // 1. Obtener el token que viene de React (Axios.post)
            $idToken = $request->input('credential');

            // 2. Configurar el cliente de Google
            $client = new Google_Client(['client_id' => env('GOOGLE_CLIENT_ID')]);

            // 3. Verificar que el token sea válido
            $payload = $client->verifyIdToken($idToken);

            if ($payload) {
                // El token es válido. Google nos devuelve la info del usuario:
                $googleId = $payload['sub'];
                $email = $payload['email'];
                $name = $payload['name'];
                $picture = $payload['picture'] ?? null;

                // 4. Buscar o crear el usuario en tu base de datos
                $user = User::updateOrCreate(
                    ['email' => $payload['email']],
                    [
                        'nombre' => $payload['name'], // Mapeamos 'name' de Google a tu 'nombre'
                        'google_id' => $payload['sub'],
                        'imagen' => $payload['picture'],
                        'password' => bcrypt(Str::random(16)), 
                        'rol_id' => 2, 
                        'activo' => true,
                    ]
                );

                // Generar el token explícitamente con el guard de JWT
                $token = Auth::guard('api')->login($user);

                if (!$token) {
                    return response()->json(['error' => 'Unauthorized'], 401);
                }

                return response()->json([
                    'access_token' => $token,
                    'user' => $user
                ]);
            }

            return response()->json(['error' => 'Token de Google no válido'], 401);
        } catch (Exception $e) {
            return response()->json(['error' => 'Error en el servidor: ' . $e->getMessage()], 500);
        }
    }
}
