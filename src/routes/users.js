import express from 'express';
import userController from '../controller/userController.js';
import verificacaoController from '../controller/verificacaoController.js';

const router = express.Router();

router.post('/cadastro', userController.cadastrar);
router.post('/login', userController.login);
router.get('/verificarEmail', verificacaoController.verificarEmail);

router.get('/buscarUsuario/:id', userController.buscarPorId);
router.get('/listar', userController.listar);
router.get('/cargos', userController.listarCargos);

router.put('/atualizarConta', userController.atualizarConta);
router.put('/atualizarPerfil', userController.atualizarPerfil);
router.delete('/excluirConta/:id', userController.excluirConta);

export default router;