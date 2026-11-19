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
let statusRisco = 0;
let nomeMainframeGlobal = "";
let ultimaMediaComponentes = 0;
let momentoMaisUtilizadoCache = "--";

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

function criarKPI(titulo, dado, observacao) {
  let kpi = `
    <div class="kpi">
        <p class="texto-kpi">${titulo}</p>
        <h3 class="dado-kpi">${dado}</h3>
        <p class="texto-kpi">${observacao}</p>
    </div>
    `;

  return kpi;
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

    // let dataHoraFormatado = `${ano}-${mes}-${dia}_${hora}-${minuto}`
    let dataHoraFormatado = `2026-11-11_10-38`;

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

          if (quaisRegistros === "todos") {
            dadosCpuArr.push(dadoMinuto.porcentagem_cpu || 0);
            dadosRamArr.push(dadoMinuto.porcentagem_ram || 0);
            dadosSwapArr.push(dadoMinuto.media_swap_porcentagem || 0);
            dadosDiscoArr.push(dadoMinuto.porcentagem_disco || 0);
          } else if (quaisRegistros === "cpu") {
            dadosCpuArr.push(dadoMinuto.media_cpu_porcentagem || 0);
          } else if (quaisRegistros === "ram") {
            dadosRamArr.push(dadoMinuto.media_ram_porcentagem || 0);
          } else if (quaisRegistros === "disco") {
            dadosDiscoArr.push(dadoMinuto.media_disco_porcentagem || 0);
          } else if (quaisRegistros === "rede") {
            dadosCpuArr.push(dadoMinuto.media_dados_enviados || 0);
          }
        }
      } catch (err) {}
    }
  } catch (erro) {
    console.error("Erro ao carregar histórico:", erro);
  }

  return {
    labels: listaLabels.length > 0 ? listaLabels : ["00min"],
    cpu: dadosCpuArr,
    ram: dadosRamArr,
    swap: dadosSwapArr,
    disco: dadosDiscoArr,
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
    case 0:
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

      if (!dadosCapturadosGeral) return;

      let parametros = mainframeDetalhado ? mainframeDetalhado.parametros : [];
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

      let mediaAtualGeral =
        (dadosCapturadosGeral.porcentagem_cpu +
          dadosCapturadosGeral.porcentagem_ram +
          dadosCapturadosGeral.porcentagem_disco) /
        3;
      if (mediaAtualGeral > ultimaMediaComponentes) {
        ultimaMediaComponentes = mediaAtualGeral;
        momentoMaisUtilizadoCache = dadosCapturadosGeral.hora_de_captura;
      }

      dadosKpi = [
        statusRisco,
        momentoMaisUtilizadoCache,
        dadosCapturadosGeral.porcentagem_cpu + "%",
        dadosCapturadosGeral.porcentagem_ram + "%",
        dadosCapturadosGeral.porcentagem_disco + "%",
        dadosCapturadosGeral.media_trafego_rede + " TB",
      ];

      dadosCpu = historico.cpu;
      dadosRam = historico.ram;
      dadosDisco = historico.disco;
      dadosSwap = historico.swap;

      for (let i = 0; i < titulosKpi.length; i++) {
        todasKpis += criarKPI(titulosKpi[i], dadosKpi[i], "...");
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

      corpoTabela.innerHTML = `
                <tr>
                    <td>${dadosCapturadosGeral.hora_de_captura}</td>
                    <td>${dadosCapturadosGeral.porcentagem_cpu}%</td>
                    <td>${dadosCapturadosGeral.porcentagem_ram}%</td>
                    <td>${dadosCapturadosGeral.porcentagem_disco}%</td>
                    <td>${dadosCapturadosGeral.media_swap_porcentagem}%</td>
                    <td>${dadosCapturadosGeral.dados_enviados_medio} TB</td>
                    <td>${dadosCapturadosGeral.dados_recebidos_medio} TB</td>
                    <td>${statusMainframe.innerHTML}</td>
                </tr>    
            `;

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
        grafico.update();
      }
      break;

    case 1:
      titulosKpi = [
        "Momento mais utilizado",
        "Dados Enviados (Tx)",
        "Dados Recebidos (Rx)",
        "Erros Pacotes Entrada (errin)",
        "Sockets TIME_WAIT",
      ];
      let dadosCapturadosRede = await puxarJsonS3("rede");
      if (!dadosCapturadosRede) return;

      let mediaAtualRede =
        (dadosCapturadosRede.media_dados_enviados +
          dadosCapturadosRede.media_dados_recebidos) /
        2;
      if (mediaAtualRede > ultimaMediaComponentes) {
        ultimaMediaComponentes = mediaAtualRede;
        momentoMaisUtilizadoCache = dadosCapturadosRede.hora_de_captura;
      }

      dadosKpi = [
        momentoMaisUtilizadoCache,
        dadosCapturadosRede.media_dados_enviados + " TB",
        dadosCapturadosRede.media_dados_recebidos + " TB",
        dadosCapturadosRede.media_dados_perdidos,
        dadosCapturadosRede.media_sockets_tw,
      ];

      for (let i = 0; i < titulosKpi.length; i++) {
        todasKpis += criarKPI(titulosKpi[i], dadosKpi[i], "...");
      }

      sessaoKpis.innerHTML = todasKpis;

      tituloTabela.innerHTML = `
                <th>Data Hora</th>
                <th>Dados Enviados</th>
                <th>Dados Recebidos</th>
                <th>Pacotes Perdidos</th>
                <th>Sockets TIME_WAIT</th>
            `;

      corpoTabela.innerHTML = `
                <tr>
                    <td>${dadosCapturadosRede.hora_de_captura}</td>
                    <td>${dadosCapturadosRede.media_dados_enviados} TB</td>
                    <td>${dadosCapturadosRede.media_dados_recebidos} TB</td>
                    <td>${dadosCapturadosRede.media_dados_perdidos}</td>
                    <td>${dadosCapturadosRede.media_sockets_tw}</td>
                </tr>    
            `;

      if (grafico) {
        grafico.data.datasets = [
          {
            label: "Tx (Enviados)",
            data: [dadosCapturadosRede.media_dados_enviados],
            borderColor: "#00BCD4",
            backgroundColor: "#00BCD4",
            borderWidth: 2,
            tension: 0.4,
            fill: false,
          },
          {
            label: "Rx (Recebidos)",
            data: [dadosCapturadosRede.media_dados_recebidos],
            borderColor: "#E91E63",
            backgroundColor: "#E91E63",
            borderWidth: 2,
            tension: 0.4,
            fill: false,
          },
        ];
        grafico.update();
      }
      break;

    case 2:
      titulosKpi = [
        "Momento mais utilizado",
        "Uso Médio CPU",
        "Frequência Média CPU",
      ];
      let dadosCapturadosCpu = await puxarJsonS3("cpu");
      if (!dadosCapturadosCpu) return;

      if (dadosCapturadosCpu.media_cpu_porcentagem > ultimaMediaComponentes) {
        ultimaMediaComponentes = dadosCapturadosCpu.media_cpu_porcentagem;
        momentoMaisUtilizadoCache = dadosCapturadosCpu.hora_de_captura;
      }

      dadosKpi = [
        momentoMaisUtilizadoCache,
        dadosCapturadosCpu.media_cpu_porcentagem + "%",
        dadosCapturadosCpu.media_cpu_frequencia + " GHz",
      ];

      for (let i = 0; i < titulosKpi.length; i++) {
        todasKpis += criarKPI(titulosKpi[i], dadosKpi[i], "...");
      }

      sessaoKpis.innerHTML = todasKpis;

      tituloTabela.innerHTML = `
                <th>Data Hora</th>
                <th>CPU</th>
                <th>Frequência CPU</th>
            `;

      corpoTabela.innerHTML = `
                <tr>
                    <td>${dadosCapturadosCpu.hora_de_captura}</td>
                    <td>${dadosCapturadosCpu.media_cpu_porcentagem}%</td>
                    <td>${dadosCapturadosCpu.media_cpu_frequencia} GHz</td>
                </tr>    
            `;

      if (grafico) {
        grafico.data.datasets = [
          {
            label: "CPU %",
            data: [dadosCapturadosCpu.media_cpu_porcentagem],
            borderColor: "#2196F3",
            backgroundColor: "#2196F3",
            borderWidth: 2,
            tension: 0.4,
            fill: false,
          },
        ];
        grafico.update();
      }
      break;

    case 3:
      titulosKpi = [
        "Momento mais utilizado",
        "Uso Média RAM",
        "GB Livre RAM",
        "Uso Médio SWAP",
      ];
      let dadosCapturadosRam = await puxarJsonS3("ram");
      if (!dadosCapturadosRam) return;

      if (dadosCapturadosRam.media_ram_porcentagem > ultimaMediaComponentes) {
        ultimaMediaComponentes = dadosCapturadosRam.media_ram_porcentagem;
        momentoMaisUtilizadoCache = dadosCapturadosRam.hora_de_captura;
      }

      dadosKpi = [
        momentoMaisUtilizadoCache,
        dadosCapturadosRam.media_ram_porcentagem + "%",
        dadosCapturadosRam.media_swap_porcentagem + "%",
        dadosCapturadosRam.media_ram_disponivel + " GB",
      ];

      for (let i = 0; i < titulosKpi.length; i++) {
        todasKpis += criarKPI(titulosKpi[i], dadosKpi[i], "...");
      }

      sessaoKpis.innerHTML = todasKpis;

      tituloTabela.innerHTML = `
                <th>Data Hora</th>
                <th>RAM</th>
                <th>SWAP</th>
                <th>RAM Disponível</th>
            `;

      corpoTabela.innerHTML = `
                <tr>
                    <td>${dadosCapturadosRam.hora_de_captura}</td>
                    <td>${dadosCapturadosRam.media_ram_porcentagem}%</td>
                    <td>${dadosCapturadosRam.media_swap_porcentagem}%</td>
                    <td>${dadosCapturadosRam.media_ram_disponivel} GB</td>
                </tr>    
            `;

      if (grafico) {
        grafico.data.datasets = [
          {
            label: "RAM %",
            data: [dadosCapturadosRam.media_ram_porcentagem],
            borderColor: "#4CAF50",
            backgroundColor: "#4CAF50",
            borderWidth: 2,
            tension: 0.4,
            fill: false,
          },
          {
            label: "SWAP %",
            data: [dadosCapturadosRam.media_swap_porcentagem],
            borderColor: "#9C27B0",
            backgroundColor: "#9C27B0",
            borderWidth: 2,
            tension: 0.4,
            fill: false,
          },
        ];
        grafico.update();
      }
      break;

    case 4:
      titulosKpi = [
        "Momento mais utilizado",
        "Uso Média Disco",
        "GB Livre Disco",
        "Quantidade requisição (Escrita)",
        "Quantidade requisição (Leitura)",
      ];
      let dadosCapturadosDisco = await puxarJsonS3("disco");
      if (!dadosCapturadosDisco) return;

      if (dadosCapturadosDisco.media_disco_porcentagem > ultimaMediaComponentes) {
        ultimaMediaComponentes = dadosCapturadosDisco.media_disco_porcentagem;
        momentoMaisUtilizadoCache = dadosCapturadosDisco.hora_de_captura;
      }

      dadosKpi = [
        momentoMaisUtilizadoCache,
        dadosCapturadosDisco.media_disco_porcentagem + "%",
        dadosCapturadosDisco.media_disco_disponivel + " GB",
        dadosCapturadosDisco.media_qtd_requisicao_escrita,
        dadosCapturadosDisco.media_qtd_requisicao_leitura,
      ];

      for (let i = 0; i < titulosKpi.length; i++) {
        todasKpis += criarKPI(titulosKpi[i], dadosKpi[i], "...");
      }

      sessaoKpis.innerHTML = todasKpis;

      tituloTabela.innerHTML = `
                <th>Data Hora</th>
                <th>Disco</th>
                <th>Disco Disponível</th>
                <th>Dados Enviados</th>
                <th>Dados Recebidos</th>
            `;

      corpoTabela.innerHTML = `
                <tr>
                    <td>${dadosCapturadosDisco.hora_de_captura}</td>
                    <td>${dadosCapturadosDisco.media_disco_porcentagem}%</td>
                    <td>${dadosCapturadosDisco.media_disco_disponivel} GB</td>
                    <td>${dadosCapturadosDisco.media_qtd_requisicao_escrita}</td>
                    <td>${dadosCapturadosDisco.media_qtd_requisicao_leitura}</td>
                </tr>    
            `;

      if (grafico) {
        grafico.data.datasets = [
          {
            label: "Disco %",
            data: [dadosCapturadosDisco.media_disco_porcentagem],
            borderColor: "#FF9800",
            backgroundColor: "#FF9800",
            borderWidth: 2,
            tension: 0.4,
            fill: false,
          },
        ];
        grafico.update();
      }
      break;
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
}

inicializarPagina();