const ID_EMPRESA = sessionStorage.getItem("idEmpresa");
const ID_MAINFRAME = window.location.href.split("id_mainframe=")[1];

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
let nomeMainframeGlobal = "";

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

    nomeMainframe.innerHTML = mainframe.hostname;
    nomeMainframeGlobal = mainframe.hostname;

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

function obterCaminhoBase(nomeHost) {
  return `/api/gold/empresa/${ID_EMPRESA}/${nomeHost}/monitoramentoComponentes/`;
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
  if (valores.length === 0) return 0;
  let soma = 0;
  for (let i = 0; i < valores.length; i++) soma += valores[i];
  return Number((soma / valores.length).toFixed(2));
}

function obterMomentoMaisUtilizado(dados) {
  let momento = "--";
  for (let i = 1; i < dados.length; i++) {
    let anterior = dados[i - 1];
    let atual = dados[i];
    let componentesSuperiores = 0;

    for (let campo in atual) {
      if (campo === "hora_de_captura") continue;
      let valorAtual = Number(atual[campo]);
      let valorAnterior = Number(anterior[campo]);
      if (!Number.isFinite(valorAtual) || !Number.isFinite(valorAnterior)) continue;
      if (valorAtual > valorAnterior) componentesSuperiores++;
    }

    if (componentesSuperiores >= 3) momento = atual.hora_de_captura;
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

async function puxarJsonS3(quaisRegistros) {
  let registros = null;

  try {
    let mainframe = await buscarMainframe();
    let nomeHost = mainframe.hostname;

    const horarioAtual = new Date();
    let ano = horarioAtual.getFullYear();
    let mes = String(horarioAtual.getMonth() + 1).padStart(2, "0");
    let dia = String(horarioAtual.getDate()).padStart(2, "0");

    let hora = String(horarioAtual.getHours()).padStart(2, "0");
    let minutoAtual = horarioAtual.getMinutes();

    let dataHoraFormatado = `${ano}-${mes}-${dia}_${hora}-${String(minutoAtual).padStart(2, "0")}`;

    let nomeArquivo = encodeURIComponent(
      `${nomeMainframeGlobal}_${dataHoraFormatado}_${quaisRegistros}_registros.json`
    );
    let caminho = obterCaminhoBase(nomeHost) + nomeArquivo;
    let resposta = await fetch(caminho);

    if (resposta.ok) {
      registros = await resposta.json();
    } else {
      registros = null;
    }
  } catch (erro) {
    registros = null;
  }

  return registros;
}

async function carregarHistoricoHora(quaisRegistros) {
  let listaDados = [];
  let listaLabels = [];
  let dadosCpuArr = [];
  let dadosRamArr = [];
  let dadosSwapArr = [];
  let dadosDiscoArr = [];
  let dadosRedeTrafegoArr = [];
  let dadosRedeTxArr = [];
  let dadosRedeRxArr = [];
  let dadosCpuMediaArr = [];
  let dadosCpuFrequenciaArr = [];
  let dadosRamMediaArr = [];
  let dadosRamLivreArr = [];
  let dadosDiscoMediaArr = [];
  let dadosDiscoLivreArr = [];
  let dadosDiscoEscritaArr = [];
  let dadosDiscoLeituraArr = [];
  let dadosRedeTxMediaArr = [];
  let dadosRedeRxMediaArr = [];
  let dadosRedePerdidosArr = [];
  let dadosRedeTwArr = [];

  try {
    let mainframe = await buscarMainframe();
    let nomeHost = mainframe ? mainframe.hostname : nomeMainframeGlobal;

    const horarioAtual = new Date();
    let ano = horarioAtual.getFullYear();
    let mes = String(horarioAtual.getMonth() + 1).padStart(2, "0");
    let dia = String(horarioAtual.getDate()).padStart(2, "0");
    let hora = String(horarioAtual.getHours()).padStart(2, "0");
    let minutoAtual = horarioAtual.getMinutes();

    for (let m = 0; m <= minutoAtual; m++) {
      let minutoStr = String(m).padStart(2, "0");
      let dataHoraFormatado = `${ano}-${mes}-${dia}_${hora}-${minutoStr}`;
      let nomeArquivo = encodeURIComponent(
        `${nomeHost}_${dataHoraFormatado}_${quaisRegistros}_registros.json`
      );
      let caminho = obterCaminhoBase(nomeHost) + nomeArquivo;

      try {
        let resposta = await fetch(caminho);
        if (resposta.ok) {
          let dadoMinuto = await resposta.json();
          listaLabels.push(`${hora}:${minutoStr}`);
          listaDados.push(dadoMinuto);
        }
      } catch (err) {}
    }
  } catch (erro) {
    console.error("Erro ao carregar histórico:", erro);
  }

  for (let i = 0; i < listaDados.length; i++) {
    let dadoMinuto = listaDados[i];

    dadosCpuArr.push(dadoMinuto.porcentagem_cpu || 0);
    dadosRamArr.push(dadoMinuto.porcentagem_ram || 0);
    dadosSwapArr.push(dadoMinuto.media_swap_porcentagem || 0);
    dadosDiscoArr.push(dadoMinuto.porcentagem_disco || 0);
    dadosRedeTrafegoArr.push(dadoMinuto.media_trafego_rede || 0);
    dadosRedeTxArr.push(dadoMinuto.dados_enviados_medio || 0);
    dadosRedeRxArr.push(dadoMinuto.dados_recebidos_medio || 0);
    dadosCpuMediaArr.push(dadoMinuto.media_cpu_porcentagem || 0);
    dadosCpuFrequenciaArr.push(dadoMinuto.media_cpu_frequencia || 0);
    dadosRamMediaArr.push(dadoMinuto.media_ram_porcentagem || 0);
    dadosRamLivreArr.push(dadoMinuto.media_ram_disponivel || 0);
    dadosDiscoMediaArr.push(dadoMinuto.media_disco_porcentagem || 0);
    dadosDiscoLivreArr.push(dadoMinuto.media_disco_disponivel || 0);
    dadosDiscoEscritaArr.push(dadoMinuto.media_qtd_requisicao_escrita || 0);
    dadosDiscoLeituraArr.push(dadoMinuto.media_qtd_requisicao_leitura || 0);
    dadosRedeTxMediaArr.push(dadoMinuto.media_dados_enviados || 0);
    dadosRedeRxMediaArr.push(dadoMinuto.media_dados_recebidos || 0);
    dadosRedePerdidosArr.push(dadoMinuto.media_dados_perdidos || 0);
    dadosRedeTwArr.push(dadoMinuto.media_sockets_tw || 0);
  }

  return {
    labels: listaLabels.length > 0 ? listaLabels : ["00min"],
    dados: listaDados,
    cpu: dadosCpuArr,
    ram: dadosRamArr,
    swap: dadosSwapArr,
    disco: dadosDiscoArr,
    redeTrafego: dadosRedeTrafegoArr,
    redeTx: dadosRedeTxArr,
    redeRx: dadosRedeRxArr,
    cpuMedia: dadosCpuMediaArr,
    cpuFrequencia: dadosCpuFrequenciaArr,
    ramMedia: dadosRamMediaArr,
    ramLivre: dadosRamLivreArr,
    discoMedia: dadosDiscoMediaArr,
    discoLivre: dadosDiscoLivreArr,
    discoEscrita: dadosDiscoEscritaArr,
    discoLeitura: dadosDiscoLeituraArr,
    redeTxMedia: dadosRedeTxMediaArr,
    redeRxMedia: dadosRedeRxMediaArr,
    redePerdidos: dadosRedePerdidosArr,
    redeTw: dadosRedeTwArr,
  };
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

  await buscarMainframe();
  let mainframeDetalhado = await buscarParametrosMainframe();
  let parametros = mainframeDetalhado ? mainframeDetalhado.parametros : [];

  opcoesBotoesMonitoramento[indice].classList.add(
    "opcao-monitoramento-selecionada"
  );

  let historico = { 
    labels: [], 
    cpu: [], 
    ram: [], 
    swap: [], 
    disco: [] 
};

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
      let dadosCapturadosGeral = await puxarJsonS3("todos");
      historico = await carregarHistoricoHora("todos");

      if (!dadosCapturadosGeral && historico.dados.length > 0) {
        dadosCapturadosGeral = historico.dados[historico.dados.length - 1];
      }
      if (!dadosCapturadosGeral) return;

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
        mediaRede + " TB",
      ];

      dadosCpu = historico.cpu;
      dadosRam = historico.ram;
      dadosDisco = historico.disco;
      dadosSwap = historico.swap;

      for (let i = 0; i < titulosKpi.length; i++) {
        todasKpis += criarKPI(titulosKpi[i], dadosKpi[i], "...", classesKpi[i]);
      }

      sessaoKpis.innerHTML = todasKpis;

      tituloTabela.innerHTML = `
                <th>Data Hora</th>
                <th>CPU</th>
                <th>RAM</th>
                <th>Disco</th>
                <th>SWAP</th>
                <th>Dados Enviados</th>
                <th>Dados Recebidos</th>
                <th>Status</th>
            `;

      corpoTabela.innerHTML = historico.dados
        .map(
          (dado) => `
                <tr>
                    <td>${dado.hora_de_captura}</td>
                    <td>${dado.porcentagem_cpu}%</td>
                    <td>${dado.porcentagem_ram}%</td>
                    <td>${dado.porcentagem_disco}%</td>
                    <td>${dado.media_swap_porcentagem}%</td>
                    <td>${dado.dados_enviados_medio} TB</td>
                    <td>${dado.dados_recebidos_medio} TB</td>
                    <td>${statusMainframe.innerHTML}</td>
                </tr>    
            `
        )
        .join("");

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
      historico = await carregarHistoricoHora("rede");
      if (historico.dados.length === 0) return;

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
        obterMomentoMaisUtilizado(historico.dados),
        mediaTx + " TB",
        mediaRx + " TB",
        mediaPerdidos,
        mediaTw,
      ];

      for (let i = 0; i < titulosKpi.length; i++) {
        todasKpis += criarKPI(titulosKpi[i], dadosKpi[i], "...", classesKpi[i]);
      }

      sessaoKpis.innerHTML = todasKpis;

      tituloTabela.innerHTML = `
                <th>Data Hora</th>
                <th>Dados Enviados</th>
                <th>Dados Recebidos</th>
                <th>Pacotes Perdidos</th>
                <th>Sockets TIME_WAIT</th>
            `;

      corpoTabela.innerHTML = historico.dados
        .map(
          (dado) => `
                <tr>
                    <td>${dado.hora_de_captura}</td>
                    <td>${dado.media_dados_enviados} TB</td>
                    <td>${dado.media_dados_recebidos} TB</td>
                    <td>${dado.media_dados_perdidos}</td>
                    <td>${dado.media_sockets_tw}</td>
                </tr>    
            `
        )
        .join("");

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
      historico = await carregarHistoricoHora("cpu");
      if (historico.dados.length === 0) return;

      let parametroCpu = obterParametroPorTipo(parametros, "CPU");
      let mediaCpu = obterMedia(historico.cpuMedia);
      let mediaFrequencia = obterMedia(historico.cpuFrequencia);

      let classesKpi = [
        "",
        obterClasseParametro(mediaCpu, parametroCpu && parametroCpu.cpu_pct_min, parametroCpu && parametroCpu.cpu_pct_max),
        obterClasseParametro(mediaFrequencia, parametroCpu && parametroCpu.freq_min, parametroCpu && parametroCpu.freq_max),
      ];

      dadosKpi = [
        obterMomentoMaisUtilizado(historico.dados),
        mediaCpu + "%",
        mediaFrequencia + " GHz",
      ];

      for (let i = 0; i < titulosKpi.length; i++) {
        todasKpis += criarKPI(titulosKpi[i], dadosKpi[i], "...", classesKpi[i]);
      }

      sessaoKpis.innerHTML = todasKpis;

      tituloTabela.innerHTML = `
                <th>Data Hora</th>
                <th>CPU</th>
                <th>Frequência CPU</th>
            `;

      corpoTabela.innerHTML = historico.dados
        .map(
          (dado) => `
                <tr>
                    <td>${dado.hora_de_captura}</td>
                    <td>${dado.media_cpu_porcentagem}%</td>
                    <td>${dado.media_cpu_frequencia} GHz</td>
                </tr>    
            `
        )
        .join("");

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
      historico = await carregarHistoricoHora("ram");
      if (historico.dados.length === 0) return;

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
        obterMomentoMaisUtilizado(historico.dados),
        mediaRam + "%",
        mediaLivre + " GB",
        mediaSwap + "%",
      ];

      for (let i = 0; i < titulosKpi.length; i++) {
        todasKpis += criarKPI(titulosKpi[i], dadosKpi[i], "...", classesKpi[i]);
      }

      sessaoKpis.innerHTML = todasKpis;

      tituloTabela.innerHTML = `
                <th>Data Hora</th>
                <th>RAM</th>
                <th>SWAP</th>
                <th>RAM Disponível</th>
            `;

      corpoTabela.innerHTML = historico.dados
        .map(
          (dado) => `
                <tr>
                    <td>${dado.hora_de_captura}</td>
                    <td>${dado.media_ram_porcentagem}%</td>
                    <td>${dado.media_swap_porcentagem}%</td>
                    <td>${dado.media_ram_disponivel} GB</td>
                </tr>    
            `
        )
        .join("");

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
      historico = await carregarHistoricoHora("disco");
      if (historico.dados.length === 0) return;

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
        obterMomentoMaisUtilizado(historico.dados),
        mediaDisco + "%",
        mediaLivre + " GB",
        mediaEscrita,
        mediaLeitura,
      ];

      for (let i = 0; i < titulosKpi.length; i++) {
        todasKpis += criarKPI(titulosKpi[i], dadosKpi[i], "...", classesKpi[i]);
      }

      sessaoKpis.innerHTML = todasKpis;

      tituloTabela.innerHTML = `
                <th>Data Hora</th>
                <th>Disco</th>
                <th>Disco Disponível</th>
                <th>Dados Enviados</th>
                <th>Dados Recebidos</th>
            `;

      corpoTabela.innerHTML = historico.dados
        .map(
          (dado) => `
                <tr>
                    <td>${dado.hora_de_captura}</td>
                    <td>${dado.media_disco_porcentagem}%</td>
                    <td>${dado.media_disco_disponivel} GB</td>
                    <td>${dado.media_qtd_requisicao_escrita}</td>
                    <td>${dado.media_qtd_requisicao_leitura}</td>
                </tr>    
            `
        )
        .join("");

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

async function inicializarPagina() {
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

  trocarTempo(0);
  await trocarMonitoramento(0);
  setInterval(() => trocarMonitoramento(sessaoAtual), 60000);
}

inicializarPagina();