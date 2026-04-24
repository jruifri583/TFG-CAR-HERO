<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    // ======================
    // REGISTER
    // ======================
    public function register(Request $request)
    {
        $request->validate([
            'email' => 'required|email|unique:users',
            'password' => [
                'required',
                'confirmed',
                Password::min(8)
                    ->letters()
                    ->mixedCase()
                    ->numbers()
                    ->symbols(),
            ],
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
        'nombre'    => 'sometimes|nullable|string|max:255',
        'apellidos' => 'sometimes|nullable|string|max:255',
        'nif'       => 'sometimes|nullable|string|max:20',
        'telefono'  => 'sometimes|nullable|string|max:50',
        'direccion' => 'sometimes|nullable|string|max:255',
        'ciudad'    => 'sometimes|nullable|string|max:100',
        'codigo_postal' => 'sometimes|nullable|string|max:10',
        'direcciones' => 'sometimes|nullable|array',
        'direcciones.*.alias' => 'nullable|string|max:100',
        'direcciones.*.direccion' => 'required|string|max:255',
        'direcciones.*.ciudad' => 'nullable|string|max:100',
        'direcciones.*.codigo_postal' => 'nullable|string|max:10',
        'email'     => 'sometimes|nullable|email|unique:users,email,' . $user->id,
        'current_password' => [
            'nullable',
            function ($attribute, $value, $fail) use ($user, $request) {
                if ($request->filled('password')) {
                    if (!Hash::check($value, $user->password)) {
                        $fail('La contraseña actual es incorrecta.');
                    }
                }
            }
        ],
        'password'  => [
            'sometimes',
            'nullable',
            'string',
            function ($attribute, $value, $fail) use ($request) {
                if ($request->filled('password') && empty($request->input('current_password'))) {
                    $fail('Debe ingresar su contraseña actual para establecer una nueva.');
                }
            },
            Password::min(8)
                ->letters()
                ->mixedCase()
                ->numbers()
                ->symbols(),
        ],
    ], [
        'current_password.current_password' => 'La contraseña actual es incorrecta.',
        'nombre.string' => 'El nombre debe ser válido.',
    ]);

    if (!empty($validated['password'])) {
        $validated['password'] = bcrypt($validated['password']);
    } else {
        unset($validated['password']);
    }

    $user->update($validated);

    if ($request->has('direcciones')) {
        $user->direcciones()->delete();
        $direcciones = $request->input('direcciones') ?: [];
        foreach ($direcciones as $dir) {
            $user->direcciones()->create([
                'alias' => $dir['alias'] ?? null,
                'direccion' => $dir['direccion'],
                'ciudad' => $dir['ciudad'] ?? null,
                'codigo_postal' => $dir['codigo_postal'] ?? null,
            ]);
        }
    }

    return response()->json(['user' => new UserResource($user->fresh()->load('rol', 'direcciones'))]);
}

    // ======================
    // ME
    // ======================
    public function me(Request $request)
    {
        return response()->json([
            'user' => new UserResource($request->user()->load('rol', 'direcciones'))
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