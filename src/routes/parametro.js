import express from 'express';
import parametroController from '../controller/parametroController.js';

const router = express.Router();

router.get('/', parametroController.listar);
router.get('/:id_mainframe/:id_componente', parametroController.buscarPorId);
router.post('/', parametroController.criar);
router.put('/:id_mainframe/:id_componente', parametroController.atualizar);
router.delete('/mainframe/:id_mainframe', parametroController.removerPorMainframe);
router.delete('/:id_mainframe/:id_componente', parametroController.remover);

export default router;