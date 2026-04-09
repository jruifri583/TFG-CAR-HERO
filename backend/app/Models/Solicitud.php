<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Estado;
use App\Enums\EstadoSlug;
use Illuminate\Validation\ValidationException;
use Illuminate\Database\Eloquent\Builder;
use App\Models\User;

class Solicitud extends Model
{
    use HasFactory;

    protected $table = 'solicitudes';

    protected $fillable = [
        'user_cliente_id',
        'vehiculo_id',
        'user_empleado_id',
        'direccion',
        'estado_id',
        'resolucion_id',
        'pago_id',
        'fecha_programada',
        'hora_recogida',
        'hora_itv',
        'hora_entrega',
        'notas',
        'importe_cobro',
    ];

    protected $casts = [
        'fecha_programada' => 'datetime',
        'hora_recogida' => 'datetime',
        'hora_itv' => 'datetime',
        'hora_entrega' => 'datetime',
        'importe_cobro' => 'decimal:2',
    ];

    // RELACIONES 

    public function cliente()
    {
        return $this->belongsTo(User::class, 'user_cliente_id');
    }

    public function vehiculo()
    {
        return $this->belongsTo(Vehiculo::class);
    }

    public function empleado()
    {
        return $this->belongsTo(User::class, 'user_empleado_id');
    }

    public function estado()
    {
        return $this->belongsTo(Estado::class);
    }

    public function resolucion()
    {
        return $this->belongsTo(Resolucion::class);
    }

    public function pago()
    {
        return $this->hasOne(Pago::class);
    }

    public function historial()
    {
        return $this->hasOne(Historial::class);
    }

    // HELPERS DE DOMINIO 

    public function isFinalizado(): bool
    {
        return $this->estado?->slug === EstadoSlug::FINALIZADO->value;
    }

    /**
     * Determina si la solicitud puede ser finalizada.
     * Requiere:
     * - Resolución existente y diferente de pendiente
     * - Pago asociado
     */
    public function puedeFinalizar(): bool
    {
        $resolucionValida = $this->resolucion
            && !$this->resolucion->isPendiente();

        $pagoValido = $this->pago !== null;

        return $resolucionValida && $pagoValido;
    }

    // EVENTOS 

    protected static function booted()
    {
        static::uniqueCar();
        static::automaticHour();
    }

    protected static function uniqueCar()
    {
        static::creating(function ($solicitud) {

            // Obtenemos los IDs de los estados terminales (sin subconsulta correlacionada)
            $estadosExcluidos = Estado::whereIn('slug', [
                EstadoSlug::FINALIZADO->value,
                EstadoSlug::CANCELADO->value,
            ])->pluck('id');

            $existe = self::where('vehiculo_id', $solicitud->vehiculo_id)
                ->whereNotIn('estado_id', $estadosExcluidos)
                ->exists();

            if ($existe) {
                throw ValidationException::withMessages([
                    'vehiculo_id' => 'El vehículo ya tiene una solicitud activa.',
                ]);
            }
        });
    }

    protected static function automaticHour()
    {
        static::updating(function ($solicitud) {

            if (! $solicitud->isDirty('estado_id')) {
                return;
            }

            // usamos la relación ya cargada si existe
            $nuevoEstado = Estado::find($solicitud->estado_id);
            if (!$nuevoEstado) {
                return;
            }

            $slug = $nuevoEstado->slug;
            $ahora = now();

            if ($slug === EstadoSlug::EN_RECOGIDA->value && !$solicitud->hora_recogida) {
                // Validación de concurrencia: El empleado no puede tener otra solicitud activa sin entregar
                $conflictivo = self::where('user_empleado_id', $solicitud->user_empleado_id)
                    ->where('id', '!=', $solicitud->id)
                    ->whereHas('estado', function($q) {
                        $q->whereIn('slug', [
                            EstadoSlug::EN_RECOGIDA->value,
                            EstadoSlug::EN_ITV->value,
                            EstadoSlug::RETORNANDO->value,
                        ]);
                    })
                    ->whereNull('hora_entrega')
                    ->exists();

                if ($conflictivo) {
                    throw ValidationException::withMessages([
                        'estado_id' => 'No puedes iniciar un nuevo servicio hasta que entregues el vehículo de tu solicitud actual.',
                    ]);
                }

                $solicitud->hora_recogida = $ahora;
            }

            if ($slug === EstadoSlug::EN_ITV->value && !$solicitud->hora_itv) {
                $solicitud->hora_itv = $ahora;
            }

            if ($slug === EstadoSlug::FINALIZADO->value && !$solicitud->hora_entrega) {
                $solicitud->hora_entrega = $ahora;
            }
        });
    }

    // SCOPES 

    public function scopeVisibleFor(Builder $query, User $user): Builder
    {
        if ($user->isAdmin()) {
            return $query;
        }

        if ($user->isEmployee()) {
            return $query->where('user_empleado_id', $user->id);
        }

        if ($user->isCustomer()) {
            return $query->where('user_cliente_id', $user->id);
        }

        return $query->whereRaw('0 = 1');
    }

    public static function formDataFor(User $user): array
    {
        return [
            'estados'     => \App\Models\Estado::orderBy('id')->get(['id', 'nombre', 'slug']),
            'resoluciones' => \App\Models\Resolucion::orderBy('id')->get(['id', 'nombre']),
        ];
    }

    public function scopeNoFinalizadas(Builder $query): Builder
    {
        $id = Estado::where('slug', EstadoSlug::FINALIZADO->value)->value('id');
        return $query->where('estado_id', '!=', $id);
    }

    public function scopeFinalizadas(Builder $query): Builder
    {
        $id = Estado::where('slug', EstadoSlug::FINALIZADO->value)->value('id');
        return $query->where('estado_id', $id);
    }

    public function scopeWithBaseRelations(Builder $query): Builder
    {
        // Incluye pago.metodoPago y pago.estadoPago para evitar N+1 en SolicitudResource
        return $query->with(['cliente', 'vehiculo', 'estado', 'empleado', 'resolucion', 'pago.metodoPago', 'pago.estadoPago']);
    }

    public function loadFull()
    {
        return $this->load([
            'vehiculo',
            'cliente',
            'empleado',
            'estado',
            'resolucion',
            'pago.metodoPago',
            'pago.estadoPago',
        ]);
    }
}
