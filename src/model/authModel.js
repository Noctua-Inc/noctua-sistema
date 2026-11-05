import pool from '../database/config.js';

class AuthModel {
    static async buscarUsuario(email) {
        const [usuarios] = await pool.execute(
            'SELECT id_usuario, fk_empresa AS id_empresa, senha FROM usuario WHERE email_institucional = ?',
            [email]
        );
        return usuarios[0];
    }

    static async buscarMainframe(idEmpresa, hostname) {
        const [mainframes] = await pool.execute(`
            SELECT m.id_mainframe, m.hostname, m.status, e.razao_social
            FROM mainframe m
            JOIN empresa e ON e.id_empresa = m.fk_empresa
            WHERE m.fk_empresa = ? AND m.hostname = ?
        `, [idEmpresa, hostname]);
        return mainframes[0];
    }
}

export default AuthModel;