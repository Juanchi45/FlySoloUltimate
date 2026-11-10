# Análisis de Negocio — FlySolo

**Proyecto:** FlySolo  
**Tipo:** Plataforma de transporte espacial multi-facción con valoración de servicio  
**Ambientación:** Universo Star Wars  
**Documento:** Análisis de negocio  
**Versión:** 1.0

---

## 1. Resumen ejecutivo

FlySolo es una plataforma digital que conecta pasajeros con pilotos de naves espaciales para realizar viajes entre planetas. Su funcionamiento se inspira en modelos de movilidad bajo demanda (estilo Uber), pero trasladado a un contexto de ciencia ficción: los usuarios solicitan un viaje indicando origen y destino, el sistema calcula distancia y precio en créditos, y un piloto disponible acepta la solicitud.

La propuesta incorpora elementos de juego de rol y reputación: facciones (Rebelde, Imperial, Neutral), reputación del piloto, ganancias acumuladas, tipos de nave, equipaje y reseñas. Esto agrega una capa de negocio y fidelización sobre el transporte básico.

El alcance actual cubre el circuito mínimo: registro/login, solicitud de viaje, asignación de piloto en tiempo real, aceptación del viaje, administración de usuarios y tipos de nave, y datos iniciales de planetas y naves.

---

## 2. Contexto y problema

En el universo de FlySolo, moverse entre planetas requiere coordinar pilotos, naves y rutas. Hoy esa coordinación sería informal, sin precios claros, sin trazabilidad y sin confianza sobre quién transporta a quién.

**Problemas identificados:**

- Falta de un canal centralizado para solicitar y ofrecer viajes espaciales.
- Precios variables y no transparentes según distancia y condiciones.
- Dificultad para verificar pilotos y naves habilitadas.
- Ausencia de reputación y reseñas que generen confianza.
- Poca visibilidad de disponibilidad de pilotos y naves en tiempo real.
- Administración manual de altas, bajas y validación de pilotos.

**Oportunidad:** una plataforma única que ordene la oferta y demanda de transporte espacial, estandarice precios y agregue confianza mediante reputación y reseñas.

---

## 3. Propuesta de valor

### Para pasajeros
- Solicitar un viaje entre planetas en pocos pasos.
- Ver precio estimado según distancia.
- Recibir confirmación en tiempo real cuando un piloto acepta.
- Evaluar el servicio mediante reseñas.

### Para pilotos
- Recibir solicitudes de viaje en tiempo real.
- Aceptar viajes y construir reputación.
- Acumular ganancias en créditos.

### Para administradores
- Gestionar usuarios, pilotos y pasajeros.
- Dar de baja o reactivar cuentas.
- Administrar tipos de nave.
- Validar solicitudes de habilitación de pilotos (DDJJ).

### Diferenciación
- Ambientación Star Wars con facciones, naves y planetas.
- Reputación y reseñas como mecanismo de confianza.
- Modelo de precio transparente basado en distancia.
- Asignación de viajes en tiempo real mediante eventos.

---

## 4. Objetivos

### Objetivo general
Construir una plataforma funcional de transporte espacial que conecte pasajeros y pilotos, con precios transparentes, asignación en tiempo real y un sistema de reputación.

### Objetivos específicos
1. Permitir el registro e inicio de sesión con roles diferenciados.
2. Calcular precio y distancia entre planetas.
3. Publicar solicitudes de viaje y asignarlas a pilotos disponibles.
4. Confirmar la aceptación del viaje en tiempo real.
5. Gestionar usuarios, naves y tipos de nave desde administración.
6. Incorporar reseñas y reputación del servicio.
7. Sentar las bases para un marketplace con comisiones y créditos.

---

## 5. Alcance

