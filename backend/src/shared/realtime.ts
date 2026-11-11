import type { Server } from 'socket.io';

let io: Server | null = null;

export function setIO(server: Server) {
  io = server;
}

export function emitToPilots(event: string, payload: unknown) {
  io?.to('pilotos').emit(event, payload);
}

export function emitToUser(id: number | string, event: string, payload: unknown) {
  io?.to(`usuario_${id}`).emit(event, payload);
}

export function hayPilotosConectados(): boolean {
  return (io?.sockets.adapter.rooms.get('pilotos')?.size ?? 0) > 0;
}
