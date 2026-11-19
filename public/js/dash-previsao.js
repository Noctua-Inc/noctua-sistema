const idEmpresa = sessionStorage.getItem('idEmpresa');
const caminhoBasePrevisoes = '/api/gold/empresa/' + idEmpresa + '/previsoes';

let componenteSelecionado = 'CPU';
let metricaDiscoSelecionada = 'ocupacao';
let dadosPrevisao;
let resumoPrevisao;
let graficoConsumo;

function escrever(id, texto) {
    const elemento = document.getElementById(id);
    elemento.textContent = texto;
}

function formatarHorario(horario) {
    const data = new Date(horario);
    return data.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'America/Sao_Paulo'
    });
}

function formatarValor(valor, unidade) {
    if (valor == null) {
        return '—';
    }

    const texto = valor.toLocaleString('pt-BR', {maximumFractionDigits: 2});
    if (unidade === '') {
        return texto;
    }
    if (unidade === '%') {
        return texto + '%';
    }
    return texto + ' ' + unidade;
}

function janelaGrafico(horarioAtual, janelaPublicada) {
    if (janelaPublicada) {
        return {inicio: Date.parse(janelaPublicada.inicio), fim: Date.parse(janelaPublicada.fim)};
    }
    const umaHora = 60 * 60 * 1000;
    const data = new Date(horarioAtual);
    const horario = data.getTime();
    const horaInteira = Math.floor(horario / umaHora) * umaHora;
    const inicio = horaInteira - 6 * umaHora;
    const fim = horaInteira + 6 * umaHora;

    return {inicio: inicio, fim: fim};
}

async function carregarMainframes() {
    const seletor = document.getElementById('mainframe-previsao');
    const mensagem = document.getElementById('mensagem-mainframes');

    if (!idEmpresa) {
        seletor.innerHTML = '<option>Entre na sua conta</option>';
        mensagem.textContent = 'Entre na sua conta para listar as mainframes da empresa.';
        mensagem.hidden = false;
        return;
    }

    try {
        const mainframes = await api.get('/mainframe/empresa/' + idEmpresa);
        seletor.innerHTML = '';

        for (let i = 0; i < mainframes.length; i++) {
            const opcao = document.createElement('option');
            opcao.value = mainframes[i].id_mainframe;
            opcao.textContent = mainframes[i].hostname;
            seletor.appendChild(opcao);
        }

        if (mainframes.length === 0) {
            seletor.innerHTML = '<option>Nenhuma mainframe cadastrada</option>';
            return;
        }

        await carregarResumo();
        await selecionarMainframe();
    } catch (erro) {
        seletor.innerHTML = '<option>Não foi possível carregar</option>';
        mensagem.textContent = 'Não foi possível carregar as mainframes.';
        mensagem.hidden = false;
    }
}

async function carregarResumo() {
    resumoPrevisao = null;
    try {
        const caminho = caminhoBasePrevisoes + '/resumo.json';
        const resposta = await fetch(caminho, {cache: 'no-store'});

        if (resposta.ok) {
            resumoPrevisao = await resposta.json();
        } else {
            resumoPrevisao = null;
        }
    } catch (erro) {
        resumoPrevisao = null;
    }
}

async function selecionarMainframe(silencioso = false) {
    const seletor = document.getElementById('mainframe-previsao');
    const hostname = seletor.options[seletor.selectedIndex].textContent;
    const mensagem = document.getElementById('mensagem-mainframes');
    const conteudo = document.getElementById('conteudo-mainframe');

    seletor.disabled = true;
    if (!silencioso) {
        dadosPrevisao = null;
        conteudo.hidden = true;
        escrever('atualizacao-previsao', '—');
        mensagem.textContent = 'Carregando previsão...';
        mensagem.hidden = false;
    }

    try {
        const caminho = '/api/gold/empresa/' + idEmpresa + '/' + encodeURIComponent(hostname) + '/previsoes.json';
        const resposta = await fetch(caminho, {cache: 'no-store'});

        if (resposta.ok) {
            dadosPrevisao = await resposta.json();
            atualizarTela();
            conteudo.hidden = false;
            mensagem.hidden = true;
        } else if (resposta.status === 404) {
            mensagem.hidden = false;
            mensagem.textContent = 'Previsão ainda não disponível para esta mainframe.';
        } else {
            const erro = await resposta.json();
            mensagem.hidden = false;
            mensagem.textContent = erro.erro;
        }
    } catch (erro) {
        mensagem.hidden = false;
        mensagem.textContent = 'Não foi possível carregar a previsão.';
    }

    seletor.disabled = false;
}

