import { Request, Response, NextFunction } from "express";
import type { FilterQuery } from "@mikro-orm/core";
import { Viaje } from "./viaje.entity.js";
import { Usuario } from "../usuario/usuario.entity.js";
import { Planeta } from "../planeta/planeta.entity.js";
import { orm } from "../shared/db/orm.js";
import { EstadoViaje } from "../shared/enums/domain.enums.js";
import { AuthRequest } from "../shared/middleware/auth.middleware.js";
import { emitToPilots, emitToUser, hayPilotosConectados } from "../shared/realtime.js";

const em = orm.em;

function sanitizeViajeInput(
    req: Request,
    res: Response,
    next: NextFunction
){
    req.body.sanitizedInput = {
        estado: req.body.estado,
        esEncubierto: req.body.esEncubierto,
        esAgendado: req.body.esAgendado,
        fechaSalida: req.body.fechaSalida,
        cargaDeclaradaKg: req.body.cargaDeclaradaKg,
        distParsecs: req.body.distParsecs,
        precioCreditos: req.body.precioCreditos,
        usuarioId: req.body.usuarioId,
        pilotoId: req.body.pilotoId,
        origenId: req.body.origenId,
        destinoId: req.body.destinoId,
        equipaje: req.body.equipaje,
        review: req.body.review
}
Object.keys(req.body.sanitizedInput).forEach(key => {
    if (req.body.sanitizedInput[key] === undefined) {
        delete req.body.sanitizedInput[key];    
    }
})
next();
}

function resumenViaje(viaje: Viaje) {
    return {
        viajeId: viaje.id,
        pilotoId: viaje.piloto?.id ?? null,
        origen: viaje.origen?.nombre,
        destino: viaje.destino?.nombre,
        precio: viaje.precioCreditos,
        pasajero: viaje.usuario?.nombre,
        fechaSalida: viaje.fechaSalida,
    };
}

async function findAllViajes(req: Request, res: Response){
    try{
        const estado = req.query.estado as string | undefined;
        const usuarioId = req.query.usuarioId as string | undefined;
        const pilotoId = req.query.pilotoId as string | undefined;

        const filtro: FilterQuery<Viaje> = {};
        if (estado && Object.values(EstadoViaje).includes(estado as EstadoViaje)) {
            filtro.estado = estado as EstadoViaje;
        }
        if (usuarioId && !Number.isNaN(Number(usuarioId))) {
            filtro.usuario = Number(usuarioId);
        }
        if (pilotoId && !Number.isNaN(Number(pilotoId))) {
            filtro.piloto = Number(pilotoId);
        }

        const viajes = await em.find(Viaje, filtro, {
            populate: ['usuario', 'piloto', 'origen', 'destino', 'review'],
            orderBy: { id: 'desc' },
        });
        res.status(200).json({message: 'found all viajes',data: viajes});
    }catch(error:any){
        res.status(500).json({message: error.message});
    }   
}

async function findOneViaje(req: Request, res: Response){
    try{
        const id = Number.parseInt(req.params.id as string);
        const viaje = await em.findOneOrFail(Viaje, {id}, {
            populate: ['usuario', 'piloto', 'origen', 'destino', 'review'],
        });
        res.status(200).json({message: 'found viaje',data: viaje});
    }catch(error:any){
        res.status(500).json({message: error.message});
    }
}

async function addViaje(req: Request, res: Response){
    try{
        const body = req.body;
        const usuarioId = Number(body.usuarioId ?? body.usuario);
        const origenId = Number(body.origenId ?? body.origen);
        const destinoId = Number(body.destinoId ?? body.destino);

        if (!usuarioId || !origenId || !destinoId) {
            return res.status(400).json({ message: 'usuarioId, origenId y destinoId son requeridos' });
        }

        const [usuario, origen, destino] = await Promise.all([
            em.findOne(Usuario, { id: usuarioId }),
            em.findOne(Planeta, { id: origenId }),
            em.findOne(Planeta, { id: destinoId }),
        ]);

        if (!usuario || !origen || !destino) {
            return res.status(404).json({ message: 'Usuario, origen o destino no encontrado' });
        }

        const dx = Number(destino.posX) - Number(origen.posX);
        const dy = Number(destino.posY) - Number(origen.posY);
        const dz = Number(destino.posZ) - Number(origen.posZ);
        const distancia = Math.sqrt(dx * dx + dy * dy + dz * dz);

        const pilotoId = Number(body.pilotoId ?? body.piloto);
        const nuevoViaje = em.create(Viaje, {
            usuario,
            origen,
            destino,
            piloto: pilotoId ? em.getReference(Usuario, pilotoId) : undefined,
            estado: body.estado ?? EstadoViaje.PENDIENTE,
            esEncubierto: Boolean(body.esEncubierto),
            esAgendado: Boolean(body.esAgendado),
            fechaSalida: body.fechaSalida ? new Date(body.fechaSalida) : new Date(),
            cargaDeclaradaKg: Number(body.cargaDeclaradaKg ?? 0),
            distParsecs: distancia,
            precioCreditos: Number(body.precioCreditos ?? Math.round(distancia * 100)),
            equipaje: body.equipaje,
        });
        await em.persistAndFlush(nuevoViaje);
        res.status(201).json({message: 'Viaje creado!', data: nuevoViaje});
    } catch(error:any){
        res.status(500).json({message: error.message});
    }
}

