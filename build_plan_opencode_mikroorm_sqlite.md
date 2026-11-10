# 🏗️ Plan de BUILD para OpenCode: Especificación Técnica de Clases y Relaciones MikroORM / SQLite3

**Proyecto:** Plataforma de Transporte Espacial Multi-Facción — FlySolo  
**Documento Fuente (La Biblia):** Modelo de Dominio Definitivo Aprobado  
**Target ORM / BD:** `@mikro-orm/sqlite` con base de datos `./proyecto.db`  
**Lenguaje:** TypeScript (ES Modules)

---

## 📌 1. Reglas Generales de Codificación para OpenCode

1. **La Biblia como Guía Absoluta:** Todas las clases, nombres de propiedades, tipos de datos y relaciones deben codificarse con la ortografía y semántica exacta definida en este documento.
2. **Clase Base Común:** Todas las entidades independientes extienden de `BaseEntity` (`src/shared/db/baseEntity.entity.ts`), que provee la clave primaria `id: number` `@PrimaryKey()`.
3. **Mapeo ORM:** Utilizar decoradores oficiales de `@mikro-orm/core` (`@Entity`, `@Property`, `@Enum`, `@ManyToOne`, `@OneToOne`, `@OneToMany`, `@Embeddable`, `@Embedded`).
4. **Relaciones Tipadas:** Usar el tipo envolvente `Rel<T>` importado de `@mikro-orm/core` para propiedades de relación de una sola entidad.

---

## 🎨 2. Especificación de Enums (`src/shared/enums/`)

### File: `src/shared/enums/domain.enums.ts`

```typescript
export enum TipoUsuario {
  ADMIN = 'ADMIN',
  PILOTO = 'PILOTO',
  PASAJERO = 'PASAJERO'
}

export enum Faccion {
  REBELDE = 'REBELDE',
  IMPERIAL = 'IMPERIAL',
  NEUTRAL = 'NEUTRAL'
}

export enum EstadoNave {
  LIBRE = 'LIBRE',
  ASIGNADA = 'ASIGNADA'
}

export enum EstadoSolicitud {
  PENDIENTE = 'PENDIENTE',
  APROBADA = 'APROBADA',
  RECHAZADA = 'RECHAZADA'
}

export enum EstadoViaje {
  PENDIENTE = 'PENDIENTE',
  EN_PROGRESO = 'EN_PROGRESO',
  FINALIZADO = 'FINALIZADO',
  CANCELADO = 'CANCELADO'
}
```

---

## 🏛️ 3. Código Definitivo de Entidades MikroORM (`src/**/*.entity.ts`)

---

### 3.1. BaseEntity (`src/shared/db/baseEntity.entity.ts`)

```typescript
import { PrimaryKey } from '@mikro-orm/core';

export abstract class BaseEntity {
  @PrimaryKey()
  id!: number;
}
```

---

### 3.2. Usuario (`src/usuario/usuario.entity.ts`)

```typescript
import {
  Entity,
  Property,
  Enum,
  OneToOne,
  OneToMany,
  Collection,
  Rel
} from '@mikro-orm/core';
import { BaseEntity } from '../shared/db/baseEntity.entity.js';
import { TipoUsuario, Faccion } from '../shared/enums/domain.enums.js';
import { Nave } from '../nave/nave.entity.js';
import { DDJJPiloto } from '../ddjjPiloto/ddjjPiloto.entity.js';
import { Viaje } from '../viaje/viaje.entity.js';
import { Review } from '../review/review.entity.js';

@Entity()
export class Usuario extends BaseEntity {
  @Property({ nullable: false })
  nombre!: string;

  @Property({ nullable: false, unique: true })
  email!: string;

  @Property({ nullable: false })
  contrasena!: string;

  @Enum(() => TipoUsuario)
  tipo_usuario: TipoUsuario = TipoUsuario.PASAJERO;

  @Enum(() => Faccion)
  faccion!: Faccion;

  @Property({ nullable: true, type: 'float' })
  reputacion?: number;

  @Property({ nullable: true, type: 'float' })
  gananciasAcumuladas?: number;

  @Property({ nullable: false, type: 'float', default: 0 })
  dineroDisponible: number = 0;

  // Relaciones
  @OneToOne(() => Nave, (nave) => nave.piloto, { nullable: true })
  nave?: Rel<Nave>;

  @OneToOne(() => DDJJPiloto, (ddjj) => ddjj.usuario, { nullable: true })
  ddjj?: Rel<DDJJPiloto>;

  @OneToMany(() => Viaje, (viaje) => viaje.usuario)
  viajesComoPasajero = new Collection<Viaje>(this);

  @OneToMany(() => Viaje, (viaje) => viaje.piloto)
  viajesComoPiloto = new Collection<Viaje>(this);

  @OneToMany(() => Review, (review) => review.usuario)
  reviewsRealizadas = new Collection<Review>(this);
}
```

