import express from 'express';
import goldController from '../controller/goldController.js';

const router = express.Router();

router.get('/empresa/:idEmpresa/:diretorio/:arquivo', goldController.carregar);

export default router;