### 5.1 Alcance mínimo (regularidad)
| Requerimiento | Detalle | Estado |
|---|---|---|
| 4 CRUD simples | Usuario, Planeta, Nave y TipoNave (alta, listado, edición y baja) | Implementado en backend y frontend |
| 2 CRUD dependientes | Viaje (depende de Usuario y Planeta) y Review (depende de Viaje y Usuario) | Implementado en backend y frontend |
| 2 listados con filtro + detalle | Planetas filtrados por descripción; Viajes filtrados por estado. Además Naves por modelo y Reseñas por piloto/comentario | Implementado |
| 2 casos de uso / epics | Solicitar y aceptar viaje en tiempo real; finalizar viaje y reseñar al piloto | Implementado |

### 5.2 Alcance actual implementado
- Registro y login con JWT y contraseñas hasheadas.
- Roles: administrador, piloto y pasajero.
- ABM de usuarios con baja/reactivación.
- ABM de planetas, naves y tipos de nave.
- Solicitud de viaje con cálculo de distancia y precio.
- Listado de viajes pendientes para pilotos.
- Aceptación de viaje con notificación en tiempo real al pasajero.
- Listado de viajes con filtro por estado y detalle de cada solicitud.
- Finalización y cancelación de viajes desde la UI.
- Reseñas de viajes finalizados con recálculo automático de la reputación del piloto.
- Edición y eliminación de reseñas por parte de su autor o de un administrador.
- Panel de "Mis viajes" para el pasajero con finalización y calificación.
- Seed con usuarios, planetas, naves y tipos de nave de ejemplo.

### 5.3 Fuera de alcance (por ahora)
- Pasarela de pago real de créditos.
- Seguimiento geográfico o mapa interactivo.
- Chat pasajero–piloto.
- Notificaciones push o email.
- App móvil nativa.
- Motor de matching automático con optimización.
- Interfaz para la gestión de DDJJ de pilotos.
- Auditoría avanzada y recuperación de contraseña.

---

## 6. Actores y roles

| Actor | Rol técnico | Descripción | Necesidades principales |
|---|---|---|---|
| Pasajero | `PASAJERO` (0) | Usuario que solicita viajes | Pedir viaje, ver confirmación, dejar reseña al finalizar |
| Piloto | `PILOTO` (1) | Usuario que ofrece viajes con su propia nave | Ver solicitudes, aceptar viajes, ver su nave y las reseñas recibidas |
| Administrador | `ADMIN` (2) | Gestiona la plataforma | Administrar usuarios, aprobar pilotos, gestionar la flota y los tipos de nave |
| Visitante | Sin sesión | Usuario no autenticado | Registrarse e iniciar sesión |

**Facciones:** `REBELDE`, `IMPERIAL`, `NEUTRAL`. Se eligen al registrarse y aportan identidad; pueden condicionar futuras reglas de negocio (por ejemplo, afinidad o restricciones de rutas).

**Alcance por rol:**
- **Administrador:** único rol con acceso a “Conocé la flota” (`/naves`) y a la aprobación/rechazo de registros de pilotos.
- **Piloto:** solo puede consultar su propia nave (`GET /api/naves/mia`), no el resto de la flota. Es el único rol con acceso al apartado de reseñas, donde ve las reseñas que recibió.
- **Pasajero:** al finalizar un viaje puede dejar una reseña al piloto. No accede al apartado de reseñas ni a la flota.
- **Piloto pendiente:** se registra con su nave, pero no puede iniciar sesión hasta que un administrador apruebe su cuenta.

---

## 7. Casos de uso principales

### CU-01 Registrarse
- **Actor:** Visitante.
- **Flujo:** Ingresa nombre, email, contraseña, tipo de usuario (pasajero o piloto) y facción → el sistema valida duplicados → si es pasajero, crea una cuenta activa; si es piloto, solicita los datos de su nave (patente, modelo, descripción, capacidad y tipo), crea la nave y deja el registro pendiente de aprobación → confirma el alta.
- **Resultado:** cuenta creada. Si es piloto, la cuenta y su nave quedan pendientes hasta que un administrador las apruebe.

