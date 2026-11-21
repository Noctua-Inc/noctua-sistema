import mainframeModel from '../model/mainframeModel.js';

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

    try {
        const mainframes = await mainframeModel.listaPorIdMainframeId(
            Number(idEmpresa),
            Number(idMainframe)
        );

        if (mainframes.length === 0) {
            return res.status(404).json({ erro: 'Mainframe não encontrado para esta empresa.' });
        }

        return res.status(503).json({
            erro: 'A integração com os dados do S3 ainda não foi configurada.'
        });
    } catch (erro) {
        console.error('Erro ao buscar processos:', erro);
        return res.status(500).json({ erro: 'Erro ao buscar processos.' });
    }
}

export default { buscarUltimosProcessos };
