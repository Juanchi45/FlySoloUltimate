import { Routes, Route, Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import ListarUsuarios from './listarUsuarios.tsx';
import PedirViaje from './pages/usuario/PedirViaje.tsx';
import MisViajesPage from './pages/usuario/MisViajesPage.tsx';
import AdminPanel from './pages/administrador/AdminPanel.tsx';
import Login from './pages/Login.tsx';
import Register from './pages/Register.tsx';
import Home from './Home.tsx';
import PanelPiloto from './PanelPiloto.tsx';
import PlanetasPage from './pages/planetas/PlanetasPage.tsx';
import NavesPage from './pages/naves/NavesPage.tsx';
import ViajesPage from './pages/viajes/ViajesPage.tsx';
import ResenasPage from './pages/resenas/ResenasPage.tsx';

function homeDeRol(rol: number): string {
  if (rol === 2) return '/admin';
  if (rol === 1) return '/piloto';
  return '/pedir';
}

// Protege rutas según el rol almacenado en sessionStorage (sesión por pestaña)
function RutaProtegida({ children, rolRequerido }: { children: ReactNode; rolRequerido: number }) {
  const token = sessionStorage.getItem('token');
  const rol = Number(sessionStorage.getItem('es_piloto') ?? '-1');

  if (!token || rol < 0) return <Navigate to="/login" replace />;
  if (rol !== rolRequerido) return <Navigate to={homeDeRol(rol)} replace />;
  return children;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/listarUsuarios" element={<ListarUsuarios />} />
      <Route path="/planetas" element={<PlanetasPage />} />
      <Route path="/naves" element={
        <RutaProtegida rolRequerido={2}><NavesPage /></RutaProtegida>
      } />
      <Route path="/viajes" element={<ViajesPage />} />
      <Route path="/resenas" element={
        <RutaProtegida rolRequerido={1}><ResenasPage /></RutaProtegida>
      } />

      <Route path="/pedir" element={
        <RutaProtegida rolRequerido={0}><PedirViaje /></RutaProtegida>
      } />
      <Route path="/mis-viajes" element={
        <RutaProtegida rolRequerido={0}><MisViajesPage /></RutaProtegida>
      } />
      <Route path="/piloto" element={
        <RutaProtegida rolRequerido={1}><PanelPiloto /></RutaProtegida>
      } />
      <Route path="/admin" element={
        <RutaProtegida rolRequerido={2}><AdminPanel /></RutaProtegida>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
