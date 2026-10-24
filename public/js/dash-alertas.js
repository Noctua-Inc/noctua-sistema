// Controle dos filtros, indicadores, gráficos e histórico de alertas.
let paginaAtual = 1;
let statusSelecionado = 'todos';
let alertasDoPeriodo = [];
let alertasAtivos = [];
let resolvidosDoPeriodo = [];
let graficoFluxo;
let graficoComponentes;
let graficoTempo;

const agora = new Date(DADOS_DASHBOARD.atualizadoEm).getTime();
const umaHora = 60 * 60 * 1000;
const itensPorPagina = 5;
const nomesSeveridade = { critica: 'Crítica', alta: 'Alta', moderada: 'Moderada' };
const nomesStatus = { aberto: 'Aberto', investigacao: 'Em investigação', resolvido: 'Resolvido' };
const nomesComponentes = { RAM: 'RAM', CPU: 'CPU', DISCO: 'Disco', SWAP: 'Swap' };

const campoPeriodo = document.getElementById('filtro-periodo');
const campoLocalizacao = document.getElementById('filtro-localizacao');
const campoMainframe = document.getElementById('filtro-mainframe');
const campoBusca = document.getElementById('busca-mainframe');
const campoSeveridade = document.getElementById('filtro-severidade');
const campoComponente = document.getElementById('filtro-componente');
const botoesStatus = document.querySelectorAll('.alertas-abas button');

function escreverNaTela(idElemento, texto) {
    document.getElementById(idElemento).innerText = texto;
}

function formatarData(data) {
    return data.substring(8, 10) + '/' + data.substring(5, 7) + ' · ' + data.substring(11, 16);
}

function formatarTempo(minutos) {
    if (minutos < 60) return minutos + ' min';
    let horas = Math.floor(minutos / 60);
    let resto = minutos % 60;
    if (resto == 0) return horas + ' h';
    return horas + ' h ' + resto + ' min';
}

function calcularMinutos(alerta) {
    let fim = agora;
    if (alerta.status == 'resolvido') fim = new Date(alerta.resolvidoEm).getTime();
    let inicio = new Date(alerta.inicio).getTime();
    return Math.ceil((fim - inicio) / 60000);
}

function buscarLocalizacao(hostname) {
    for (let i = 0; i < DADOS_DASHBOARD.mainframes.length; i++) {
        if (DADOS_DASHBOARD.mainframes[i].hostname == hostname) {
            return DADOS_DASHBOARD.mainframes[i].localizacao;
        }
    }
    return '';
}

function preencherLocalizacoes() {
    let opcoes = '<option value="">Todas as localidades</option>';
    for (let i = 0; i < DADOS_DASHBOARD.localizacoes.length; i++) {
        let local = DADOS_DASHBOARD.localizacoes[i];
        opcoes += '<option value="' + local + '">' + local + '</option>';
    }
    campoLocalizacao.innerHTML = opcoes;
}

function preencherMainframes() {
    let escolhidoAntes = campoMainframe.value;
    let aindaExiste = false;
    let opcoes = '<option value="">Todos os mainframes</option>';

    for (let i = 0; i < DADOS_DASHBOARD.mainframes.length; i++) {
        let mainframe = DADOS_DASHBOARD.mainframes[i];
        if (campoLocalizacao.value == '' || mainframe.localizacao == campoLocalizacao.value) {
            opcoes += '<option value="' + mainframe.hostname + '">' + mainframe.hostname + '</option>';
            if (mainframe.hostname == escolhidoAntes) aindaExiste = true;
        }
    }

    campoMainframe.innerHTML = opcoes;
    if (aindaExiste) campoMainframe.value = escolhidoAntes;
}

function criarGraficos() {
    if (typeof Chart == 'undefined') {
        document.getElementById('erro-graficos').hidden = false;
        return;
    }

    graficoFluxo = new Chart(document.getElementById('grafico-fluxo'), {
        type: 'bar',
        data: {
            labels: [],
            datasets: [
                { label: 'Abertos', data: [], backgroundColor: '#1a1f71' },
                { label: 'Resolvidos', data: [], backgroundColor: '#16afb5' }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { grid: { display: false }, ticks: { maxRotation: 0 } },
                y: { beginAtZero: true, ticks: { precision: 0 }, title: { display: true, text: 'Alertas' } }
            }
        }
    });

    graficoComponentes = new Chart(document.getElementById('grafico-componentes'), {
        type: 'bar',
        data: {
            labels: ['RAM', 'CPU', 'Disco', 'Swap'],
            datasets: [{ label: 'Alertas', data: [0, 0, 0, 0], backgroundColor: ['#3b479e', '#677acc', '#98a8e5', '#ced6f4'] }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { beginAtZero: true, ticks: { precision: 0 } },
                y: { grid: { display: false } }
            }
        }
    });

    graficoTempo = new Chart(document.getElementById('grafico-tempo'), {
        type: 'bar',
        data: {
            labels: ['Até 15 min', '16–30 min', '31–60 min', '> 60 min'],
            datasets: [
                { label: 'Crítica', data: [0, 0, 0, 0], backgroundColor: '#e62f51' },
                { label: 'Alta', data: [0, 0, 0, 0], backgroundColor: '#ff8b38' },
                { label: 'Moderada', data: [0, 0, 0, 0], backgroundColor: '#ffd364' }
            ]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { stacked: true, beginAtZero: true, ticks: { precision: 0 }, title: { display: true, text: 'Alertas' } },
                y: { stacked: true, grid: { display: false } }
            }
        }
    });
}

