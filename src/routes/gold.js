import express from 'express';
import goldController from '../controller/goldController.js';

const router = express.Router();

router.get('/empresa/:idEmpresa/previsoes/resumo.json', (req, res) =>
    goldController.carregar(req, res, 'previsoes/resumo.json'));

router.get('/empresa/:idEmpresa/:prefixoMainframe/previsoes.json', (req, res) =>
    goldController.carregar(req, res, `${req.params.prefixoMainframe}/previsoes.json`));

router.get('/empresa/:idEmpresa/:prefixoMainframe/:prefixoDashboard/:arquivo', (req, res) => {
    const { prefixoMainframe, prefixoDashboard, arquivo } = req.params;
    return goldController.carregar(req, res, `${prefixoMainframe}/${prefixoDashboard}/${arquivo}`);
});

export default router;
