<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class Direccion extends Model
{
    use HasFactory;

    protected $table = 'direcciones';

    protected $fillable = [
        'user_id',
        'alias',
        'direccion',
        'ciudad',
        'codigo_postal',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
