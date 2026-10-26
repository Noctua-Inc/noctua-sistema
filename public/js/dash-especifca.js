const idEmpresa = sessionStorage.getItem('idEmpresa');
const idMainframe = window.location.href.split('id_mainframe=')[1];

let kpiRisco = document.querySelector("#kpiRisco");
let kpiHorario = document.querySelector("#kpiHorario");
let kpiCPUPor = document.querySelector("#kpiCPUPor");
let kpiCPUFreq = document.querySelector("#kpiCPUFreq");
let kpiRAMPor = document.querySelector("#kpiRAMPor");
let kpiSWAPPor = document.querySelector("#kpiSWAPPor");
let kpiRAMUso = document.querySelector("#kpiRAMUso");
let kpiDiscoPor = document.querySelector("#kpiDiscoPor");
let kpiDiscoUso = document.querySelector("#kpiDiscoUso");
let corpoTabela = document.querySelector("#corpoTabela");
let estadoServidor = document.querySelector("#estadoServidor");

let observacaoCpu = document.querySelector("#observacaoCpu");
let observacaoCPUFrq = document.querySelector("#observacaoCPUFrq");
let observacaoRAM = document.querySelector("#observacaoRAM");
let observacaoSWAP = document.querySelector("#observacaoSWAP");
let observacaoRAMUso = document.querySelector("#observacaoRAMUso");
let observacaoDisco = document.querySelector("#observacaoDisco");
let observacaoDiscoUso = document.querySelector("#observacaoDiscoUso");

let nomeServidor = document.querySelector("#nomeServidor");

let opcoesBotoesTempo = document.querySelectorAll(".botao-tempo")

let intervaloTempo = ['05min', '10min', '15min', '20min', '25min', '30min', '35min', '40min', '45min', '50min', '55min', '60min'];

let agora = new Date();
let horas = String(agora.getHours()).padStart(2, '0');      
let minutos = String(agora.getMinutes()).padStart(2, '0');  
let segundos = String(agora.getSeconds()).padStart(2, '0');
let inicioCaptura = `${horas}:${minutos}:${segundos}`;

let dadosPorcentagemCPU = [];
let dadosPorcentagemRAM = [];
let dadosPorcentagemSWAP = [];
let dadosPorcentagemDisco = [];

let parametrosMainframe = 0; 
let componentesMainframe = [];

let ultimoCpu;
let ultimoCpuFreq;
let ultimoRam;
let ultimoRamUso;
let ultimoSwap;
let ultimoDisco;
let ultimoDiscoUso;

function trocarTempo(indice) {
    for(let i = 0; i < opcoesBotoesTempo.length; i++) {
        if(opcoesBotoesTempo[i].className == "botao-tempo botao-escolhido") {
            opcoesBotoesTempo[i].classList.remove("botao-escolhido");
            break;
        }
    }

    opcoesBotoesTempo[indice].classList.add("botao-escolhido");

    switch (indice) {
        case 0:
            intervaloTempo = ['05min', '10min', '15min', '20min', '25min', '30min', '35min', '40min', '45min', '50min', '55min', '60min']
            break;

        case 1:
            intervaloTempo = ['01h', '02h', '03h', '04h', '05h', '06h', '07h', '08h', '09h', '10h', '11h', '12h']
            break;

        case 2:
            intervaloTempo = ['02h', '04h', '06h', '08h', '10h', '12h', '14h', '16h', '18h', '20h', '22h', '24h']
            break;
        
        case 3:
            intervaloTempo = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
            break;
    
        default:
            break;
    }

    grafico.data.labels = intervaloTempo;
    grafico.update();
}

let discoUso = (Math.random() * (500 - 400) + 400).toFixed(0);
let discoPor = (Math.random() * (100 - 60) + 60).toFixed(0);

let quantidadeRiscos = 0;

