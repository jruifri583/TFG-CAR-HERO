# Guía de Preparación para la Defensa del TFG: CAR-HERO

Este documento contiene un conjunto de preguntas altamente detalladas y exhaustivas para preparar tu defensa de TFG. Las preguntas se basan en una inspección de bajo nivel de tu código fuente (backend Laravel, frontend React y entorno Docker), identificando decisiones técnicas específicas, áreas de optimización y posibles críticas del tribunal.

---

## 1. Arquitectura y Decisiones de Diseño Globales

> [!NOTE]
> En esta sección, el tribunal evaluará tu capacidad para estructurar un proyecto de software moderno y tu justificación para elegir ciertas tecnologías sobre otras.

### Pregunta 1.1: ¿Por qué elegiste un diseño desacoplado (Backend API en Laravel y Frontend SPA en React) en lugar de una arquitectura integrada y monolítica tradicional (como Laravel con Blade o Livewire)?
* **Enfoque del jurado:** Buscan saber si comprendes los pros y contras de separar la interfaz de usuario de la lógica de negocio.
* **Respuesta del alumno (Guía):**
  * **Separación de responsabilidades (SoC):** El backend se enfoca puramente en la lógica de negocio, validaciones, procesamiento asíncrono e interacción con la base de datos a través de una API RESTful limpia. El frontend se encarga únicamente de la renderización y la experiencia del usuario (UX).
  * **Escalabilidad y reutilización:** Al exponer servicios mediante una API REST, en el futuro se podría crear una aplicación móvil nativa (iOS/Android) o integrar servicios de terceros sin tener que modificar o reescribir la lógica del servidor.
  * **Rendimiento e interactividad:** React permite construir una Single Page Application (SPA) altamente dinámica, donde las transiciones de página son instantáneas y la comunicación se realiza de manera asíncrona mediante JSON, reduciendo la carga del servidor al no requerir renderización de HTML en el lado del servidor (SSR) para cada página.

