import authModel from '../model/authModel.js';

class AuthController {

    static async autenticar(req, res) {

        try {

            const { email, senha, hostname } = req.body;

            if (!email || !senha || !hostname) {

                return res.status(400).json({
                    mensagem: 'Email, senha e hostname são obrigatórios'
                });
            }


            const usuario = await authModel.buscarUsuario(email);

            if (!usuario) {

                return res.status(401).json({
                    mensagem: 'Usuário não encontrado'
                });
            }

            if (senha !== usuario.senha) {

                return res.status(401).json({
                    mensagem: 'Senha inválida'
                });
            }


            const mainframe = await authModel.buscarMainframe(
                hostname,
                usuario.id_empresa
            );

            if (!mainframe) {

                return res.status(401).json({
                    mensagem: 'Mainframe não encontrado ou não pertence à empresa do usuário'
                });
            }


            const componentes = await authModel.buscarComponentes(
                mainframe.id_mainframe
            );


            if (componentes.length === 0) {

                return res.status(404).json({
                    mensagem: 'Mainframe autenticado, mas não possui componentes cadastrados'
                });
            }


            return res.status(200).json({
                autenticado: true,
                mainframe: {
                    hostname: mainframe.hostname
                },
                componentes: componentes
            });

        } catch (erro) {

            console.error('Erro na autenticação:', erro);

            return res.status(500).json({
                mensagem: 'Erro interno do servidor'
            });
        }
    }
}

export default AuthController;;