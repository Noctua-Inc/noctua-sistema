import localizacaoModel from '../model/localizacaoModel.js';

function validar(body) {
  const { nome, pais, estado, cidade, cod_regiao } = body;

  if (!nome || !pais || !estado || !cidade || !cod_regiao) {
    return 'Os campos nome, pais, estado, cidade e cod_regiao (CEP) são obrigatórios.';
  }
  if (String(cod_regiao).length > 20) {
    return 'O CEP deve ter no máximo 20 caracteres.';
  }
  return null;
}

async function listar(req, res) {
  try {
    const localizacoes = await localizacaoModel.listar();
    res.json(localizacoes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar localizações.' });
  }
}

async function buscarPorId(req, res) {
  try {
    const localizacao = await localizacaoModel.buscarPorId(req.params.id);
    if (!localizacao) return res.status(404).json({ erro: 'Localização não encontrada.' });
    res.json(localizacao);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar localização.' });
  }
}

async function criar(req, res) {
  const erro = validar(req.body);
  if (erro) return res.status(400).json({ erro });

  try {
    const id_localizacao = await localizacaoModel.criar(req.body);
    res.status(201).json({ id_localizacao, ...req.body });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao criar localização.' });
  }
}

async function atualizar(req, res) {
  const erro = validar(req.body);
  if (erro) return res.status(400).json({ erro });

  try {
    const afetados = await localizacaoModel.atualizar(req.params.id, req.body);
    if (afetados === 0) return res.status(404).json({ erro: 'Localização não encontrada.' });
    res.json({ id_localizacao: Number(req.params.id), ...req.body });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao atualizar localização.' });
  }
}

async function remover(req, res) {
  try {
    const afetados = await localizacaoModel.remover(req.params.id);
    if (afetados === 0) return res.status(404).json({ erro: 'Localização não encontrada.' });
    res.status(204).send();
  } catch (err) {
    if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.code === 'ER_ROW_IS_REFERENCED') {
      return res.status(409).json({ erro: 'Não é possível excluir: existem mainframes usando esta localização.' });
    }
    console.error(err);
    res.status(500).json({ erro: 'Erro ao excluir localização.' });
  }
}

export default { listar, buscarPorId, criar, atualizar, remover };