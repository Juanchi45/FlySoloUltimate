import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from './config';

/**
 * Socket compartido del frontend.
 * El backend usa los query params para asignar al usuario a su sala:
 *   - Pilotos → sala "pilotos" (reciben nuevos viajes)
 *   - Pasajeros → sala personal "usuario_<id>" (reciben confirmación)
 */
const socket: Socket = io(SOCKET_URL, {
  autoConnect: false,
});

export function connectSocket(): void {
  socket.io.opts.query = {
    id: sessionStorage.getItem('id') ?? '',
    es_piloto: sessionStorage.getItem('es_piloto') ?? '',
  };
  if (!socket.connected) {
    socket.connect();
  }
}

export default socket;
