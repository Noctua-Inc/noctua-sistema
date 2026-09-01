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


    static async buscarMainframe(hostname, idEmpresa) {

        const [resultado] = await pool.query(
            `
            SELECT 
            m.id_mainframe,
            m.hostname,
            m.sis_operacional,
            u.fk_empresa
        FROM mainframe m
        INNER JOIN usuario u ON m.fk_usuario = u.id_usuario
        WHERE m.hostname = ? 
          AND u.fk_empresa = ?
        `,
        [hostname, idEmpresa]
        );

        return resultado[0];
    }


    static async buscarComponentes(idMainframe) {

        const [resultado] = await pool.query(
        `
        SELECT 
            c.id_componente, 
            c.tipo, 
            c.modelo,
            p.percentual,
            p.pico_min,
            p.pico_max
        FROM parametro p
        INNER JOIN componente c ON c.id_componente = p.fk_componente
        WHERE p.fk_mainframe = ?
        `,
        [idMainframe]
    );

        return resultado;
    }
}

export default AuthModel ;