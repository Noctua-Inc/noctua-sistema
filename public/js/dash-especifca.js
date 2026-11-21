const idEmpresaDetalhe = sessionStorage.getItem('idEmpresa');
const idMainframeDetalhe = new URLSearchParams(location.search).get('id_mainframe');
const botoesMetricas = document.querySelectorAll('.opcao-monitoramento');
const botoesTempo = document.querySelectorAll('.opcao-tempo');
const periodosDetalhe = [1, 12, 24, 168];

const camposDetalhe = {
    cpu: ['CPU', '%'], ram: ['RAM', '%'], disco: ['Ocupação do disco', '%'], swap: ['Swap', '%'],
    frequencia_ghz: ['Frequência da CPU', 'GHz'], ram_livre_gib: ['RAM disponível', 'GiB'],
    disco_livre_gib: ['Disco disponível', 'GiB'], leitura_mib_s: ['Leitura', 'MiB/s'],
    escrita_mib_s: ['Escrita', 'MiB/s'], leituras_acumuladas: ['Operações de leitura acumuladas', ''],
    escritas_acumuladas: ['Operações de escrita acumuladas', ''],
    enviados_mib: ['Dados enviados acumulados', 'MiB'], recebidos_mib: ['Dados recebidos acumulados', 'MiB'],
    erros_recebimento: ['Erros de recebimento acumulados', ''], sockets_time_wait: ['Sockets em TIME_WAIT', '']
};

const abasDetalhe = [
    { nome: 'Uso de recursos', colunas: ['cpu', 'ram', 'disco', 'swap'], series: ['cpu', 'ram', 'disco', 'swap'] },
    { nome: 'Tráfego de rede acumulado', colunas: ['enviados_mib', 'recebidos_mib', 'erros_recebimento', 'sockets_time_wait'], series: ['enviados_mib', 'recebidos_mib'] },
    { nome: 'Uso de CPU', colunas: ['cpu', 'frequencia_ghz'], series: ['cpu'] },
    { nome: 'Uso de memória', colunas: ['ram', 'swap', 'ram_livre_gib'], series: ['ram', 'swap'] },
    { nome: 'Ocupação do disco', colunas: ['disco', 'disco_livre_gib', 'leitura_mib_s', 'escrita_mib_s', 'leituras_acumuladas', 'escritas_acumuladas'], series: ['disco'] }
];

let abaDetalhe = 0;
let periodoDetalhe = 0;
let amostrasDetalhe = [];
let parametrosDetalhe = [];
let graficoDetalhe;

function trocarTempo(indice) {
    periodoDetalhe = indice;
    botoesTempo.forEach((botao, i) => botao.classList.toggle('opcao-tempo-selecionada', i === indice));
    renderizarDetalhe();
}

function trocarMonitoramento(indice) {
    abaDetalhe = indice;
    botoesMetricas.forEach((botao, i) => botao.classList.toggle('opcao-monitoramento-selecionada', i === indice));
    renderizarDetalhe();
}

function formatarMedicao(valor, campo) {
    if (!Number.isFinite(valor)) return '—';
    const unidade = camposDetalhe[campo][1];
    return Number(valor).toLocaleString('pt-BR', { maximumFractionDigits: 2 }) + (unidade ? ' ' + unidade : '');
}

