// ==========================================================
// 1. VALIDAÇÃO DE SESSÃO E SIDEBAR
// ==========================================================
function validarSessao() {
    const idUsuario = sessionStorage.getItem('idUsuario');
    const nomeUsuario = sessionStorage.getItem('nomeUsuario');
    const cargoUsuario = sessionStorage.getItem('cargoUsuario');

    if (idUsuario == null) {
        window.location.href = '/login.html';
        return false;
    }

    const spanNome = document.getElementById('user-name');
    const spanCargo = document.getElementById('user-role');
    const avatarLetra = document.getElementById('user-avatar-letter');

    if (spanNome) spanNome.innerText = nomeUsuario || 'Usuário';
    if (spanCargo) spanCargo.innerText = cargoUsuario || 'Analista Infra';
    if (avatarLetra) avatarLetra.innerText = (nomeUsuario || 'U').charAt(0).toUpperCase();

    return true;
}

function limparSessao() {
    sessionStorage.clear();
    window.location = "login.html";
}

// ==========================================================
// 2. CONFIGURAÇÕES DO GRÁFICO E KPIS
// ==========================================================
const kpiContextData = {
    cpu: {
        color: '#DC2626',
        kpi1: { label: 'Uso Total MIPS / CPU', sub: 'Pico crítico: 90%' },
        kpi2: { label: 'Threads em Execução', sub: 'Média aceitável: 1.200' },
        kpi3: { label: 'Fila de Processamento', sub: 'Aguardando CPU' }
    },
    ram: {
        color: '#2563EB',
        kpi1: { label: 'Uso Total de RAM', sub: 'Capacidade máxima próxima' },
        kpi2: { label: 'Memória em Swap', sub: 'Limite de alerta: 5.0 GB' },
        kpi3: { label: 'Taxa de Paginação', sub: 'Status de paginação' }
    },
    disco: {
        color: '#7C3AED',
        kpi1: { label: 'Taxa I/O de Disco', sub: 'Limite físico: 15K IOPS' },
        kpi2: { label: 'Latência Média', sub: 'Tempo de resposta (ms)' },
        kpi3: { label: 'Fila I/O (Wait)', sub: 'Operações em buffer' }
    }
};

const chartTitles = {
    cpu: { title: 'Evolução Temporal - Consumo de CPU (MIPS)', table: 'Top Processos Consumindo CPU' },
    ram: { title: 'Evolução Temporal - Alocação de Memória RAM', table: 'Top Processos Alocando RAM' },
    disco: { title: 'Evolução Temporal - Taxa I/O de Disco', table: 'Top Processos com Maior I/O' }
};

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
// 3. COMUNICAÇÃO COM A API (FETCH)
// ==========================================================
async function buscarProcessosAPI(idMainframe, metrica) {
    const idEmpresa = sessionStorage.getItem('idEmpresa');
    return api.get(`/processos/ultimos/${idEmpresa}/${idMainframe}/${metrica}`);
}

// ==========================================================
// 4. ATUALIZAÇÃO DINÂMICA DA INTERFACE
// ==========================================================
async function switchMetric(metric) {
    // 1. Atualiza os botões visuais
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.metric === metric);
    });

    const idMainframe = document.getElementById('mainframeSelect').value;
    if (!idMainframe) return;

    let dadosReais;
    try {
        dadosReais = await buscarProcessosAPI(idMainframe, metric);
    } catch (erro) {
        console.error('Erro ao buscar dados da API:', erro);
        renderErroProcessos(erro.message);
        return;
    }

    // 3. Trata ausência de dados
    if (!dadosReais || dadosReais.processos.length === 0) {
        renderTabelaVazia();
        return;
    }

    // 4. Atualiza Títulos
    document.getElementById('chartTitle').innerText = chartTitles[metric].title;
    document.getElementById('tableTitle').innerText = chartTitles[metric].table;

    // 5. Atualiza Gráfico
    chartInstance.data.labels = dadosReais.grafico.labels; // Ex: ['11:30', '11:35', '11:40']
    chartInstance.data.datasets = dadosReais.grafico.datasets.map(ds => ({ ...ds, fill: true }));
    chartInstance.update();

    // 6. Atualiza KPIs e Tabela
    updateKPIs(metric, dadosReais.kpis, dadosReais.processos[0]);
    renderTable(metric, dadosReais.processos);
}

function updateKPIs(metric, kpiData, topProc) {
    const context = kpiContextData[metric];

    // Atualiza KPIs estruturais
    for (let i = 1; i <= 3; i++) {
        document.getElementById(`kpi${i}-label`).innerText = context[`kpi${i}`].label;
        document.getElementById(`kpi${i}-value`).innerText = kpiData[`valor${i}`];
        document.getElementById(`kpi${i}-value`).style.color = context.color;
        document.getElementById(`kpi${i}-sub`).innerText = context[`kpi${i}`].sub;
    }

    // Atualiza o KPI de Maior Ofensor (Card 4)
    document.getElementById('kpi4-value').innerText = topProc.job;
    
    let subtextoOfensor = '';
    if (metric === 'cpu') subtextoOfensor = `Consumindo ${topProc.cpu}% da CPU`;
    if (metric === 'ram') subtextoOfensor = `Alocando ${topProc.ram} MB de RAM`;
    if (metric === 'disco') subtextoOfensor = `Gerando ${topProc.disco} IOPS`;
    
    document.getElementById('kpi4-sub').innerText = subtextoOfensor;
}

function renderTable(metric, processos) {
    const tbody = document.getElementById('processTableBody');
    tbody.innerHTML = '';

    processos.forEach(proc => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${proc.pid}</td>
            <td><strong>${proc.job}</strong></td>
            <td class="${metric === 'cpu' ? 'highlight-col' : ''}" style="${metric === 'cpu' ? 'color: #DC2626;' : ''}">${proc.cpu}%</td>
            <td class="${metric === 'ram' ? 'highlight-col' : ''}" style="${metric === 'ram' ? 'color: #2563EB;' : ''}">${proc.ram} MB</td>
            <td class="${metric === 'disco' ? 'highlight-col' : ''}" style="${metric === 'disco' ? 'color: #7C3AED;' : ''}">${proc.disco} IOPS</td>
            <td>${proc.threads}</td>
            <td><span class="badge-status status-${proc.status.toLowerCase()}">${proc.status}</span></td>
        `;
        tbody.appendChild(tr);
    });
}

function renderTabelaVazia() {
    const tbody = document.getElementById('processTableBody');
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px;">Nenhum dado de processo encontrado para este servidor no momento.</td></tr>';
}

function renderErroProcessos(mensagem) {
    const tbody = document.getElementById('processTableBody');
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px;"></td></tr>';
    tbody.querySelector('td').textContent = mensagem;
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
        renderTabelaVazia();
        return false;
    }

    seletor.disabled = false;
    return true;
}

// ==========================================================
// 5. INICIALIZAÇÃO
// ==========================================================
window.onload = async () => {
    if (!validarSessao()) return;

    initChart();

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
        renderErroProcessos(erro.message);
        return;
    }

    switchMetric('cpu');
};