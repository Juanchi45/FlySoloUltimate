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
