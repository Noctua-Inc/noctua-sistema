let componenteSelecionado = 'CPU';
let metricaDiscoSelecionada = 'ocupacao';
const mainframes = ['MF-SPTECH-001', 'MF-SPTECH-002', 'MF-SPTECH-003', 'MF-SPTECH-004', 'MF-SPTECH-005'];
const horarios = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];
const dias = ['25/10', '26/10', '27/10', '28/10', '29/10', '30/10', '31/10'];
const coresPorHora = ['#dbeafe','#bfdbfe','#93c5fd','#bfdbfe','#dbeafe','#eff6ff','#dbeafe','#93c5fd','#60a5fa','#3b82f6','#2563eb','#1d4ed8','#2563eb','#1d4ed8','#1a1f71','#1d4ed8','#2563eb','#3b82f6','#60a5fa','#93c5fd','#bfdbfe','#dbeafe','#eff6ff','#dbeafe'];

function escrever(id, texto) {
    document.getElementById(id).textContent = texto;
}

function selecionarMainframe() {
    atualizarTela();
}

function escolherComponente(componente) {
    componenteSelecionado = componente;
    atualizarTela();
}

function escolherMetricaDisco(metrica) {
    metricaDiscoSelecionada = metrica;
    atualizarTela();
}

function atualizarTela() {
    let nome = 'CPU';
    let unidade = '%';
    let maiorPrevisto = 89;
    let menorPrevisto = 24;
    let minimo = 30;
    let maximo = 80;
    let erroMedio = '8,6 p.p.';
    let primeiraSaida = '46 min';
    let detalheSaida = 'Acima do máximo, às 14:46';
    let observado = [36, 44, 51, 68, 35, 49, 60, null, null, null, null, null, null];
    let previsto = [null, null, null, null, null, null, 60, 81, 89, 78, 55, 34, 24];
    let inferior = [null, null, null, null, null, null, 60, 69, 76, 63, 38, 17, 6];
    let superior = [null, null, null, null, null, null, 60, 90, 99, 93, 73, 53, 45];

    if (componenteSelecionado === 'RAM') {
        nome = 'RAM';
        maiorPrevisto = 86; menorPrevisto = 48;
        minimo = 20; maximo = 85; erroMedio = '4,2 p.p.';
        primeiraSaida = '2 h'; detalheSaida = 'Acima do máximo, às 16:00';
        observado = [51, 52, 56, 61, 55, 59, 63, null, null, null, null, null, null];
        previsto = [null, null, null, null, null, null, 63, 76, 86, 80, 69, 58, 48];
        inferior = [null, null, null, null, null, null, 63, 70, 79, 72, 60, 48, 37];
        superior = [null, null, null, null, null, null, 63, 82, 93, 88, 78, 68, 59];
    }
    if (componenteSelecionado === 'DISCO') {
        nome = 'ocupação do disco';
        maiorPrevisto = 69.5; menorPrevisto = 68;
        minimo = 10; maximo = 90; erroMedio = '0,3 p.p.';
        primeiraSaida = '—'; detalheSaida = 'Dentro da faixa nas próximas 6 horas';
        observado = [67, 67.2, 67.4, 67.3, 67.8, 67.9, 68, null, null, null, null, null, null];
        previsto = [null, null, null, null, null, null, 68, 68.2, 68.4, 68.7, 69, 69.2, 69.5];
        inferior = [null, null, null, null, null, null, 68, 68, 68.1, 68.2, 68.4, 68.5, 68.7];
        superior = [null, null, null, null, null, null, 68, 68.4, 68.7, 69.2, 69.6, 69.9, 70.3];
        if (metricaDiscoSelecionada !== 'ocupacao') {
            nome = 'leitura do disco'; unidade = ' MiB/s';
            maiorPrevisto = 120; menorPrevisto = 15;
            minimo = 20; maximo = 100; erroMedio = '9 MiB/s';
            primeiraSaida = '47 min'; detalheSaida = 'Acima do máximo, às 14:47';
            observado = [55, 66, 59, 76, 68, 74, 65, null, null, null, null, null, null];
            previsto = [null, null, null, null, null, null, 65, 110, 120, 87, 48, 24, 15];
            inferior = [null, null, null, null, null, null, 65, 98, 107, 71, 30, 5, 0];
            superior = [null, null, null, null, null, null, 65, 122, 133, 103, 66, 43, 35];
            if (metricaDiscoSelecionada === 'escrita') {
                nome = 'escrita do disco'; maiorPrevisto = 90; menorPrevisto = 12;
                minimo = 15; maximo = 80; erroMedio = '7 MiB/s';
                observado = [31, 40, 35, 51, 43, 48, 50, null, null, null, null, null, null];
                previsto = [null, null, null, null, null, null, 50, 83, 90, 64, 37, 20, 12];
                inferior = [null, null, null, null, null, null, 50, 74, 80, 52, 23, 4, 0];
                superior = [null, null, null, null, null, null, 50, 92, 100, 76, 51, 36, 30];
            }
        }
    }
    escrever('titulo-maior', 'Maior ' + nome + ' prevista');
    escrever('titulo-menor', 'Menor ' + nome + ' prevista');
    escrever('maior-previsto', maiorPrevisto + unidade);
    escrever('menor-previsto', menorPrevisto + unidade);
    escrever('limite-maximo', 'Máximo configurado: ' + maximo + unidade);
    escrever('limite-minimo', 'Mínimo configurado: ' + minimo + unidade);
    escrever('primeira-saida', primeiraSaida);
    escrever('detalhe-saida', detalheSaida);
    escrever('erro-medio', erroMedio);
    escrever('titulo-grafico-previsao', 'Histórico e previsão de ' + nome);
    escrever('subtitulo-grafico', 'Próximas 6 horas · faixa configurada: ' + minimo + unidade + ' a ' + maximo + unidade);
    escrever('titulo-mapa', 'Padrão de ' + nome + ' por dia e horário');
    escrever('unidade-tabela', 'Próximas 6 horas · valores em ' + unidade);
    const componentes = ['CPU', 'RAM', 'DISCO'];
    for (let i = 0; i < componentes.length; i++) {
        document.getElementById('botao-' + componentes[i]).setAttribute('aria-pressed', componentes[i] === componenteSelecionado);
    }
    const metricas = ['ocupacao', 'leitura', 'escrita'];
    for (let i = 0; i < metricas.length; i++) {
        document.getElementById('botao-' + metricas[i]).setAttribute('aria-pressed', metricas[i] === metricaDiscoSelecionada);
    }
    document.getElementById('campo-metrica-disco').hidden = componenteSelecionado !== 'DISCO';
    const limitesMinimos = [];
    const limitesMaximos = [];
    for (let i = 0; i < horarios.length; i++) {
        limitesMinimos.push(minimo); limitesMaximos.push(maximo);
    }
    const pontos = [];
    const cores = [];
    for (let dia = 0; dia < dias.length; dia++) {
        for (let hora = 0; hora < 24; hora++) {
            pontos.push({ x: hora, y: dia, texto: dias[dia] + ' às ' + hora + 'h · exemplo visual' });
            cores.push(coresPorHora[hora]);
        }
    }
    desenharGrafico({ grafico: { rotulos: horarios, observado: observado, previsto: previsto, inferior: inferior, superior: superior, minimo: limitesMinimos, maximo: limitesMaximos, eixoY: nome + ' (' + unidade.trim() + ')' } });
    desenharMapa({ mapa: { dias: dias, pontos: pontos, cores: cores } });
    preencherTabela(maiorPrevisto, menorPrevisto, minimo, maximo, unidade);
}

