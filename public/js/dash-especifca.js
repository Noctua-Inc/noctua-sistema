const ID_EMPRESA = sessionStorage.getItem('idEmpresa');
const ID_MAINFRAME = window.location.href.split('id_mainframe=')[1];
const CAMINHO_BASE_MONITORAMENTO = '/api/gold/empresa/' + ID_EMPRESA + '/monitoramentoComponentes/';

let nomeMainframeHTML = document.querySelector("#nomeMainframe");
let opcoesBotoesMonitoramento = document.querySelectorAll(".opcao-monitoramento");
let sessaoKpis = document.querySelector("#sessaoKpis");
let opcoesBotoesTempo = document.querySelectorAll(".opcao-tempo")

async function buscarMainframe() {
    try {
        let resposta = await api.get(`/mainframe/idEmpresa/${ID_EMPRESA}/idMainFrame/${ID_MAINFRAME}`);
        let mainframe = resposta[0];
        
        nomeMainframe.innerHTML = mainframe.hostname;

        return mainframe.hostname;

    } catch (erro) {
        console.error(erro);
    } finally {
        carregando = false;
    }
}

buscarMainframe();

function criarKPI (titulo, dado, observacao) {
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
    registros = null;

    try {
        let nomeMainframe = await buscarMainframe(); 

        const horarioAtual = new Date();

        let ano = horarioAtual.getFullYear();
        let mes = String(horarioAtual.getMonth() + 1).padStart(2, '0');
        let dia = String(horarioAtual.getDate()).padStart(2, '0');

        let hora = String(horarioAtual.getHours()).padStart(2, '0');
        let minuto = String(horarioAtual.getMinutes()).padStart(2, '0');

        // let dataHoraFormatado = `${ano}-${mes}-${dia}_${hora}-${minuto}`
        let dataHoraFormatado = `2026-11-06_19-02`

        let nomeArquivo = encodeURIComponent(`${nomeMainframe}_${dataHoraFormatado}_${quaisRegistros}_registros.json`);        

        let caminho = CAMINHO_BASE_MONITORAMENTO + nomeArquivo;
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

async function trocarMonitoramento(indice) {
    let titulosKpi = [];
    let todasKpis = "";

    for(let i = 0; i < opcoesBotoesMonitoramento.length; i++) {
        if(opcoesBotoesMonitoramento[i].className == "opcao-monitoramento opcao-monitoramento-selecionada") {
            opcoesBotoesMonitoramento[i].classList.remove("opcao-monitoramento-selecionada");
            break;
        }
    }

    opcoesBotoesMonitoramento[indice].classList.add("opcao-monitoramento-selecionada");

    switch (indice) {
        case 0:
            titulosKpi = ["Status de Risco", "Momento mais utilizado", "Uso Médio CPU", "Uso Médio RAM", "Uso Médio Disco", "Tráfego de Rede (Tx/Rx)"];
            let [dadosCapturados] = await puxarJsonS3("todos");
            dadosKpi = ["", dadosCapturados.estatisticas.horario_pico, dadosCapturados.estatisticas.media_cpu_porcentagem + "%", dadosCapturados.estatisticas.media_ram_porcentagem + "%", dadosCapturados.estatisticas.media_disco_porcentagem + "%", dadosCapturados.estatisticas.media_dados_enviados]

            for (let i = 0; i < titulosKpi.length; i++) {
                todasKpis += criarKPI(titulosKpi[i], dadosKpi[i], "...");
            }

            sessaoKpis.innerHTML = todasKpis;  

            break;

        case 1:
            titulosKpi = ["Momento mais utilizado", "Dados Enviados (Tx)", "Dados Recebidos (Rx)", "Erros Pacotes Entrada (errin)", "Sockets TIME_WAIT"];

            for(let titulo of titulosKpi) {
                todasKpis += criarKPI(titulo, "...", "...");
            }

            sessaoKpis.innerHTML = todasKpis;
            break;

        case 2:
            titulosKpi = ["Momento mais utilizado", "Uso Médio CPU", "Frequência Média CPU"];

            for(let titulo of titulosKpi) {
                todasKpis += criarKPI(titulo, "...", "...");
            }

            sessaoKpis.innerHTML = todasKpis;
            break;

        case 3:
            titulosKpi = ["Momento mais utilizado", "Uso Média RAM", "GB Livre RAM", "Uso Médio SWAP"];

            for(let titulo of titulosKpi) {
                todasKpis += criarKPI(titulo, "...", "...");
            }

            sessaoKpis.innerHTML = todasKpis;
            break;

        case 4:
            titulosKpi = ["Momento mais utilizado", "Uso Média Disco", "GB Livre Disco", "Quantidade requisição (Escrita)", "Quantidade requisição (Leitura)"];

            for(let titulo of titulosKpi) {
                todasKpis += criarKPI(titulo, "...", "...");
            }

            sessaoKpis.innerHTML = todasKpis;
            break;
    }
}

trocarMonitoramento(0);

function trocarTempo(indice) {
    for(let i = 0; i < opcoesBotoesTempo.length; i++) {
        if(opcoesBotoesTempo[i].className == "opcao-tempo opcao-tempo-selecionada") {
            opcoesBotoesTempo[i].classList.remove("opcao-tempo-selecionada");
            break;
        }
    }

    opcoesBotoesTempo[indice].classList.add("opcao-tempo-selecionada");

    // switch (indice) {
    //     case 0:
    //         intervaloTempo = ['05min', '10min', '15min', '20min', '25min', '30min', '35min', '40min', '45min', '50min', '55min', '60min']
    //         break;

    //     case 1:
    //         intervaloTempo = ['01h', '02h', '03h', '04h', '05h', '06h', '07h', '08h', '09h', '10h', '11h', '12h']
    //         break;

    //     case 2:
    //         intervaloTempo = ['02h', '04h', '06h', '08h', '10h', '12h', '14h', '16h', '18h', '20h', '22h', '24h']
    //         break;
        
    //     case 3:
    //         intervaloTempo = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
    //         break;
    
    //     default:
    //         break;
    // }

    // grafico.data.labels = intervaloTempo;
    // grafico.update();
}


const ctx = document.getElementById('grafico').getContext('2d');

/*
    A ideia do intervalo de Tempo será a mesma que na sprint passada (qualquer coisa pegar código no diretório 'sprint-2')
    agora, a ideia de como será a criação de cada "ponto" no gráfico, seria utilizando o 'datasets', já que ele aceita vetor, posso criar um vetor
    e dependento da escolha do usuário, pode ficar modificando ele.
*/

// const grafico = new Chart(ctx, {
//     type: 'line',
//     data: {
//         labels: intervaloTempo,
//         datasets: [
//             {
//                 label: 'CPU',
//                 data: dadosPorcentagemCPU,
//                 borderColor: '#2196F3',
//                 backgroundColor: '#2196F3',
//                 borderWidth: 2,
//                 tension: 0.4,
//                 fill: false
//             },
//             {
//                 label: 'RAM',
//                 data: dadosPorcentagemRAM,
//                 borderColor: '#4CAF50',
//                 backgroundColor: '#4CAF50',
//                 borderWidth: 2,
//                 tension: 0.4,
//                 fill: false
//             },
//             {
//                 label: 'SWAP',
//                 data: dadosPorcentagemSWAP,
//                 borderColor: '#9C27B0',
//                 backgroundColor: '#9C27B0',
//                 borderWidth: 2,
//                 tension: 0.4,
//                 fill: false
//             },
//             {
//                 label: 'Disco',
//                 data: dadosPorcentagemDisco,
//                 borderColor: '#FF9800',
//                 backgroundColor: '#FF9800',
//                 borderWidth: 2,
//                 tension: 0.4,
//                 fill: false
//             }
//         ]
//     },
//     options: {
//         responsive: true,
//         plugins: {
//             legend: {
//                 position: 'top',
//                 labels: {
//                     boxWidth: 12,
//                     usePointStyle: true,
//                     padding: 25,
//                     boxPadding: 8
//                 }
//             }
//         },
//         scales: {
//             y: {
//                 min: 0,
//                 max: 100,
//                 ticks: {
//                     callback: function(value) {
//                         return value + '%';
//                     }
//                 },
//                 grid: {
//                     color: '#eee'
//                 }
//             },
//             x: {
//                 grid: {
//                     display: false
//                 }
//             }
//         }
//     }
// });