async function actualizaViaje(req: Request, res: Response){
    try{
        const id = Number.parseInt(req.params.id as string);
        const viajeAActualizar = await em.findOneOrFail(Viaje, {id}, {
            populate: ['origen', 'destino'],
        });
        const datos = req.body.sanitizedInput;

        if (datos.usuarioId !== undefined) {
            datos.usuario = em.getReference(Usuario, Number(datos.usuarioId));
            delete datos.usuarioId;
        }
        if (datos.pilotoId !== undefined) {
            datos.piloto = datos.pilotoId ? em.getReference(Usuario, Number(datos.pilotoId)) : null;
            delete datos.pilotoId;
        }
        if (datos.origenId !== undefined) {
            datos.origen = em.getReference(Planeta, Number(datos.origenId));
            delete datos.origenId;
        }
        if (datos.destinoId !== undefined) {
            datos.destino = em.getReference(Planeta, Number(datos.destinoId));
            delete datos.destinoId;
        }
        if (datos.fechaSalida) {
            datos.fechaSalida = new Date(datos.fechaSalida);
        }

        em.assign(viajeAActualizar, datos);

        if (datos.origen || datos.destino) {
            await em.populate(viajeAActualizar, ['origen', 'destino']);
            const dx = Number(viajeAActualizar.destino.posX) - Number(viajeAActualizar.origen.posX);
            const dy = Number(viajeAActualizar.destino.posY) - Number(viajeAActualizar.origen.posY);
            const dz = Number(viajeAActualizar.destino.posZ) - Number(viajeAActualizar.origen.posZ);
            const distancia = Math.sqrt(dx * dx + dy * dy + dz * dz);
            viajeAActualizar.distParsecs = distancia;
            viajeAActualizar.precioCreditos = Math.round(distancia * 100);
        }

        await em.flush();
        res.status(200).json({message: 'Viaje actualizado!', data: viajeAActualizar});
    } catch(error:any){
        res.status(500).json({message: error.message});
    }
}

async function borrarViaje(req: Request, res: Response){
    try{
        const id = Number.parseInt(req.params.id as string);
        const viajeABorrar = em.getReference(Viaje, id);
        await em.removeAndFlush(viajeABorrar);
        res.status(200).json({message: 'Viaje borrado!', data: viajeABorrar});
    } catch(error:any){
        res.status(500).json({message: error.message});
    }
}

async function pedirViaje(req: AuthRequest, res: Response){
    try{
        const usuarioId = req.usuario!.id;
        const { origenNombre, destinoNombre } = req.body;

        if (!origenNombre || !destinoNombre) {
            return res.status(400).json({ message: 'Origen y destino requeridos' });
        }

        const origen = await em.findOne(Planeta, { nombre: origenNombre });
        const destino = await em.findOne(Planeta, { nombre: destinoNombre });
        if (!origen || !destino) {
            return res.status(404).json({ message: 'Origen o destino no encontrado' });
        }

        const pasajero = await em.findOneOrFail(Usuario, { id: usuarioId });
        const dx = Number(destino.posX) - Number(origen.posX);
        const dy = Number(destino.posY) - Number(origen.posY);
        const dz = Number(destino.posZ) - Number(origen.posZ);
        const distancia = Math.sqrt(dx * dx + dy * dy + dz * dz);

        const viaje = em.create(Viaje, {
            usuario: pasajero,
            origen,
            destino,
            estado: EstadoViaje.PENDIENTE,
            esEncubierto: false,
            esAgendado: false,
            fechaSalida: new Date(),
            cargaDeclaradaKg: 0,
            distParsecs: distancia,
            precioCreditos: Math.round(distancia * 100),
        });
        await em.persistAndFlush(viaje);

        const payload = {
            viajeId: viaje.id,
            origen: origen.nombre,
            destino: destino.nombre,
            precio: viaje.precioCreditos,
            pasajero: pasajero.nombre,
            fechaSalida: viaje.fechaSalida,
        };

        if (hayPilotosConectados()) {
            emitToPilots('nuevo_viaje', payload);
        } else {
            emitToUser(usuarioId, 'sin_pilotos', payload);
        }

        res.status(201).json({ message: 'viaje creado', data: payload });
    } catch(error:any){
        res.status(500).json({ message: error.message });
    }
}

