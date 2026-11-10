/**
 * URLs de configuración con fallback para desarrollo local.
 * Así el frontend funciona incluso si no existe el archivo .env.
 */
export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:3000';