function renderizarDetalhe() {
    const aba = abasDetalhe[abaDetalhe];
    const horas = periodosDetalhe[periodoDetalhe];
    const leituras = monitoramento.porPeriodo(amostrasDetalhe, horas);
    const ultima = amostrasDetalhe.at(-1);
    const kpis = document.getElementById('sessaoKpis');
    const estado = document.getElementById('statusMainframe');
    const momento = ultima ? monitoramento.horario(ultima.horario) : 'Sem coleta';

    const avaliados = parametrosDetalhe.filter(p => monitoramento.metricas[p.tipo] && Number.isFinite(ultima?.[monitoramento.metricas[p.tipo][0]]));
    const desvios = avaliados.filter(p => monitoramento.desvio(ultima[monitoramento.metricas[p.tipo][0]], p) > 0);
    estado.textContent = !ultima ? 'Sem dados' : !avaliados.length ? 'Sem limites avaliáveis' : desvios.length ? 'Fora dos limites' : 'Dentro dos limites';
    kpis.replaceChildren(...aba.colunas.map(campo => {
        const card = document.createElement('div');
        card.className = 'kpi';
        const titulo = document.createElement('p');
        titulo.className = 'texto-kpi';
        titulo.textContent = camposDetalhe[campo][0];
        const valor = document.createElement('h3');
        valor.className = 'dado-kpi';
        valor.textContent = formatarMedicao(ultima?.[campo], campo);
        const data = document.createElement('p');
        data.className = 'texto-kpi';
        data.textContent = momento;
        card.append(titulo, valor, data);
        return card;
    }));

    document.querySelector('.titulo-grafico').textContent = aba.nome + (leituras.length ? '' : ' · Sem dados no período');
    const tituloTabela = document.getElementById('tituloTabela');
    const corpo = document.getElementById('corpoTabela');
    const cabecalho = ['Coleta', ...aba.colunas.map(campo => camposDetalhe[campo][0])];
    tituloTabela.replaceChildren(...cabecalho.map(texto => {
        const th = document.createElement('th');
        th.textContent = texto;
        return th;
    }));
    corpo.replaceChildren();
    for (const leitura of leituras.slice(-20).reverse()) {
        const linha = corpo.insertRow();
        linha.insertCell().textContent = monitoramento.horario(leitura.horario);
        for (const campo of aba.colunas) linha.insertCell().textContent = formatarMedicao(leitura[campo], campo);
    }
    if (!leituras.length) {
        const celula = corpo.insertRow().insertCell();
        celula.colSpan = cabecalho.length;
        celula.textContent = 'Sem coletas nesta janela.';
    }

    if (!graficoDetalhe) return;
    const pontos = monitoramento.agrupar(leituras, aba.series, Math.max(1, Math.ceil(horas * 60 / 240)));
    const cores = ['#2563eb', '#16a34a', '#d97706', '#7c3aed'];
    graficoDetalhe.data.labels = pontos.map(ponto => monitoramento.horario(ponto.horario));
    graficoDetalhe.data.datasets = aba.series.map((campo, i) => ({
        label: camposDetalhe[campo][0],
        data: pontos.map(ponto => ponto[campo]),
        borderColor: cores[i],
        pointRadius: pontos.length > 1 ? 0 : 3
    }));
    graficoDetalhe.options.scales.y.title = { display: true, text: camposDetalhe[aba.series[0]][1] };
    graficoDetalhe.update();
}

async function carregarDetalhe() {
    const aviso = document.getElementById('aviso-monitoramento');
    try {
        const mainframes = await api.get('/mainframe/idEmpresa/' + encodeURIComponent(idEmpresaDetalhe)
            + '/idMainFrame/' + encodeURIComponent(idMainframeDetalhe));
        const mainframe = mainframes[0];
        if (!mainframe) {
            aviso.textContent = 'Mainframe não encontrado para esta empresa.';
            return;
        }
        document.getElementById('nomeMainframe').textContent = mainframe.hostname;
        const [historico, parametros] = await Promise.all([
            monitoramento.historico(idEmpresaDetalhe, mainframe.hostname),
            api.get('/parametro?id_mainframe=' + encodeURIComponent(idMainframeDetalhe))
        ]);
        const ativos = new Set(String(mainframe.componentes ?? '').split(',').map(item => item.trim()));
        const porComponente = [abasDetalhe[2].colunas, abasDetalhe[3].colunas.filter(campo => campo !== 'swap'),
            abasDetalhe[4].colunas, ['swap'], abasDetalhe[1].colunas];
        for (const amostra of historico) {
            ['CPU', 'RAM', 'DISCO', 'SWAP', 'REDE'].forEach((componente, i) => {
                if (!ativos.has(componente)) for (const campo of porComponente[i]) amostra[campo] = null;
            });
        }
        amostrasDetalhe = historico;
        parametrosDetalhe = parametros;
        aviso.textContent = historico.length ? '' : 'Aguardando a primeira coleta na camada Gold.';
    } catch (erro) {
        console.error(erro);
        aviso.textContent = 'Não foi possível atualizar o monitoramento.';
    } finally {
        renderizarDetalhe();
    }
}

if (typeof Chart !== 'undefined') {
    graficoDetalhe = new Chart(document.getElementById('grafico'), {
        type: 'line',
        data: { labels: [], datasets: [] },
        options: { animation: false, scales: { y: { beginAtZero: true } } }
    });
}
carregarDetalhe();
setInterval(carregarDetalhe, 60000);
