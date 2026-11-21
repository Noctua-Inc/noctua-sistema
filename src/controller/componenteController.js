import componenteModel from '../model/componenteModel.js';

function lerTipo(body) {
  const tipo = typeof body?.tipo === 'string' ? body.tipo.trim() : '';
  return tipo.length > 0 && tipo.length <= 50 ? tipo : null;
}

function tratarErroGravacao(err, res, mensagem) {
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ erro: 'Já existe um componente com esse tipo.' });
  }
  console.error(err);
  return res.status(500).json({ erro: mensagem });
}

async function listar(req, res) {
  try {
    const componentes = await componenteModel.listar();
    res.json(componentes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar componentes.' });
  }
}

async function buscarPorId(req, res) {
  try {
    const componente = await componenteModel.buscarPorId(req.params.id);
    if (!componente) return res.status(404).json({ erro: 'Componente não encontrado.' });
    res.json(componente);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar componente.' });
  }
}

async function listarPorEmpresa(req, res){
  try {
    const componentes = await componenteModel.listarPorEmpresa(req.params.idEmpresa);
    res.json(componentes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar componente.' });
  }
}

async function criar(req, res) {
  const tipo = lerTipo(req.body);
  if (!tipo) return res.status(400).json({ erro: 'Informe um tipo de componente com até 50 caracteres.' });

  try {
    const id_componente = await componenteModel.criar(tipo);
    res.status(201).json({ id_componente, tipo });
  } catch (err) {
    tratarErroGravacao(err, res, 'Erro ao criar componente.');
  }
}

async function atualizar(req, res) {
  const tipo = lerTipo(req.body);
  if (!tipo) return res.status(400).json({ erro: 'Informe um tipo de componente com até 50 caracteres.' });

  try {
    const afetados = await componenteModel.atualizar(req.params.id, tipo);
    if (afetados === 0) return res.status(404).json({ erro: 'Componente não encontrado.' });
    res.json({ id_componente: Number(req.params.id), tipo });
  } catch (err) {
    tratarErroGravacao(err, res, 'Erro ao atualizar componente.');
  }
}

async function remover(req, res) {
  try {
    const afetados = await componenteModel.remover(req.params.id);
    if (afetados === 0) return res.status(404).json({ erro: 'Componente não encontrado.' });
    res.status(204).send();
  } catch (err) {
    if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.code === 'ER_ROW_IS_REFERENCED') {
      return res.status(409).json({ erro: 'Não é possível excluir: este componente está associado a um ou mais mainframes.' });
    }
    console.error(err);
    res.status(500).json({ erro: 'Erro ao excluir componente.' });
  }
}

export default { listar, buscarPorId, listarPorEmpresa, criar, atualizar, remover };
