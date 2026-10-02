import express from 'express';
import userController from '../controller/userController.js';
import verificacaoController from '../controller/verificacaoController.js';

const router = express.Router();

router.post('/cadastro', userController.cadastrar);

router.post('/login', userController.login);

router.get('/buscarUsuario/:id', userController.buscarPorId);

router.get('/verificarEmail', verificacaoController.verificarEmail);

router.put("/atualizarConta", function(req,res) {
    userController.atualizarConta(req,res)
})
router.delete("/excluirConta", function(req,res) {
    userController.excluirConta(req,res)
})

export default router;