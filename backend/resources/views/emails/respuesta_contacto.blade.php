<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Respuesta a tu consulta</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">

    <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
        
        <div style="background-color: #0b1f3c; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">CAR-HERO</h1>
            <p style="margin: 5px 0 0; font-size: 14px; opacity: 0.8;">Respuesta de nuestro equipo</p>
        </div>

        <div style="padding: 30px;">
            <h2 style="color: #333333; font-size: 20px; margin-top: 0;">¡Hola {{ $nombre }}!</h2>
            <p style="color: #555555; line-height: 1.6; font-size: 16px;">
                Nuestro equipo de soporte ha revisado tu mensaje y te ha respondido:
            </p>

            <!-- Respuesta del Admin -->
            <div style="background-color: #e8f4fd; border-left: 4px solid #1e3a8a; padding: 15px; margin: 20px 0; border-radius: 0 4px 4px 0;">
                <p style="margin: 0; color: #1e3a8a; font-size: 15px; line-height: 1.6; white-space: pre-wrap;">
                    {{ $respuesta }}
                </p>
            </div>

            <!-- Tu mensaje original -->
            <h3 style="color: #666; font-size: 14px; margin-top: 30px; border-bottom: 1px solid #eee; padding-bottom: 5px;">Tu mensaje original:</h3>
            <div style="background-color: #f9f9f9; padding: 15px; margin-top: 10px; border-radius: 4px; font-style: italic; color: #666;">
                <p style="margin: 0; font-size: 14px; line-height: 1.5; white-space: pre-wrap;">{{ $mensajeOriginal }}</p>
            </div>

            <p style="color: #777777; font-size: 14px; line-height: 1.5; margin-top: 30px;">
                Si tienes más dudas, puedes volver a contactarnos respondiendo directamente a este correo o desde la sección de Contacto de nuestra web.
            </p>
        </div>

        <div style="background-color: #f4f4f4; color: #888888; text-align: center; padding: 15px; font-size: 12px; border-top: 1px solid #eeeeee;">
            <p style="margin: 0;">&copy; {{ date('Y') }} CAR-HERO. Todos los derechos reservados.</p>
        </div>

    </div>

</body>
</html>