async function findViajesPendientes(req: Request, res: Response){
    try{
        const viajes = await em.find(
            Viaje,
            { estado: EstadoViaje.PENDIENTE },
            { populate: ['origen', 'destino', 'usuario'] }
        );
        res.status(200).json({ message: 'found pendientes', data: viajes.map(resumenViaje) });
    } catch(error:any){
        res.status(500).json({ message: error.message });
    }
}

async function aceptarViaje(req: AuthRequest, res: Response){
    try{
        const id = Number.parseInt(req.params.id as string);
        const pilotoId = req.usuario!.id;

        const viaje = await em.findOne(
            Viaje,
            { id, estado: EstadoViaje.PENDIENTE },
            { populate: ['origen', 'destino', 'usuario'] }
        );
        if (!viaje) {
            return res.status(404).json({ message: 'Viaje no encontrado o ya tomado' });
        }

        viaje.piloto = em.getReference(Usuario, pilotoId);
        viaje.estado = EstadoViaje.EN_PROGRESO;
        await em.flush();

        const payload = resumenViaje(viaje);
        emitToUser(viaje.usuario.id, 'viaje_aceptado', payload);

        res.status(200).json({ message: 'viaje aceptado', data: payload });
    } catch(error:any){
        res.status(500).json({ message: error.message });
    }
}

async function findMisViajes(req: AuthRequest, res: Response){
    try{
        const usuarioId = req.usuario!.id;
        const viajes = await em.find(
            Viaje,
            { $or: [{ usuario: usuarioId }, { piloto: usuarioId }] },
            {
                populate: ['usuario', 'piloto', 'origen', 'destino', 'review'],
                orderBy: { id: 'desc' },
            }
        );
        res.status(200).json({ message: 'found mis viajes', data: viajes });
    } catch(error:any){
        res.status(500).json({ message: error.message });
    }
}

async function finalizarViaje(req: AuthRequest, res: Response){
    try{
        const id = Number.parseInt(req.params.id as string);
        const viaje = await em.findOne(Viaje, { id }, {
            populate: ['usuario', 'piloto', 'origen', 'destino'],
        });
        if (!viaje) {
            return res.status(404).json({ message: 'Viaje no encontrado' });
        }

        const esDuenio = viaje.usuario.id === req.usuario!.id;
        const esPilotoAsignado = viaje.piloto?.id === req.usuario!.id;
        const esAdmin = req.usuario!.es_piloto === 2;
        if (!esDuenio && !esPilotoAsignado && !esAdmin) {
            return res.status(403).json({ message: 'Solo el pasajero, el piloto asignado o un administrador pueden finalizar el viaje' });
        }

        if (viaje.estado !== EstadoViaje.EN_PROGRESO) {
            return res.status(400).json({ message: 'Solo se pueden finalizar viajes EN_PROGRESO' });
        }

        viaje.estado = EstadoViaje.FINALIZADO;
        if (viaje.piloto) {
            const piloto = await em.findOne(Usuario, { id: viaje.piloto.id });
            if (piloto) {
                piloto.gananciasAcumuladas = (piloto.gananciasAcumuladas ?? 0) + viaje.precioCreditos;
            }
        }
        await em.flush();

        const payload = resumenViaje(viaje);
        emitToUser(viaje.usuario.id, 'viaje_finalizado', payload);
        res.status(200).json({ message: 'viaje finalizado', data: payload });
    } catch(error:any){
        res.status(500).json({ message: error.message });
    }
}

async function cancelarViaje(req: AuthRequest, res: Response){
    try{
        const id = Number.parseInt(req.params.id as string);
        const viaje = await em.findOne(Viaje, { id }, {
            populate: ['usuario', 'piloto'],
        });
        if (!viaje) {
            return res.status(404).json({ message: 'Viaje no encontrado' });
        }

        const esDuenio = viaje.usuario.id === req.usuario!.id;
        const esPilotoAsignado = viaje.piloto?.id === req.usuario!.id;
        const esAdmin = req.usuario!.es_piloto === 2;
        if (!esDuenio && !esPilotoAsignado && !esAdmin) {
            return res.status(403).json({ message: 'No tenés permiso para cancelar este viaje' });
        }

        if (viaje.estado === EstadoViaje.FINALIZADO || viaje.estado === EstadoViaje.CANCELADO) {
            return res.status(400).json({ message: 'El viaje ya está finalizado o cancelado' });
        }

        viaje.estado = EstadoViaje.CANCELADO;
        await em.flush();

        res.status(200).json({ message: 'viaje cancelado', data: resumenViaje(viaje) });
    } catch(error:any){
        res.status(500).json({ message: error.message });
    }
}

export {
    sanitizeViajeInput,
    findAllViajes,
    findOneViaje,
    addViaje,
    actualizaViaje,
    borrarViaje,
    pedirViaje,
    findViajesPendientes,
    aceptarViaje,
    findMisViajes,
    finalizarViaje,
    cancelarViaje
}
