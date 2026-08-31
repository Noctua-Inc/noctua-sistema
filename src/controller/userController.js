import dotenv from 'dotenv'; dotenv.config();
import bcrypt from 'bcrypt';
import userModel from '../model/userModel.js';
import empresaModel from '../model/empresaModel.js';
import crypto from 'crypto';
import verificacaoModel from '../model/verificacaoModel.js';
import emailService from '../service/emailService.js';

async function cadastrar(req, res) {
    try {
        const {
            nome,
            email_institucional,
            cpf,
            senha,
            confirmacao_senha
        } = req.body;

        let regex_email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!regex_email.test(email_institucional)) {
            return res.status(400).json({
                icon: '../../assets/erro.svg',
                mensagem: 'Digite um email válido!',
                descricao: 'O e-mail digitado não está no formato correto. Certifique-se de incluir o "@" e um domínio válido'
            })
        }

        const dominio = email_institucional.split('@')[1];
        const empresa = await empresaModel.buscarDominio(dominio);

        if (!empresa) {
            return res.status(404).json({
                icon: '../../assets/erro.svg',
                mensagem: 'Domínio de empresa não encontrado!',
                descricao: 'Empresa e email corporativo indefinidos'
            });
        }

        let cpf_regex = /^\d{11}$/;

        if (!cpf_regex.test(cpf)) {
            return res.status(400).json({
                icon: '../../assets/erro.svg',
                mensagem: 'Digite um CPF válido!',
                descricao: 'O CPF deve ter obrigatoriamente 11 dígitos!'
            })
        }

        let senha_regex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;

        if (!senha_regex.test(senha)) {
            return res.status(400).json({
                icon: '../../assets/erro.svg',
                mensagem: 'Digite uma senha válida!',
                descricao: 'A senha deve conter ao menos 8 caracteres, uma letra maiúscula, um número e um caractere especial!'
            })
        }

        if (senha !== confirmacao_senha) {
            return res.status(400).json({
                icon: '../../assets/erro.svg',
                mensagem: 'Confirmação de senha inválida!',
                descricao: 'As senhas digitadas não estão correspondendo'
            })
        }

        const senhaHash = await bcrypt.hash(senha, 10);

        const resultado = await userModel.cadastrar(
            nome,
            email_institucional,
            cpf,
            senhaHash,
            empresa.id_empresa
        );

        const token = crypto.randomBytes(32).toString('hex');

        const dt_expiracao = new Date(
            Date.now() + 15 * 60 * 1000
        );

        await verificacaoModel.criarToken(
            token,
            dt_expiracao,
            resultado.insertId
        );

        await emailService.enviarEmail(
            email_institucional,
            token
        );

        res.status(201).json({
            icon: '../../assets/sucesso.svg',
            mensagem: 'Usuário cadastrado com sucesso!',
            descricao: ''
        });

    } catch (erro) {

        console.error(erro);

        res.status(500).json({
            icon: '../../assets/erro.svg',
            mensagem: 'Erro ao cadastrar usuário!',
            descricao: ''
        });
    }
}

async function buscarPorId(req, res) {
    try {
        const id = req.params.id;

        const usuario = await userModel.buscarPorId(id);

        if (!usuario) {
            return res.status(404).json({
                mensagem: 'Usuário não encontrado'
            });
        }

        res.status(200).json(usuario);

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            mensagem: 'Erro ao buscar usuário'
        });
    }
}

async function login(req, res) {
    try {
        const {
            email_institucional,
            senha
        } = req.body;

        const usuario = await userModel.buscarPorEmail(email_institucional);

        if (!usuario) {
            return res.status(401).json({
                icon: '../../assets/erro.svg',
                mensagem: 'Email ou senha inválidas!',
                descricao: ''
            });
        }

        const senhaValida = await bcrypt.compare(
            senha,
            usuario.senha
        );

        if (!senhaValida) {
            return res.status(401).json({
                icon: '../../assets/erro.svg',
                mensagem: 'Email ou senha inválidas!',
                descricao: ''
            });
        }

        if (!usuario.verificado) {
            return res.status(403).json({
                icon: '../../assets/erro.svg',
                mensagem: 'Email ainda não verificado!',
                descricao: 'Atenção! É necessário verificar seu email para ter acesso aos nossos recursos. Verifique sua caixa de email!'
            });
        }

        return res.status(200).json({
            icon: '../../assets/sucesso.svg',
            mensagem: 'Login realizado com sucesso!',
            descricao: 'Redirecionando para a dashboard...'
        });

    } catch (erro) {

        console.error(erro);

        res.status(500).json({
            icon: '../../assets/erro.svg',
            mensagem: 'Erro ao tentar login!',
            descricao: ''
        });
    }
}

export default {
    cadastrar, buscarPorId, login
};
