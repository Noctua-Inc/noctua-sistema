const unidades = { cpu: '%', ram: ' MiB', disco: ' MiB' };

function formatar(valor, unidade) {
    return Number.isFinite(valor)
        ? valor.toLocaleString('pt-BR', { maximumFractionDigits: 2 }) + unidade
        : '—';
}

function paraDashboard(dados, metrica) {
    if (dados && Object.getPrototypeOf(dados) === Object.prototype && Object.keys(dados).length === 0) {
        return semCapturas();
    }
    if (!Array.isArray(dados?.processos)) throw new Error('O Gold não tem uma lista de processos.');
    if (!dados.processos.length) return semCapturas();

    const processos = dados.processos.map(captura => {
        if (!Number.isInteger(captura?.PID) || typeof captura.Nome_Processo !== 'string'
            || !Number.isFinite(captura.CPU_percentual) || !Number.isFinite(captura.Memoria_MB)) {
            throw new Error('O Gold tem uma captura de processo inválida.');
        }
        const bytes = [captura.Bytes_Lidos, captura.Bytes_Escritos].filter(Number.isFinite);
        return {
            pid: captura.PID,
            job: captura.Nome_Processo,
            cpu: captura.CPU_percentual_maquina ?? captura.CPU_percentual,
            cpu_normalizada: Number.isFinite(captura.CPU_percentual_maquina),
            ram: captura.Memoria_MB,
            disco: bytes.length ? bytes.reduce((soma, valor) => soma + valor, 0) / 1024 ** 2 : null,
            status: Number.isFinite(captura.CPU_percentual_maquina) ? captura.status : null
        };
    });
    processos.sort((a, b) => (b[metrica] ?? -1) - (a[metrica] ?? -1) || a.pid - b.pid);

    const total = metrica === 'cpu' ? (dados.graficos?.cpu ? dados.kpis?.cpu_percentual : null)
        : somar(processos.map(processo => processo[metrica]));
    const ultimaCaptura = dados.kpis?.ultima_captura ?? dados.periodo?.fim;
    const serie = dados.graficos?.[metrica];

    return {
        processos,
        kpis: {
            valor1: formatar(total, unidades[metrica]),
            valor2: String(processos.length),
            valor3: ultimaCaptura?.slice(11, 19) ?? '—'
        },
        grafico: serie ? {
            labels: serie.labels.map(horario => horario.slice(11, 19)),
            datasets: serie.datasets.map(dataset => ({
                label: metrica === 'disco' ? dataset.label.replace('Bytes', 'MiB') : dataset.label,
                data: dataset.data.map(valor => Number.isFinite(valor) && metrica === 'disco' ? valor / 1024 ** 2 : valor)
            })).filter(dataset => dataset.data.some(Number.isFinite))
        } : { labels: [], datasets: [] }
    };
}

function somar(valores) {
    const medidas = valores.filter(Number.isFinite);
    return medidas.length ? medidas.reduce((soma, valor) => soma + valor, 0) : null;
}

function semCapturas() {
    return { processos: [], kpis: {}, grafico: { labels: [], datasets: [] } };
}

export default { paraDashboard, semCapturas };
