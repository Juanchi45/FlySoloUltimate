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

  @OneToOne(() => Review, { nullable: true, mappedBy: 'viaje' })
  review?: Rel<Review>;
}
