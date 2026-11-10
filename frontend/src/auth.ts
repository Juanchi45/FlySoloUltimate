/**
 * Helpers de autenticación para el frontend.
 * Centraliza el acceso a sessionStorage y la construcción de headers.
 *
 * Se usa sessionStorage (en lugar de localStorage) para que cada pestaña
 * tenga su propia sesión y se puedan tener dos cuentas distintas abiertas
 * al mismo tiempo en pestañas diferentes.
 */

export function getToken(): string | null {
  return sessionStorage.getItem('token');
}

export function getUsuarioId(): string | null {
  return sessionStorage.getItem('id');
}

export function getRol(): number {
  return Number(sessionStorage.getItem('es_piloto') ?? '0');
}

export function getNombre(): string {
  return sessionStorage.getItem('nombre') ?? '';
}

export function isAdmin(): boolean {
  return getRol() === 2;
}

export function isPiloto(): boolean {
  return getRol() === 1;
}

export function isPasajero(): boolean {
  return getRol() === 0;
}

/** Devuelve los headers con el token JWT para usarlos en fetch */
export function authHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getToken()}`,
  };
}

export function logout(): void {
  // Solo cierra la sesión de esta pestaña; las demás pestañas conservan la suya.
  sessionStorage.clear();
  window.location.href = '/login';
}