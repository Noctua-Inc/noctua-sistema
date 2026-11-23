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
        kpi1: { label: 'Uso atual da CPU', sub: 'Percentual da máquina' },
        kpi2: { label: 'Pico de CPU', sub: 'Maior percentual no período' },
        kpi3: { label: 'Processos em atenção', sub: 'Processos acima de 10%' }
    },
    ram: {
        color: '#2563EB',
        kpi1: { label: 'Memória dos processos', sub: 'Total na última captura' },
        kpi2: { label: 'Pico de memória', sub: 'Maior total no período' },
        kpi3: { label: 'Processos em atenção', sub: 'Processos acima de 500 MiB' }
    },
    disco: {
        color: '#7C3AED',
        kpi1: { label: 'Total lido', sub: 'Na última captura' },
        kpi2: { label: 'Total escrito', sub: 'Na última captura' },
        kpi3: { label: 'I/O total', sub: 'Leitura + escrita' }
    }
};

const chartTitles = {
    cpu: { title: 'Evolução Temporal - Consumo de CPU (%)', table: 'Processos por consumo de CPU' },
    ram: { title: 'Evolução Temporal - Alocação de Memória RAM', table: 'Top Processos Alocando RAM' },
    disco: { title: 'Evolução Temporal - I/O acumulado', table: 'Processos por atividade de disco' }
};

let chartInstance = null;
let metricaAtual = 'cpu';

/**
 * Formata bytes para uma unidade mais fácil de ler sem alterar o valor bruto
 * recebido da API. Como os dados vêm do sistema operacional, usamos unidades
 * binárias: KiB, MiB, GiB e TiB.
 */
function formatarBytes(bytes) {
    const valor = Number(bytes);

    if (!Number.isFinite(valor)) return '--';
    if (valor === 0) return '0 B';

    const unidades = ['B', 'KiB', 'MiB', 'GiB', 'TiB'];
    const indice = Math.min(
        Math.floor(Math.log(Math.abs(valor)) / Math.log(1024)),
        unidades.length - 1
    );
    const convertido = valor / (1024 ** indice);

    return `${convertido.toLocaleString('pt-BR', {
        minimumFractionDigits: indice === 0 ? 0 : 2,
        maximumFractionDigits: indice === 0 ? 0 : 2
    })} ${unidades[indice]}`;
}

