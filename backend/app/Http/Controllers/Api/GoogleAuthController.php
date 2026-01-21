<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Laravel\Socialite\Facades\Socialite;
use App\Models\User;

class GoogleAuthController extends Controller
{
    public function redirect()
    {
        // Redirige a Google
        return Socialite::driver('google')->redirect();
    }

    public function callback()
    {
        $googleUser = Socialite::driver('google')->user();

        // Crear o actualizar usuario
        $user = User::firstOrCreate(
            ['email' => $googleUser->getEmail()],
            ['name' => $googleUser->getName()]
        );

        // Crear token JWT
        $token = $user->createToken('API Token')->plainTextToken;

        // Redirigir al frontend con el token
        return redirect("http://localhost:3000/login?token={$token}");
    }
}
