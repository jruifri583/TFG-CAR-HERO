<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\VehiculoController;
use App\Http\Controllers\Api\GoogleController;
use Illuminate\Http\Request;


// --- Rutas Públicas ---
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::match(['get', 'post'], '/auth/google', [GoogleController::class, 'loginWithGoogle']);


// --- Rutas Protegidas ---
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    
    // Auth
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);


    // Gestión de Vehículos (Tus nuevos atributos)
    Route::get('/vehiculos', [VehiculoController::class, 'index']);
    Route::post('/vehiculos', [VehiculoController::class, 'store']);
    Route::get('/vehiculos/{id}', [VehiculoController::class, 'show']);
    Route::put('/vehiculos/{id}', [VehiculoController::class, 'update']);
    Route::delete('/vehiculos/{id}', [VehiculoController::class, 'destroy']);

    return $request->user();
});
