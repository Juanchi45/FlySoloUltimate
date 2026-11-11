import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { authHeaders, logout, getNombre, getUsuarioId } from './auth';
import { API_URL } from './config';
import socket, { connectSocket } from './socket';
import type { Nave, Viaje } from './types';

const API = API_URL;

interface ViajeResumen {
  viajeId: number;
  origen: string;
  destino: string;
  precio: number;
  pasajero: string;
  fechaSalida?: string;
}

function aResumen(v: Viaje): ViajeResumen {
  return {
    viajeId: v.id,
    origen: v.origen?.nombre ?? '',
    destino: v.destino?.nombre ?? '',
    precio: v.precioCreditos,
    pasajero: v.usuario?.nombre ?? '',
    fechaSalida: v.fechaSalida,
  };
}

function PanelPiloto() {
  const [viajes, setViajes] = useState<ViajeResumen[]>([]);
  const [enProgreso, setEnProgreso] = useState<ViajeResumen[]>([]);
  const [nave, setNave] = useState<Nave | null>(null);
  const [mensaje, setMensaje] = useState('');

  const miId = Number(getUsuarioId() ?? '0');

  async function cargarPendientes() {
    const res = await fetch(`${API}/viajes/pendientes`, { headers: authHeaders() });
    if (!res.ok) return;
    const data = await res.json();
    setViajes(data.data ?? []);
  }

  async function cargarEnProgreso() {
    const res = await fetch(`${API}/viajes/mios`, { headers: authHeaders() });
    if (!res.ok) return;
    const data = await res.json();
    const asignados = (data.data ?? []).filter((v: Viaje) => {
      const pilotoId = typeof v.piloto === 'object' && v.piloto ? v.piloto.id : null;
      return v.estado === 'EN_PROGRESO' && pilotoId === miId;
    });
    setEnProgreso(asignados.map(aResumen));
  }

  useEffect(() => {
    connectSocket();

    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargarPendientes().catch((err) => console.error(err));
    cargarEnProgreso().catch((err) => console.error(err));

    fetch(`${API}/naves/mia`, { headers: authHeaders() })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setNave(data?.data ?? null))
      .catch(() => setNave(null));

    function onNuevoViaje(viaje: ViajeResumen) {
      setViajes((actuales) => [...actuales, viaje]);
    }

    socket.on('nuevo_viaje', onNuevoViaje);

    return () => { socket.off('nuevo_viaje', onNuevoViaje); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function aceptar(viajeId: number) {
    setMensaje('');
    const res = await fetch(`${API}/viajes/${viajeId}/aceptar`, {
      method: 'PATCH',
      headers: authHeaders(),
    });
    const data = await res.json();
    if (data.message === 'viaje aceptado') {
      setViajes((actuales) => actuales.filter((v) => v.viajeId !== viajeId));
      await cargarEnProgreso();
      setMensaje(`Viaje #${viajeId} aceptado. Podés finalizarlo cuando termine el recorrido.`);
    } else {
      setMensaje(data.message ?? 'No se pudo aceptar el viaje');
    }
  }

  async function finalizar(viajeId: number) {
    if (!window.confirm(`¿Confirmar que el viaje #${viajeId} terminó?`)) return;
    setMensaje('');
    const res = await fetch(`${API}/viajes/${viajeId}/finalizar`, {
      method: 'PATCH',
      headers: authHeaders(),
    });
    const data = await res.json();
    if (!res.ok) {
      setMensaje(data.message ?? 'No se pudo finalizar el viaje');
      return;
    }
    setEnProgreso((actuales) => actuales.filter((v) => v.viajeId !== viajeId));
    setMensaje(`Viaje #${viajeId} finalizado`);
  }

  const tipoNave = nave && typeof nave.tipo === 'object' && nave.tipo
    ? nave.tipo.nombreTipo
    : 'Sin tipo';

  return (
    <div className="panel">
      <header className="panel-header">
        <h1>Panel Piloto</h1>
        <span>Bienvenido, {getNombre()}</span>
        <Link to="/resenas" className="btn-secondary">Mis reseñas</Link>
        <Link to="/" className="btn-secondary">Volver al menú</Link>
        <button onClick={logout} className="btn-secondary">Cerrar sesión</button>
      </header>

      {mensaje && <p className="mensaje-ok">{mensaje}</p>}

      <section className="card">
        <h2>Mi nave</h2>
        {nave ? (
          <>
            <p><strong>{nave.patente}</strong> · {nave.modelo}</p>
            <p>{nave.descripcion}</p>
            <dl>
              <dt>Tipo</dt><dd>{tipoNave}</dd>
              <dt>Capacidad de equipaje</dt><dd>{nave.capacidadEquipaje} kg</dd>
              <dt>Estado</dt><dd>{nave.estado}</dd>
            </dl>
          </>
        ) : (
          <p>No tenés una nave asignada. Contactá a un administrador.</p>
        )}
      </section>

      <h2>Viajes en progreso</h2>
      {enProgreso.length === 0 && <p>No tenés viajes en progreso.</p>}

      {enProgreso.map((v) => (
        <div className="card" key={v.viajeId}>
          <p><strong>Viaje #{v.viajeId}</strong></p>
          <p>Pasajero: {v.pasajero}</p>
          <p>De {v.origen} a {v.destino}</p>
          <p>Precio: {v.precio} créditos</p>
          <button onClick={() => finalizar(v.viajeId)} className="btn-primary">Finalizar viaje</button>
        </div>
      ))}

      <h2>Viajes pendientes</h2>
      {viajes.length === 0 && <p>No hay viajes pendientes.</p>}

      {viajes.map((v) => (
        <div className="card" key={v.viajeId}>
          <p><strong>Viaje #{v.viajeId}</strong></p>
          <p>Pasajero: {v.pasajero}</p>
          <p>De {v.origen} a {v.destino}</p>
          <p>Precio: {v.precio} créditos</p>
          <button onClick={() => aceptar(v.viajeId)} className="btn-primary">Aceptar viaje</button>
        </div>
      ))}
    </div>
  );
}

export default PanelPiloto;