---

### 3.3. TipoNave (`src/tipoNave/tipoNave.entity.ts`)

```typescript
import { Entity, Property, OneToMany, Collection } from '@mikro-orm/core';
import { BaseEntity } from '../shared/db/baseEntity.entity.js';
import { Nave } from '../nave/nave.entity.js';

@Entity()
export class TipoNave extends BaseEntity {
  @Property({ nullable: false })
  nombreTipo!: string;

  @OneToMany(() => Nave, (nave) => nave.tipo)
  naves = new Collection<Nave>(this);
}
```

---

### 3.4. Nave (`src/nave/nave.entity.ts`)

```typescript
import { Entity, Property, Enum, ManyToOne, OneToOne, Rel } from '@mikro-orm/core';
import { BaseEntity } from '../shared/db/baseEntity.entity.js';
import { EstadoNave } from '../shared/enums/domain.enums.js';
import { TipoNave } from '../tipoNave/tipoNave.entity.js';
import { Usuario } from '../usuario/usuario.entity.js';

@Entity()
export class Nave extends BaseEntity {
  @Property({ nullable: false, unique: true })
  patente!: string;

  @Property({ nullable: false })
  modelo!: string;

  @Property({ nullable: false })
  descripcion!: string;

  @Property({ nullable: false, type: 'float' })
  capacidadEquipaje!: number;

  @Enum(() => EstadoNave)
  estado: EstadoNave = EstadoNave.LIBRE;

  // Relaciones
  @ManyToOne(() => TipoNave, { nullable: false })
  tipo!: Rel<TipoNave>;

  @OneToOne(() => Usuario, { nullable: true, owner: true })
  piloto?: Rel<Usuario>;
}
```

---

### 3.5. DDJJPiloto (`src/ddjjPiloto/ddjjPiloto.entity.ts`)

```typescript
import { Entity, Property, Enum, OneToOne, Rel } from '@mikro-orm/core';
import { BaseEntity } from '../shared/db/baseEntity.entity.js';
import { EstadoSolicitud } from '../shared/enums/domain.enums.js';
import { Usuario } from '../usuario/usuario.entity.js';

@Entity()
export class DDJJPiloto extends BaseEntity {
  @Property({ nullable: false })
  numeroLicencia!: string;

  @Property({ nullable: false })
  puntajeLicencia!: number;

  @Property({ nullable: false })
  fotoLicencia!: string;

  @Property({ nullable: false })
  preferenciaNave!: string;

  @Enum(() => EstadoSolicitud)
  estado: EstadoSolicitud = EstadoSolicitud.PENDIENTE;

  // Relación OneToOne con Usuario (Dueño de la relación)
  @OneToOne(() => Usuario, { nullable: false, owner: true })
  usuario!: Rel<Usuario>;
}
```

---

### 3.6. Planeta (`src/planeta/planeta.entity.ts`)

```typescript
import { Entity, Property, OneToMany, Collection } from '@mikro-orm/core';
import { BaseEntity } from '../shared/db/baseEntity.entity.js';
import { Viaje } from '../viaje/viaje.entity.js';

@Entity()
export class Planeta extends BaseEntity {
  @Property({ nullable: false })
  nombre!: string;

  @Property({ nullable: false })
  descripcion!: string;

  @Property({ nullable: false })
  imagenURL!: string;

  @Property({ nullable: false })
  posX!: number;

  @Property({ nullable: false })
  posY!: number;

  @Property({ nullable: false })
  posZ!: number;

  // Relaciones
  @OneToMany(() => Viaje, (viaje) => viaje.origen)
  viajesOrigen = new Collection<Viaje>(this);

  @OneToMany(() => Viaje, (viaje) => viaje.destino)
  viajesDestino = new Collection<Viaje>(this);
}
```

---

### 3.7. Equipaje (Objeto Débil Embeddable) (`src/equipaje/equipaje.embeddable.ts`)

```typescript
import { Embeddable, Property } from '@mikro-orm/core';

@Embeddable()
export class Equipaje {
  @Property({ nullable: true })
  descripcion?: string;

  @Property({ nullable: true, type: 'float' })
  peso?: number;
}
```

