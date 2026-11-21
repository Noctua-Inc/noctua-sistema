function paraDashboard(dados, metrica) {
    const capturas = dados?.processos;
    if (!Array.isArray(capturas)) {
        if (dados && Object.getPrototypeOf(dados) === Object.prototype && Object.keys(dados).length === 0) {
            return semCapturas();
        }
        throw new Error('O JSON de processos não tem uma lista de capturas.');
    }
    if (capturas.length === 0) return semCapturas();

    const processos = capturas.map(captura => {
        if (!Number.isInteger(captura?.PID) || typeof captura.Nome_Processo !== 'string'
            || !Number.isFinite(captura.CPU_percentual) || !Number.isFinite(captura.Memoria_MB)) {
            throw new Error('O JSON de processos tem uma captura inválida.');
        }

        return {
            pid: captura.PID,
            // A mesma propriedade é usada em células HTML e em rótulos de texto.
            job: captura.Nome_Processo.replaceAll('<', '‹').replaceAll('>', '›'),
            cpu: captura.CPU_percentual,
            ram: captura.Memoria_MB,
            bytes_lidos: captura.Bytes_Lidos ?? 0,
            bytes_escritos: captura.Bytes_Escritos ?? 0,
            disco: '—',
            threads: '—',
            status: captura.status === 'Normal' ? 'Normal' : 'Sem dados'
        };
    });

    const valorOrdenacao = metrica === 'disco'
        ? processo => processo.bytes_lidos + processo.bytes_escritos
        : processo => processo[metrica];
    processos.sort((a, b) => valorOrdenacao(b) - valorOrdenacao(a) || a.pid - b.pid);

    const total = metrica === 'disco' ? null : processos.reduce((soma, processo) => soma + processo[metrica], 0);
    const unidade = metrica === 'cpu' ? '%' : ' MB';
    const ultimaCaptura = dados.kpis?.ultima_captura ?? dados.periodo?.fim;
    const valor = total === null ? null : Number(total.toFixed(2));

    return {
        processos,
        kpis: { valor1: valor === null ? '—' : `${valor}${unidade}`, valor2: '—', valor3: '—' },
        // O Gold só inclui os valores por processo da última captura.
        grafico: valor !== null && typeof ultimaCaptura === 'string'
            ? {
                labels: [ultimaCaptura],
                datasets: [{ label: metrica === 'cpu' ? 'CPU dos processos (%)' : 'Memória dos processos (MB)', data: [valor] }]
            }
            : { labels: [], datasets: [] }
    };
}

function semCapturas() {
    return { processos: [], kpis: {}, grafico: { labels: [], datasets: [] } };
}

export default { paraDashboard, semCapturas };
