import parametroModel from '../model/parametroModel.js';

function validarIds(id_mainframe, id_componente) {
  if (!id_mainframe || !id_componente) {
    return 'Os campos id_mainframe e id_componente são obrigatórios.';
  }
  return null;
}

function tratarErroBanco(err, res, mensagemPadrao) {
  if (err.code === 'ER_NO_REFERENCED_ROW_2' || err.code === 'ER_NO_REFERENCED_ROW') {
    return res.status(400).json({ erro: 'id_mainframe ou id_componente inválido.' });
  }
  console.error(err);
  return res.status(500).json({ erro: mensagemPadrao });
}

async function listar(req, res) {
  try {
    const parametros = await parametroModel.listar(req.query.id_mainframe);
    res.json(parametros);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar parâmetros.' });
  }
}

async function buscarPorId(req, res) {
  const { id_mainframe, id_componente } = req.params;

  try {
    const parametro = await parametroModel.buscarPorId(id_mainframe, id_componente);
    if (!parametro) return res.status(404).json({ erro: 'Parâmetro não encontrado.' });
    res.json(parametro);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar parâmetro.' });
  }
}

async function criar(req, res) {
  const { id_mainframe, id_componente } = req.body;
  const erro = validarIds(id_mainframe, id_componente);
  if (erro) return res.status(400).json({ erro });

  try {
    const afetados = await parametroModel.criar(req.body);
    res.status(201).json({ id_mainframe: Number(id_mainframe), id_componente: Number(id_componente), afetados });
  } catch (err) {
    tratarErroBanco(err, res, 'Erro ao criar parâmetro.');
  }
}

async function atualizar(req, res) {
  const { id_mainframe, id_componente } = req.params;
  const erro = validarIds(id_mainframe, id_componente);
  if (erro) return res.status(400).json({ erro });

  try {
    const afetados = await parametroModel.atualizar({ ...req.body, id_mainframe, id_componente });
    if (afetados === 0) return res.status(404).json({ erro: 'Parâmetro não encontrado.' });
    res.json({ id_mainframe: Number(id_mainframe), id_componente: Number(id_componente) });
  } catch (err) {
    tratarErroBanco(err, res, 'Erro ao atualizar parâmetro.');
  }
}

async function remover(req, res) {
  const { id_mainframe, id_componente } = req.params;

  try {
    const afetados = await parametroModel.remover(id_mainframe, id_componente);
    if (afetados === 0) return res.status(404).json({ erro: 'Parâmetro não encontrado.' });
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao excluir parâmetro.' });
  }
}

async function removerPorMainframe(req, res) {
  const { id_mainframe } = req.params;

  try {
    const afetados = await parametroModel.removerPorMainframe(id_mainframe);
    if (afetados === 0) return res.status(404).json({ erro: 'Parâmetros não encontrados.' });
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao excluir parâmetros.' });
  }
}

export default { listar, buscarPorId, criar, atualizar, remover, removerPorMainframe };