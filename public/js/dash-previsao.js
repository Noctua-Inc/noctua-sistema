const idEmpresa = sessionStorage.getItem('idEmpresa');
const caminhoBasePrevisoes = '';

let componenteSelecionado = 'CPU';
let metricaDiscoSelecionada = 'ocupacao';
let dadosPrevisao;
let resumoPrevisao;
let graficoConsumo;
let graficoMapa;

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

function janelaGrafico(horarioAtual) {
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
    if (caminhoBasePrevisoes === '') {
        return;
    }

    try {
        // Caminho para pegar o resumo das previsões das mainframes de determinada empresa
        const caminho = caminhoBasePrevisoes + '/' + idEmpresa + '/resumo.json';
        const resposta = await fetch(caminho);

        if (resposta.ok) {
            resumoPrevisao = await resposta.json();
        } else {
            resumoPrevisao = null;
        }
    } catch (erro) {
        resumoPrevisao = null;
    }
}

async function selecionarMainframe() {
    const seletor = document.getElementById('mainframe-previsao');
    const idMainframe = seletor.value;
    const mensagem = document.getElementById('mensagem-mainframes');
    const conteudo = document.getElementById('conteudo-previsao');

    seletor.disabled = true;
    dadosPrevisao = null;
    conteudo.hidden = true;
    escrever('atualizacao-previsao', '—');
    mensagem.textContent = 'Carregando previsão...';
    mensagem.hidden = false;

    if (caminhoBasePrevisoes === '') {
        mensagem.textContent = 'Previsão ainda não disponível.';
        seletor.disabled = false;
        return;
    }

    try {
        // Fetch para acessar o caminho do bucket gold de determinada mainframe de uma empresa
        const caminho = caminhoBasePrevisoes + '/' + idEmpresa + '/' + idMainframe + '.json';
        const resposta = await fetch(caminho);

        if (resposta.ok) {
            dadosPrevisao = await resposta.json();
            atualizarTela();
            conteudo.hidden = false;
            mensagem.hidden = true;
        } else {
            mensagem.textContent = 'Previsão ainda não disponível para esta mainframe.';
        }
    } catch (erro) {
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
    if (!dadosPrevisao) {
        return;
    }

    const metrica = selecionarMetrica(dadosPrevisao.componentes);
    let nome = componenteSelecionado;
    if (componenteSelecionado === 'DISCO') {
        nome = metricaDiscoSelecionada + ' do disco';
    }

    preencherIndicadores(metrica, nome);
    preencherTitulos(metrica, nome);
    atualizarBotoes();
    desenharGrafico(metrica);
    desenharMapa(metrica);
    preencherTabela();
}

function preencherIndicadores(metrica, nome) {
    const indicadores = metrica.indicadores;
    const janela = janelaGrafico(metrica.graficos.atual.horario);
    const ate = formatarHorario(janela.fim);

    escrever('titulo-maior', 'Maior ' + nome + ' prevista');
    escrever('titulo-menor', 'Menor ' + nome + ' prevista');
    escrever('maior-previsto', formatarValor(indicadores.maior_previsto, metrica.unidade));
    escrever('menor-previsto', formatarValor(indicadores.menor_previsto, metrica.unidade));
    escrever('limite-maximo', 'Máximo configurado: ' + formatarValor(metrica.limite_maximo, metrica.unidade));
    escrever('limite-minimo', 'Mínimo configurado: ' + formatarValor(metrica.limite_minimo, metrica.unidade));
    escrever('erro-medio', formatarValor(indicadores.erro_medio, indicadores.unidade_erro));

    const minutos = indicadores.primeira_saida_em_minutos;
    escrever('primeira-saida', '—');

    if (metrica.graficos.previsao.length === 0) {
        escrever('detalhe-saida', 'Previsão ainda não disponível.');
    } else if (minutos == null) {
        escrever('detalhe-saida', 'Nenhum ponto previsto fora da faixa até ' + ate);
    } else if (minutos === 0) {
        escrever('primeira-saida', '0 min');
        escrever('detalhe-saida', 'Já está fora da faixa');
    } else {
        const atual = new Date(metrica.graficos.atual.horario);
        const horarioSaida = atual.getTime() + minutos * 60000;
        let tipo = 'Acima do máximo';
        if (indicadores.primeira_saida_tipo === 'abaixo') {
            tipo = 'Abaixo do mínimo';
        }

        escrever('primeira-saida', minutos + ' min');
        escrever('detalhe-saida', tipo + ', às ' + formatarHorario(horarioSaida));
    }
}

function preencherTitulos(metrica, nome) {
    const janela = janelaGrafico(metrica.graficos.atual.horario);
    const ate = formatarHorario(janela.fim);
    const minimo = formatarValor(metrica.limite_minimo, metrica.unidade);
    const maximo = formatarValor(metrica.limite_maximo, metrica.unidade);
    const dataAtualizacao = new Date(dadosPrevisao.atualizado_em);
    const atualizacao = dataAtualizacao.toLocaleString('pt-BR', {
        timeZone: 'America/Sao_Paulo'
    });

    escrever('titulo-grafico-previsao', 'Histórico e previsão de ' + nome);
    escrever('subtitulo-grafico', 'Previsão até ' + ate + ' · faixa configurada: ' + minimo + ' a ' + maximo);
    escrever('titulo-mapa', 'Padrão de ' + nome + ' por dia e horário');
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
    const janela = janelaGrafico(resumoPrevisao.atualizado_em);
    const ate = formatarHorario(janela.fim);
    escrever('unidade-tabela', 'Previsão até ' + ate + ' · valores em ' + metrica.unidade);

    const corpo = document.getElementById('tabela-previsao');
    const seletor = document.getElementById('mainframe-previsao');
    corpo.innerHTML = '';

    for (let i = 0; i < metrica.mainframes.length; i++) {
        const item = metrica.mainframes[i];
        const linha = document.createElement('tr');
        const menor = formatarValor(item.menor_previsto, '');
        const maior = formatarValor(item.maior_previsto, metrica.unidade);
        const minimo = formatarValor(item.limite_minimo, '');
        const maximo = formatarValor(item.limite_maximo, metrica.unidade);

        criarCelula(linha, item.hostname);
        criarCelula(linha, menor + ' – ' + maior);
        criarCelula(linha, minimo + ' – ' + maximo);
        const situacao = criarCelula(linha, item.situacao);

        if (item.situacao === 'Dentro da faixa') {
            situacao.className = 'situacao-dentro';
        } else if (item.situacao === 'Abaixo e acima') {
            situacao.className = 'situacao-ambos';
        } else if (item.situacao === 'Abaixo do mínimo') {
            situacao.className = 'situacao-abaixo';
        } else if (item.situacao === 'Acima do máximo') {
            situacao.className = 'situacao-acima';
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
    const inferior = [];
    const superior = [];
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
    inferior.push(atual);
    superior.push(atual);

    let temFaixa = false;
    for (let i = 0; i < dados.previsao.length; i++) {
        const ponto = dados.previsao[i];
        const data = new Date(ponto.horario);
        const horario = data.getTime();

        previsto.push({x: horario, y: ponto.valor});
        inferior.push({x: horario, y: ponto.inferior});
        superior.push({x: horario, y: ponto.superior});
        if (ponto.inferior != null && ponto.superior != null) {
            temFaixa = true;
        }
    }

    const janela = janelaGrafico(dados.atual.horario);
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

    if (temFaixa) {
        series.push({
            label: 'Faixa inferior',
            data: inferior,
            borderWidth: 0
        });
        series.push({
            label: 'Faixa de previsão',
            data: superior,
            borderWidth: 0,
            fill: '-1',
            backgroundColor: '#dbeafe'
        });
    }
    document.getElementById('legenda-faixa').hidden = !temFaixa;

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

function desenharMapa(metrica) {
    if (graficoMapa) {
        graficoMapa.destroy();
    }

    const mapa = metrica.graficos.mapa;
    const pontos = [];
    const cores = [];
    const dias = [];
    const horas = [];
    const diaAtual = metrica.graficos.atual.horario.substring(0, 10);
    const horaAtual = Number(metrica.graficos.atual.horario.substring(11, 13));
    let diaAnterior = '';
    let numeroDia = -1;

    for (let hora = 0; hora < 24; hora++) {
        horas.push(hora + 'h');
    }

    for (let i = 0; i < mapa.length; i++) {
        const ponto = mapa[i];
        if (ponto.dia !== diaAnterior) {
            const dia = ponto.dia.substring(8, 10);
            const mes = ponto.dia.substring(5, 7);
            dias.push(dia + '/' + mes);
            diaAnterior = ponto.dia;
            numeroDia++;
        }

        let consumo = 'Sem dados';
        if (ponto.media != null) {
            consumo = formatarValor(ponto.media, metrica.unidade);
        }
        let texto = ponto.dia + ' às ' + ponto.hora + 'h: ' + consumo;
        if (ponto.media != null && ponto.dia === diaAtual && ponto.hora === horaAtual) {
            texto = texto + ' · média parcial';
        }
        pontos.push({x: horas[ponto.hora], y: dias[numeroDia], texto: texto});

        if (ponto.intensidade == null || ponto.media == null) {
            cores.push('#e5e7eb');
        } else {
            const opacidade = 0.08 + ponto.intensidade * 0.92;
            const cor = 'rgba(26, 31, 113, ' + opacidade + ')';
            cores.push(cor);
        }
    }

    graficoMapa = new Chart(document.getElementById('mapa-previsao'), {
        type: 'scatter',
        data: {
            datasets: [{
                data: pontos,
                pointStyle: 'rect',
                pointRadius: 11,
                pointHoverRadius: 12,
                backgroundColor: cores,
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            plugins: {
                legend: {display: false},
                tooltip: {
                    callbacks: {
                        label: function (item) {
                            return item.raw.texto;
                        }
                    }
                }
            },
            scales: {
                x: {
                    type: 'category',
                    labels: horas,
                    offset: true,
                    grid: {display: false},
                    ticks: {maxTicksLimit: 7}
                },
                y: {
                    type: 'category',
                    labels: dias,
                    offset: true,
                    reverse: false,
                    grid: {display: false},
                    ticks: {autoSkip: false}
                }
            }
        }
    });
}

carregarMainframes();
