<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nuevo mensaje de contacto</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 0;">

    <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);">
        
        <div style="background-color: #0b1f3c; color: #ffffff; padding: 40px 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.025em; text-transform: uppercase; font-style: italic;">CAR-HERO</h1>
            <p style="margin: 8px 0 0; font-size: 14px; opacity: 0.9; font-weight: 500;">Notificación de Nuevo Mensaje</p>
        </div>

        <div style="padding: 40px; background-color: #ffffff;">
            <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-top: 0;">
                Has recibido una nueva consulta desde el formulario de contacto de la web.
            </p>

            <div style="margin: 30px 0; padding: 25px; background-color: #f1f5f9; border-radius: 8px; border-left: 4px solid #0b1f3c;">
                <p style="margin: 0 0 15px; color: #1e293b; font-size: 14px;">
                    <strong style="color: #64748b; text-transform: uppercase; font-size: 11px; letter-spacing: 0.05em; display: block; margin-bottom: 4px;">Remitente</strong>
                    <span style="font-size: 16px; font-weight: 600;">{{ $nombre }}</span> 
                    <br>
                    <a href="mailto:{{ $email }}" style="color: #2563eb; text-decoration: none; font-size: 14px;">{{ $email }}</a>
                </p>
                
                <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
                
                <p style="margin: 0; color: #334155; font-size: 15px; line-height: 1.7; white-space: pre-wrap;">{{ $mensaje }}</p>
            </div>

            <div style="text-align: center; margin-top: 40px;">
                <p style="color: #94a3b8; font-size: 12px; font-style: italic; margin: 0;">
                    Este mensaje ha sido capturado automáticamente por el sistema de gestión de CAR-HERO.
                </p>
            </div>
        </div>

        <div style="background-color: #f8fafc; color: #94a3b8; text-align: center; padding: 20px; font-size: 11px; border-top: 1px solid #f1f5f9;">
            <p style="margin: 0;">&copy; {{ date('Y') }} CAR-HERO Engine. Todos los derechos reservados.</p>
        </div>

    </div>

</body>
</html>
