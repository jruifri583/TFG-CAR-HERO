<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Mail\ContactMessageMailable;

class ContactController extends Controller
{
    /**
     * Store and send a newly created contact message.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre'  => 'required|string|max:100',
            'email'   => 'required|email|max:100',
            'mensaje' => 'required|string|min:10',
            'cf_turnstile_response' => 'required|string'
        ]);

        // Verificar Turnstile con Cloudflare
        $turnstileSecret = env('TURNSTILE_SECRET_KEY');
        if ($turnstileSecret) {
            $response = \Illuminate\Support\Facades\Http::asForm()->post('https://challenges.cloudflare.com/turnstile/v0/siteverify', [
                'secret'   => $turnstileSecret,
                'response' => $request->input('cf_turnstile_response'),
                'remoteip' => $request->ip(),
            ]);

            if (!$response->json('success')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validación anti-spam (Turnstile) fallida. Por favor, inténtalo de nuevo.'
                ], 422);
            }
        }

        try {
            // Guardar en la base de datos
            \App\Models\MensajeContacto::create($validated);

            // Se envía a un correo de ejemplo de la empresa
            Mail::to('contacto@carhero.com')->send(new ContactMessageMailable($validated));

            return response()->json([
                'success' => true,
                'message' => 'El mensaje de contacto ha sido enviado exitosamente.'
            ], 200);
        } catch (\Exception $e) {
            \Log::error('Error enviando email de contacto: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Hubo un error al intentar enviar el mensaje.'
            ], 500);
        }
    }
}
