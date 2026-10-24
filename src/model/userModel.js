import pool from "../database/config.js";

async function cadastrar(nome, email_institucional, cpf, senha, fk_empresa) {
  const [resultado] = await pool.query(
    `INSERT INTO usuario
        (nome, email_institucional, cpf, senha, fk_empresa)
        VALUES (?, ?, ?, ?, ?)`,
    [nome, email_institucional, cpf, senha, fk_empresa],
  );

  return resultado;
}

async function buscarPorId(id) {
    const [resultado] = await pool.query(
        `SELECT
            u.id_usuario,
            u.nome AS nome_usuario,
            u.email_institucional,
            u.cpf,
            u.fk_empresa,
            c.id_cargo,
            c.nome AS nome_cargo
        FROM usuario u JOIN cargo c
			ON u.fk_cargo = c.id_cargo
            WHERE id_usuario = ?;
            `,
        [id]
    );
    return resultado[0];
}

// agora retorna id_usuario e nome para o login poder devolver ao front
async function buscarPorEmail(email_institucional) {
    const [resultado] = await pool.query(
        `SELECT
            id_usuario,
            nome,
            fk_empresa as id_empresa,
            email_institucional,
            senha,
            verificado
         FROM usuario
         WHERE email_institucional = ?`,
    [email_institucional],
  );

  return resultado[0];
}

async function verificarEmail(id_usuario) {
  await pool.query(
    `UPDATE usuario
         SET verificado = 1
         WHERE id_usuario = ?`,
    [id_usuario],
  );
}

// lista para a tela de usuários
async function listar(idEmpresa) {
  const [resultado] = await pool.query(
    `SELECT
        u.id_usuario,
        u.nome,
        u.email_institucional,
        u.cpf,
        u.fk_cargo,
        c.nome AS cargo,
        e.razao_social AS empresa
     FROM usuario u
     LEFT JOIN cargo c ON c.id_cargo = u.fk_cargo
     LEFT JOIN empresa e ON e.id_empresa = u.fk_empresa
     WHERE u.fk_empresa = ?
     ORDER BY u.nome`,
    [idEmpresa]
  );
  return resultado;
}

// lista de cargos para atribuir
async function listarCargos(idEmpresa) {
  const [resultado] = await pool.query(
    `SELECT id_cargo, nome FROM cargo WHERE fk_empresa = ? ORDER BY nome`,
    [idEmpresa]
  );
  return resultado;
}

// atribui cargo a um usuário (tela de usuários)
async function atualizarConta(id, fk_cargo, idEmpresa) {
  const [resultado] = await pool.query(
    `UPDATE usuario u JOIN cargo c ON c.id_cargo = ? AND c.fk_empresa = u.fk_empresa
     SET u.fk_cargo = c.id_cargo WHERE u.id_usuario = ? AND u.fk_empresa = ?`,
    [fk_cargo, id, idEmpresa]
  );
  return resultado;
}

// o usuário edita o próprio perfil (popup)
async function atualizarPerfil(id, nome, email_institucional, senhaHash) {
  if (senhaHash) {
    const [resultado] = await pool.query(
      `UPDATE usuario
          SET nome = ?, email_institucional = ?, senha = ?
        WHERE id_usuario = ?`,
      [nome, email_institucional, senhaHash, id],
    );
    return resultado;
  }

  const [resultado] = await pool.query(
    `UPDATE usuario
        SET nome = ?, email_institucional = ?
      WHERE id_usuario = ?`,
    [nome, email_institucional, id],
  );
  return resultado;
}

// sem SQL injection
async function excluirConta(id, idEmpresa) {
  const [resultado] = await pool.query(
    `DELETE FROM usuario WHERE id_usuario = ? AND fk_empresa = ?`,
    [id, idEmpresa]
  );
  return resultado;
}

export default {
  cadastrar,
  buscarPorId,
  buscarPorEmail,
  verificarEmail,
  listar,
  listarCargos,
  atualizarConta,
  atualizarPerfil,
  excluirConta,
};