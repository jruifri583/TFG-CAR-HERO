# Defensa del TFG: CAR-HERO

**Autor**: Jose Carlos Ruiz Frias  
**Duración de la exposición**: 10 minutos  

---

## Guion de la Exposición (10 minutos)

---

### 🔹 Bloque 1 — Introducción y Problema (1 min 30 s)

> Buenos días. Mi proyecto se llama **CAR-HERO** y es una aplicación web para la **gestión integral del servicio de recogida de vehículos para la ITV**.
>
> El problema que resuelve es el siguiente: actualmente, muchos talleres y gestorías ofrecen un servicio en el que **recogen el vehículo del cliente, lo llevan a pasar la ITV y lo devuelven**. Todo este proceso se gestiona de forma manual — llamadas, WhatsApps, hojas de Excel — lo que genera **falta de trazabilidad, errores en la coordinación y cero visibilidad para el cliente** sobre el estado de su vehículo.
>
> CAR-HERO **digitaliza todo este flujo**, ofreciendo una plataforma donde el cliente solicita el servicio, el administrador asigna un empleado, y el empleado va actualizando el estado en tiempo real. Además, se gestionan los pagos, el historial de ITVs y las comunicaciones, todo desde una misma aplicación.

---

### 🔹 Bloque 2 — Arquitectura y Stack Tecnológico (2 min)

> El sistema sigue una **arquitectura cliente-servidor desacoplada**:
>
> - **Frontend**: React 18 con TypeScript, empaquetado con Vite 7 y estilizado con Tailwind CSS 4 y shadcn/ui. Los formularios se gestionan con React Hook Form y Zod para validación. La comunicación con el backend se hace mediante Axios con un interceptor que inyecta automáticamente el token Bearer en cada petición.
>
> - **Backend**: Laravel 12 con PHP 8.2, exponiendo una API REST pura. La autenticación se gestiona con Laravel Sanctum mediante tokens de acceso personal. He implementado Policies para autorización por recurso, Form Requests para validación en servidor, y una capa de servicios para la lógica de dominio compleja.
>
> - **Base de datos**: MySQL 8.0, diseñada en Tercera Forma Normal con 13 tablas interrelacionadas.
>
> - **Infraestructura**: Todo orquestado con Docker Compose. En desarrollo son 4 contenedores (frontend, backend, MySQL y phpMyAdmin) y en producción se optimiza con Nginx, PHP-FPM, Supervisor y certificados SSL de Let's Encrypt gestionados por Certbot.

---

### 🔹 Bloque 3 — Funcionalidades Clave (2 min 30 s)

> El sistema opera con **tres roles diferenciados**: Cliente, Empleado y Administrador, cada uno con su propio dashboard y vistas adaptadas.
>
> **La funcionalidad central es la gestión de solicitudes**, que sigue una **máquina de estados** con 7 estados posibles: Pendiente → Asignado → En Recogida → En ITV → Retornando → Finalizado, y en cualquier punto anterior, Cancelado. Cada transición tiene precondiciones: por ejemplo, no puedes finalizar sin una resolución de la ITV, y un empleado no puede recoger un segundo vehículo sin haber entregado el primero.
>
> **Otras funcionalidades destacadas**:
> - **Dashboard** con gráficos interactivos (Recharts) que muestran solicitudes por estado y por mes.
> - **Geolocalización**: cada solicitud captura coordenadas GPS y muestra un mapa con la ubicación de recogida.
> - **Tracker circular de progreso** que muestra visualmente en qué fase se encuentra la solicitud.
> - **Gestión de pagos** con tres métodos (efectivo, tarjeta, transferencia) vinculados 1:1 a cada solicitud.
> - **Sistema de contacto** con protección anti-spam mediante Cloudflare Turnstile y envío de emails asíncronos a través de Resend y Laravel Queues.
> - **Autenticación con Google OAuth 2.0** además del login tradicional.

---

### 🔹 Bloque 4 — Seguridad (1 min 30 s)

