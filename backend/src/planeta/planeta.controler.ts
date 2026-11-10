import { Request, Response, NextFunction} from "express";
import type { FilterQuery } from "@mikro-orm/core";
import { orm } from "../shared/db/orm.js";
import { Planeta } from "./planeta.entity.js";
const em = orm.em;

function sanitizePlanetaInput(
    req: Request,
    res: Response,
    next: NextFunction
){
    req.body.sanitizedInput = {
        nombre: req.body.nombre,
        descripcion: req.body.descripcion,
        imagenURL: req.body.imagenURL,
        posX: req.body.posX,
        posY: req.body.posY,
        posZ: req.body.posZ
    }
Object.keys(req.body.sanitizedInput).forEach(key => {
    if (req.body.sanitizedInput[key] === undefined) {
        delete req.body.sanitizedInput[key];
    }
})
next();
}

async function findAllPlanetas(req: Request, res: Response){
    try{
        const nombre = (req.query.nombre as string | undefined)?.trim();
        const descripcion = (req.query.descripcion as string | undefined)?.trim();
        const q = (req.query.q as string | undefined)?.trim();

        const filtro: FilterQuery<Planeta> = {};
        if (nombre) filtro.nombre = { $like: `%${nombre}%` };
        if (descripcion) filtro.descripcion = { $like: `%${descripcion}%` };
        if (q) {
            filtro.$or = [
                { nombre: { $like: `%${q}%` } },
                { descripcion: { $like: `%${q}%` } },
            ];
        }

        const planetas = await em.find(Planeta, filtro, { orderBy: { id: 'asc' } });
        res.status(200).json({message: 'found all planetas',data: planetas});
    } catch(error:any){
        res.status(500).json({message: error.message});
    }
}

async function findOnePlaneta(req: Request, res: Response){
    try{
        const id = Number.parseInt(req.params.id as string);
        const planeta = await em.findOneOrFail(Planeta, {id});
        res.status(200).json({message: 'found planeta',data: planeta});
    } catch(error:any){
        res.status(500).json({message: error.message});
    }
}

async function addPlaneta(req: Request, res: Response){
    try{
        const nuevoPlaneta = em.create(Planeta, req.body.sanitizedInput);
        await em.persistAndFlush(nuevoPlaneta);
        res.status(201).json({message: 'Planeta creado!', data: nuevoPlaneta});
    } catch(error:any){
        res.status(500).json({message: error.message});
    }
}

async function actualizaPlaneta(req: Request, res: Response){
    try{
        const id = Number.parseInt(req.params.id as string);
        const planetaAActualizar = await em.findOneOrFail(Planeta, {id});
        em.assign(planetaAActualizar, req.body.sanitizedInput);
        await em.flush();
        res.status(200).json({message: 'Planeta actualizado!', data: planetaAActualizar});
    } catch(error:any){
        res.status(500).json({message: error.message});
    }
}

async function borrarPlaneta(req: Request, res: Response){
    try{
        const id = Number.parseInt(req.params.id as string);
        const planetaABorrar = em.getReference(Planeta, id);
        await em.removeAndFlush(planetaABorrar);
        res.status(200).json({message: 'Planeta borrado!', data: planetaABorrar});
    } catch(error:any){
        res.status(500).json({message: error.message});
    }
}

async function cotizarViaje(req: Request, res: Response){
    try{
        const origen = await em.findOne(Planeta, {nombre: req.body.origenNombre});
        const destino = await em.findOne(Planeta, {nombre: req.body.destinoNombre});

        if (!origen || !destino) {
            return res.status(404).json({ message: 'Origen o Destino no encontrado' });
        }

        const dx = Number(destino.posX) - Number(origen.posX);
        const dy = Number(destino.posY) - Number(origen.posY);
        const dz = Number(destino.posZ) - Number(origen.posZ);
        const distancia = Math.sqrt(dx * dx + dy * dy + dz * dz);

        const kilometrosViaje = distancia * 10000; // Convertir a kilómetros
        const precio = (kilometrosViaje/10000) * 100;
        const tiempoEstimadoMinutos = kilometrosViaje / 1000; // 1 minuto por cada 1000 km

        res.status(200).json({message: 'Cotización exitosa', data: {precio, kilometrosViaje, tiempoEstimadoMinutos}});
    } catch(error:any){
        res.status(500).json({message: error.message});
    }
}

export{
    sanitizePlanetaInput,
    findAllPlanetas,
    findOnePlaneta,
    addPlaneta,
    actualizaPlaneta,
    borrarPlaneta,
    cotizarViaje
}
