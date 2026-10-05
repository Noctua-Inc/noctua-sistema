import express from 'express';
import cargoController from '../controller/cargoController.js';

const router = express.Router();

router.get('/:id', cargoController.listar);
router.put('/:id', cargoController.atualizar)
router.delete('/:id', cargoController.deletar);
router.post('/:id', cargoController.criar);

export default router;