import { useEffect, useState } from 'react';
import NavBar from '../../components/NavBar';
import { authHeaders, isAdmin } from '../../auth';
import { API_URL } from '../../config';
import type { Planeta } from '../../types';

type FormPlaneta = Omit<Planeta, 'id'>;

const FORM_VACIO: FormPlaneta = {
  nombre: '',
  descripcion: '',
  imagenURL: '',
  posX: 0,
  posY: 0,
  posZ: 0,
};

function PlanetasPage() {
  const admin = isAdmin();
  const [planetas, setPlanetas] = useState<Planeta[]>([]);
  const [filtro, setFiltro] = useState('');
  const [seleccionado, setSeleccionado] = useState<Planeta | null>(null);
  const [form, setForm] = useState<FormPlaneta>(FORM_VACIO);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  async function cargar(descripcion = filtro) {
    const query = descripcion.trim()
      ? `?descripcion=${encodeURIComponent(descripcion.trim())}`
      : '';
    const res = await fetch(`${API_URL}/planetas${query}`);
    const data = await res.json();
    setPlanetas(data.data ?? []);
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      cargar(filtro).catch(() => setError('No se pudieron cargar los planetas'));
    }, 250);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtro]);

  async function seleccionar(id: number) {
    setError('');
    const res = await fetch(`${API_URL}/planetas/verPlaneta/${id}`);
    const data = await res.json();
    if (res.ok) setSeleccionado(data.data);
    else setError(data.message ?? 'No se pudo cargar el detalle');
  }

  function editar(p: Planeta) {
    setEditandoId(p.id);
    setForm({
      nombre: p.nombre,
      descripcion: p.descripcion,
      imagenURL: p.imagenURL,
      posX: p.posX,
      posY: p.posY,
      posZ: p.posZ,
    });
    setMensaje('');
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function nuevo() {
    setEditandoId(null);
    setForm(FORM_VACIO);
    setMensaje('');
    setError('');
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setMensaje('');
    setError('');
    const url = editandoId
      ? `${API_URL}/planetas/update/${editandoId}`
      : `${API_URL}/planetas/create`;
    const res = await fetch(url, {
      method: editandoId ? 'PUT' : 'POST',
      headers: authHeaders(),
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.message ?? 'No se pudo guardar el planeta');
      return;
    }
    setMensaje(editandoId ? 'Planeta actualizado' : 'Planeta creado');
    nuevo();
    await cargar();
  }

  async function eliminar(id: number) {
    if (!window.confirm('¿Eliminar este planeta?')) return;
    const res = await fetch(`${API_URL}/planetas/delete/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.message ?? 'No se pudo eliminar el planeta');
      return;
    }
    if (seleccionado?.id === id) setSeleccionado(null);
    setMensaje('Planeta eliminado');
    await cargar();
  }

  return (
    <div className="page">
      <NavBar />
      <header className="page-header">
        <div>
          <h1>Planetas</h1>
          <p>Catálogo de destinos disponibles en la galaxia.</p>
        </div>
      </header>

      <div className="filtros">
        <label>
          Filtrar por descripción
          <input
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            placeholder="Ej: desértico, helado, capital..."
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
              <tr><th>ID</th><th>Nombre</th><th>Descripción</th></tr>
            </thead>
            <tbody>
              {planetas.map((p) => (
                <tr
                  key={p.id}
                  className={seleccionado?.id === p.id ? 'fila-activa' : ''}
                  onClick={() => seleccionar(p.id)}
                >
                  <td>{p.id}</td>
                  <td>{p.nombre}</td>
                  <td>{p.descripcion}</td>
                </tr>
              ))}
              {planetas.length === 0 && (
                <tr><td colSpan={3}>No hay planetas que coincidan con el filtro.</td></tr>
              )}
            </tbody>
          </table>
        </section>

        <aside className="detalle">
          <h2>Detalle</h2>
          {!seleccionado && <p>Seleccioná un planeta de la lista para ver su detalle.</p>}
          {seleccionado && (
            <>
              <h3>{seleccionado.nombre}</h3>
              <p>{seleccionado.descripcion}</p>
              <dl>
                <dt>ID</dt><dd>{seleccionado.id}</dd>
                <dt>Imagen</dt><dd>{seleccionado.imagenURL || 'Sin imagen'}</dd>
                <dt>Coordenadas</dt>
                <dd>X: {seleccionado.posX} · Y: {seleccionado.posY} · Z: {seleccionado.posZ}</dd>
              </dl>
              {admin && (
                <div className="acciones">
                  <button className="btn-secondary" onClick={() => editar(seleccionado)}>Editar</button>
                  <button className="btn-danger" onClick={() => eliminar(seleccionado.id)}>Eliminar</button>
                </div>
              )}
            </>
          )}
        </aside>
      </div>

      {admin && (
        <section className="card">
          <h2>{editandoId ? `Editar planeta #${editandoId}` : 'Nuevo planeta'}</h2>
          <form onSubmit={guardar} className="form-grid">
            <label>Nombre<input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required /></label>
            <label>Descripción<input value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} required /></label>
            <label>URL de imagen<input value={form.imagenURL} onChange={(e) => setForm({ ...form, imagenURL: e.target.value })} required /></label>
            <label>Pos X<input type="number" value={form.posX} onChange={(e) => setForm({ ...form, posX: Number(e.target.value) })} required /></label>
            <label>Pos Y<input type="number" value={form.posY} onChange={(e) => setForm({ ...form, posY: Number(e.target.value) })} required /></label>
            <label>Pos Z<input type="number" value={form.posZ} onChange={(e) => setForm({ ...form, posZ: Number(e.target.value) })} required /></label>
            <div className="acciones">
              <button type="submit" className="btn-primary">{editandoId ? 'Guardar cambios' : 'Crear planeta'}</button>
              {editandoId && <button type="button" className="btn-secondary" onClick={nuevo}>Cancelar</button>}
            </div>
          </form>
        </section>
      )}
    </div>
  );
}

export default PlanetasPage;
