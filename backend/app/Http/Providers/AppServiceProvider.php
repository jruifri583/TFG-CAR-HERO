<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\View;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
       View::composer(['vehiculos.create', 'vehiculos.edit'], function ($view) {
        /** @var User $user */
        $user = Auth::user();
        
        $usuarios = ($user && $user->isAdmin()) 
            ? User::clientes()->get() 
            : collect();

        $view->with('usuarios', $usuarios);
    });
    }
}
