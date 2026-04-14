<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    // ======================
    // REGISTER
    // ======================
    public function register(Request $request)
    {
        $request->validate([
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6|confirmed',
        ]);

        $user = User::create([
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        $user->tokens()->delete();
        $user->load('rol');

        $token = $user->createToken('auth')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ], 201);
    }

    // ======================
    // LOGIN
    // ======================
    public function login(Request $request)
{
    $request->validate([
        'email' => 'required|email',
        'password' => 'required',
    ]);

    $user = User::where('email', $request->email)->first();

    if (! $user || ! Hash::check($request->password, $user->password)) {
        return response()->json(['error' => 'Credenciales inválidas'], 401);
    }

    $user->tokens()->delete();
    $token = $user->createToken('auth')->plainTextToken;
    $user->load('rol'); // 👈

    return response()->json([
        'user' => $user,
        'token' => $token,
    ]);
}

    public function update(Request $request)
{
    /** @var User $user */
    $user = $request->user();

    $validated = $request->validate([
        'nombre'    => 'sometimes|string|max:255',
        'apellidos' => 'sometimes|string|max:255|nullable',
        'nif'       => 'sometimes|string|max:20|nullable',
        'telefono'  => 'sometimes|string|max:50|nullable',
        'direccion' => 'sometimes|string|max:255|nullable',
        'ciudad'    => 'sometimes|string|max:100|nullable',
        'codigo_postal' => 'sometimes|string|max:10|nullable',
        'email'     => 'sometimes|email|unique:users,email,' . $user->id,
        'password'  => 'sometimes|string|min:8|nullable',
    ]);

    if (!empty($validated['password'])) {
        $validated['password'] = bcrypt($validated['password']);
    } else {
        unset($validated['password']);
    }

    $user->update($validated);

    return response()->json(['user' => $user->fresh()->load('rol')]);
}

    // ======================
    // ME
    // ======================
    public function me(Request $request)
    {
        return response()->json([
            'user' => $request->user()->load('rol')
        ]);
    }

    // ======================
    // LOGOUT
    // ======================
    public function logout(Request $request)
    {
        $user = $request->user();
        if ($user) {
            $user->tokens()->delete(); // borra todos los tokens
        }

        return response()->json(['message' => 'Sesión cerrada correctamente']);
    }

    public function updateImagen(Request $request)
{
    $request->validate([
        'imagen' => 'required|image|max:2048',
    ]);

    /** @var User $user */
    $user = Auth::user();

    // Elimina la imagen anterior si no es la de Google ni la default
    if ($user->getRawOriginal('imagen') && !filter_var($user->getRawOriginal('imagen'), FILTER_VALIDATE_URL)) {
        Storage::disk('public')->delete('avatars/' . $user->getRawOriginal('imagen'));
    }

    $filename = $request->file('imagen')->store('avatars', 'public');
    $user->imagen = basename($filename);
    $user->save();

    return response()->json(['user' => $user->fresh()->load('rol')]);
}
}