> La seguridad se implementa en **múltiples capas**:
>
> - **Autenticación**: Laravel Sanctum con tokens que expiran a las 12 horas — suficiente para un turno laboral pero protege ante extravío de dispositivos.
> - **Autorización**: Doble nivel. En el frontend, un componente `ProtectedRoute` verifica el rol antes de renderizar. En el backend, cada recurso tiene su propia Policy con un método `before()` que concede acceso total al administrador.
> - **Validación**: Doble también. Zod valida en el cliente para dar feedback inmediato, y los Form Requests de Laravel validan en el servidor para impedir manipulaciones por red.
> - **Política de contraseñas**: Mínimo 8 caracteres con mayúsculas, minúsculas, números y símbolos, validado en ambos lados.
> - **CORS**: Configurado explícitamente para aceptar solo peticiones del dominio del frontend.
> - **Cifrado SSL** obligatorio en producción con certificados Let's Encrypt.
> - **Prepared statements** de Eloquent que eliminan el riesgo de SQL Injection.

---

### 🔹 Bloque 5 — Despliegue y Producción (1 min 30 s)

> He preparado **dos entornos completamente diferenciados**:
>
> - En **desarrollo**, el frontend corre con Vite (HMR), el backend con el servidor built-in de PHP y se incluye phpMyAdmin para inspección.
>
> - En **producción** (AWS EC2), el frontend se compila en un build multi-stage y se sirve con Nginx Alpine. El backend usa PHP-FPM + Nginx gestionados por Supervisor, que además ejecuta el Queue Worker para los emails. MySQL no expone su puerto al exterior, y phpMyAdmin se elimina por seguridad.
>
> El despliegue se automatiza con un script `deploy.sh` que verifica prerrequisitos, construye los contenedores, espera a que MySQL esté listo, ejecuta migraciones y cachea la configuración de Laravel.
>
> Para SSL, he integrado un contenedor de Certbot que comparte volúmenes con Nginx y renueva los certificados automáticamente cada 12 horas.

---

### 🔹 Bloque 6 — Conclusiones y Mejoras Futuras (1 min)

> En conclusión, CAR-HERO es un sistema **funcional, seguro y desplegable en producción** que digitaliza un servicio real con trazabilidad completa.
>
> Como **mejoras futuras** destacaría:
> - **WebSockets** para notificaciones en tiempo real sobre la ubicación del vehículo.
> - **Pasarela de pago** bancaria con Stripe o Redsys.
> - **Firma digital** para albaranes de entrega y recogida.
> - **PWA con modo offline** para que los empleados operen en zonas sin cobertura.
> - **Autenticación 2FA** para roles críticos.
>
> Muchas gracias. Estoy abierto a preguntas.

---

## Banco de Preguntas y Respuestas

---

### 📐 Arquitectura y Diseño

#### P1: ¿Por qué elegiste React + Laravel en vez de un monolito como Laravel con Blade?

> Opté por una **arquitectura desacoplada** porque ofrece varias ventajas: el frontend y el backend pueden desarrollarse, desplegarse y escalarse de forma independiente. React proporciona una experiencia de usuario mucho más fluida con su sistema de componentes reactivos, sin recargas de página completas. Además, al exponer una API REST pura, el backend queda preparado para servir a futuras aplicaciones móviles sin ningún cambio.

#### P2: ¿Por qué Laravel y no otro framework como Symfony o Express.js?

> Laravel ofrece un ecosistema muy completo "out of the box": Eloquent ORM, Sanctum para autenticación por tokens, Policies para autorización, Form Requests para validación, y un sistema de colas integrado. Symfony es más modular pero requiere más configuración manual. Express.js habría sido viable, pero Laravel me permitió avanzar más rápido al tener convenciones claras y una comunidad muy activa.

#### P3: ¿Qué es la capa de servicios y por qué la implementaste?

> Los servicios (`SolicitudService` y `HistorialService`) encapsulan la lógica de dominio compleja fuera de los controladores. `SolicitudService` gestiona toda la máquina de estados: verifica precondiciones, valida transiciones, actualiza timestamps y registra datos automáticos. Esto sigue el principio de responsabilidad única — el controlador solo orquesta la petición HTTP, y el servicio contiene las reglas de negocio.

#### P4: ¿Qué patrones de diseño has utilizado?

> He implementado varios: **MVC** como base de Laravel, **Service Layer** para desacoplar lógica de dominio, **Policy-based Authorization** para autorización por recurso, **Observer/Event** con los eventos `creating` y `updating` de Eloquent, **Interceptor Pattern** con el interceptor de Axios, **Context Provider** en React para estado global, **Route Guards** para protección de vistas, y **Backed Enums** de PHP 8.2 para valores constantes tipados.

---

### 🔒 Seguridad

#### P5: ¿Por qué Sanctum y no JWT?

