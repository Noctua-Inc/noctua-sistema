const ID_EMPRESA = sessionStorage.getItem("idEmpresa");
const ID_MAINFRAME = window.location.href.split("id_mainframe=")[1];

// Todas as abas leem os snapshots datados de componentes do Gold.
const registrosEmCache = new Map();

let nomeMainframe = document.querySelector("#nomeMainframe");
let opcoesBotoesMonitoramento = document.querySelectorAll(".opcao-monitoramento");
let sessaoKpis = document.querySelector("#sessaoKpis");
let opcoesBotoesTempo = document.querySelectorAll(".opcao-tempo");
let statusMainframe = document.querySelector("#statusMainframe");
let tituloTabela = document.querySelector("#tituloTabela");
let corpoTabela = document.querySelector("#corpoTabela");

let intervaloTempo = [];
let grafico;
let sessaoAtual = 0;
let statusRisco = 0;
let linhasTabela = [];
let cabecalhoTabela = "";

// Dados dashboard Geral
let dadosCpu = [];
let dadosRam = [];
let dadosDisco = [];
let dadosSwap = [];

async function buscarMainframe() {
  try {
    let resposta = await api.get(
      `/mainframe/idEmpresa/${ID_EMPRESA}/idMainFrame/${ID_MAINFRAME}`
    );
    let mainframe = resposta[0];

    nomeMainframe.textContent = mainframe.hostname;

    return mainframe;
  } catch (erro) {
    console.error(erro);
  }
}

async function buscarParametrosMainframe() {
  try {
    return await api.get(`/mainframe/${ID_MAINFRAME}`);
  } catch (erro) {
    console.error(erro);
    return null;
  }
}

function obterParametroPorTipo(parametros, tipo) {
  if (!parametros || !Array.isArray(parametros)) return null;
  return parametros.find((p) => p.tipo === tipo) || null;
}

function criarKPI(titulo, dado, observacao, classe = "") {
  let kpi = `
    <div class="kpi">
        <p class="texto-kpi ${classe}">${titulo}</p>
        <h3 class="dado-kpi ${classe}">${dado}</h3>
        <p class="texto-kpi">${observacao}</p>
    </div>
    `;

  return kpi;
}

function obterMedia(valores) {
  let soma = 0;
  let quantidade = 0;
  for (const valor of valores) {
    if (!Number.isFinite(valor)) continue;
    soma += valor;
    quantidade++;
  }
  return quantidade === 0 ? 0 : Number((soma / quantidade).toFixed(2));
}

function obterMomentoMaisUtilizado(dados, camposPercentuais = [
  "porcentagem_cpu", "porcentagem_ram", "porcentagem_disco", "media_swap_porcentagem"
]) {
  let momento = "--";
  let maiorValor = -Infinity;

  for (const dado of dados) {
    let maiorDoMomento = -Infinity;
    for (const campo of camposPercentuais) {
      const valor = dado[campo];
      if (Number.isFinite(valor) && valor > maiorDoMomento) maiorDoMomento = valor;
    }

    if (maiorDoMomento > maiorValor) {
      maiorValor = maiorDoMomento;
      momento = dado.hora_de_captura;
    }
  }

  return momento;
}

function obterMomentoMaiorRecebimento(dados) {
  let momento = "--";
  let maiorValor = -Infinity;

  for (const dado of dados) {
    const enviados = dado.dados_enviados_medio;
    const recebidos = dado.dados_recebidos_medio;
    if (!Number.isFinite(enviados) || !Number.isFinite(recebidos) || enviados <= 0) continue;

    const razao = recebidos / enviados;
    if (razao > maiorValor) {
      maiorValor = razao;
      momento = dado.hora_de_captura;
    }
  }

  return momento;
}

function obterClasseParametro(valor, minimo, maximo) {
  if (!Number.isFinite(valor)) return "";

  let temMin = minimo !== null && minimo !== undefined;
  let temMax = maximo !== null && maximo !== undefined;
  if (!temMin && !temMax) return "";

  if (temMax) {
    let max = Number(maximo);
    if (valor >= max) return "excedeu";
    if (valor >= max * 0.9) return "atencao";
  }
  if (temMin) {
    let min = Number(minimo);
    if (valor <= min) return "excedeu";
    if (valor <= min * 1.1) return "atencao";
  }
  return "previsto";
}

function configurarEixoY(sufixo, minimo, maximo) {
  grafico.options.scales.y.min = minimo;
  grafico.options.scales.y.max = maximo;
  grafico.options.scales.y.ticks.callback = function (value) {
    return value + sufixo;
  };
}

function criarLinhaParametro(label, valor, quantidadePontos, cor) {
  let dados = [];
  for (let i = 0; i < quantidadePontos; i++) dados.push(valor);

  return {
    label: label,
    data: dados,
    borderColor: cor,
    backgroundColor: cor,
    borderWidth: 1,
    borderDash: [6, 5],
    pointRadius: 0,
    pointHoverRadius: 0,
    fill: false,
  };
}

