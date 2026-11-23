import mainframeModel from '../model/mainframeModel.js';
import empresaModel from '../model/empresaModel.js';
import { buscarUltimosProcessosS3 } from '../service/s3Service.js';

// O JSON produzido pelo Silver2Gold usa(kpis.cpu_percentual, processos_capturados,
// ultima_captura). A dash espera kpis.valor1/valor2/valor3, então fazemos a tradução aqui.
function adaptarGoldParaDash(gold, metrica) {
    const ranking = gold?.rankings?.[metrica];
    const processos = Array.isArray(ranking)
        ? ranking
        : Array.isArray(gold?.processos) ? gold.processos : [];
    const kpisGold = gold?.kpis || {};
    const primeiro = processos[0] || {};

    const totalBytesLidos = kpisGold.bytes_lidos_total ?? processos.reduce(
        (soma, p) => soma + (Number(p.Bytes_Lidos) || 0), 0
    );
    const totalBytesEscritos = kpisGold.bytes_escritos_total ?? processos.reduce(
        (soma, p) => soma + (Number(p.Bytes_Escritos) || 0), 0
    );

    const kpisPorMetrica = {
        cpu: {
            valor1: kpisGold.cpu_percentual ?? primeiro.CPU_percentual_maquina ?? primeiro.CPU_percentual ?? '--',
            valor2: kpisGold.cpu_pico_percentual ?? kpisGold.cpu_percentual ?? '--',
            valor3: kpisGold.processos_cpu_atencao ?? 0
        },
        ram: {
            valor1: kpisGold.memoria_total_mb ?? primeiro.Memoria_MB ?? '--',
            valor2: kpisGold.memoria_pico_mb ?? kpisGold.memoria_total_mb ?? '--',
            valor3: kpisGold.processos_memoria_atencao ?? 0
        },
        disco: {
            valor1: totalBytesLidos,
            valor2: totalBytesEscritos,
            valor3: totalBytesLidos + totalBytesEscritos
        }
    };

    return {
        hostname: gold?.hostname ?? null,
        kpis: kpisPorMetrica[metrica],
        grafico: gold?.graficos?.[metrica] || gold?.grafico || { labels: [], datasets: [] },
        processos
    };
}

async function buscarUltimosProcessos(req, res) {
    const { idEmpresa, idMainframe, metrica } = req.params;

    if (!/^\d+$/.test(idEmpresa) || Number(idEmpresa) < 1) {
        return res.status(400).json({ erro: 'ID de empresa inválido.' });
    }

    if (!/^\d+$/.test(idMainframe) || Number(idMainframe) < 1) {
        return res.status(400).json({ erro: 'ID de mainframe inválido.' });
    }

    if (!['cpu', 'ram', 'disco'].includes(metrica)) {
        return res.status(400).json({ erro: 'Métrica inválida.' });
    }

    try {
        const [mainframes, nomeEmpresa] = await Promise.all([
            mainframeModel.listaPorIdMainframeId(Number(idEmpresa), Number(idMainframe)),
            empresaModel.buscarRazaoSocialPorId(Number(idEmpresa))
        ]);

        if (mainframes.length === 0) {
            return res.status(404).json({ erro: 'Mainframe não encontrado para esta empresa.' });
        }

        const hostname = mainframes[0].hostname;

        let gold;
        try {
            gold = await buscarUltimosProcessosS3({ hostname, nomeEmpresa });
        } catch (erro) {
            if (erro.codigo === 'NoSuchKey') {
                // Ainda não existe captura para esse mainframe: não é erro, é lista vazia.
                return res.status(200).json(adaptarGoldParaDash({}, metrica));
            }
            throw erro;
        }

        return res.status(200).json(adaptarGoldParaDash(gold, metrica));
    } catch (erro) {
        console.error('Erro ao buscar processos:', erro);
        return res.status(502).json({
            erro: 'Não foi possível consultar os dados de processos no S3.'
        });
    }
}

export { adaptarGoldParaDash };
export default { buscarUltimosProcessos };