---

### 3.8. Review (`src/review/review.entity.ts`)

```typescript
import { Entity, Property, ManyToOne, OneToOne, Rel } from '@mikro-orm/core';
import { BaseEntity } from '../shared/db/baseEntity.entity.js';
import { Usuario } from '../usuario/usuario.entity.js';
import { Viaje } from '../viaje/viaje.entity.js';

@Entity()
export class Review extends BaseEntity {
  @Property({ nullable: false })
  puntaje!: number; // 1 a 5 estrellas

  @Property({ nullable: false })
  comentario!: string;

  @Property({ nullable: false })
  fecha: Date = new Date();

  // Relaciones
  @ManyToOne(() => Usuario, { nullable: false })
  usuario!: Rel<Usuario>; // Pasajero autor

  @OneToOne(() => Viaje, (viaje) => viaje.review, { nullable: true, owner: true })
  viaje?: Rel<Viaje>;
}
```

---

### 3.9. Viaje (`src/viaje/viaje.entity.ts`)

```typescript
import {
  Entity,
  Property,
  Enum,
  ManyToOne,
  OneToOne,
  Embedded,
  Rel
} from '@mikro-orm/core';
import { BaseEntity } from '../shared/db/baseEntity.entity.js';
import { EstadoViaje } from '../shared/enums/domain.enums.js';
import { Usuario } from '../usuario/usuario.entity.js';
import { Planeta } from '../planeta/planeta.entity.js';
import { Equipaje } from '../equipaje/equipaje.embeddable.js';
import { Review } from '../review/review.entity.js';

@Entity()
export class Viaje extends BaseEntity {
  @Enum(() => EstadoViaje)
  estado: EstadoViaje = EstadoViaje.PENDIENTE;

  @Property({ default: false })
  esEncubierto: boolean = false;

  @Property({ default: false })
  esAgendado: boolean = false;

  @Property({ nullable: false })
  fechaSalida!: Date;

  @Property({ nullable: false, type: 'float', default: 0 })
  cargaDeclaradaKg: number = 0;

  @Property({ nullable: false, type: 'float' })
  distParsecs!: number;

  @Property({ nullable: false, type: 'float' })
  precioCreditos!: number;

  // Relaciones
  @ManyToOne(() => Usuario, { nullable: false })
  usuario!: Rel<Usuario>; // Pasajero creador

  @ManyToOne(() => Usuario, { nullable: true })
  piloto?: Rel<Usuario>; // Piloto asignado

  @ManyToOne(() => Planeta, { nullable: false })
  origen!: Rel<Planeta>;

  @ManyToOne(() => Planeta, { nullable: false })
  destino!: Rel<Planeta>;

  @Embedded(() => Equipaje, { nullable: true })
  equipaje?: Equipaje;

  @OneToOne(() => Review, { nullable: true })
  review?: Rel<Review>;
}
```

---

## ⚙️ 4. Configuración del ORM para SQLite3 (`src/shared/db/orm.ts`)

```typescript
import { MikroORM } from '@mikro-orm/core';
import { SqliteDriver } from '@mikro-orm/sqlite';
import { SqlHighlighter } from '@mikro-orm/sql-highlighter';

export const orm = await MikroORM.init({
  entities: ['dist/**/*.entity.js'],
  entitiesTs: ['src/**/*.entity.ts'],
  dbName: './proyecto.db',
  driver: SqliteDriver,
  highlighter: new SqlHighlighter(),
  debug: true,
  schemaGenerator: {
    disableForeignKeys: false,
    createForeignKeyConstraints: true,
  },
});

export const SyncSchema = async () => {
  const generator = orm.getSchemaGenerator();
  await generator.updateSchema();
};
```

---

## 📋 5. Instrucciones de Trabajo para OpenCode

1. **Sustituir Archivos Existentes:** Sobrescribir los archivos de entidades en `backend/src/` con las clases tipadas anteriormente presentadas.
2. **Actualizar `backend/package.json`:**
   - Remover `@mikro-orm/mysql`.
   - Agregar `@mikro-orm/sqlite`.
3. **Compilar y Verificar:**
   - Ejecutar `pnpm --filter backend build` para verificar que TypeScript compila sin errores.
   - Ejecutar `pnpm backend` y verificar en los logs que MikroORM genera la base de datos `proyecto.db` con las 8 tablas correspondientes.
