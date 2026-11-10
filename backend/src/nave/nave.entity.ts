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
