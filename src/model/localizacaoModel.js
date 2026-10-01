import pool from '../database/config.js';

async function listar() {
  const [rows] = await pool.query('SELECT * FROM localizacao ORDER BY nome');
  return rows;
}

async function buscarPorId(id) {
  const [rows] = await pool.execute(
    'SELECT * FROM localizacao WHERE id_localizacao = ?',
    [id]
  );
  return rows[0] || null;
}

async function criar({ nome, estado, cidade, cep }) {
  const [result] = await pool.execute(
    'INSERT INTO localizacao (nome, estado, cidade, cod_regiao) VALUES (?, ?, ?, ?)',
    [nome, estado, cidade, cep]
  );
  return result.insertId;
}

async function atualizar(id, { nome, estado, cidade, cep }) {
  const [result] = await pool.execute(
    'UPDATE localizacao SET nome = ?, estado = ?, cidade = ?, cod_regiao = ? WHERE id_localizacao = ?',
    [nome, estado, cidade, cep, id]
  );
  return result.affectedRows;
}

async function remover(id) {
  const [result] = await pool.execute(
    'DELETE FROM localizacao WHERE id_localizacao = ?',
    [id]
  );
  return result.affectedRows;
}

export default { listar, buscarPorId, criar, atualizar, remover };