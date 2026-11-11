import { Router } from "express";
import {
    sanitizeDDJJInput,
    findAllDDJJ,
    findOneDDJJ,
    addDDJJ,
    actualizaDDJJ,
    borrarDDJJ
} from "./ddjjPiloto.controler.js";
import { verificarToken } from "../shared/middleware/auth.middleware.js";

export const ddjjRouter = Router();

ddjjRouter.get('/verDDJJ', findAllDDJJ);
ddjjRouter.get('/verDDJJ/:id', findOneDDJJ);
ddjjRouter.post('/create', verificarToken, sanitizeDDJJInput, addDDJJ);
ddjjRouter.put('/update/:id', verificarToken, sanitizeDDJJInput, actualizaDDJJ);
ddjjRouter.patch('/update/:id', verificarToken, sanitizeDDJJInput, actualizaDDJJ);
ddjjRouter.delete('/delete/:id', verificarToken, borrarDDJJ);
