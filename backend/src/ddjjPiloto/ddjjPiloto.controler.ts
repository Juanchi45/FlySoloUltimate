import { Request, Response, NextFunction } from "express";
import { DDJJPiloto } from "./ddjjPiloto.entity.js";
import { orm } from "../shared/db/orm.js";

const em = orm.em;

function sanitizeDDJJInput(
    req: Request,
    res: Response,
    next: NextFunction
){
    req.body.sanitizedInput = {
        numeroLicencia: req.body.numeroLicencia,
        puntajeLicencia: req.body.puntajeLicencia,
        fotoLicencia: req.body.fotoLicencia,
        preferenciaNave: req.body.preferenciaNave,
        estado: req.body.estado,
        usuario: req.body.usuario,
    };
    Object.keys(req.body.sanitizedInput).forEach(key => {
        if (req.body.sanitizedInput[key] === undefined) {
            delete req.body.sanitizedInput[key];
        }
    });
    next();
}

async function findAllDDJJ(req: Request, res: Response){
    try{
        const solicitudes = await em.find(DDJJPiloto, {});
        res.status(200).json({message: 'found all ddjj', data: solicitudes});
    }catch(error:any){
        res.status(500).json({message: error.message});
    }
}

async function findOneDDJJ(req: Request, res: Response){
    try{
        const id = Number.parseInt(req.params.id as string);
        const solicitud = await em.findOneOrFail(DDJJPiloto, {id});
        res.status(200).json({message: 'found ddjj', data: solicitud});
    }catch(error:any){
        res.status(500).json({message: error.message});
    }
}

async function addDDJJ(req: Request, res: Response){
    try{
        const solicitud = em.create(DDJJPiloto, req.body.sanitizedInput);
        await em.persistAndFlush(solicitud);
        res.status(201).json({message: 'DDJJ creada!', data: solicitud});
    }catch(error:any){
        res.status(500).json({message: error.message});
    }
}

async function actualizaDDJJ(req: Request, res: Response){
    try{
        const id = Number.parseInt(req.params.id as string);
        const solicitud = await em.findOneOrFail(DDJJPiloto, {id});
        em.assign(solicitud, req.body.sanitizedInput);
        await em.flush();
        res.status(200).json({message: 'DDJJ actualizada!', data: solicitud});
    }catch(error:any){
        res.status(500).json({message: error.message});
    }
}

async function borrarDDJJ(req: Request, res: Response){
    try{
        const id = Number.parseInt(req.params.id as string);
        const solicitud = em.getReference(DDJJPiloto, id);
        await em.removeAndFlush(solicitud);
        res.status(200).json({message: 'DDJJ borrada!', data: solicitud});
    }catch(error:any){
        res.status(500).json({message: error.message});
    }
}

export {
    sanitizeDDJJInput,
    findAllDDJJ,
    findOneDDJJ,
    addDDJJ,
    actualizaDDJJ,
    borrarDDJJ
}