### CU-02 Iniciar sesión
- **Actor:** Usuario registrado.
- **Flujo:** Ingresa email y contraseña → el sistema valida credenciales, estado activo y que no exista una solicitud de piloto pendiente → emite token JWT → redirige según rol.
- **Resultado:** sesión iniciada. Un piloto pendiente recibe un mensaje indicando que debe esperar la aprobación.

### CU-03 Solicitar viaje
- **Actor:** Pasajero.
- **Flujo:** Selecciona origen y destino → el sistema calcula distancia y precio → crea viaje pendiente → notifica a pilotos conectados → si no hay pilotos, informa.
- **Resultado:** viaje pendiente publicado.

### CU-04 Aceptar viaje
- **Actor:** Piloto.
- **Flujo:** Recibe viaje pendiente → acepta → el sistema lo asigna como piloto y cambia el estado a “en progreso” → notifica al pasajero.
- **Resultado:** viaje confirmado.

### CU-05 Gestionar usuarios
- **Actor:** Administrador.
- **Flujo:** Lista pilotos o pasajeros → da de baja o reactiva una cuenta. También consulta las solicitudes de piloto pendientes y puede aprobarlas o rechazarlas.
- **Resultado:** estado del usuario actualizado. Al aprobar, el piloto y su nave quedan habilitados; al rechazar, se eliminan la nave y la cuenta.

### CU-05b Aprobar solicitud de piloto
- **Actor:** Administrador.
- **Flujo:** Abre “Solicitudes de piloto” → revisa los datos del piloto y su nave → aprueba o rechaza.
- **Resultado:** piloto habilitado para iniciar sesión (aprobación) o solicitud eliminada junto con su nave (rechazo).

### CU-06 Gestionar tipos de nave
- **Actor:** Administrador.
- **Flujo:** Crea, lista o elimina tipos de nave.
- **Resultado:** catálogo actualizado.

### CU-07 Cotizar viaje
- **Actor:** Usuario.
- **Flujo:** Indica origen y destino → el sistema devuelve precio, distancia y tiempo estimado.
- **Resultado:** cotización informada.

### CU-08 Finalizar viaje
- **Actor:** Pasajero dueño del viaje, piloto asignado o administrador.
- **Flujo:** Selecciona un viaje en estado `EN_PROGRESO` → confirma la finalización → el sistema cambia el estado a `FINALIZADO` y suma el precio a las ganancias acumuladas del piloto. El piloto puede hacerlo desde su panel una vez que aceptó el viaje.
- **Resultado:** viaje cerrado y ganancias del piloto actualizadas.

### CU-09 Dejar reseña
- **Actor:** Pasajero dueño de un viaje finalizado.
- **Flujo:** Cuando el viaje queda en estado `FINALIZADO` (lo finalice el pasajero o el piloto asignado), el pasajero lo ve en “Mis viajes” y recibe la notificación en tiempo real → indica puntaje (1 a 5) y comentario → el sistema valida que no exista otra reseña para ese viaje y registra la reseña → recalcula la reputación promedio del piloto.
- **Resultado:** reseña registrada y reputación del piloto actualizada.

### CU-10 Consultar reseñas recibidas
- **Actor:** Piloto.
- **Flujo:** Ingresa al apartado “Reseñas” → el sistema lista únicamente las reseñas de los viajes que realizó → puede filtrar por pasajero, comentario o ruta y ver el detalle.
- **Resultado:** el piloto conoce su reputación y los comentarios recibidos. Ningún otro rol accede a este apartado.

### CU-11 Gestionar reseñas
- **Actor:** Autor de la reseña (pasajero) o administrador.
- **Flujo:** Selecciona una reseña → edita puntaje/comentario o la elimina → el sistema valida la autoría y recalcula la reputación del piloto.
- **Resultado:** reseña actualizada o eliminada y reputación recalculada. El piloto solo puede consultarlas.

---

## 8. Modelo de negocio

### 8.1 Moneda
La plataforma opera con **créditos**. Cada usuario posee un saldo (`dineroDisponible`) y los pilotos acumulan ganancias (`gananciasAcumuladas`).

### 8.2 Precio del viaje
El precio se calcula en función de la distancia entre planetas:

