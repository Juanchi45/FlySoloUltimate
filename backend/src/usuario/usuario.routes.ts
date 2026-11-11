import { Router } from "express";
import { 
    sanitizeUsuarioInput, 
    findAllUsuarios, 
    findOneUsuario, 
    addUsuario, 
    actualizaUsuario, 
    borrarUsuario,
    login,
    register,
    findAllPilotos,
    findAllPasajeros,
    findPilotosPendientes,
    aprobarPiloto,
    rechazarPiloto,
    bajaUsuario,
    reactivarUsuario
} from "./usuario.controler.js";
import { verificarToken, soloAdmin } from "../shared/middleware/auth.middleware.js";

export const usuarioRouter = Router();

usuarioRouter.post('/login', login);
usuarioRouter.post('/register', register);

usuarioRouter.get('/verUsuarios', findAllUsuarios);
usuarioRouter.get('/verUsuario/:id', findOneUsuario);
usuarioRouter.get('/rol/pilotos', verificarToken, soloAdmin, findAllPilotos);
usuarioRouter.get('/rol/pasajeros', verificarToken, soloAdmin, findAllPasajeros);
usuarioRouter.get('/pendientes', verificarToken, soloAdmin, findPilotosPendientes);
usuarioRouter.patch('/:id/aprobar', verificarToken, soloAdmin, aprobarPiloto);
usuarioRouter.patch('/:id/rechazar', verificarToken, soloAdmin, rechazarPiloto);
usuarioRouter.patch('/:id/baja', verificarToken, soloAdmin, bajaUsuario);
usuarioRouter.patch('/:id/reactivar', verificarToken, soloAdmin, reactivarUsuario);

usuarioRouter.post('/create', verificarToken, soloAdmin, sanitizeUsuarioInput, addUsuario);
usuarioRouter.put('/update/:id', verificarToken, soloAdmin, sanitizeUsuarioInput, actualizaUsuario);
usuarioRouter.patch('/update/:id', verificarToken, soloAdmin, sanitizeUsuarioInput, actualizaUsuario);
usuarioRouter.delete('/delete/:id', verificarToken, soloAdmin, borrarUsuario);