> Sanctum es la solución oficial de Laravel para SPAs y está integrado nativamente. Los tokens de acceso personal que genera se almacenan hasheados en base de datos, lo que permite revocarlos individualmente (algo que JWT no soporta de forma nativa). Además, al configurar la expiración a 720 minutos, si un dispositivo se pierde, el token caduca automáticamente. JWT es stateless y más complejo de invalidar.

#### P6: ¿Cómo previenen las SQL Injection?

> Eloquent ORM utiliza **prepared statements** internamente en todas las consultas. Los valores se pasan como parámetros vinculados, nunca se concatenan directamente en la query SQL. Además, los Form Requests validan y sanitizan los datos antes de que lleguen al modelo.

#### P7: ¿Qué pasa si alguien manipula las peticiones desde el navegador para saltarse el ProtectedRoute?

> El `ProtectedRoute` es solo la primera línea de defensa para la UX. La protección real está en el backend: cada endpoint está protegido por el middleware `auth:sanctum` y las Policies correspondientes. Si alguien intenta acceder a un endpoint de administrador sin serlo, Laravel devuelve un 403 Forbidden antes de ejecutar cualquier lógica.

#### P8: ¿Cómo gestionas la expiración del token en el frontend?

> El token se almacena en `localStorage` y se envía automáticamente en cada petición a través del interceptor de Axios. Si el token expira, el backend devuelve un 401 Unauthorized. El frontend puede detectar esta respuesta y redirigir al usuario a la pantalla de login. Los 720 minutos están pensados para cubrir un turno laboral completo sin interrupciones.

#### P9: ¿No es inseguro guardar el token en localStorage?

> Es una práctica aceptada para SPAs con API REST. La alternativa sería httpOnly cookies, pero eso requiere que frontend y backend compartan dominio, lo cual no se da en esta arquitectura dockerizada. El riesgo principal de localStorage es un ataque XSS, pero React escapa automáticamente todo el contenido renderizado, mitigando ese vector. Además, los tokens expiran y están hasheados en la base de datos.

---

### 🗄️ Base de Datos

#### P10: ¿Por qué los estados están en una tabla separada y no como ENUM en la columna?

> Un ENUM en MySQL es rígido: añadir o modificar un valor requiere una migración ALTER TABLE. Con una tabla separada, puedo agregar nuevos estados simplemente insertando un registro, sin tocar la estructura. Además, me permite almacenar metadatos adicionales como el `slug` y el `nombre`, y la lógica del orden se gestiona en un PHP Backed Enum (`EstadoSlug::orden()`).

#### P11: ¿Por qué relación 1:1 entre solicitudes y pagos/historiales?

> Cada solicitud genera como máximo un pago y un registro de historial. Separar estas entidades en tablas propias evita que la tabla de solicitudes crezca con columnas que solo se rellenan al final del flujo. Además, permite hacer queries específicas sobre pagos o historiales sin cargar toda la información de la solicitud.

#### P12: ¿Por qué borrado en cascada?

> Aplico `ON DELETE CASCADE` en entidades dependientes como vehículos y solicitudes. Si se elimina un usuario, sus vehículos y solicitudes asociadas se borran automáticamente, evitando registros huérfanos que contaminarían la base de datos. Es una decisión consciente: en un sistema real se podría optar por soft-deletes, pero para este alcance el cascade mantiene la integridad sin complejidad adicional.

#### P13: ¿Cómo resolviste el problema N+1?

> Implementé un scope `withBaseRelations()` en el modelo `Solicitud` que pre-carga todas las relaciones necesarias (cliente, vehículo, estado, empleado, resolución, pago con su método y estado) en una sola consulta usando `with()` de Eloquent. Sin esto, listar 20 solicitudes generaría más de 100 queries individuales.

---

### 🖥️ Frontend

#### P14: ¿Por qué shadcn/ui y no Material UI o Ant Design?

> shadcn/ui se basa en Radix UI, que proporciona primitivas accesibles sin estilos predefinidos. Esto me dio control total sobre el diseño visual sin tener que luchar contra los estilos de un framework. Los componentes se copian directamente al proyecto, así que puedo personalizarlos libremente. Material UI impone un sistema de diseño de Google que no encajaba con la identidad visual que buscaba.

#### P15: ¿Cómo gestionas el estado global de la aplicación?

