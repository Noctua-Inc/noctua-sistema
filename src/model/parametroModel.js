import pool from '../database/config.js';

async function listar(fk_mainframe) {
  const sql = fk_mainframe
    ? 'SELECT * FROM parametro WHERE fk_mainframe = ?'
    : 'SELECT * FROM parametro';
  const params = fk_mainframe ? [fk_mainframe] : [];

  const [rows] = await pool.execute(sql, params);
  return rows;
}

async function buscarPorId(id) {
  const [rows] = await pool.execute(
    'SELECT * FROM parametro WHERE id_parametro = ?',
    [id]
  );
  return rows[0] || null;
}

async function criar({ fk_mainframe, fk_componente, pico_max, pico_min, percentual }) {
  const [result] = await pool.execute(
    'INSERT INTO parametro (fk_mainframe, fk_componente, pico_max, pico_min, percentual) VALUES (?, ?, ?, ?, ?)',
    [fk_mainframe, fk_componente, pico_max ?? null, pico_min ?? null, percentual ?? null]
  );
  return result.insertId;
}

async function atualizar(id, { fk_mainframe, fk_componente, pico_max, pico_min, percentual }) {
  const [result] = await pool.execute(
    'UPDATE parametro SET fk_mainframe = ?, fk_componente = ?, pico_max = ?, pico_min = ?, percentual = ? WHERE id_parametro = ?',
    [fk_mainframe, fk_componente, pico_max ?? null, pico_min ?? null, percentual ?? null, id]
  );
  return result.affectedRows;
}

async function remover(id) {
  const [result] = await pool.execute(
    'DELETE FROM parametro WHERE id_parametro = ?',
    [id]
  );
  return result.affectedRows;
}

async function listarComComponentePorMainframe(fk_mainframe) {
  const [rows] = await pool.execute(`
    SELECT p.id_parametro, p.fk_mainframe, p.fk_componente, p.pico_max, p.pico_min, p.percentual,
           c.tipo, c.fabricante, c.modelo, c.num_serie, c.capacidade
    FROM parametro p
    JOIN componente c ON c.id_componente = p.fk_componente
    WHERE p.fk_mainframe = ?
  `, [fk_mainframe]);
  return rows;
}

async function removerPorMainframeComConexao(conn, fk_mainframe) {
  await conn.execute('DELETE FROM parametro WHERE fk_mainframe = ?', [fk_mainframe]);
}

async function criarComConexao(conn, { fk_mainframe, fk_componente, pico_max, pico_min, percentual }) {
  await conn.execute(
    'INSERT INTO parametro (fk_mainframe, fk_componente, pico_max, pico_min, percentual) VALUES (?, ?, ?, ?, ?)',
    [fk_mainframe, fk_componente, pico_max ?? null, pico_min ?? null, percentual ?? null]
  );
}

export default {
  listar,
  buscarPorId,
  criar,
  atualizar,
  remover,
  listarComComponentePorMainframe,
  removerPorMainframeComConexao,
  criarComConexao,
};