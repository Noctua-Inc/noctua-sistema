import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";

// Garante que as variáveis do .env estejam disponíveis mesmo quando este
// módulo é avaliado antes do corpo de app.js (os imports são executados primeiro).
dotenv.config();

const BUCKET = process.env.BUCKET_NAME || process.env.AWS_S3_BUCKET_NAME || "noctua-s3";
const REGIAO = process.env.AWS_REGION || "us-east-1";

let s3Client;

function getS3Client() {
    if (!s3Client) {
        // A cadeia padrão do SDK v3 lê AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY
        // e AWS_SESSION_TOKEN diretamente de process.env.
        s3Client = new S3Client({ region: REGIAO });
    }
    return s3Client;
}

function ehNaoEncontrado(erro) {
    const codigo = erro?.name || erro?.Code;
    if (codigo === "NoSuchKey" || codigo === "NotFound" || erro?.$metadata?.httpStatusCode === 404) {
        return true;
    }

    // O S3 mascara um GetObject de chave inexistente como 403 AccessDenied
    // quando a credencial não tem s3:ListBucket. Nesse caso a mensagem cita
    // exatamente "s3:ListBucket" (e não "s3:GetObject").
    return codigo === "AccessDenied" && /s3:ListBucket/.test(erro?.message || "");
}

function normalizarEmpresa(nome) {
    // Mesma normalização usada pelo Writer.py: razao_social.lower().replace(" ", "_")
    return String(nome).trim().toLowerCase().replace(/\s+/g, "_");
}

function removerAcentos(texto) {
    return String(texto).normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function chavesCandidatas(hostname, nomeEmpresa) {
    const host = String(hostname).trim();
    const hostMinusculo = host.toLowerCase();
    const empresa = nomeEmpresa ? normalizarEmpresa(nomeEmpresa) : null;
    const empresaSemAcento = empresa ? removerAcentos(empresa) : null;

    const chaves = [];
    const adicionar = (prefixo, nomeHost) => {
        const chave = `${prefixo}/03-gold/${nomeHost}/processos/latest.json`;
        if (!chaves.includes(chave)) chaves.push(chave);
    };

    if (empresa) {
        // O Writer.py e o ETL preservam o hostname do banco (ex.: MF-SPTECH-001).
        adicionar(empresa, host);
        adicionar(empresa, hostMinusculo);
    }

    if (empresaSemAcento && empresaSemAcento !== empresa) {
        adicionar(empresaSemAcento, host);
        adicionar(empresaSemAcento, hostMinusculo);
    }

    return chaves;
}

async function lerJson(chave) {
    const resposta = await getS3Client().send(new GetObjectCommand({
        Bucket: BUCKET,
        Key: chave
    }));

    const conteudo = await resposta.Body.transformToString();
    return JSON.parse(conteudo);
}

/**
 * Busca o JSON Gold de processos no S3 para um determinado mainframe.
 *
 * O ETL (silver2goldProcessosEnzo) grava em:
 *   <nome_empresa>/03-gold/<hostname>/processos/latest.json
 *
 * Não usamos ListObjectsV2 porque a credencial da aplicação web não precisa
 * (e não tem) permissão de s3:ListBucket — apenas s3:GetObject.
 *
 * @param {object} params
 * @param {string} params.hostname    hostname do mainframe (vem do banco, com o caso original)
 * @param {string} [params.nomeEmpresa] razão social da empresa (usada como prefixo)
 * @returns {Promise<object>} JSON Gold já parseado
 */
export async function buscarUltimosProcessosS3({ hostname, nomeEmpresa } = {}) {
    if (!hostname) {
        throw new Error("Hostname não informado para a consulta ao S3.");
    }

    const chaves = chavesCandidatas(hostname, nomeEmpresa);
    if (chaves.length === 0) {
        const erro = new Error("Razão social da empresa não encontrada para montar a chave do S3.");
        erro.codigo = "ConfiguracaoS3";
        throw erro;
    }

    for (const chave of chaves) {
        try {
            return await lerJson(chave);
        } catch (erro) {
            if (!ehNaoEncontrado(erro)) {
                throw erro;
            }
            console.warn(`[S3] Chave não encontrada: ${chave}`);
        }
    }

    console.warn(`[S3] Nenhuma chave encontrada. Tentadas: ${chaves.join(" | ")}`);
    const erro = new Error(`Nenhum dado Gold encontrado no S3 para o hostname "${hostname}".`);
    erro.codigo = "NoSuchKey";
    throw erro;
}
