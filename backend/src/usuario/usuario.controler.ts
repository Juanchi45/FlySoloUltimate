import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Usuario } from "./usuario.entity.js";
import { Nave } from "../nave/nave.entity.js";
import { TipoNave } from "../tipoNave/tipoNave.entity.js";
import { orm } from "../shared/db/orm.js";
import { TipoUsuario, Faccion, EstadoNave } from "../shared/enums/domain.enums.js";

const em = orm.em;
const JWT_SECRET = process.env.JWT_SECRET ?? 'flysolo_super_secret_cambiar_en_produccion';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '7d';

function rolDe(tipo: TipoUsuario): number {
    if (tipo === TipoUsuario.ADMIN) return 2;
    if (tipo === TipoUsuario.PILOTO) return 1;
    return 0;
}

function sanitizeUsuarioInput(
    req: Request,
    res: Response,
    next: NextFunction
){
    req.body.sanitizedInput = {
        nombre: req.body.nombre,
        email: req.body.email,
        contrasena: req.body.contrasena,
        tipo_usuario: req.body.tipo_usuario,
        faccion: req.body.faccion,
        reputacion: req.body.reputacion,
        gananciasAcumuladas: req.body.gananciasAcumuladas,
        dineroDisponible: req.body.dineroDisponible,
        activo: req.body.activo,
        registroPendiente: req.body.registroPendiente,
        nave: req.body.nave,
        ddjj: req.body.ddjj
}
Object.keys(req.body.sanitizedInput).forEach(key => {
    if (req.body.sanitizedInput[key] === undefined) {
        delete req.body.sanitizedInput[key];    
    }
})
next();
}

async function findAllUsuarios(req: Request, res: Response){
    try{
        const nombre = (req.query.nombre as string | undefined)?.trim();
        const tipo = req.query.tipo as string | undefined;
        const filtro: Record<string, unknown> = {};
        if (nombre) filtro.nombre = { $like: `%${nombre}%` };
        if (tipo && Object.values(TipoUsuario).includes(tipo as TipoUsuario)) {
            filtro.tipo_usuario = tipo as TipoUsuario;
        }
        const usuarios = await em.find(Usuario, filtro, { orderBy: { id: 'asc' } });
        res.status(200).json({message: 'found all users',data: usuarios});
    }catch(error:any){
        res.status(500).json({message: error.message});
    }
}

async function findOneUsuario(req: Request, res: Response){
    try{
        const id = Number.parseInt(req.params.id as string);
        const usuario = await em.findOneOrFail(Usuario, {id});
        res.status(200).json({message: 'found user',data: usuario});
    }catch(error:any){
        res.status(500).json({message: error.message});
    }
}

async function addUsuario(req: Request, res: Response){
    try{
        if (req.body.sanitizedInput.contrasena) {
            req.body.sanitizedInput.contrasena = await bcrypt.hash(req.body.sanitizedInput.contrasena, 10);
        }
        const nuevoUsuario = em.create(Usuario, req.body.sanitizedInput);
        await em.persistAndFlush(nuevoUsuario);
        res.status(201).json({message: 'Usuario creado!', data: nuevoUsuario});
    } catch(error:any){
        res.status(500).json({message: error.message});
    }
}

async function actualizaUsuario(req: Request, res: Response){
    try{
        const id = Number.parseInt(req.params.id as string);
        const usuarioAActualizar = await em.findOneOrFail(Usuario, {id});
        if (req.body.sanitizedInput.contrasena) {
            req.body.sanitizedInput.contrasena = await bcrypt.hash(req.body.sanitizedInput.contrasena, 10);
        }
        em.assign(usuarioAActualizar, req.body.sanitizedInput);
        await em.flush();
        res.status(200).json({message: 'Usuario actualizado!', data: usuarioAActualizar});
    } catch(error:any){
        res.status(500).json({message: error.message});
    }
}

async function borrarUsuario(req: Request, res: Response){
    try{
        const id = Number.parseInt(req.params.id as string);
        const usuarioABorrar = em.getReference(Usuario, id);
        await em.removeAndFlush(usuarioABorrar);
        res.status(200).json({message: 'Usuario borrado!', data: usuarioABorrar});
    } catch(error:any){
        res.status(500).json({message: error.message});
    } 
}