function preencherTabela(maior, menor, minimo, maximo, unidade) {
    const corpo = document.getElementById('tabela-previsao');
    corpo.innerHTML = '';
    for (let i = 0; i < mainframes.length; i++) {
        let situacao = 'Dentro da faixa';
        let classe = 'dentro';
        if (menor < minimo && maior > maximo) {
            situacao = 'Abaixo e acima'; classe = 'ambos';
        } else if (menor < minimo) {
            situacao = 'Abaixo do mínimo'; classe = 'abaixo';
        } else if (maior > maximo) {
            situacao = 'Acima do máximo'; classe = 'acima';
        }
        const linha = document.createElement('tr');
        const textos = [mainframes[i], menor + ' – ' + maior + unidade, minimo + ' – ' + maximo + unidade, situacao];
        for (let coluna = 0; coluna < textos.length; coluna++) {
            const celula = document.createElement('td');
            celula.textContent = textos[coluna];
            if (coluna === 3) celula.className = 'situacao-' + classe;
            linha.appendChild(celula);
        }
        if (i === document.getElementById('mainframe-previsao').selectedIndex) linha.className = 'selecionada';
        linha.onclick = function () {
            document.getElementById('mainframe-previsao').selectedIndex = i;
            atualizarTela();
        };
        corpo.appendChild(linha);
    }
}

