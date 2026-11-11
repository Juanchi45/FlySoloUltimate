import { Link, useLocation } from 'react-router-dom';
import { getNombre, getRol, getToken, logout } from '../auth';

function NavBar() {
  const location = useLocation();
  const token = getToken();
  const rol = getRol();

  const linkClass = (path: string) =>
    location.pathname === path ? 'nav-link active' : 'nav-link';

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">FlySolo</Link>
      </div>
      <div className="navbar-links">
        {token && rol !== 0 && (
          <Link className={linkClass('/planetas')} to="/planetas">Planetas</Link>
        )}
        {token && rol === 2 && (
          <Link className={linkClass('/naves')} to="/naves">Naves</Link>
        )}
        {token && rol !== 0 && (
          <Link className={linkClass('/viajes')} to="/viajes">Viajes</Link>
        )}
        {token && rol === 1 && (
          <Link className={linkClass('/resenas')} to="/resenas">Reseñas</Link>
        )}

        {token && rol === 0 && (
          <>
            <Link className={linkClass('/pedir')} to="/pedir">Pedir viaje</Link>
            <Link className={linkClass('/mis-viajes')} to="/mis-viajes">Mis viajes</Link>
          </>
        )}
        {token && rol === 1 && (
          <Link className={linkClass('/piloto')} to="/piloto">Panel piloto</Link>
        )}
        {token && rol === 2 && (
          <Link className={linkClass('/admin')} to="/admin">Administración</Link>
        )}
      </div>
      <div className="navbar-user">
        {token ? (
          <>
            <span>{getNombre()}</span>
            <button className="btn-secondary" onClick={logout}>Salir</button>
          </>
        ) : (
          <>
            <Link className="btn-secondary" to="/login">Ingresar</Link>
            <Link className="btn-primary" to="/register">Registrarse</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default NavBar;
