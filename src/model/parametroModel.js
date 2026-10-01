import pool from '../database/config.js';

async function listar(id_mainframe) {
  const sql = id_mainframe
    ? 'SELECT * FROM parametro WHERE id_mainframe = ?'
    : 'SELECT * FROM parametro';
  const params = id_mainframe ? [id_mainframe] : [];

  const [rows] = await pool.execute(sql, params);
  return rows;
}

async function buscarPorId(id_mainframe, id_componente) {
  const [rows] = await pool.execute(
    'SELECT * FROM parametro WHERE id_mainframe = ? AND id_componente = ?',
    [id_mainframe, id_componente]
  );
  return rows[0] || null;
}

async function criar({ id_mainframe, id_componente, pico_max, pico_min, percentual }) {
  const [result] = await pool.execute(
    'INSERT INTO parametro (id_mainframe, id_componente, pico_max, pico_min, percentual) VALUES (?, ?, ?, ?, ?)',
    [id_mainframe, id_componente, pico_max ?? null, pico_min ?? null, percentual ?? null]
  );
  return result.affectedRows;
}

async function atualizar({ id_mainframe, id_componente, pico_max, pico_min, percentual }) {
  const [result] = await pool.execute(
    'UPDATE parametro SET pico_max = ?, pico_min = ?, percentual = ? WHERE id_mainframe = ? AND id_componente = ?',
    [pico_max ?? null, pico_min ?? null, percentual ?? null, id_mainframe, id_componente]
  );
  return result.affectedRows;
}

async function remover(id) {
  const [result] = await pool.execute(
    'DELETE FROM parametro WHERE id_mainframe = ?',
    [id]
  );
  return result.affectedRows;
}

async function listarComComponentePorMainframe(id_mainframe) {
  const [rows] = await pool.execute(`
    SELECT p.id_mainframe, p.id_componente, p.pico_max, p.pico_min, p.percentual,
           c.tipo, c.capacidade
    FROM parametro p
    JOIN componente c ON c.id_componente = p.id_componente
    WHERE p.id_mainframe = ?
  `, [id_mainframe]);
  return rows;
}

async function removerPorMainframeComConexao(conn, id_mainframe) {
  await conn.execute('DELETE FROM parametro WHERE id_mainframe = ?', [id_mainframe]);
}

async function criarComConexao(conn, { id_mainframe, id_componente, pico_max, pico_min, percentual }) {
  await conn.execute(
    'INSERT INTO parametro (id_mainframe, id_componente, pico_max, pico_min, percentual) VALUES (?, ?, ?, ?, ?)',
    [id_mainframe, id_componente, pico_max ?? null, pico_min ?? null, percentual ?? null]
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