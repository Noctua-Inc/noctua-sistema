const empresaCorrelacao = sessionStorage.getItem('idEmpresa');
const periodoCorrelacao = document.getElementById('filtro-periodo');
const mainframeCorrelacao = document.getElementById('filtro-mainframe');
const avisoCorrelacao = document.getElementById('aviso-correlacao');
const recursosCorrelacao = ['cpu', 'ram', 'disco'];
const nomesCorrelacao = { cpu: 'CPU', ram: 'RAM', disco: 'Disco' };
const paresCorrelacao = [['cpu', 'ram'], ['cpu', 'disco'], ['ram', 'disco']];
const janelasCorrelacao = new Map();
let maquinasCorrelacao = [];
let consultaCorrelacao = 0;
let evolucaoCorrelacao;
let dispersaoCorrelacao;

function pearson(amostras, x, y) {
    const pares = amostras.filter(p => Number.isFinite(p[x]) && Number.isFinite(p[y]));
    if (pares.length < 3) return null;
    const mediaX = pares.reduce((s, p) => s + p[x], 0) / pares.length;
    const mediaY = pares.reduce((s, p) => s + p[y], 0) / pares.length;
    let covariancia = 0;
    let varianciaX = 0;
    let varianciaY = 0;
    for (const p of pares) {
        const dx = p[x] - mediaX;
        const dy = p[y] - mediaY;
        covariancia += dx * dy;
        varianciaX += dx * dx;
        varianciaY += dy * dy;
    }
    return varianciaX && varianciaY
        ? Math.max(-1, Math.min(1, covariancia / Math.sqrt(varianciaX * varianciaY)))
        : null;
}

function interpretacaoCorrelacao(valor) {
    if (valor === null) return ['correlacao-fraca', 'Dados insuficientes'];
    const magnitude = Math.abs(valor);
    const direcao = valor < 0 ? 'negativa' : valor > 0 ? 'positiva' : '';
    if (magnitude >= 0.7) return ['correlacao-alta', 'Forte ' + direcao];
    if (magnitude >= 0.4) return ['correlacao-media', 'Moderada ' + direcao];
    return ['correlacao-fraca', ('Fraca ' + direcao).trim()];
}

function mostrarCorrelacao(amostras) {
    const matriz = Object.fromEntries(recursosCorrelacao.map(x => [
        x, Object.fromEntries(recursosCorrelacao.map(y => [y, pearson(amostras, x, y)]))
    ]));
    const valorFormatado = valor => valor === null ? '—' : valor.toLocaleString('pt-BR', {
        minimumFractionDigits: 2, maximumFractionDigits: 2
    });
    const tabela = document.getElementById('insights-correlacao');
    tabela.replaceChildren();
    document.querySelectorAll('.correlacao-kpi').forEach((card, i) => {
        const [x, y] = paresCorrelacao[i];
        const valor = matriz[x][y];
        const [classe, interpretacao] = interpretacaoCorrelacao(valor);
        card.querySelector('h2').textContent = valorFormatado(valor);
        const rotulo = card.querySelector('span');
        rotulo.className = classe;
        rotulo.textContent = interpretacao;
        const linha = tabela.insertRow();
        linha.insertCell().textContent = nomesCorrelacao[x] + ' × ' + nomesCorrelacao[y];
        linha.insertCell().textContent = valorFormatado(valor);
        linha.insertCell().textContent = interpretacao;
    });
    const tabelaMatriz = document.getElementById('matriz-correlacao');
    tabelaMatriz.replaceChildren();
    for (const x of recursosCorrelacao) {
        const linha = tabelaMatriz.insertRow();
        const nome = document.createElement('th');
        nome.scope = 'row';
        nome.textContent = nomesCorrelacao[x];
        linha.append(nome);
        for (const y of recursosCorrelacao) {
            const valor = matriz[x][y];
            const magnitude = Math.abs(valor);
            const celula = linha.insertCell();
            celula.textContent = valorFormatado(valor);
            if (valor !== null) celula.className = magnitude >= 0.7 ? 'forte' : magnitude >= 0.4 ? 'moderada' : 'fraca';
        }
    }
    if (!evolucaoCorrelacao || !dispersaoCorrelacao) return;
    const pontos = monitoramento.agrupar(amostras, recursosCorrelacao, 60);
    const cores = ['#2563eb', '#059669', '#d97706'];
    evolucaoCorrelacao.data.labels = pontos.map(p => monitoramento.horario(p.horario));
    evolucaoCorrelacao.data.datasets = recursosCorrelacao.map((campo, i) => ({
        label: nomesCorrelacao[campo], data: pontos.map(p => p[campo]), borderColor: cores[i], pointRadius: 0
    }));
    evolucaoCorrelacao.update();
    const pares = amostras.filter(p => Number.isFinite(p.cpu) && Number.isFinite(p.ram));
    const passo = Math.max(1, Math.ceil(pares.length / 1500));
    dispersaoCorrelacao.data.datasets = [{
        label: 'CPU × RAM', backgroundColor: '#2563eb',
        data: pares.filter((_, i) => i % passo === 0).map(p => ({ x: p.cpu, y: p.ram }))
    }];
    dispersaoCorrelacao.update();
}

