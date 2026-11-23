import pool from '../database/config.js';

async function buscarDominio(dominio) {
    const [resultado] = await pool.query(
        'SELECT id_empresa FROM empresa WHERE dominio = ?',
        [dominio]
    );

    return resultado[0];
}

// A razão social é usada como prefixo das pastas no S3 (ex.: "sao_paulo_tech_school").
async function buscarRazaoSocialPorId(idEmpresa) {
    const [resultado] = await pool.query(
        'SELECT razao_social FROM empresa WHERE id_empresa = ?',
        [idEmpresa]
    );

    return resultado[0]?.razao_social || null;
}

export default {
    buscarDominio,
    buscarRazaoSocialPorId
};