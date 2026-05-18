<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class AuthController extends Controller
{
    public function showLoginForm()
    {
        return view('auth.login'); 
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        if (Auth::attempt($credentials)) {
            $request->session()->regenerate();
            return redirect()->intended('/dashboard'); 
        }

        return back()->withErrors(['email' => 'Credenciales incorrectas']);
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return redirect('/login');
    }

    public function updateImagen(Request $request)
{
    $request->validate([
        'imagen' => 'required|image|max:2048',
    ]);

    /** @var User $user */
    $user = $request->user();

    // Elimina imagen anterior si es local
    $oldImagen = $user->getRawOriginal('imagen');
    if ($oldImagen && !filter_var($oldImagen, FILTER_VALIDATE_URL)) {
        Storage::disk('public')->delete('avatars/' . $oldImagen);
    }

    $filename = $request->file('imagen')->store('avatars', 'public');
    $user->imagen = basename($filename);
    $user->save();

    return response()->json(['user' => $user->fresh()]);
}
}
