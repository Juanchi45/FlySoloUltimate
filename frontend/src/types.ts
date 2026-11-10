export type EstadoViaje = 'PENDIENTE' | 'EN_PROGRESO' | 'FINALIZADO' | 'CANCELADO';
export type EstadoNave = 'LIBRE' | 'ASIGNADA';
export type TipoUsuario = 'ADMIN' | 'PILOTO' | 'PASAJERO';
export type Faccion = 'REBELDE' | 'IMPERIAL' | 'NEUTRAL';

export interface Planeta {
  id: number;
  nombre: string;
  descripcion: string;
  imagenURL: string;
  posX: number;
  posY: number;
  posZ: number;
}

export interface TipoNave {
  id: number;
  nombreTipo: string;
}

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  tipo_usuario: TipoUsuario;
  faccion: Faccion;
  activo: boolean;
  registroPendiente?: boolean;
  reputacion?: number | null;
  gananciasAcumuladas?: number | null;
  dineroDisponible?: number;
  nave?: Nave | number | null;
  ddjj?: number | null;
}

export interface Nave {
  id: number;
  patente: string;
  modelo: string;
  descripcion: string;
  capacidadEquipaje: number;
  estado: EstadoNave;
  tipo?: TipoNave | number;
  piloto?: Usuario | number | null;
}

export interface Review {
  id: number;
  puntaje: number;
  comentario: string;
  fecha: string;
  usuario?: Usuario;
  viaje?: Viaje;
}

export interface Viaje {
  id: number;
  estado: EstadoViaje;
  esEncubierto: boolean;
  esAgendado: boolean;
  fechaSalida: string;
  cargaDeclaradaKg: number;
  distParsecs: number;
  precioCreditos: number;
  usuario: Usuario;
  piloto?: Usuario | null;
  origen: Planeta;
  destino: Planeta;
  review?: Review | null;
}
