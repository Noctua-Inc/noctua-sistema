import pool from '../database/config.js';

const COMPONENTES = {
  CPU: 1,
  RAM: 2,
  SWAP: 3,
  DISCO: 4,
  REDE: 5,
};

function valorOuNull(valor) {
  if (valor === undefined || valor === null || valor === '') return null;
  return valor;
}

function montarDadosComponente(tipo, dados = {}) {
  const base = {
    cpu_pct_min: null,
    cpu_pct_max: null,
    freq_min: null,
    freq_max: null,
    ram_pct_min: null,
    ram_pct_max: null,
    gb_min: null,
    gb_max: null,
    swap_pct_min: null,
    swap_pct_max: null,
    disco_pct_min: null,
    disco_pct_max: null,
    pb_min: null,
    pb_max: null,
    req_min: null,
    req_max: null,
    tb_min: null,
    tb_max: null,
    pkt_min: null,
    pkt_max: null,
    tw_min: null,
    tw_max: null,
  };

  if (tipo === 'CPU') {
    base.cpu_pct_min = valorOuNull(dados.pct_min);
    base.cpu_pct_max = valorOuNull(dados.pct_max);
    base.freq_min = valorOuNull(dados.freq_min);
    base.freq_max = valorOuNull(dados.freq_max);
  } else if (tipo === 'RAM') {
    base.ram_pct_min = valorOuNull(dados.pct_min);
    base.ram_pct_max = valorOuNull(dados.pct_max);
    base.gb_min = valorOuNull(dados.gb_min);
    base.gb_max = valorOuNull(dados.gb_max);
  } else if (tipo === 'SWAP') {
    base.swap_pct_min = valorOuNull(dados.pct_min);
    base.swap_pct_max = valorOuNull(dados.pct_max);
  } else if (tipo === 'DISCO') {
    base.disco_pct_min = valorOuNull(dados.pct_min);
    base.disco_pct_max = valorOuNull(dados.pct_max);
    base.pb_min = valorOuNull(dados.pb_min);
    base.pb_max = valorOuNull(dados.pb_max);
    base.req_min = valorOuNull(dados.req_min);
    base.req_max = valorOuNull(dados.req_max);
  } else if (tipo === 'REDE') {
    base.tb_min = valorOuNull(dados.tb_min);
    base.tb_max = valorOuNull(dados.tb_max);
    base.pkt_min = valorOuNull(dados.pkt_min);
    base.pkt_max = valorOuNull(dados.pkt_max);
    base.tw_min = valorOuNull(dados.tw_min);
    base.tw_max = valorOuNull(dados.tw_max);
  }

  return base;
}

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