> Uso **React Context API** con dos providers: `AuthProvider` (gestiona el usuario autenticado, login, logout y Google OAuth) y `HeaderProvider` (gestiona el contenido dinámico del header según la página). No necesité Redux ni Zustand porque la aplicación no tiene un estado complejo compartido entre muchos componentes — la mayoría de datos se obtiene directamente de la API en cada página.

#### P16: ¿Por qué React Hook Form con Zod en vez de formularios controlados simples?

> React Hook Form minimiza los re-renders al registrar los inputs de forma no controlada. En formularios complejos como el de Solicitud Detail, que tiene más de 10 campos, esto mejora significativamente el rendimiento. Zod complementa con validación TypeScript-first: defino el esquema una vez y obtengo tanto la validación como el tipado automáticamente, evitando duplicaciones.

---

### 🐳 Despliegue

#### P17: ¿Por qué Docker y no despliegue directo en el servidor?

> Docker garantiza que el entorno es **idéntico** en desarrollo y producción. Elimina el clásico "en mi máquina funciona". Además, permite levantar todo el stack con un solo comando (`docker compose up`), facilita la escalabilidad horizontal y simplifica las actualizaciones.

#### P18: ¿Por qué Supervisor en el contenedor de producción?

> En producción necesito ejecutar tres procesos simultáneamente en el contenedor del backend: PHP-FPM (que procesa las peticiones), Nginx (que sirve de reverse proxy) y el Queue Worker (que procesa los emails en segundo plano). Supervisor orquesta estos tres procesos, los reinicia automáticamente si fallan y centraliza los logs.

#### P19: ¿Por qué eliminaste phpMyAdmin en producción?

> phpMyAdmin es una interfaz web que expone directamente la base de datos. En producción, sería un vector de ataque innecesario. La administración de la BD en producción se hace mediante comandos Artisan o accediendo directamente al contenedor de MySQL vía `docker exec` si es necesario.

#### P20: ¿Cómo funciona la renovación de certificados SSL?

> Integré un contenedor de Certbot que comparte volúmenes con el contenedor de Nginx del frontend. Certbot verifica la propiedad del dominio mediante el challenge HTTP (webroot) y genera los certificados. La renovación se ejecuta automáticamente cada 12 horas. Nginx recarga la configuración para utilizar los certificados actualizados sin downtime.

---

### 📋 Metodología y Proceso

#### P21: ¿Qué metodología has seguido?

> He seguido una metodología **iterativa e incremental** organizada en 5 fases y 12 sprints de dos semanas: Análisis, Diseño, Desarrollo Backend, Desarrollo Frontend, y Pruebas/Cierre. Cada sprint tenía entregables concretos y se realizaban revisiones contra el prototipo de Figma.

#### P22: ¿Cuál fue el mayor reto técnico?

> La **máquina de estados** de las solicitudes fue el componente más complejo. Tuve que implementar precondiciones para cada transición, gestionar timestamps automáticos, y resolver dos bugs de concurrencia críticos: un empleado podía iniciar dos recogidas simultáneas, y un vehículo podía tener dos solicitudes activas. Los resolví con eventos Eloquent (`creating` y `updating`) que validan estas restricciones a nivel de modelo.

#### P23: ¿Qué harías diferente si empezaras de cero?

> Implementaría **tests automatizados** desde el principio — tanto unitarios con PHPUnit para la lógica de servicios, como tests de integración para los endpoints API. También consideraría usar **Next.js** en lugar de Vite para aprovejar el SSR y mejorar el SEO. Y probablemente usaría soft-deletes en lugar de borrado en cascada para mantener un historial completo.

---

### 🔮 Mejoras Futuras

#### P24: ¿Cómo implementarías las notificaciones en tiempo real?

> Usaría **Laravel Reverb** (el nuevo servidor WebSocket nativo de Laravel) o alternativamente **Pusher**. Cada cambio de estado en la solicitud dispararía un evento broadcast que el frontend recibiría a través de una conexión WebSocket persistente, mostrando una notificación toast en tiempo real al cliente y al administrador.

#### P25: ¿Es viable escalar el sistema a múltiples talleres?

> Sí. La arquitectura actual ya soporta la base: habría que añadir una entidad "Empresa/Taller" y convertir el sistema en multi-tenant. Cada taller tendría sus propios usuarios, vehículos y solicitudes. El scope `visibleFor()` que ya implementé en los modelos facilitaría esta transición, añadiendo el filtro por empresa a las queries existentes.

#### P26: ¿Cómo integrarías una pasarela de pago real?

