const empresaCorrelacao = sessionStorage.getItem('idEmpresa');
const periodoCorrelacao = document.getElementById('filtro-periodo');
const mainframeCorrelacao = document.getElementById('filtro-mainframe');
const avisoCorrelacao = document.getElementById('aviso-correlacao');
const recursosCorrelacao = ['cpu', 'ram', 'disco'];
const nomesCorrelacao = { cpu: 'CPU', ram: 'RAM', disco: 'Disco' };
const paresCorrelacao = [['cpu', 'ram'], ['cpu', 'disco'], ['ram', 'disco']];
const classesCorrelacao = {
    alta: ['correlacao-alta', 'forte'],
    moderada: ['correlacao-media', 'moderada'],
    fraca: ['correlacao-fraca', 'fraca'],
    sem_dados: ['correlacao-fraca', '']
};
const resumosCorrelacao = new Map();
let consultaCorrelacao = 0;
let evolucaoCorrelacao;
let dispersaoCorrelacao;

function mostrarCorrelacao(periodo, horas) {
    const matriz = periodo?.matriz;
    const valorFormatado = valor => valor == null ? '-' : valor.toLocaleString('pt-BR', {
        minimumFractionDigits: 2, maximumFractionDigits: 2
    });
    const tabela = document.getElementById('insights-correlacao');
    tabela.replaceChildren();
    document.querySelectorAll('.correlacao-kpi').forEach((card, i) => {
        const [x, y] = paresCorrelacao[i];
        const resultado = matriz?.[x]?.[y];
        const valor = resultado?.valor;
        const classe = classesCorrelacao[resultado?.classificacao ?? 'sem_dados'][0];
        const interpretacao = resultado?.interpretacao ?? 'Dados insuficientes para calcular.';
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
            const resultado = matriz?.[x]?.[y];
            const celula = linha.insertCell();
            celula.textContent = valorFormatado(resultado?.valor);
            celula.className = classesCorrelacao[resultado?.classificacao ?? 'sem_dados'][1];
        }
    }
    if (!evolucaoCorrelacao || !dispersaoCorrelacao) return;
    const pontos = periodo?.evolucao ?? [];
    const cores = ['#2563eb', '#059669', '#d97706'];
    evolucaoCorrelacao.data.labels = pontos.map(p => horas === '24' ? monitoramento.horario(p.horario)
        : new Date(p.horario).toLocaleDateString('pt-BR', { timeZone: monitoramento.fuso }));
    evolucaoCorrelacao.data.datasets = recursosCorrelacao.map((campo, i) => ({
        label: nomesCorrelacao[campo], data: pontos.map(p => p[campo]), borderColor: cores[i], pointRadius: 0
    }));
    evolucaoCorrelacao.update();
    dispersaoCorrelacao.data.datasets = [{
        label: 'CPU × RAM', backgroundColor: '#2563eb', data: periodo?.dispersao ?? []
    }];
    dispersaoCorrelacao.update();
}

async function buscarResumoCorrelacao(hostname) {
    const resposta = await fetch('/api/gold/empresa/' + encodeURIComponent(empresaCorrelacao)
        + '/' + encodeURIComponent(hostname) + '/correlacao/resumo.json');
    if (resposta.status === 404) return null;
    if (!resposta.ok) throw new Error('Não foi possível consultar a correlação na Gold.');
    return resposta.json();
}

async function carregarCorrelacao() {
    const consulta = ++consultaCorrelacao;
    const selecionada = mainframeCorrelacao.value;
    const horas = periodoCorrelacao.value;
    if (!selecionada) {
        mostrarCorrelacao(null, horas);
        avisoCorrelacao.textContent = 'Nenhum equipamento cadastrado.';
        return;
    }
    avisoCorrelacao.textContent = 'Carregando correlações.';
    try {
        if (!resumosCorrelacao.has(selecionada)) resumosCorrelacao.set(selecionada, buscarResumoCorrelacao(selecionada));
        const resumo = await resumosCorrelacao.get(selecionada);
        if (!resumo) resumosCorrelacao.delete(selecionada);
        if (consulta !== consultaCorrelacao) return;
        const periodo = resumo?.periodos?.[horas];
        mostrarCorrelacao(periodo, horas);
        avisoCorrelacao.textContent = periodo?.amostras
            ? 'Correlação de Pearson entre medições feitas no mesmo minuto e mainframe.'
            : 'Sem medições no período selecionado.';
    } catch (erro) {
        resumosCorrelacao.delete(selecionada);
        if (consulta !== consultaCorrelacao) return;
        console.error(erro);
        mostrarCorrelacao(null, horas);
        avisoCorrelacao.textContent = 'Não foi possível consultar a correlação na Gold.';
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
        const maquinas = await api.get('/mainframe/empresa/' + encodeURIComponent(empresaCorrelacao));
        for (const maquina of maquinas) {
            mainframeCorrelacao.add(new Option(maquina.hostname, maquina.hostname));
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
