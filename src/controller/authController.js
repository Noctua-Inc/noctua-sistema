import authModel from '../model/authModel.js';
import bcrypt from 'bcrypt';

class AuthController {
    static async autenticar(req, res) {
        try {
            const {email, senha, hostname} = req.body;
            if (!email || !senha || !hostname) {
                return res.status(400).json({mensagem: 'Informe email, senha e o hostname da máquina.'});
            }

            const usuario = await authModel.buscarUsuario(email);
            if (!usuario || !await bcrypt.compare(senha, usuario.senha)) {
                return res.status(401).json({mensagem: 'Email ou senha inválidos.'});
            }

            const mainframe = await authModel.buscarMainframe(usuario.id_empresa, hostname.trim());
            if (!mainframe) {
                return res.status(404).json({mensagem: 'Não foi encontrada nenhuma mainframe com o hostname "' + hostname + '" na sua empresa. Cadastre essa mainframe no sistema antes.'});
            }
            if (mainframe.status === 'inativo') {
                return res.status(403).json({mensagem: 'A mainframe está inativa. Ative o cadastro no sistema antes de iniciar a captura.'});
            }

            return res.json({
                autenticado: true,
                empresa: {id_empresa: usuario.id_empresa, razao_social: mainframe.razao_social},
                mainframe: {id_mainframe: mainframe.id_mainframe, hostname: mainframe.hostname, status: mainframe.status}
            });
        } catch (erro) {
            console.error('Erro na autenticação:', erro.code || erro.name);
            return res.status(500).json({mensagem: 'Erro interno do servidor.'});
        }
    }
}

export default AuthController;