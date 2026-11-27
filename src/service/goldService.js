import 'dotenv/config';
import {S3Client, GetObjectCommand, paginateListObjectsV2} from '@aws-sdk/client-s3';

const s3 = new S3Client({region: process.env.AWS_REGION || 'us-east-1'});
const tiposMonitoramento = 'todos|cpu|ram|rede|disco';
const sufixoLote = new RegExp(`^\\d{4}-\\d{2}-\\d{2}_\\d{2}-\\d{2}_(${tiposMonitoramento})_registros\\.json$`);
const arquivoRecente = new RegExp(`^latest_(${tiposMonitoramento})_registros\\.json$`);

function prefixoEmpresa(razaoSocial) {
    return razaoSocial.toLowerCase().replaceAll(' ', '_');
}

function arquivoAusente(erro) {
    return ['NoSuchKey', 'NotFound'].includes(erro.name);
}

async function lerJson(empresa, caminho) {
    const comando = new GetObjectCommand({
        Bucket: process.env.NOME_BUCKET,
        Key: empresa + '/03-gold/' + caminho
    });
    
    const resposta = await s3.send(comando);
    const texto = await resposta.Body.transformToString();

    return JSON.parse(texto);
}

async function lerMonitoramento(empresa, hostname, arquivo) {
    const pasta = 'gustavo/monitoramentoComponentes/';
    const prefixoArquivo = `${hostname}_`;
    const recente = arquivoRecente.exec(arquivo);
    let lote = arquivo;
    let tipo = sufixoLote.exec(arquivo.startsWith(prefixoArquivo) ? arquivo.slice(prefixoArquivo.length) : '')?.[1];

    if (recente) {
        tipo = recente[1];
        const prefixoPasta = `${empresa}/03-gold/${pasta}`;
        const paginas = paginateListObjectsV2({client: s3}, {
            Bucket: process.env.NOME_BUCKET,
            Prefix: prefixoPasta + prefixoArquivo
        });
        lote = null;
        for await (const pagina of paginas) {
            for (const {Key} of pagina.Contents ?? []) {
                const nome = Key.slice(prefixoPasta.length);
                const tipoLote = sufixoLote.exec(nome.slice(prefixoArquivo.length))?.[1];
                if (nome.startsWith(prefixoArquivo) && tipoLote === tipo && (lote === null || nome > lote)) {
                    lote = nome;
                }
            }
        }
    }

    if (!tipo || !lote) return null;

    const dados = await lerJson(empresa, pasta + lote);
    const camposRede = tipo === 'todos'
        ? ['media_trafego_rede', 'dados_enviados_medio', 'dados_recebidos_medio']
        : tipo === 'rede' ? ['media_dados_enviados', 'media_dados_recebidos'] : [];

    // A Silver registra o volume em MiB. A tela e os parâmetros de rede usam TB.
    for (const campo of camposRede) {
        if (Number.isFinite(dados[campo])) dados[campo] = dados[campo] * (1024 ** 2) / (1000 ** 4);
    }
    return dados;
}

async function lerComponentes(empresa, hostname) {
    const prefixo = `${empresa}/03-gold/${hostname}/monitoramento/componentes_`;
    const paginas = paginateListObjectsV2({client: s3}, {
        Bucket: process.env.NOME_BUCKET,
        Prefix: prefixo
    });
    let arquivo = null;
    for await (const pagina of paginas) {
        for (const {Key} of pagina.Contents ?? []) {
            const nome = Key.slice(prefixo.length);
            if (/^\d{4}-\d{2}-\d{2}_\d{2}-\d{2}\.json$/.test(nome) && (arquivo === null || nome > arquivo)) {
                arquivo = nome;
            }
        }
    }
    if (!arquivo) return null;
    return lerJson(empresa, `${hostname}/monitoramento/componentes_${arquivo}`);
}

async function lerArquivoMonitoramento(empresa, hostname, arquivo) {
    return lerJson(empresa, `${hostname}/monitoramentoComponentes/${arquivo}`);
}

export default {arquivoAusente, lerJson, lerMonitoramento, lerComponentes, lerArquivoMonitoramento, prefixoEmpresa};
