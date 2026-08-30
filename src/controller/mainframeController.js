import mainframeModel from '../model/mainframeModel.js';
import parametroModel from '../model/parametroModel.js';

const STATUS_VALIDOS = ['ativo', 'inativo', 'manut.'];

function validar(body) {
  const {
    hostname, fabricante, modelo, numero_serie, status,
    sis_operacional, versao_so, fk_usuario, fk_localizacao,
  } = body;

  if (!hostname || !fabricante || !modelo || !numero_serie || !status ||
      !sis_operacional || versao_so === undefined || versao_so === '' ||
      !fk_usuario || !fk_localizacao) {
    return 'Os campos hostname, fabricante, modelo, numero_serie, status, sis_operacional, versao_so, fk_usuario e fk_localizacao são obrigatórios.';
  }
  if (String(numero_serie).length !== 6) {
    return 'O número de série deve ter exatamente 6 caracteres.';
  }
  if (!STATUS_VALIDOS.includes(status)) {
    return `Status inválido. Use um dos valores: ${STATUS_VALIDOS.join(', ')}.`;
  }
  if (isNaN(Number(versao_so))) {
    return 'A versão do SO deve ser um número.';
  }
  return null;
}

function tratarErroBanco(err, res) {
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ erro: 'Já existe um mainframe com esse hostname.' });
  }
  if (err.code === 'ER_NO_REFERENCED_ROW_2' || err.code === 'ER_NO_REFERENCED_ROW') {
    return res.status(400).json({ erro: 'fk_usuario, fk_localizacao ou algum fk_componente informado é inválido.' });
  }
  console.error(err);
  return res.status(500).json({ erro: 'Erro ao processar mainframe.' });
}

async function listar(req, res) {
  try {
    const mainframes = await mainframeModel.listar();
    res.json(mainframes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar mainframes.' });
  }
}

async function buscarPorId(req, res) {
  try {
    const mainframe = await mainframeModel.buscarPorId(req.params.id);
    if (!mainframe) return res.status(404).json({ erro: 'Mainframe não encontrado.' });

    const parametros = await parametroModel.listarComComponentePorMainframe(req.params.id);
    res.json({ ...mainframe, parametros });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar mainframe.' });
  }
}

async function criar(req, res) {
  const erro = validar(req.body);
  if (erro) return res.status(400).json({ erro });

  try {
    const id_mainframe = await mainframeModel.criar(req.body);
    res.status(201).json({ id_mainframe });
  } catch (err) {
    tratarErroBanco(err, res);
  }
}

async function atualizar(req, res) {
  const erro = validar(req.body);
  if (erro) return res.status(400).json({ erro });

  try {
    const afetados = await mainframeModel.atualizar(req.params.id, req.body);
    if (afetados === 0) return res.status(404).json({ erro: 'Mainframe não encontrado.' });
    res.json({ id_mainframe: Number(req.params.id) });
  } catch (err) {
    tratarErroBanco(err, res);
  }
}

async function remover(req, res) {
  try {
    const afetados = await mainframeModel.remover(req.params.id);
    if (afetados === 0) return res.status(404).json({ erro: 'Mainframe não encontrado.' });
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao excluir mainframe.' });
  }
}

export default { listar, buscarPorId, criar, atualizar, remover };