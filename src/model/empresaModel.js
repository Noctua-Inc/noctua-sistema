import pool from '../database/config.js';

async function buscarDominio(dominio) {
    const [resultado] = await pool.query(
        'SELECT id_empresa FROM empresa WHERE dominio = ?',
        [dominio]
    );

    return resultado[0];
}

export default {
    buscarDominio
};