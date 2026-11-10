import { Embeddable, Property } from '@mikro-orm/core';

@Embeddable()
export class Equipaje {
  @Property({ nullable: true })
  descripcion?: string;

  @Property({ nullable: true, type: 'float' })
  peso?: number;
}
