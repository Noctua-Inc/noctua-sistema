document.addEventListener('DOMContentLoaded', () => {
    const idEmpresa = sessionStorage.getItem('idEmpresa');
    const busca = document.getElementById('busca-hostname');
    const filtroLocalizacao = document.getElementById('filtro-localizacao');
    const filtroStatus = document.getElementById('filtro-status');
    const tabela = document.getElementById('lista-mainframes');
    const atualizacao = document.getElementById('data-atualizacao');
    const aviso = document.getElementById('erro-servidores');
    const todosComponentes = ["CPU", "DISCO", "RAM", "SWAP"];
    let mainframes = [];
    let carregando = false;

    const nomesStatus = { ativo: 'Ativo', inativo: 'Inativo', 'manutenção': 'Manutenção' };
    const classesStatus = { ativo: 'ativo', inativo: 'inativo', 'manutenção': 'manutencao' };

    function gerarEstrutura(usoComponente) {
        const estruturaUsoComponente = `
            <div class="progress-bar-bg">
                <div class="progress-bar-fill" style="width: ${Math.min(100, Math.max(0, usoComponente))}%;"></div>
            </div>
            <span>${usoComponente.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%</span>
        `;

        return estruturaUsoComponente;
    }

    function numero(valor) {
        return Number.isFinite(valor) ? valor : NaN;
    }

    function mibParaTb(valor) {
        return Number.isFinite(valor) ? valor * (1024 ** 2) / (1000 ** 4) : NaN;
    }

    function formatarRedeEmMiB(valorTb) {
        if (!Number.isFinite(valorTb)) return '—';
        const mib = valorTb * (1000 ** 4) / (1024 ** 2);
        return mib.toLocaleString('pt-BR', { maximumFractionDigits: 2 });
    }

    async function buscarTelemetria(hostname) {
        const atual = await api.get(`/gold/empresa/${idEmpresa}/${encodeURIComponent(hostname)}/monitoramento/componentes`);
        if (!atual) return null;

        const valores = atual.valores || {};
        return {
            hora_de_captura: atual.atualizado_em,
            porcentagem_cpu: numero(valores.cpu),
            porcentagem_disco: numero(valores.disco),
            porcentagem_ram: numero(valores.ram),
            media_swap_porcentagem: numero(valores.swap),
            dados_enviados_medio: mibParaTb(valores.enviados_mib),
            dados_recebidos_medio: mibParaTb(valores.recebidos_mib)
        };
    }

    function atualizarIndicadores() {
        let ativas = 0;
        let inativas = 0;
        let manutencao = 0;
        for (const mainframe of mainframes) {
            if (mainframe.status === 'ativo') ativas++;
            if (mainframe.status === 'inativo') inativas++;
            if (mainframe.status === 'manutenção') manutencao++;
        }
        document.getElementById('total-mainframes').textContent = mainframes.length;
        document.getElementById('total-ativas').textContent = ativas;
        document.getElementById('total-inativas').textContent = inativas;
        document.getElementById('total-manutencao').textContent = manutencao;
    }

    function preencherLocalizacoes() {
        const selecionada = filtroLocalizacao.value;
        const locaisAdicionados = [];
        filtroLocalizacao.innerHTML = '<option value="">Todas as localizações</option>';
        for (const mainframe of mainframes) {
            const idLocalizacao = String(mainframe.fk_localizacao);
            if (!locaisAdicionados.includes(idLocalizacao)) {
                const option = document.createElement('option');
                option.value = idLocalizacao;
                option.textContent = mainframe.localizacao_nome || mainframe.cidade || 'Sem localização';
                filtroLocalizacao.appendChild(option);
                locaisAdicionados.push(idLocalizacao);
            }
        }
        filtroLocalizacao.value = locaisAdicionados.includes(selecionada) ? selecionada : '';
    }

    function criarCelula(linha, texto) {
        const celula = document.createElement('td');
        celula.textContent = texto;
        linha.appendChild(celula);
        return celula;
    }

    function mostrarMensagem(texto) {
        tabela.innerHTML = '';
        const linha = document.createElement('tr');
        const celula = criarCelula(linha, texto);
        celula.colSpan = 9;
        celula.className = 'servidores-vazio';
        tabela.appendChild(linha);
    }

    function atualizarTabela() {
        const textoBusca = busca.value.trim().toLowerCase();
        tabela.innerHTML = '';
        let encontrados = 0;

        for (const mainframe of mainframes) {
            if (!mainframe.hostname.toLowerCase().includes(textoBusca)) continue;
            if (filtroLocalizacao.value && String(mainframe.fk_localizacao) !== filtroLocalizacao.value) continue;
            if (filtroStatus.value && mainframe.status !== filtroStatus.value) continue;

            const linha = document.createElement('tr');
            linha.className = 'servidores-linha';
            criarCelula(linha, mainframe.hostname);

            const telemetria = mainframe.telemetria;
            const camposComponentes = {
                CPU: 'porcentagem_cpu',
                DISCO: 'porcentagem_disco',
                RAM: 'porcentagem_ram',
                SWAP: 'media_swap_porcentagem'
            };

            for (const componente of todosComponentes) {
                const campo = camposComponentes[componente];
                const uso = telemetria ? Number(telemetria[campo]) : NaN;
                const celula = criarCelula(linha, Number.isFinite(uso) ? '' : 'Sem dados');
                if (!Number.isFinite(uso)) continue;
                celula.innerHTML = gerarEstrutura(uso);
                celula.title = 'Coleta em ' + (telemetria.hora_de_captura || '—');

                const barra = celula.querySelector('.progress-bar-fill');
                const limite = mainframe.parametrosDetalhados.find(parametro => parametro.tipo === componente);
                if (limite) {
                    const metrica = monitoramento.metricas[componente];
                    if (metrica) {
                        const [, minimo, maximo] = metrica;
                        if ((limite[maximo] != null && uso >= Number(limite[maximo])) || (limite[minimo] != null && uso <= Number(limite[minimo]))) {
                            barra.classList.replace('progress-bar-fill', 'progress-bar-fill-alert');
                        } else if (limite[maximo] != null && Number(limite[maximo]) - uso <= 15) {
                            barra.classList.replace('progress-bar-fill', 'progress-bar-fill-attention');
                        }
                    }
                }
            }

            const tx = telemetria ? Number(telemetria.dados_enviados_medio) : NaN;
            const rx = telemetria ? Number(telemetria.dados_recebidos_medio) : NaN;
            if (Number.isFinite(tx) && Number.isFinite(rx)) {
                const celulaRede = criarCelula(linha, `Tx: ${formatarRedeEmMiB(tx)} TB / Rx: ${formatarRedeEmMiB(rx)} TB`);
                celulaRede.title = 'Coleta em ' + (telemetria.hora_de_captura || '—');
            } else {
                criarCelula(linha, 'Sem dados');
            }

            criarCelula(linha, `${mainframe.sis_operacional} ${mainframe.versao_so}`);

            const status = document.createElement('span');
            status.className = `servidores-status ${classesStatus[mainframe.status] || ''}`;
            status.textContent = nomesStatus[mainframe.status] || mainframe.status;
            criarCelula(linha, '').appendChild(status);

            const destino = `dash-especifica.html?id_mainframe=${encodeURIComponent(mainframe.id_mainframe)}`;
            const link = document.createElement('a');
            link.href = destino;
            link.className = 'servidores-acessar';
            link.textContent = 'Acessar';
            link.setAttribute('aria-label', `Acessar dashboard de ${mainframe.hostname}`);
            criarCelula(linha, '').appendChild(link);
            linha.addEventListener('click', (event) => {
                if (!event.target.closest('a')) window.location.href = destino;
            });

            tabela.appendChild(linha);
            encontrados++;
        }

        if (encontrados === 0) {
            mostrarMensagem(mainframes.length === 0
                ? 'Nenhuma mainframe cadastrada.'
                : 'Nenhuma mainframe encontrada para os filtros selecionados.');
        }
    }

    async function carregarMainframes() {
        if (!idEmpresa) {
            window.location.href = '/login.html';
            return;
        }
        if (carregando) return;
        carregando = true;
        try {
            mainframes = await api.get(`/mainframe/empresa/${idEmpresa}`);

            let falhaTelemetria = false;
            await Promise.all(mainframes.map(async mainframe => {
                const [limites, coleta] = await Promise.allSettled([
                    api.get(`/parametro?id_mainframe=${mainframe.id_mainframe}`),
                    buscarTelemetria(mainframe.hostname)
                ]);
                mainframe.parametrosDetalhados = limites.value ?? [];
                mainframe.telemetria = coleta.value ?? null;
                if (coleta.status === 'rejected' || limites.status === 'rejected' || !mainframe.telemetria) falhaTelemetria = true;
            }));

            preencherLocalizacoes();
            atualizarIndicadores();
            atualizarTabela();

            const ultimaColeta = mainframes
                .map(m => m.telemetria?.hora_de_captura)
                .filter(Boolean)
                .sort()
                .at(-1);
            atualizacao.dateTime = ultimaColeta ?? '';
            atualizacao.textContent = ultimaColeta || '—';
            aviso.textContent = 'Parte dos dados de monitoramento não pôde ser consultada.';
            aviso.hidden = !falhaTelemetria;
        } catch (erro) {
            console.error(erro);
            aviso.textContent = 'Não foi possível atualizar as mainframes. Uma nova tentativa será feita automaticamente.';
            aviso.hidden = false;
            if (!atualizacao.dateTime) mostrarMensagem('Não foi possível carregar as mainframes.');
        } finally {
            carregando = false;
        }
    }

    busca.addEventListener('input', atualizarTabela);
    filtroLocalizacao.addEventListener('change', atualizarTabela);
    filtroStatus.addEventListener('change', atualizarTabela);
    carregarMainframes();
    setInterval(carregarMainframes, 60000);
});