<?php

namespace App\Mail;

use App\Models\MensajeContacto;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ResponderContactoMailable extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public MensajeContacto $mensajeContacto;

    // Constructor
    public function __construct(MensajeContacto $mensajeContacto)
    {
        $this->mensajeContacto = $mensajeContacto;
    }

    // Envuelve el mensaje
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Respuesta a tu consulta - CAR-HERO',
        );
    }

    // Contenido del mensaje
    public function content(): Content
    {
        return new Content(
            view: 'emails.respuesta_contacto',
            with: [
                'nombre' => $this->mensajeContacto->nombre,
                'mensajeOriginal' => $this->mensajeContacto->mensaje,
                'respuesta' => $this->mensajeContacto->respuesta,
            ]
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
