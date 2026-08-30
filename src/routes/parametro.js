import express from 'express';
import parametroController from '../controller/parametroController.js';

const router = express.Router();

router.get('/', parametroController.listar);
router.get('/:id', parametroController.buscarPorId);
router.post('/', parametroController.criar);
router.put('/:id', parametroController.atualizar);
router.delete('/:id', parametroController.remover);

export default router;