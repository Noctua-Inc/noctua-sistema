// ==========================================================
// CONFIGURAÇÕES DO GRÁFICO E KPIS
// ==========================================================
const metricasProcessos = {
    cpu: { cor: '#dc2626', total: 'CPU da máquina', grafico: 'CPU da máquina por coleta', tabela: 'Processos com maior uso de CPU' },
    ram: { cor: '#2563eb', total: 'Memória dos processos', grafico: 'Memória dos processos por coleta', tabela: 'Processos com maior uso de memória' },
    disco: { cor: '#7c3aed', total: 'Volume de I/O acumulado', grafico: 'Contadores acumulados de I/O por coleta', tabela: 'Processos com maior volume de I/O' }
};
const coresGraficoProcessos = {
    cpu: ['#dc2626', '#059669'],
    ram: ['#2563eb', '#059669'],
    disco: ['#7c3aed', '#059669', '#f59e0b', '#0ea5e9']
};
const unidadesProcessos = { cpu: '%', ram: ' MiB', disco: ' MiB' };
let consultaProcessos = 0;

let chartInstance = null;

function initChart() {
    const ctx = document.getElementById('processChart').getContext('2d');
    chartInstance = new Chart(ctx, {
        type: 'line',
        data: { labels: [], datasets: [] },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            tension: 0.35,
            plugins: { 
                legend: { position: 'top', labels: { color: '#64748B', font: { family: 'Poppins', size: 12 } } } 
            },
            scales: {
                y: { grid: { color: '#E2E8F0' }, ticks: { color: '#64748B' } },
                x: { grid: { color: '#E2E8F0' }, ticks: { color: '#64748B' } }
            }
        }
    });
}

// ==========================================================
// COMUNICAÇÃO COM A API (FETCH)
// ==========================================================
async function buscarProcessosAPI(idMainframe, metrica) {
    const idEmpresa = sessionStorage.getItem('idEmpresa');
    return api.get(`/processos/ultimos/${idEmpresa}/${idMainframe}/${metrica}`);
}

// ==========================================================
// ATUALIZAÇÃO DINÂMICA DA INTERFACE
// ==========================================================
async function switchMetric(metric) {
    const consulta = ++consultaProcessos;
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.metric === metric);
    });
    const idMainframe = document.getElementById('mainframeSelect').value;
    if (!idMainframe) return;

    atualizarProcessos(metric, null, 'Carregando processos…');
    try {
        const dados = await buscarProcessosAPI(idMainframe, metric);
        if (consulta === consultaProcessos) atualizarProcessos(metric, dados);
    } catch (erro) {
        if (consulta === consultaProcessos) atualizarProcessos(metric, null, erro.message);
    }
}

function formatarProcesso(valor, metrica) {
    return Number.isFinite(valor)
        ? valor.toLocaleString('pt-BR', { maximumFractionDigits: 2 }) + unidadesProcessos[metrica]
        : '—';
}

function atualizarProcessos(metrica, dados, aviso) {
    const contexto = metricasProcessos[metrica];
    const rotulos = [contexto.total, 'Processos capturados', 'Última captura'];
    rotulos.forEach((rotulo, i) => {
        const n = i + 1;
        document.getElementById('kpi' + n + '-label').textContent = rotulo;
        const valor = document.getElementById('kpi' + n + '-value');
        valor.textContent = dados?.kpis?.['valor' + n] ?? '—';
        valor.style.color = contexto.cor;
        document.getElementById('kpi' + n + '-sub').textContent = '';
    });
    const primeiro = dados?.processos.find(processo => Number.isFinite(processo[metrica]));
    document.getElementById('kpi4-value').textContent = primeiro?.job ?? '—';
    document.getElementById('kpi4-sub').textContent = formatarProcesso(primeiro?.[metrica], metrica);
    document.getElementById('chartTitle').textContent = contexto.grafico;
    document.getElementById('tableTitle').textContent = contexto.tabela;
    document.getElementById('aviso-processos').textContent = aviso
        ?? (dados?.grafico.datasets.length ? '' : 'Sem série para a métrica nesta captura.');

    if (chartInstance) {
        chartInstance.data.labels = dados?.grafico.labels ?? [];
        const cores = coresGraficoProcessos[metrica];
        chartInstance.data.datasets = (dados?.grafico.datasets ?? []).map((serie, i) => ({
            ...serie, borderColor: cores[i] ?? '#64748b', backgroundColor: cores[i] ?? '#64748b'
        }));
        chartInstance.update();
    }

    const tabela = document.getElementById('processTableBody');
    tabela.replaceChildren();
    for (const processo of dados?.processos ?? []) {
        const linha = tabela.insertRow();
        linha.insertCell().textContent = processo.pid;
        linha.insertCell().textContent = processo.job;
        for (const campo of Object.keys(unidadesProcessos)) {
            const celula = linha.insertCell();
            celula.textContent = formatarProcesso(processo[campo], campo);
            celula.classList.toggle('highlight-col', campo === metrica);
            if (campo === 'cpu') {
                celula.title = processo.cpu_normalizada ? 'Percentual da máquina' : 'Percentual bruto do processo';
            }
        }
        const status = { Normal: 'Normal', Atencao: 'Atenção', Critico: 'Crítico' };
        linha.insertCell().textContent = status[processo.status] ?? '—';
    }
    if (!tabela.rows.length) {
        const celula = tabela.insertRow().insertCell();
        celula.colSpan = 6;
        celula.textContent = aviso ?? 'Sem processos para este mainframe.';
    }
}

async function carregarMainframes() {
    const idEmpresa = sessionStorage.getItem('idEmpresa');
    const seletor = document.getElementById('mainframeSelect');

    if (!idEmpresa) {
        window.location.href = '/login.html';
        return false;
    }

    const mainframes = await api.get(`/mainframe/empresa/${idEmpresa}`);
    seletor.replaceChildren();

    mainframes.forEach(mainframe => {
        const descricao = mainframe.modelo
            ? `${mainframe.hostname} (${mainframe.modelo})`
            : mainframe.hostname;
        seletor.add(new Option(descricao, mainframe.id_mainframe));
    });

    if (mainframes.length === 0) {
        seletor.add(new Option('Nenhum mainframe cadastrado', ''));
        seletor.disabled = true;
        atualizarProcessos('cpu', null, 'Nenhum mainframe cadastrado.');
        return false;
    }

    seletor.disabled = false;
    return true;
}

// ==========================================================
// INICIALIZAÇÃO
// ==========================================================
window.onload = async () => {
    if (!sessionStorage.getItem('idUsuario')) {
        window.location.href = '/login.html';
        return;
    }

    if (typeof Chart !== 'undefined') initChart();

    // Eventos de clique nas abas (CPU, RAM, DISCO)
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            switchMetric(e.currentTarget.dataset.metric);
        });
    });

    // Evento de troca de servidor no select
    document.getElementById('mainframeSelect').addEventListener('change', () => {
        const metricaAtiva = document.querySelector('.tab-btn.active').dataset.metric;
        switchMetric(metricaAtiva);
    });

    try {
        if (!await carregarMainframes()) return;
    } catch (erro) {
        console.error('Erro ao carregar mainframes:', erro);
        atualizarProcessos('cpu', null, erro.message);
        return;
    }

    switchMetric('cpu');
    setInterval(() => switchMetric(document.querySelector('.tab-btn.active').dataset.metric), 60000);
};
