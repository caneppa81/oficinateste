// netlify/functions/orcamentos.js
exports.handler = async function(event, context) {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    try {
        // Aqui você faria a conexão com seu banco (ex: Supabase, MongoDB, Neon, etc.)
        // Exemplo simulado de salvamento em nuvem:
        if (event.httpMethod === 'POST') {
            const dadosOrcamento = JSON.parse(event.body);
            
            // TODO: Inserir no seu banco de dados (Ex: await supabase.from('orcamentos').upsert(dadosOrcamento))

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ mensagem: "Orçamento salvo na nuvem com sucesso!", dados: dadosOrcamento })
            };
        }

        if (event.httpMethod === 'GET') {
            // TODO: Buscar do seu banco de dados
            const listaOrcamentos = []; // Retornar do banco

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify(listaOrcamentos)
            };
        }

        return { statusCode: 405, headers, body: "Método não permitido" };
    } catch (error) {
        return { statusCode: 500, headers, body: JSON.stringify({ erro: error.message }) };
    }
};
