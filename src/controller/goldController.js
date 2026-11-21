import goldModel from '../model/goldModel.js';
import goldService from '../service/goldService.js';

async function carregar(req, res, lerDados) {
    res.set('Cache-Control', 'no-store');

    if (!process.env.NOME_BUCKET) {
        return res.status(503).json({erro: 'Configure NOME_BUCKET no servidor para acessar o Gold.'});
    }

    try {
        const empresa = await goldModel.buscarEmpresa(req.params.idEmpresa);

        if (!empresa) {
            return res.status(404).json({erro: 'Empresa não encontrada.'});
        }

        const dados = await lerDados(goldService.prefixoEmpresa(empresa.razao_social));

        if (dados === null) {
            return res.status(404).json({erro: 'Arquivo ainda não disponível no Gold.'});
        }

        return res.json(dados);
    } catch (erro) {
        if (goldService.arquivoAusente(erro)) {
            return res.status(404).json({erro: 'Arquivo ainda não disponível no Gold.'});
        }
        console.error('Erro ao carregar JSON do Gold:', erro.name, erro.code);
        return res.status(502).json({erro: 'Não foi possível carregar os dados do Gold. Confira a conexão, as credenciais e as permissões do servidor.'});
    }
}

export default {carregar};
