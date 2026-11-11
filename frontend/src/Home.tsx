import { Link } from 'react-router-dom';
import NavBar from './components/NavBar';
import { getRol, getToken } from './auth';

function Home() {
  const token = getToken();
  const rol = getRol();

  return (
    <div className="page">
      <NavBar />
      <section className="hero-home">
        <h1>Bienvenido a FlySolo</h1>
        <p>Dando el mejor servicio de viajes desde una galaxia muy, muy lejana...</p>
        <div className="acciones">
          {!token && (
            <>
              <Link className="btn-primary" to="/login">Iniciar sesión</Link>
              <Link className="btn-secondary" to="/register">Crear cuenta</Link>
            </>
          )}
          {token && rol === 0 && (
            <>
              <Link className="btn-primary" to="/pedir">Pedir viaje</Link>
              <Link className="btn-secondary" to="/mis-viajes">Mis viajes</Link>
            </>
          )}
          {token && rol === 1 && (
            <Link className="btn-primary" to="/piloto">Panel piloto</Link>
          )}
          {token && rol === 2 && (
            <Link className="btn-primary" to="/admin">Panel de administración</Link>
          )}
        </div>
        {!token && (
          <p>Iniciá sesión para explorar destinos, conocer la flota y seguir tus viajes.</p>
        )}
      </section>

      {token && (
        <section className="features">
          <article className="card">
            <h2>Explorá destinos</h2>
            <p>Consultá el catálogo de planetas con filtro por descripción y detalle de coordenadas.</p>
            <Link to="/planetas">Ver planetas →</Link>
          </article>
          {rol === 2 && (
            <article className="card">
              <h2>Conocé la flota</h2>
              <p>Naves disponibles, tipo, capacidad de equipaje y piloto asignado.</p>
              <Link to="/naves">Ver naves →</Link>
            </article>
          )}
          <article className="card">
            <h2>Seguí tus viajes</h2>
            <p>Listado de viajes filtrado por estado, con detalle, finalización y reseñas.</p>
            <Link to="/viajes">Ver viajes →</Link>
          </article>
          {rol === 1 && (
            <article className="card">
              <h2>Mis reseñas</h2>
              <p>Consultá las opiniones que dejaron los pasajeros sobre tus viajes.</p>
              <Link to="/resenas">Ver reseñas →</Link>
            </article>
          )}
        </section>
      )}
    </div>
  );
}

export default Home;
