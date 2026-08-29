import pool from '../database/config.js';

async function criarToken(token, dt_expiracao, fk_usuario) {
    const [resultado] = await pool.query(
        `INSERT INTO verificacao_email
        (token, dt_expiracao, fk_usuario)
        VALUES (?, ?, ?)`,
        [
            token,
            dt_expiracao,
            fk_usuario
        ]
    );

    return resultado;
}

async function buscarPorToken(token) {
    const [resultado] = await pool.query(
        `SELECT
            id_verificacao,
            token,
            dt_expiracao,
            fk_usuario
         FROM verificacao_email
         WHERE token = ?`,
        [token]
    );

    return resultado[0];
}

async function excluirToken(token) {
    await pool.query(
        `DELETE FROM verificacao_email
         WHERE token = ?`,
        [token]
    );
}

export default {
    criarToken,
    buscarPorToken,
    excluirToken
};