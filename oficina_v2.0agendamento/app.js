const CHAVE_ORCAMENTOS = "oficina_orcamentos_v2";
const CHAVE_CONFIG = "oficina_config_v2";
const CHAVE_USUARIO = "oficina_usuario_v1";
const CHAVE_SENHA = "oficina_senha_v1";

// Credenciais Padrão
const USUARIO_PADRAO = "Marcelo";
const SENHA_PADRAO = "brenda123";

let itens = [];
let orcamentoAtual = null;

// Controle da Agenda
let dataAgendaAtual = new Date();
let diaSelecionadoAgenda = null;

document.addEventListener("DOMContentLoaded", () => {
    const config = obterConfiguracoes();
    if (config.nome) {
        document.getElementById("tituloSistema").textContent = config.nome;
    }
    novoOrcamento();
    
    // Exibe tela de login ao abrir
    bloquearSistema();

    // Permite apertar Enter na tela de login
    document.getElementById("senhaInput")?.addEventListener("keypress", (e) => {
        if (e.key === "Enter") verificarLogin();
    });
    document.getElementById("userInput")?.addEventListener("keypress", (e) => {
        if (e.key === "Enter") verificarLogin();
    });
});

/* =========================
   SISTEMA DE AUTENTICAÇÃO
========================= */

function obterUsuarioSalvo() {
    return localStorage.getItem(CHAVE_USUARIO) || USUARIO_PADRAO;
}

function obterSenhaSalva() {
    return localStorage.getItem(CHAVE_SENHA) || SENHA_PADRAO;
}

function verificarLogin() {
    const userDigitado = document.getElementById("userInput").value.trim();
    const senhaDigitada = document.getElementById("senhaInput").value.trim();

    const userCorreto = obterUsuarioSalvo();
    const senhaCorreta = obterSenhaSalva();

    if (
        userDigitado.toLowerCase() === userCorreto.toLowerCase() && 
        senhaDigitada === senhaCorreta
    ) {
        document.getElementById("modalLogin").style.display = "none";
        document.getElementById("userInput").value = "";
        document.getElementById("senhaInput").value = "";
    } else {
        alert("Usuário ou senha incorretos!");
    }
}

function bloquearSistema() {
    document.getElementById("modalLogin").style.display = "flex";
}

/* =========================
   UTILITÁRIOS
========================= */

