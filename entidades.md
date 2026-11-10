# 📖 Modelo del Dominio Definitivo (La Biblia de FlySolo)

Documento oficial de entidades, enums, atributos y relaciones de la aplicación **FlySolo**, estructurado según el Modelo de Dominio final aprobado.

---

## 🎨 Enums de Dominio

### `TipoUsuario`
- `ADMIN`
- `PILOTO`
- `PASAJERO`

### `Faccion`
- `REBELDE`
- `IMPERIAL`
- `NEUTRAL`

### `EstadoNave`
- `LIBRE`
- `ASIGNADA`

### `EstadoSolicitud` (DDJJ)
- `PENDIENTE`
- `APROBADA`
- `RECHAZADA`

### `EstadoViaje`
- `PENDIENTE`
- `EN_PROGRESO`
- `FINALIZADO`
- `CANCELADO`

---

## 🏛️ Entidades y Clases

### 1. `BaseEntity` (Clase Base)
- `id`: int (PrimaryKey, autoincremental)

---

### 2. `Usuario` (Extiende de `BaseEntity`)
- `id`: int
- `nombre`: string (not null)
- `email`: string (not null, unique)
- `contrasena`: string (not null)
- `tipo_usuario`: `TipoUsuario` (Enum, not null)
- `faccion`: `Faccion` (Enum, not null)
- `reputacion`: float (nullable)
- `gananciasAcumuladas`: float (nullable)
- `dineroDisponible`: float (default 0)

**Relaciones:**
- `nave`: `Nave` (OneToOne / ManyToOne, nullable: true, relación 0..1 con Nave del piloto).
- `ddjj`: `DDJJPiloto` (OneToOne, nullable: true, relación 0..1 con solicitud DDJJ).
- `viajesComoPasajero`: Collection<`Viaje`> (OneToMany con `Viaje.usuario`).
- `viajesComoPiloto`: Collection<`Viaje`> (OneToMany con `Viaje.piloto`).
- `reviewsRealizadas`: Collection<`Review`> (OneToMany con `Review.usuario`).

---

### 3. `DDJJPiloto` (Extiende de `BaseEntity`)
- `id`: int
- `numeroLicencia`: string (not null)
- `puntajeLicencia`: int (not null)
- `fotoLicencia`: string (not null)
- `preferenciaNave`: string (not null)
- `estado`: `EstadoSolicitud` (Enum, default `PENDIENTE`)

**Relaciones:**
- `usuario`: `Usuario` (OneToOne con `Usuario`).

---

### 4. `Nave` (Extiende de `BaseEntity`)
- `id`: int
- `patente`: string (not null, unique)
- `modelo`: string (not null)
- `descripcion`: string (not null)
- `capacidadEquipaje`: float (not null)
- `estado`: `EstadoNave` (Enum, default `LIBRE`)

**Relaciones:**
- `tipo`: `TipoNave` (ManyToOne, not null).
- `piloto`: `Usuario` (OneToOne / ManyToOne, nullable: true, relación 0..1 con Usuario piloto).

---

### 5. `TipoNave` (Extiende de `BaseEntity`)
- `id`: int
- `nombreTipo`: string (not null)

**Relaciones:**
- `naves`: Collection<`Nave`> (OneToMany con `Nave.tipo`).

---

### 6. `Planeta` (Extiende de `BaseEntity`)
- `id`: int
- `nombre`: string (not null)
- `descripcion`: string (not null)
- `imagenURL`: string (not null)
- `posX`: int (not null)
- `posY`: int (not null)
- `posZ`: int (not null)

**Relaciones:**
- `viajesOrigen`: Collection<`Viaje`> (OneToMany con `Viaje.origen`).
- `viajesDestino`: Collection<`Viaje`> (OneToMany con `Viaje.destino`).

---

### 7. `Viaje` (Extiende de `BaseEntity`)
- `id`: int
- `estado`: `EstadoViaje` (Enum, default `PENDIENTE`)
- `esEncubierto`: boolean (default false)
- `esAgendado`: boolean (default false)
- `fechaSalida`: Date (not null)
- `cargaDeclaradaKg`: float (default 0)
- `distParsecs`: float (not null)
- `precioCreditos`: float (not null)

**Relaciones:**
- `usuario`: `Usuario` (ManyToOne, not null, pasajero creador).
- `piloto`: `Usuario` (ManyToOne, nullable: true, piloto asignado).
- `origen`: `Planeta` (ManyToOne, not null).
- `destino`: `Planeta` (ManyToOne, not null).
- `equipaje`: `Equipaje` (Embedded / OneToOne, nullable: true).
- `review`: `Review` (OneToOne, nullable: true, review asociada al viaje).

---

### 8. `Equipaje` (Entidad / Objeto Débil Embeddable)
- `descripcion`: string
- `peso`: float

---

### 9. `Review` (Extiende de `BaseEntity`)
- `id`: int
- `puntaje`: int (not null, 1-5)
- `comentario`: string (not null)
- `fecha`: Date (not null)

**Relaciones:**
- `usuario`: `Usuario` (ManyToOne, not null, pasajero autor).
- `viaje`: `Viaje` (OneToOne, nullable: true, viaje evaluado).
