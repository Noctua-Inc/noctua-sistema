import pool from '../database/config.js';

async function listar() {
  const [rows] = await pool.query(`
    SELECT 
        c.id_componente,
        c.tipo,
        c.capacidade,
        f.nome_fabricante
    FROM componente c
    INNER JOIN fabricante f 
        ON f.id_fabricante = c.fk_fabricante
    ORDER BY c.tipo, f.nome_fabricante;`)
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
    `SELECT DISTINCT
        c.id_componente,
        c.tipo,
        c.capacidade,
        f.nome_fabricante
     FROM componente c
     INNER JOIN fabricante f
        ON f.id_fabricante = c.fk_fabricante
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

async function criar({ tipo, capacidade, fabricante}) {
  const [result] = await pool.execute(
    'INSERT INTO componente (tipo, capacidade, fk_fabricante) VALUES (?, ?, (SELECT id_fabricante FROM fabricante WHERE nome_fabricante = ?))',
    [tipo, capacidade, fabricante]
  );
  return result.insertId;
}

async function atualizar(id, { tipo, fabricante, capacidade }) {
  const [result] = await pool.execute(
    'UPDATE componente SET tipo = ?, fk_fabricante = (SELECT id_fabricante FROM fabricante WHERE nome_fabricante = ?), capacidade = ? WHERE id_componente = ?',
    [tipo, fabricante, capacidade, id]
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