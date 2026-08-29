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

        const vetor_verificacao = [nome, email_institucional, cpf, senha, confirmacao_senha];

        for (let i = 0; i < vetor_verificacao.length; i++) {
            if (!vetor_verificacao[i]) {
                return res.status(400).json({
                    mensagem: 'Preencha todos os campos corretamente!'
                });
            }
        }

        let regex_email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!regex_email.test(email_institucional)) {
            return res.status(400).json({
                mensagem: 'Digite um email válido!'
            })
        }

        const dominio = email_institucional.split('@')[1];
        const empresa = await empresaModel.buscarDominio(dominio);

        if (!empresa) {
            return res.status(404).json({
                mensagem: 'Domínio da empresa não encontrado'
            });
        }

        let cpf_regex = /^\d{11}$/;

        if (!cpf_regex.test(cpf)) {
            return res.status(400).json({
                mensagem: 'O CPF deve obrigatoriamente ter 11 dígitos!'
            })
        }

        let senha_regex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;

        if (!senha_regex.test(senha)) {
            return res.status(400).json({
                mensagem: 'Digite uma senha com ao menos 8 caracteres, uma letra maiúscula, um número e um caractere especial!'
            })
        }

        if (senha !== confirmacao_senha) {
            return res.status(400).json({
                mensagem: 'Confirmação de senha inválida!'
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
            mensagem: 'Usuário cadastrado com sucesso'
        });

    } catch (erro) {

        console.error(erro);

        res.status(500).json({
            mensagem: 'Erro ao cadastrar usuário'
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
                mensagem: 'email ou senha inválidos'
            });
        }

        const senhaValida = await bcrypt.compare(
            senha,
            usuario.senha
        );

        if (!senhaValida) {
            return res.status(401).json({
                mensagem: 'email ou senha inválidos'
            });
        }

        console.log('email:', usuario.email_institucional);
        console.log('verificado:', usuario.verificado);

        if (!usuario.verificado) {
            return res.status(403).json({
                mensagem: 'email ainda não verificado'
            });
        }

        return res.status(200).json({
            mensagem: 'Login realizado com sucesso'
        });

    } catch (erro) {

        console.error(erro);

        res.status(500).json({
            mensagem: 'Erro ao tentar login'
        });
    }
}

export default {
    cadastrar, buscarPorId, login
};
