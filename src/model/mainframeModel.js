import pool from '../database/config.js';
import parametroModel from './parametroModel.js';

async function listar(idEmpresa) {
  const [rows] = await pool.query(`
    SELECT
        m.*,
        l.nome AS localizacao_nome,
        l.estado,
        l.cidade,
        l.cep,
        comp.componentes,
        param.parametros
    FROM mainframe m
    LEFT JOIN localizacao l
        ON l.id_localizacao = m.fk_localizacao
    LEFT JOIN (
        SELECT 
            p.id_mainframe,
            GROUP_CONCAT(
                DISTINCT c.tipo
                ORDER BY c.tipo
                SEPARATOR ', '
            ) AS componentes
        FROM parametro p
        INNER JOIN componente c ON c.id_componente = p.id_componente
        GROUP BY p.id_mainframe
    ) comp ON comp.id_mainframe = m.id_mainframe

    LEFT JOIN (
        SELECT 
            id_mainframe,
            GROUP_CONCAT(
                pico_max
                SEPARATOR ', '
            ) AS parametros
        FROM parametro
        GROUP BY id_mainframe
    ) param ON param.id_mainframe = m.id_mainframe

    WHERE m.fk_empresa = ?
    ORDER BY m.hostname;	
  `, [idEmpresa]);
  return rows;
}

async function listaPorIdMainframeId(idEmpresa, idMainFrame) {
  const [rows] = await pool.execute(
    `
    SELECT
        m.hostname,
        comp.componentes,
        param.parametros
    FROM mainframe m
    LEFT JOIN localizacao l
        ON l.id_localizacao = m.fk_localizacao
    LEFT JOIN (
        SELECT 
            p.id_mainframe,
            GROUP_CONCAT(
                DISTINCT c.tipo
                ORDER BY c.tipo
                SEPARATOR ', '
            ) AS componentes
        FROM parametro p
        INNER JOIN componente c ON c.id_componente = p.id_componente
        GROUP BY p.id_mainframe
    ) comp ON comp.id_mainframe = m.id_mainframe

    LEFT JOIN (
        SELECT 
            id_mainframe,
            GROUP_CONCAT(
                pico_max
                SEPARATOR ', '
            ) AS parametros
        FROM parametro
        GROUP BY id_mainframe
    ) param ON param.id_mainframe = m.id_mainframe

    WHERE m.fk_empresa = ? AND m.id_mainframe = ?
    ORDER BY m.hostname;	
    `,
    [idEmpresa, idMainFrame]
  );

  return rows;
}

async function buscarPorId(id) {
  const [rows] = await pool.execute(
    'SELECT * FROM mainframe WHERE id_mainframe = ?',
    [id]
  );
  return rows[0] || null;
}

async function criar(dados) {
  const {
    hostname, fabricante, modelo, numero_serie, status,
    sis_operacional, versao_so, fk_empresa, fk_localizacao,
    parametros = [],
  } = dados;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [result] = await conn.execute(
      `INSERT INTO mainframe
        (hostname, fabricante, modelo, numero_serie, status, sis_operacional, versao_so, fk_empresa, fk_localizacao)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [hostname, fabricante, modelo, numero_serie, status, sis_operacional, versao_so, fk_empresa, fk_localizacao]
    );

    const id_mainframe = result.insertId;

    for (const p of parametros) {
      await parametroModel.criarComConexao(conn, { ...p, id_mainframe: id_mainframe });
    }

    await conn.commit();
    return id_mainframe;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

async function atualizar(id, dados) {
  const {
    hostname, fabricante, modelo, numero_serie, status,
    sis_operacional, versao_so, fk_empresa, fk_localizacao,
    parametros,
  } = dados;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [result] = await conn.execute(
      `UPDATE mainframe SET
        hostname = ?, fabricante = ?, modelo = ?, numero_serie = ?, status = ?,
        sis_operacional = ?, versao_so = ?, fk_empresa = ?, fk_localizacao = ?
       WHERE id_mainframe = ?`,
      [hostname, fabricante, modelo, numero_serie, status, sis_operacional, versao_so, fk_empresa, fk_localizacao, id]
    );

    if (result.affectedRows === 0) {
      await conn.rollback();
      return 0;
    }

    // Só altera os componentes quando a tela envia essa lista.
    if (parametros) {
      await parametroModel.removerPorMainframeComConexao(conn, id);
      for (const p of parametros) {
        await parametroModel.criarComConexao(conn, { ...p, id_mainframe: id });
      }
    }

    await conn.commit();
    return result.affectedRows;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

async function remover(id) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    await parametroModel.removerPorMainframeComConexao(conn, id);
    const [result] = await conn.execute('DELETE FROM mainframe WHERE id_mainframe = ?', [id]);

    if (result.affectedRows === 0) {
      await conn.rollback();
      return 0;
    }

    await conn.commit();
    return result.affectedRows;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export default { listar, listaPorIdMainframeId, buscarPorId, criar, atualizar, remover };