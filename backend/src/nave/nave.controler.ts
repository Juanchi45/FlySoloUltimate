import { Request, Response, NextFunction} from "express";
import type { FilterQuery } from "@mikro-orm/core";
import { Nave } from "./nave.entity.js";
import { orm } from "../shared/db/orm.js";
import type { AuthRequest } from "../shared/middleware/auth.middleware.js";

const em = orm.em;

function sanitizeNaveInput(
    req: Request,
    res: Response,
    next: NextFunction
){
    req.body.sanitizedInput = {
        patente : req.body.patente,
        modelo: req.body.modelo,
        descripcion: req.body.descripcion,
        capacidadEquipaje: req.body.capacidadEquipaje,
        estado: req.body.estado,
        tipo: req.body.tipo,
        piloto: req.body.piloto
}
Object.keys(req.body.sanitizedInput).forEach(key => {
    if (req.body.sanitizedInput[key] === undefined) {
        delete req.body.sanitizedInput[key];    
    }
})
next();
} 

async function findAllNaves(req: Request, res: Response){
    try{
        const patente = (req.query.patente as string | undefined)?.trim();
        const modelo = (req.query.modelo as string | undefined)?.trim();
        const estado = req.query.estado as string | undefined;
        const tipoId = req.query.tipoId as string | undefined;

        const filtro: FilterQuery<Nave> = {};
        if (patente) filtro.patente = { $like: `%${patente}%` };
        if (modelo) filtro.modelo = { $like: `%${modelo}%` };
        if (estado) filtro.estado = estado as Nave['estado'];
        if (tipoId && !Number.isNaN(Number(tipoId))) filtro.tipo = Number(tipoId);

        const naves = await em.find(Nave, filtro, {
            populate: ['tipo', 'piloto'],
            orderBy: { id: 'asc' },
        });
        res.status(200).json({message: 'found all naves',data: naves});
    }catch(error:any){
        res.status(500).json({message: error.message});
    }
}

async function findOneNave(req: AuthRequest, res: Response){
    try{
        const id = Number.parseInt(req.params.id as string);
        const nave = await em.findOneOrFail(Nave, {id}, {
            populate: ['tipo', 'piloto'],
        });

        const esAdmin = req.usuario?.es_piloto === 2;
        const esPilotoDuenio = req.usuario?.es_piloto === 1 && nave.piloto?.id === req.usuario.id;
        if (!esAdmin && !esPilotoDuenio) {
            return res.status(403).json({ message: 'No tenés permiso para ver esta nave' });
        }

        res.status(200).json({message: 'found nave',data: nave});
    }catch(error:any){
        res.status(500).json({message: error.message});
    }
}

async function findMiNave(req: AuthRequest, res: Response){
    try{
        const nave = await em.findOne(Nave, { piloto: req.usuario!.id }, {
            populate: ['tipo', 'piloto'],
        });
        if (!nave) {
            return res.status(404).json({ message: 'No tenés una nave asignada' });
        }
        res.status(200).json({message: 'found mi nave', data: nave});
    }catch(error:any){
        res.status(500).json({message: error.message});
    }
}

async function addNave(req: Request, res: Response){
    try{
        const nuevaNave = em.create(Nave, req.body.sanitizedInput);
        await em.persistAndFlush(nuevaNave);
        res.status(201).json({message: 'Nave creada!', data: nuevaNave});
    } catch(error:any){
        res.status(500).json({message: error.message});
    }
}

async function actualizaNave(req: Request, res: Response){
    try{
        const id = Number.parseInt(req.params.id as string);
        const naveAActualizar = await em.findOneOrFail(Nave, {id});
        em.assign(naveAActualizar, req.body.sanitizedInput);
        await em.flush();
        res.status(200).json({message: 'Nave actualizada!', data: naveAActualizar});
    } catch(error:any){
        res.status(500).json({message: error.message});
    }
}

async function borrarNave(req: Request, res: Response){
    try{
        const id = Number.parseInt(req.params.id as string);
        const naveABorrar = em.getReference(Nave, id);
        await em.removeAndFlush(naveABorrar);
        res.status(200).json({message: 'Nave borrada!', data: naveABorrar});
    } catch(error:any){
        res.status(500).json({message: error.message});
    }
}

export {
    sanitizeNaveInput,
    findAllNaves,
    findOneNave,
    findMiNave,
    addNave,
    actualizaNave,
    borrarNave
}
