<?php

namespace App\Mail;

use App\Models\MensajeContacto;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ResponderContactoMailable extends Mailable
{
    use Queueable, SerializesModels;

    public MensajeContacto $mensajeContacto;

    /**
     * Create a new message instance.
     */
    public function __construct(MensajeContacto $mensajeContacto)
    {
        $this->mensajeContacto = $mensajeContacto;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Respuesta a tu consulta - CAR-HERO',
        );
    }

    /**
     * Get the message content definition.
     */
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

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
