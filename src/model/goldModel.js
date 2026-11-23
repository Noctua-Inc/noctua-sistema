import pool from '../database/config.js';

async function buscarEmpresa(idEmpresa) {
    const [empresas] = await pool.execute(
        'SELECT razao_social FROM empresa WHERE id_empresa = ?',
        [idEmpresa]
    );
    return empresas[0];
}

export default {buscarEmpresa};
