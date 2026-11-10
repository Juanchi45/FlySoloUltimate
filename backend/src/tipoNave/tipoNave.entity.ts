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
