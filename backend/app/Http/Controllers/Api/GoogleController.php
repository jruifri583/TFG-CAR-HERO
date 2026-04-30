<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Google\Client as GoogleClient; 
use Exception;

class GoogleController extends Controller
{
    public function loginWithGoogle(Request $request)
    {
        try {
            $idToken = $request->input('id_token');
            if (!$idToken) {
                return response()->json(['error' => 'ID token requerido'], 422);
            }

            // Usar la clase con el namespace correcto
            $client = new GoogleClient(['client_id' => config('services.google.client_id')]); 
            $payload = $client->verifyIdToken($idToken);

            if (!$payload) {
                return response()->json(['error' => 'Token inválido'], 401);
            }

            // OJO: Verifica que estos nombres coincidan con tu DB
            $user = User::updateOrCreate(
                ['email' => $payload['email']],
                [
                    'nombre' => $payload['name'],
                    'imagen' => $payload['picture'], // ¿Es 'imagen' o 'image'?
                    'rol_id' => 3,
                    'activo' => true,
                    'password' => bcrypt(str()->random(16)), // Algunos campos requieren password aunque no se use
                ]
            );

            $token = $user->createToken('google-token')->plainTextToken;

            $user->load('rol');

            return response()->json([
                'user' => $user,
                'token' => $token
            ]);

        } catch (Exception $e) {
            // Esto te dirá el error exacto en la respuesta JSON
            return response()->json([
                'error' => 'Error interno en el servidor',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}