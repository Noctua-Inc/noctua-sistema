import express from 'express';
import userController from '../controller/userController.js';
import verificacaoController from '../controller/verificacaoController.js';

const router = express.Router();

router.post('/cadastro', userController.cadastrar);

router.post('/login', userController.login);

router.get('/buscarUsuario/:id', userController.buscarPorId);

router.get('/verificarEmail', verificacaoController.verificarEmail);

export default router;