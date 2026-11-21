const monitoramento = {
    fuso: 'America/Sao_Paulo',
    metricas: {
        CPU: ['cpu', 'cpu_pct_min', 'cpu_pct_max'],
        RAM: ['ram', 'ram_pct_min', 'ram_pct_max'],
        DISCO: ['disco', 'disco_pct_min', 'disco_pct_max'],
        SWAP: ['swap', 'swap_pct_min', 'swap_pct_max']
    },

    async ler(idEmpresa, hostname, arquivo) {
        const caminho = '/api/gold/empresa/' + encodeURIComponent(idEmpresa)
            + '/' + encodeURIComponent(hostname) + '/monitoramento/' + arquivo + '.json';
        const resposta = await fetch(caminho, { cache: 'no-store' });
        if (resposta.status === 404) return null;
        if (!resposta.ok) throw new Error('Não foi possível consultar a Gold.');
        return resposta.json();
    },

    async historico(idEmpresa, hostname) {
        const dados = await this.ler(idEmpresa, hostname, 'historico');
        if (!dados) return [];
        return dados.amostras.map(linha => Object.fromEntries(dados.colunas.map((nome, i) => [nome, linha[i]])));
    },

    porPeriodo(amostras, horas, agora = Date.now()) {
        const inicio = agora - horas * 3600000;
        return amostras.filter(amostra => {
            const horario = Date.parse(amostra.horario);
            return horario >= inicio && horario <= agora;
        });
    },

    agrupar(amostras, campos, minutos) {
        const intervalos = new Map();
        const duracao = minutos * 60000;
        for (const amostra of amostras) {
            const horario = Math.floor(Date.parse(amostra.horario) / duracao) * duracao;
            if (!intervalos.has(horario)) {
                intervalos.set(horario, campos.map(() => ({ soma: 0, quantidade: 0 })));
            }
            const acumulados = intervalos.get(horario);
            campos.forEach((campo, i) => {
                if (!Number.isFinite(amostra[campo])) return;
                acumulados[i].soma += amostra[campo];
                acumulados[i].quantidade++;
            });
        }
        return Array.from(intervalos).sort(([a], [b]) => a - b).map(([horario, valores]) => ({
            horario: new Date(horario).toISOString(),
            ...Object.fromEntries(campos.map((campo, i) => [
                campo, valores[i].quantidade ? valores[i].soma / valores[i].quantidade : null
            ]))
        }));
    },

    desvio(valor, parametro) {
        const metrica = this.metricas[parametro?.tipo];
        if (!Array.isArray(metrica) || !Number.isFinite(valor)) return 0;
        const [, minimo, maximo] = metrica;
        if (parametro[minimo] != null && valor < Number(parametro[minimo])) return Number(parametro[minimo]) - valor;
        if (parametro[maximo] != null && valor > Number(parametro[maximo])) return valor - Number(parametro[maximo]);
        return 0;
    },

    horario(valor) {
        if (!valor) return '—';
        return new Date(valor).toLocaleString('pt-BR', {
            timeZone: this.fuso,
            day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
        });
    }
};
