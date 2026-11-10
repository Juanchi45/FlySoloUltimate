import { Router } from "express";
import{
    sanitizePlanetaInput,
    findAllPlanetas,
    findOnePlaneta,
    addPlaneta,
    actualizaPlaneta,
    borrarPlaneta,
    cotizarViaje
} from "./planeta.controler.js";
import { verificarToken, soloAdmin } from "../shared/middleware/auth.middleware.js";

export const planetaRouter = Router();

planetaRouter.get('/', findAllPlanetas);
planetaRouter.get('/verPlanetas', findAllPlanetas);
planetaRouter.get('/verPlaneta/:id', findOnePlaneta);
planetaRouter.post('/create', verificarToken, soloAdmin, sanitizePlanetaInput, addPlaneta);
planetaRouter.put('/update/:id', verificarToken, soloAdmin, sanitizePlanetaInput, actualizaPlaneta);
planetaRouter.patch('/update/:id', verificarToken, soloAdmin, sanitizePlanetaInput, actualizaPlaneta);
planetaRouter.delete('/delete/:id', verificarToken, soloAdmin, borrarPlaneta);
planetaRouter.post('/cotizarViaje', cotizarViaje);
