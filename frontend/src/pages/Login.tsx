import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { API_URL } from '../config';

function Login() {
  const [mail, setMail] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(`${API_URL}/usuarios/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: mail, contrasena }),
      });
      const data = await res.json();

      if (!data.ok) {
        setError(data.error ?? 'Credenciales incorrectas');
        return;
      }

      // Guardar sesión en sessionStorage: cada pestaña mantiene su propia cuenta.
      sessionStorage.setItem('id', String(data.id));
      sessionStorage.setItem('nombre', data.nombre);
      sessionStorage.setItem('es_piloto', String(data.es_piloto));
      sessionStorage.setItem('token', data.token);

      // Redirigir según rol: 0=pasajero, 1=piloto, 2=admin
      if (data.es_piloto === 2) navigate('/admin');
      else if (data.es_piloto === 1) navigate('/piloto');
      else navigate('/pedir');

    } catch {
      setError('Error de conexión con el servidor');
    }
  }

  return (
    <div className="page-center">
      <div className="card">
        <h1>FlySolo</h1>
        <h2>Inicio de sesión</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={mail}
            onChange={e => setMail(e.target.value)}
            required
          />
          <p></p>
          <input
            type="password"
            placeholder="Contraseña"
            value={contrasena}
            onChange={e => setContrasena(e.target.value)}
            required
          />
          <p></p>
          {error && <p className="error">{error}</p>}
          <button type="submit" className="btn-primary">Ingresar</button>
        </form>
        <div className="links">
          <Link to="/register">No tiene una cuenta? Regístrese aquí</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;