import verificacaoModel from '../model/verificacaoModel.js';
import userModel from '../model/userModel.js';


async function verificarEmail(req, res) {
    try {
        const { token } = req.query;

        if (!token) {
            return res.status(400).json({
                mensagem: 'Token não informado'
            });
        }

        const verificacao =
            await verificacaoModel.buscarPorToken(token);

        if (!verificacao) {
            return res.status(400).json({
                mensagem: 'Token inválido'
            });
        }

        if (new Date() > new Date(verificacao.dt_expiracao)) {

            await verificacaoModel.excluirToken(token);

            return res.status(400).json({
                mensagem: 'Token expirado'
            });
        }

        await verificacaoModel.excluirToken(token);

        await userModel.verificarEmail(
            verificacao.fk_usuario
        );

        return res.status(200).json({
            mensagem: 'email verificado com sucesso'
        });

    } catch (erro) {

        console.error(erro);

        return res.status(500).json({
            mensagem: 'Erro ao verificar email'
        });
    }
}

export default {
    verificarEmail
};