### Pregunta 1.2: ¿Qué patrón de arquitectura has aplicado en tu backend de Laravel y cómo estructuras la lógica de negocio?
* **Enfoque del jurado:** Evalúan si conoces patrones de diseño y si evitas el antipatrón del "Fat Controller" (controladores sobrecargados).
* **Respuesta del alumno (Guía):**
  * **Patrón de Capas:** He estructurado el backend dividiendo las responsabilidades en capas bien definidas:
    1. **Capa de Entrada/Rutas:** Mapea los endpoints HTTP.
    2. **Capa de Controladores (Controllers):** Actúan únicamente como orquestadores. Reciben la petición validada, invocan los servicios correspondientes y devuelven respuestas HTTP consistentes.
    3. **Capa de Validación (Form Requests):** Filtra y valida los datos de entrada antes de que lleguen al controlador (ej. [StoreSolicitudRequest](file:///c:/Users/david/Documents/TFG-CAR-HERO/backend/app/Http/Requests/StoreSolicitudRequest.php)).
    4. **Capa de Servicios (Services):** Contiene las reglas y el flujo de negocio complejo. Por ejemplo, [SolicitudService](file:///c:/Users/david/Documents/TFG-CAR-HERO/backend/app/Services/SolicitudService.php) encapsula la lógica de asignación automática, validaciones adicionales y transiciones de estado.
    5. **Capa de Datos/Modelos (Eloquent):** Define el esquema, relaciones y scopes de consulta (ej. [Solicitud](file:///c:/Users/david/Documents/TFG-CAR-HERO/backend/app/Models/Solicitud.php)).

---

## 2. Backend y Programación en Laravel

> [!IMPORTANT]
> Esta sección se centra en la lógica de programación PHP, persistencia de datos y el flujo de negocio implementado en tu servidor de Laravel.

### Pregunta 2.1: En el modelo `Solicitud.php` utilizas los eventos de Eloquent (`booted`, `creating`, `updating`) para ejecutar validaciones complejas de negocio. ¿Por qué decidiste acoplar esta lógica al ciclo de vida del modelo y qué riesgos conlleva este enfoque?
* **Enfoque del jurado:** Cuestionan si conoces las limitaciones de Eloquent y los efectos colaterales de su ciclo de vida.
* **Respuesta del alumno (Guía):**
  * **Justificación:** Al ubicar validaciones críticas (como evitar que un vehículo tenga más de una solicitud activa en `uniqueCar`, o que un empleado inicie dos trayectos simultáneos en `automaticHour`) en los eventos del modelo, garantizo la integridad de los datos de forma consistente en cualquier punto del sistema donde se instancie y guarde el modelo, no solo a través del controlador HTTP.
  * **Riesgos identificados:** Los eventos de Eloquent (como `updating` o `creating`) **no se disparan** si se realizan operaciones de base de datos en bloque utilizando métodos directos como `Solicitud::where(...)->update(...)` o inserciones masivas. 
  * **Alternativa de diseño:** Una alternativa más robusta de cara al futuro para proyectos de gran energadura sería mover completamente estas reglas de negocio a la capa de servicios o implementar un *State Pattern* para gestionar las transiciones de estado de forma explícita.

### Pregunta 2.2: En `SolicitudService.php`, el método `cambiarEstado` obliga a avanzar de manera secuencial (posición N a N+1). ¿Por qué decidiste modelarlo de esta forma y cómo gestionas los estados excepcionales (como una cancelación directa)?
* **Enfoque del jurado:** Evalúan la flexibilidad de tu diseño frente a cambios reales del flujo operativo.
* **Respuesta del alumno (Guía):**
  * **Lógica secuencial:** El flujo principal exige un orden lógico (ej. Pendiente -> Asignado -> En Recogida -> En ITV -> Retornando -> Finalizado) para garantizar la consistencia en el seguimiento del vehículo y evitar saltos incoherentes (como finalizar un servicio antes de que se haya recogido el coche).
  * **Gestión de excepciones (Cancelación):** Para flujos no secuenciales como la cancelación, no se utiliza el método general `cambiarEstado` de la máquina de estados secuencial. En su lugar, el controlador expone un endpoint específico `cancelar` en [SolicitudController](file:///c:/Users/david/Documents/TFG-CAR-HERO/backend/app/Http/Controllers/Api/SolicitudController.php#L130-L144) que cambia directamente el estado a "Cancelado" tras comprobar mediante políticas (`$this->authorize('cancel', $solicitud)`) que se cumplen las precondiciones necesarias.

### Pregunta 2.3: ¿Qué es un Accessor en Eloquent y por qué implementaste el método `getImagenAttribute` en el modelo `User.php`?
* **Enfoque del jurado:** Quieren verificar si entiendes las herramientas de formateo de datos que ofrece Laravel para API JSON.
* **Respuesta del alumno (Guía):**
  * **Definición:** Un Accessor es un método de Eloquent que intercepta la lectura de un atributo de la base de datos y permite transformarlo dinámicamente antes de devolverlo.
  * **Lógica aplicada:** En [User.php:getImagenAttribute](file:///c:/Users/david/Documents/TFG-CAR-HERO/backend/app/Models/User.php#L83-L96) utilicé un Accessor para resolver las diferentes fuentes de imágenes de perfil del usuario:
    1. Si no tiene imagen (`!$value`), devuelve de forma dinámica la URL de un avatar genérico.
    2. Si el valor es una URL externa (ej. tras el registro con Google OAuth), la devuelve tal cual.
    3. Si el valor es una imagen local subida al servidor, concatena la ruta del almacenamiento con la URL base actual de la aplicación (`config('app.url')`).
  * **Beneficio:** Garantiza que el cliente frontend siempre reciba una URL absoluta y completamente válida, abstrayendo al frontend de saber dónde y cómo se almacena físicamente el archivo.

### Pregunta 2.4: Al hacer login o registro en `AuthController.php`, ejecutas `$user->tokens()->delete();` antes de crear uno nuevo. ¿Por qué implementaste esta limpieza previa?
* **Enfoque del jurado:** Evalúan buenas prácticas de seguridad e higiene de la base de datos en sesiones de usuario.
* **Respuesta del alumno (Guía):**
  * **Higiene de BD y control de sesiones:** Al borrar los tokens anteriores con `$user->tokens()->delete()` antes de otorgar el nuevo plainTextToken de Sanctum, consigo dos cosas:
    1. **Prevenir fugas de almacenamiento:** Evito que la tabla `personal_access_tokens` crezca de forma indefinida con tokens obsoletos de sesiones que el usuario nunca cerró formalmente.
    2. **Seguridad (Única sesión por dispositivo):** Implemento una política implícita de sesión activa única. Si un token antiguo fue robado o interceptado de un cliente, este quedará inmediatamente invalidado al volver a autenticarse en un nuevo dispositivo.

### Pregunta 2.5: En `HistorialController.php` utilizas `$this->authorizeResource(Historial::class, 'historial');` en el constructor. ¿Cómo funciona esto a diferencia de autorizar individualmente en cada método?
* **Enfoque del jurado:** Evalúan si conoces y aprovechas las abstracciones del framework para reducir código duplicado.
* **Respuesta del alumno (Guía):**
  * **Mapeo automático:** El método `authorizeResource` de Laravel mapea automáticamente las firmas de los métodos estándar de un controlador de recursos (index, show, create, store, edit, update, destroy) a las habilidades correspondientes de la Policy registrada para el modelo (`viewAny`, `view`, `create`, `update`, `delete`).
  * **Beneficio:** Garantiza que la seguridad esté activada "por defecto" para todo el recurso sin requerir llamadas individuales a `$this->authorize()` en cada endpoint, evitando errores humanos de omisión y simplificando el código.

---

## 3. Base de Datos, Rendimiento y Optimización

> [!IMPORTANT]
> A nivel de base de datos, el jurado prestará especial atención al rendimiento y las consultas del backend.

### Pregunta 3.1: ¿Qué es el problema de consultas "N+1" en sistemas ORM (Object-Relational Mapping) y cómo lo has evitado en tu proyecto?
* **Enfoque del jurado:** Un clásico de bases de datos. Quieren saber si tu código es eficiente o si satura la base de datos con peticiones repetitivas.
* **Respuesta del alumno (Guía):**
  * **Problema N+1:** Ocurre cuando se consulta una lista de registros (1 consulta para obtener los N registros principales) y luego, por cada uno de ellos, el ORM realiza una consulta adicional para obtener sus relaciones (N consultas adicionales). Para 100 solicitudes, se harían 101 consultas.
  * **Solución aplicada (Eager Loading):** En mi scope local `scopeWithBaseRelations` en el modelo [Solicitud](file:///c:/Users/david/Documents/TFG-CAR-HERO/backend/app/Models/Solicitud.php#L240-L244), utilizo el método `with()` para precargar las relaciones comunes (`cliente`, `vehiculo`, `estado`, `empleado`, etc.) de forma agrupada en una o dos consultas SQL globales utilizando `IN (...)`. Esto reduce drásticamente las consultas a la base de datos a un número fijo (generalmente 2 o 3 consultas en total), independientemente del volumen de datos solicitados.

### Pregunta 3.2: En tus modelos `Pago.php` y `User.php` utilizas subconsultas con `whereIn` en lugar de `whereHas` en los scopes `scopeVisibleFor` y `scopeClientes`. ¿Por qué esto es más óptimo?
* **Enfoque del jurado:** Demuestra un entendimiento avanzado de la traducción de Eloquent a SQL y optimización de base de datos.
* **Respuesta del alumno (Guía):**
  * **El problema de `whereHas`:** Por defecto, `whereHas` traduce la consulta utilizando la cláusula `EXISTS` con una subconsulta correlacionada. En motores relacionales como MySQL, las consultas correlacionadas a veces se ejecutan fila por fila sobre la tabla exterior, lo que degrada gravemente el rendimiento cuando la tabla de Solicitudes o Pagos crece.
  * **La optimización con `whereIn`:** Al usar `whereIn` en [Pago.php](file:///c:/Users/david/Documents/TFG-CAR-HERO/backend/app/Models/Pago.php#L45-L55) combinado con un `select('id')` en la subconsulta, forzamos a MySQL a realizar una consulta plana no correlacionada (Semi-Join). El motor evalúa la subconsulta interna una única vez en memoria y luego realiza el filtrado principal de forma instantánea, lo cual es mucho más rápido y scalables.

### Pregunta 3.3: ¿Qué es un índice de base de datos? En tu migración `add_indexes_to_solicitudes.php` creaste índices explícitos sobre `created_at` y `fecha_programada`. ¿Por qué en esos campos específicos?
* **Enfoque del jurado:** Evalúan si sabes cómo mejorar la velocidad de búsqueda a nivel físico de la base de datos.
* **Respuesta del alumno (Guía):**
  * **Definición de Índice:** Es una estructura de datos (generalmente un árbol B+ a nivel físico) que la base de datos mantiene para realizar búsquedas y ordenaciones ultra rápidas sobre ciertas columnas, evitando tener que leer toda la tabla secuencialmente (Table Scan).
  * **Justificación de campos:**
    * `created_at`: Es el criterio principal de ordenación en casi todas nuestras consultas de listados de actividad reciente del dashboard y listados generales de administración.
    * `fecha_programada`: Lo usamos constantemente para filtrar por rangos de fechas de hoy y para que el empleado ordene sus tareas de prioridad.
  * **Inconveniente de los índices:** No debemos indexar todos los campos de la tabla, porque cada índice consume espacio en disco y ralentiza las operaciones de escritura (`INSERT`, `UPDATE`, `DELETE`), ya que el motor debe actualizar el árbol del índice cada vez que cambian los datos.

### Pregunta 3.4: En tu migración de índices utilizas sentencias SQL directas (`SHOW INDEX FROM...` y `ALTER TABLE...`) en lugar del Schema Builder de Laravel. ¿Por qué lo hiciste así y qué riesgos tiene a nivel de portabilidad?
* **Enfoque del jurado:** Evalúan tus conocimientos de abstracción de motores y robustez de migraciones.
* **Respuesta del alumno (Guía):**
  * **Diseño defensivo:** Se implementó de forma cruda con [SHOW INDEX](file:///c:/Users/david/Documents/TFG-CAR-HERO/backend/database/migrations/2026_03_25_000000_add_indexes_to_solicitudes.php#L10-L19) para inspeccionar de manera defensiva si los índices ya existían en la base de datos activa antes de intentar crearlos, evitando así que fallaran los comandos de migración si se ejecutaban en entornos con esquemas ligeramente desalineados.
  * **Riesgo de portabilidad:** Usar sentencias crudas SQL rompe la abstracción del ORM de Laravel. Esa sintaxis es exclusiva de MySQL/MariaDB. Si en producción quisiéramos cambiar el motor de base de datos a PostgreSQL, SQLite o SQL Server, la migración fallaría por completo porque no reconocerían comandos específicos como `SHOW INDEX`. La alternativa portable correcta habría sido usar los métodos nativos `$table->index(...)` controlados por el Schema Builder de Laravel.

### Pregunta 3.5: Si dos clientes intentaran de forma concurrente (exactamente al mismo milisegundo) reservar el mismo vehículo, ¿podría ocurrir una condición de carrera (Race Condition)? ¿Cómo maneja tu aplicación la concurrencia a nivel de base de datos?
* **Enfoque del jurado:** Evalúan conocimientos de transacciones y consistencia concurrente.
* **Respuesta del alumno (Guía):**
  * **Situación actual:** Actualmente, el sistema utiliza comprobaciones en el hilo de ejecución de PHP con `exists()` (en el evento `uniqueCar` del modelo). Si las dos peticiones ocurren simultáneamente, existe una pequeña ventana de tiempo en la que ambas llamadas a `exists()` podrían devolver `false` (porque ninguno de los dos registros ha sido insertado formalmente aún), permitiendo que se creen solicitudes duplicadas para el mismo vehículo.
  * **Soluciones/Mejoras para producción:**
    1. **Bloqueos a nivel de base de datos:** Implementar bloqueos pesimistas (`lockForUpdate` de Laravel) dentro de una transacción de base de datos para forzar a que la segunda consulta espere a que termine la primera transacción.
    2. **Restricciones únicas de base de datos:** Añadir un índice único compuesto (ej. `vehiculo_id` y un estado no terminal) a nivel de esquema de base de datos (migración MySQL), delegando la restricción de integridad al motor de base de datos, lo que provocaría un error del motor SQL que Laravel capturaría y manejaría.

### Pregunta 3.6: En `PagoController.php` cargas relaciones anidadas utilizando la sintaxis `Pago::with(['solicitud.cliente', ...])`. ¿Qué significa esto y qué ventaja aporta frente a cargar únicamente `with('solicitud')`?
* **Enfoque del jurado:** Evalúan tu comprensión avanzada sobre cargas diferidas (Eager Loading) a múltiples niveles de profundidad.
* **Respuesta del alumno (Guía):**
  * **Carga Anidada:** Al usar el punto (`solicitud.cliente`), le indicamos a Eloquent que no solo traiga de forma agrupada el registro de la `solicitud` vinculada al pago, sino que además traiga la relación del `cliente` asociada a esa `solicitud`.
  * **Ventaja:** En el listado de la pantalla de pagos del panel de administración ([Pagos.tsx](file:///c:/Users/david/Documents/TFG-CAR-HERO/frontend/src/pages/Pagos.tsx)) necesitamos pintar el nombre del cliente que realizó el pago. Si solo cargáramos `with('solicitud')`, al renderizar cada fila del listado se ejecutaría una consulta SQL adicional para obtener el cliente de esa solicitud (Lazy Loading), provocando un grave problema N+1. Con la carga anidada, todo se resuelve de forma ultra eficiente en un número constante de consultas.

### Pregunta 3.7: En el método `store` de `PagoController.php` creas el Pago y luego actualizas manualmente el `pago_id` de la `Solicitud`. ¿Por qué definiste esta doble referencia y qué problemas de diseño relacional plantea?
* **Enfoque del jurado:** Pregunta técnica y crítica sobre normalización y diseño físico de bases de datos.
* **Respuesta del alumno (Guía):**
  * **El problema (Redundancia circular):** Se implementó una clave foránea en la tabla `pagos` (`solicitud_id`) y otra en la tabla `solicitudes` (`pago_id`). Esto genera una dependencia circular que obliga al backend a realizar dos operaciones de escritura secuenciales (crear el pago y luego actualizar la solicitud). Además, dificulta el control de integridad a nivel de base de datos y aumenta el riesgo de bloqueos concurrentes.
  * **Propuesta de refactorización:** Debemos normalizar el esquema eliminando el campo `pago_id` de la tabla `solicitudes`. Dado que es una relación uno a uno (1:1), es suficiente con mantener la clave foránea en la tabla secundaria (`pagos.solicitud_id`). En Eloquent de Laravel, modelaríamos esto de forma limpia declarando `hasOne(Pago::class)` en `Solicitud` y `belongsTo(Solicitud::class)` en `Pago`, evitando tener que actualizar manualmente el ID de la solicitud al procesar un cobro.

---

## 4. Frontend (React / Vite)

> [!TIP]
> Aquí demostrarás tu manejo del desarrollo frontend moderno, reactividad, tipado estático y gestión del estado.

### Pregunta 4.1: En tu frontend utilizas la API Context de React (`AuthContext` y `AuthProvider`) para gestionar el estado de autenticación. ¿Por qué elegiste esta solución en lugar de librerías como Redux o Zustand?
* **Enfoque del jurado:** Evalúan si justificas el peso y complejidad de las herramientas según el tamaño del proyecto.
* **Respuesta del alumno (Guía):**
  * **Adecuación al alcance:** Para un TFG de este tipo, la autenticación y la información de perfil del usuario es prácticamente el único estado global real que debe compartirse en toda la jerarquía del árbol de componentes.
  * **Simplicidad y ligereza:** Utilizar Context API nativo de React evita introducir dependencias adicionales pesadas e innecesarias (como Redux Toolkit), manteniendo el bundle final más ligero y reduciendo la complejidad de desarrollo sin perder rendimiento, ya que el estado de autenticación cambia con muy poca frecuencia.

### Pregunta 4.2: ¿Cómo funciona el componente `ProtectedRoute.tsx` y por qué es seguro usarlo en el frontend?
* **Enfoque del jurado:** Quieren verificar si comprendes que el control de acceso en el frontend es puramente estético/funcional y no un mecanismo de seguridad real.
* **Respuesta del alumno (Guía):**
  * **Funcionamiento:** [ProtectedRoute.tsx](file:///c:/Users/david/Documents/TFG-CAR-HERO/frontend/src/components/ui/ProtectedRoute.tsx) actúa como un envoltorio (*wrapper*) alrededor de las páginas del enrutador. Comprueba el estado actual del usuario y su rol. Si el usuario no ha iniciado sesión, lo redirige a `/login`. Si su rol no está incluido en la lista de roles permitidos de la ruta, lo redirige al `/dashboard`.
  * **La verdad sobre su seguridad:** Es crucial entender que la protección en el frontend **es meramente funcional y cosmética** (para mejorar la experiencia de usuario y ocultar enlaces). Un usuario malintencionado con conocimientos técnicos podría alterar el código JavaScript en su navegador para saltarse este componente. Sin embargo, la seguridad real reside en el **backend**, donde cada llamada a la API requiere un token de Laravel Sanctum válido y está protegida por middlewares y policies que impiden el acceso a los datos indepeendientemente de lo que se muestre en el navegador.

### Pregunta 4.3: ¿Por qué decidiste utilizar interceptores en tu cliente Axios (`axios.ts`) y qué beneficios aporta a la arquitectura del frontend?
* **Enfoque del jurado:** Evalúan tu conocimiento en patrones de red y modularidad en React.
* **Respuesta del alumno (Guía):**
  * **Intercepción centralizada:** [axios.ts](file:///c:/Users/david/Documents/TFG-CAR-HERO/frontend/src/lib/axios.ts) define un interceptor de peticiones (`api.interceptors.request.use`). Este interceptor recupera automáticamente el token JWT de `localStorage` (si existe) y lo adjunta en la cabecera `Authorization: Bearer <token>` en cada una de las peticiones salientes.
  * **Beneficios:**
    * **Mantenibilidad:** Evita tener que pasar manualmente las cabeceras de autorización en cada consulta fetch/axios a lo largo de decenas de componentes del frontend.
    * **Limpieza de código:** Centraliza la lógica de red en un solo lugar. Si en el futuro cambiamos el almacenamiento del token (ej. a cookies seguras), solo tendríamos que modificar este archivo.

### Pregunta 4.4: En `Dashboard.tsx`, ¿cómo garantizas en la interfaz del empleado que este gestione sus tareas asignadas en estricto orden cronológico y que no realice dos servicios simultáneos?
* **Enfoque del jurado:** Quieren ver cómo trasladas las restricciones de lógica de negocio complejas del backend a una experiencia de usuario (UX) intuitiva en el frontend.
* **Respuesta del alumno (Guía):**
  * **Control de prioridad en UI:** En [Dashboard.tsx:754-802](file:///c:/Users/david/Documents/TFG-CAR-HERO/frontend/src/pages/Dashboard.tsx#L764-L801) implementamos un filtrado de los servicios asignados al empleado:
    1. Si el empleado ya tiene un servicio activo (obtenido a través de `contadores.has_active_request`), bloqueamos los botones y mostramos el texto `"Servicio en curso"`.
    2. Si no está ocupado, comprobamos si la tarea seleccionada es la de fecha de hoy más temprana (`isEarliest`). Si no lo es, deshabilitamos el botón de inicio de jornada y mostramos el texto `"Esperar turno"`, desplegando una alerta mediante `toast.warning()` si intenta forzarlo.
  * Esto previene que el empleado cometa errores humanos y garantiza que la aplicación le guíe paso a paso según las políticas de la empresa.

### Pregunta 4.5: Al finalizar un servicio en `SolicitudDetail.tsx`, tu frontend realiza dos peticiones HTTP separadas: `POST /api/pagos` (para registrar el cobro) y `PUT /api/solicitudes/{id}` (para cambiar el estado). ¿Qué riesgo tiene este diseño y cómo podría mejorarse?
* **Enfoque del jurado:** Buscan detectar fallos de atomicidad e integridad en transacciones de red.
* **Respuesta del alumno (Guía):**
  * **Riesgo (Falta de atomicidad):** Si la primera llamada a la API para registrar el pago tiene éxito, pero inmediatamente después el usuario pierde la conexión a Internet o el servidor devuelve un error al procesar el cambio de estado de la solicitud, el sistema queda inconsistente: el dinero está cobrado pero la solicitud sigue en estado "Retornando".
  * **Propuesta de mejora:** Deberíamos centralizar este proceso en una única petición HTTP en el backend (por ejemplo, enviando el método de pago directamente en el cuerpo del `PUT` de la solicitud). En el backend, toda esta lógica se ejecutaría dentro de una transacción de base de datos (`DB::transaction(function() { ... })`), asegurando que si falla cualquier parte del proceso, se realice un Rollback automático de todas las modificaciones y no se registre ningún pago huérfano.

### Pregunta 4.6: En tu formulario de edición en `SolicitudDetail.tsx`, utilizas Zod (`refine`) para impedir que la fecha programada sea anterior a hoy. ¿Qué limitaciones tiene esta validación basada en la fecha del navegador del usuario?
* **Enfoque del jurado:** Pregunta técnica sobre validación cliente-servidor e integridad temporal.
* **Respuesta del alumno (Guía):**
  * **Limitación del cliente:** Al evaluar la fecha actual en JavaScript (`new Date()`), la validación depende enteramente del reloj del dispositivo local del cliente. Si el usuario tiene desconfigurada la hora de su ordenador o modifica la fecha de su sistema operativo de forma intencionada a un día del pasado, la validación del frontend no funcionará correctamente o será evadida.
  * **Por qué es necesario el backend:** Esta validación en el cliente sirve únicamente para mejorar la usabilidad (UX) al avisar al usuario antes de enviar la petición. La seguridad e integridad real recae en la validación en el backend de Laravel (en el Form Request o el Modelo), que utiliza la hora confiable e inalterable del servidor para rechazar cualquier intento de guardar una fecha en el pasado.

### Pregunta 4.7: En `SolicitudDetail.tsx`, los comentarios y bitácora del empleado se concatenan en un único string de texto (`solicitud.notas`) con una marca de tiempo. ¿Por qué se diseñó así y qué problemas de escalabilidad plantea?
* **Enfoque del jurado:** Evalúan tu habilidad para discernir cuándo un diseño simple perjudica la escalabilidad de la base de datos.
* **Respuesta del alumno (Guía):**
  * **Justificación de diseño simple:** Para el alcance actual del TFG, concatenar las cadenas de texto del comentario con la fecha actual y guardarlo en el campo `notas` de tipo `text` de la base de datos era una solución rápida y directa que no requería añadir tablas adicionales ni configurar relaciones.
  * **Problemas de escalabilidad:**
    * **Falta de estructura:** Al ser un único texto largo, no podemos auditar quién escribió qué nota con precisión (ya que dependemos de un string formateado manualmente `[Empleado: ...]`), ni tampoco editar o borrar comentarios individuales.
    * **Rendimiento y límites:** Un campo `text` de MySQL tiene un límite de capacidad (65KB). Si un servicio acumula decenas de notas de recogida, ITV y devoluciones, el string se volverá inmanejable e ineficiente de procesar o parsear.
  * **Solución escalable:** Crear una tabla de base de datos dedicada `comentarios` o `bitacora` (`id`, `solicitud_id`, `user_id`, `mensaje`, `created_at`) y modelar una relación de Eloquent de uno a muchos (`hasMany`), pintando cada nota de manera estructurada en el frontend.

### Pregunta 4.8: En la barra lateral de navegación (`Sidebar.tsx`) implementas notificaciones/badges con contadores numéricos mediante Polling (`setInterval` cada 30 segundos). ¿Qué ventajas y desventajas tiene frente a WebSockets?
* **Enfoque del jurado:** Evalúan conocimientos de sincronización y protocolos de red en arquitecturas cliente-servidor.
* **Respuesta del alumno (Guía):**
  * **Polling (Ventajas):** Implementación extremadamente sencilla. No requiere de servidores adicionales de sockets de fondo ni dependencias complejas en el cliente.
  * **Polling (Desventajas):** Genera peticiones HTTP constantemente (`GET /api/contadores`) cada 30 segundos por cada cliente con la app abierta. Si tenemos 500 usuarios navegando, el servidor MySQL recibirá 1000 consultas inútiles por minuto solo para validar badges que rara vez cambian, degradando el rendimiento.
  * **Alternativa (WebSockets):** Utilizar una conexión TCP abierta bidireccional (ej. Laravel Reverb). El backend empuja un evento ligero en JSON al frontend únicamente cuando ocurre una actualización de datos real en base de datos. Esto reduce el consumo de red a cero mientras no haya actividad y las notificaciones son instantáneas (tiempo real puro).

---

## 5. Seguridad

> [!WARNING]
> Uno de los puntos más críticos en la defensa de cualquier TFG es la seguridad de los datos de los usuarios.

### Pregunta 5.1: Almacenas el token de autenticación en el `localStorage` del navegador. ¿Qué riesgos de seguridad implica esto y cómo podrías mejorar la seguridad de las sesiones?
* **Enfoque del jurado:** Evalúan tus conocimientos sobre ciberseguridad web (XSS y CSRF).
* **Respuesta del alumno (Guía):**
  * **Riesgo asociado (XSS):** Los datos almacenados en `localStorage` son accesibles mediante JavaScript desde el mismo dominio. Si un atacante lograra inyectar código malicioso en el sitio (Cross-Site Scripting - XSS) a través de algún formulario de entrada desprotegido, podría acceder fácilmente al token y suplantar la identidad del usuario.
  * **Propuesta de mejora:** La opción más segura en producción es utilizar Cookies con las directivas:
    * `HttpOnly`: Impide el acceso al token mediante código JavaScript (mitiga XSS).
    * `Secure`: Obliga a que la cookie viaje únicamente bajo conexiones HTTPS cifradas.
    * `SameSite=Strict`: Previene que la cookie sea enviada en peticiones de origen cruzado, protegiendo al sitio contra ataques CSRF (Cross-Site Request Forgery).

### Pregunta 5.2: ¿Cómo integras el flujo de inicio de sesión con Google OAuth de forma segura entre el frontend y el backend?
* **Enfoque del jurado:** Comprueban si comprendes la delegación de credenciales y la autenticación federada.
* **Respuesta del alumno (Guía):**
  * **Flujo seguro:**
    1. El frontend interactúa con el botón de Google para iniciar sesión. Google valida al usuario y devuelve un `id_token` firmado por Google directamente al frontend.
    2. El frontend envía este `id_token` mediante una petición POST al endpoint de Laravel en [GoogleController](file:///c:/Users/david/Documents/TFG-CAR-HERO/backend/app/Http/Controllers/Api/GoogleController.php).
    3. El backend **no se fía ciegamente de la petición**. Utiliza la biblioteca oficial de Google (`Google\Client`) para descifrar y verificar criptográficamente la firma del token contra los servidores de Google usando el `client_id` configurado en el servidor.
    4. Si el token es auténtico y válido, el backend recupera el email del payload seguro y crea o autentica al usuario en nuestra base de datos local, devolviendo un token Sanctum propio de nuestra aplicación para las peticiones subsecuentes.

### Pregunta 5.3: ¿Cómo mitigas el abuso de vuestros endpoints públicos (como el formulario de contacto o el registro de usuarios) frente a ataques de bots o ataques automatizados de denegación de servicio (DoS)?
* **Enfoque del jurado:** Quieren verificar la protección de infraestructura contra spam o sobrecarga.
* **Respuesta del alumno (Guía):**
  * **Cloudflare Turnstile:** En el formulario de contacto en [ContactController](file:///c:/Users/david/Documents/TFG-CAR-HERO/backend/app/Http/Controllers/Api/ContactController.php), he integrado Turnstile de Cloudflare. 
  * El frontend solicita un reto invisible a Cloudflare y envía el token resultante al backend. El backend verifica la autenticidad de ese token de forma directa contra la API de Cloudflare antes de registrar el mensaje o procesar el email. Si no es válido, se retorna inmediatamente un error 422 sin procesar recursos.
  * **Rate Limiting:** Adicionalmente, Laravel cuenta por defecto con el middleware de límite de peticiones (`throttle`), que restringe la cantidad de peticiones que una misma dirección IP puede realizar a la API en un período de tiempo determinado, bloqueando ataques de fuerza bruta.

### Pregunta 5.4: ¿Cómo funciona el mecanismo de eliminación diferida de cuentas de tu aplicación (`requestDeletion`) y qué implicaciones tiene respecto a la protección de datos (GDPR) y la coherencia financiera?
* **Enfoque del jurado:** Pregunta avanzada de implicaciones legales, diseño de sistemas e integridad contable.
* **Respuesta del alumno (Guía):**
  * **El flujo de eliminación diferida:** Cuando un usuario solicita borrar su cuenta, en lugar de borrarla físicamente al instante, actualizamos el campo `pending_deletion_at` con la fecha y hora actuales y destruimos sus sesiones activas. Esto le otorga una ventana de 24 horas de "arrepentimiento" en la que puede revertir el proceso simplemente volviendo a iniciar sesión (lo cual resetea el campo a `null` al autenticarse en el login convencional o con Google).
  * **La purga automática:** Pasadas las 24 horas, un comando de Artisan programado (`PurgeDeletedAccounts`) se ejecuta para borrar físicamente al usuario y todas sus relaciones en base de datos.
  * **El dilema contable/financiero:** Para cumplir con el GDPR, el usuario tiene derecho al olvido (borrado de datos). Sin embargo, borrar físicamente la cuenta de un usuario que posee solicitudes con facturas o pagos asociados (`solicitudesComoCliente()->delete()`) destruye la trazabilidad contable y financiera (auditoría fiscal de la empresa). 
  * **Alternativa recomendada:** En un entorno empresarial de producción, para resolver este conflicto, no debemos realizar un `delete()` físico del registro de pagos o solicitudes. En su lugar, debemos aplicar **anonimización de datos**: vaciar o enmascarar los datos identificativos del usuario en la tabla `users` (sustituir nombre, email, NIF por un hash anónimo) pero manteniendo las solicitudes, importes y pagos con fines puramente estadísticos y fiscales.

### Pregunta 5.5: En tus Form Requests (como `StoreSolicitudRequest.php`), utilizas el método `prepareForValidation()` para forzar el `user_cliente_id` al ID del usuario autenticado si este no es un administrador. ¿Por qué es esta una medida de seguridad fundamental?
* **Enfoque del jurado:** Evalúan si previenes la vulnerabilidad de escalada de privilegios o spoofing (suplantación) de parámetros en peticiones de API.
* **Respuesta del alumno (Guía):**
  * **Vulnerabilidad de inyección de parámetros:** Si no hiciéramos esto, un cliente malintencionado podría enviar en el JSON de la petición un campo `user_cliente_id` apuntando al ID de cualquier otro usuario de la base de datos. Si el sistema simplemente hiciera `Solicitud::create($request->all())`, estaríamos permitiendo crear una reserva a nombre de otra persona (suplantación de identidad).
  * **Solución robusta:** Al forzar el valor en [prepareForValidation](file:///c:/Users/david/Documents/TFG-CAR-HERO/backend/app/Http/Requests/StoreSolicitudRequest.php#L20-L29), sobrescribimos cualquier dato enviado por el cliente en el payload HTTP con la identidad verificada del token de Sanctum (`$this->user()->id`), neutralizando por completo el intento de manipulación desde el origen.

---

## 6. Despliegue, DevOps y Concurrencia

> [!CAUTION]
> Demuestra tus competencias a nivel de administración de sistemas, infraestructura en la nube y despliegues robustos.

### Pregunta 6.1: En tu Dockerfile del frontend de producción (`frontend/Dockerfile.prod`) utilizas una compilación en múltiples etapas (Multi-stage build). ¿Qué ventajas aporta esto y en qué consiste?
* **Enfoque del jurado:** Quieren ver si sigues buenas prácticas de DevOps en la creación de contenedores.
* **Respuesta del alumno (Guía):**
  * **¿En qué consiste?:** El Dockerfile se divide en dos fases:
    1. **Fase de Compilación (Builder):** Usa una imagen base con Node.js and npm, copia todo el código fuente e instala dependencias para compilar los recursos estáticos mediante `npm run build` produciendo una carpeta estática `/dist`.
    2. **Fase de Servidor (Production):** Utiliza una imagen base muy ligera de Nginx, descarta por completo todo el entorno Node.js, las herramientas de compilación y el código fuente original, y únicamente copia los archivos compilados de la fase anterior (`COPY --from=builder /app/dist`).
  * **Ventajas principales:**
    * **Reducción masiva del tamaño de la imagen:** Pasamos de una imagen que podría pesar más de 1 GB (con Node y dependencias de desarrollo) a una de apenas unos pocos megabytes (solo Nginx y el código compilado).
    * **Seguridad:** En caso de que el contenedor de producción se vea comprometido, el atacante no tendrá acceso al código fuente original no compilado, ni a herramientas de desarrollo como npm o Node.js.

### Pregunta 6.2: En tu entorno de producción (`docker-compose.prod.yml`) el backend utiliza `expose: - "8000"` pero no publica ningún puerto hacia el host externo. En cambio, el frontend expone los puertos `80` y `443`. ¿Cómo se comunican el frontend y el backend en producción?
* **Enfoque del jurado:** Evalúan tus conocimientos de redes internas de Docker y seguridad perimetral de red.
* **Respuesta del alumno (Guía):**
  * **Aislamiento y Proxy Inverso:** He diseñado una arquitectura de red privada y segura. El backend y la base de datos están completamente aislados del exterior dentro de la red interna de Docker `carhero_network`.
  * **El rol de Nginx:** Nginx actúa como un proxy inverso. El frontend expone los puertos `80` y `443` a Internet. Cuando un usuario realiza una petición a `/api/...`, Nginx captura la petición y, utilizando el DNS interno de Docker, redirige de forma interna el tráfico al contenedor del backend (`http://backend:8000`) y le devuelve la respuesta al cliente.
  * **Seguridad:** Esto mejora drásticamente la seguridad del servidor al evitar que los servicios del backend o la base de datos MySQL (puerto 3306) estén expuestos directamente a Internet.

### Pregunta 6.3: ¿Por qué es necesario configurar la directiva `try_files $uri $uri/ /index.html;` en el archivo `nginx.conf` de tu servidor web en producción?
* **Enfoque del jurado:** Evalúan tu comprensión del enrutamiento del lado del cliente frente al lado del servidor en una SPA.
* **Respuesta del alumno (Guía):**
  * **El problema de las SPAs:** En React Router, el enrutamiento ocurre puramente en el cliente (JavaScript). Cuando el usuario navega a `/dashboard`, no existe un archivo físico llamado `dashboard` o un subdirectorio en el disco del servidor. Si el usuario refresca la página, Nginx buscará el recurso físico en el servidor y, al no encontrarlo, devolverá un error 404.
  * **La solución de Nginx:** La directiva `try_files` en [nginx.conf](file:///c:/Users/david/Documents/TFG-CAR-HERO/frontend/nginx.conf#L20) le indica a Nginx que primero busque si el archivo solicitado (`$uri`) existe. Si no, busca si existe la carpeta (`$uri/`). Si ninguna de las dos existe, en lugar de devolver un 404, devuelve el contenido de `/index.html`. Una vez cargado `index.html` con su JavaScript en el navegador, el enrutador de React toma el control de la barra de direcciones y renderiza el componente correspondiente a `/dashboard` en el lado del cliente de forma fluida.

### Pregunta 6.4: En el `docker-compose.yml` configuras un servicio específico llamado `queue`. ¿Para qué sirve este servicio y qué driver de colas estás utilizando? ¿Qué ventajas e inconvenientes tiene tu elección de driver?
* **Enfoque del jurado:** Evalúan el procesamiento asíncrono y el desacoplamiento de tareas intensivas.
* **Respuesta del alumno (Guía):**
  * **Utilidad del worker:** Sirve para ejecutar en segundo plano (asíncronamente) procesos pesados como el envío de correos electrónicos. Al encolar los correos (ej. el mail de contacto), la API responde inmediatamente al cliente, y el worker procesa el envío de forma paralela sin bloquear la interfaz.
  * **Driver utilizado:** En el archivo de producción se define `QUEUE_CONNECTION: database`, lo que significa que las tareas pendientes se almacenan en una tabla de MySQL (`jobs`).
  * **Pros:** Es sumamente fácil de desplegar y configurar, ya que no requiere configurar software de infraestructura adicional en el servidor.
  * **Contras:** A nivel de rendimiento, realizar consultas concurrentes de lectura/escritura de forma constante sobre una base de datos relacional para gestionar tareas no es óptimo para alta carga. En un entorno real con un volumen de tráfico masivo, lo ideal sería migrar a drivers basados en memoria como **Redis** o servicios en la nube dedicados como **Amazon SQS**.

### Pregunta 6.5: ¿Cómo funciona el planificador de tareas (`Schedule::command`) de Laravel que utilizas para purgar las cuentas y cómo se configura a nivel de servidor?
* **Enfoque del jurado:** Evalúan tus conocimientos prácticos en administración de sistemas y automatización en servidores.
* **Respuesta del alumno (Guía):**
  * **Funcionamiento:** En [console.php](file:///c:/Users/david/Documents/TFG-CAR-HERO/backend/routes/console.php#L12) programamos que la tarea se ejecute de forma horaria: `Schedule::command('accounts:purge')->hourly();`. Laravel se encarga de evaluar si ha transcurrido el tiempo necesario para disparar el comando.
  * **Configuración del sistema operativo:** Para que el programador funcione, es obligatorio que el servidor ejecute un proceso cron que llame al comando de Laravel cada minuto:
    ```bash
    * * * * * cd /var/www/html && php artisan schedule:run >> /dev/null 2>&1
    ```
    Cuando el cron ejecuta `schedule:run` cada minuto, Laravel evalúa internamente las tareas programadas y ejecuta `accounts:purge` si ha transcurrido una hora.

### Pregunta 6.6: En `VehiculoController.php`, la acción `index` devuelve todos los vehículos sin paginar si el usuario es un cliente, pero los pagina en grupos de 6 si es administrador o empleado. ¿Por qué aplicaste este comportamiento diferencial?
* **Enfoque del jurado:** Evalúan si priorizas la optimización de ancho de banda y rendimiento del servidor de base de datos sin perjudicar la UX.
* **Respuesta del alumno (Guía):**
  * **Clientes (Sin paginación):** Los clientes solo pueden ver sus propios vehículos asociados. Al ser un volumen muy bajo (generalmente entre 1 y 3 vehículos por persona), no tiene sentido paginar la respuesta. Facilita que la interfaz del frontend (como selectores para registrar reservas) cargue todos sus vehículos de una sola vez de forma reactiva en el cliente.
  * **Administradores y Empleados (Con paginación):** Tienen acceso global a todos los vehículos de la base de datos. Si no pagináramos esta consulta, una sola petición HTTP podría traer miles de registros a la vez, consumiendo gran cantidad de memoria RAM en el servidor de PHP, saturando el ancho de banda y ralentizando el navegador al intentar pintar miles de elementos. La paginación en trozos de 6 elementos previene este cuello de botella y optimiza el consumo de recursos.

### Pregunta 6.7: En `VehiculoController.php`, impides la eliminación física de un vehículo (`destroy()`) si posee solicitudes asociadas. ¿Cómo gestionas esta precondición y por qué devuelves un código de estado 409 (Conflict)?
* **Enfoque del jurado:** Buscan evaluar si proteges la integridad de base de datos contra borrados huérfanos y si utilizas semántica REST adecuada en tus APIs.
* **Respuesta del alumno (Guía):**
  * **Prevención de huérfanos:** Hacemos una comprobación previa con `$vehiculo->solicitudes()->exists()`. Si la base de datos ejecutara la consulta de borrado directa y existiera una solicitud referenciando al vehículo, MySQL lanzaría un error de violación de restricción de integridad (`Foreign Key Constraint Violation`). Capturamos esto preventivamente en el backend.
  * **Semántica HTTP 409 Conflict:** Devolvemos un código de estado 409 para indicarle de forma semántica al frontend que la solicitud de eliminación no se puede completar en este momento debido a un conflicto de estado (en este caso, la existencia de dependencias relacionales). El cliente frontend recibe este código de forma estructurada y muestra una notificación clara al usuario, evitando que la app falle.

---

## Consejos Generales para el Día de la Defensa

1. **Mantén la calma y seguridad:** Al responder, no dudes de lo que has programado. Si te preguntan sobre un riesgo o una limitación de tu código, **admítelo** y propón cómo lo mejorarías (como las respuestas guiadas anteriores). A los jurados les encanta ver que el estudiante es consciente de las limitaciones de su propia aplicación.
2. **Usa vocabulario técnico:** Utiliza términos como *Separación de responsabilidades*, *Eager Loading*, *Inyección de dependencias*, *Proxy Inverso*, *Condición de carrera* y *Multi-stage builds*. Esto demuestra madurez técnica y eleva la nota de tu presentación.
3. **Prepara una demostración fluida:** En caso de que tengas que hacer una demo interactiva, asegúrate de tener datos preparados (mediante seeders) para poder simular un flujo completo sin tener que rellenar formularios largos manualmente o cometer errores tipográficos en vivo.
