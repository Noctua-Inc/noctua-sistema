import pool from '../database/config.js';

class AuthModel {

    static async buscarUsuario(email) {

        const [resultado] = await pool.query(
        `
        SELECT
            id_usuario,
            fk_empresa AS id_empresa, 
            nome,
            email_institucional,
            senha
        FROM usuario
        WHERE email_institucional = ?
        `,
        [email]
    );
    return resultado[0];

    }


    static async buscarMainframe(idEmpresa) {

        const [resultado] = await pool.query(
            `
            SELECT 
                id_mainframe,
                hostname,
                sis_operacional,
                fk_empresa AS id_empresa
            FROM mainframe
            WHERE fk_empresa = ?
        `,
        [idEmpresa]
        );

        return resultado;
    }


    static async buscarComponentes(idMainframe) {

        const [resultado] = await pool.query(
        `
        SELECT 
            c.id_componente, 
            c.tipo,
            c.capacidade,
            f.nome_fabricante,
            p.percentual,
            p.pico_min,
            p.pico_max
        FROM parametro p
        INNER JOIN componente c 
            ON c.id_componente = p.id_componente
        INNER JOIN fabricante f
            ON f.id_fabricante = c.fk_fabricante
        WHERE p.id_mainframe = ?;
        `,
        [idMainframe]
    );

        return resultado;
    }
}

export default AuthModel ;