function adicionarLinhasParametro(
  datasets,
  parametro,
  campoMin,
  campoMax,
  quantidadePontos
) {
  if (parametro && parametro[campoMin] != null) {
    datasets.push(
      criarLinhaParametro(
        `Mín ${parametro[campoMin]}`,
        Number(parametro[campoMin]),
        quantidadePontos,
        "#10B981"
      )
    );
  }
  if (parametro && parametro[campoMax] != null) {
    datasets.push(
      criarLinhaParametro(
        `Máx ${parametro[campoMax]}`,
        Number(parametro[campoMax]),
        quantidadePontos,
        "#F43F5E"
      )
    );
  }
  return datasets;
}

function obterEstiloStatus(status) {
  if (status === "Em Alerta!") return 'style="color:#E11D48; font-weight:600;"';
  if (status === "Em Atenção!") return 'style="color:#D97706; font-weight:600;"';
  if (status === "Ok") return 'style="color:#059669; font-weight:600;"';
  return "";
}

function obterStatusLinhaGeral(dado, parametros) {
  let risco = 0;
  let parametroCpu = obterParametroPorTipo(parametros, "CPU");
  let parametroDisco = obterParametroPorTipo(parametros, "DISCO");
  let parametroRam = obterParametroPorTipo(parametros, "RAM");
  let parametroRede = obterParametroPorTipo(parametros, "REDE");

  if (parametroCpu && parametroCpu.cpu_pct_max != null && dado.porcentagem_cpu >= Number(parametroCpu.cpu_pct_max)) risco++;
  if (parametroDisco && parametroDisco.disco_pct_max != null && dado.porcentagem_disco >= Number(parametroDisco.disco_pct_max)) risco++;
  if (parametroRam && parametroRam.ram_pct_max != null && dado.porcentagem_ram >= Number(parametroRam.ram_pct_max)) risco++;
  if (parametroRede && parametroRede.tb_max != null && dado.dados_enviados_medio >= Number(parametroRede.tb_max)) risco++;

  if (risco > 2) return "Em Alerta!";
  if (risco > 0) return "Em Atenção!";
  return "Ok";
}

function renderizarTabela() {
  const filtroStatus = document.querySelector("#filtro-status-tabela")?.value || "";
  const filtroTempo = document.querySelector("#filtro-tempo-tabela")?.value || "";
  const agora = new Date();

  tituloTabela.innerHTML = cabecalhoTabela;

  let temStatus = linhasTabela.some((linha) => linha.status);
  let linhasFiltradas = linhasTabela.filter((linha) => {
    if (filtroStatus && temStatus && linha.status !== filtroStatus) return false;

    if (filtroTempo) {
      const minutos = Number(filtroTempo);
      const [hora, minuto] = String(linha.hora_de_captura).split(":").map(Number);
      if (Number.isFinite(hora) && Number.isFinite(minuto)) {
        const dataLinha = new Date(agora);
        dataLinha.setHours(hora, minuto, 0, 0);
        if (dataLinha.getTime() > agora.getTime()) dataLinha.setDate(dataLinha.getDate() - 1);
        const diffMin = (agora.getTime() - dataLinha.getTime()) / 60000;
        if (diffMin > minutos) return false;
      }
    }

    return true;
  });

  linhasFiltradas.sort((a, b) => String(b.hora_de_captura).localeCompare(String(a.hora_de_captura)));

  corpoTabela.innerHTML = linhasFiltradas.map((linha) => linha.html).join("");
}

function montarHistoricoHora(historico) {
  const { amostras, colunas, atualizado_em } = historico;
  const hora = atualizado_em.slice(0, 13);
  const indices = {};
  for (let i = 0; i < colunas.length; i++) {
    indices[colunas[i]] = i;
  }

  const resultado = {
    dados: [],
    labels: [],
    cpu: [],
    ram: [],
    swap: [],
    disco: [],
    redeTrafego: [],
    cpuMedia: [],
    cpuFrequencia: [],
    ramMedia: [],
    ramLivre: [],
    discoMedia: [],
    discoLivre: [],
    discoEscrita: [],
    discoLeitura: [],
    redeTxMedia: [],
    redeRxMedia: [],
    redePerdidos: [],
    redeTw: [],
  };

  for (const linha of amostras) {
    const horario = linha[indices.horario];
    if (typeof horario !== "string" || !horario.startsWith(hora)) continue;

    const cpu = linha[indices.cpu];
    const ram = linha[indices.ram];
    const disco = linha[indices.disco];
    const txMib = linha[indices.enviados_mib];
    const rxMib = linha[indices.recebidos_mib];
    const tx = Number.isFinite(txMib) ? txMib * (1024 ** 2) / (1000 ** 4) : null;
    const rx = Number.isFinite(rxMib) ? rxMib * (1024 ** 2) / (1000 ** 4) : null;

    const dado = {
      hora_de_captura: horario.slice(11, 16),
      porcentagem_cpu: cpu,
      porcentagem_ram: ram,
      porcentagem_disco: disco,
      media_swap_porcentagem: linha[indices.swap],
      media_trafego_rede: tx === null || rx === null ? null : tx + rx,
      dados_enviados_medio: tx,
      dados_recebidos_medio: rx,
      media_cpu_porcentagem: cpu,
      media_cpu_frequencia: linha[indices.frequencia_ghz],
      media_ram_porcentagem: ram,
      media_ram_disponivel: linha[indices.ram_livre_gib],
      media_disco_porcentagem: disco,
      media_disco_disponivel: linha[indices.disco_livre_gib],
      media_qtd_requisicao_escrita: linha[indices.escritas_acumuladas],
      media_qtd_requisicao_leitura: linha[indices.leituras_acumuladas],
      media_dados_enviados: tx,
      media_dados_recebidos: rx,
      media_dados_perdidos: linha[indices.erros_recebimento],
      media_sockets_tw: linha[indices.sockets_time_wait],
    };

    adicionarAoHistorico(resultado, dado);
  }

  return resultado;
}