async function criar({ id_mainframe, id_componente, ...dados }) {
  const tipo = Object.keys(COMPONENTES).find((chave) => COMPONENTES[chave] === Number(id_componente));
  const valores = montarDadosComponente(tipo, dados);
  const [result] = await pool.execute(
    `INSERT INTO parametro (
      id_mainframe, id_componente,
      cpu_pct_min, cpu_pct_max, freq_min, freq_max,
      ram_pct_min, ram_pct_max, gb_min, gb_max,
      swap_pct_min, swap_pct_max,
      disco_pct_min, disco_pct_max, pb_min, pb_max, req_min, req_max,
      tb_min, tb_max, pkt_min, pkt_max, tw_min, tw_max
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id_mainframe,
      id_componente,
      valores.cpu_pct_min, valores.cpu_pct_max, valores.freq_min, valores.freq_max,
      valores.ram_pct_min, valores.ram_pct_max, valores.gb_min, valores.gb_max,
      valores.swap_pct_min, valores.swap_pct_max,
      valores.disco_pct_min, valores.disco_pct_max, valores.pb_min, valores.pb_max, valores.req_min, valores.req_max,
      valores.tb_min, valores.tb_max, valores.pkt_min, valores.pkt_max, valores.tw_min, valores.tw_max,
    ]
  );
  return result.affectedRows;
}

async function atualizar({ id_mainframe, id_componente, ...dados }) {
  const tipo = Object.keys(COMPONENTES).find((chave) => COMPONENTES[chave] === Number(id_componente));
  const valores = montarDadosComponente(tipo, dados);
  const [result] = await pool.execute(
    `UPDATE parametro SET
      cpu_pct_min = ?, cpu_pct_max = ?, freq_min = ?, freq_max = ?,
      ram_pct_min = ?, ram_pct_max = ?, gb_min = ?, gb_max = ?,
      swap_pct_min = ?, swap_pct_max = ?,
      disco_pct_min = ?, disco_pct_max = ?, pb_min = ?, pb_max = ?, req_min = ?, req_max = ?,
      tb_min = ?, tb_max = ?, pkt_min = ?, pkt_max = ?, tw_min = ?, tw_max = ?
     WHERE id_mainframe = ? AND id_componente = ?`,
    [
      valores.cpu_pct_min, valores.cpu_pct_max, valores.freq_min, valores.freq_max,
      valores.ram_pct_min, valores.ram_pct_max, valores.gb_min, valores.gb_max,
      valores.swap_pct_min, valores.swap_pct_max,
      valores.disco_pct_min, valores.disco_pct_max, valores.pb_min, valores.pb_max, valores.req_min, valores.req_max,
      valores.tb_min, valores.tb_max, valores.pkt_min, valores.pkt_max, valores.tw_min, valores.tw_max,
      id_mainframe,
      id_componente,
    ]
  );
  return result.affectedRows;
}

async function remover(id_mainframe, id_componente) {
  const [result] = await pool.execute(
    'DELETE FROM parametro WHERE id_mainframe = ? AND id_componente = ?',
    [id_mainframe, id_componente]
  );
  return result.affectedRows;
}

async function removerPorMainframe(id_mainframe) {
  const [result] = await pool.execute(
    'DELETE FROM parametro WHERE id_mainframe = ?',
    [id_mainframe]
  );
  return result.affectedRows;
}

async function listarComComponentePorMainframe(id_mainframe) {
  const [rows] = await pool.execute(`
    SELECT p.*, c.tipo
    FROM parametro p
    JOIN componente c ON c.id_componente = p.id_componente
    WHERE p.id_mainframe = ?
    ORDER BY p.id_componente
  `, [id_mainframe]);
  return rows;
}

async function removerPorMainframeComConexao(conn, id_mainframe) {
  await conn.execute('DELETE FROM parametro WHERE id_mainframe = ?', [id_mainframe]);
}

async function criarComConexao(conn, id_mainframe, id_componente, dados = {}) {
  const tipo = Object.keys(COMPONENTES).find((chave) => COMPONENTES[chave] === Number(id_componente));
  const valores = montarDadosComponente(tipo, dados);

  await conn.execute(
    `INSERT INTO parametro (
      id_mainframe, id_componente,
      cpu_pct_min, cpu_pct_max, freq_min, freq_max,
      ram_pct_min, ram_pct_max, gb_min, gb_max,
      swap_pct_min, swap_pct_max,
      disco_pct_min, disco_pct_max, pb_min, pb_max, req_min, req_max,
      tb_min, tb_max, pkt_min, pkt_max, tw_min, tw_max
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id_mainframe,
      id_componente,
      valores.cpu_pct_min, valores.cpu_pct_max, valores.freq_min, valores.freq_max,
      valores.ram_pct_min, valores.ram_pct_max, valores.gb_min, valores.gb_max,
      valores.swap_pct_min, valores.swap_pct_max,
      valores.disco_pct_min, valores.disco_pct_max, valores.pb_min, valores.pb_max, valores.req_min, valores.req_max,
      valores.tb_min, valores.tb_max, valores.pkt_min, valores.pkt_max, valores.tw_min, valores.tw_max,
    ]
  );
}

export default {
  COMPONENTES,
  listar,
  buscarPorId,
  criar,
  atualizar,
  remover,
  removerPorMainframe,
  listarComComponentePorMainframe,
  removerPorMainframeComConexao,
  criarComConexao,
};