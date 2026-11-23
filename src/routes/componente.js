import express from 'express';
import componenteController from '../controller/componenteController.js';

const router = express.Router();

router.get('/', componenteController.listar);
router.get('/empresa/:idEmpresa', componenteController.listarPorEmpresa);
router.get('/:id', componenteController.buscarPorId);
router.post('/', componenteController.criar);
router.put('/:id', componenteController.atualizar);
router.delete('/:id', componenteController.remover);

export default router;
