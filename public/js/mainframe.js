document.addEventListener("DOMContentLoaded", () => {

  const STATUS_CSS = { ativo: "status-ativo", inativo: "status-inativo", "manut.": "status-manutencao" };
  const STATUS_NOME = { ativo: "Ativo", inativo: "Inativo", "manut.": "Manutenção" };

  function escapeHtml(str) {
    if (str === null || str === undefined) return "";
    return String(str).replace(/[&<>"']/g, (m) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;",
    }[m]));
  }

  let localizacoes = [];
  let componentes = [];
  let mainframes = [];

  const tableBody = document.getElementById("table-body");
  if (!tableBody) return;

  let deleteConfirmId = null;
  let editParametros = [];
  let editFkUsuario = 1;
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

  //  Localizações 
  function preencherSelectLocalizacoes() {
    if (!editLocalizacaoSelect) return;
    editLocalizacaoSelect.innerHTML = `<option value="">Selecione uma localização</option>`;
    localizacoes.forEach((loc) => {
      const option = document.createElement("option");
      option.value = loc.id_localizacao;
      option.textContent = `${loc.nome} — ${loc.cidade}/${loc.estado}`;
      editLocalizacaoSelect.appendChild(option);
    });
  }

  async function carregarLocalizacoes() {
    localizacoes = await api.get("/localizacao");
    preencherSelectLocalizacoes();
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
    btnSalvarNovaLocalizacao.addEventListener("click", async () => {
      const nome = novaLocNome.value.trim();
      const pais = novaLocPais.value.trim();
      const estado = novaLocEstado.value.trim();
      const cidade = novaLocCidade.value.trim();
      const cod_regiao = novaLocRegiao.value.trim();

      if (!nome || !pais || !estado || !cidade || !cod_regiao) {
        alert("Preencha todos os campos da nova localização.");
        return;
      }

      try {
        const nova = await api.post("/localizacao", { nome, pais, estado, cidade, cod_regiao });
        await carregarLocalizacoes();
        editLocalizacaoSelect.value = nova.id_localizacao;
        atualizarDadosLocalizacao();
        toggleFormNovaLocalizacao(false);
      } catch (err) {
        alert(err.message);
      }
    });
  }

  //  Componentes 
  function preencherSelectComponentes() {
    if (!editCompSelect) return;
    editCompSelect.innerHTML = `<option value="">Selecione um componente</option>`;
    componentes.forEach((c) => {
      const option = document.createElement("option");
      option.value = c.id_componente;
      option.textContent = `${c.tipo} — ${c.fabricante} ${c.modelo}`;
      editCompSelect.appendChild(option);
    });
  }

  async function carregarComponentes() {
    componentes = await api.get("/componente");
    preencherSelectComponentes();
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

      editParametros.push({ fk_componente: id, pico_max: 100, pico_min: 0, percentual: 80 });
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
    btnSalvarNovoComponente.addEventListener("click", async () => {
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

      try {
        const novo = await api.post("/componente", { tipo, fabricante, modelo, num_serie, capacidade });
        await carregarComponentes();

        editParametros.push({ fk_componente: novo.id_componente, pico_max: 100, pico_min: 0, percentual: 80 });
        renderEditComponentes();

        toggleFormNovoComponente(false);
      } catch (err) {
        alert(err.message);
      }
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

  //  Tabela 
  async function carregarMainframes() {
    mainframes = await api.get("/mainframe");
    renderTable();
  }

  function renderTable() {
    const query = searchInput ? searchInput.value.toLowerCase().trim() : "";

    const filtered = mainframes.filter((m) => {
      const componentesTexto = (m.componentes || "").toLowerCase();
      const codRegiao = (m.cod_regiao || "").toLowerCase();

      return (
        m.hostname.toLowerCase().includes(query) ||
        m.sis_operacional.toLowerCase().includes(query) ||
        componentesTexto.includes(query) ||
        codRegiao.includes(query)
      );
    });

    if (totalBadge) totalBadge.textContent = mainframes.length;

    if (filtered.length === 0) {
      tableBody.innerHTML = "";
      if (emptyState) emptyState.classList.remove("hidden");
    } else {
      if (emptyState) emptyState.classList.add("hidden");

      tableBody.innerHTML = filtered.map((m) => {
        const acoesConfirmacao = deleteConfirmId === m.id_mainframe
          ? `<button type="button" class="btn-confirm" data-confirm-id="${m.id_mainframe}">Confirmar</button>
             <button type="button" class="btn-cancel">Cancelar</button>`
          : `<button type="button" class="btn-delete" data-ask-id="${m.id_mainframe}">Excluir</button>`;

        return `
          <tr>
            <td>${escapeHtml(m.hostname)}</td>
            <td style="color:#6b7280">${escapeHtml(m.sis_operacional)} ${escapeHtml(m.versao_so)}</td>
            <td style="color:#9ca3af;max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escapeHtml(m.componentes)}</td>
            <td><span class="status ${STATUS_CSS[m.status] || ""}">${STATUS_NOME[m.status] || m.status}</span></td>
            <td style="color:#9ca3af">${m.cod_regiao ? escapeHtml(m.cod_regiao) : "-"}</td>
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

  //  Etapas do modal 
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
  async function openModal(id) {
    if (!modalEdit) return;

    try {
      const target = await api.get(`/mainframe/${id}`);

      editIdInput.value = target.id_mainframe;
      editFkUsuario = target.fk_usuario;
      editHostnameInput.value = target.hostname;
      editFabricanteInput.value = target.fabricante;
      editModeloInput.value = target.modelo;
      editNumeroSerieInput.value = target.numero_serie;
      editSoInput.value = target.sis_operacional;
      editVersaoSoInput.value = target.versao_so;
      editStatusSelect.value = target.status;
      editLocalizacaoSelect.value = target.fk_localizacao;
      atualizarDadosLocalizacao();

      editParametros = target.parametros.map((p) => ({
        fk_componente: p.fk_componente, pico_max: p.pico_max, pico_min: p.pico_min, percentual: p.percentual,
      }));
      renderEditComponentes();

      toggleFormNovaLocalizacao(false);
      toggleFormNovoComponente(false);

      showStep(1);
      modalEdit.classList.remove("hidden");
    } catch (err) {
      alert(err.message);
    }
  }

  function closeModal() {
    if (modalEdit) modalEdit.classList.add("hidden");
    toggleFormNovaLocalizacao(false);
    toggleFormNovoComponente(false);
  }

  // Eventos da tabela
  tableBody.addEventListener("click", async (e) => {
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
      try {
        await api.delete(`/mainframe/${id}`);
        mainframes = mainframes.filter((m) => m.id_mainframe !== id);
      } catch (err) {
        alert(err.message);
      }
      deleteConfirmId = null;
      renderTable();
    } else if (cancelBtn) {
      deleteConfirmId = null;
      renderTable();
    }
  });

  // Salvar edição
  if (formEdit) {
    formEdit.addEventListener("submit", async (e) => {
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
      if (!fk_localizacao) {
        alert("Selecione uma localização.");
        return;
      }

      const corpo = {
        hostname, fabricante, modelo, numero_serie, sis_operacional, versao_so, status, fk_localizacao,
        fk_usuario: editFkUsuario,
        parametros: editParametros,
      };

      try {
        await api.put(`/mainframe/${id}`, corpo);
        await carregarMainframes();
        closeModal();
      } catch (err) {
        alert(err.message);
      }
    });
  }

  if (btnCloseModal) btnCloseModal.addEventListener("click", closeModal);
  if (btnCancelModal) btnCancelModal.addEventListener("click", closeModal);
  if (modalEdit) modalEdit.addEventListener("click", (e) => { if (e.target === modalEdit) closeModal(); });
  if (searchInput) searchInput.addEventListener("input", renderTable);

  // Inicialização
  (async function iniciar() {
    try {
      await Promise.all([carregarLocalizacoes(), carregarComponentes()]);
      await carregarMainframes();
    } catch (err) {
      console.error(err);
      alert("Não foi possível carregar os dados do servidor. Verifique se a API está no ar.");
    }
  })();
});