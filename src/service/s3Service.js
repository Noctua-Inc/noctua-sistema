const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");

// Instancia o cliente do S3 usando as credenciais do seu ambiente (.env)
const s3Client = new S3Client({
    region: process.env.AWS_REGION, // ex: 'us-east-1'
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

// Função auxiliar para converter a stream do S3 em String
const streamToString = (stream) =>
    new Promise((resolve, reject) => {
        const chunks = [];
        stream.on("data", (chunk) => chunks.push(chunk));
        stream.on("error", reject);
        stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    });

async function buscarTelemetriaS3(hostname) {
    try {
        // Exemplo: O Python salva o arquivo com o nome do hostname
        const nomeArquivo = `telemetria/${hostname.toLowerCase()}-latest.json`;
        
        const command = new GetObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME, // Nome do seu bucket (ex: noctua-data-lake-bronze)
            Key: nomeArquivo,
        });

        const response = await s3Client.send(command);
        const jsonString = await streamToString(response.Body);
        
        return JSON.parse(jsonString); // Retorna os dados capturados pelo Python
    } catch (erro) {
        console.error("Erro ao buscar dados no S3:", erro);
        return null;
    }
}

module.exports = { buscarTelemetriaS3 };