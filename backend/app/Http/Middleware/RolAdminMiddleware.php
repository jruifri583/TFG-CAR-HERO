<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;

class RolAdminMiddleware
{
    // Controla el acceso por roles
    public function handle(Request $request, Closure $next, $rol): Response
    {
        $user = Auth::user();

        if (! $user->rol || $user->rol->slug !== $rol) {
            abort(403);
        }

        return $next($request);
    }
}