function adicionarAoHistorico(resultado, dado) {
  resultado.dados.push(dado);
  resultado.labels.push(dado.hora_de_captura);
  resultado.cpu.push(dado.porcentagem_cpu);
  resultado.ram.push(dado.porcentagem_ram);
  resultado.swap.push(dado.media_swap_porcentagem);
  resultado.disco.push(dado.porcentagem_disco);
  resultado.redeTrafego.push(dado.media_trafego_rede);
  resultado.cpuMedia.push(dado.media_cpu_porcentagem);
  resultado.cpuFrequencia.push(dado.media_cpu_frequencia);
  resultado.ramMedia.push(dado.media_ram_porcentagem);
  resultado.ramLivre.push(dado.media_ram_disponivel);
  resultado.discoMedia.push(dado.media_disco_porcentagem);
  resultado.discoLivre.push(dado.media_disco_disponivel);
  resultado.discoEscrita.push(dado.media_qtd_requisicao_escrita);
  resultado.discoLeitura.push(dado.media_qtd_requisicao_leitura);
  resultado.redeTxMedia.push(dado.media_dados_enviados);
  resultado.redeRxMedia.push(dado.media_dados_recebidos);
  resultado.redePerdidos.push(dado.media_dados_perdidos);
  resultado.redeTw.push(dado.media_sockets_tw);
}

function criarHistoricoVazio() {
  return {
    dados: [],
    labels: [],
    cpu: [],
    ram: [],
    swap: [],
    disco: [],
    redeTrafego: [],
    cpuMedia: [],
    cpuFrequencia: [],
    ramMedia: [],
    ramLivre: [],
    discoMedia: [],
    discoLivre: [],
    discoEscrita: [],
    discoLeitura: [],
    redeTxMedia: [],
    redeRxMedia: [],
    redePerdidos: [],
    redeTw: [],
  };
}

function numeroOuNulo(valor) {
  return Number.isFinite(valor) ? valor : null;
}

function formatarRedeEmMiB(valorTb) {
  if (!Number.isFinite(valorTb)) return '—';
  const mib = valorTb * (1000 ** 4) / (1024 ** 2);
  return mib.toLocaleString('pt-BR', { maximumFractionDigits: 2 });
}

function partesMinuto(minuto) {
  const ano = minuto.getFullYear();
  const mes = String(minuto.getMonth() + 1).padStart(2, "0");
  const dia = String(minuto.getDate()).padStart(2, "0");
  const hora = String(minuto.getHours()).padStart(2, "0");
  const min = String(minuto.getMinutes()).padStart(2, "0");
  return { data: `${ano}-${mes}-${dia}`, hora: `${hora}-${min}` };
}

function nomeArquivoComponentes(minuto) {
  const { data, hora } = partesMinuto(minuto);
  return `componentes_${data}_${hora}.json`;
}

function chaveRegistro(hostname, minuto) {
  const { data, hora } = partesMinuto(minuto);
  return `${hostname}|${data} ${hora.replace("-", ":")}`;
}

async function carregarRegistros(hostname) {
  const agora = new Date();
  const minutoInicial = new Date(agora);
  minutoInicial.setMinutes(0, 0, 0);

  const minutos = [];
  for (
    let minuto = new Date(minutoInicial);
    minuto <= agora;
    minuto = new Date(minuto.getTime() + 60000)
  ) {
    minutos.push(new Date(minuto));
  }

  const pendentes = minutos.filter(
    (minuto) => !registrosEmCache.has(chaveRegistro(hostname, minuto))
  );

  await Promise.all(
    pendentes.map(async (minuto) => {
      const arquivo = nomeArquivoComponentes(minuto);
      try {
        const registro = await api.get(
          `/gold/empresa/${ID_EMPRESA}/${encodeURIComponent(hostname)}/monitoramento/${arquivo}`
        );
        registrosEmCache.set(chaveRegistro(hostname, minuto), registro);
      } catch (erro) {
        // O snapshot do minuto ainda não foi publicado no Gold.
      }
    })
  );

  return minutos
    .map((minuto) => registrosEmCache.get(chaveRegistro(hostname, minuto)))
    .filter((registro) => registro !== undefined);
}

function mibParaTb(valor) {
  return Number.isFinite(valor) ? valor * (1024 ** 2) / (1000 ** 4) : null;
}

