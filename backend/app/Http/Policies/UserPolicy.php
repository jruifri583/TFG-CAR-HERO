<?php
namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    
    public function viewAny(User $auth): bool
    {
        return $auth->isAdmin();
    }

    
    public function view(User $auth, User $target): bool
    {
        return $auth->isAdmin() || $auth->id === $target->id;
    }

   
    public function create(User $auth): bool
    {
        return $auth->isAdmin();
    }

    
    public function update(User $auth, User $target): bool
    {
        return $auth->isAdmin(); 
    }

    
    public function delete(User $auth, User $target): bool
    {
        return $auth->isAdmin();
    }
}