async function login(req: Request, res: Response){
    try{
        const email = req.body.email ?? req.body.mail;
        const contrasena = req.body.contrasena;

        if (!email || !contrasena) {
            return res.status(400).json({ ok: false, error: 'Email y contraseña requeridos' });
        }

        const usuario = await em.findOne(Usuario, { email });
        if (!usuario) {
            return res.status(401).json({ ok: false, error: 'Credenciales incorrectas' });
        }

        const valida = await bcrypt.compare(contrasena, usuario.contrasena);
        if (!valida) {
            return res.status(401).json({ ok: false, error: 'Credenciales incorrectas' });
        }

        if (usuario.registroPendiente) {
            return res.status(403).json({ ok: false, error: 'Tu registro está pendiente de aprobación por un administrador' });
        }

        if (!usuario.activo) {
            return res.status(403).json({ ok: false, error: 'Usuario dado de baja' });
        }

        const es_piloto = rolDe(usuario.tipo_usuario);
        const token = jwt.sign(
            { id: usuario.id, es_piloto },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] }
        );

        res.status(200).json({
            ok: true,
            id: usuario.id,
            nombre: usuario.nombre,
            es_piloto,
            token,
        });
    } catch(error:any){
        res.status(500).json({ ok: false, error: error.message });
    }
}

async function register(req: Request, res: Response){
    try{
        const { email, contrasena, nombre } = req.body;
        if (!email || !contrasena || !nombre) {
            return res.status(400).json({ ok: false, error: 'Nombre, email y contraseña requeridos' });
        }

        // Rol solicitado: admite PASAJERO/PILOTO (texto) o 0/1 (número)
        const tipoSolicitado = String(req.body.tipo_usuario ?? req.body.tipo ?? 'PASAJERO').toUpperCase();
        const tipoNumerico = tipoSolicitado === '0' ? 'PASAJERO' : tipoSolicitado === '1' ? 'PILOTO' : tipoSolicitado;
        if (tipoNumerico !== 'PASAJERO' && tipoNumerico !== 'PILOTO') {
            return res.status(400).json({ ok: false, error: 'El tipo de usuario debe ser PASAJERO o PILOTO' });
        }
        const tipo_usuario = tipoNumerico === 'PILOTO' ? TipoUsuario.PILOTO : TipoUsuario.PASAJERO;
        const esPiloto = tipo_usuario === TipoUsuario.PILOTO;

        const faccionSolicitada = String(req.body.faccion ?? 'NEUTRAL').toUpperCase();
        if (!Object.values(Faccion).includes(faccionSolicitada as Faccion)) {
            return res.status(400).json({ ok: false, error: 'La facción debe ser REBELDE, IMPERIAL o NEUTRAL' });
        }
        const faccion = faccionSolicitada as Faccion;

        const existente = await em.findOne(Usuario, { email });
        if (existente) {
            return res.status(409).json({ ok: false, error: 'El email ya está registrado' });
        }

        let nave: Nave | undefined;
        if (esPiloto) {
            const naveInput = req.body.nave ?? req.body;
            const patente = String(naveInput.patente ?? '').trim();
            const modelo = String(naveInput.modelo ?? '').trim();
            const descripcion = String(naveInput.descripcion ?? '').trim();
            const capacidadEquipaje = Number(naveInput.capacidadEquipaje ?? 0);
            const tipoId = Number(naveInput.tipoId ?? naveInput.tipo ?? 0);

            if (!patente || !modelo || !descripcion) {
                return res.status(400).json({ ok: false, error: 'Para registrarte como piloto tenés que indicar patente, modelo y descripción de tu nave' });
            }
            if (!Number.isFinite(capacidadEquipaje) || capacidadEquipaje < 0) {
                return res.status(400).json({ ok: false, error: 'La capacidad de equipaje debe ser un número válido' });
            }
            if (!tipoId) {
                return res.status(400).json({ ok: false, error: 'Tenés que seleccionar el tipo de nave' });
            }

            const tipoNave = await em.findOne(TipoNave, { id: tipoId });
            if (!tipoNave) {
                return res.status(404).json({ ok: false, error: 'El tipo de nave seleccionado no existe' });
            }

            const patenteExistente = await em.findOne(Nave, { patente });
            if (patenteExistente) {
                return res.status(409).json({ ok: false, error: 'La patente de la nave ya está registrada' });
            }

            nave = em.create(Nave, {
                patente,
                modelo,
                descripcion,
                capacidadEquipaje,
                estado: EstadoNave.ASIGNADA,
                tipo: tipoNave,
            });
        }

        const usuario = em.create(Usuario, {
            nombre,
            email,
            contrasena: await bcrypt.hash(contrasena, 10),
            tipo_usuario,
            faccion,
            activo: !esPiloto,
            registroPendiente: esPiloto,
            dineroDisponible: 0,
        });

        if (nave) {
            nave.piloto = usuario;
            em.persist([usuario, nave]);
            await em.flush();
        } else {
            await em.persistAndFlush(usuario);
        }

        res.status(201).json({
            ok: true,
            pendiente: esPiloto,
            message: esPiloto
                ? 'Registro de piloto enviado. Un administrador debe aprobar tu cuenta y tu nave.'
                : 'Registro exitoso. Ya podés iniciar sesión.',
            data: {
                id: usuario.id,
                nombre: usuario.nombre,
                email: usuario.email,
                tipo_usuario: usuario.tipo_usuario,
                faccion: usuario.faccion,
                naveId: nave?.id ?? null,
            },
        });
    } catch(error:any){
        res.status(500).json({ ok: false, error: error.message });
    }
}

