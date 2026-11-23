import pool from '../database/config.js';

async function listar() {
  const [rows] = await pool.query('SELECT id_componente, tipo FROM componente ORDER BY tipo');
  return rows;
}

async function buscarPorId(id) {
  const [rows] = await pool.execute(
    'SELECT * FROM componente WHERE id_componente = ?',
    [id]
  );
  return rows[0] || null;
}

async function listarPorEmpresa(idEmpresa) {
  const [rows] = await pool.execute(
    `SELECT DISTINCT c.id_componente, c.tipo
     FROM componente c
     INNER JOIN parametro p
        ON p.id_componente = c.id_componente
     INNER JOIN mainframe m
        ON m.id_mainframe = p.id_mainframe
     WHERE m.fk_empresa = ?
     ORDER BY c.tipo`,
    [idEmpresa]
  );

  return rows;
}

async function criar(tipo) {
  const [result] = await pool.execute(
    'INSERT INTO componente (tipo) VALUES (?)',
    [tipo]
  );
  return result.insertId;
}

async function atualizar(id, tipo) {
  const [result] = await pool.execute(
    'UPDATE componente SET tipo = ? WHERE id_componente = ?',
    [tipo, id]
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

export default { listar, buscarPorId, listarPorEmpresa, criar, atualizar, remover };
