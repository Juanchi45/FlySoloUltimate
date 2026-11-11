import { Request, Response, NextFunction} from "express";
import { TipoNave } from "./tipoNave.entity.js";
import { orm } from "../shared/db/orm.js";
const em = orm.em;

function sanitizeTipoNaveInput(
    req: Request,
    res: Response,
    next: NextFunction
){
    req.body.sanitizedInput = {
        nombreTipo: req.body.nombreTipo
    };
Object.keys(req.body.sanitizedInput).forEach(key => {
    if (req.body.sanitizedInput[key] === undefined) {
    delete req.body.sanitizedInput[key];    
    }
});
next();
}

async function findAllTipoNave(req: Request, res: Response){
    try{
        const nombreTipo = (req.query.nombreTipo as string | undefined)?.trim();
        const filtro = nombreTipo ? { nombreTipo: { $like: `%${nombreTipo}%` } } : {};
        const tipoNaves = await em.find(TipoNave, filtro, { orderBy: { id: 'asc' } });
        res.status(200).json({message: 'found all TipoNaves',data: tipoNaves});
    }catch(error:any){
        res.status(500).json({message: error.message});
    }
}

async function findOneTipoNave(req: Request, res: Response){
    try{
        const id = Number.parseInt(req.params.id as string);
        const tipoNave = await em.findOneOrFail(TipoNave, {id});
        res.status(200).json({message: 'found TipoNave',data: tipoNave});
    }catch(error:any){
        res.status(500).json({message: error.message});
    }
}

async function addTipoNave(req: Request, res: Response){
    try{
        const nuevoTipoNave = em.create(TipoNave, req.body.sanitizedInput);
        await em.persistAndFlush(nuevoTipoNave);
        res.status(201).json({message: 'TipoNave creado!', data: nuevoTipoNave});
    } catch(error:any){
        res.status(500).json({message: error.message});
    }
}

async function actualizaTipoNave(req: Request, res: Response){
    try{
        const id = Number.parseInt(req.params.id as string);
        const tipoNaveAActualizar = await em.findOneOrFail(TipoNave, {id});
        em.assign(tipoNaveAActualizar, req.body.sanitizedInput);
        await em.flush();
        res.status(200).json({message: 'TipoNave actualizado!', data: tipoNaveAActualizar});
    } catch(error:any){
        res.status(500).json({message: error.message});
    }
}

async function borrarTipoNave(req: Request, res: Response){
    try{
        const id = Number.parseInt(req.params.id as string);
        const tipoNaveABorrar = em.getReference(TipoNave, id);
        await em.removeAndFlush(tipoNaveABorrar);
        res.status(200).json({message: 'TipoNave borrado!', data: tipoNaveABorrar});
    } catch(error:any){
        res.status(500).json({message: error.message});
    }
}

export {
    sanitizeTipoNaveInput,
    findAllTipoNave,
    findOneTipoNave,
    addTipoNave,
    actualizaTipoNave,
    borrarTipoNave
}
