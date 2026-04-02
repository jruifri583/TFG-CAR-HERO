<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Nuevo mensaje de contacto</title>
</head>
<body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #0088ff;">Nuevo Mensaje de Contacto</h2>
        
        <p>Has recibido un nuevo mensaje desde el formulario de contacto de CAR-HERO.</p>
        
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>De:</strong> {{ $nombre }} ({{ $email }})</p>
            <hr style="border: 0; border-top: 1px solid #ddd; margin: 15px 0;">
            <p><strong>Mensaje:</strong></p>
            <p style="white-space: pre-wrap;">{{ $mensaje }}</p>
        </div>

        <p style="font-size: 13px; color: #888; text-align: center;">
            Este mensaje ha sido generado automáticamente por CAR-HERO.
        </p>
    </div>
</body>
</html>
