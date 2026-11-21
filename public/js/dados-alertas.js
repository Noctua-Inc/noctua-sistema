function detectarAlertas(mainframe, amostras, parametros) {
    const alertas = [];
    for (const parametro of parametros) {
        if (!Object.hasOwn(monitoramento.metricas, parametro.tipo)) continue;
        const [campo, minimo, maximo] = monitoramento.metricas[parametro.tipo];
        if (parametro[minimo] == null && parametro[maximo] == null) continue;
        let aberto = null;
        let reincidente = false;

        for (const amostra of amostras) {
            const valor = amostra[campo];
            if (!Number.isFinite(valor)) continue;
            const distancia = monitoramento.desvio(valor, parametro);
            if (distancia <= 0) {
                if (aberto) {
                    aberto.status = 'resolvido';
                    aberto.resolvidoEm = amostra.horario;
                    aberto = null;
                }
                continue;
            }
            if (!aberto) {
                aberto = {
                    mainframe: mainframe.hostname,
                    componente: parametro.tipo,
                    inicio: amostra.horario,
                    resolvidoEm: null,
                    status: 'aberto',
                    reincidente,
                    distancia
                };
                alertas.push(aberto);
                reincidente = true;
            }
            aberto.distancia = Math.max(aberto.distancia, distancia);
            aberto.severidade = aberto.distancia >= 20 ? 'critica' : aberto.distancia >= 10 ? 'alta' : 'moderada';
        }
    }
    return alertas;
}

async function carregarDadosAlertas(idEmpresa) {
    const maquinas = await api.get('/mainframe/empresa/' + encodeURIComponent(idEmpresa));
    const mainframes = maquinas.map(maquina => ({
        hostname: maquina.hostname,
        localizacao: maquina.localizacao_nome || maquina.cidade || 'Sem localização'
    }));
    const resultados = await Promise.all(maquinas.map(async maquina => {
        const amostras = await monitoramento.historico(idEmpresa, maquina.hostname);
        if (!amostras.length) return { alertas: [], atualizadoEm: null, monitorado: false };
        const parametros = await api.get('/parametro?id_mainframe=' + encodeURIComponent(maquina.id_mainframe));
        const monitorado = parametros.some(p => {
            const metrica = monitoramento.metricas[p.tipo];
            return metrica && (p[metrica[1]] != null || p[metrica[2]] != null)
                && amostras.some(amostra => Number.isFinite(amostra[metrica[0]]));
        });
        return {
            alertas: detectarAlertas(maquina, amostras, parametros),
            atualizadoEm: amostras.at(-1).horario,
            monitorado
        };
    }));
    return {
        mainframes: mainframes.map((mainframe, i) => ({ ...mainframe, monitorado: resultados[i].monitorado })),
        localizacoes: [...new Set(mainframes.map(mainframe => mainframe.localizacao))],
        monitoradas: resultados.filter(r => r.monitorado).length,
        atualizadoEm: resultados.map(r => r.atualizadoEm).filter(Boolean).sort((a, b) => Date.parse(b) - Date.parse(a))[0] ?? null,
        alertas: resultados.flatMap(r => r.alertas).sort((a, b) => Date.parse(b.inicio) - Date.parse(a.inicio))
    };
}
