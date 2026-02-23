<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EstadoPago extends Model
{
    protected $table = 'estados_pago';
    
    public $timestamps = false;
    protected $fillable = ['nombre', 'slug'];


    public function pagos(): HasMany
    {
        return $this->hasMany(Pago::class, 'estado_pago_id');
    }
}
