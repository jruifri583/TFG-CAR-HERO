<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Mail\Mailables\Address;

class ContactMessageMailable extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public $data;

    // Constructor
    public function __construct(array $data)
    {
        $this->data = $data;
    }

    // Envuelve el mensaje
    public function envelope(): Envelope
    {
        return new Envelope(
            from: new Address($this->data['email'], $this->data['nombre']),
            subject: 'Nuevo mensaje de contacto: ' . $this->data['nombre'],
        );
    }

    // Contenido del mensaje
    public function content(): Content
    {
        return new Content(
            view: 'emails.contact',
            with: [
                'nombre' => $this->data['nombre'],
                'email' => $this->data['email'],
                'mensaje' => $this->data['mensaje'],
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
