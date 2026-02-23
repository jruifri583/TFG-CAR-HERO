<?php

namespace App\Providers;

use App\Models\Solicitud;
use App\Models\Vehiculo;
use App\Models\Historial;
use App\Models\User;
use App\Policies\SolicitudPolicy;
use App\Policies\VehiculoPolicy;
use App\Policies\HistorialPolicy;
use App\Policies\UserPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        Solicitud::class => SolicitudPolicy::class,
        Vehiculo::class => VehiculoPolicy::class,
        Historial::class => HistorialPolicy::class,
        User::class => UserPolicy::class,
    ];

    public function boot(): void
    {
        $this->registerPolicies();
    }
}
