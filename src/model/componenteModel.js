import pool from '../database/config.js';

async function listar() {
  const [rows] = await pool.query('SELECT * FROM componente ORDER BY tipo, fabricante');
  return rows;
}

async function buscarPorId(id) {
  const [rows] = await pool.execute(
    'SELECT * FROM componente WHERE id_componente = ?',
    [id]
  );
  return rows[0] || null;
}

async function criar({ tipo, fabricante, modelo, num_serie, capacidade }) {
  const [result] = await pool.execute(
    'INSERT INTO componente (tipo, fabricante, modelo, num_serie, capacidade) VALUES (?, ?, ?, ?, ?)',
    [tipo, fabricante, modelo, num_serie, capacidade]
  );
  return result.insertId;
}

async function atualizar(id, { tipo, fabricante, modelo, num_serie, capacidade }) {
  const [result] = await pool.execute(
    'UPDATE componente SET tipo = ?, fabricante = ?, modelo = ?, num_serie = ?, capacidade = ? WHERE id_componente = ?',
    [tipo, fabricante, modelo, num_serie, capacidade, id]
  );
  return result.affectedRows;
}

async function remover(id) {
  const [result] = await pool.execute(
    'DELETE FROM componente WHERE id_componente = ?',
    [id]
  );
  return result.affectedRows;
}

export default { listar, buscarPorId, criar, atualizar, remover };