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
