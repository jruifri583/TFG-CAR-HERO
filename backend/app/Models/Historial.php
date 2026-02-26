<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;


class Historial extends Model
{
    use HasFactory;

    protected $table = 'historiales';

    public $timestamps = false;

    protected $fillable = [
        'solicitud_id',
        'fecha_itv',
        'resolucion_id',
        'notas'
    ];

    protected $casts = [
        'fecha_itv' => 'date:d / m / Y',
    ];

    /* ================= RELACIONES ================= */

    public function solicitud(): BelongsTo
    {
        return $this->belongsTo(Solicitud::class);
    }

    public function resolucion(): BelongsTo
    {
        return $this->belongsTo(Resolucion::class);
    }

    public function scopeVisibleFor($query, $user)
    {
    return $query->whereHas('solicitud', fn ($q) =>
        $q->visibleFor($user)
    );
    }
}