> Integraría **Stripe** usando su SDK de PHP. Al finalizar una solicitud, se generaría un Payment Intent con el importe correspondiente. El frontend mostraría el formulario de pago embebido de Stripe (Stripe Elements). Un webhook de Stripe notificaría al backend cuando el pago se complete, actualizando automáticamente el estado del pago en la base de datos. Esto eliminaría la necesidad de validación manual.

---

### 🔄 Flujo de Negocio y Validaciones

#### P27: ¿Cómo impides que un vehículo tenga dos solicitudes activas a la vez?

> En el evento `creating` del modelo `Solicitud`, implementé una validación `uniqueCar()` que comprueba si el vehículo ya tiene una solicitud en un estado que no sea "finalizado" ni "cancelado". Si la tiene, Laravel lanza una excepción y la solicitud no se crea. Esta validación está a nivel de modelo, por lo que es imposible saltarla independientemente de cómo se intente crear la solicitud.

#### P28: ¿Cómo controlas que un empleado no recoja dos vehículos a la vez?

> Mediante el evento `updating` del modelo `Solicitud`. Cuando se intenta mover una solicitud al estado "en_recogida", se verifica si ese empleado ya tiene otra solicitud activa en estados intermedios (en_recogida, en_itv, retornando). Si la tiene, se bloquea la transición. Esto simula la realidad operativa: un conductor solo puede gestionar un vehículo físicamente.

#### P29: ¿Qué pasa si el cliente intenta cancelar una solicitud cuya fecha ya pasó?

> La `SolicitudPolicy` tiene un método `cancel()` que verifica dos condiciones: que la solicitud no esté en un estado terminal o avanzado (en_recogida, en_itv, retornando, finalizado, cancelado), y que la fecha programada no haya pasado. Si no cumple alguna, el backend devuelve un 403. En el frontend, el botón de cancelar ni siquiera se muestra si no se cumplen las condiciones.

#### P30: ¿Qué ocurre automáticamente cuando una solicitud se finaliza?

> Se disparan varios automatismos: primero, se registra el `hora_entrega` con la hora actual. Segundo, `HistorialService::crearDesdeSolicitud()` genera automáticamente un registro en la tabla `historiales` con la fecha de la ITV, la resolución y las notas. Tercero, se actualiza el campo `fecha_ultima_itv` del vehículo asociado. Todo esto sucede en `SolicitudService`, encapsulado como una transacción lógica.

#### P31: ¿Los timestamps (hora_recogida, hora_itv, hora_entrega) se asignan manualmente?

> No, son automáticos. En el evento `updating` del modelo `Solicitud`, el método `automaticHour()` detecta cuándo cambia el `estado_id` y asigna `now()` al campo correspondiente. Si pasa a "en_recogida", se registra `hora_recogida`; si pasa a "en_itv", `hora_itv`; si pasa a "finalizado", `hora_entrega`. Esto garantiza que los tiempos sean reales y no manipulables.

#### P32: ¿Cómo validas el NIF/NIE en el frontend?

> Implementé una validación personalizada con Zod que verifica tanto el formato como la **letra de control**. Para DNIs (8 dígitos + letra), se calcula el módulo 23 del número y se compara con la tabla oficial de letras. Para NIEs (X/Y/Z + 7 dígitos + letra), se reemplaza la primera letra por su equivalente numérico (X=0, Y=1, Z=2) y se aplica el mismo algoritmo. Si la letra no coincide, el formulario muestra un error inmediato.

---

### 🐳 Docker e Infraestructura

#### P33: ¿Cómo se comunican los contenedores entre sí?

> Docker Compose crea una red bridge interna donde cada contenedor se puede resolver por su nombre de servicio. El backend se conecta a la base de datos usando `db` como hostname (no `localhost`). El frontend en producción usa Nginx como reverse proxy que redirige `/api/*` al contenedor del backend por su nombre interno. Ningún servicio necesita conocer IPs.

#### P34: ¿Qué es el healthcheck de MySQL y por qué lo implementaste?

> En `docker-compose.yml`, el servicio MySQL tiene un healthcheck que ejecuta `mysqladmin ping` periódicamente. El backend tiene un `depends_on` con `condition: service_healthy`, lo que significa que no arranca hasta que MySQL responda correctamente. Sin esto, el backend intentaría conectarse a una base de datos que aún está inicializándose y fallaría.

