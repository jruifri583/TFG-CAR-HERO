<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Carbon\Carbon;

class PurgeDeletedAccounts extends Command
{
    protected $signature = 'accounts:purge';

    protected $description = 'Elimina definitivamente las cuentas cuya solicitud de eliminación haya superado las 24 horas';

    public function handle(): int
    {
        $count = User::whereNotNull('pending_deletion_at')
            ->where('pending_deletion_at', '<=', Carbon::now()->subHours(24))
            ->each(function (User $user) {
                // Eliminar relaciones antes de borrar el usuario
                $user->tokens()->delete();
                $user->direcciones()->delete();
                $user->vehiculos()->delete();
                $user->solicitudesComoCliente()->delete();
                $user->delete();
            });

        $this->info("Se eliminaron {$count->count()} cuentas pendientes de eliminación.");

        return self::SUCCESS;
    }
}
