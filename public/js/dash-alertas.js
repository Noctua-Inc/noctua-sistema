// Controle dos filtros, indicadores, gráficos e histórico de alertas.
let paginaAtual = 1;
let statusSelecionado = 'todos';
let alertasDoPeriodo = [];
let graficoFluxo;
let graficoComponentes;
let graficoTempo;

let DADOS_DASHBOARD;
const itensPorPagina = 5;
const nomesSeveridade = { critica: 'Crítica', alta: 'Alta', moderada: 'Moderada' };
const nomesStatus = { aberto: 'Aberto', resolvido: 'Encerrado' };
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

function preencherLocalizacoes() {
    const atual = campoLocalizacao.value;
    campoLocalizacao.replaceChildren(new Option('Todas as localidades', ''));
    for (const local of DADOS_DASHBOARD.localizacoes) campoLocalizacao.add(new Option(local, local));
    if (DADOS_DASHBOARD.localizacoes.includes(atual)) campoLocalizacao.value = atual;
}

function preencherMainframes() {
    const escolhido = campoMainframe.value;
    campoMainframe.replaceChildren(new Option('Todos os mainframes', ''));
    for (const mainframe of DADOS_DASHBOARD?.mainframes ?? []) {
        if (!campoLocalizacao.value || mainframe.localizacao === campoLocalizacao.value) {
            campoMainframe.add(new Option(mainframe.hostname, mainframe.hostname));
        }
    }
    if ([...campoMainframe.options].some(opcao => opcao.value === escolhido)) campoMainframe.value = escolhido;
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

function painelSelecionado() {
    if (campoMainframe.value) return DADOS_DASHBOARD?.porMainframe[campoMainframe.value]?.[campoPeriodo.value];
    if (campoLocalizacao.value) return DADOS_DASHBOARD?.porLocalizacao[campoLocalizacao.value]?.[campoPeriodo.value];
    return DADOS_DASHBOARD?.todos[campoPeriodo.value];
}

function atualizarDashboard() {
    const painel = painelSelecionado();
    alertasDoPeriodo = painel?.historico.map(indice => DADOS_DASHBOARD.ocorrencias[indice]) ?? [];

    escreverNaTela('kpi-ativos', painel?.ativos ?? '-');
    escreverNaTela('kpi-mainframes', painel ? painel.equipamentosComAlertas + ' / ' + painel.monitoradas : '-');
    escreverNaTela('kpi-resolucao', painel?.minutosResolucao == null ? '-' : formatarTempo(painel.minutosResolucao));
    escreverNaTela('kpi-reincidencia', painel?.percentualReincidencia == null ? '-'
        : painel.percentualReincidencia.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%');
    escreverNaTela('total-abertos', painel?.totalAbertos ?? 0);
    escreverNaTela('total-resolvidos', painel?.totalResolvidos ?? 0);

    document.getElementById('vazio-fluxo').hidden = Boolean(painel?.totalAbertos || painel?.totalResolvidos);
    document.getElementById('vazio-componentes').hidden = Boolean(painel?.totalAbertos);
    document.getElementById('vazio-tempo').hidden = Boolean(painel?.ativos);

    if (graficoFluxo) {
        graficoFluxo.data.labels = painel?.fluxo.rotulos ?? [];
        graficoFluxo.data.datasets[0].data = painel?.fluxo.abertos ?? [];
        graficoFluxo.data.datasets[1].data = painel?.fluxo.resolvidos ?? [];
        graficoFluxo.update();
        graficoComponentes.data.datasets[0].data = painel?.componentes ?? [];
        graficoComponentes.update();
        graficoTempo.data.datasets[0].data = painel?.tempo.critica ?? [];
        graficoTempo.data.datasets[1].data = painel?.tempo.alta ?? [];
        graficoTempo.data.datasets[2].data = painel?.tempo.moderada ?? [];
        graficoTempo.update();
    }
    atualizarTabela();
}

function atualizarTabela() {
    let lista = [];
    let contadores = { todos: 0, aberto: 0, resolvido: 0 };
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
        linhas += `<tr>
            <td><strong></strong></td>
            <td><span class="alertas-badge severidade-${alerta.severidade}">${nomesSeveridade[alerta.severidade]}</span></td>
            <td>${nomesComponentes[alerta.componente]}</td>
            <td><time datetime="${alerta.inicio}">${formatarData(alerta.inicio)}</time></td>
            <td>${formatarTempo(alerta.minutos)}</td>
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
    document.querySelectorAll('#corpo-alertas strong').forEach((texto, i) => {
        texto.textContent = lista[primeiro + i].mainframe;
    });
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

async function iniciarAlertas() {
    const aviso = document.getElementById('aviso-alertas');
    criarGraficos();
    aviso.textContent = 'Carregando alertas da Gold.';
    try {
        DADOS_DASHBOARD = await carregarDadosAlertas(sessionStorage.getItem('idEmpresa'));
        const atualizadoEm = DADOS_DASHBOARD?.atualizadoEm;
        const dataAtualizacao = document.getElementById('data-atualizacao');
        dataAtualizacao.textContent = atualizadoEm ? formatarData(atualizadoEm) : '-';
        if (atualizadoEm) dataAtualizacao.dateTime = atualizadoEm;
        aviso.textContent = DADOS_DASHBOARD?.monitoradas ? '' : 'Sem avaliações de alertas disponíveis na Gold.';
        if (DADOS_DASHBOARD) {
            preencherLocalizacoes();
            preencherMainframes();
        }
    } catch (erro) {
        console.error(erro);
        aviso.textContent = 'Não foi possível consultar os alertas na Gold.';
    }
    atualizarDashboard();
}

iniciarAlertas();
