import { useEffect, useState } from 'react';
import NavBar from '../../components/NavBar';
import { authHeaders } from '../../auth';
import { API_URL } from '../../config';
import type { Faccion, TipoNave, TipoUsuario, Usuario } from '../../types';

type Vista = 'pilotos' | 'pasajeros' | 'solicitudes' | 'tiposnave';

interface FormUsuario {
  id: number | null;
  nombre: string;
  email: string;
  contrasena: string;
  tipo_usuario: TipoUsuario;
  faccion: Faccion;
  activo: boolean;
}

const USUARIO_VACIO: FormUsuario = {
  id: null,
  nombre: '',
  email: '',
  contrasena: '',
  tipo_usuario: 'PASAJERO',
  faccion: 'NEUTRAL',
  activo: true,
};

const TIPOS_USUARIO: TipoUsuario[] = ['PASAJERO', 'PILOTO', 'ADMIN'];
const FACCIONES: Faccion[] = ['REBELDE', 'IMPERIAL', 'NEUTRAL'];

function AdminPanel() {
  const [vista, setVista] = useState<Vista>('pilotos');
  const [pilotos, setPilotos] = useState<Usuario[]>([]);
  const [pasajeros, setPasajeros] = useState<Usuario[]>([]);
  const [pendientes, setPendientes] = useState<Usuario[]>([]);
  const [tiposNave, setTiposNave] = useState<TipoNave[]>([]);
  const [formUsuario, setFormUsuario] = useState<FormUsuario>(USUARIO_VACIO);
  const [formTipoId, setFormTipoId] = useState<number | null>(null);
  const [nombreTipo, setNombreTipo] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  async function cargarUsuarios(v: 'pilotos' | 'pasajeros') {
    const res = await fetch(`${API_URL}/usuarios/rol/${v}`, { headers: authHeaders() });
    const data = await res.json();
    if (v === 'pilotos') setPilotos(data.data ?? []);
    else setPasajeros(data.data ?? []);
  }

  async function cargarTiposNave() {
    const res = await fetch(`${API_URL}/tiposnave/verTipoNaves`);
    const data = await res.json();
    setTiposNave(data.data ?? []);
  }

  async function cargarPendientes() {
    const res = await fetch(`${API_URL}/usuarios/pendientes`, { headers: authHeaders() });
    const data = await res.json();
    if (!res.ok) {
      setError(data.message ?? 'No se pudieron cargar las solicitudes');
      return;
    }
    setPendientes(data.data ?? []);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargarUsuarios('pilotos').catch(() => setError('No se pudieron cargar los usuarios'));
    cargarPendientes().catch(() => setError('No se pudieron cargar las solicitudes'));
  }, []);

  function cambiarVista(v: Vista) {
    setVista(v);
    setMensaje('');
    setError('');
    if (v === 'pilotos' || v === 'pasajeros') cargarUsuarios(v);
    if (v === 'solicitudes') cargarPendientes();
    if (v === 'tiposnave') cargarTiposNave();
  }

  function editarUsuario(u: Usuario) {
    setFormUsuario({
      id: u.id,
      nombre: u.nombre,
      email: u.email,
      contrasena: '',
      tipo_usuario: u.tipo_usuario,
      faccion: u.faccion,
      activo: u.activo,
    });
    setMensaje('');
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function nuevoUsuario() {
    setFormUsuario({ ...USUARIO_VACIO, tipo_usuario: vista === 'pilotos' ? 'PILOTO' : 'PASAJERO' });
    setMensaje('');
    setError('');
  }

  async function guardarUsuario(e: React.FormEvent) {
    e.preventDefault();
    setMensaje('');
    setError('');
    const body: Record<string, unknown> = {
      nombre: formUsuario.nombre,
      email: formUsuario.email,
      tipo_usuario: formUsuario.tipo_usuario,
      faccion: formUsuario.faccion,
      activo: formUsuario.activo,
    };
    if (formUsuario.contrasena) body.contrasena = formUsuario.contrasena;

    const url = formUsuario.id
      ? `${API_URL}/usuarios/update/${formUsuario.id}`
      : `${API_URL}/usuarios/create`;
    const res = await fetch(url, {
      method: formUsuario.id ? 'PUT' : 'POST',
      headers: authHeaders(),
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.message ?? 'No se pudo guardar el usuario');
      return;
    }
    setMensaje(formUsuario.id ? 'Usuario actualizado' : 'Usuario creado');
    nuevoUsuario();
    await cargarUsuarios(vista === 'pasajeros' ? 'pasajeros' : 'pilotos');
  }

  async function darDeBaja(id: number) {
    await fetch(`${API_URL}/usuarios/${id}/baja`, { method: 'PATCH', headers: authHeaders() });
    setMensaje('Usuario dado de baja');
    await cargarUsuarios(vista === 'pasajeros' ? 'pasajeros' : 'pilotos');
  }

  async function reactivar(id: number) {
    await fetch(`${API_URL}/usuarios/${id}/reactivar`, { method: 'PATCH', headers: authHeaders() });
    setMensaje('Usuario reactivado');
    await cargarUsuarios(vista === 'pasajeros' ? 'pasajeros' : 'pilotos');
  }

  async function eliminarUsuario(id: number) {
    if (!window.confirm('¿Eliminar definitivamente este usuario?')) return;
    const res = await fetch(`${API_URL}/usuarios/delete/${id}`, { method: 'DELETE', headers: authHeaders() });
    const data = await res.json();
    if (!res.ok) {
      setError(data.message ?? 'No se pudo eliminar el usuario');
      return;
    }
    setMensaje('Usuario eliminado');
    await cargarUsuarios(vista === 'pasajeros' ? 'pasajeros' : 'pilotos');
  }

  async function aprobarPiloto(id: number) {
    setMensaje('');
    setError('');
    const res = await fetch(`${API_URL}/usuarios/${id}/aprobar`, {
      method: 'PATCH',
      headers: authHeaders(),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.message ?? 'No se pudo aprobar el registro');
      return;
    }
    setMensaje('Registro de piloto aprobado');
    await Promise.all([cargarPendientes(), cargarUsuarios('pilotos')]);
  }

  async function rechazarPiloto(id: number) {
    if (!window.confirm('¿Rechazar y eliminar esta solicitud de piloto?')) return;
    setMensaje('');
    setError('');
    const res = await fetch(`${API_URL}/usuarios/${id}/rechazar`, {
      method: 'PATCH',
      headers: authHeaders(),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.message ?? 'No se pudo rechazar el registro');
      return;
    }
    setMensaje('Solicitud de piloto rechazada');
    await cargarPendientes();
  }

  function detalleNave(usuario: Usuario): string {
    if (!usuario.nave) return 'Sin nave';
    if (typeof usuario.nave === 'number') return `Nave #${usuario.nave}`;
    return `${usuario.nave.patente} · ${usuario.nave.modelo}`;
  }

  function editarTipo(t: TipoNave) {
    setFormTipoId(t.id);
    setNombreTipo(t.nombreTipo);
    setMensaje('');
    setError('');
  }

  function nuevoTipo() {
    setFormTipoId(null);
    setNombreTipo('');
    setMensaje('');
    setError('');
  }

  async function guardarTipoNave(e: React.FormEvent) {
    e.preventDefault();
    setMensaje('');
    setError('');
    const url = formTipoId
      ? `${API_URL}/tiposnave/update/${formTipoId}`
      : `${API_URL}/tiposnave/create`;
    const res = await fetch(url, {
      method: formTipoId ? 'PUT' : 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ nombreTipo }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.message ?? 'No se pudo guardar el tipo de nave');
      return;
    }
    setMensaje(formTipoId ? 'Tipo de nave actualizado' : 'Tipo de nave creado');
    nuevoTipo();
    await cargarTiposNave();
  }

  async function eliminarTipoNave(id: number) {
    if (!window.confirm('¿Eliminar este tipo de nave?')) return;
    const res = await fetch(`${API_URL}/tiposnave/delete/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.message ?? 'No se pudo eliminar el tipo de nave');
      return;
    }
    setMensaje('Tipo de nave eliminado');
    await cargarTiposNave();
  }

  const lista = vista === 'pilotos' ? pilotos : pasajeros;

  return (
    <div className="page">
      <NavBar />
      <header className="page-header">
        <div>
          <h1>Panel de administración</h1>
          <p>Gestión de usuarios y tipos de nave.</p>
        </div>
      </header>

      <nav className="admin-nav">
        <button onClick={() => cambiarVista('pilotos')} className={vista === 'pilotos' ? 'active' : ''}>Pilotos</button>
        <button onClick={() => cambiarVista('pasajeros')} className={vista === 'pasajeros' ? 'active' : ''}>Pasajeros</button>
        <button onClick={() => cambiarVista('solicitudes')} className={vista === 'solicitudes' ? 'active' : ''}>
          Solicitudes de piloto{pendientes.length > 0 ? ` (${pendientes.length})` : ''}
        </button>
        <button onClick={() => cambiarVista('tiposnave')} className={vista === 'tiposnave' ? 'active' : ''}>Tipos de nave</button>
      </nav>

      {mensaje && <p className="mensaje-ok">{mensaje}</p>}
      {error && <p className="error">{error}</p>}

      {(vista === 'pilotos' || vista === 'pasajeros') && (
        <>
          <table className="tabla">
            <thead>
              <tr><th>ID</th><th>Nombre</th><th>Email</th><th>Rol</th><th>Estado</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {lista.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.nombre}</td>
                  <td>{u.email}</td>
                  <td>{u.tipo_usuario}</td>
                  <td>{u.activo ? 'Activo' : 'Inactivo'}</td>
                  <td>
                    <div className="acciones">
                      <button onClick={() => editarUsuario(u)} className="btn-secondary">Editar</button>
                      {u.activo
                        ? <button onClick={() => darDeBaja(u.id)} className="btn-secondary">Dar de baja</button>
                        : <button onClick={() => reactivar(u.id)} className="btn-secondary">Reactivar</button>
                      }
                      <button onClick={() => eliminarUsuario(u.id)} className="btn-danger">Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
              {lista.length === 0 && <tr><td colSpan={6}>No hay usuarios.</td></tr>}
            </tbody>
          </table>

          <section className="card">
            <h2>{formUsuario.id ? `Editar usuario #${formUsuario.id}` : 'Nuevo usuario'}</h2>
            <form onSubmit={guardarUsuario} className="form-grid">
              <label>Nombre<input value={formUsuario.nombre} onChange={(e) => setFormUsuario({ ...formUsuario, nombre: e.target.value })} required /></label>
              <label>Email<input type="email" value={formUsuario.email} onChange={(e) => setFormUsuario({ ...formUsuario, email: e.target.value })} required /></label>
              <label>
                Contraseña {formUsuario.id ? '(dejar vacío para no cambiar)' : ''}
                <input type="password" value={formUsuario.contrasena} onChange={(e) => setFormUsuario({ ...formUsuario, contrasena: e.target.value })} required={!formUsuario.id} />
              </label>
              <label>
                Rol
                <select value={formUsuario.tipo_usuario} onChange={(e) => setFormUsuario({ ...formUsuario, tipo_usuario: e.target.value as TipoUsuario })}>
                  {TIPOS_USUARIO.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </label>
              <label>
                Facción
                <select value={formUsuario.faccion} onChange={(e) => setFormUsuario({ ...formUsuario, faccion: e.target.value as Faccion })}>
                  {FACCIONES.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </label>
              <label className="checkbox">
                <input type="checkbox" checked={formUsuario.activo} onChange={(e) => setFormUsuario({ ...formUsuario, activo: e.target.checked })} /> Activo
              </label>
              <div className="acciones">
                <button type="submit" className="btn-primary">{formUsuario.id ? 'Guardar cambios' : 'Crear usuario'}</button>
                {formUsuario.id && <button type="button" className="btn-secondary" onClick={nuevoUsuario}>Cancelar</button>}
              </div>
            </form>
          </section>
        </>
      )}

      {vista === 'solicitudes' && (
        <>
          <h2>Solicitudes de registro de pilotos</h2>
          <table className="tabla">
            <thead>
              <tr><th>ID</th><th>Piloto</th><th>Email</th><th>Facción</th><th>Nave</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {pendientes.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.nombre}</td>
                  <td>{u.email}</td>
                  <td>{u.faccion}</td>
                  <td>{detalleNave(u)}</td>
                  <td>
                    <div className="acciones">
                      <button onClick={() => aprobarPiloto(u.id)} className="btn-primary">Aprobar</button>
                      <button onClick={() => rechazarPiloto(u.id)} className="btn-danger">Rechazar</button>
                    </div>
                  </td>
                </tr>
              ))}
              {pendientes.length === 0 && (
                <tr><td colSpan={6}>No hay solicitudes de piloto pendientes.</td></tr>
              )}
            </tbody>
          </table>
        </>
      )}

      {vista === 'tiposnave' && (
        <>
          <table className="tabla">
            <thead>
              <tr><th>ID</th><th>Tipo</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {tiposNave.map((t) => (
                <tr key={t.id}>
                  <td>{t.id}</td>
                  <td>{t.nombreTipo}</td>
                  <td>
                    <div className="acciones">
                      <button onClick={() => editarTipo(t)} className="btn-secondary">Editar</button>
                      <button onClick={() => eliminarTipoNave(t.id)} className="btn-danger">Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
              {tiposNave.length === 0 && <tr><td colSpan={3}>No hay tipos de nave.</td></tr>}
            </tbody>
          </table>

          <section className="card">
            <h2>{formTipoId ? `Editar tipo #${formTipoId}` : 'Nuevo tipo de nave'}</h2>
            <form onSubmit={guardarTipoNave} className="form-inline">
              <input
                placeholder="Nombre del tipo (ej: Carguero)"
                value={nombreTipo}
                onChange={(e) => setNombreTipo(e.target.value)}
                required
              />
              <button type="submit" className="btn-primary">{formTipoId ? 'Guardar cambios' : 'Agregar tipo'}</button>
              {formTipoId && <button type="button" className="btn-secondary" onClick={nuevoTipo}>Cancelar</button>}
            </form>
          </section>
        </>
      )}
    </div>
  );
}

export default AdminPanel;
