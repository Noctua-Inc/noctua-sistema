import express from 'express';
import goldController from '../controller/goldController.js';
import goldService from '../service/goldService.js';

const router = express.Router();

router.get('/empresa/:idEmpresa/previsoes/resumo.json', (req, res) =>
    goldController.carregar(req, res, empresa => goldService.lerJson(empresa, 'previsoes/resumo.json')));

router.get('/empresa/:idEmpresa/:prefixoMainframe/previsoes.json', (req, res) =>
    goldController.carregar(req, res, empresa => goldService.lerJson(empresa, `${req.params.prefixoMainframe}/previsoes.json`)));

router.get('/empresa/:idEmpresa/:prefixoMainframe/monitoramentoComponentes/:arquivo', (req, res) => {
    const { prefixoMainframe, arquivo } = req.params;
    return goldController.carregar(req, res, empresa => goldService.lerMonitoramento(empresa, prefixoMainframe, arquivo));
});

router.get('/empresa/:idEmpresa/:prefixoMainframe/:prefixoDashboard/:arquivo', (req, res) => {
    const { prefixoMainframe, prefixoDashboard, arquivo } = req.params;
    return goldController.carregar(req, res, empresa => goldService.lerJson(empresa, `${prefixoMainframe}/${prefixoDashboard}/${arquivo}`));
});

export default router;
