import pool from '../database/config.js';

async function cadastrar(
    nome,
    email_institucional,
    cpf,
    senha,
    fk_empresa
) {

    const [resultado] = await pool.query(
        `INSERT INTO usuario
        (nome, email_institucional, cpf, senha, fk_empresa)
        VALUES (?, ?, ?, ?, ?)`,
        [
            nome,
            email_institucional,
            cpf,
            senha,
            fk_empresa
        ]
    );

    return resultado;
}

async function buscarPorId(id) {
    const [resultado] = await pool.query(
        `SELECT
            id_usuario,
            nome,
            email_institucional,
            cpf,
            verificado,
            fk_empresa
         FROM usuario
         WHERE id_usuario = ?`,
        [id]
    );

    return resultado[0];
}

async function buscarPorEmail(email_institucional) {
    const [resultado] = await pool.query(
        `SELECT
            email_institucional,
            senha,
            verificado
         FROM usuario
         WHERE email_institucional = ?`,
        [email_institucional]
    );

    return resultado[0];
}

async function verificarEmail(id_usuario) {
    await pool.query(
        `UPDATE usuario
         SET verificado = 1
         WHERE id_usuario = ?`,
        [id_usuario]
    );
}

export default{
    cadastrar, buscarPorId, buscarPorEmail, verificarEmail
};