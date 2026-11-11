import { Request, Response, NextFunction } from "express";
import type { FilterQuery } from "@mikro-orm/core";
import { orm } from "../shared/db/orm.js";
import { Review } from "./review.entity.js";
import { Viaje } from "../viaje/viaje.entity.js";
import { Usuario } from "../usuario/usuario.entity.js";
import { EstadoViaje } from "../shared/enums/domain.enums.js";
import type { AuthRequest } from "../shared/middleware/auth.middleware.js";

const em = orm.em;

function sanitizeReviewInput(
    req: Request,
    res: Response,
    next: NextFunction
){
    req.body.sanitizedInput = {
        puntaje: req.body.puntaje,
        comentario: req.body.comentario,
        fecha: req.body.fecha,
        viajeId: req.body.viajeId ?? req.body.viaje,
    };
    Object.keys(req.body.sanitizedInput).forEach(key => {
        if (req.body.sanitizedInput[key] === undefined) {
            delete req.body.sanitizedInput[key];
        }
    });
    next();
}

async function recalcularReputacion(pilotoId?: number) {
    if (!pilotoId) return;

    const reviews = await em.find(Review, { viaje: { piloto: pilotoId } }, { populate: ['viaje'] });
    const piloto = await em.findOne(Usuario, { id: pilotoId });
    if (!piloto) return;

    piloto.reputacion = reviews.length
        ? Number((reviews.reduce((acc, r) => acc + r.puntaje, 0) / reviews.length).toFixed(2))
        : undefined;

    await em.flush();
}

async function findAllReviews(req: AuthRequest, res: Response){
    try{
        const viajeId = req.query.viajeId as string | undefined;
        const puntaje = req.query.puntaje as string | undefined;
        const pilotoId = req.usuario!.id;

        const filtro: FilterQuery<Review> = { viaje: { piloto: pilotoId } };
        if (viajeId && !Number.isNaN(Number(viajeId))) {
            filtro.viaje = { id: Number(viajeId), piloto: pilotoId };
        }
        if (puntaje && !Number.isNaN(Number(puntaje))) filtro.puntaje = Number(puntaje);

        const reviews = await em.find(Review, filtro, {
            populate: ['usuario', 'viaje', 'viaje.piloto', 'viaje.origen', 'viaje.destino'],
            orderBy: { id: 'desc' },
        });
        res.status(200).json({message: 'found my reviews',data: reviews});
    }catch(error:any){
        res.status(500).json({message: error.message});
    }
}

async function findOneReview(req: AuthRequest, res: Response){
    try{
        const id = Number.parseInt(req.params.id as string);
        const review = await em.findOneOrFail(Review, {id}, {
            populate: ['usuario', 'viaje', 'viaje.piloto', 'viaje.origen', 'viaje.destino'],
        });

        if (review.viaje?.piloto?.id !== req.usuario!.id) {
            return res.status(403).json({ message: 'No tenés permiso para ver esta reseña' });
        }

        res.status(200).json({message: 'found review',data: review});
    } catch(error:any){
        res.status(500).json({message: error.message});
    }
}

async function addReview(req: AuthRequest, res: Response){
    try{
        const usuarioId = req.usuario!.id;
        const esAdmin = req.usuario!.es_piloto === 2;
        const viajeId = Number(req.body.viajeId ?? req.body.viaje);
        const puntaje = Number(req.body.puntaje);
        const comentario = String(req.body.comentario ?? '').trim();

        if (!viajeId || Number.isNaN(viajeId)) {
            return res.status(400).json({ message: 'El viaje es requerido' });
        }
        if (!Number.isInteger(puntaje) || puntaje < 1 || puntaje > 5) {
            return res.status(400).json({ message: 'El puntaje debe ser un entero entre 1 y 5' });
        }
        if (!comentario) {
            return res.status(400).json({ message: 'El comentario es requerido' });
        }

        const viaje = await em.findOne(Viaje, { id: viajeId }, {
            populate: ['usuario', 'piloto'],
        });
        if (!viaje) {
            return res.status(404).json({ message: 'Viaje no encontrado' });
        }
        if (viaje.usuario.id !== usuarioId && !esAdmin) {
            return res.status(403).json({ message: 'Solo el pasajero del viaje puede dejar una reseña' });
        }
        if (viaje.estado !== EstadoViaje.FINALIZADO) {
            return res.status(400).json({ message: 'Solo se pueden reseñar viajes finalizados' });
        }

        const existente = await em.findOne(Review, { viaje: viajeId });
        if (existente) {
            return res.status(409).json({ message: 'El viaje ya tiene una reseña' });
        }

        const nuevaReview = em.create(Review, {
            puntaje,
            comentario,
            fecha: req.body.fecha ? new Date(req.body.fecha) : new Date(),
            usuario: em.getReference(Usuario, usuarioId),
            viaje: em.getReference(Viaje, viajeId),
        });
        await em.persistAndFlush(nuevaReview);
        await recalcularReputacion(viaje.piloto?.id);

        res.status(201).json({message: 'Review creado!', data: nuevaReview});
    } catch(error:any){
        res.status(500).json({message: error.message});
    }
}

async function actualizaReview(req: AuthRequest, res: Response){
    try{
        const id = Number.parseInt(req.params.id as string);
        const review = await em.findOneOrFail(Review, {id}, { populate: ['usuario', 'viaje', 'viaje.piloto'] });

        const esAutor = review.usuario.id === req.usuario!.id;
        const esAdmin = req.usuario!.es_piloto === 2;
        if (!esAutor && !esAdmin) {
            return res.status(403).json({ message: 'No tenés permiso para modificar esta reseña' });
        }

        if (req.body.puntaje !== undefined) {
            const puntaje = Number(req.body.puntaje);
            if (!Number.isInteger(puntaje) || puntaje < 1 || puntaje > 5) {
                return res.status(400).json({ message: 'El puntaje debe ser un entero entre 1 y 5' });
            }
            req.body.sanitizedInput.puntaje = puntaje;
        }

        delete req.body.sanitizedInput.viajeId;
        em.assign(review, req.body.sanitizedInput);
        await em.flush();
        await recalcularReputacion(review.viaje?.piloto?.id);

        res.status(200).json({message: 'Review actualizado!', data: review});
    } catch(error:any){
        res.status(500).json({message: error.message});
    }
}

async function borrarReview(req: AuthRequest, res: Response){
    try{
        const id = Number.parseInt(req.params.id as string);
        const review = await em.findOneOrFail(Review, {id}, { populate: ['usuario', 'viaje', 'viaje.piloto'] });

        const esAutor = review.usuario.id === req.usuario!.id;
        const esAdmin = req.usuario!.es_piloto === 2;
        if (!esAutor && !esAdmin) {
            return res.status(403).json({ message: 'No tenés permiso para borrar esta reseña' });
        }

        const pilotoId = review.viaje?.piloto?.id;
        await em.removeAndFlush(review);
        await recalcularReputacion(pilotoId);

        res.status(200).json({message: 'Review borrado!'});
    } catch(error:any){
        res.status(500).json({message: error.message});
    }
}

export {
    sanitizeReviewInput,
    findAllReviews,
    findOneReview,
    addReview,
    actualizaReview,
    borrarReview
}
