import 'dotenv/config';
import express from 'express';
import 'reflect-metadata';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { orm, SyncSchema } from './shared/db/orm.js';
import { RequestContext } from '@mikro-orm/core';
import { usuarioRouter } from './usuario/usuario.routes.js';
import { planetaRouter } from './planeta/planeta.routes.js';
import { viajeRouter } from './viaje/viaje.routes.js';
import { naveRouter } from './nave/nave.routes.js';
import { tipoNaveRouter } from './tipoNave/tiponave.routes.js';
import { reviewRouter } from './review/review.router.js';
import { ddjjRouter } from './ddjjPiloto/ddjjPiloto.routes.js';
import { setIO } from './shared/realtime.js';
import cors from 'cors';

const PORT = Number(process.env.PORT ?? 3000);
const ORIGINS = [
  'http://localhost:4173',
  'http://localhost:5173',
  'http://127.0.0.1:4173',
  'http://127.0.0.1:5173',
];

const app = express();

app.use(cors({ origin: ORIGINS, methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] }));
app.use(express.json());

app.use((req, res, next) => {
  RequestContext.create(orm.em, next);
});

app.use('/api/usuarios', usuarioRouter);
app.use('/api/planetas', planetaRouter);
app.use('/api/viajes', viajeRouter);
app.use('/api/naves', naveRouter);
app.use('/api/tiposnave', tipoNaveRouter);
app.use('/api/reviews', reviewRouter);
app.use('/api/ddjj', ddjjRouter);

app.use((_, res) => {
  res.status(404).json({ message: 'Resource not found :(' });
});

await SyncSchema();

const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: ORIGINS } });

io.on('connection', (socket) => {
  const { id, es_piloto } = socket.handshake.query;
  if (es_piloto === '1' && id) {
    socket.join('pilotos');
  } else if (id) {
    socket.join(`usuario_${id}`);
  }
});

setIO(io);

httpServer.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
