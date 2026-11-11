import 'dotenv/config';
import 'reflect-metadata';
import bcrypt from 'bcryptjs';
import { orm, SyncSchema } from './shared/db/orm.js';
import { Usuario } from './usuario/usuario.entity.js';
import { Planeta } from './planeta/planeta.entity.js';
import { TipoNave } from './tipoNave/tipoNave.entity.js';
import { Nave } from './nave/nave.entity.js';
import { TipoUsuario, Faccion, EstadoNave } from './shared/enums/domain.enums.js';

await SyncSchema();
const em = orm.em.fork();

const yaExiste = await em.findOne(Usuario, { email: 'admin@flysolo.com' });
if (yaExiste) {
  console.log('El seed ya fue aplicado. No se hace nada.');
  await orm.close();
  process.exit(0);
}

const password = (texto: string) => bcrypt.hash(texto, 10);

const admin = em.create(Usuario, {
  nombre: 'Admin',
  email: 'admin@flysolo.com',
  contrasena: await password('admin123'),
  tipo_usuario: TipoUsuario.ADMIN,
  faccion: Faccion.IMPERIAL,
  dineroDisponible: 0,
  activo: true,
  registroPendiente: false,
});

const admin2 = em.create(Usuario, {
  nombre: 'Admin Secundario',
  email: 'admin2@flysolo.com',
  contrasena: await password('admin456'),
  tipo_usuario: TipoUsuario.ADMIN,
  faccion: Faccion.NEUTRAL,
  dineroDisponible: 0,
  activo: true,
  registroPendiente: false,
});

const piloto1 = em.create(Usuario, {
  nombre: 'Han Solo',
  email: 'piloto1@flysolo.com',
  contrasena: await password('piloto123'),
  tipo_usuario: TipoUsuario.PILOTO,
  faccion: Faccion.REBELDE,
  dineroDisponible: 500,
  activo: true,
  registroPendiente: false,
});

const piloto2 = em.create(Usuario, {
  nombre: 'Boba Fett',
  email: 'piloto2@flysolo.com',
  contrasena: await password('piloto123'),
  tipo_usuario: TipoUsuario.PILOTO,
  faccion: Faccion.NEUTRAL,
  dineroDisponible: 800,
  activo: true,
  registroPendiente: false,
});

const pasajero = em.create(Usuario, {
  nombre: 'Luke Skywalker',
  email: 'pasajero@flysolo.com',
  contrasena: await password('pasajero123'),
  tipo_usuario: TipoUsuario.PASAJERO,
  faccion: Faccion.REBELDE,
  dineroDisponible: 1000,
  activo: true,
  registroPendiente: false,
});

const tipoCaza = em.create(TipoNave, { nombreTipo: 'Caza estelar' });
const tipoCarguero = em.create(TipoNave, { nombreTipo: 'Carguero' });

const nave1 = em.create(Nave, {
  patente: 'MF-1977',
  modelo: 'YT-1300',
  descripcion: 'Nave rápida y modificada',
  capacidadEquipaje: 100,
  estado: EstadoNave.LIBRE,
  tipo: tipoCaza,
  piloto: piloto1,
});

const nave2 = em.create(Nave, {
  patente: 'SL-1980',
  modelo: 'Firespray',
  descripcion: 'Nave de caza bounty hunter',
  capacidadEquipaje: 50,
  estado: EstadoNave.LIBRE,
  tipo: tipoCarguero,
  piloto: piloto2,
});

const planetas = [
  em.create(Planeta, {
    nombre: 'Tatooine',
    descripcion: 'Planeta desértico con dos soles',
    imagenURL: 'https://example.com/tatooine.jpg',
    posX: 0, posY: 0, posZ: 0,
  }),
  em.create(Planeta, {
    nombre: 'Coruscant',
    descripcion: 'Capital de la galaxia',
    imagenURL: 'https://example.com/coruscant.jpg',
    posX: 10, posY: 5, posZ: 2,
  }),
  em.create(Planeta, {
    nombre: 'Naboo',
    descripcion: 'Planeta verde y pacífico',
    imagenURL: 'https://example.com/naboo.jpg',
    posX: 4, posY: 8, posZ: 1,
  }),
  em.create(Planeta, {
    nombre: 'Hoth',
    descripcion: 'Planeta helado',
    imagenURL: 'https://example.com/hoth.jpg',
    posX: -6, posY: -3, posZ: 7,
  }),
  em.create(Planeta, {
    nombre: 'Endor',
    descripcion: 'Luna boscosa',
    imagenURL: 'https://example.com/endor.jpg',
    posX: 2, posY: -7, posZ: 3,
  }),
];

await em.persistAndFlush([
  admin, admin2, piloto1, piloto2, pasajero,
  tipoCaza, tipoCarguero, nave1, nave2,
  ...planetas,
]);

console.log('Seed aplicado correctamente:');
console.log('  admin@flysolo.com / admin123');
console.log('  admin2@flysolo.com / admin456');
console.log('  piloto1@flysolo.com / piloto123');
console.log('  piloto2@flysolo.com / piloto123');
console.log('  pasajero@flysolo.com / pasajero123');

await orm.close();
