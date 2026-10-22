import 'dotenv/config';
import { createDatabase } from './db.js';
import { createApp } from './app.js';

const db = createDatabase();
const port = Number(process.env.PORT || 3001);
const server = createApp(db).listen(port,()=>console.log(`NOVA API lista: http://localhost:${port}/api/health`));

const shutdown = () => server.close(()=>{db.close();process.exit(0);});
process.once('SIGINT',shutdown);
process.once('SIGTERM',shutdown);

