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

        if (!Auth::check() || !Auth::user()->isAdmin()) {
            $view->with('usuarios', collect());
            return;
        }

        $usuarios = User::clientes()->get();

        $view->with('usuarios', $usuarios);
    });
}
}
