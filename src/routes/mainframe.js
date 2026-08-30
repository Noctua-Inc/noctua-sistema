import express from 'express';
import mainframeController from '../controller/mainframeController.js';

const router = express.Router();

router.get('/', mainframeController.listar);
router.get('/:id', mainframeController.buscarPorId);
router.post('/', mainframeController.criar);
router.put('/:id', mainframeController.atualizar);
router.delete('/:id', mainframeController.remover);

export default router;