import mainframeModel from '../model/mainframeModel.js';
import parametroModel from '../model/parametroModel.js';

const STATUS_VALIDOS = ['ativo', 'inativo', 'manutenção'];

function validar(body) {
  const {
    hostname, fabricante, modelo, numero_serie, status,
    sis_operacional, versao_so, fk_empresa, fk_localizacao,
  } = body;

  const camposObrigatorios = {
    'hostname': hostname,
    'fabricante': fabricante,
    'modelo': modelo,
    'número de série': numero_serie,
    'status': status,
    'sistema operacional': sis_operacional,
    'empresa': fk_empresa,
    'localização': fk_localizacao,
  };
  for (const campo in camposObrigatorios) {
    if (!camposObrigatorios[campo]) {
      return `O campo ${campo} é obrigatório.`;
    }
  }
  if (versao_so === undefined || versao_so === null || String(versao_so).trim() === '') {
    return 'O campo versão do SO é obrigatório.';
  }
  if (String(numero_serie).length !== 6) {
    return 'O número de série deve ter exatamente 6 caracteres.';
  }
  if (!STATUS_VALIDOS.includes(status)) {
    return `Status inválido. Use um dos valores: ${STATUS_VALIDOS.join(', ')}.`;
  }
  if (String(versao_so).length > 20) {
    return 'A versão do SO deve ter até 20 caracteres.';
  }
  return null;
}

function tratarErroBanco(err, res) {
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ erro: 'Já existe um mainframe com esse hostname.' });
  }
  if (err.code === 'ER_NO_REFERENCED_ROW_2' || err.code === 'ER_NO_REFERENCED_ROW') {
    return res.status(400).json({ erro: 'A empresa, a localização ou algum componente informado é inválido.' });
  }
  console.error(err);
  return res.status(500).json({ erro: 'Erro ao processar mainframe.' });
}

async function listar(req, res) {
  try {
    const idEmpresa = req.params.id;
    const mainframes = await mainframeModel.listar(idEmpresa);
    res.json(mainframes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar mainframes.' });
  }
}

async function listaPorIdMainframeId(req, res) {
  try {
    const idEmpresa = req.params.idEmpresa;
    const idMainFrame = req.params.idMainFrame;
    const mainframes = await mainframeModel.listaPorIdMainframeId(idEmpresa, idMainFrame);
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

  for (const parametro of req.body.parametros || []) {
    const minimo = parametro.pico_min;
    const maximo = parametro.pico_max;
    if (minimo != null && maximo != null && minimo > maximo) {
      return res.status(400).json({ erro: 'O pico mínimo não pode ser maior que o pico máximo.' });
    }
  }

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

export default { listar, listaPorIdMainframeId, buscarPorId, criar, atualizar, remover };