function initChart() {
    const ctx = document.getElementById('processChart').getContext('2d');
    chartInstance = new Chart(ctx, {
        type: 'line',
        data: { labels: [], datasets: [] },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            tension: 0.35,
            scales: {
                y: {
                    grid: { color: '#E2E8F0' },
                    ticks: {
                        color: '#64748B',
                        callback: valor => metricaAtual === 'disco'
                            ? formatarBytes(valor)
                            : valor
                    }
                },
                x: { grid: { color: '#E2E8F0' }, ticks: { color: '#64748B' } }
            },
            plugins: {
                legend: { position: 'top', labels: { color: '#64748B', font: { family: 'Poppins', size: 12 } } },
                tooltip: {
                    callbacks: {
                        label: contexto => {
                            const nome = contexto.dataset.label
                                ? `${contexto.dataset.label}: `
                                : '';
                            const valor = contexto.parsed.y;
                            return `${nome}${metricaAtual === 'disco' ? formatarBytes(valor) : valor}`;
                        }
                    }
                }
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
    metricaAtual = metric;

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

    const dados = normalizarDadosGold(dadosReais, metric);
    if (dados.processos.length === 0) {
        chartInstance.data.labels = [];
        chartInstance.data.datasets = [];
        chartInstance.update();
        limparKPIs();
        renderTabelaVazia();
        return;
    }

    // 4. Atualiza Títulos
    document.getElementById('chartTitle').innerText = chartTitles[metric].title;
    document.getElementById('tableTitle').innerText = chartTitles[metric].table;

    // 5. Atualiza Gráfico
    chartInstance.data.labels = dados.grafico.labels;
    chartInstance.data.datasets = dados.grafico.datasets.map(ds => ({ ...ds, fill: true }));
    chartInstance.update();

    // 6. Atualiza KPIs e Tabela
    updateKPIs(metric, dados.kpis, dados.processos[0]);
    renderTable(metric, dados.processos);
}

function normalizarDadosGold(resposta, metrica = 'cpu') {
    const processos = Array.isArray(resposta)
        ? resposta
        : Array.isArray(resposta?.processos) ? resposta.processos : [];
    const primeiro = processos[0] || {};

    const processosNormalizados = processos.map(processo => ({
        pid: processo.PID ?? processo.pid ?? '--',
        job: processo.Nome_Processo ?? processo.job ?? '--',
        cpu: processo.CPU_percentual_maquina ?? processo.cpu ?? processo.CPU_percentual ?? '--',
        ram: processo.Memoria_MB ?? processo.ram ?? '--',
        bytesLidos: processo.Bytes_Lidos ?? processo.bytesLidos ?? '--',
        bytesEscritos: processo.Bytes_Escritos ?? processo.bytesEscritos ?? '--',
        status: processo.status ?? 'Sem dados',
        timestamp: processo.Timestamp ?? processo.timestamp ?? '--'
    }));

    const valorNumerico = valor => Number.isFinite(Number(valor)) ? Number(valor) : 0;
    processosNormalizados.sort((a, b) => {
        if (metrica === 'ram') return valorNumerico(b.ram) - valorNumerico(a.ram);
        if (metrica === 'disco') {
            const discoA = valorNumerico(a.bytesLidos) + valorNumerico(a.bytesEscritos);
            const discoB = valorNumerico(b.bytesLidos) + valorNumerico(b.bytesEscritos);
            return discoB - discoA;
        }
        return valorNumerico(b.cpu) - valorNumerico(a.cpu);
    });

    return {
        kpis: resposta?.kpis || {
            valor1: primeiro.CPU_percentual ?? primeiro.cpu ?? '--',
            valor2: processos.length,
            valor3: primeiro.Timestamp ?? primeiro.timestamp ?? '--'
        },
        grafico: resposta?.grafico || { labels: [], datasets: [] },
        processos: processosNormalizados
    };
}

function limparKPIs() {
    for (let i = 1; i <= 4; i++) {
        const valor = document.getElementById(`kpi${i}-value`);
        const sub = document.getElementById(`kpi${i}-sub`);
        if (valor) valor.innerText = '--';
        if (sub) sub.innerText = 'Sem dados para este servidor';
    }
}

function updateKPIs(metric, kpiData, topProc) {
    const context = kpiContextData[metric];

    // Atualiza KPIs estruturais
    for (let i = 1; i <= 3; i++) {
        document.getElementById(`kpi${i}-label`).innerText = context[`kpi${i}`].label;
        const valor = kpiData[`valor${i}`];
        document.getElementById(`kpi${i}-value`).innerText = metric === 'disco'
            ? formatarBytes(valor)
            : valor;
        document.getElementById(`kpi${i}-value`).style.color = context.color;
        document.getElementById(`kpi${i}-sub`).innerText = context[`kpi${i}`].sub;
    }

    // Atualiza o KPI de Maior Ofensor (Card 4)
    document.getElementById('kpi4-value').innerText = topProc.job;
    
    let subtextoOfensor = '';
    if (metric === 'cpu') subtextoOfensor = `Consumindo ${topProc.cpu}% da CPU`;
    if (metric === 'ram') subtextoOfensor = `Alocando ${topProc.ram} MB de RAM`;
    if (metric === 'disco') {
        subtextoOfensor = `Lendo ${formatarBytes(topProc.bytesLidos)}`;
    }
    
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
            <td class="${metric === 'disco' ? 'highlight-col' : ''}" style="${metric === 'disco' ? 'color: #7C3AED;' : ''}">${formatarBytes(proc.bytesLidos)}</td>
            <td>${formatarBytes(proc.bytesEscritos)}</td>
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
