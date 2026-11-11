import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { authHeaders, logout, getNombre } from '../../auth';
import { API_URL } from '../../config';
import socket, { connectSocket } from '../../socket';

interface Planeta {
  nombre: string;
}

interface ViajeAceptado {
  viajeId: number;
  pilotoId: number;
  origen: string;
  destino: string;
  precio: number;
}

type Estado = 'idle' | 'esperando' | 'aceptado';

function PedirViaje() {
  const [origen, setOrigen] = useState('');
  const [destino, setDestino] = useState('');
  const [sugerenciasOrigen, setSugerenciasOrigen] = useState<Planeta[]>([]);
  const [sugerenciasDestino, setSugerenciasDestino] = useState<Planeta[]>([]);
  const [estado, setEstado] = useState<Estado>('idle');
  const [viajeAceptado, setViajeAceptado] = useState<ViajeAceptado | null>(null);
  const [viajeFinalizado, setViajeFinalizado] = useState<ViajeAceptado | null>(null);
  const [error, setError] = useState('');

  const API = API_URL;

  useEffect(() => {
    connectSocket();

    // El backend emite "viaje_aceptado" a la sala personal del pasajero
    socket.on('viaje_aceptado', (data: ViajeAceptado) => {
      setEstado('aceptado');
      setViajeAceptado(data);
    });

    socket.on('sin_pilotos', () => {
      setEstado('idle');
      setError('No hay pilotos disponibles en este momento');
    });

    // El piloto finalizó el viaje: habilitamos el acceso a la reseña.
    socket.on('viaje_finalizado', (data: ViajeAceptado) => {
      setViajeFinalizado(data);
    });

    return () => {
      socket.off('viaje_aceptado');
      socket.off('sin_pilotos');
      socket.off('viaje_finalizado');
    };
  }, []);

  async function buscarPlaneta(nombre: string, setSugerencias: (p: Planeta[]) => void) {
    if (nombre.length < 1) { setSugerencias([]); return; }
    const res = await fetch(`${API}/planetas?nombre=${nombre}`, { headers: authHeaders() });
    const data = await res.json();
    setSugerencias(data.data ?? data ?? []);
  }

  async function pedirViaje(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(`${API}/viajes/pedir`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ origenNombre: origen, destinoNombre: destino }),
      });
      const data = await res.json();
      if (data.message === 'viaje creado') {
        setEstado('esperando');
      } else {
        setError(data.message ?? 'Error al pedir el viaje');
      }
    } catch {
      setError('Error de conexión');
    }
  }

  function nuevoViaje() {
    setEstado('idle');
    setOrigen('');
    setDestino('');
    setViajeAceptado(null);
    setViajeFinalizado(null);
    setError('');
  }

  return (
    <div className="pedir-page">
      <header className="panel-header">
        <h1>FlySolo</h1>
        <span>Bienvenido, {getNombre()}</span>
        <button onClick={logout} className="btn-secondary">Cerrar sesión</button>
      </header>

      <div className="card">
        <h2>Pedir viaje</h2>

        {estado === 'idle' && (
          <form onSubmit={pedirViaje}>
            <div className="autocomplete">
              <input
                placeholder="Planeta de origen"
                value={origen}
                onChange={e => { setOrigen(e.target.value); buscarPlaneta(e.target.value, setSugerenciasOrigen); }}
                required
              />
              {sugerenciasOrigen.length > 0 && (
                <ul className="sugerencias">
                  {sugerenciasOrigen.map(p => (
                    <li key={p.nombre} onClick={() => { setOrigen(p.nombre); setSugerenciasOrigen([]); }}>
                      {p.nombre}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="autocomplete">
              <input
                placeholder="Planeta de destino"
                value={destino}
                onChange={e => { setDestino(e.target.value); buscarPlaneta(e.target.value, setSugerenciasDestino); }}
                required
              />
              {sugerenciasDestino.length > 0 && (
                <ul className="sugerencias">
                  {sugerenciasDestino.map(p => (
                    <li key={p.nombre} onClick={() => { setDestino(p.nombre); setSugerenciasDestino([]); }}>
                      {p.nombre}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {error && <p className="error">{error}</p>}
            <button type="submit" className="btn-primary">Pedir viaje</button>
          </form>
        )}

        {estado === 'esperando' && (
          <div className="esperando">
            <p>Buscando piloto disponible...</p>
            <p><small>De {origen} a {destino}</small></p>
          </div>
        )}

        {estado === 'aceptado' && viajeAceptado && (
          <div className="viaje-confirmado">
            <h3>¡Viaje confirmado!</h3>
            <p><strong>Origen:</strong> {viajeAceptado.origen}</p>
            <p><strong>Destino:</strong> {viajeAceptado.destino}</p>
            <p><strong>Precio:</strong> ${viajeAceptado.precio}</p>
            <button onClick={nuevoViaje} className="btn-primary">Pedir otro viaje</button>
          </div>
        )}

        {viajeFinalizado && (
          <div className="card">
            <h3>Viaje finalizado</h3>
            <p>El piloto finalizó el viaje #{viajeFinalizado.viajeId}. Ya podés calificarlo.</p>
            <Link className="btn-primary" to="/mis-viajes">Dejar una reseña</Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default PedirViaje;