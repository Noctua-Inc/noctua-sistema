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
                status,
                sis_operacional,
                fk_empresa AS id_empresa
            FROM mainframe
            WHERE fk_empresa = ?
        `,
        [idEmpresa]
        );

        return resultado;
    }

    static async buscarNomeEmpresa(idUsuario) {
        
        const [resultado] = await pool.query(
            `
            SELECT 
                e.razao_social 
            FROM empresa AS e 
            JOIN usuario AS u 
                ON u.fk_empresa = e.id_empresa 
            WHERE id_usuario = ?
            `,
            [idUsuario]
        );
        return resultado[0];
        
    }


    static async buscarComponentes(idMainframe) {

        const [resultado] = await pool.query(
        `
        SELECT
            c.id_componente,
            c.tipo,
            p.cpu_pct_min, p.cpu_pct_max, p.freq_min, p.freq_max,
            p.ram_pct_min, p.ram_pct_max, p.gb_min, p.gb_max,
            p.swap_pct_min, p.swap_pct_max,
            p.disco_pct_min, p.disco_pct_max, p.pb_min, p.pb_max, p.req_min, p.req_max,
            p.tb_min, p.tb_max, p.pkt_min, p.pkt_max, p.tw_min, p.tw_max
        FROM parametro p
        INNER JOIN componente c
            ON c.id_componente = p.id_componente
        WHERE p.id_mainframe = ?
        ORDER BY p.id_componente;
        `,
        [idMainframe]
    );

        return resultado;
    }
}

export default AuthModel ;