#### P35: ¿Qué diferencia hay entre el Dockerfile de desarrollo y el de producción del frontend?

> En desarrollo uso directamente `node:20-bullseye` con `npm run dev` — Vite sirve los archivos sin compilar con Hot Module Replacement. En producción uso un **multi-stage build**: la primera etapa compila el proyecto con `npm run build` generando archivos estáticos optimizados, y la segunda etapa copia esos archivos a una imagen `nginx:alpine` ultraligera que solo pesa unos 25 MB y sirve los estáticos con compresión gzip y cache de un año.

#### P36: ¿Por qué PHP-FPM en producción y no el servidor built-in de PHP?

> El servidor built-in de PHP (`php -S`) es single-threaded y está diseñado solo para desarrollo. En producción, PHP-FPM gestiona un pool de procesos worker que pueden atender múltiples peticiones concurrentes. Combinado con Nginx como reverse proxy, es la configuración estándar de la industria para aplicaciones PHP en producción.

#### P37: ¿Cómo gestionas los volúmenes persistentes?

> MySQL tiene un volumen Docker nombrado (`mysql_data`) que persiste los datos de la base de datos entre reinicios de contenedores. Las imágenes subidas por los usuarios se almacenan en un volumen mapeado al directorio `storage/app/public` del backend. En producción, los certificados SSL de Certbot también se persisten en volúmenes compartidos con Nginx.

---

### 📧 Emails y Comunicaciones

#### P38: ¿Por qué Resend y no SMTP directo o SendGrid?

> Resend ofrece una API moderna y sencilla, diseñada específicamente para desarrolladores. A diferencia de SMTP directo (que puede ser bloqueado por proveedores de email y es más lento), Resend garantiza una alta tasa de entrega. Además, tiene un tier gratuito generoso para este tipo de proyectos. SendGrid habría sido viable, pero Resend tiene una integración más directa con Laravel.

#### P39: ¿Qué son las Laravel Queues y por qué las usas para emails?

> Las Queues permiten despachar tareas al segundo plano. Sin ellas, cuando un usuario envía un formulario de contacto, la API tendría que esperar a que el email se envíe (1-3 segundos) antes de responder. Con `ShouldQueue` en los Mailables, la petición API responde inmediatamente y el email se procesa en segundo plano por el Queue Worker. Uso `database` como driver de colas, almacenando los jobs en la tabla `jobs` de MySQL.

#### P40: ¿Cómo funciona el sistema de respuesta a mensajes de contacto?

> El administrador ve los mensajes en la sección "Mensajes". Puede marcarlos como leídos y responder directamente. Al responder, se envía un email al remitente usando `ResponderContactoMailable` (procesado asíncronamente por la cola), y la respuesta se almacena en el campo `respuesta` de la tabla `mensajes_contacto` junto con un timestamp `respondido_at`, manteniendo un registro completo de la comunicación.

---

### 🎨 UI/UX y Frontend Avanzado

#### P41: ¿Cómo implementaste las vistas condicionales por rol?

> En lugar de crear pantallas separadas para cada rol, utilizo renderizado condicional en React. Por ejemplo, en `SolicitudDetail.tsx`, el componente principal detecta el rol del usuario y renderiza `EmpleadoDetailView` o `StandardDetailView` según corresponda. Cada vista muestra solo los campos y acciones relevantes para ese rol. Esto reduce la duplicación de código y facilita el mantenimiento.

#### P42: ¿Cómo funciona el tracker circular de progreso de las solicitudes?

> Es un componente personalizado (`SolicitudCircularTracker`) que renderiza un SVG circular con segmentos que representan cada estado del flujo. Calcula el progreso basándose en la posición del estado actual dentro del array ordenado de estados. Los segmentos completados se colorean con el color primario, el actual pulsa con una animación, y los pendientes se muestran en gris. Es totalmente dinámico y se adapta al número de estados.

#### P43: ¿Cómo gestionas la geolocalización y los mapas?

> Cuando se crea una solicitud, se capturan las coordenadas GPS (`latitud` y `longitud`) de la dirección de recogida. En el detalle de la solicitud, se muestra un mapa integrado que geolocaliza la ubicación exacta. Las coordenadas se validan en el backend con rangos válidos (-90/90 para latitud, -180/180 para longitud) para evitar datos corruptos.

#### P44: ¿Qué es el sistema de notificaciones toast que usas?

