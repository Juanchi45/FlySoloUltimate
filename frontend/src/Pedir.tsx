import { useState, useEffect } from 'react';
import socket from './socket';
import { API_URL } from './config';

interface Planeta {
  nombre: string;
}

interface ViajeAceptado {
  nombrePiloto?: string;
  origen?: string;
  destino?: string;
  precio?: number;
}

function Pedir() {
  const [origen, setOrigen] = useState<string>('');
  const [destino, setDestino] = useState<string>('');
  const [sugerenciasOrigen, setSugerenciasOrigen] = useState<Planeta[]>([]);
  const [sugerenciasDestino, setSugerenciasDestino] = useState<Planeta[]>([]);
  const [estado, setEstado] = useState<'idle' | 'esperando' | 'sin_pilotos' | 'aceptado'>('idle');
  const [viaje, setViaje] = useState<ViajeAceptado | null>(null);

  useEffect(() => {
    socket.on('viaje_aceptado', (data: ViajeAceptado) => {
      setEstado('aceptado');
      setViaje(data);
    });
    socket.on('sin_pilotos', () => {
      setEstado('sin_pilotos');
    });
    return () => {
      socket.off('viaje_aceptado');
      socket.off('sin_pilotos');
    };
  }, []);

  async function buscarPlaneta(nombre: string, setSugerencias: (p: Planeta[]) => void) {
    if (nombre.length === 0) { setSugerencias([]); return; }
    const res = await fetch(`${API_URL}/planetas?nombre=${nombre}`);
    const data = await res.json();
    setSugerencias(data);
  }

  async function pedir(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const res = await fetch(`${API_URL}/viajes/pedir`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        origenNombre: origen,
        destinoNombre: destino,
        usuarioId: sessionStorage.getItem('id'),
      }),
    });
    const data = await res.json();
    if (data.message === 'viaje creado') {
      setEstado('esperando');
    }
  }

  return (
    <form onSubmit={pedir}>
      <div>
        <h1>Bienvenido {sessionStorage.getItem('nombre')}</h1>
        <h1>A dónde desea viajar?</h1>
      </div>
      <div>
        <input
          type="text"
          placeholder="Origen"
          value={origen}
          onChange={(e) => { setOrigen(e.target.value); buscarPlaneta(e.target.value, setSugerenciasOrigen); }}
        />
        {sugerenciasOrigen.length > 0 && (
          <ul>
            {sugerenciasOrigen.map((p) => (
              <li key={p.nombre} onClick={() => { setOrigen(p.nombre); setSugerenciasOrigen([]); }}>{p.nombre}</li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <input
          type="text"
          placeholder="Destino"
          value={destino}
          onChange={(e) => { setDestino(e.target.value); buscarPlaneta(e.target.value, setSugerenciasDestino); }}
        />
        {sugerenciasDestino.length > 0 && (
          <ul>
            {sugerenciasDestino.map((p) => (
              <li key={p.nombre} onClick={() => { setDestino(p.nombre); setSugerenciasDestino([]); }}>{p.nombre}</li>
            ))}
          </ul>
        )}
      </div>

      {estado === 'esperando' && <p>Buscando piloto...</p>}
      {estado === 'sin_pilotos' && <p>No hay pilotos disponibles</p>}

      {estado === 'aceptado' && viaje && (
        <div>
          <h3>¡Viaje aceptado!</h3>
          {viaje.nombrePiloto && <p>Piloto: {viaje.nombrePiloto}</p>}
          <p>Origen: {origen}</p>
          <p>Destino: {destino}</p>
          <p>Precio: {viaje.precio ?? 'calculando...'}</p>
        </div>
      )}

      <button type="submit">Pedir viaje</button>
    </form>
  );
}

export default Pedir;