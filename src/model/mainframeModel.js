import pool from '../database/config.js';
import parametroModel from './parametroModel.js';

async function listar() {
  const [rows] = await pool.query(`
    SELECT
      m.*,
      l.nome AS localizacao_nome, l.pais, l.estado, l.cidade, l.cod_regiao,
      GROUP_CONCAT(DISTINCT c.tipo ORDER BY c.tipo SEPARATOR ', ') AS componentes
    FROM mainframe m
    LEFT JOIN localizacao l ON l.id_localizacao = m.fk_localizacao
    LEFT JOIN parametro p ON p.fk_mainframe = m.id_mainframe
    LEFT JOIN componente c ON c.id_componente = p.fk_componente
    GROUP BY m.id_mainframe
    ORDER BY m.hostname
  `);
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
    sis_operacional, versao_so, fk_usuario, fk_localizacao,
    parametros = [],
  } = dados;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [result] = await conn.execute(
      `INSERT INTO mainframe
        (hostname, fabricante, modelo, numero_serie, status, sis_operacional, versao_so, fk_usuario, fk_localizacao)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [hostname, fabricante, modelo, numero_serie, status, sis_operacional, versao_so, fk_usuario, fk_localizacao]
    );

    const id_mainframe = result.insertId;

    for (const p of parametros) {
      await parametroModel.criarComConexao(conn, { ...p, fk_mainframe: id_mainframe });
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
    sis_operacional, versao_so, fk_usuario, fk_localizacao,
    parametros = [],
  } = dados;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [result] = await conn.execute(
      `UPDATE mainframe SET
        hostname = ?, fabricante = ?, modelo = ?, numero_serie = ?, status = ?,
        sis_operacional = ?, versao_so = ?, fk_usuario = ?, fk_localizacao = ?
       WHERE id_mainframe = ?`,
      [hostname, fabricante, modelo, numero_serie, status, sis_operacional, versao_so, fk_usuario, fk_localizacao, id]
    );

    if (result.affectedRows === 0) {
      await conn.rollback();
      return 0;
    }

    await parametroModel.removerPorMainframeComConexao(conn, id);

    for (const p of parametros) {
      await parametroModel.criarComConexao(conn, { ...p, fk_mainframe: id });
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

export default { listar, buscarPorId, criar, atualizar, remover };