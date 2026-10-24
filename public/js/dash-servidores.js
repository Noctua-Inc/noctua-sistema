document.addEventListener('DOMContentLoaded', () => {
    const idEmpresa = sessionStorage.getItem('idEmpresa');
    const busca = document.getElementById('busca-hostname');
    const filtroLocalizacao = document.getElementById('filtro-localizacao');
    const filtroStatus = document.getElementById('filtro-status');
    const tabela = document.getElementById('lista-mainframes');
    const atualizacao = document.getElementById('data-atualizacao');
    const aviso = document.getElementById('erro-servidores');
    const todosComponentes = ["CPU", "DISCO", "RAM", "SWAP"]
    let mainframes = [];
    let carregando = false;

    let usoComponente = 0;

    const nomesStatus = { ativo: 'Ativo', inativo: 'Inativo', 'manutenção': 'Manutenção' };
    const classesStatus = { ativo: 'ativo', inativo: 'inativo', 'manutenção': 'manutencao' };

    function gerarEstrutura(usoComponente) {
        const estruturaUsoComponente = `
            <div class="progress-bar-bg">
                <div class="progress-bar-fill" style="width: ${usoComponente}%;"></div>
            </div>
            <span>${usoComponente}%</span>
        `

        return estruturaUsoComponente;
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
        celula.innerHTML = texto;
        linha.appendChild(celula);
        return celula;
    }

    function mostrarMensagem(texto) {
        tabela.innerHTML = '';
        const linha = document.createElement('tr');
        const celula = criarCelula(linha, texto);
        celula.colSpan = 6;
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
           
            let componentesMainframe = String(mainframe.componentes).replaceAll(" ", "").split(",");
            let parametrosMainframe = String(mainframe.parametros).replaceAll(" ", "").split(",");            

            for (let i = 0; i < todosComponentes.length; i++) {
                let usoComponente = Number((Math.random() * (100 - 60) + 60).toFixed(0));
                let componenteAtual = todosComponentes[i];

                if (componentesMainframe.includes(componenteAtual)) {
                    let celulaCriada = criarCelula(linha, gerarEstrutura(usoComponente));

                    let barraProcresso = celulaCriada.querySelector(".progress-bar-fill");

                    let indexMainframe = componentesMainframe.indexOf(componenteAtual);
                    let parametroAtual = Number(parametrosMainframe[indexMainframe]);

                    if (parametroAtual <= usoComponente) {
                        barraProcresso.classList.replace("progress-bar-fill", "progress-bar-fill-alert");
                    } else if(Math.abs(parametroAtual - usoComponente) <= 15) {
                        barraProcresso.classList.replace("progress-bar-fill", "progress-bar-fill-attention");
                    }
                } else {
                    criarCelula(linha, "Não Monitorado");
                }
            }
            
            criarCelula(linha, `${mainframe.sis_operacional} ${mainframe.versao_so}`);
            criarCelula(linha, mainframe.componentes || 'Nenhum componente');

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
            preencherLocalizacoes();
            atualizarIndicadores();
            atualizarTabela();

            // Mostra a última consulta bem-sucedida, não o horário de execução da ETL.
            const agora = new Date();
            atualizacao.dateTime = agora.toISOString();
            atualizacao.textContent = agora.toLocaleString('pt-BR', {
                timeZone: 'America/Sao_Paulo',
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit',
            });
            aviso.hidden = true;
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

    setInterval(() => {
        let linhas = tabela.getElementsByClassName('servidores-linha');

        for (let l = 0; l < linhas.length; l++) {
            let linhaAtual = linhas[l];
            let mainframeObj = mainframes[l];

            let componentesMainframe = String(mainframeObj.componentes).replaceAll(" ", "").split(",");
            let parametrosMainframe = String(mainframeObj.parametros).replaceAll(" ", "").split(",");
            let celulas = linhaAtual.getElementsByTagName('td');

            for (let i = 0; i < todosComponentes.length; i++) {
                let celulaAtual = celulas[i + 1];
                let componenteAtual = todosComponentes[i];

                if (componentesMainframe.includes(componenteAtual) && celulaAtual) {
                    let spanValor = celulaAtual.querySelector('span');
                    let barraProcresso = celulaAtual.querySelector('.progress-bar-bg div');

                    if (spanValor && barraProcresso) {
                        let valorAtual = Number(spanValor.textContent.replace('%', ''));
                        
                        let variacao = 0;
                        if (componenteAtual != "DISCO") {
                            variacao = Number((Math.random() * (10 - (-10)) + (-10)).toFixed(0));
                        } 

                        usoComponente = Number((valorAtual + variacao).toFixed(0));

                        if (usoComponente > 100) usoComponente = 100;
                        if (usoComponente < 0) usoComponente = 0;

                        barraProcresso.style.width = usoComponente + '%';
                        spanValor.textContent = usoComponente + '%';

                        barraProcresso.className = "progress-bar-fill";

                        let indexMainframe = componentesMainframe.indexOf(componenteAtual);
                        let parametroAtual = Number(parametrosMainframe[indexMainframe]);

                        if (parametroAtual <= usoComponente) {
                            barraProcresso.classList.replace("progress-bar-fill", "progress-bar-fill-alert");
                        } else if (Math.abs(parametroAtual - usoComponente) <= 15) {
                            barraProcresso.classList.replace("progress-bar-fill", "progress-bar-fill-attention");
                        }
                    }
                }
            }
        }
    }, 5000);
});