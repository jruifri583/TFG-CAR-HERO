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

            $client = new GoogleClient(['client_id' => config('services.google.client_id')]); 
            $payload = $client->verifyIdToken($idToken);

            if (!$payload) {
                return response()->json(['error' => 'Token inválido'], 401);
            }

            $user = User::updateOrCreate(
                ['email' => $payload['email']],
                [
                    'nombre' => $payload['name'],
                    'imagen' => $payload['picture'],
                    'rol_id' => 3,
                    'activo' => true,
                    'password' => bcrypt(str()->random(16)),
                ]
            );

            $token = $user->createToken('google-token')->plainTextToken;

            $user->load('rol');

            // Cancelar eliminación pendiente si el usuario vuelve a loguearse
            if ($user->pending_deletion_at) {
                $user->update(['pending_deletion_at' => null]);
            }

            return response()->json([
                'user' => $user,
                'token' => $token
            ]);

        } catch (Exception $e) {
            \Log::error('Google Login Error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'error' => 'Error en la verificación con Google',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}