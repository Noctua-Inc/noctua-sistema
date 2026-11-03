import 'dotenv/config';
import {S3Client, GetObjectCommand} from '@aws-sdk/client-s3';

const s3 = new S3Client({region: process.env.AWS_REGION || 'us-east-1'});

async function lerJson(prefixoEmpresa, diretorio, arquivo) {
    const comando = new GetObjectCommand({
        Bucket: process.env.NOME_BUCKET,
        Key: prefixoEmpresa + '/03-gold/' + diretorio + '/' + arquivo
    });
    const resposta = await s3.send(comando);
    const texto = await resposta.Body.transformToString();
    return JSON.parse(texto);
}

export default {lerJson};
