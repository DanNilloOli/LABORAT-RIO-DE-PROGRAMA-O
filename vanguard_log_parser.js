
function extrairCodigoLog(linhaLog) {
    // 1. Validação defensiva contra valores nulos, indefinidos ou strings vazias
    if (linhaLog === null || linhaLog === undefined || typeof linhaLog !== "string" || linhaLog.trim() === "") {
        return {
            sucesso: false,
            status: "ERRO_TRATADO",
            entradaOriginal: linhaLog,
            codigoBruto: null,
            codigoHigienizado: null,
            mensagem: "Exceção tratada: Ausência de dados na linha de entrada."
        };
    }

    // 2. Particionamento da string em um vetor (array) usando o delimitador hífen
    const partes = linhaLog.split("-");

    // 3. Verificação de integridade dos delimitadores (mínimo de 2 hifens = 3 partes)
    if (partes.length < 3) {
        return {
            sucesso: false,
            status: "AVISO_DELIMITADOR_INCOMPLETO",
            entradaOriginal: linhaLog,
            codigoBruto: null,
            codigoHigienizado: null,
            mensagem: "Aviso: String sem o segundo hífen delimitador. Extração ignorada."
        };
    }

    // 4. Cálculo dinâmico do índice central para suportar 2 ou múltiplos hifens
    const indiceCentral = Math.floor(partes.length / 2);
    const tokenExtraido = partes[indiceCentral];

    // 5. Higienização complementar para indexação em banco de dados e CRM
    const tokenLimpo = tokenExtraido.trim().replace(/[^a-zA-Z0-9_]/g, "");

    return {
        sucesso: true,
        status: "SUCESSO",
        entradaOriginal: linhaLog,
        codigoBruto: tokenExtraido,
        codigoHigienizado: tokenLimpo,
        mensagem: "Extração e higienização concluídas com sucesso."
    };
}

/**
 * Percorre um lote de logs brutos e consolida os dados válidos e estatísticas.
 * @param {Array} loteDeLogs - Vetor contendo os registros brutos do pipeline.
 * @returns {Object} Relatório estatístico e lista de objetos prontos para carga.
 */
function processarPipelineLogs(loteDeLogs) {
    const relatorio = {
        totalProcessado: loteDeLogs.length,
        totalSucesso: 0,
        totalAvisos: 0,
        totalErrosTratados: 0,
        cargaProntaCRM: [],
        trilhaDeAuditoria: []
    };

    for (let i = 0; i < loteDeLogs.length; i++) {
        const resultado = extrairCodigoLog(loteDeLogs[i]);
        relatorio.trilhaDeAuditoria.push(resultado);

        if (resultado.status === "SUCESSO") {
            relatorio.totalSucesso++;
            relatorio.cargaProntaCRM.push({
                ordemLeitura: i + 1,
                chaveOriginal: resultado.codigoBruto,
                chavePadronizada: resultado.codigoHigienizado
            });
        } else if (resultado.status === "AVISO_DELIMITADOR_INCOMPLETO") {
            relatorio.totalAvisos++;
        } else {
            relatorio.totalErrosTratados++;
        }
    }

    return relatorio;
}

// Massa de testes simulando o lote operacional da Vanguard Data Analytics
const loteEntrada = [
    "LOG_2026-REVENUES202-SUCCESS",
    "SISTEMA-AUDIT-BR_99823-VAL-ERR",
    "FINANCEIRO-INTEGRACAO_DATA",
    "",
    null,
    "ID- @AUDIT_45# -FIM"
];

const resultadoFinal = processarPipelineLogs(loteEntrada);
console.log(JSON.stringify(resultadoFinal, null, 2));