setInterval(() => {
    let agora = new Date();
    let horas = String(agora.getHours()).padStart(2, '0');      
    let minutos = String(agora.getMinutes()).padStart(2, '0');  
    let segundos = String(agora.getSeconds()).padStart(2, '0');

    let formatandoData = `${horas}:${minutos}:${segundos}`;

    let porcentagemCpu = []
    let porcentagemRam = []
    let porcentagemSwap = []
    let porcentagemDisco = []

    let dadosPorcentagem = []
    let CPUFrequencia = Number((Math.random() * (6 - 4) + 4).toFixed(1));
    let RAMUso = Number((Math.random() * (6 - 4) + 4).toFixed(1));
    
    for (let i = 0; i < 3; i++) {
        let valorAleatorio = Number((Math.random() * (100 - 60) + 60).toFixed(0));
        dadosPorcentagem.push(valorAleatorio);
    }

    let cpuAtual = dadosPorcentagem[0];
    let ramAtual = dadosPorcentagem[1];
    let swapAtual = dadosPorcentagem[2];
    let discoAtual = Number(discoPor);
    let discoUsoAtual = Number(discoUso);

    function calcularVariacao(atual, anterior) {
        if (anterior === null) return "Primeira medição";
        let diferenca = atual - anterior;
        if (diferenca === 0) return "Se Manteve";
        let percentual = ((Math.abs(diferenca) / anterior) * 100).toFixed(1);
        return diferenca > 0 ? `Aumentou ${percentual}%` : `Diminuiu ${percentual}%`;
    }

    if (observacaoCpu) observacaoCpu.innerHTML = calcularVariacao(cpuAtual, ultimoCpu);
    if (observacaoCPUFrq) observacaoCPUFrq.innerHTML = calcularVariacao(CPUFrequencia, ultimoCpuFreq);
    if (observacaoRAM) observacaoRAM.innerHTML = calcularVariacao(ramAtual, ultimoRam);
    if (observacaoRAMUso) observacaoRAMUso.innerHTML = calcularVariacao(RAMUso, ultimoRamUso);
    if (observacaoSWAP) observacaoSWAP.innerHTML = calcularVariacao(swapAtual, ultimoSwap);
    if (observacaoDisco) observacaoDisco.innerHTML = calcularVariacao(discoAtual, ultimoDisco);
    if (observacaoDiscoUso) observacaoDiscoUso.innerHTML = calcularVariacao(discoUsoAtual, ultimoDiscoUso);

    ultimoCpu = cpuAtual;
    ultimoCpuFreq = CPUFrequencia;
    ultimoRam = ramAtual;
    ultimoRamUso = RAMUso;
    ultimoSwap = swapAtual;
    ultimoDisco = discoAtual;
    ultimoDiscoUso = discoUsoAtual;

    let somaValoresAtuais = 0;
    let quantidadeMonitorados = 0;

    let temCPU = componentesMainframe.includes("CPU");
    let temRAM = componentesMainframe.includes("RAM");
    let temSWAP = componentesMainframe.includes("SWAP");
    let temDisco = componentesMainframe.includes("Disco");

    if (temCPU) { somaValoresAtuais += cpuAtual; quantidadeMonitorados++; }
    if (temRAM) { somaValoresAtuais += ramAtual; quantidadeMonitorados++; }
    if (temSWAP) { somaValoresAtuais += swapAtual; quantidadeMonitorados++; }
    if (temDisco) { somaValoresAtuais += discoAtual; quantidadeMonitorados++; }

    let mediaMomento = quantidadeMonitorados > 0 ? (somaValoresAtuais / quantidadeMonitorados).toFixed(0) : 0;

    kpiHorario.innerHTML = formatandoData;
    kpiCPUPor.innerHTML = cpuAtual + "%";
    kpiCPUFreq.innerHTML = CPUFrequencia + " GHz";
    kpiRAMPor.innerHTML = ramAtual + "%";
    kpiRAMUso.innerHTML = RAMUso + " TB";
    kpiSWAPPor.innerHTML = swapAtual + "%";
    kpiDiscoPor.innerHTML = discoAtual + "%";
    kpiDiscoUso.innerHTML = discoUsoAtual + " PB";

    let totalExcedidos = 0;

    if (temCPU && cpuAtual > parametrosMainframe) { kpiCPUPor.classList.add("excedeu"); totalExcedidos++; }
    else if (temCPU) kpiCPUPor.classList.remove("excedeu");

    if (temRAM && ramAtual > parametrosMainframe) { kpiRAMPor.classList.add("excedeu"); totalExcedidos++; }
    else if (temRAM) kpiRAMPor.classList.remove("excedeu");

    if (temSWAP && swapAtual > parametrosMainframe) { kpiSWAPPor.classList.add("excedeu"); totalExcedidos++; }
    else if (temSWAP) kpiSWAPPor.classList.remove("excedeu");

    if (temDisco && discoAtual > parametrosMainframe) { kpiDiscoPor.classList.add("excedeu"); totalExcedidos++; }
    else if (temDisco) kpiDiscoPor.classList.remove("excedeu");

    if (totalExcedidos > 0) {
        quantidadeRiscos += totalExcedidos;
        kpiRisco.innerHTML = "Risco: " + quantidadeRiscos; 
        kpiRisco.classList.remove("excedeu");
    }

    let statusTabela = "Normal";
    estadoServidor.innerHTML = "Em Normal";
    estadoServidor.style.backgroundColor = "#E6F4EA";
    estadoServidor.style.color = "#137333";

    if (totalExcedidos == 1) {
        statusTabela = "Alerta";
        estadoServidor.innerHTML = "Em Alerta";
        estadoServidor.style.backgroundColor = "#FEF7E0";
        estadoServidor.style.color = "#B06000";
    } else if (totalExcedidos >= 2) {
        statusTabela = "Risco";
        estadoServidor.innerHTML = "Em Risco";
        estadoServidor.style.backgroundColor = "#FCE8E6";
        estadoServidor.style.color = "#C5221F";
    }

    let valorCpuTabela = temCPU ? `${cpuAtual}%` : "Não monitorado";
    let valorCpuFreqTabela = temCPU ? `${CPUFrequencia} GHz` : "Não monitorado";
    let valorRamPorTabela = temRAM ? `${ramAtual}%` : "Não monitorado";
    let valorRamUsoTabela = temRAM ? `${RAMUso} TB` : "Não monitorado";
    let valorSwapTabela = temSWAP ? `${swapAtual} %` : "Não monitorado";
    let valorDiscoPorTabela = temDisco ? `${discoAtual}%` : "Não monitorado";
    let valorDiscoUsoTabela = temDisco ? `${discoUsoAtual} PB` : "Não monitorado";

    adicinarTabela(formatandoData, valorCpuTabela, valorCpuFreqTabela, valorRamPorTabela, valorRamUsoTabela, valorSwapTabela, valorDiscoPorTabela, valorDiscoUsoTabela, statusTabela)

    if (temCPU) porcentagemCpu.push(cpuAtual);
    if (temRAM) porcentagemRam.push(ramAtual);
    if (temSWAP) porcentagemSwap.push(swapAtual);
    if (temDisco) porcentagemDisco.push(discoAtual);    

    if(Math.abs(inicioCaptura[7] - formatandoData[7]) >= 5) {
        inicioCaptura = formatandoData;

        let somaCpu = 0, somaRam = 0, somaSwap = 0, somaDisco = 0;

        if (temCPU && porcentagemCpu.length > 0) {
            for(let i = 0; i < porcentagemCpu.length; i++) somaCpu += porcentagemCpu[i];
            dadosPorcentagemCPU.push((somaCpu / porcentagemCpu.length).toFixed(0));
            grafico.data.datasets[0].data = dadosPorcentagemCPU;
        }

        if (temRAM && porcentagemRam.length > 0) {
            for(let i = 0; i < porcentagemRam.length; i++) somaRam += porcentagemRam[i];
            dadosPorcentagemRAM.push((somaRam / porcentagemRam.length).toFixed(0));
            grafico.data.datasets[1].data = dadosPorcentagemRAM;
        }

        if (temSWAP && porcentagemSwap.length > 0) {
            for(let i = 0; i < porcentagemSwap.length; i++) somaSwap += porcentagemSwap[i];
            dadosPorcentagemSWAP.push((somaSwap / porcentagemSwap.length).toFixed(0));
            grafico.data.datasets[2].data = dadosPorcentagemSWAP;
        }

        if (temDisco && porcentagemDisco.length > 0) {
            for(let i = 0; i < porcentagemDisco.length; i++) somaDisco += porcentagemDisco[i];
            dadosPorcentagemDisco.push((somaDisco / porcentagemDisco.length).toFixed(0));
            grafico.data.datasets[3].data = dadosPorcentagemDisco;
        }

        grafico.update();

        porcentagemCpu = []
        porcentagemRam = []
        porcentagemSwap = []
        porcentagemDisco = []
    }

}, 5000)

