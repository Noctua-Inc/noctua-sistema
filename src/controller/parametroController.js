import parametroModel from '../model/parametroModel.js';

function validar(body) {
  const { fk_mainframe, fk_componente } = body;
  if (!fk_mainframe || !fk_componente) {
    return 'Os campos fk_mainframe e fk_componente são obrigatórios.';
  }
  return null;
}

function tratarErroBanco(err, res, mensagemPadrao) {
  if (err.code === 'ER_NO_REFERENCED_ROW_2' || err.code === 'ER_NO_REFERENCED_ROW') {
    return res.status(400).json({ erro: 'fk_mainframe ou fk_componente inválido.' });
  }
  console.error(err);
  return res.status(500).json({ erro: mensagemPadrao });
}

async function listar(req, res) {
  try {
    const parametros = await parametroModel.listar(req.query.fk_mainframe);
    res.json(parametros);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar parâmetros.' });
  }
}

async function buscarPorId(req, res) {
  try {
    const parametro = await parametroModel.buscarPorId(req.params.id);
    if (!parametro) return res.status(404).json({ erro: 'Parâmetro não encontrado.' });
    res.json(parametro);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar parâmetro.' });
  }
}

async function criar(req, res) {
  const erro = validar(req.body);
  if (erro) return res.status(400).json({ erro });

  try {
    const id_parametro = await parametroModel.criar(req.body);
    res.status(201).json({ id_parametro, ...req.body });
  } catch (err) {
    tratarErroBanco(err, res, 'Erro ao criar parâmetro.');
  }
}

async function atualizar(req, res) {
  const erro = validar(req.body);
  if (erro) return res.status(400).json({ erro });

  try {
    const afetados = await parametroModel.atualizar(req.params.id, req.body);
    if (afetados === 0) return res.status(404).json({ erro: 'Parâmetro não encontrado.' });
    res.json({ id_parametro: Number(req.params.id), ...req.body });
  } catch (err) {
    tratarErroBanco(err, res, 'Erro ao atualizar parâmetro.');
  }
}

async function remover(req, res) {
  try {
    const afetados = await parametroModel.remover(req.params.id);
    if (afetados === 0) return res.status(404).json({ erro: 'Parâmetro não encontrado.' });
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao excluir parâmetro.' });
  }
}

export default { listar, buscarPorId, criar, atualizar, remover };