function escapeHtml(texto) {
    if (!texto) return "";
    return String(texto)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function formatarData(dataIso) {
    if (!dataIso) return "";
    const partes = dataIso.split("-");
    if (partes.length !== 3) return dataIso;
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function moeda(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function hoje() {
    return new Date().toISOString().split("T")[0];
}

function gerarNumero() {
    const ano = new Date().getFullYear();
    const numero = String(Math.floor(Math.random() * 900000) + 100000);
    return `${ano}-${numero}`;
}

function obterOrcamentos() {
    return JSON.parse(localStorage.getItem(CHAVE_ORCAMENTOS) || "[]");
}

function salvarLista(lista) {
    localStorage.setItem(CHAVE_ORCAMENTOS, JSON.stringify(lista));
}

function obterConfiguracoes() {
    return JSON.parse(localStorage.getItem(CHAVE_CONFIG) || "{}");
}

/* =========================
   NOVO & LIMPAR
========================= */

function novoOrcamento() {
    if (itens.length > 0 && !confirm("Deseja iniciar um novo orçamento?")) {
        return;
    }
    limparTela();
    document.getElementById("numero").value = gerarNumero();
    document.getElementById("data").value = hoje();
}

function limparTela() {
    orcamentoAtual = null;
    itens = [];

    document.getElementById("numero").value = "";
    document.getElementById("data").value = "";
    document.getElementById("status").value = "Pendente";
    document.getElementById("pagamento").value = "";
    document.getElementById("cliente").value = "";
    document.getElementById("telefone").value = "";
    document.getElementById("veiculo").value = "";
    document.getElementById("placa").value = "";
    document.getElementById("ano").value = "";
    document.getElementById("km").value = "";
    document.getElementById("motor").value = "";
    document.getElementById("cor").value = "";
    document.getElementById("descricao").value = "";
    document.getElementById("quantidade").value = 1;
    document.getElementById("valor").value = "";
    document.getElementById("descontoPercentual").value = 0;
    document.getElementById("descontoValor").value = 0;
    document.getElementById("observacoes").value = "";

    atualizarTabela();
}

/* =========================
   ITENS
========================= */

function adicionarItem() {
    const descricao = document.getElementById("descricao").value.trim();
    const quantidade = Number(document.getElementById("quantidade").value);
    const valor = Number(document.getElementById("valor").value);

    if (!descricao) return alert("Informe a descrição do item.");
    if (!quantidade || quantidade <= 0) return alert("Informe uma quantidade válida.");
    if (valor < 0 || isNaN(valor)) return alert("Informe um valor válido.");

    itens.push({
        id: Date.now(),
        descricao,
        quantidade,
        valor,
        subtotal: quantidade * valor
    });

    document.getElementById("descricao").value = "";
    document.getElementById("quantidade").value = 1;
    document.getElementById("valor").value = "";

    atualizarTabela();
}

function removerItem(id) {
    itens = itens.filter(item => item.id !== id);
    atualizarTabela();
}

function editarItem(id) {
    const item = itens.find(i => i.id === id);
    if (!item) return;

    document.getElementById("descricao").value = item.descricao;
    document.getElementById("quantidade").value = item.quantidade;
    document.getElementById("valor").value = item.valor;

    removerItem(id);
}

function atualizarTabela() {
    const tabela = document.getElementById("listaItens");
    tabela.innerHTML = "";

    if (itens.length === 0) {
        tabela.innerHTML = `
            <tr>
                <td colspan="5" class="empty">Nenhum item adicionado.</td>
            </tr>`;
        calcularTotal();
        return;
    }

    itens.forEach(item => {
        const linha = document.createElement("tr");
        linha.innerHTML = `
            <td>${escapeHtml(item.descricao)}</td>
            <td>${item.quantidade}</td>
            <td>${moeda(item.valor)}</td>
            <td>${moeda(item.subtotal)}</td>
            <td class="no-print item-actions">
                <button class="btn-warning" onclick="editarItem(${item.id})">Editar</button>
                <button class="btn-danger" onclick="removerItem(${item.id})">Excluir</button>
            </td>
        `;
        tabela.appendChild(linha);
    });

    calcularTotal();
}

function calcularTotal() {
    const subtotal = itens.reduce((total, item) => total + item.subtotal, 0);

    let percentual = Number(document.getElementById("descontoPercentual").value) || 0;
    let descontoValor = Number(document.getElementById("descontoValor").value) || 0;

    if (percentual > 100) {
        percentual = 100;
        document.getElementById("descontoPercentual").value = 100;
    }

    const descontoPercentual = (subtotal * percentual) / 100;
    const desconto = descontoPercentual + descontoValor;
    const total = Math.max(0, subtotal - desconto);

    document.getElementById("subtotal").textContent = moeda(subtotal);
    document.getElementById("descontoTotal").textContent = moeda(desconto);
    document.getElementById("total").textContent = moeda(total);
}

/* =========================
   SALVAR E ABRIR
========================= */

function coletarDados() {
    const subtotal = itens.reduce((total, item) => total + item.subtotal, 0);
    const percentual = Number(document.getElementById("descontoPercentual").value) || 0;
    const descontoValor = Number(document.getElementById("descontoValor").value) || 0;
    const desconto = (subtotal * percentual) / 100 + descontoValor;
    const total = Math.max(0, subtotal - desconto);

    return {
        numero: document.getElementById("numero").value,
        data: document.getElementById("data").value,
        status: document.getElementById("status").value,
        pagamento: document.getElementById("pagamento").value,
        cliente: document.getElementById("cliente").value.trim(),
        telefone: document.getElementById("telefone").value.trim(),
        veiculo: document.getElementById("veiculo").value.trim(),
        placa: document.getElementById("placa").value.trim().toUpperCase(),
        ano: document.getElementById("ano").value.trim(),
        km: document.getElementById("km").value.trim(),
        motor: document.getElementById("motor").value.trim(),
        cor: document.getElementById("cor").value.trim(),
        itens,
        subtotal,
        descontoPercentual: percentual,
        descontoValor,
        descontoTotal: desconto,
        total,
        observacoes: document.getElementById("observacoes").value.trim(),
        atualizadoEm: new Date().toISOString()
    };
}

function salvarOrcamento() {
    const dados = coletarDados();

    if (!dados.cliente) return alert("Informe o nome do cliente.");
    if (!dados.veiculo) return alert("Informe o veículo.");
    if (!dados.placa) return alert("Informe a placa.");
    if (itens.length === 0) return alert("Adicione pelo menos um item.");

    let lista = obterOrcamentos();
    const existente = lista.findIndex(o => o.numero === dados.numero);

    if (existente >= 0) {
        lista[existente] = dados;
    } else {
        lista.push(dados);
    }

    salvarLista(lista);
    orcamentoAtual = dados;
    alert(`Orçamento ${dados.numero} salvo com sucesso!`);
}

function abrirOrcamento(numero) {
    const lista = obterOrcamentos();
    const dados = lista.find(o => o.numero === numero);
    if (!dados) return alert("Orçamento não encontrado.");

    orcamentoAtual = dados;
    itens = dados.itens || [];

    document.getElementById("numero").value = dados.numero;
    document.getElementById("data").value = dados.data;
    document.getElementById("status").value = dados.status || "Pendente";
    document.getElementById("pagamento").value = dados.pagamento || "";
    document.getElementById("cliente").value = dados.cliente || "";
    document.getElementById("telefone").value = dados.telefone || "";
    document.getElementById("veiculo").value = dados.veiculo || "";
    document.getElementById("placa").value = dados.placa || "";
    document.getElementById("ano").value = dados.ano || "";
    document.getElementById("km").value = dados.km || "";
    document.getElementById("motor").value = dados.motor || "";
    document.getElementById("cor").value = dados.cor || "";
    document.getElementById("descontoPercentual").value = dados.descontoPercentual || 0;
    document.getElementById("descontoValor").value = dados.descontoValor || 0;
    document.getElementById("observacoes").value = dados.observacoes || "";

    atualizarTabela();
    fecharHistorico();
    fecharAgenda();
    window.scrollTo({ top: 0, behavior: "smooth" });
}

/* =========================
   ENVIAR VIA WHATSAPP
========================= */

function enviarWhatsApp() {
    const telefone = document.getElementById("telefone").value.replace(/\D/g, "");
    const cliente = document.getElementById("cliente").value.trim();
    const numero = document.getElementById("numero").value;
    const veiculo = document.getElementById("veiculo").value.trim();
    const placa = document.getElementById("placa").value.trim().toUpperCase();
    const total = document.getElementById("total").textContent;

    if (!cliente) return alert("Informe o nome do cliente antes de enviar.");
    if (itens.length === 0) return alert("Adicione pelo menos um item ao orçamento.");
    if (!telefone) return alert("Informe o telefone do cliente com DDD para enviar a mensagem.");

    let resumoItens = "";
    itens.forEach(item => {
        resumoItens += `• ${item.quantidade}x ${item.descricao} - ${moeda(item.subtotal)}\n`;
    });

    const mensagem = 
`Olá, *${cliente}*! 👋

Segue o resumo do orçamento para o seu veículo:

📄 *Orçamento:* #${numero}
🚗 *Veículo:* ${veiculo} ${placa ? `(${placa})` : ""}

📋 *Itens / Serviços:*
${resumoItens}
💰 *Valor Total:* *${total}*

Ficamos no aguardo da sua aprovação! Se tiver dúvidas, estamos à disposição.`;

    let numeroCompleto = telefone;
    if (numeroCompleto.length === 10 || numeroCompleto.length === 11) {
        numeroCompleto = "55" + numeroCompleto;
    }

    const url = `https://api.whatsapp.com/send?phone=${numeroCompleto}&text=${encodeURIComponent(mensagem)}`;
    window.open(url, "_blank");
}

/* =========================
   HISTÓRICO
========================= */

function abrirHistorico() {
    listarOrcamentos();
    document.getElementById("modalHistorico").style.display = "block";
}

function fecharHistorico() {
    document.getElementById("modalHistorico").style.display = "none";
}

function listarOrcamentos() {
    const busca = document.getElementById("busca")?.value.toLowerCase() || "";
    const filtro = document.getElementById("filtroStatus")?.value || "";
    const lista = obterOrcamentos();

    const filtrados = lista.filter(o => {
        const texto = `${o.numero} ${o.cliente} ${o.placa} ${o.veiculo}`.toLowerCase();
        return texto.includes(busca) && (!filtro || o.status === filtro);
    });

    filtrados.sort((a, b) => new Date(b.atualizadoEm) - new Date(a.atualizadoEm));
    const tbody = document.getElementById("historico");
    tbody.innerHTML = "";

    if (filtrados.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="empty">Nenhum orçamento encontrado.</td></tr>`;
        return;
    }

    filtrados.forEach(o => {
        const tr = document.createElement("tr");
        const classeStatus =
            o.status === "Aprovado" ? "status-aprovado" :
            o.status === "Recusado" ? "status-recusado" :
            o.status === "Concluído" ? "status-concluido" : "status-pendente";

        tr.innerHTML = `
            <td>${escapeHtml(o.numero)}</td>
            <td>${formatarData(o.data)}</td>
            <td>${escapeHtml(o.cliente)}</td>
            <td>${escapeHtml(o.veiculo)}</td>
            <td>${escapeHtml(o.placa)}</td>
            <td>${moeda(o.total)}</td>
            <td><span class="status ${classeStatus}">${escapeHtml(o.status)}</span></td>
            <td class="item-actions">
                <button class="btn-primary" onclick="abrirOrcamento('${o.numero}')">Abrir</button>
                <button class="btn-info" onclick="duplicarOrcamento('${o.numero}')">Duplicar</button>
                <button class="btn-danger" onclick="excluirOrcamento('${o.numero}')">Excluir</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function excluirOrcamento(numero) {
    if (!confirm(`Deseja excluir o orçamento ${numero}?`)) return;
    let lista = obterOrcamentos().filter(o => o.numero !== numero);
    salvarLista(lista);
    listarOrcamentos();
}

function duplicarOrcamento(numero) {
    const lista = obterOrcamentos();
    const original = lista.find(o => o.numero === numero);
    if (!original) return;

    const novo = JSON.parse(JSON.stringify(original));
    novo.numero = gerarNumero();
    novo.data = hoje();
    novo.status = "Pendente";
    novo.atualizadoEm = new Date().toISOString();
    novo.itens = novo.itens.map(item => ({ ...item, id: Date.now() + Math.random() }));

    lista.push(novo);
    salvarLista(lista);
    abrirOrcamento(novo.numero);
    alert("Orçamento duplicado com sucesso.");
}

/* =========================
   AGENDA DE APROVADOS E GOOGLE CALENDAR
========================= */

function abrirAgenda() {
    document.getElementById("modalAgenda").style.display = "block";
    renderizarCalendario();
}

function fecharAgenda() {
    document.getElementById("modalAgenda").style.display = "none";
}

function mudarMes(direcao) {
    dataAgendaAtual.setMonth(dataAgendaAtual.getMonth() + direcao);
    renderizarCalendario();
}

function renderizarCalendario() {
    const ano = dataAgendaAtual.getFullYear();
    const mes = dataAgendaAtual.getMonth();

    const nomesMeses = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    document.getElementById("mesAnoAtual").textContent = `${nomesMeses[mes]} de ${ano}`;

    const primeiroDiaMes = new Date(ano, mes, 1);
    const ultimoDiaMes = new Date(ano, mes + 1, 0);
    const diasNoMes = ultimoDiaMes.getDate();
    const diaSemanaInicio = primeiroDiaMes.getDay();

    const orcamentos = obterOrcamentos();
    const aprovados = orcamentos.filter(o => o.status === "Aprovado");

    const grid = document.getElementById("calendarioGrid");
    grid.innerHTML = "";

    const diasSemanaNomes = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    diasSemanaNomes.forEach(d => {
        const divHead = document.createElement("div");
        divHead.className = "calendar-header-day";
        divHead.textContent = d;
        grid.appendChild(divHead);
    });

    const ultimoDiaMesAnterior = new Date(ano, mes, 0).getDate();
    for (let i = diaSemanaInicio - 1; i >= 0; i--) {
        const diaNum = ultimoDiaMesAnterior - i;
        const div = document.createElement("div");
        div.className = "calendar-day other-month";
        div.textContent = diaNum;
        grid.appendChild(div);
    }

    for (let dia = 1; dia <= diasNoMes; dia++) {
        const mesStr = String(mes + 1).padStart(2, "0");
        const diaStr = String(dia).padStart(2, "0");
        const dataIso = `${ano}-${mesStr}-${diaStr}`;

        const div = document.createElement("div");
        div.className = "calendar-day";

        const orcamentosDoDia = aprovados.filter(o => o.data === dataIso);
        if (orcamentosDoDia.length > 0) {
            div.classList.add("has-approved");
        }

        if (diaSelecionadoAgenda === dataIso) {
            div.classList.add("selected");
        }

        div.innerHTML = `<span>${dia}</span>`;
        if (orcamentosDoDia.length > 0) {
            const badge = document.createElement("div");
            badge.className = "badge-aprovado-count";
            badge.textContent = `${orcamentosDoDia.length} ap.`;
            div.appendChild(badge);
        }

        div.onclick = () => selecionarDiaAgenda(dataIso, orcamentosDoDia);
        grid.appendChild(div);
    }

    const totalCelulasPreenchidas = diaSemanaInicio + diasNoMes;
    const celulasRestantes = (totalCelulasPreenchidas % 7 === 0) ? 0 : 7 - (totalCelulasPreenchidas % 7);
    for (let i = 1; i <= celulasRestantes; i++) {
        const div = document.createElement("div");
        div.className = "calendar-day other-month";
        div.textContent = i;
        grid.appendChild(div);
    }
}

function selecionarDiaAgenda(dataIso, listaOrcamentosDia) {
    diaSelecionadoAgenda = dataIso;
    renderizarCalendario();

    document.getElementById("dataSelecionadaTexto").textContent = formatarData(dataIso);
    const tbody = document.getElementById("listaAgendaDia");
    tbody.innerHTML = "";

    if (!listaOrcamentosDia || listaOrcamentosDia.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="empty">Nenhum orçamento aprovado nesta data.</td></tr>`;
        return;
    }

    listaOrcamentosDia.forEach(o => {
        // Link integrado direto para a Google Agenda (Google Calendar)
        const dataGoogle = o.data.replace(/-/g, "");
        const tituloEvento = encodeURIComponent(`Oficina: ${o.veiculo} (${o.placa || 'Sem Placa'}) - ${o.cliente}`);
        const descricaoEvento = encodeURIComponent(`Orçamento: #${o.numero}\nCliente: ${o.cliente}\nTelefone: ${o.telefone}\nVeículo: ${o.veiculo} - Placa: ${o.placa}\nValor Total: ${moeda(o.total)}\n\nServiços:\n` + (o.itens || []).map(i => `- ${i.quantidade}x ${i.descricao}`).join("\n"));
        const urlGoogleCalendar = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${tituloEvento}&dates=${dataGoogle}/${dataGoogle}&details=${descricaoEvento}`;

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${escapeHtml(o.numero)}</td>
            <td>${escapeHtml(o.cliente)}</td>
            <td>${escapeHtml(o.veiculo)}</td>
            <td>${escapeHtml(o.placa)}</td>
            <td>${moeda(o.total)}</td>
            <td class="item-actions">
                <button class="btn-primary" onclick="abrirOrcamento('${o.numero}')">Abrir</button>
                <a href="${urlGoogleCalendar}" target="_blank" class="btn-success" style="text-decoration: none; padding: 6px 9px; font-size: 12px; display: inline-block; border-radius: 6px; font-weight: bold; color: white;">🗓️ Add Google Agenda</a>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

/* =========================
   IMPRESSÃO & CONFIGS
========================= */

function imprimirOrcamento() {
    if (itens.length === 0) return alert("Adicione itens antes de imprimir.");
    document.title = `Orçamento_${document.getElementById("numero").value}`;
    window.print();
}

function abrirConfiguracoes() {
    const config = obterConfiguracoes();
    document.getElementById("oficinaNome").value = config.nome || "Oficina Mecânica";
    document.getElementById("oficinaTelefone").value = config.telefone || "";
    document.getElementById("oficinaCnpj").value = config.cnpj || "";
    document.getElementById("oficinaEmail").value = config.email || "";
    document.getElementById("oficinaEndereco").value = config.endereco || "";
    
    document.getElementById("oficinaNovoUsuario").value = obterUsuarioSalvo();
    document.getElementById("oficinaNovaSenha").value = "";

    document.getElementById("modalConfig").style.display = "block";
}

function fecharConfiguracoes() {
    document.getElementById("modalConfig").style.display = "none";
}

function salvarConfiguracoes() {
    const config = {
        nome: document.getElementById("oficinaNome").value.trim(),
        telefone: document.getElementById("oficinaTelefone").value.trim(),
        cnpj: document.getElementById("oficinaCnpj").value.trim(),
        email: document.getElementById("oficinaEmail").value.trim(),
        endereco: document.getElementById("oficinaEndereco").value.trim()
    };

    const novoUsuario = document.getElementById("oficinaNovoUsuario").value.trim();
    const novaSenha = document.getElementById("oficinaNovaSenha").value.trim();

    if (novoUsuario) {
        localStorage.setItem(CHAVE_USUARIO, novoUsuario);
    }

    if (novaSenha) {
        localStorage.setItem(CHAVE_SENHA, novaSenha);
    }

    localStorage.setItem(CHAVE_CONFIG, JSON.stringify(config));
    document.getElementById("tituloSistema").textContent = config.nome || "Oficina Mecânica";
    fecharConfiguracoes();
    alert("Configurações salvas com sucesso!");
}

/* =========================
   BACKUP E ENVIO POR E-MAIL
========================= */

function exportarBackup() {
    const config = obterConfiguracoes();
    const dados = {
        dataBackup: new Date().toISOString(),
        orcamentos: obterOrcamentos(),
        configuracao: config,
        usuario: obterUsuarioSalvo(),
        senha: obterSenhaSalva()
    };
    
    const jsonStr = JSON.stringify(dados, null, 2);

    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `backup_oficina_${hoje()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    const destinatario = config.email || "marceloebrenda.1983@gmail.com";
    const assunto = encodeURIComponent(`Backup Oficina Mecânica - ${hoje()}`);
    const corpo = encodeURIComponent(`Segue os dados de backup do sistema em ${new Date().toLocaleString("pt-BR")}:\n\n${jsonStr}`);
    
    window.location.href = `mailto:${destinatario}?subject=${assunto}&body=${corpo}`;
}

function importarBackup(e) {
    const arquivo = e.target.files[0];
    if (!arquivo) return;

    const leitor = new FileReader();
    leitor.onload = function(evento) {
        try {
            const dados = JSON.parse(evento.target.result);
            if (dados.orcamentos && Array.isArray(dados.orcamentos)) {
                salvarLista(dados.orcamentos);
                if (dados.configuracao) {
                    localStorage.setItem(CHAVE_CONFIG, JSON.stringify(dados.configuracao));
                }
                if (dados.usuario) {
                    localStorage.setItem(CHAVE_USUARIO, dados.usuario);
                }
                if (dados.senha) {
                    localStorage.setItem(CHAVE_SENHA, dados.senha);
                }
                alert("Backup restaurado com sucesso!");
                location.reload();
            } else {
                alert("Estrutura do arquivo de backup inválida.");
            }
        } catch (erro) {
            alert("Erro ao ler o arquivo JSON.");
        }
    };
    leitor.readAsText(arquivo);
}
