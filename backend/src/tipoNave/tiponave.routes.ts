import { Router } from "express";
import { 
    sanitizeTipoNaveInput,
    findAllTipoNave,
    findOneTipoNave,
    addTipoNave,
    actualizaTipoNave,
    borrarTipoNave
} from "./tiponave.controler.js";
import { verificarToken, soloAdmin } from "../shared/middleware/auth.middleware.js";

export const tipoNaveRouter = Router();

tipoNaveRouter.get('/verTipoNaves', findAllTipoNave);
tipoNaveRouter.get('/verTipoNave/:id', findOneTipoNave);
tipoNaveRouter.post('/create', verificarToken, soloAdmin, sanitizeTipoNaveInput, addTipoNave);
tipoNaveRouter.put('/update/:id', verificarToken, soloAdmin, sanitizeTipoNaveInput, actualizaTipoNave);
tipoNaveRouter.patch('/update/:id', verificarToken, soloAdmin, sanitizeTipoNaveInput, actualizaTipoNave);
tipoNaveRouter.delete('/delete/:id', verificarToken, soloAdmin, borrarTipoNave);
