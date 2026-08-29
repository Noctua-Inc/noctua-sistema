import express from 'express';
import routesUsers from './src/routes/users.js';
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

app.listen(port, () =>{
    console.log(`Servidor rodando em http://localhost:${port}`);
});