function adicinarTabela(dataHora, cpuPor, cpuFreq, ramPor, ramUso, swapPor, discoPor, discoUso, status) {
    let novaLinha = `
    <tr>
        <th>${dataHora}</th>
        <th>${cpuPor}</th>
        <th>${cpuFreq}</th>
        <th>${ramPor}</th>
        <th>${ramUso}</th>
        <th>${swapPor}</th>
        <th>${discoPor}</th>
        <th>${discoUso}</th>
        <th>${status}</th>
    </tr>
    `

    corpoTabela.innerHTML = novaLinha + corpoTabela.innerHTML;
}

async function buscarMainframe() {
    try {
        let resposta = await api.get(`/mainframe/idEmpresa/${idEmpresa}/idMainFrame/${idMainframe}`);
        let mainframe = resposta[0];
        
        trocarNome(mainframe.hostname);

        if (mainframe.parametros) {
            parametrosMainframe = mainframe.parametros;
        }

        if (mainframe.componentes) {
            componentesMainframe = mainframe.componentes;

            grafico.data.datasets[0].hidden = !componentesMainframe.includes("CPU");
            grafico.data.datasets[1].hidden = !componentesMainframe.includes("RAM");
            grafico.data.datasets[2].hidden = !componentesMainframe.includes("SWAP");
            grafico.data.datasets[3].hidden = !componentesMainframe.includes("DISCO");
            grafico.update();
        }

    } catch (erro) {
        console.error(erro);
    } finally {
        carregando = false;
    }
}

