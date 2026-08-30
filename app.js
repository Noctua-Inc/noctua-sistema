import express from 'express';
import routesUsers from './src/routes/users.js';
import routesLocalizacao from './src/routes/localizacao.js';
import routesComponente from './src/routes/componente.js';
import routesMainframe from './src/routes/mainframe.js';
import routesParametro from './src/routes/parametro.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const port = 3000;
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'views')));

app.use('/api', routesUsers);
app.use('/api/localizacao', routesLocalizacao);
app.use('/api/componente', routesComponente);
app.use('/api/mainframe', routesMainframe);
app.use('/api/parametro', routesParametro);

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});