function escolherComponente(componente) {
    componenteSelecionado = componente;
    atualizarTela();
}

function escolherMetricaDisco(metrica) {
    metricaDiscoSelecionada = metrica;
    atualizarTela();
}

function selecionarMetrica(componentes) {
    if (componenteSelecionado === 'CPU') {
        return componentes.cpu.uso;
    } else if (componenteSelecionado === 'RAM') {
        return componentes.ram.uso;
    } else {
        return componentes.disco[metricaDiscoSelecionada];
    }
}

function atualizarTela() {
    let nome = componenteSelecionado;
    if (componenteSelecionado === 'DISCO') {
        nome = metricaDiscoSelecionada + ' do disco';
    }
    escrever('titulo-secao-empresa', 'Visão da empresa · ' + nome);
    preencherIndicadoresEmpresa();
    preencherTabela();
    atualizarBotoes();

    if (!dadosPrevisao) {
        return;
    }

    const metrica = selecionarMetrica(dadosPrevisao.componentes);

    preencherIndicadores(metrica);
    preencherTitulos(metrica, nome);
    desenharGrafico(metrica);
}

function exibirComparacao(id, comparacao) {
    const etiqueta = document.getElementById(id);
    const setas = {cima: '↑ ', baixo: '↓ ', igual: '→ '};
    etiqueta.textContent = (setas[comparacao?.direcao] ?? '') + (comparacao?.texto ?? 'Sem comparação');
    etiqueta.classList.toggle('melhora', comparacao?.avaliacao === 'melhora');
    etiqueta.classList.toggle('piora', comparacao?.avaliacao === 'piora');
}

function exibirKpi(indicador, idValor, idDetalhe, idComparacao) {
    escrever(idValor, indicador?.exibicao?.valor ?? '—');
    escrever(idDetalhe, indicador?.exibicao?.detalhe ?? 'Indicador ainda indisponível.');
    exibirComparacao(idComparacao, indicador?.comparacao);
}

function preencherIndicadores(metrica) {
    const indicadores = metrica.indicadores;
    const cartao = document.getElementById('kpi-proximo-desvio');
    exibirKpi(indicadores?.duracao_desvio, 'duracao-desvio', 'detalhe-duracao', 'comparacao-duracao');
    exibirKpi(indicadores?.intensidade_desvio, 'intensidade-desvio', 'detalhe-intensidade', 'comparacao-intensidade');

    if (dadosPrevisao.versao_schema === 2) {
        cartao.classList.toggle('kpi-urgencia', metrica.proximo_desvio?.status === 'em_desvio');
        exibirKpi(indicadores?.tempo_ate_desvio, 'primeira-saida', 'detalhe-saida', 'comparacao-tempo');
        return;
    }

    exibirComparacao('comparacao-tempo');
    const janela = janelaGrafico(metrica.graficos.atual.horario);
    const ate = formatarHorario(janela.fim);
    cartao.classList.remove('kpi-urgencia');
    escrever('primeira-saida', '—');

    const atual = metrica.graficos.atual.valor;
    if (atual != null && metrica.limite_minimo != null && atual < metrica.limite_minimo) {
        cartao.classList.add('kpi-urgencia');
        escrever('primeira-saida', 'Já fora da faixa');
        escrever('detalhe-saida', 'Consumo observado abaixo do mínimo.');
    } else if (atual != null && metrica.limite_maximo != null && atual > metrica.limite_maximo) {
        cartao.classList.add('kpi-urgencia');
        escrever('primeira-saida', 'Já fora da faixa');
        escrever('detalhe-saida', 'Consumo observado acima do máximo.');
    } else if (metrica.limite_minimo == null || metrica.limite_maximo == null) {
        escrever('detalhe-saida', 'Limites ainda não configurados.');
    } else if (metrica.graficos.previsao.length === 0) {
        escrever('detalhe-saida', 'Previsão ainda não disponível.');
    } else if (indicadores.primeira_saida_em_minutos == null) {
        escrever('primeira-saida', 'Sem desvio previsto');
        escrever('detalhe-saida', 'Dentro dos limites até ' + ate + '.');
    } else {
        const minutos = indicadores.primeira_saida_em_minutos;
        const horarioSaida = new Date(metrica.graficos.atual.horario).getTime() + minutos * 60000;
        const tipo = indicadores.primeira_saida_tipo === 'abaixo' ? 'Abaixo do mínimo' : 'Acima do máximo';
        escrever('primeira-saida', minutos + ' min');
        escrever('detalhe-saida', tipo + ' às ' + formatarHorario(horarioSaida)
            + ' · coleta das ' + formatarHorario(metrica.graficos.atual.horario));
    }
}

