import mainframeModel from '../model/mainframeModel.js';
import goldModel from '../model/goldModel.js';
import goldService from '../service/goldService.js';
import processoService from '../service/processoService.js';

async function buscarUltimosProcessos(req, res) {
    const { idEmpresa, idMainframe, metrica } = req.params;

    if (!/^\d+$/.test(idEmpresa) || Number(idEmpresa) < 1) {
        return res.status(400).json({ erro: 'ID de empresa inválido.' });
    }

    if (!/^\d+$/.test(idMainframe) || Number(idMainframe) < 1) {
        return res.status(400).json({ erro: 'ID de mainframe inválido.' });
    }

    if (!['cpu', 'ram', 'disco'].includes(metrica)) {
        return res.status(400).json({ erro: 'Métrica inválida.' });
    }

    res.set('Cache-Control', 'no-store');
    if (!process.env.NOME_BUCKET) {
        return res.status(503).json({ erro: 'Configure NOME_BUCKET no servidor para acessar o Gold.' });
    }

    try {
        const mainframes = await mainframeModel.listaPorIdMainframeId(
            Number(idEmpresa),
            Number(idMainframe)
        );

        if (mainframes.length === 0) {
            return res.status(404).json({ erro: 'Mainframe não encontrado para esta empresa.' });
        }

        const empresa = await goldModel.buscarEmpresa(idEmpresa);
        if (!empresa) return res.status(404).json({ erro: 'Empresa não encontrada.' });

        const prefixoEmpresa = goldService.prefixoEmpresa(empresa.razao_social);
        const caminho = `${mainframes[0].hostname}/processos/latest.json`;

        try {
            const dados = await goldService.lerJson(prefixoEmpresa, caminho);
            return res.json(processoService.paraDashboard(dados, metrica));
        } catch (erro) {
            if (goldService.arquivoAusente(erro)) return res.json(processoService.semCapturas());
            console.error('Erro ao carregar processos do Gold:', erro.name, erro.message);
            return res.status(502).json({ erro: 'Não foi possível carregar os processos do Gold.' });
        }
    } catch (erro) {
        console.error('Erro ao buscar processos:', erro);
        return res.status(500).json({ erro: 'Erro ao buscar processos.' });
    }
}

export default { buscarUltimosProcessos };
