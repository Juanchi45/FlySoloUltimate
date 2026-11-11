import { useEffect, useState } from 'react';
import NavBar from '../../components/NavBar';
import { authHeaders, isAdmin } from '../../auth';
import { API_URL } from '../../config';
import type { EstadoNave, Nave, TipoNave, Usuario } from '../../types';

interface FormNave {
  patente: string;
  modelo: string;
  descripcion: string;
  capacidadEquipaje: number;
  estado: EstadoNave;
  tipoId: string;
  pilotoId: string;
}

const FORM_VACIO: FormNave = {
  patente: '',
  modelo: '',
  descripcion: '',
  capacidadEquipaje: 0,
  estado: 'LIBRE',
  tipoId: '',
  pilotoId: '',
};

function nombreTipo(nave: Nave): string {
  return typeof nave.tipo === 'object' && nave.tipo ? nave.tipo.nombreTipo : 'Sin tipo';
}

function nombrePiloto(nave: Nave): string {
  return typeof nave.piloto === 'object' && nave.piloto ? nave.piloto.nombre : 'Sin piloto';
}

function NavesPage() {
  const admin = isAdmin();
  const [naves, setNaves] = useState<Nave[]>([]);
  const [tipos, setTipos] = useState<TipoNave[]>([]);
  const [pilotos, setPilotos] = useState<Usuario[]>([]);
  const [filtro, setFiltro] = useState('');
  const [seleccionada, setSeleccionada] = useState<Nave | null>(null);
  const [form, setForm] = useState<FormNave>(FORM_VACIO);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  async function cargar(modelo = filtro) {
    const query = modelo.trim() ? `?modelo=${encodeURIComponent(modelo.trim())}` : '';
    const res = await fetch(`${API_URL}/naves/verNaves${query}`, { headers: authHeaders() });
    const data = await res.json();
    setNaves(data.data ?? []);
  }

  useEffect(() => {
    fetch(`${API_URL}/tiposnave/verTipoNaves`)
      .then((res) => res.json())
      .then((data) => setTipos(data.data ?? []))
      .catch(() => setError('No se pudieron cargar los tipos de nave'));

    if (admin) {
      fetch(`${API_URL}/usuarios/rol/pilotos`, { headers: authHeaders() })
        .then((res) => res.json())
        .then((data) => setPilotos(data.data ?? []))
        .catch(() => setPilotos([]));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      cargar(filtro).catch(() => setError('No se pudieron cargar las naves'));
    }, 250);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtro]);

  async function seleccionar(id: number) {
    const res = await fetch(`${API_URL}/naves/verNave/${id}`, { headers: authHeaders() });
    const data = await res.json();
    if (res.ok) {
      setSeleccionada(data.data);
      setError('');
    } else {
      setError(data.message ?? 'No se pudo cargar la nave');
    }
  }

  function editar(nave: Nave) {
    setEditandoId(nave.id);
    setForm({
      patente: nave.patente,
      modelo: nave.modelo,
      descripcion: nave.descripcion,
      capacidadEquipaje: nave.capacidadEquipaje,
      estado: nave.estado,
      tipoId: typeof nave.tipo === 'object' && nave.tipo ? String(nave.tipo.id) : String(nave.tipo ?? ''),
      pilotoId: typeof nave.piloto === 'object' && nave.piloto ? String(nave.piloto.id) : '',
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
    const body = {
      patente: form.patente,
      modelo: form.modelo,
      descripcion: form.descripcion,
      capacidadEquipaje: Number(form.capacidadEquipaje),
      estado: form.estado,
      tipo: Number(form.tipoId),
      piloto: form.pilotoId ? Number(form.pilotoId) : null,
    };
    const url = editandoId
      ? `${API_URL}/naves/update/${editandoId}`
      : `${API_URL}/naves/create`;
    const res = await fetch(url, {
      method: editandoId ? 'PUT' : 'POST',
      headers: authHeaders(),
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.message ?? 'No se pudo guardar la nave');
      return;
    }
    setMensaje(editandoId ? 'Nave actualizada' : 'Nave creada');
    nuevo();
    await cargar();
  }

  async function eliminar(id: number) {
    if (!window.confirm('¿Eliminar esta nave?')) return;
    const res = await fetch(`${API_URL}/naves/delete/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.message ?? 'No se pudo eliminar la nave');
      return;
    }
    if (seleccionada?.id === id) setSeleccionada(null);
    setMensaje('Nave eliminada');
    await cargar();
  }

  return (
    <div className="page">
      <NavBar />
      <header className="page-header">
        <div>
          <h1>Naves</h1>
          <p>Flota registrada y piloto asignado a cada nave.</p>
        </div>
      </header>

      <div className="filtros">
        <label>
          Filtrar por modelo
          <input
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            placeholder="Ej: YT-1300, Firespray..."
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
              <tr><th>ID</th><th>Patente</th><th>Modelo</th><th>Tipo</th><th>Piloto</th><th>Estado</th></tr>
            </thead>
            <tbody>
              {naves.map((n) => (
                <tr
                  key={n.id}
                  className={seleccionada?.id === n.id ? 'fila-activa' : ''}
                  onClick={() => seleccionar(n.id)}
                >
                  <td>{n.id}</td>
                  <td>{n.patente}</td>
                  <td>{n.modelo}</td>
                  <td>{nombreTipo(n)}</td>
                  <td>{nombrePiloto(n)}</td>
                  <td>{n.estado}</td>
                </tr>
              ))}
              {naves.length === 0 && (
                <tr><td colSpan={6}>No hay naves que coincidan con el filtro.</td></tr>
              )}
            </tbody>
          </table>
        </section>

        <aside className="detalle">
          <h2>Detalle</h2>
          {!seleccionada && <p>Seleccioná una nave de la lista para ver su detalle.</p>}
          {seleccionada && (
            <>
              <h3>{seleccionada.modelo} · {seleccionada.patente}</h3>
              <p>{seleccionada.descripcion}</p>
              <dl>
                <dt>ID</dt><dd>{seleccionada.id}</dd>
                <dt>Tipo</dt><dd>{nombreTipo(seleccionada)}</dd>
                <dt>Piloto</dt><dd>{nombrePiloto(seleccionada)}</dd>
                <dt>Capacidad de equipaje</dt><dd>{seleccionada.capacidadEquipaje} kg</dd>
                <dt>Estado</dt><dd>{seleccionada.estado}</dd>
              </dl>
              {admin && (
                <div className="acciones">
                  <button className="btn-secondary" onClick={() => editar(seleccionada)}>Editar</button>
                  <button className="btn-danger" onClick={() => eliminar(seleccionada.id)}>Eliminar</button>
                </div>
              )}
            </>
          )}
        </aside>
      </div>

      {admin && (
        <section className="card">
          <h2>{editandoId ? `Editar nave #${editandoId}` : 'Nueva nave'}</h2>
          <form onSubmit={guardar} className="form-grid">
            <label>Patente<input value={form.patente} onChange={(e) => setForm({ ...form, patente: e.target.value })} required /></label>
            <label>Modelo<input value={form.modelo} onChange={(e) => setForm({ ...form, modelo: e.target.value })} required /></label>
            <label>Descripción<input value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} required /></label>
            <label>Capacidad de equipaje (kg)<input type="number" value={form.capacidadEquipaje} onChange={(e) => setForm({ ...form, capacidadEquipaje: Number(e.target.value) })} required /></label>
            <label>
              Tipo
              <select value={form.tipoId} onChange={(e) => setForm({ ...form, tipoId: e.target.value })} required>
                <option value="">Seleccionar...</option>
                {tipos.map((t) => <option key={t.id} value={t.id}>{t.nombreTipo}</option>)}
              </select>
            </label>
            <label>
              Piloto
              <select value={form.pilotoId} onChange={(e) => setForm({ ...form, pilotoId: e.target.value })}>
                <option value="">Sin piloto</option>
                {pilotos.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            </label>
            <label>
              Estado
              <select value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value as EstadoNave })}>
                <option value="LIBRE">LIBRE</option>
                <option value="ASIGNADA">ASIGNADA</option>
              </select>
            </label>
            <div className="acciones">
              <button type="submit" className="btn-primary">{editandoId ? 'Guardar cambios' : 'Crear nave'}</button>
              {editandoId && <button type="button" className="btn-secondary" onClick={nuevo}>Cancelar</button>}
            </div>
          </form>
        </section>
      )}
    </div>
  );
}

export default NavesPage;