function montarHistoricoRegistros(registros) {
  const resultado = criarHistoricoVazio();
  for (const registro of registros) {
    const valores = registro.valores || {};
    const tx = mibParaTb(valores.enviados_mib);
    const rx = mibParaTb(valores.recebidos_mib);
    const dado = {
      hora_de_captura: String(registro.atualizado_em || "").slice(11, 16),
      porcentagem_cpu: numeroOuNulo(valores.cpu),
      porcentagem_ram: numeroOuNulo(valores.ram),
      porcentagem_disco: numeroOuNulo(valores.disco),
      media_swap_porcentagem: numeroOuNulo(valores.swap),
      media_trafego_rede: tx === null || rx === null ? null : tx + rx,
      dados_enviados_medio: tx,
      dados_recebidos_medio: rx,
      media_cpu_porcentagem: numeroOuNulo(valores.cpu),
      media_cpu_frequencia: numeroOuNulo(valores.frequencia_ghz),
      media_ram_porcentagem: numeroOuNulo(valores.ram),
      media_ram_disponivel: numeroOuNulo(valores.ram_livre_gib),
      media_disco_porcentagem: numeroOuNulo(valores.disco),
      media_disco_disponivel: numeroOuNulo(valores.disco_livre_gib),
      media_qtd_requisicao_escrita: numeroOuNulo(valores.escritas_acumuladas),
      media_qtd_requisicao_leitura: numeroOuNulo(valores.leituras_acumuladas),
      media_dados_enviados: tx,
      media_dados_recebidos: rx,
      media_dados_perdidos: numeroOuNulo(valores.erros_recebimento),
      media_sockets_tw: numeroOuNulo(valores.sockets_time_wait),
    };
    adicionarAoHistorico(resultado, dado);
  }
  return resultado;
}

function trocarTempo(indice) {
  for (let i = 0; i < opcoesBotoesTempo.length; i++) {
    if (
      opcoesBotoesTempo[i].className == "opcao-tempo opcao-tempo-selecionada"
    ) {
      opcoesBotoesTempo[i].classList.remove("opcao-tempo-selecionada");
      break;
    }
  }

  opcoesBotoesTempo[indice].classList.add("opcao-tempo-selecionada");

  switch (indice) {
    case 0:
      intervaloTempo = [
        "05min", "10min", "15min", "20min", "25min", "30min", "35min", "40min", "45min", "50min", "55min", "60min", ];
      break;

    case 1:
      intervaloTempo = [
        "01h", "02h", "03h", "04h", "05h", "06h", "07h", "08h", "09h", "10h", "11h", "12h", ];
      break;

    case 2:
      intervaloTempo = [
        "02h", "04h", "06h", "08h", "10h", "12h", "14h", "16h", "18h", "20h", "22h", "24h", ];
      break;

    case 3:
      intervaloTempo = [
        "Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", ];
      break;

    default:
      break;
  }

  if (grafico) {
    grafico.data.labels = intervaloTempo;
    grafico.update();
  }
}