buscarMainframe()

async function trocarNome(nome) {
    nomeServidor.innerHTML += nome;
}

const ctx = document.getElementById('grafico').getContext('2d');

const grafico = new Chart(ctx, {
    type: 'line',
    data: {
        labels: intervaloTempo,
        datasets: [
            {
                label: 'CPU',
                data: dadosPorcentagemCPU,
                borderColor: '#2196F3',
                backgroundColor: '#2196F3',
                borderWidth: 2,
                tension: 0.4,
                fill: false
            },
            {
                label: 'RAM',
                data: dadosPorcentagemRAM,
                borderColor: '#4CAF50',
                backgroundColor: '#4CAF50',
                borderWidth: 2,
                tension: 0.4,
                fill: false
            },
            {
                label: 'SWAP',
                data: dadosPorcentagemSWAP,
                borderColor: '#9C27B0',
                backgroundColor: '#9C27B0',
                borderWidth: 2,
                tension: 0.4,
                fill: false
            },
            {
                label: 'Disco',
                data: dadosPorcentagemDisco,
                borderColor: '#FF9800',
                backgroundColor: '#FF9800',
                borderWidth: 2,
                tension: 0.4,
                fill: false
            }
        ]
    },
    options: {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    boxWidth: 12,
                    usePointStyle: true,
                    padding: 25,
                    boxPadding: 8
                }
            }
        },
        scales: {
            y: {
                min: 0,
                max: 100,
                ticks: {
                    callback: function(value) {
                        return value + '%';
                    }
                },
                grid: {
                    color: '#eee'
                }
            },
            x: {
                grid: {
                    display: false
                }
            }
        }
    }
});