function preencherIndicadoresEmpresa() {
    if (resumoPrevisao?.versao_schema === 2) {
        const indicadores = selecionarMetrica(resumoPrevisao.componentes).indicadores;
        exibirKpi(indicadores?.maior_concentracao, 'horario-concentracao', 'detalhe-concentracao', 'comparacao-concentracao');
        exibirKpi(indicadores?.mainframes_com_desvio, 'mainframes-com-desvio', 'detalhe-mainframes-desvio', 'comparacao-mainframes');
        return;
    }
    exibirComparacao('comparacao-concentracao');
    exibirComparacao('comparacao-mainframes');
    escrever('horario-concentracao', '—');
    escrever('mainframes-com-desvio', '—');
    escrever('detalhe-concentracao', 'Resumo da empresa ainda não disponível.');
    escrever('detalhe-mainframes-desvio', 'Resumo da empresa ainda não disponível.');
    if (!resumoPrevisao) return;
    const metrica = selecionarMetrica(resumoPrevisao.componentes);
    const indicadores = metrica.indicadores;
    if (!indicadores) {
        escrever('detalhe-concentracao', 'Aguardando os novos indicadores da ETL.');
        escrever('detalhe-mainframes-desvio', 'Aguardando os novos indicadores da ETL.');
        return;
    }
    if (indicadores.mainframes_com_previsao === 0) {
        escrever('detalhe-concentracao', 'Nenhuma previsão disponível no período.');
        escrever('detalhe-mainframes-desvio', 'Nenhuma previsão disponível no período.');
        return;
    }
    escrever('mainframes-com-desvio', indicadores.mainframes_com_desvio + ' de ' + indicadores.mainframes_com_previsao);
    escrever('detalhe-mainframes-desvio', 'Empresa · de ' + formatarHorario(indicadores.inicio_previsao) + ' até ' + formatarHorario(indicadores.fim_previsao));
    const concentracao = indicadores.maior_concentracao;
    if (concentracao == null) {
        escrever('horario-concentracao', 'Sem desvios previstos');
        escrever('detalhe-concentracao', 'Nenhuma mainframe fora dos limites no período.');
    } else {
        escrever('horario-concentracao', formatarHorario(concentracao.inicio) + '–' + formatarHorario(concentracao.fim));
        let texto = ' mainframes com desvios simultâneos.';
        if (concentracao.quantidade === 1) texto = ' mainframe com desvio previsto.';
        escrever('detalhe-concentracao', concentracao.quantidade + texto);
    }
}

function preencherTitulos(metrica, nome) {
    const janela = janelaGrafico(metrica.graficos.atual.horario, metrica.janela_grafico);
    const ate = formatarHorario(janela.fim);
    const minimo = formatarValor(metrica.limite_minimo, metrica.unidade);
    const maximo = formatarValor(metrica.limite_maximo, metrica.unidade);
    const dataAtualizacao = new Date(dadosPrevisao.atualizado_em);
    const atualizacao = dataAtualizacao.toLocaleString('pt-BR', {
        timeZone: 'America/Sao_Paulo'
    });

    escrever('titulo-grafico-previsao', 'Histórico e previsão de ' + nome);
    escrever('subtitulo-grafico', 'Previsão até ' + ate + ' · faixa configurada: ' + minimo + ' a ' + maximo);
    escrever('atualizacao-previsao', atualizacao);
}