async function trocarMonitoramento(indice) {
  let titulosKpi = [];
  let todasKpis = "";
  let statusRiscoCalculo = 0;

  sessaoAtual = indice;
  const filtroComponenteTabela = document.querySelector("#filtro-componente-tabela");
  if (filtroComponenteTabela) filtroComponenteTabela.value = String(indice);

  for (let i = 0; i < opcoesBotoesMonitoramento.length; i++) {
    if (
      opcoesBotoesMonitoramento[i].className ==
      "opcao-monitoramento opcao-monitoramento-selecionada"
    ) {
      opcoesBotoesMonitoramento[i].classList.remove(
        "opcao-monitoramento-selecionada"
      );
      break;
    }
  }

  opcoesBotoesMonitoramento[indice].classList.add(
    "opcao-monitoramento-selecionada"
  );

  const mainframe = await buscarMainframe();
  if (!mainframe) return;

  const hostname = mainframe.hostname;
  let historico;
  let mainframeDetalhado;
  try {
    const [registros, detalhes] = await Promise.all([
      carregarRegistros(hostname),
      buscarParametrosMainframe(),
    ]);
    historico = montarHistoricoRegistros(registros);
    mainframeDetalhado = detalhes;
  } catch (erro) {
    if (sessaoAtual === indice) sessaoKpis.textContent = erro.message;
    return;
  }

  if (sessaoAtual !== indice) return;
  if (historico.dados.length === 0) {
    sessaoKpis.textContent = "Sem amostras de monitoramento disponíveis.";
    return;
  }

  const parametros = mainframeDetalhado?.parametros ?? [];

  switch (indice) {
    case 0: {
      titulosKpi = [
        "Status de Risco",
        "Momento mais utilizado",
        "Uso Médio CPU",
        "Uso Médio RAM",
        "Uso Médio Disco",
        "Tráfego de Rede (Tx/Rx)",
      ];
      const dadosCapturadosGeral = historico.dados[historico.dados.length - 1];

      let parametroCpu = obterParametroPorTipo(parametros, "CPU");
      let parametroDisco = obterParametroPorTipo(parametros, "DISCO");
      let parametroRam = obterParametroPorTipo(parametros, "RAM");
      let parametroRede = obterParametroPorTipo(parametros, "REDE");

      if (parametroCpu && parametroCpu.cpu_pct_max != null && dadosCapturadosGeral.porcentagem_cpu >= Number(parametroCpu.cpu_pct_max)) {
        statusRiscoCalculo++;
      }
      if (parametroDisco && parametroDisco.disco_pct_max != null && dadosCapturadosGeral.porcentagem_disco >= Number(parametroDisco.disco_pct_max)) {
        statusRiscoCalculo++;
      }
      if (parametroRam && parametroRam.ram_pct_max != null && dadosCapturadosGeral.porcentagem_ram >= Number(parametroRam.ram_pct_max)) {
        statusRiscoCalculo++;
      }
      if (parametroRede && parametroRede.tb_max != null && dadosCapturadosGeral.dados_enviados_medio >= Number(parametroRede.tb_max)) {
        statusRiscoCalculo++;
      }

      statusRisco = statusRiscoCalculo;

      if (statusRisco > 2) {
        statusMainframe.innerHTML = "Em Alerta!";
        statusMainframe.style.backgroundColor = "#FFE4E6";
        statusMainframe.style.border = "2px solid #FECDD3";
        statusMainframe.style.color = "#E11D48";
      } else if (statusRisco > 0) {
        statusMainframe.innerHTML = "Em Atenção!";
        statusMainframe.style.backgroundColor = "#FEF3C7";
        statusMainframe.style.border = "2px solid #FDE68A";
        statusMainframe.style.color = "#D97706";
      } else {
        statusMainframe.innerHTML = "Ok";
        statusMainframe.style.backgroundColor = "#D1FAE5";
        statusMainframe.style.border = "2px solid #A7F3D0";
        statusMainframe.style.color = "#059669";
      }

      let mediaCpu = obterMedia(historico.cpu);
      let mediaRam = obterMedia(historico.ram);
      let mediaDisco = obterMedia(historico.disco);
      let mediaRede = obterMedia(historico.redeTrafego);

      let classesKpi = [
        "",
        "",
        obterClasseParametro(mediaCpu, parametroCpu && parametroCpu.cpu_pct_min, parametroCpu && parametroCpu.cpu_pct_max),
        obterClasseParametro(mediaRam, parametroRam && parametroRam.ram_pct_min, parametroRam && parametroRam.ram_pct_max),
        obterClasseParametro(mediaDisco, parametroDisco && parametroDisco.disco_pct_min, parametroDisco && parametroDisco.disco_pct_max),
        obterClasseParametro(mediaRede, parametroRede && parametroRede.tb_min, parametroRede && parametroRede.tb_max),
      ];

      dadosKpi = [
        statusRisco,
        obterMomentoMaisUtilizado(historico.dados),
        mediaCpu + "%",
        mediaRam + "%",
        mediaDisco + "%",
        formatarRedeEmMiB(mediaRede) + " TB",
      ];

      dadosCpu = historico.cpu;
      dadosRam = historico.ram;
      dadosDisco = historico.disco;
      dadosSwap = historico.swap;

      for (let i = 0; i < titulosKpi.length; i++) {
        todasKpis += criarKPI(titulosKpi[i], dadosKpi[i], "...", classesKpi[i]);
      }

      sessaoKpis.innerHTML = todasKpis;

      cabecalhoTabela = `
                <th>Data Hora</th>
                <th>CPU</th>
                <th>RAM</th>
                <th>Disco</th>
                <th>SWAP</th>
                <th>Dados Enviados</th>
                <th>Dados Recebidos</th>
                <th>Status</th>
            `;

      linhasTabela = historico.dados.map((dado) => {
        const statusLinha = obterStatusLinhaGeral(dado, parametros);
        return {
          hora_de_captura: dado.hora_de_captura,
          status: statusLinha,
          html: `
                <tr>
                    <td>${dado.hora_de_captura}</td>
                    <td>${dado.porcentagem_cpu}%</td>
                    <td>${dado.porcentagem_ram}%</td>
                    <td>${dado.porcentagem_disco}%</td>
                    <td>${dado.media_swap_porcentagem}%</td>
                    <td>${formatarRedeEmMiB(dado.dados_enviados_medio)} TB</td>
                    <td>${formatarRedeEmMiB(dado.dados_recebidos_medio)} TB</td>
                    <td ${obterEstiloStatus(statusLinha)}>${statusLinha}</td>
                </tr>
            `,
        };
      });

      renderizarTabela();

      if (grafico) {
        grafico.data.labels =
          historico.labels.length > 0 ? historico.labels : intervaloTempo;
        grafico.data.datasets = [
          {
            label: "CPU",
            data: dadosCpu,
            borderColor: "#2196F3",
            backgroundColor: "#2196F3",
            borderWidth: 2,
            tension: 0.4,
            fill: false,
          },
          {
            label: "RAM",
            data: dadosRam,
            borderColor: "#4CAF50",
            backgroundColor: "#4CAF50",
            borderWidth: 2,
            tension: 0.4,
            fill: false,
          },
          {
            label: "SWAP",
            data: dadosSwap,
            borderColor: "#9C27B0",
            backgroundColor: "#9C27B0",
            borderWidth: 2,
            tension: 0.4,
            fill: false,
          },
          {
            label: "Disco",
            data: dadosDisco,
            borderColor: "#FF9800",
            backgroundColor: "#FF9800",
            borderWidth: 2,
            tension: 0.4,
            fill: false,
          },
        ];
        adicionarLinhasParametro(
          grafico.data.datasets,
          parametroCpu,
          "cpu_pct_min",
          "cpu_pct_max",
          historico.labels.length
        );
        configurarEixoY("%", 0, 100);
        grafico.update();
      }
      break;
    }

    case 1: {
      titulosKpi = [
        "Momento mais utilizado",
        "Dados Enviados (Tx)",
        "Dados Recebidos (Rx)",
        "Erros Pacotes Entrada (errin)",
        "Sockets TIME_WAIT",
      ];
      let parametroRede = obterParametroPorTipo(parametros, "REDE");
      let mediaTx = obterMedia(historico.redeTxMedia);
      let mediaRx = obterMedia(historico.redeRxMedia);
      let mediaPerdidos = obterMedia(historico.redePerdidos);
      let mediaTw = obterMedia(historico.redeTw);

      let classesKpi = [
        "",
        obterClasseParametro(mediaTx, parametroRede && parametroRede.tb_min, parametroRede && parametroRede.tb_max),
        obterClasseParametro(mediaRx, parametroRede && parametroRede.tb_min, parametroRede && parametroRede.tb_max),
        obterClasseParametro(mediaPerdidos, parametroRede && parametroRede.pkt_min, parametroRede && parametroRede.pkt_max),
        obterClasseParametro(mediaTw, parametroRede && parametroRede.tw_min, parametroRede && parametroRede.tw_max),
      ];

      dadosKpi = [
        obterMomentoMaiorRecebimento(historico.dados),
        formatarRedeEmMiB(mediaTx) + " TB",
        formatarRedeEmMiB(mediaRx) + " TB",
        mediaPerdidos,
        mediaTw,
      ];

      for (let i = 0; i < titulosKpi.length; i++) {
        todasKpis += criarKPI(titulosKpi[i], dadosKpi[i], "...", classesKpi[i]);
      }

      sessaoKpis.innerHTML = todasKpis;

      cabecalhoTabela = `
                <th>Data Hora</th>
                <th>Dados Enviados</th>
                <th>Dados Recebidos</th>
                <th>Pacotes Perdidos</th>
                <th>Sockets TIME_WAIT</th>
            `;

      linhasTabela = historico.dados.map((dado) => ({
        hora_de_captura: dado.hora_de_captura,
        status: "",
        html: `
                <tr>
                    <td>${dado.hora_de_captura}</td>
                    <td>${formatarRedeEmMiB(dado.media_dados_enviados)} TB</td>
                    <td>${formatarRedeEmMiB(dado.media_dados_recebidos)} TB</td>
                    <td>${dado.media_dados_perdidos}</td>
                    <td>${dado.media_sockets_tw}</td>
                </tr>
            `,
      }));

      renderizarTabela();

      if (grafico) {
        grafico.data.labels = historico.labels;
        grafico.data.datasets = [
          {
            label: "Tx (Enviados)",
            data: historico.redeTxMedia,
            borderColor: "#00BCD4",
            backgroundColor: "#00BCD4",
            borderWidth: 2,
            tension: 0.4,
            fill: false,
          },
          {
            label: "Rx (Recebidos)",
            data: historico.redeRxMedia,
            borderColor: "#E91E63",
            backgroundColor: "#E91E63",
            borderWidth: 2,
            tension: 0.4,
            fill: false,
          },
        ];
        adicionarLinhasParametro(
          grafico.data.datasets,
          parametroRede,
          "tb_min",
          "tb_max",
          historico.labels.length
        );
        configurarEixoY(" TB", 0, undefined);
        grafico.update();
      }
      break;
    }

    case 2: {
      titulosKpi = [
        "Momento mais utilizado",
        "Uso Médio CPU",
        "Frequência Média CPU",
      ];
      let parametroCpu = obterParametroPorTipo(parametros, "CPU");
      let mediaCpu = obterMedia(historico.cpuMedia);
      let mediaFrequencia = obterMedia(historico.cpuFrequencia);

      let classesKpi = [
        "",
        obterClasseParametro(mediaCpu, parametroCpu && parametroCpu.cpu_pct_min, parametroCpu && parametroCpu.cpu_pct_max),
        obterClasseParametro(mediaFrequencia, parametroCpu && parametroCpu.freq_min, parametroCpu && parametroCpu.freq_max),
      ];

      dadosKpi = [
        obterMomentoMaisUtilizado(historico.dados, ["porcentagem_cpu"]),
        mediaCpu + "%",
        mediaFrequencia + " GHz",
      ];

      for (let i = 0; i < titulosKpi.length; i++) {
        todasKpis += criarKPI(titulosKpi[i], dadosKpi[i], "...", classesKpi[i]);
      }

      sessaoKpis.innerHTML = todasKpis;

      cabecalhoTabela = `
                <th>Data Hora</th>
                <th>CPU</th>
                <th>Frequência CPU</th>
            `;

      linhasTabela = historico.dados.map((dado) => ({
        hora_de_captura: dado.hora_de_captura,
        status: "",
        html: `
                <tr>
                    <td>${dado.hora_de_captura}</td>
                    <td>${dado.media_cpu_porcentagem}%</td>
                    <td>${dado.media_cpu_frequencia} GHz</td>
                </tr>
            `,
      }));

      renderizarTabela();

      if (grafico) {
        grafico.data.labels = historico.labels;
        grafico.data.datasets = [
          {
            label: "CPU %",
            data: historico.cpuMedia,
            borderColor: "#2196F3",
            backgroundColor: "#2196F3",
            borderWidth: 2,
            tension: 0.4,
            fill: false,
          },
        ];
        adicionarLinhasParametro(
          grafico.data.datasets,
          parametroCpu,
          "cpu_pct_min",
          "cpu_pct_max",
          historico.labels.length
        );
        configurarEixoY("%", 0, 100);
        grafico.update();
      }
      break;
    }

    case 3: {
      titulosKpi = [
        "Momento mais utilizado",
        "Uso Média RAM",
        "GB Livre RAM",
        "Uso Médio SWAP",
      ];
      let parametroRam = obterParametroPorTipo(parametros, "RAM");
      let parametroSwap = obterParametroPorTipo(parametros, "SWAP");
      let mediaRam = obterMedia(historico.ramMedia);
      let mediaLivre = obterMedia(historico.ramLivre);
      let mediaSwap = obterMedia(historico.swap);

      let classesKpi = [
        "",
        obterClasseParametro(mediaRam, parametroRam && parametroRam.ram_pct_min, parametroRam && parametroRam.ram_pct_max),
        obterClasseParametro(mediaLivre, parametroRam && parametroRam.gb_min, parametroRam && parametroRam.gb_max),
        obterClasseParametro(mediaSwap, parametroSwap && parametroSwap.swap_pct_min, parametroSwap && parametroSwap.swap_pct_max),
      ];

      dadosKpi = [
        obterMomentoMaisUtilizado(historico.dados, ["porcentagem_ram"]),
        mediaRam + "%",
        mediaLivre + " GB",
        mediaSwap + "%",
      ];

      for (let i = 0; i < titulosKpi.length; i++) {
        todasKpis += criarKPI(titulosKpi[i], dadosKpi[i], "...", classesKpi[i]);
      }

      sessaoKpis.innerHTML = todasKpis;

      cabecalhoTabela = `
                <th>Data Hora</th>
                <th>RAM</th>
                <th>SWAP</th>
                <th>RAM Disponível</th>
            `;

      linhasTabela = historico.dados.map((dado) => ({
        hora_de_captura: dado.hora_de_captura,
        status: "",
        html: `
                <tr>
                    <td>${dado.hora_de_captura}</td>
                    <td>${dado.media_ram_porcentagem}%</td>
                    <td>${dado.media_swap_porcentagem}%</td>
                    <td>${dado.media_ram_disponivel} GB</td>
                </tr>
            `,
      }));

      renderizarTabela();

      if (grafico) {
        grafico.data.labels = historico.labels;
        grafico.data.datasets = [
          {
            label: "RAM %",
            data: historico.ramMedia,
            borderColor: "#4CAF50",
            backgroundColor: "#4CAF50",
            borderWidth: 2,
            tension: 0.4,
            fill: false,
          },
          {
            label: "SWAP %",
            data: historico.swap,
            borderColor: "#9C27B0",
            backgroundColor: "#9C27B0",
            borderWidth: 2,
            tension: 0.4,
            fill: false,
          },
        ];
        adicionarLinhasParametro(
          grafico.data.datasets,
          parametroRam,
          "ram_pct_min",
          "ram_pct_max",
          historico.labels.length
        );
        configurarEixoY("%", 0, 100);
        grafico.update();
      }
      break;
    }

    case 4: {
      titulosKpi = [
        "Momento mais utilizado",
        "Uso Média Disco",
        "GB Livre Disco",
        "Quantidade requisição (Escrita)",
        "Quantidade requisição (Leitura)",
      ];
      let parametroDisco = obterParametroPorTipo(parametros, "DISCO");
      let mediaDisco = obterMedia(historico.discoMedia);
      let mediaLivre = obterMedia(historico.discoLivre);
      let mediaEscrita = obterMedia(historico.discoEscrita);
      let mediaLeitura = obterMedia(historico.discoLeitura);

      let classesKpi = [
        "",
        obterClasseParametro(mediaDisco, parametroDisco && parametroDisco.disco_pct_min, parametroDisco && parametroDisco.disco_pct_max),
        obterClasseParametro(mediaLivre, parametroDisco && parametroDisco.pb_min, parametroDisco && parametroDisco.pb_max),
        obterClasseParametro(mediaEscrita, parametroDisco && parametroDisco.req_min, parametroDisco && parametroDisco.req_max),
        obterClasseParametro(mediaLeitura, parametroDisco && parametroDisco.req_min, parametroDisco && parametroDisco.req_max),
      ];

      dadosKpi = [
        obterMomentoMaisUtilizado(historico.dados, ["porcentagem_disco"]),
        mediaDisco + "%",
        mediaLivre + " GB",
        mediaEscrita,
        mediaLeitura,
      ];

      for (let i = 0; i < titulosKpi.length; i++) {
        todasKpis += criarKPI(titulosKpi[i], dadosKpi[i], "...", classesKpi[i]);
      }

      sessaoKpis.innerHTML = todasKpis;

      cabecalhoTabela = `
                <th>Data Hora</th>
                <th>Disco</th>
                <th>Disco Disponível</th>
                <th>Dados Enviados</th>
                <th>Dados Recebidos</th>
            `;

      linhasTabela = historico.dados.map((dado) => ({
        hora_de_captura: dado.hora_de_captura,
        status: "",
        html: `
                <tr>
                    <td>${dado.hora_de_captura}</td>
                    <td>${dado.media_disco_porcentagem}%</td>
                    <td>${dado.media_disco_disponivel} GB</td>
                    <td>${dado.media_qtd_requisicao_escrita}</td>
                    <td>${dado.media_qtd_requisicao_leitura}</td>
                </tr>
            `,
      }));

      renderizarTabela();

      if (grafico) {
        grafico.data.labels = historico.labels;
        grafico.data.datasets = [
          {
            label: "Escrita",
            data: historico.discoEscrita,
            borderColor: "#FF9800",
            backgroundColor: "#FF9800",
            borderWidth: 2,
            tension: 0.4,
            fill: false,
          },
          {
            label: "Leitura",
            data: historico.discoLeitura,
            borderColor: "#3F51B5",
            backgroundColor: "#3F51B5",
            borderWidth: 2,
            tension: 0.4,
            fill: false,
          },
        ];
        adicionarLinhasParametro(
          grafico.data.datasets,
          parametroDisco,
          "req_min",
          "req_max",
          historico.labels.length
        );
        configurarEixoY(" req", 0, undefined);
        grafico.update();
      }
      break;
    }
  }
}