// Localização e mainframe são filtros gerais da página.
function correspondeAosFiltros(hostname) {
    if (campoMainframe.value != '' && hostname != campoMainframe.value) return false;
    if (campoLocalizacao.value != '' && buscarLocalizacao(hostname) != campoLocalizacao.value) return false;
    return true;
}

function separarAlertas() {
    const inicioPeriodo = agora - Number(campoPeriodo.value) * umaHora;
    alertasDoPeriodo = [];
    alertasAtivos = [];
    resolvidosDoPeriodo = [];

    for (const alerta of DADOS_DASHBOARD.alertas) {
        if (!correspondeAosFiltros(alerta.mainframe)) continue;
        const inicio = new Date(alerta.inicio).getTime();
        if (inicio > agora) continue;

        if (inicio >= inicioPeriodo) alertasDoPeriodo.push(alerta);

        // Uma pendência continua ativa mesmo quando começou antes do período escolhido.
        if (alerta.status != 'resolvido') {
            alertasAtivos.push(alerta);
        } else {
            const fim = new Date(alerta.resolvidoEm).getTime();
            if (fim >= inicioPeriodo && fim <= agora) resolvidosDoPeriodo.push(alerta);
        }
    }
}

function atualizarIndicadores() {
    let totalMonitorados = 0;
    for (const mainframe of DADOS_DASHBOARD.mainframes) {
        if (correspondeAosFiltros(mainframe.hostname)) totalMonitorados++;
    }

    const mainframesComAlertas = [];
    for (const alerta of alertasAtivos) {
        if (!mainframesComAlertas.includes(alerta.mainframe)) {
            mainframesComAlertas.push(alerta.mainframe);
        }
    }

    let somaMinutos = 0;
    for (const alerta of resolvidosDoPeriodo) {
        const inicio = new Date(alerta.inicio).getTime();
        const fim = new Date(alerta.resolvidoEm).getTime();
        somaMinutos += (fim - inicio) / 60000;
    }

    let totalReincidentes = 0;
    for (const alerta of alertasDoPeriodo) {
        if (alerta.reincidente) totalReincidentes++;
    }

    escreverNaTela('kpi-ativos', alertasAtivos.length);
    escreverNaTela('kpi-mainframes', mainframesComAlertas.length + ' / ' + totalMonitorados);
    escreverNaTela('kpi-resolucao', '—');
    escreverNaTela('kpi-reincidencia', '—');
    if (resolvidosDoPeriodo.length > 0) {
        const mediaMinutos = Math.round(somaMinutos / resolvidosDoPeriodo.length);
        escreverNaTela('kpi-resolucao', formatarTempo(mediaMinutos));
    }
    if (alertasDoPeriodo.length > 0) {
        const percentual = totalReincidentes / alertasDoPeriodo.length * 100;
        escreverNaTela('kpi-reincidencia', percentual.toFixed(1).replace('.', ',') + '%');
    }

    escreverNaTela('total-abertos', alertasDoPeriodo.length);
    escreverNaTela('total-resolvidos', resolvidosDoPeriodo.length);
    document.getElementById('vazio-fluxo').hidden = alertasDoPeriodo.length + resolvidosDoPeriodo.length > 0;
    document.getElementById('vazio-componentes').hidden = alertasDoPeriodo.length > 0;
    document.getElementById('vazio-tempo').hidden = alertasAtivos.length > 0;
}

