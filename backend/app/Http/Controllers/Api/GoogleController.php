<?php
namespace App\Http\Controllers\Api;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use App\Http\Controllers\Controller;
use Laravel\Socialite\Facades\Socialite;
use App\Models\User;

class GoogleController extends Controller
{
    public function redirect()
    {
        // Redirige a Google
        return Socialite::driver('google')->redirect();
    }

    public function callback()
{
    $googleUser = Socialite::driver('google')->user();

    $user = User::firstOrCreate(
        ['email' => $googleUser->getEmail()],
        [
            'name' => $googleUser->getName(),
            'password' => null,         
            'provider' => 'google',
            'provider_id' => $googleUser->getId(),
        ]
    );

    $token = JWTAuth::fromUser($user);
    return redirect("http://localhost:5173/login?token={$token}");
}
}
