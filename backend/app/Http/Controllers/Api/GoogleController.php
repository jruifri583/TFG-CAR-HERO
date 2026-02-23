<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Google_Client;

class GoogleController extends Controller
{
    public function loginWithGoogle(Request $request)
    {
        $idToken = $request->input('id_token');
        if (!$idToken) return response()->json(['error' => 'ID token requerido'], 422);

        $client = new Google_Client(['client_id' => env('GOOGLE_CLIENT_ID')]);
        $payload = $client->verifyIdToken($idToken);

        if (!$payload) return response()->json(['error' => 'Token inválido'], 401);

        $user = User::updateOrCreate(
            ['email' => $payload['email']],
            [
                'nombre' => $payload['name'],
                'imagen' => $payload['picture'],
                'rol_id' => 3,
                'activo' => true,
            ]
        );

        $token = $user->createToken('google-token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token
        ]);
    }
}