function atualizarGraficoFluxo() {
    if (!graficoFluxo) return;
    const horas = Number(campoPeriodo.value);
    const inicioPeriodo = agora - horas * umaHora;
    let quantidadeIntervalos = 6;
    if (horas == 168) quantidadeIntervalos = 7;
    const tamanhoIntervalo = horas * umaHora / quantidadeIntervalos;
    const legendas = [];
    const abertos = [];
    const resolvidos = [];

    for (let i = 0; i < quantidadeIntervalos; i++) {
        const fimIntervalo = new Date(inicioPeriodo + (i + 1) * tamanhoIntervalo);
        let legenda = fimIntervalo.toLocaleTimeString('pt-BR', {
            timeZone: DADOS_DASHBOARD.fusoHorario, hour: '2-digit', hourCycle: 'h23'
        }) + 'h';
        if (horas == 168) {
            legenda = fimIntervalo.toLocaleDateString('pt-BR', {
                timeZone: DADOS_DASHBOARD.fusoHorario, day: '2-digit', month: '2-digit'
            });
        }
        legendas.push(legenda);
        abertos.push(0);
        resolvidos.push(0);
    }

    for (const alerta of alertasDoPeriodo) {
        const inicio = new Date(alerta.inicio).getTime();
        let posicao = Math.floor((inicio - inicioPeriodo) / tamanhoIntervalo);
        if (posicao >= quantidadeIntervalos) posicao = quantidadeIntervalos - 1;
        abertos[posicao]++;
    }
    for (const alerta of resolvidosDoPeriodo) {
        const fim = new Date(alerta.resolvidoEm).getTime();
        let posicao = Math.floor((fim - inicioPeriodo) / tamanhoIntervalo);
        if (posicao >= quantidadeIntervalos) posicao = quantidadeIntervalos - 1;
        resolvidos[posicao]++;
    }

    graficoFluxo.data.labels = legendas;
    graficoFluxo.data.datasets[0].data = abertos;
    graficoFluxo.data.datasets[1].data = resolvidos;
    graficoFluxo.update();
}

function atualizarGraficoComponentes() {
    if (!graficoComponentes) return;
    const quantidades = [0, 0, 0, 0]; // RAM, CPU, Disco e Swap.
    for (const alerta of alertasDoPeriodo) {
        if (alerta.componente == 'RAM') quantidades[0]++;
        if (alerta.componente == 'CPU') quantidades[1]++;
        if (alerta.componente == 'DISCO') quantidades[2]++;
        if (alerta.componente == 'SWAP') quantidades[3]++;
    }
    graficoComponentes.data.datasets[0].data = quantidades;
    graficoComponentes.update();
}

function atualizarGraficoTempo() {
    if (!graficoTempo) return;
    const quantidades = {
        critica: [0, 0, 0, 0],
        alta: [0, 0, 0, 0],
        moderada: [0, 0, 0, 0]
    };
    for (const alerta of alertasAtivos) {
        const minutos = calcularMinutos(alerta);
        let faixa = 0;
        if (minutos > 15) faixa = 1;
        if (minutos > 30) faixa = 2;
        if (minutos > 60) faixa = 3;
        quantidades[alerta.severidade][faixa]++;
    }
    graficoTempo.data.datasets[0].data = quantidades.critica;
    graficoTempo.data.datasets[1].data = quantidades.alta;
    graficoTempo.data.datasets[2].data = quantidades.moderada;
    graficoTempo.update();
}

function atualizarDashboard() {
    separarAlertas();
    atualizarIndicadores();
    atualizarGraficoFluxo();
    atualizarGraficoComponentes();
    atualizarGraficoTempo();
    atualizarTabela();
}

function atualizarTabela() {
    let lista = [];
    let contadores = { todos: 0, aberto: 0, investigacao: 0, resolvido: 0 };
    let busca = campoBusca.value.trim().toLowerCase();

    for (let i = 0; i < alertasDoPeriodo.length; i++) {
        let alerta = alertasDoPeriodo[i];
        if (alerta.mainframe.toLowerCase().indexOf(busca) == -1) continue;
        if (campoSeveridade.value != '' && alerta.severidade != campoSeveridade.value) continue;
        if (campoComponente.value != '' && alerta.componente != campoComponente.value) continue;
        contadores.todos++;
        contadores[alerta.status]++;
        if (statusSelecionado == 'todos' || alerta.status == statusSelecionado) lista.push(alerta);
    }

    escreverNaTela('contador-todos', contadores.todos);
    escreverNaTela('contador-aberto', contadores.aberto);
    escreverNaTela('contador-investigacao', contadores.investigacao);
    escreverNaTela('contador-resolvido', contadores.resolvido);

    let totalPaginas = Math.ceil(lista.length / itensPorPagina);
    if (totalPaginas == 0) totalPaginas = 1;
    if (paginaAtual > totalPaginas) paginaAtual = totalPaginas;
    let primeiro = (paginaAtual - 1) * itensPorPagina;
    let ultimo = primeiro + itensPorPagina;
    if (ultimo > lista.length) ultimo = lista.length;

    let linhas = '';
    for (let i = primeiro; i < ultimo; i++) {
        let alerta = lista[i];
        // Todos os valores inseridos aqui vêm da constante de dados simulados.
        linhas += `<tr>
            <td><strong>${alerta.mainframe}</strong></td>
            <td><span class="alertas-badge severidade-${alerta.severidade}">${nomesSeveridade[alerta.severidade]}</span></td>
            <td>${nomesComponentes[alerta.componente]}</td>
            <td><time datetime="${alerta.inicio}">${formatarData(alerta.inicio)}</time></td>
            <td>${formatarTempo(calcularMinutos(alerta))}</td>
            <td><span class="alertas-badge status-${alerta.status}">${nomesStatus[alerta.status]}</span></td>
        </tr>`;
    }

    if (lista.length == 0) {
        linhas = '<tr><td colspan="6" class="alertas-sem-resultados">Nenhum alerta encontrado para os filtros selecionados.</td></tr>';
        escreverNaTela('resumo-paginacao', 'Nenhum alerta encontrado');
    } else {
        escreverNaTela('resumo-paginacao', 'Mostrando ' + (primeiro + 1) + '–' + ultimo + ' de ' + lista.length + ' alertas');
    }
    document.getElementById('corpo-alertas').innerHTML = linhas;
    montarPaginacao(totalPaginas, lista.length);
}

