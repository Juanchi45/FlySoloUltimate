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

  @Property({ nullable: false, hidden: true })
  contrasena!: string;

  @Enum(() => TipoUsuario)
  tipo_usuario: TipoUsuario = TipoUsuario.PASAJERO;

  @Enum(() => Faccion)
  faccion: Faccion = Faccion.NEUTRAL;

  @Property({ default: true })
  activo: boolean = true;

  @Property({ default: false })
  registroPendiente: boolean = false;

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
