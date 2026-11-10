import { useEffect, useState } from 'react';
import NavBar from '../../components/NavBar';
import { authHeaders, getUsuarioId, isAdmin, isPiloto } from '../../auth';
import { API_URL } from '../../config';
import type { EstadoViaje, Planeta, Usuario, Viaje } from '../../types';

interface FormViaje {
  usuarioId: string;
  origenId: string;
  destinoId: string;
  estado: EstadoViaje;
  esEncubierto: boolean;
  esAgendado: boolean;
  cargaDeclaradaKg: number;
  fechaSalida: string;
}

const FORM_VACIO: FormViaje = {
  usuarioId: '',
  origenId: '',
  destinoId: '',
  estado: 'PENDIENTE',
  esEncubierto: false,
  esAgendado: false,
  cargaDeclaradaKg: 0,
  fechaSalida: new Date().toISOString().slice(0, 10),
};

const ESTADOS: EstadoViaje[] = ['PENDIENTE', 'EN_PROGRESO', 'FINALIZADO', 'CANCELADO'];

function nombrePiloto(v: Viaje): string {
  return typeof v.piloto === 'object' && v.piloto ? v.piloto.nombre : 'Sin asignar';
}

function ViajesPage() {
  const admin = isAdmin();
  const piloto = isPiloto();
  const miId = Number(getUsuarioId() ?? '0');
  const [viajes, setViajes] = useState<Viaje[]>([]);
  const [estadoFiltro, setEstadoFiltro] = useState('');
  const [seleccionado, setSeleccionado] = useState<Viaje | null>(null);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [planetas, setPlanetas] = useState<Planeta[]>([]);
  const [form, setForm] = useState<FormViaje>(FORM_VACIO);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  async function cargar(estado = estadoFiltro) {
    const query = estado ? `?estado=${estado}` : '';
    const res = await fetch(`${API_URL}/viajes/verViajes${query}`);
    const data = await res.json();
    setViajes(data.data ?? []);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargar(estadoFiltro).catch(() => setError('No se pudieron cargar los viajes'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estadoFiltro]);

  useEffect(() => {
    fetch(`${API_URL}/usuarios/verUsuarios`)
      .then((res) => res.json())
      .then((data) => setUsuarios(data.data ?? []))
      .catch(() => setUsuarios([]));
    fetch(`${API_URL}/planetas`)
      .then((res) => res.json())
      .then((data) => setPlanetas(data.data ?? []))
      .catch(() => setPlanetas([]));
  }, []);

  async function seleccionar(id: number) {
    const res = await fetch(`${API_URL}/viajes/verViaje/${id}`);
    const data = await res.json();
    if (res.ok) {
      setSeleccionado(data.data);
      setError('');
    } else {
      setError(data.message ?? 'No se pudo cargar el viaje');
    }
  }

  function editar(v: Viaje) {
    setEditandoId(v.id);
    setForm({
      usuarioId: String(v.usuario.id),
      origenId: String(v.origen.id),
      destinoId: String(v.destino.id),
      estado: v.estado,
      esEncubierto: v.esEncubierto,
      esAgendado: v.esAgendado,
      cargaDeclaradaKg: v.cargaDeclaradaKg,
      fechaSalida: v.fechaSalida ? v.fechaSalida.slice(0, 10) : new Date().toISOString().slice(0, 10),
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
      usuarioId: Number(form.usuarioId),
      origenId: Number(form.origenId),
      destinoId: Number(form.destinoId),
      estado: form.estado,
      esEncubierto: form.esEncubierto,
      esAgendado: form.esAgendado,
      cargaDeclaradaKg: Number(form.cargaDeclaradaKg),
      fechaSalida: form.fechaSalida,
    };
    const url = editandoId
      ? `${API_URL}/viajes/update/${editandoId}`
      : `${API_URL}/viajes/create`;
    const res = await fetch(url, {
      method: editandoId ? 'PUT' : 'POST',
      headers: authHeaders(),
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.message ?? 'No se pudo guardar el viaje');
      return;
    }
    setMensaje(editandoId ? 'Viaje actualizado' : 'Viaje creado');
    nuevo();
    await cargar();
  }

  async function cambiarEstado(id: number, accion: 'finalizar' | 'cancelar') {
    const res = await fetch(`${API_URL}/viajes/${id}/${accion}`, {
      method: 'PATCH',
      headers: authHeaders(),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.message ?? 'No se pudo actualizar el viaje');
      return;
    }
    setMensaje(accion === 'finalizar' ? 'Viaje finalizado' : 'Viaje cancelado');
    await cargar();
    await seleccionar(id);
  }

  async function eliminar(id: number) {
    if (!window.confirm('¿Eliminar este viaje?')) return;
    const res = await fetch(`${API_URL}/viajes/delete/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.message ?? 'No se pudo eliminar el viaje');
      return;
    }
    if (seleccionado?.id === id) setSeleccionado(null);
    setMensaje('Viaje eliminado');
    await cargar();
  }

  return (
    <div className="page">
      <NavBar />
      <header className="page-header">
        <div>
          <h1>Viajes</h1>
          <p>Listado de viajes con filtro por estado y detalle de cada solicitud.</p>
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
              <tr><th>ID</th><th>Ruta</th><th>Pasajero</th><th>Piloto</th><th>Estado</th><th>Precio</th></tr>
            </thead>
            <tbody>
              {viajes.map((v) => (
                <tr
                  key={v.id}
                  className={seleccionado?.id === v.id ? 'fila-activa' : ''}
                  onClick={() => seleccionar(v.id)}
                >
                  <td>{v.id}</td>
                  <td>{v.origen?.nombre} → {v.destino?.nombre}</td>
                  <td>{v.usuario?.nombre}</td>
                  <td>{nombrePiloto(v)}</td>
                  <td><span className={`badge badge-${v.estado.toLowerCase()}`}>{v.estado}</span></td>
                  <td>{v.precioCreditos} cr.</td>
                </tr>
              ))}
              {viajes.length === 0 && (
                <tr><td colSpan={6}>No hay viajes para el filtro seleccionado.</td></tr>
              )}
            </tbody>
          </table>
        </section>

        <aside className="detalle">
          <h2>Detalle</h2>
          {!seleccionado && <p>Seleccioná un viaje de la lista para ver su detalle.</p>}
          {seleccionado && (
            <>
              <h3>Viaje #{seleccionado.id}</h3>
              <dl>
                <dt>Estado</dt><dd>{seleccionado.estado}</dd>
                <dt>Pasajero</dt><dd>{seleccionado.usuario?.nombre}</dd>
                <dt>Piloto</dt><dd>{nombrePiloto(seleccionado)}</dd>
                <dt>Origen</dt><dd>{seleccionado.origen?.nombre}</dd>
                <dt>Destino</dt><dd>{seleccionado.destino?.nombre}</dd>
                <dt>Distancia</dt><dd>{seleccionado.distParsecs} parsecs</dd>
                <dt>Precio</dt><dd>{seleccionado.precioCreditos} créditos</dd>
                <dt>Carga declarada</dt><dd>{seleccionado.cargaDeclaradaKg} kg</dd>
                <dt>Fecha de salida</dt><dd>{new Date(seleccionado.fechaSalida).toLocaleString()}</dd>
                <dt>Encubierto / agendado</dt>
                <dd>{seleccionado.esEncubierto ? 'Sí' : 'No'} / {seleccionado.esAgendado ? 'Sí' : 'No'}</dd>
                <dt>Reseña</dt>
                <dd>{seleccionado.review ? `${seleccionado.review.puntaje}/5 — ${seleccionado.review.comentario}` : 'Sin reseña'}</dd>
              </dl>
              {admin && (
                <div className="acciones">
                  <button className="btn-secondary" onClick={() => editar(seleccionado)}>Editar</button>
                  {seleccionado.estado === 'EN_PROGRESO' && (
                    <button className="btn-primary" onClick={() => cambiarEstado(seleccionado.id, 'finalizar')}>Finalizar</button>
                  )}
                  {(seleccionado.estado === 'PENDIENTE' || seleccionado.estado === 'EN_PROGRESO') && (
                    <button className="btn-secondary" onClick={() => cambiarEstado(seleccionado.id, 'cancelar')}>Cancelar</button>
                  )}
                  <button className="btn-danger" onClick={() => eliminar(seleccionado.id)}>Eliminar</button>
                </div>
              )}
              {!admin && piloto &&
                typeof seleccionado.piloto === 'object' &&
                seleccionado.piloto?.id === miId &&
                seleccionado.estado === 'EN_PROGRESO' && (
                  <div className="acciones">
                    <button className="btn-primary" onClick={() => cambiarEstado(seleccionado.id, 'finalizar')}>Finalizar viaje</button>
                  </div>
                )}
            </>
          )}
        </aside>
      </div>

      {admin && (
        <section className="card">
          <h2>{editandoId ? `Editar viaje #${editandoId}` : 'Nuevo viaje'}</h2>
          <form onSubmit={guardar} className="form-grid">
            <label>
              Pasajero
              <select value={form.usuarioId} onChange={(e) => setForm({ ...form, usuarioId: e.target.value })} required>
                <option value="">Seleccionar...</option>
                {usuarios.filter((u) => u.tipo_usuario === 'PASAJERO').map((u) => (
                  <option key={u.id} value={u.id}>{u.nombre}</option>
                ))}
              </select>
            </label>
            <label>
              Origen
              <select value={form.origenId} onChange={(e) => setForm({ ...form, origenId: e.target.value })} required>
                <option value="">Seleccionar...</option>
                {planetas.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            </label>
            <label>
              Destino
              <select value={form.destinoId} onChange={(e) => setForm({ ...form, destinoId: e.target.value })} required>
                <option value="">Seleccionar...</option>
                {planetas.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            </label>
            <label>
              Estado
              <select value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value as EstadoViaje })}>
                {ESTADOS.map((estado) => <option key={estado} value={estado}>{estado}</option>)}
              </select>
            </label>
            <label>Carga (kg)<input type="number" value={form.cargaDeclaradaKg} onChange={(e) => setForm({ ...form, cargaDeclaradaKg: Number(e.target.value) })} /></label>
            <label>Fecha de salida<input type="date" value={form.fechaSalida} onChange={(e) => setForm({ ...form, fechaSalida: e.target.value })} required /></label>
            <label className="checkbox"><input type="checkbox" checked={form.esEncubierto} onChange={(e) => setForm({ ...form, esEncubierto: e.target.checked })} /> Encubierto</label>
            <label className="checkbox"><input type="checkbox" checked={form.esAgendado} onChange={(e) => setForm({ ...form, esAgendado: e.target.checked })} /> Agendado</label>
            <div className="acciones">
              <button type="submit" className="btn-primary">{editandoId ? 'Guardar cambios' : 'Crear viaje'}</button>
              {editandoId && <button type="button" className="btn-secondary" onClick={nuevo}>Cancelar</button>}
            </div>
          </form>
        </section>
      )}
    </div>
  );
}

export default ViajesPage;