// Paginação e botões de status.
function montarPaginacao(totalPaginas, totalAlertas) {
    let desabilitado = '';
    if (paginaAtual == 1) desabilitado = 'disabled';
    let botoes = `<button type="button" aria-label="Página anterior" onclick="mudarPagina(${paginaAtual - 1})" ${desabilitado}>‹</button>`;
    let ultimaMostrada = 0;

    for (let i = 1; i <= totalPaginas; i++) {
        const primeiraOuUltima = i == 1 || i == totalPaginas;
        const pertoDaAtual = Math.abs(i - paginaAtual) <= 1;
        const pertoDoInicio = paginaAtual < 3 && i <= 3;
        const pertoDoFim = paginaAtual > totalPaginas - 2 && i >= totalPaginas - 2;
        if (totalPaginas <= 5 || primeiraOuUltima || pertoDaAtual || pertoDoInicio || pertoDoFim) {
            if (i - ultimaMostrada > 1) botoes += '<span class="alertas-reticencias">…</span>';
            let selecionada = '';
            if (i == paginaAtual) selecionada = 'aria-current="page"';
            desabilitado = '';
            if (totalAlertas == 0) desabilitado = 'disabled';
            botoes += `<button type="button" aria-label="Página ${i}" onclick="mudarPagina(${i})" ${selecionada} ${desabilitado}>${i}</button>`;
            ultimaMostrada = i;
        }
    }

    desabilitado = '';
    if (paginaAtual == totalPaginas) desabilitado = 'disabled';
    botoes += `<button type="button" aria-label="Próxima página" onclick="mudarPagina(${paginaAtual + 1})" ${desabilitado}>›</button>`;
    document.getElementById('paginacao-alertas').innerHTML = botoes;
}

function mudarPagina(numero) {
    paginaAtual = numero;
    atualizarTabela();
}

function mudarStatus(status) {
    statusSelecionado = status;
    paginaAtual = 1;
    for (let i = 0; i < botoesStatus.length; i++) {
        botoesStatus[i].className = '';
        botoesStatus[i].setAttribute('aria-pressed', 'false');
        if (botoesStatus[i].getAttribute('data-status') == status) {
            botoesStatus[i].className = 'ativa';
            botoesStatus[i].setAttribute('aria-pressed', 'true');
        }
    }
    atualizarTabela();
}

// Eventos dos filtros.
campoPeriodo.onchange = function () {
    paginaAtual = 1;
    atualizarDashboard();
};
campoLocalizacao.onchange = function () {
    paginaAtual = 1;
    preencherMainframes();
    atualizarDashboard();
};
campoMainframe.onchange = function () {
    paginaAtual = 1;
    atualizarDashboard();
};
function atualizarFiltrosTabela() {
    paginaAtual = 1;
    atualizarTabela();
}
campoBusca.oninput = atualizarFiltrosTabela;
campoSeveridade.onchange = atualizarFiltrosTabela;
campoComponente.onchange = atualizarFiltrosTabela;
for (let i = 0; i < botoesStatus.length; i++) {
    botoesStatus[i].onclick = function () {
        mudarStatus(this.getAttribute('data-status'));
    };
}

let dataAtualizacao = DADOS_DASHBOARD.atualizadoEm;
escreverNaTela('data-atualizacao', dataAtualizacao.substring(8, 10) + '/' + dataAtualizacao.substring(5, 7) + '/' + dataAtualizacao.substring(0, 4) + ' às ' + dataAtualizacao.substring(11, 16));
document.getElementById('data-atualizacao').setAttribute('datetime', dataAtualizacao);
preencherLocalizacoes();
preencherMainframes();
criarGraficos();
atualizarDashboard();
