import { useEffect, useState } from 'react';
import NavBar from '../../components/NavBar';
import { authHeaders } from '../../auth';
import { API_URL } from '../../config';
import socket, { connectSocket } from '../../socket';
import type { EstadoViaje, Viaje } from '../../types';

const ESTADOS: EstadoViaje[] = ['PENDIENTE', 'EN_PROGRESO', 'FINALIZADO', 'CANCELADO'];

function MisViajesPage() {
  const [viajes, setViajes] = useState<Viaje[]>([]);
  const [estadoFiltro, setEstadoFiltro] = useState('');
  const [seleccionado, setSeleccionado] = useState<Viaje | null>(null);
  const [puntaje, setPuntaje] = useState(5);
  const [comentario, setComentario] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  async function cargar() {
    const res = await fetch(`${API_URL}/viajes/mios`, { headers: authHeaders() });
    const data = await res.json();
    if (!res.ok) {
      setError(data.message ?? 'No se pudieron cargar tus viajes');
      return;
    }
    setViajes(data.data ?? []);
  }

  useEffect(() => {
    connectSocket();

    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargar().catch(() => setError('No se pudieron cargar tus viajes'));

    function onViajeFinalizado(data: { viajeId: number }) {
      setMensaje(`El piloto finalizó el viaje #${data.viajeId}. Ya podés dejar tu reseña.`);
      setSeleccionado((actual) =>
        actual && actual.id === data.viajeId ? { ...actual, estado: 'FINALIZADO' } : actual
      );
      cargar().catch(() => setError('No se pudieron actualizar tus viajes'));
    }

    socket.on('viaje_finalizado', onViajeFinalizado);
    return () => { socket.off('viaje_finalizado', onViajeFinalizado); };
  }, []);

  async function recargarSeleccion(id: number) {
    await cargar();
    const res = await fetch(`${API_URL}/viajes/verViaje/${id}`, { headers: authHeaders() });
    const data = await res.json();
    if (res.ok) setSeleccionado(data.data);
  }

  async function finalizar(id: number) {
    setMensaje('');
    setError('');
    const res = await fetch(`${API_URL}/viajes/${id}/finalizar`, {
      method: 'PATCH',
      headers: authHeaders(),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.message ?? 'No se pudo finalizar el viaje');
      return;
    }
    setMensaje('Viaje finalizado. Ya podés dejar tu reseña.');
    await recargarSeleccion(id);
  }

  async function enviarReview(e: React.FormEvent) {
    e.preventDefault();
    if (!seleccionado) return;
    setMensaje('');
    setError('');
    const res = await fetch(`${API_URL}/reviews`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        viajeId: seleccionado.id,
        puntaje,
        comentario,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.message ?? 'No se pudo registrar la reseña');
      return;
    }
    setMensaje('¡Gracias! Tu reseña fue registrada.');
    setComentario('');
    setPuntaje(5);
    await recargarSeleccion(seleccionado.id);
  }

  const filtrados = estadoFiltro
    ? viajes.filter((v) => v.estado === estadoFiltro)
    : viajes;

  return (
    <div className="page">
      <NavBar />
      <header className="page-header">
        <div>
          <h1>Mis viajes</h1>
          <p>Finalizá tus viajes y calificá al piloto para construir su reputación.</p>
        </div>
      </header>

      <div className="filtros">
        <label>
          Filtrar por estado
          <select value={estadoFiltro} onChange={(e) => setEstadoFiltro(e.target.value)}>
            <option value="">Todos</option>
            {ESTADOS.map((estado) => <option key={estado} value={estado}>{estado}</option>)}
          </select>
        </label>
        <button className="btn-secondary" onClick={() => setEstadoFiltro('')}>Limpiar</button>
      </div>

      {mensaje && <p className="mensaje-ok">{mensaje}</p>}
      {error && <p className="error">{error}</p>}

      <div className="split">
        <section>
          <table className="tabla">
            <thead>
              <tr><th>ID</th><th>Ruta</th><th>Estado</th><th>Precio</th><th>Reseña</th></tr>
            </thead>
            <tbody>
              {filtrados.map((v) => (
                <tr
                  key={v.id}
                  className={seleccionado?.id === v.id ? 'fila-activa' : ''}
                  onClick={() => { setSeleccionado(v); setMensaje(''); setError(''); }}
                >
                  <td>{v.id}</td>
                  <td>{v.origen?.nombre} → {v.destino?.nombre}</td>
                  <td><span className={`badge badge-${v.estado.toLowerCase()}`}>{v.estado}</span></td>
                  <td>{v.precioCreditos} cr.</td>
                  <td>{v.review ? `${v.review.puntaje}/5` : 'Pendiente'}</td>
                </tr>
              ))}
              {filtrados.length === 0 && (
                <tr><td colSpan={5}>No tenés viajes para el filtro seleccionado.</td></tr>
              )}
            </tbody>
          </table>
        </section>

        <aside className="detalle">
          <h2>Detalle</h2>
          {!seleccionado && <p>Seleccioná uno de tus viajes para ver el detalle.</p>}
          {seleccionado && (
            <>
              <h3>Viaje #{seleccionado.id}</h3>
              <dl>
                <dt>Estado</dt><dd>{seleccionado.estado}</dd>
                <dt>Origen</dt><dd>{seleccionado.origen?.nombre}</dd>
                <dt>Destino</dt><dd>{seleccionado.destino?.nombre}</dd>
                <dt>Precio</dt><dd>{seleccionado.precioCreditos} créditos</dd>
                <dt>Piloto</dt>
                <dd>{typeof seleccionado.piloto === 'object' && seleccionado.piloto ? seleccionado.piloto.nombre : 'Sin asignar'}</dd>
                <dt>Fecha</dt><dd>{new Date(seleccionado.fechaSalida).toLocaleString()}</dd>
              </dl>

              {seleccionado.estado === 'EN_PROGRESO' && (
                <button className="btn-primary" onClick={() => finalizar(seleccionado.id)}>
                  Finalizar viaje
                </button>
              )}

              {seleccionado.review && (
                <div className="review-box">
                  <h3>Tu reseña</h3>
                  <p><strong>{seleccionado.review.puntaje}/5</strong> — {seleccionado.review.comentario}</p>
                  <small>{new Date(seleccionado.review.fecha).toLocaleString()}</small>
                </div>
              )}

              {seleccionado.estado === 'FINALIZADO' && !seleccionado.review && (
                <form onSubmit={enviarReview} className="review-form">
                  <h3>Calificar al piloto</h3>
                  <label>
                    Puntaje
                    <select value={puntaje} onChange={(e) => setPuntaje(Number(e.target.value))}>
                      {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n} estrella{n > 1 ? 's' : ''}</option>)}
                    </select>
                  </label>
                  <label>
                    Comentario
                    <textarea
                      value={comentario}
                      onChange={(e) => setComentario(e.target.value)}
                      placeholder="Contá cómo fue tu experiencia..."
                      required
                    />
                  </label>
                  <button type="submit" className="btn-primary">Enviar reseña</button>
                </form>
              )}
            </>
          )}
        </aside>
      </div>
    </div>
  );
}

export default MisViajesPage;
