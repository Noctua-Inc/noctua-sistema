import componenteModel from '../model/componenteModel.js';

function validar(body) {
  const { tipo, fabricante } = body;

  if (!tipo || !fabricante) {
    return 'Os campos tipo e fabricante são obrigatórios.';
  }
  return null;
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
    res.json(componente);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar componente.' });
  }
}

async function listarPorEmpresa(req, res){
  try {
    const componente = await componenteModel.listarPorEmpresa(req.params.id);
    if (!componente) return res.status(404).json({ erro: 'Componente não encontrado.' });
    res.json(componente);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar componente.' });
  }
}

async function criar(req, res) {
  const erro = validar(req.body);
  if (erro) return res.status(400).json({ erro });

  try {
    const id_componente = await componenteModel.criar(req.body);
    res.status(201).json({ id_componente, ...req.body });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao criar componente.' });
  }
}

async function atualizar(req, res) {
  const erro = validar(req.body);
  if (erro) return res.status(400).json({ erro });

  try {
    const afetados = await componenteModel.atualizar(req.params.id, req.body);
    if (afetados === 0) return res.status(404).json({ erro: 'Componente não encontrado.' });
    res.json({ id_componente: Number(req.params.id), ...req.body });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao atualizar componente.' });
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