import pool from "../database/config.js";

async function listar(idEmpresa) {
    const [rows] = await pool.execute(
        `SELECT
            c.id_cargo,
            c.nome AS nome_cargo,
            cp.id_permissao,
            p.nome AS nome_permissao
        FROM cargo c
        LEFT JOIN cargo_permissao cp
            ON cp.id_cargo = c.id_cargo
        LEFT JOIN permissao p
            ON p.id_permissao = cp.id_permissao
        WHERE c.fk_empresa = ?
        OR c.fk_empresa IS NULL
        ORDER BY c.id_cargo, cp.id_permissao;`,
        [idEmpresa]
    );

    return rows;
}

async function deletar(idCargo){
    const conexao = await pool.getConnection();

    try {
        await conexao.beginTransaction();

        if (idCargo == 1 || idCargo == 2) {
            throw new Error('O cargo padrão não pode ser excluído.');
        }

        await conexao.execute(`
            UPDATE usuario SET fk_cargo = 1 WHERE fk_cargo = ?`,
            [idCargo]
        )

        await conexao.execute(
            `DELETE FROM cargo_permissao WHERE id_cargo = ?`,
            [idCargo]
        );

        await conexao.execute(
            `DELETE FROM cargo WHERE id_cargo = ?`,
            [idCargo]
        );

        await conexao.commit();
    } catch (error) {
        await conexao.rollback();
        throw error;
    } finally {
        await conexao.release();
    }
    
}

async function criar(nome_cargo, permissao, idEmpresa) {
    const conexao = await pool.getConnection();
    console.log(nome_cargo)
    console.log(idEmpresa)
    console.log(permissao)

    try {
        await conexao.beginTransaction();

        if (nome_cargo == 'Estagiário' || nome_cargo == 'Administrador') {
            throw new Error('Cargos já cadastrado por padrão!');
        }

        const [resultado] = await conexao.execute(`
                INSERT INTO cargo (nome, fk_empresa) VALUES (?, ?);
            `,
        [nome_cargo, idEmpresa]);

        const idCargo = resultado.insertId;

        for (let i = 0; i < permissao.length; i++) {
            await conexao.execute(`
                    INSERT INTO cargo_permissao (id_cargo, id_permissao) VALUES (?, ?);
                `,
            [idCargo, permissao[i]]);   
        }

        await conexao.commit();

        return idCargo;
    } catch (error) {
        console.log(error)
        await conexao.rollback();
        throw error;
    } finally {
        conexao.release();
    }
}

async function atualizar(idCargo, nome_cargo, permissoes) {
        const conexao = await pool.getConnection();
        console.log("Nome", nome_cargo)
        console.log("ID", idCargo)

        try {
            await conexao.beginTransaction();

            await conexao.execute(`
                UPDATE cargo
                SET nome = ?
                WHERE id_cargo = ?`,
                [nome_cargo, idCargo]);

            await conexao.execute(`
                    DELETE FROM cargo_permissao
                    WHERE id_cargo = ?
                `, [idCargo]) 

            for (let i = 0; i < permissoes.length; i++) {
                await conexao.execute(
                    `INSERT INTO cargo_permissao
                    (id_cargo, id_permissao)
                    VALUES (?, ?)`,
                    [idCargo, permissoes[i]]
                );
            }

            await conexao.commit();

        } catch (error) {
            console.log(error)
            await conexao.rollback();
        } finally{
            await conexao.release();
        }
    }
export default { listar, deletar, criar, atualizar};