async function findUsuariosPorRol(tipo: TipoUsuario){
    return em.find(Usuario, { tipo_usuario: tipo });
}

async function findAllPilotos(req: Request, res: Response){
    try{
        const pilotos = await findUsuariosPorRol(TipoUsuario.PILOTO);
        res.status(200).json({message: 'found all pilotos', data: pilotos});
    }catch(error:any){
        res.status(500).json({message: error.message});
    }
}

async function findAllPasajeros(req: Request, res: Response){
    try{
        const pasajeros = await findUsuariosPorRol(TipoUsuario.PASAJERO);
        res.status(200).json({message: 'found all pasajeros', data: pasajeros});
    }catch(error:any){
        res.status(500).json({message: error.message});
    }
}

async function findPilotosPendientes(req: Request, res: Response){
    try{
        const pendientes = await em.find(
            Usuario,
            { tipo_usuario: TipoUsuario.PILOTO, registroPendiente: true },
            { populate: ['nave'], orderBy: { id: 'asc' } }
        );
        res.status(200).json({ message: 'found pending pilots', data: pendientes });
    } catch(error:any){
        res.status(500).json({ message: error.message });
    }
}

async function aprobarPiloto(req: Request, res: Response){
    try{
        const id = Number.parseInt(req.params.id as string);
        const usuario = await em.findOne(Usuario, { id }, { populate: ['nave'] });
        if (!usuario) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        if (usuario.tipo_usuario !== TipoUsuario.PILOTO || !usuario.registroPendiente) {
            return res.status(400).json({ message: 'El usuario no es un piloto pendiente de aprobación' });
        }

        usuario.activo = true;
        usuario.registroPendiente = false;
        await em.flush();

        res.status(200).json({ message: 'Registro de piloto aprobado', data: usuario });
    } catch(error:any){
        res.status(500).json({ message: error.message });
    }
}

async function rechazarPiloto(req: Request, res: Response){
    try{
        const id = Number.parseInt(req.params.id as string);
        const usuario = await em.findOne(Usuario, { id });
        if (!usuario) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        if (usuario.tipo_usuario !== TipoUsuario.PILOTO || !usuario.registroPendiente) {
            return res.status(400).json({ message: 'El usuario no es un piloto pendiente de aprobación' });
        }

        const nave = await em.findOne(Nave, { piloto: usuario });
        if (nave) {
            await em.removeAndFlush(nave);
        }
        await em.removeAndFlush(usuario);

        res.status(200).json({ message: 'Registro de piloto rechazado' });
    } catch(error:any){
        res.status(500).json({ message: error.message });
    }
}

async function cambiarActivo(req: Request, res: Response, activo: boolean){
    try{
        const id = Number.parseInt(req.params.id as string);
        const usuario = await em.findOneOrFail(Usuario, {id});
        usuario.activo = activo;
        if (activo && usuario.registroPendiente) {
            usuario.registroPendiente = false;
        }
        await em.flush();
        res.status(200).json({message: activo ? 'Usuario reactivado' : 'Usuario dado de baja', data: usuario});
    }catch(error:any){
        res.status(500).json({message: error.message});
    }
}

function bajaUsuario(req: Request, res: Response){
    return cambiarActivo(req, res, false);
}

function reactivarUsuario(req: Request, res: Response){
    return cambiarActivo(req, res, true);
}

export {
    sanitizeUsuarioInput,
    findAllUsuarios,
    findOneUsuario,
    addUsuario,
    actualizaUsuario,
    borrarUsuario,
    login,
    register,
    findAllPilotos,
    findAllPasajeros,
    findPilotosPendientes,
    aprobarPiloto,
    rechazarPiloto,
    bajaUsuario,
    reactivarUsuario
}