async function carregarCorrelacao() {
    const consulta = ++consultaCorrelacao;
    const selecionada = mainframeCorrelacao.value;
    const maquinas = maquinasCorrelacao.filter(m => selecionada === 'todos' || String(m.id_mainframe) === selecionada);
    avisoCorrelacao.textContent = 'Carregando medições…';
    try {
        const leituras = await Promise.all(maquinas.map(maquina => {
            if (!janelasCorrelacao.has(maquina.hostname)) {
                const ativo = new Set(String(maquina.componentes ?? '').split(',').map(c => c.trim()));
                const pedido = monitoramento.historico(empresaCorrelacao, maquina.hostname)
                    .then(amostras => amostras.map(amostra => ({
                        horario: amostra.horario,
                        cpu: ativo.has('CPU') ? amostra.cpu : null,
                        ram: ativo.has('RAM') ? amostra.ram : null,
                        disco: ativo.has('DISCO') ? amostra.disco : null
                    }))).catch(erro => {
                        janelasCorrelacao.delete(maquina.hostname);
                        throw erro;
                    });
                janelasCorrelacao.set(maquina.hostname, pedido);
            }
            return janelasCorrelacao.get(maquina.hostname);
        }));
        if (consulta !== consultaCorrelacao) return;
        const amostras = monitoramento.porPeriodo(leituras.flat(), Number(periodoCorrelacao.value));
        mostrarCorrelacao(amostras);
        avisoCorrelacao.textContent = amostras.length
            ? 'Correlação de Pearson entre medições feitas no mesmo minuto e mainframe.'
            : 'Sem medições no período selecionado.';
    } catch (erro) {
        if (consulta !== consultaCorrelacao) return;
        console.error(erro);
        mostrarCorrelacao([]);
        avisoCorrelacao.textContent = 'Não foi possível consultar o histórico da Gold.';
    }
}

async function iniciarCorrelacao() {
    if (typeof Chart !== 'undefined') {
        evolucaoCorrelacao = new Chart(document.getElementById('grafico-evolucao'), {
            type: 'line',
            data: { labels: [], datasets: [] },
            options: { maintainAspectRatio: false, scales: { y: { min: 0, max: 100 } } }
        });
        dispersaoCorrelacao = new Chart(document.getElementById('grafico-dispersao'), {
            type: 'scatter',
            data: { datasets: [] },
            options: { maintainAspectRatio: false, scales: {
                x: { min: 0, max: 100, title: { display: true, text: 'CPU (%)' } },
                y: { min: 0, max: 100, title: { display: true, text: 'RAM (%)' } }
            } }
        });
    }
    try {
        maquinasCorrelacao = await api.get('/mainframe/empresa/' + encodeURIComponent(empresaCorrelacao));
        for (const maquina of maquinasCorrelacao) {
            mainframeCorrelacao.add(new Option(maquina.hostname, maquina.id_mainframe));
        }
        periodoCorrelacao.addEventListener('change', carregarCorrelacao);
        mainframeCorrelacao.addEventListener('change', carregarCorrelacao);
        await carregarCorrelacao();
    } catch (erro) {
        console.error(erro);
        avisoCorrelacao.textContent = 'Não foi possível listar os mainframes.';
    }
}

iniciarCorrelacao();
