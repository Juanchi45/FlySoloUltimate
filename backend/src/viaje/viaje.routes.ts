import { Router } from "express";
import {
    sanitizeViajeInput,
    findAllViajes,
    findOneViaje,
    addViaje,
    actualizaViaje,
    borrarViaje,
    pedirViaje,
    findViajesPendientes,
    aceptarViaje,
    findMisViajes,
    finalizarViaje,
    cancelarViaje
} from "./viaje.controler.js";
import { verificarToken, soloPiloto, soloAdmin } from "../shared/middleware/auth.middleware.js";

export const viajeRouter = Router();

viajeRouter.post('/pedir', verificarToken, pedirViaje);
viajeRouter.get('/pendientes', verificarToken, soloPiloto, findViajesPendientes);
viajeRouter.get('/mios', verificarToken, findMisViajes);
viajeRouter.patch('/:id/aceptar', verificarToken, soloPiloto, aceptarViaje);
viajeRouter.patch('/:id/finalizar', verificarToken, finalizarViaje);
viajeRouter.patch('/:id/cancelar', verificarToken, cancelarViaje);

viajeRouter.get('/verViajes', verificarToken, findAllViajes);
viajeRouter.get('/verViaje/:id', verificarToken, findOneViaje);
viajeRouter.post('/create', verificarToken, soloAdmin, sanitizeViajeInput, addViaje);
viajeRouter.put('/update/:id', verificarToken, soloAdmin, sanitizeViajeInput, actualizaViaje);
viajeRouter.patch('/update/:id', verificarToken, soloAdmin, sanitizeViajeInput, actualizaViaje);
viajeRouter.delete('/delete/:id', verificarToken, soloAdmin, borrarViaje);
