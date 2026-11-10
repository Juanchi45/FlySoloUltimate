import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { API_URL } from '../config';
import type { Faccion, TipoNave, TipoUsuario } from '../types';

type TipoRegistro = Extract<TipoUsuario, 'PASAJERO' | 'PILOTO'>;

function Register() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [tipo, setTipo] = useState<TipoRegistro>('PASAJERO');
  const [faccion, setFaccion] = useState<Faccion>('NEUTRAL');
  const [tiposNave, setTiposNave] = useState<TipoNave[]>([]);

  const [patente, setPatente] = useState('');
  const [modelo, setModelo] = useState('');
  const [descripcionNave, setDescripcionNave] = useState('');
  const [capacidadEquipaje, setCapacidadEquipaje] = useState(0);
  const [tipoNaveId, setTipoNaveId] = useState('');

  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [pendiente, setPendiente] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/tiposnave/verTipoNaves`)
      .then((res) => res.json())
      .then((data) => setTiposNave(data.data ?? []))
      .catch(() => setError('No se pudieron cargar los tipos de nave'));
  }, []);

  async function registrar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMensaje('');
    setError('');
    setPendiente(false);

    const body: Record<string, unknown> = {
      nombre,
      email,
      contrasena,
      tipo_usuario: tipo,
      faccion,
    };

    if (tipo === 'PILOTO') {
      body.nave = {
        patente,
        modelo,
        descripcion: descripcionNave,
        capacidadEquipaje: Number(capacidadEquipaje),
        tipoId: Number(tipoNaveId),
      };
    }

    try {
      const res = await fetch(`${API_URL}/usuarios/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok || !data.ok) {
        setError(data.error ?? 'No se pudo completar el registro');
        return;
      }

      setMensaje(data.message ?? 'Registro exitoso');
      setPendiente(Boolean(data.pendiente));
    } catch {
      setError('Error de conexión con el servidor');
    }
  }

  return (
    <div className="page-center">
      <div className="card">
        <h1>FlySolo</h1>
        <h2>Crear cuenta</h2>

        {!mensaje && (
          <form onSubmit={registrar} className="form-grid">
            <label>
              Nombre
              <input value={nombre} onChange={(e) => setNombre(e.target.value)} required />
            </label>
            <label>
              Email
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </label>
            <label>
              Contraseña
              <input type="password" value={contrasena} onChange={(e) => setContrasena(e.target.value)} required />
            </label>
            <label>
              ¿Qué tipo de usuario querés ser?
              <select value={tipo} onChange={(e) => setTipo(e.target.value as TipoRegistro)}>
                <option value="PASAJERO">Pasajero</option>
                <option value="PILOTO">Piloto</option>
              </select>
            </label>
            <label>
              Facción
              <select value={faccion} onChange={(e) => setFaccion(e.target.value as Faccion)}>
                <option value="REBELDE">Rebelde</option>
                <option value="IMPERIAL">Imperial</option>
                <option value="NEUTRAL">Neutral</option>
              </select>
            </label>

            {tipo === 'PILOTO' && (
              <>
                <h3>Tu nave</h3>
                <label>
                  Patente
                  <input value={patente} onChange={(e) => setPatente(e.target.value)} required />
                </label>
                <label>
                  Modelo
                  <input value={modelo} onChange={(e) => setModelo(e.target.value)} required />
                </label>
                <label>
                  Descripción
                  <input value={descripcionNave} onChange={(e) => setDescripcionNave(e.target.value)} required />
                </label>
                <label>
                  Capacidad de equipaje (kg)
                  <input
                    type="number"
                    min={0}
                    value={capacidadEquipaje}
                    onChange={(e) => setCapacidadEquipaje(Number(e.target.value))}
                    required
                  />
                </label>
                <label>
                  Tipo de nave
                  <select value={tipoNaveId} onChange={(e) => setTipoNaveId(e.target.value)} required>
                    <option value="">Seleccionar...</option>
                    {tiposNave.map((t) => <option key={t.id} value={t.id}>{t.nombreTipo}</option>)}
                  </select>
                </label>
              </>
            )}

            {error && <p className="error">{error}</p>}
            <button type="submit" className="btn-primary">Registrarse</button>
          </form>
        )}

        {mensaje && (
          <div>
            <p className="mensaje-ok">{mensaje}</p>
            {pendiente && (
              <p>
                Tu cuenta de piloto y tu nave quedaron registradas. Un administrador debe aprobar
                el registro antes de que puedas iniciar sesión.
              </p>
            )}
            <Link className="btn-primary" to="/login">Ir a iniciar sesión</Link>
          </div>
        )}

        {error && mensaje && <p className="error">{error}</p>}

        <div className="links">
          <Link to="/login">¿Ya tenés una cuenta? Iniciá sesión aquí</Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
