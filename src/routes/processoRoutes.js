import express from 'express';
import processoController from '../controller/processoController.js';

const router = express.Router();

router.get('/ultimos/:idEmpresa/:idMainframe/:metrica', processoController.buscarUltimosProcessos);

export default router;