```
distancia = √((x₂-x₁)² + (y₂-y₁)² + (z₂-z₁)²)
precio    = round(distancia × 100) créditos
```

Es un modelo simple, transparente y fácil de explicar.

### 8.3 Fuentes de ingreso potenciales
| Fuente | Descripción | Estado |
|---|---|---|
| Comisión por viaje | Porcentaje sobre el precio del viaje | No implementado |
| Suscripción de pilotos | Acceso a más solicitudes o prioridad | No implementado |
| Destacados | Prioridad de aparición de naves/pilotos | No implementado |
| Publicidad temática | Espacios de marcas dentro del universo | No implementado |

### 8.4 Reputación
La reputación del piloto se calcula automáticamente como el promedio de las reseñas de sus viajes finalizados y se persiste en `Usuario.reputacion`. Se recalcula al crear, editar o eliminar una reseña. Cada piloto ve solo las reseñas recibidas y puede filtrarlas por pasajero, comentario o ruta.

---

## 9. Reglas de negocio

1. Un usuario debe estar activo y no tener un registro pendiente para iniciar sesión.
2. El email es único por usuario.
3. Al registrarse se elige el tipo (pasajero o piloto) y la facción.
4. Un piloto debe registrar su nave al crear la cuenta; el registro queda pendiente de aprobación.
5. Un piloto pendiente no puede iniciar sesión hasta que un administrador lo apruebe.
6. Al rechazar una solicitud de piloto se eliminan su nave y su cuenta.
7. Solo administradores pueden dar de baja/reactivar usuarios, aprobar pilotos y gestionar tipos de nave.
8. Solo administradores acceden a “Conocé la flota” y al listado completo de naves.
9. Un piloto solo puede consultar su propia nave.
10. Solo pilotos pueden ver y aceptar viajes pendientes.
11. Un viaje solo puede ser aceptado si está en estado `PENDIENTE`.
12. Al aceptarse, el viaje pasa a `EN_PROGRESO` y se asigna un piloto.
13. El pasajero que solicita el viaje se obtiene del token, no del cuerpo de la petición.
14. Origen y destino deben existir en el catálogo de planetas.
15. El precio se deriva de la distancia entre planetas.
16. Solo se pueden finalizar viajes en estado `EN_PROGRESO`; puede hacerlo el pasajero dueño, el piloto asignado o un administrador.
17. Solo se pueden reseñar viajes en estado `FINALIZADO`.
18. Cada viaje admite una única reseña.
19. Solo el pasajero dueño del viaje (o un administrador) puede reseñarlo.
20. Solo el autor de una reseña o un administrador puede editarla o eliminarla.
21. Solo el piloto destinatario puede consultar las reseñas recibidas, y únicamente las de sus propios viajes.
22. Los CRUD de Planetas, Naves, Tipos de Nave, Viajes y Usuarios requieren JWT de administrador.
23. Al finalizar un viaje con piloto asignado, el precio se suma a `gananciasAcumuladas` del piloto.

### Estados del viaje
```
PENDIENTE → EN_PROGRESO → FINALIZADO
     ↓            ↓
 CANCELADO    CANCELADO
```

### Estados de la solicitud de piloto (DDJJ)
```
PENDIENTE → APROBADA
     ↓
 RECHAZADA
```

---

## 10. Requerimientos funcionales