let graficoConsumo;
let graficoMapa;

function desenharGrafico(metrica) {
    if (graficoConsumo) graficoConsumo.destroy();
    const g = metrica.grafico;
    const series = [
        { label: 'Observado', data: g.observado, borderColor: '#2563eb' },
        { label: 'Previsto', data: g.previsto, borderColor: '#1a1f71', borderDash: [7, 5] },
        { label: 'Limite mínimo', data: g.minimo, borderColor: '#0d9488', borderDash: [7, 5] },
        { label: 'Limite máximo', data: g.maximo, borderColor: '#d97706', borderDash: [7, 5] }
    ];
    if (g.inferior && g.superior) {
        series.push({ label: 'Faixa inferior', data: g.inferior, borderWidth: 0, pointRadius: 0 });
        series.push({ label: 'Faixa de previsão', data: g.superior, borderWidth: 0, pointRadius: 0, fill: '-1', backgroundColor: '#dbeafe' });
    }
    graficoConsumo = new Chart(document.getElementById('grafico-previsao'), {
        type: 'line', data: { labels: g.rotulos, datasets: series },
        options: {
            responsive: true, maintainAspectRatio: false, animation: false,
            elements: { point: { radius: 0, hitRadius: 8 }, line: { borderWidth: 2, tension: 0 } },
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: { display: false },
                tooltip: { filter: function (item) { return item.dataset.label !== 'Faixa inferior'; } }
            },
            scales: {
                x: { grid: { color: '#edf2f7' }, ticks: { color: '#64748b', maxTicksLimit: 13 } },
                y: { beginAtZero: true, title: { display: true, text: g.eixoY }, grid: { color: '#e2e8f0' } }
            }
        }
    });
    document.getElementById('legenda-faixa').hidden = !g.inferior || !g.superior;
    escrever('nivel-faixa', g.nivelFaixaTexto || '');
}

function desenharMapa(metrica) {
    if (graficoMapa) graficoMapa.destroy();
    const mapa = metrica.mapa;
    graficoMapa = new Chart(document.getElementById('mapa-previsao'), {
        type: 'scatter',
        data: { datasets: [{ data: mapa.pontos, pointStyle: 'rect', pointRadius: 11, pointHoverRadius: 12, backgroundColor: mapa.cores, borderWidth: 0 }] },
        options: {
            responsive: true, maintainAspectRatio: false, animation: false,
            plugins: {
                legend: { display: false },
                tooltip: { callbacks: { label: function (item) { return item.raw.texto; } } }
            },
            scales: {
                x: {
                    min: -0.5, max: 23.5, grid: { display: false },
                    afterBuildTicks: function (eixo) { eixo.ticks = [{ value: 0 }, { value: 4 }, { value: 8 }, { value: 12 }, { value: 16 }, { value: 20 }, { value: 23 }]; },
                    ticks: { autoSkip: false, callback: function (valor) { return valor + 'h'; } }
                },
                y: {
                    min: -0.5, max: 6.5, reverse: true, grid: { display: false },
                    afterBuildTicks: function (eixo) { eixo.ticks = [{ value: 0 }, { value: 1 }, { value: 2 }, { value: 3 }, { value: 4 }, { value: 5 }, { value: 6 }]; },
                    ticks: { autoSkip: false, callback: function (valor) { return mapa.dias[valor]; } }
                }
            }
        }
    });
}


atualizarTela();
