<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\PagoController;
use App\Http\Controllers\Api\VehiculoController;
use App\Http\Controllers\Api\HistorialController;
use App\Http\Controllers\Api\GoogleController;
use Illuminate\Http\Request;
use App\Enums\RolSlug;




// --- Rutas Públicas ---
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/auth/google', [GoogleController::class, 'loginWithGoogle']);


// --- Rutas Protegidas ---
Route::middleware('auth:sanctum')->group(function () {
    
    // Auth
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/me', [AuthController::class, 'update']);
    Route::post('/me/imagen', [AuthController::class, 'updateImagen']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Recursos
    Route::middleware('rol:' . RolSlug::ADMINISTRADOR->value)->group(function () {
        Route::resource('users', UserController::class);
    });

    Route::apiResource('vehiculos', VehiculoController::class);
    Route::get('historiales', [HistorialController::class, 'index']);
    Route::apiResource('pagos', PagoController::class);

    
});