function atualizarBotoes() {
    const componentes = ['CPU', 'RAM', 'DISCO'];
    for (let i = 0; i < componentes.length; i++) {
        const botao = document.getElementById('botao-' + componentes[i]);
        if (componentes[i] === componenteSelecionado) {
            botao.setAttribute('aria-pressed', 'true');
        } else {
            botao.setAttribute('aria-pressed', 'false');
        }
    }

    const metricas = ['ocupacao', 'leitura', 'escrita'];
    for (let i = 0; i < metricas.length; i++) {
        const botao = document.getElementById('botao-' + metricas[i]);
        if (metricas[i] === metricaDiscoSelecionada) {
            botao.setAttribute('aria-pressed', 'true');
        } else {
            botao.setAttribute('aria-pressed', 'false');
        }
    }

    const campoDisco = document.getElementById('campo-metrica-disco');
    if (componenteSelecionado === 'DISCO') {
        campoDisco.hidden = false;
    } else {
        campoDisco.hidden = true;
    }
}

function criarCelula(linha, texto) {
    const celula = document.createElement('td');
    celula.textContent = texto;
    linha.appendChild(celula);
    return celula;
}

function mensagemTabela(texto) {
    const corpo = document.getElementById('tabela-previsao');
    corpo.innerHTML = '';
    const linha = document.createElement('tr');
    const celula = criarCelula(linha, texto);
    celula.colSpan = 4;
    corpo.appendChild(linha);
}

function preencherTabela() {
    if (!resumoPrevisao) {
        mensagemTabela('Resumo ainda não disponível para esta empresa.');
        return;
    }

    const metrica = selecionarMetrica(resumoPrevisao.componentes);
    const janela = janelaGrafico(resumoPrevisao.atualizado_em, metrica.periodo_avaliado);
    const ate = formatarHorario(janela.fim);
    escrever('unidade-tabela', 'Previsão até ' + ate + ' · valores em ' + metrica.unidade);

    const corpo = document.getElementById('tabela-previsao');
    const seletor = document.getElementById('mainframe-previsao');
    corpo.innerHTML = '';

    for (let i = 0; i < metrica.mainframes.length; i++) {
        const item = metrica.mainframes[i];
        const linha = document.createElement('tr');
        linha.classList.toggle('previsao-mainframe-selecionada', String(item.id_mainframe) === seletor.value);
        const menor = formatarValor(item.menor_previsto, '');
        const maior = formatarValor(item.maior_previsto, metrica.unidade);
        const minimo = formatarValor(item.limite_minimo, '');
        const maximo = formatarValor(item.limite_maximo, metrica.unidade);

        criarCelula(linha, item.hostname);
        criarCelula(linha, item.exibicao?.faixa_prevista ?? menor + ' – ' + maior);
        criarCelula(linha, item.exibicao?.limites ?? minimo + ' – ' + maximo);
        const situacao = document.createElement('span');
        situacao.className = 'previsao-situacao';
        situacao.textContent = item.exibicao?.situacao ?? item.situacao ?? '—';
        criarCelula(linha, '').appendChild(situacao);

        if (item.exibicao) {
            const destaque = item.exibicao.destaque;
            if (['normal', 'atencao', 'alerta'].includes(destaque)) situacao.classList.add(destaque);
        } else if (item.situacao === 'Dentro da faixa') {
            situacao.classList.add('situacao-dentro');
        } else if (item.situacao === 'Abaixo e acima') {
            situacao.classList.add('situacao-ambos');
        } else if (item.situacao === 'Abaixo do mínimo') {
            situacao.classList.add('situacao-abaixo');
        } else if (item.situacao === 'Acima do máximo') {
            situacao.classList.add('situacao-acima');
        }

        linha.onclick = function () {
            const anterior = seletor.value;
            seletor.value = item.id_mainframe;
            if (seletor.value === '') {
                seletor.value = anterior;
                return;
            }
            selecionarMainframe();
        };
        corpo.appendChild(linha);
    }

    if (metrica.mainframes.length === 0) {
        mensagemTabela('Nenhuma previsão disponível.');
    }
}

