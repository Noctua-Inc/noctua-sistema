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

async function buscarPorEmail(email_institucional) {
  const [resultado] = await pool.query(
    `SELECT
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

function atualizarConta(id, email_institucional, senha, cargo) {
  console.log(
    "ACESSEI O USUARIO MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n",
  );

  var instrucaoSql = `
        UPDATE usuario
        SET 
        email_institucional = '${email_institucional},
        senha = ${senha}, 
        cargo = ${cargo}
        WHERE id_usuario = ${id};    
    `;
  console.log("Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}

function excluirConta(id) {

    var instrucaoSql = `
        DELETE FROM usuario
        WHERE id_usuario = ${id};
    `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

export default {
  cadastrar,
  buscarPorId,
  buscarPorEmail,
  verificarEmail,
  atualizarConta,
  excluirConta
};

