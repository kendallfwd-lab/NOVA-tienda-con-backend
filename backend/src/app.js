import express from 'express';
import cors from 'cors';
import { createApi } from './routes/api.js';
import { AppError } from './errors.js';

export function createApp(db) {
  const app = express();
  app.disable('x-powered-by');
  app.use(cors({ origin: process.env.FRONTEND_ORIGIN?.split(',') ?? 'http://localhost:5173' }));
  app.use(express.json({limit:'100kb'}));
  app.use('/api',createApi(db));
  app.use((_req,_res,next)=>next(new AppError(404,'Ruta no encontrada.')));
  app.use((error,_req,res,_next)=>{
    if (error instanceof SyntaxError && 'body' in error) return res.status(400).json({error:'JSON inválido.'});
    if (error instanceof AppError) return res.status(error.status).json({error:error.message});
    if (error.code?.startsWith('SQLITE_CONSTRAINT')) {
      return res.status(409).json({error:'La operación incumple una restricción de la base de datos.'});
    }
    console.error('Error interno:',error);
    return res.status(500).json({error:'Error interno del servidor.'});
  });
  return app;
}

