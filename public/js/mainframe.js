document.addEventListener("DOMContentLoaded", () => {

  const DEFAULT_LOCALIZACOES = [
    { id_localizacao: 1, nome: "Data Center São Paulo", pais: "Brasil", estado: "São Paulo", cidade: "São Paulo", cod_regiao: "01310-100" },
    { id_localizacao: 2, nome: "Data Center Rio de Janeiro", pais: "Brasil", estado: "Rio de Janeiro", cidade: "Rio de Janeiro", cod_regiao: "20040-020" },
    { id_localizacao: 3, nome: "Data Center Brasília", pais: "Brasil", estado: "Distrito Federal", cidade: "Brasília", cod_regiao: "70040-010" },
  ];

  const DEFAULT_COMPONENTES = [
    { id_componente: 1, tipo: "CPU", fabricante: "IBM", modelo: "Power 10", num_serie: "CPU001", capacidade: 32 },
    { id_componente: 2, tipo: "RAM", fabricante: "Samsung", modelo: "DDR4 ECC", num_serie: "RAM001", capacidade: 256 },
    { id_componente: 3, tipo: "Disco", fabricante: "IBM", modelo: "FlashSystem", num_serie: "DSK001", capacidade: 4000 },
    { id_componente: 4, tipo: "Rede", fabricante: "Cisco", modelo: "Nexus 9000", num_serie: "NET001", capacidade: 100 },
    { id_componente: 5, tipo: "Temperatura", fabricante: "Honeywell", modelo: "HT-200", num_serie: "TMP001", capacidade: 80 },
    { id_componente: 6, tipo: "Processos", fabricante: "IBM", modelo: "Process Monitor", num_serie: "PRC001", capacidade: 1000 },
  ];

  const DEFAULT_MAINFRAMES = [
    {
      id_mainframe: 1, hostname: "MF-PROD-01", fabricante: "IBM", modelo: "z16", numero_serie: "MF0001",
      status: "ativo", sis_operacional: "z/OS", versao_so: 2.5, fk_usuario: 1, fk_localizacao: 1,
      parametros: [
        { id_parametro: 1, fk_componente: 1, pico_max: 90, pico_min: 10, percentual: 5 },
        { id_parametro: 2, fk_componente: 2, pico_max: 95, pico_min: 20, percentual: 5 },
        { id_parametro: 3, fk_componente: 3, pico_max: 90, pico_min: 10, percentual: 3 },
      ],
    },
    {
      id_mainframe: 2, hostname: "MF-HML-01", fabricante: "IBM", modelo: "z15", numero_serie: "MF0002",
      status: "ativo", sis_operacional: "z/OS", versao_so: 2.4, fk_usuario: 1, fk_localizacao: 2,
      parametros: [
        { id_parametro: 4, fk_componente: 1, pico_max: 85, pico_min: 15, percentual: 7 },
        { id_parametro: 5, fk_componente: 4, pico_max: 95, pico_min: 10, percentual: 8 },
      ],
    },
    {
      id_mainframe: 3, hostname: "MF-DR-01", fabricante: "IBM", modelo: "z16", numero_serie: "MF0003",
      status: "manut.", sis_operacional: "z/VM", versao_so: 7.3, fk_usuario: 1, fk_localizacao: 3,
      parametros: [
        { id_parametro: 6, fk_componente: 1, pico_max: 80, pico_min: 20, percentual: 1 },
        { id_parametro: 7, fk_componente: 2, pico_max: 90, pico_min: 20, percentual: 5 },
        { id_parametro: 8, fk_componente: 4, pico_max: 90, pico_min: 10, percentual: 8 },
      ],
    },
    {
      id_mainframe: 4, hostname: "MF-DEV-01", fabricante: "IBM", modelo: "z14", numero_serie: "MF0004",
      status: "inativo", sis_operacional: "z/VSE", versao_so: 6.2, fk_usuario: 1, fk_localizacao: 1,
      parametros: [
        { id_parametro: 9, fk_componente: 1, pico_max: 80, pico_min: 10, percentual: 7 },
      ],
    },
  ];

  const STATUS_CSS = { ativo: "status-ativo", inativo: "status-inativo", "manut.": "status-manutencao" };
  const STATUS_NOME = { ativo: "Ativo", inativo: "Inativo", "manut.": "Manutenção" };

  function getData(chave, padrao) {
    const data = localStorage.getItem(chave);
    if (data) return JSON.parse(data);
    localStorage.setItem(chave, JSON.stringify(padrao));
    return padrao;
  }

  function saveData(chave, data) {
    localStorage.setItem(chave, JSON.stringify(data));
  }

  function escapeHtml(str) {
    if (str === null || str === undefined) return "";
    return String(str).replace(/[&<>"']/g, (m) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;",
    }[m]));
  }

  let localizacoes = getData("noctua_localizacoes", DEFAULT_LOCALIZACOES);
  let componentes = getData("noctua_componentes", DEFAULT_COMPONENTES);
  let mainframes = getData("noctua_mainframes", DEFAULT_MAINFRAMES);

  const tableBody = document.getElementById("table-body");
  if (!tableBody) return;

  let deleteConfirmId = null;
  let editParametros = [];
  let currentStep = 1;

  const emptyState = document.getElementById("empty-state");
  const summary = document.getElementById("summary");
  const totalBadge = document.getElementById("total-badge");
  const searchInput = document.getElementById("search-input");

  // Elementos do modal
  const modalEdit = document.getElementById("modal-edit");
  const formEdit = document.getElementById("form-edit-mainframe");
  const editIdInput = document.getElementById("edit-id");
  const editHostnameInput = document.getElementById("edit-hostname");
  const editFabricanteInput = document.getElementById("edit-fabricante");
  const editModeloInput = document.getElementById("edit-modelo");
  const editNumeroSerieInput = document.getElementById("edit-numero-serie");
  const editSoInput = document.getElementById("edit-so");
  const editVersaoSoInput = document.getElementById("edit-versao-so");
  const editStatusSelect = document.getElementById("edit-status");
  const editLocalizacaoSelect = document.getElementById("edit-localizacao");
  const editPaisInput = document.getElementById("edit-pais");
  const editEstadoInput = document.getElementById("edit-estado");
  const editCidadeInput = document.getElementById("edit-cidade");
  const editRegiaoInput = document.getElementById("edit-regiao");
  const editCompSelect = document.getElementById("edit-componente");
  const editCompContainer = document.getElementById("edit-componentes-selecionados");
  const btnAddComponente = document.getElementById("btn-add-componente");
  const btnCloseModal = document.getElementById("btn-close-modal");
  const btnCancelModal = document.getElementById("btn-cancel-modal");

  // Nova localização
  const btnToggleNovaLocalizacao = document.getElementById("btn-toggle-nova-localizacao");
  const btnCancelarNovaLocalizacao = document.getElementById("btn-cancelar-nova-localizacao");
  const btnSalvarNovaLocalizacao = document.getElementById("btn-salvar-nova-localizacao");
  const formNovaLocalizacao = document.getElementById("form-nova-localizacao");
  const novaLocNome = document.getElementById("nova-loc-nome");
  const novaLocPais = document.getElementById("nova-loc-pais");
  const novaLocEstado = document.getElementById("nova-loc-estado");
  const novaLocCidade = document.getElementById("nova-loc-cidade");
  const novaLocRegiao = document.getElementById("nova-loc-regiao");

  // Novo componente
  const btnToggleNovoComponente = document.getElementById("btn-toggle-novo-componente");
  const btnCancelarNovoComponente = document.getElementById("btn-cancelar-novo-componente");
  const btnSalvarNovoComponente = document.getElementById("btn-salvar-novo-componente");
  const formNovoComponente = document.getElementById("form-novo-componente");
  const novoCompTipo = document.getElementById("novo-comp-tipo");
  const novoCompFabricante = document.getElementById("novo-comp-fabricante");
  const novoCompModelo = document.getElementById("novo-comp-modelo");
  const novoCompSerie = document.getElementById("novo-comp-serie");
  const novoCompCapacidade = document.getElementById("novo-comp-capacidade");

  // Localizações
  function carregarLocalizacoes() {
    if (!editLocalizacaoSelect) return;
    editLocalizacaoSelect.innerHTML = `<option value="">Selecione uma localização</option>`;
    localizacoes.forEach((loc) => {
      const option = document.createElement("option");
      option.value = loc.id_localizacao;
      option.textContent = `${loc.nome} — ${loc.cidade}/${loc.estado}`;
      editLocalizacaoSelect.appendChild(option);
    });
  }

  function atualizarDadosLocalizacao() {
    if (!editLocalizacaoSelect) return;
    const id = Number(editLocalizacaoSelect.value);
    const localizacao = localizacoes.find((l) => l.id_localizacao === id);

    editPaisInput.value = localizacao ? localizacao.pais : "";
    editEstadoInput.value = localizacao ? localizacao.estado : "";
    editCidadeInput.value = localizacao ? localizacao.cidade : "";
    if (editRegiaoInput) editRegiaoInput.value = localizacao ? localizacao.cod_regiao : "";
  }

  if (editLocalizacaoSelect) editLocalizacaoSelect.addEventListener("change", atualizarDadosLocalizacao);

  function limparFormNovaLocalizacao() {
    novaLocNome.value = "";
    novaLocPais.value = "";
    novaLocEstado.value = "";
    novaLocCidade.value = "";
    novaLocRegiao.value = "";
  }

  function toggleFormNovaLocalizacao(mostrar) {
    if (!formNovaLocalizacao) return;
    formNovaLocalizacao.classList.toggle("hidden", !mostrar);
    if (mostrar) limparFormNovaLocalizacao();
  }

  if (btnToggleNovaLocalizacao) {
    btnToggleNovaLocalizacao.addEventListener("click", () => {
      const estaVisivel = !formNovaLocalizacao.classList.contains("hidden");
      toggleFormNovaLocalizacao(!estaVisivel);
    });
  }

  if (btnCancelarNovaLocalizacao) {
    btnCancelarNovaLocalizacao.addEventListener("click", () => toggleFormNovaLocalizacao(false));
  }

  if (btnSalvarNovaLocalizacao) {
    btnSalvarNovaLocalizacao.addEventListener("click", () => {
      const nome = novaLocNome.value.trim();
      const pais = novaLocPais.value.trim();
      const estado = novaLocEstado.value.trim();
      const cidade = novaLocCidade.value.trim();
      const cod_regiao = novaLocRegiao.value.trim();

      if (!nome || !pais || !estado || !cidade || !cod_regiao) {
        alert("Preencha todos os campos da nova localização.");
        return;
      }

      const novoId = localizacoes.reduce((max, l) => Math.max(max, l.id_localizacao), 0) + 1;
      const novaLocalizacao = { id_localizacao: novoId, nome, pais, estado, cidade, cod_regiao };

      localizacoes = [...localizacoes, novaLocalizacao];
      saveData("noctua_localizacoes", localizacoes);

      carregarLocalizacoes();
      editLocalizacaoSelect.value = novoId;
      atualizarDadosLocalizacao();

      toggleFormNovaLocalizacao(false);
    });
  }

  // Componentes
  function carregarComponentes() {
    if (!editCompSelect) return;
    editCompSelect.innerHTML = `<option value="">Selecione um componente</option>`;
    componentes.forEach((c) => {
      const option = document.createElement("option");
      option.value = c.id_componente;
      option.textContent = `${c.tipo} — ${c.fabricante} ${c.modelo}`;
      editCompSelect.appendChild(option);
    });
  }

  function renderEditComponentes() {
    if (!editCompContainer) return;

    if (editParametros.length === 0) {
      editCompContainer.innerHTML = `<div class="empty-components">Nenhum componente associado.</div>`;
      return;
    }

    editCompContainer.innerHTML = editParametros.map((parametro, index) => {
      const componente = componentes.find((c) => c.id_componente === parametro.fk_componente);
      if (!componente) return "";

      return `
        <div class="edit-component-card">
          <div class="edit-component-header">
            <div>
              <strong>${escapeHtml(componente.tipo)}</strong>
              <span>${escapeHtml(componente.fabricante)} ${escapeHtml(componente.modelo)}</span>
            </div>
            <button type="button" class="remover-componente" data-index="${index}">×</button>
          </div>
          <div class="component-info">
            <small>Série: ${escapeHtml(componente.num_serie)}</small>
            <small>Capacidade: ${escapeHtml(componente.capacidade)}</small>
          </div>
          <div class="component-parametros">
            <div class="field">
              <label>Pico mínimo</label>
              <input type="number" class="parametro-input" data-index="${index}" data-field="pico_min" value="${parametro.pico_min ?? ""}" min="0">
            </div>
            <div class="field">
              <label>Pico máximo</label>
              <input type="number" class="parametro-input" data-index="${index}" data-field="pico_max" value="${parametro.pico_max ?? ""}" min="0">
            </div>
            <div class="field">
              <label>Percentual</label>
              <input type="number" class="parametro-input" data-index="${index}" data-field="percentual" value="${parametro.percentual ?? ""}" min="0" max="100">
            </div>
          </div>
        </div>
      `;
    }).join("");
  }

  if (btnAddComponente) {
    btnAddComponente.addEventListener("click", () => {
      const id = Number(editCompSelect.value);
      if (!id) return;

      const jaExiste = editParametros.some((p) => p.fk_componente === id);
      editCompSelect.value = "";
      if (jaExiste) return;

      editParametros.push({ id_parametro: Date.now(), fk_componente: id, pico_max: 100, pico_min: 0, percentual: 80 });
      renderEditComponentes();
    });
  }

  function limparFormNovoComponente() {
    novoCompTipo.value = "";
    novoCompFabricante.value = "";
    novoCompModelo.value = "";
    novoCompSerie.value = "";
    novoCompCapacidade.value = "";
  }

  function toggleFormNovoComponente(mostrar) {
    if (!formNovoComponente) return;
    formNovoComponente.classList.toggle("hidden", !mostrar);
    if (mostrar) limparFormNovoComponente();
  }

  if (btnToggleNovoComponente) {
    btnToggleNovoComponente.addEventListener("click", () => {
      const estaVisivel = !formNovoComponente.classList.contains("hidden");
      toggleFormNovoComponente(!estaVisivel);
    });
  }

  if (btnCancelarNovoComponente) {
    btnCancelarNovoComponente.addEventListener("click", () => toggleFormNovoComponente(false));
  }

  if (btnSalvarNovoComponente) {
    btnSalvarNovoComponente.addEventListener("click", () => {
      const tipo = novoCompTipo.value.trim();
      const fabricante = novoCompFabricante.value.trim();
      const modelo = novoCompModelo.value.trim();
      const num_serie = novoCompSerie.value.trim();
      const capacidade = Number(novoCompCapacidade.value);

      if (!tipo || !fabricante || !modelo || !num_serie || !novoCompCapacidade.value) {
        alert("Preencha todos os campos do novo componente.");
        return;
      }

      if (num_serie.length !== 6) {
        alert("O número de série do componente deve ter exatamente 6 caracteres.");
        return;
      }

      if (!Number.isInteger(capacidade) || capacidade < 0) {
        alert("A capacidade deve ser um número inteiro maior ou igual a zero.");
        return;
      }

      const novoId = componentes.reduce((max, c) => Math.max(max, c.id_componente), 0) + 1;
      const novoComponente = { id_componente: novoId, tipo, fabricante, modelo, num_serie, capacidade };

      componentes = [...componentes, novoComponente];
      saveData("noctua_componentes", componentes);
      carregarComponentes();

      editParametros.push({ id_parametro: Date.now(), fk_componente: novoId, pico_max: 100, pico_min: 0, percentual: 80 });
      renderEditComponentes();

      toggleFormNovoComponente(false);
    });
  }

  if (editCompContainer) {
    editCompContainer.addEventListener("click", (e) => {
      const button = e.target.closest(".remover-componente");
      if (!button) return;
      editParametros.splice(Number(button.dataset.index), 1);
      renderEditComponentes();
    });

    editCompContainer.addEventListener("input", (e) => {
      const input = e.target.closest(".parametro-input");
      if (!input) return;
      editParametros[Number(input.dataset.index)][input.dataset.field] = Number(input.value);
    });
  }

  // Tabela
  function obterLocalizacao(id) {
    return localizacoes.find((l) => l.id_localizacao === id);
  }

  function obterComponentes(mainframe) {
    return mainframe.parametros
      .map((p) => componentes.find((c) => c.id_componente === p.fk_componente)?.tipo)
      .filter(Boolean);
  }

  function renderTable() {
    const query = searchInput ? searchInput.value.toLowerCase().trim() : "";

    const filtered = mainframes.filter((m) => {
      const localizacao = obterLocalizacao(m.fk_localizacao);
      const componentesTexto = obterComponentes(m).join(", ").toLowerCase();

      return (
        m.hostname.toLowerCase().includes(query) ||
        m.sis_operacional.toLowerCase().includes(query) ||
        componentesTexto.includes(query) ||
        (localizacao && localizacao.cod_regiao.toLowerCase().includes(query))
      );
    });

    if (totalBadge) totalBadge.textContent = mainframes.length;

    if (filtered.length === 0) {
      tableBody.innerHTML = "";
      if (emptyState) emptyState.classList.remove("hidden");
    } else {
      if (emptyState) emptyState.classList.add("hidden");

      tableBody.innerHTML = filtered.map((m) => {
        const localizacao = obterLocalizacao(m.fk_localizacao);
        const componentesTexto = obterComponentes(m).join(", ");
        const acoesConfirmacao = deleteConfirmId === m.id_mainframe
          ? `<button type="button" class="btn-confirm" data-confirm-id="${m.id_mainframe}">Confirmar</button>
             <button type="button" class="btn-cancel">Cancelar</button>`
          : `<button type="button" class="btn-delete" data-ask-id="${m.id_mainframe}">Excluir</button>`;

        return `
          <tr>
            <td>${escapeHtml(m.hostname)}</td>
            <td style="color:#6b7280">${escapeHtml(m.sis_operacional)} ${escapeHtml(m.versao_so)}</td>
            <td style="color:#9ca3af;max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escapeHtml(componentesTexto)}</td>
            <td><span class="status ${STATUS_CSS[m.status] || ""}">${STATUS_NOME[m.status] || m.status}</span></td>
            <td style="color:#9ca3af">${localizacao ? escapeHtml(localizacao.cod_regiao) : "-"}</td>
            <td>
              <div class="actions">
                <button type="button" class="btn-edit" data-id="${m.id_mainframe}">Editar</button>
                ${acoesConfirmacao}
              </div>
            </td>
          </tr>
        `;
      }).join("");
    }

    if (summary) {
      const ativos = mainframes.filter((m) => m.status === "ativo").length;
      const inativos = mainframes.filter((m) => m.status === "inativo").length;
      const manutencao = mainframes.filter((m) => m.status === "manut.").length;

      summary.innerHTML = `
        <span><strong>${ativos}</strong> ativos</span>
        <span><strong>${inativos}</strong> inativos</span>
        <span><strong>${manutencao}</strong> em manutenção</span>
      `;
    }
  }

  // Etapas do modal
  function showStep(step) {
    currentStep = step;

    document.querySelectorAll(".modal-step-content").forEach((section) => {
      section.classList.toggle("active", Number(section.dataset.step) === step);
    });

    document.querySelectorAll(".modal-step").forEach((indicator) => {
      const indicatorStep = Number(indicator.dataset.stepIndicator);
      indicator.classList.toggle("active", indicatorStep === step);
      indicator.classList.toggle("completed", indicatorStep < step);
    });

    document.querySelectorAll(".modal-step-line").forEach((line, index) => {
      line.classList.toggle("active", index < step - 1);
    });
  }

  document.querySelectorAll(".btn-next").forEach((button) => {
    button.addEventListener("click", () => showStep(Number(button.dataset.next)));
  });

  document.querySelectorAll(".btn-prev").forEach((button) => {
    button.addEventListener("click", () => showStep(Number(button.dataset.prev)));
  });

  // Abrir e fechar modal
  function openModal(id) {
    const target = mainframes.find((m) => m.id_mainframe === Number(id));
    if (!target || !modalEdit) return;

    editIdInput.value = target.id_mainframe;
    editHostnameInput.value = target.hostname;
    editFabricanteInput.value = target.fabricante;
    editModeloInput.value = target.modelo;
    editNumeroSerieInput.value = target.numero_serie;
    editSoInput.value = target.sis_operacional;
    editVersaoSoInput.value = target.versao_so;
    editStatusSelect.value = target.status;
    editLocalizacaoSelect.value = target.fk_localizacao;
    atualizarDadosLocalizacao();

    editParametros = target.parametros.map((p) => ({ ...p }));
    renderEditComponentes();

    toggleFormNovaLocalizacao(false);
    toggleFormNovoComponente(false);

    showStep(1);
    modalEdit.classList.remove("hidden");
  }

  function closeModal() {
    if (modalEdit) modalEdit.classList.add("hidden");
    toggleFormNovaLocalizacao(false);
    toggleFormNovoComponente(false);
  }

  // Eventos da tabela
  tableBody.addEventListener("click", (e) => {
    const editBtn = e.target.closest(".btn-edit");
    const askBtn = e.target.closest(".btn-delete");
    const confirmBtn = e.target.closest(".btn-confirm");
    const cancelBtn = e.target.closest(".btn-cancel");

    if (editBtn) {
      openModal(editBtn.dataset.id);
    } else if (askBtn) {
      deleteConfirmId = Number(askBtn.dataset.askId);
      renderTable();
    } else if (confirmBtn) {
      const id = Number(confirmBtn.dataset.confirmId);
      mainframes = mainframes.filter((m) => m.id_mainframe !== id);
      saveData("noctua_mainframes", mainframes);
      deleteConfirmId = null;
      renderTable();
    } else if (cancelBtn) {
      deleteConfirmId = null;
      renderTable();
    }
  });

  // Salvar edição
  if (formEdit) {
    formEdit.addEventListener("submit", (e) => {
      e.preventDefault();

      const id = Number(editIdInput.value);
      const hostname = editHostnameInput.value.trim();
      const fabricante = editFabricanteInput.value.trim();
      const modelo = editModeloInput.value.trim();
      const numero_serie = editNumeroSerieInput.value.trim();
      const sis_operacional = editSoInput.value.trim();
      const versao_so = Number(editVersaoSoInput.value);
      const status = editStatusSelect.value;
      const fk_localizacao = Number(editLocalizacaoSelect.value);

      if (numero_serie.length !== 6) {
        alert("O número de série do mainframe deve ter exatamente 6 caracteres.");
        return;
      }

      const hostnameDuplicado = mainframes.some(
        (m) => m.id_mainframe !== id && m.hostname.toLowerCase() === hostname.toLowerCase()
      );
      if (hostnameDuplicado) {
        alert("Já existe um mainframe com esse hostname.");
        return;
      }

      if (!fk_localizacao) {
        alert("Selecione uma localização.");
        return;
      }

      mainframes = mainframes.map((m) => m.id_mainframe !== id ? m : {
        ...m,
        hostname, fabricante, modelo, numero_serie, sis_operacional, versao_so, status, fk_localizacao,
        parametros: editParametros.map((p) => ({ ...p })),
      });

      saveData("noctua_mainframes", mainframes);
      closeModal();
      renderTable();
    });
  }

  if (btnCloseModal) btnCloseModal.addEventListener("click", closeModal);
  if (btnCancelModal) btnCancelModal.addEventListener("click", closeModal);
  if (modalEdit) modalEdit.addEventListener("click", (e) => { if (e.target === modalEdit) closeModal(); });
  if (searchInput) searchInput.addEventListener("input", renderTable);

  // Inicialização
  carregarLocalizacoes();
  carregarComponentes();
  renderTable();
});