import express from 'express';
import localizacaoController from '../controller/localizacaoController.js';

const router = express.Router();

router.get('/', localizacaoController.listar);
router.get('/:id', localizacaoController.buscarPorId);
router.post('/', localizacaoController.criar);
router.put('/:id', localizacaoController.atualizar);
router.delete('/:id', localizacaoController.remover);

export default router;