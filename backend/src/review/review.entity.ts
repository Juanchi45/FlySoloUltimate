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