function desenharGrafico(metrica) {
    if (graficoConsumo) {
        graficoConsumo.destroy();
    }

    const dados = metrica.graficos;
    const observado = [];
    const previsto = [];
    const tamanhoPontos = [];

    for (let i = 0; i < dados.historico.length; i++) {
        const ponto = dados.historico[i];
        const data = new Date(ponto.horario);
        observado.push({x: data.getTime(), y: ponto.valor, tipo: 'Média horária'});
        tamanhoPontos.push(0);
    }

    const dataAtual = new Date(dados.atual.horario);
    const atual = {
        x: dataAtual.getTime(),
        y: dados.atual.valor,
        tipo: 'Média do minuto'
    };
    observado.push(atual);
    tamanhoPontos.push(4);
    previsto.push(atual);
    for (let i = 0; i < dados.previsao.length; i++) {
        const ponto = dados.previsao[i];
        const data = new Date(ponto.horario);
        const horario = data.getTime();

        previsto.push({x: horario, y: ponto.valor});
    }

    const janela = janelaGrafico(dados.atual.horario, metrica.janela_grafico);
    const limitesMinimos = [
        {x: janela.inicio, y: metrica.limite_minimo},
        {x: janela.fim, y: metrica.limite_minimo}
    ];
    const limitesMaximos = [
        {x: janela.inicio, y: metrica.limite_maximo},
        {x: janela.fim, y: metrica.limite_maximo}
    ];
    const series = [
        {
            label: 'Observado',
            data: observado,
            borderColor: '#2563eb',
            pointRadius: tamanhoPontos
        },
        {
            label: 'Previsto',
            data: previsto,
            borderColor: '#1a1f71',
            borderDash: [7, 5]
        },
        {
            label: 'Limite mínimo',
            data: limitesMinimos,
            borderColor: '#0d9488',
            borderDash: [7, 5]
        },
        {
            label: 'Limite máximo',
            data: limitesMaximos,
            borderColor: '#d97706',
            borderDash: [7, 5]
        }
    ];

    graficoConsumo = new Chart(document.getElementById('grafico-previsao'), {
        type: 'line',
        data: {datasets: series},
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            elements: {
                point: {radius: 0, hitRadius: 8},
                line: {borderWidth: 2}
            },
            interaction: {mode: 'nearest', intersect: false, axis: 'xy'},
            plugins: {
                legend: {display: false},
                tooltip: {
                    filter: function (item) {
                        if (item.dataset.label === 'Observado' || item.dataset.label === 'Previsto') {
                            return true;
                        }
                        return false;
                    },
                    callbacks: {
                        title: function (itens) {
                            return formatarHorario(itens[0].parsed.x);
                        },
                        label: function (item) {
                            let titulo = 'Previsto · média do minuto';
                            if (item.raw.tipo) {
                                titulo = item.raw.tipo;
                            }
                            return titulo + ': ' + formatarValor(item.parsed.y, metrica.unidade);
                        }
                    }
                }
            },
            scales: {
                x: {
                    type: 'linear',
                    min: janela.inicio,
                    max: janela.fim,
                    grid: {color: '#edf2f7'},
                    ticks: {
                        stepSize: 3600000,
                        autoSkip: false,
                        maxRotation: 0,
                        color: '#64748b',
                        callback: function (valor) {
                            return formatarHorario(valor);
                        }
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {display: true, text: metrica.unidade},
                    grid: {color: '#e2e8f0'}
                }
            }
        }
    });
}

carregarMainframes();

setInterval(async function () {
    const seletor = document.getElementById('mainframe-previsao');
    if (seletor.disabled) return;
    seletor.disabled = true;
    await carregarResumo();
    preencherIndicadoresEmpresa();
    preencherTabela();
    await selecionarMainframe(true);
}, 60000);
