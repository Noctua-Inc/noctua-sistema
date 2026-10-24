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


setInterval(() => {
    let agora = new Date();
    let horas = String(agora.getHours()).padStart(2, '0');      
    let minutos = String(agora.getMinutes()).padStart(2, '0');  
    let segundos = String(agora.getSeconds()).padStart(2, '0');

    
    let porcentagemCpu = []
    let porcentagemRam = []
    let porcentagemSwap = []
    let porcentagemDisco = []
    let datasHoras = []
    
    let formatandoData = `${horas}:${minutos}:${segundos}`;

    datasHoras.push(formatandoData)

    let dadosPorcentagem = []
    let CPUFrequencia = (Math.random() * (6 - 4) + 4).toFixed(1);
    let RAMUso = (Math.random() * (6 - 4) + 4).toFixed(1);
    

    for (let i = 0; i < 3; i++) {
        let valorAleatorio = (Math.random() * (100 - 60) + 60).toFixed(0);

        dadosPorcentagem.push(valorAleatorio);
    }
    
    adicinarTabela(formatandoData, dadosPorcentagem[0], CPUFrequencia, dadosPorcentagem[1], RAMUso, dadosPorcentagem[2], discoPor, discoUso)

    porcentagemCpu.push(dadosPorcentagem[0]);
    porcentagemRam.push(dadosPorcentagem[1]);
    porcentagemSwap.push(dadosPorcentagem[2]);
    porcentagemDisco.push(dadosPorcentagem[3]);

    if(Math.abs(inicioCaptura.slice(6, 8) - formatandoData.slice(6, 8)) >= 10) {
        inicioCaptura = formatandoData;

        let somaCpu = 0;
        let somaRam = 0;
        let somaSwap = 0;
        let somaDisco = 0;
        for(let i = 0; i < porcentagemCpu.length; i++) {
            somaCpu += porcentagemCpu[i];
            somaRam += porcentagemRam[i];
            somaSwap += porcentagemSwap[i];
            somaDisco += porcentagemDisco[i];
        }

        dadosPorcentagemCPU.push((somaCpu / porcentagemCpu.length).toFixed(0));
        dadosPorcentagemRAM.push((somaRam / porcentagemRam.length).toFixed(0));
        dadosPorcentagemSWAP.push((somaSwap / porcentagemSwap.length).toFixed(0));
        dadosPorcentagemDisco.push((somaDisco / porcentagemDisco.length).toFixed(0));

        grafico.data.datasets[0].data = dadosPorcentagemCPU;
        grafico.data.datasets[1].data = dadosPorcentagemRAM;
        grafico.data.datasets[2].data = dadosPorcentagemSWAP;
        grafico.data.datasets[3].data = dadosPorcentagemDisco;
        grafico.update();

        porcentagemCpu = []
        porcentagemRam = []
        porcentagemSwap = []
        porcentagemDisco = []
    }

}, 5000)

function adicinarTabela(dataHora, cpuPor, cpuFreq, ramPor, ramUso, swapPor, discoPor, discoUso) {
    let novaLinha = `
    <tr>
        <th>${dataHora}</th>
        <th>${cpuPor}%</th>
        <th>${cpuFreq} GHz</th>
        <th>${ramPor}%</th>
        <th>${ramUso} TB</th>
        <th>${swapPor} %</th>
        <th>${discoPor}%</th>
        <th>${discoUso} PB</th>
        <th>${"a"}</th>
    </tr>
    `

    corpoTabela.innerHTML = novaLinha + corpoTabela.innerHTML;
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