<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Respuesta a tu consulta - CAR-HERO</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 0;">

    <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);">
        
        <div style="background-color: #0b1f3c; color: #ffffff; padding: 40px 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.025em; text-transform: uppercase; font-style: italic;">CAR-HERO</h1>
            <p style="margin: 8px 0 0; font-size: 14px; opacity: 0.9; font-weight: 500;">Respuesta a tu consulta</p>
        </div>

        <div style="padding: 40px; background-color: #ffffff;">
            <h2 style="color: #1e293b; font-size: 20px; margin-top: 0; font-weight: 700;">¡Hola {{ $nombre }}!</h2>
            <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-top: 10px;">
                Nuestro equipo ha revisado tu mensaje y aquí tienes nuestra respuesta:
            </p>

            <div style="margin: 30px 0; padding: 25px; background-color: #eff6ff; border-radius: 8px; border-left: 4px solid #3b82f6;">
                <p style="margin: 0; color: #1e3a8a; font-size: 16px; line-height: 1.7; white-space: pre-wrap; font-weight: 500;">{{ $respuesta }}</p>
            </div>

            <div style="margin-top: 40px; padding-top: 25px; border-top: 1px solid #f1f5f9;">
                <h3 style="color: #64748b; text-transform: uppercase; font-size: 11px; letter-spacing: 0.05em; margin-bottom: 12px;">Tu consulta original</h3>
                <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; border: 1px solid #f1f5f9; color: #64748b; font-size: 14px; line-height: 1.5; font-style: italic;">
                    {{ $mensajeOriginal }}
                </div>
            </div>

            <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin-top: 35px;">
                Si tienes cualquier otra duda, puedes responder directamente a este correo o contactarnos de nuevo a través de nuestra web.
            </p>
        </div>

        <div style="background-color: #f8fafc; color: #94a3b8; text-align: center; padding: 20px; font-size: 11px; border-top: 1px solid #f1f5f9;">
            <p style="margin: 0;">&copy; {{ date('Y') }} CAR-HERO Engine. Todos los derechos reservados.</p>
        </div>

    </div>

</body>
</html>