function prefixoEmpresa(razaoSocial) {
  return razaoSocial.toLowerCase().replaceAll(" ", "_");
}

async function buscarRazaoSocial() {
  const mainframes = await api.get(`/mainframe/empresa/${ID_EMPRESA}`);
  const atual = mainframes.find(
    (item) => String(item.id_mainframe) === String(ID_MAINFRAME)
  );
  return atual?.nome_empresa || null;
}

async function baixarRelatorio() {
  const botao = document.querySelector("#btn-gerar-relatorio");
  const aviso = document.querySelector("#aviso-monitoramento");
  const htmlOriginal = botao.innerHTML;

  botao.disabled = true;
  botao.innerHTML = '<i class="fa-solid fa-file-pdf"></i> Gerando...';
  aviso.textContent = "Gerando relatório...";

  try {
    const hostname = nomeMainframe.textContent.trim();
    if (!hostname) throw new Error("Mainframe não carregado.");

    const razaoSocial = await buscarRazaoSocial();
    if (!razaoSocial) throw new Error("Empresa não encontrada.");

    const { url: urlRelatorio } = await api.get("/config/relatorio");
    const resposta = await fetch(urlRelatorio, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        empresa: prefixoEmpresa(razaoSocial),
        hostname: hostname,
        idMainframe: String(ID_MAINFRAME),
      }),
    });

    if (!resposta.ok) {
      throw new Error(`Erro ${resposta.status} ao chamar a Lambda.`);
    }

    const dados = await resposta.json();
    const bytes = Uint8Array.from(atob(dados.pdf), (caractere) =>
      caractere.charCodeAt(0)
    );
    const url = URL.createObjectURL(
      new Blob([bytes], { type: "application/pdf" })
    );

    const link = document.createElement("a");
    link.href = url;
    link.download = dados.nomeArquivo || `relatorio-${hostname}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    aviso.textContent = "Relatório baixado com sucesso.";
  } catch (erro) {
    console.error(erro);
    aviso.textContent = "Não foi possível gerar o relatório: " + erro.message;
  } finally {
    botao.disabled = false;
    botao.innerHTML = htmlOriginal;
  }
}

function configurarBotaoRelatorio() {
  document
    .querySelector("#btn-gerar-relatorio")
    ?.addEventListener("click", baixarRelatorio);
}

async function inicializarPagina() {
  configurarBotaoRelatorio();

  const ctx = document.getElementById("grafico").getContext("2d");

  grafico = new Chart(ctx, {
    type: "line",
    data: {
      labels: intervaloTempo,
      datasets: [
        {
          label: "CPU",
          data: dadosCpu,
          borderColor: "#2196F3",
          backgroundColor: "#2196F3",
          borderWidth: 2,
          tension: 0.4,
          fill: false,
        },
        {
          label: "RAM",
          data: dadosRam,
          borderColor: "#4CAF50",
          backgroundColor: "#4CAF50",
          borderWidth: 2,
          tension: 0.4,
          fill: false,
        },
        {
          label: "SWAP",
          data: dadosSwap,
          borderColor: "#9C27B0",
          backgroundColor: "#9C27B0",
          borderWidth: 2,
          tension: 0.4,
          fill: false,
        },
        {
          label: "Disco",
          data: dadosDisco,
          borderColor: "#FF9800",
          backgroundColor: "#FF9800",
          borderWidth: 2,
          tension: 0.4,
          fill: false,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "top",
          labels: {
            boxWidth: 12,
            usePointStyle: true,
            padding: 25,
            boxPadding: 8,
          },
        },
      },
      scales: {
        y: {
          min: 0,
          max: 100,
          ticks: {
            callback: function (value) {
              return value + "%";
            },
          },
          grid: {
            color: "#eee",
          },
        },
        x: {
          grid: {
            display: false,
          },
        },
      },
    },
  });

  document.querySelector("#filtro-componente-tabela")?.addEventListener("change", (e) => {
    trocarMonitoramento(Number(e.target.value));
  });
  document.querySelector("#filtro-status-tabela")?.addEventListener("change", renderizarTabela);
  document.querySelector("#filtro-tempo-tabela")?.addEventListener("change", renderizarTabela);

  trocarTempo(0);
  await trocarMonitoramento(0);
  setInterval(() => trocarMonitoramento(sessaoAtual), 60000);
}

inicializarPagina();
