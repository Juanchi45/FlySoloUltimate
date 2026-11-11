import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET ?? 'flysolo_super_secret_cambiar_en_produccion';

// Extendemos el tipo Request para poder guardar el usuario decodificado del token
export interface AuthRequest extends Request {
  usuario?: {
    id: number;
    es_piloto: number; // 0=pasajero, 1=piloto, 2=admin
  };
}

/**
 * Middleware que verifica que el token JWT sea válido.
 * Si no hay token o es inválido, rechaza la request con 401.
 * Si es válido, guarda el payload en req.usuario y continúa.
 */
export function verificarToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  // El token viene en el header: "Authorization: Bearer <token>"
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token requerido' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { id: number; es_piloto: number };
    req.usuario = payload;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
}

/**
 * Middleware que verifica que el usuario sea administrador (es_piloto === 2).
 * Debe usarse DESPUÉS de verificarToken.
 */
export function soloAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.usuario?.es_piloto !== 2) {
    return res.status(403).json({ message: 'Acceso denegado: se requiere rol administrador' });
  }
  next();
}

/**
 * Middleware que verifica que el usuario sea piloto (es_piloto === 1).
 * Debe usarse DESPUÉS de verificarToken.
 */
export function soloPiloto(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.usuario?.es_piloto !== 1) {
    return res.status(403).json({ message: 'Acceso denegado: se requiere rol piloto' });
  }
  next();
}