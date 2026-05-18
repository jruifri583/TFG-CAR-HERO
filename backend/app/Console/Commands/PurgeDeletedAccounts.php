<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Carbon\Carbon;

// Elimina definitivamente las cuentas que llevan más de 24 horas en estado pendiente
class PurgeDeletedAccounts extends Command
{
    protected $signature = 'accounts:purge';

    protected $description = 'Elimina definitivamente las cuentas cuya solicitud de eliminación haya superado las 24 horas';

    public function handle(): int
    {
        $query = User::whereNotNull('pending_deletion_at')
            ->where('pending_deletion_at', '<=', Carbon::now()->subHours(24));

        $count = $query->count();

        $query->each(function (User $user) {
            // Eliminar relaciones antes de borrar el usuario
            $user->tokens()->delete();
            $user->direcciones()->delete();
            $user->vehiculos()->delete();
            $user->solicitudesComoCliente()->delete();
            $user->delete();
        });

        $this->info("Se eliminaron {$count} cuentas pendientes de eliminación.");

        return self::SUCCESS;
    }
}