> Uso **Sonner**, una librería ligera de notificaciones toast para React. La configuré globalmente en `App.tsx` con `richColors` para que los toasts de éxito, error y advertencia tengan colores diferenciados. Los uso para feedback inmediato: confirmaciones de guardado, errores de validación, y especialmente para **confirmaciones de acciones destructivas** como eliminar un vehículo o cancelar una solicitud, donde el toast muestra un botón de "Confirmar" antes de ejecutar la acción.

#### P45: ¿Por qué usas un interceptor de Axios en vez de pasar el token manualmente?

> El interceptor centraliza la lógica de autenticación en un solo punto. Sin él, tendría que añadir `headers: { Authorization: 'Bearer ...' }` en cada una de las más de 50 llamadas API del frontend. Con el interceptor, configuro la instancia de Axios una vez en `lib/axios.ts` y automáticamente todas las peticiones llevan el token. Además, si cambio el mecanismo de autenticación, solo toco un archivo.

---

### 🧪 Testing y Calidad

#### P46: ¿Has implementado tests automatizados?

> No he implementado tests unitarios ni de integración formales en este proyecto. Las pruebas se han realizado de forma manual y funcional, verificando cada flujo contra los requisitos del prototipo Figma. Es una de las mejoras que implementaría: tests con PHPUnit para los servicios de dominio (especialmente la máquina de estados), tests de integración para los endpoints API, y tests E2E con Cypress o Playwright para los flujos de usuario completos.

#### P47: ¿Cómo verificas que las validaciones funcionan correctamente?

> Las validaciones se verifican en dos niveles. En el frontend, Zod muestra errores inline en tiempo real mientras el usuario escribe. En el backend, si un Form Request falla, Laravel devuelve automáticamente un JSON con los errores de validación y un código 422. He probado manualmente casos límite como emails duplicados, NIFs inválidos, contraseñas débiles y transiciones de estado ilegales para confirmar que ambas capas responden correctamente.

---

### 🔍 Preguntas Trampa / Generales

#### P48: ¿Qué ventaja tiene TypeScript sobre JavaScript puro?

> TypeScript añade **tipado estático** que detecta errores en tiempo de compilación, no en ejecución. En un proyecto de este tamaño, con interfaces como `Solicitud`, `Vehiculo` o `User` que tienen muchos campos, TypeScript me avisa inmediatamente si intento acceder a una propiedad que no existe o si paso un tipo incorrecto a una función. Además, proporciona autocompletado en el IDE, lo que acelera enormemente el desarrollo.

#### P49: ¿Por qué MySQL y no PostgreSQL o MongoDB?

> MySQL es el motor relacional más extendido y tiene excelente compatibilidad con Laravel y Docker. PostgreSQL habría sido igualmente válido y ofrece algunas ventajas (tipos de datos más ricos, mejor rendimiento en queries complejas), pero MySQL era suficiente para el alcance de este proyecto. MongoDB no era adecuado porque los datos del sistema son altamente relacionales (solicitudes vinculan clientes, vehículos, estados, pagos...) y un modelo documental complicaría las consultas.

#### P50: ¿Cómo garantizas la consistencia de datos entre frontend y backend?

> Mediante una estrategia de **validación dual**: los esquemas Zod en el frontend replican las reglas de los Form Requests de Laravel. Si un campo es obligatorio en el backend, también lo es en Zod. Si tiene un máximo de caracteres, se refleja en ambos lados. El frontend valida primero para dar feedback rápido, pero el backend siempre revalida porque nunca se puede confiar en datos que vienen del cliente — pueden haber sido manipulados.

---

## Consejos para la Defensa

> [!TIP]
> - **Controla el tiempo**: Practica el guion hasta ajustarte a los 10 minutos. Lleva un reloj visible.
> - **Demo en vivo**: Si es posible, muestra brevemente la aplicación funcionando (login → dashboard → crear solicitud → avanzar estados). Una demo impresiona más que 10 diapositivas.
> - **No leas**: Usa el guion como guía, pero habla con naturalidad. Los profesores valoran que domines el tema.
> - **Anticipa preguntas**: Las preguntas más frecuentes son sobre seguridad, base de datos y decisiones técnicas. Las respuestas de arriba te preparan para ello.
> - **Si no sabes algo, sé honesto**: "No he llegado a implementar eso, pero lo abordaría con..." siempre es mejor que inventar.
> - **Cierra con fuerza**: Termina con las mejoras futuras para demostrar que tienes visión de producto.
