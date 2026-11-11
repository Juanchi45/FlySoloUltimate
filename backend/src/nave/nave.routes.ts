import { Router } from "express";
import { 
    sanitizeNaveInput, 
    findAllNaves,
    findOneNave,
    findMiNave,
    addNave,
    actualizaNave,
    borrarNave
} from "./nave.controler.js";
import { verificarToken, soloAdmin, soloPiloto } from "../shared/middleware/auth.middleware.js";

export const naveRouter = Router();

naveRouter.get('/verNaves', verificarToken, soloAdmin, findAllNaves);
naveRouter.get('/mia', verificarToken, soloPiloto, findMiNave);
naveRouter.get('/verNave/:id', verificarToken, findOneNave);
naveRouter.post('/create', verificarToken, soloAdmin, sanitizeNaveInput, addNave);
naveRouter.put('/update/:id', verificarToken, soloAdmin, sanitizeNaveInput, actualizaNave);
naveRouter.patch('/update/:id', verificarToken, soloAdmin, sanitizeNaveInput, actualizaNave);
naveRouter.delete('/delete/:id', verificarToken, soloAdmin, borrarNave);
