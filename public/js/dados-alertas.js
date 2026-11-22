async function carregarDadosAlertas(idEmpresa) {
    const caminho = '/api/gold/empresa/' + encodeURIComponent(idEmpresa) + '/alertas/resumo.json';
    const resposta = await fetch(caminho, { cache: 'no-store' });
    if (resposta.status === 404) return null;
    if (!resposta.ok) throw new Error('Não foi possível consultar o resumo de alertas na Gold.');
    return resposta.json();
}
