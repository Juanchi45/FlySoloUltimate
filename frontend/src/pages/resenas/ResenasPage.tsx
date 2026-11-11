import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import NavBar from '../../components/NavBar';
import { authHeaders } from '../../auth';
import { API_URL } from '../../config';
import type { Review } from '../../types';

function nombrePasajero(review: Review): string {
  return review.usuario?.nombre ?? 'Pasajero eliminado';
}

function ruta(review: Review): string {
  const viaje = review.viaje;
  if (!viaje) return 'Viaje eliminado';
  return `${viaje.origen?.nombre} → ${viaje.destino?.nombre}`;
}

function ResenasPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filtro, setFiltro] = useState('');
  const [seleccionada, setSeleccionada] = useState<Review | null>(null);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  async function cargar() {
    const res = await fetch(`${API_URL}/reviews`, { headers: authHeaders() });
    const data = await res.json();
    if (!res.ok) {
      setError(data.message ?? 'No se pudieron cargar las reseñas');
      return;
    }
    setReviews(data.data ?? []);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargar().catch(() => setError('No se pudieron cargar las reseñas'));
  }, []);

  async function seleccionar(id: number) {
    setMensaje('');
    setError('');
    const res = await fetch(`${API_URL}/reviews/${id}`, { headers: authHeaders() });
    const data = await res.json();
    if (res.ok) {
      setSeleccionada(data.data);
    } else {
      setError(data.message ?? 'No se pudo cargar la reseña');
    }
  }

  const texto = filtro.trim().toLowerCase();
  const filtradas = texto
    ? reviews.filter((r) =>
        nombrePasajero(r).toLowerCase().includes(texto) ||
        r.comentario.toLowerCase().includes(texto) ||
        ruta(r).toLowerCase().includes(texto)
      )
    : reviews;

  const promedio = reviews.length
    ? (reviews.reduce((acc, r) => acc + r.puntaje, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div className="page">
      <NavBar />
      <header className="page-header">
        <div>
          <h1>Reseñas recibidas</h1>
          <p>Opiniones que los pasajeros dejaron sobre tus viajes.</p>
        </div>
        <Link to="/piloto" className="btn-secondary">Volver al panel</Link>
      </header>

      <section className="features">
        <article className="card">
          <h2>Total de reseñas</h2>
          <p>{reviews.length}</p>
        </article>
        <article className="card">
          <h2>Promedio</h2>
          <p>{promedio ? `${promedio} / 5` : 'Sin reseñas'}</p>
        </article>
      </section>

      <div className="filtros">
        <label>
          Filtrar por pasajero, comentario o ruta
          <input
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            placeholder="Ej: Luke, excelente, Tatooine..."
          />
        </label>
        <button className="btn-secondary" onClick={() => setFiltro('')}>Limpiar</button>
      </div>

      {mensaje && <p className="mensaje-ok">{mensaje}</p>}
      {error && <p className="error">{error}</p>}

      <div className="split">
        <section>
          <table className="tabla">
            <thead>
              <tr><th>ID</th><th>Pasajero</th><th>Ruta</th><th>Puntaje</th><th>Fecha</th></tr>
            </thead>
            <tbody>
              {filtradas.map((r) => (
                <tr
                  key={r.id}
                  className={seleccionada?.id === r.id ? 'fila-activa' : ''}
                  onClick={() => seleccionar(r.id)}
                >
                  <td>{r.id}</td>
                  <td>{nombrePasajero(r)}</td>
                  <td>{ruta(r)}</td>
                  <td>{r.puntaje}/5</td>
                  <td>{new Date(r.fecha).toLocaleDateString()}</td>
                </tr>
              ))}
              {filtradas.length === 0 && (
                <tr><td colSpan={5}>No hay reseñas que coincidan con el filtro.</td></tr>
              )}
            </tbody>
          </table>
        </section>

        <aside className="detalle">
          <h2>Detalle</h2>
          {!seleccionada && <p>Seleccioná una reseña de la lista para ver su detalle.</p>}
          {seleccionada && (
            <>
              <h3>Reseña #{seleccionada.id}</h3>
              <p className="estrellas">{seleccionada.puntaje}/5</p>
              <p>{seleccionada.comentario}</p>
              <dl>
                <dt>Pasajero</dt><dd>{nombrePasajero(seleccionada)}</dd>
                <dt>Ruta</dt><dd>{ruta(seleccionada)}</dd>
                <dt>Fecha</dt><dd>{new Date(seleccionada.fecha).toLocaleString()}</dd>
              </dl>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}

export default ResenasPage;
