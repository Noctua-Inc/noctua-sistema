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
            id_usuario,
            nome,
            email_institucional,
            cpf,
            verificado,
            fk_empresa
         FROM usuario
         WHERE id_usuario = ?`,
    [id],
  );

  return resultado[0];
}

// agora retorna id_usuario e nome para o login poder devolver ao front
async function buscarPorEmail(email_institucional) {
  const [resultado] = await pool.query(
    `SELECT
            id_usuario,
            nome,
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
async function listar() {
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
     ORDER BY u.nome`
  );
  return resultado;
}

// lista de cargos para atribuir
async function listarCargos() {
  const [resultado] = await pool.query(
    `SELECT id_cargo, nome FROM cargo ORDER BY nome`
  );
  return resultado;
}

// atribui cargo a um usuário (tela de usuários)
async function atualizarConta(id, fk_cargo) {
  const [resultado] = await pool.query(
    `UPDATE usuario SET fk_cargo = ? WHERE id_usuario = ?`,
    [fk_cargo, id]
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
async function excluirConta(id) {
  const [resultado] = await pool.query(
    `DELETE FROM usuario WHERE id_usuario = ?`,
    [id]
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