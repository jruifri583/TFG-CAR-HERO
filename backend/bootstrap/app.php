<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
    $middleware->statefulApi();

    $middleware->group('api', [
        \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
        \Illuminate\Session\Middleware\StartSession::class,
    ]);

    // Prioridad absoluta: Sesión y Cookies antes que cualquier otra cosa en la API
    $middleware->prependToGroup('api', [
        \Illuminate\Cookie\Middleware\EncryptCookies::class,
        \Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse::class,
        \Illuminate\Session\Middleware\StartSession::class,
    ]);
    
    // Si sigue dando 419, añade tu ruta a la excepción temporalmente para probar
    $middleware->validateCsrfTokens(except: [
        'api/auth/google',
    ]);
})
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