| ID | Requerimiento | Prioridad |
|---|---|---|
| RF-01 | Registro de pasajeros y de pilotos con nave y aprobación del administrador | Alta |
| RF-02 | Login con roles y JWT | Alta |
| RF-03 | ABM de usuarios | Alta |
| RF-04 | Baja y reactivación de usuarios | Media |
| RF-05 | ABM de planetas | Alta |
| RF-06 | Búsqueda de planetas por nombre | Media |
| RF-07 | ABM de naves y tipos de nave | Alta |
| RF-08 | Solicitud de viaje con cálculo de precio | Alta |
| RF-09 | Listado de viajes pendientes para pilotos | Alta |
| RF-10 | Aceptación de viaje en tiempo real | Alta |
| RF-11 | Notificación al pasajero al aceptar viaje | Alta |
| RF-12 | Cotización de viaje | Media |
| RF-13 | CRUD de reseñas con recálculo de reputación | Alta |
| RF-14 | CRUD de DDJJ de pilotos (backend) | Media |
| RF-15 | Seed de datos iniciales | Baja |
| RF-16 | Listados con filtro y detalle (planetas, viajes, naves, reseñas) | Alta |
| RF-17 | Finalización y cancelación de viajes desde la UI | Alta |
| RF-18 | Panel "Mis viajes" con finalización y calificación | Alta |

---

## 11. Requerimientos no funcionales (resumen)

| Categoría | Requerimiento |
|---|---|
| Usabilidad | Flujo de pedido de viaje en pocos pasos y con autocompletado |
| Seguridad | Contraseñas hasheadas, JWT, autorización por rol |
| Rendimiento | Respuesta de API en tiempos bajos para uso académico/demo |
| Disponibilidad | Ejecución local con backend y frontend separados |
| Mantenibilidad | Código simple, separado por módulos y entidades |
| Portabilidad | Stack Node.js + SQLite + React, fácil de levantar |
| Escalabilidad | Base para migrar a PostgreSQL y servicios externos |

---

## 12. Métricas y KPIs propuestos

| KPI | Descripción | Objetivo inicial |
|---|---|---|
| Usuarios registrados | Altas totales | Crecimiento sostenido |
| Viajes solicitados | Solicitudes por período | Medir demanda |
| Tasa de aceptación | Viajes aceptados / solicitados | > 80% |
| Tiempo de asignación | Tiempo hasta aceptación | < 2 minutos (demo) |
| Pilotos activos | Pilotos conectados/disponibles | Cobertura de demanda |
| Reputación promedio | Promedio de reseñas | > 4/5 |
| Cancelaciones | Viajes cancelados / solicitados | < 10% |

---

## 13. Riesgos y mitigación

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Baja oferta de pilotos | Pasajeros sin viaje | Notificar `sin_pilotos`, incentivos, más seed |
| Precio poco realista | Mala percepción | Ajustar fórmula y parámetros |
| Datos sensibles expuestos | Seguridad | Contraseña oculta, JWT, autorización por rol |
| SQLite en producción | Escalabilidad | Migrar a PostgreSQL/MySQL |
| Falta de validación de entrada | Datos inconsistentes | Agregar validaciones y esquemas |
| Reseñas no moderadas | Contenido inapropiado | Moderación y reglas de publicación |
| Dependencia de un solo servidor | Disponibilidad | Despliegue con réplicas y monitoreo |

---

## 14. Roadmap sugerido

### Corto plazo
- Completar la UI de gestión de DDJJ.
- Validaciones de entrada y mensajes de error claros.
- Liberación automática de nave/piloto al finalizar o cancelar.
- Historial de viajes por usuario con métricas.

### Mediano plazo
- Comisión por viaje y billetera de créditos.
- Matching automático y prioridad por reputación.
- Mapa/interfaz visual de planetas.
- Panel de métricas para administración.

### Largo plazo
- Migración a base de datos relacional de producción.
- Notificaciones push/email.
- App móvil.
- Motor de precios dinámico y promociones.

---

## 15. Conclusión

FlySolo tiene una propuesta clara y atractiva: transporte espacial bajo demanda con una capa de rol, facciones y reputación. El circuito principal (registro, login, pedido de viaje, aceptación en tiempo real, finalización, reseña y administración) ya está implementado y verificado, incluyendo los CRUD simples y dependientes, los listados con filtro y detalle, y los dos casos de uso con valor de negocio.

El siguiente salto de valor está en formalizar el modelo económico (comisiones, billetera, prioridad por reputación), completar la gestión de DDJJ y sumar métricas de operación. Con una base técnica simple y funcional, el proyecto está bien posicionado para evolucionar de prototipo académico a producto.
