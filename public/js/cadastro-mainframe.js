document.addEventListener("DOMContentLoaded", () => {

  function escapeHtml(str) {
    if (str === null || str === undefined) return "";
    return String(str).replace(/[&<>"']/g, (m) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;",
    }[m]));
  }

  let localizacoes = [];
  let componentes = [];
  let componentesAdicionados = [];
  let currentStep = 1;

  const form = document.getElementById("form-mainframe");
  if (!form) return;

  const hostnameInput = document.getElementById("hostname");
  const fabricanteInput = document.getElementById("fabricante");
  const modeloInput = document.getElementById("modelo");
  const numeroSerieInput = document.getElementById("numero-serie");
  const soSelect = document.getElementById("sistema-operacional");
  const versaoSoInput = document.getElementById("versao-so");
  const statusSelect = document.getElementById("status-mainframe");

  const localizacaoSelect = document.getElementById("localizacao");
  const paisInput = document.getElementById("pais");
  const estadoInput = document.getElementById("estado");
  const cidadeInput = document.getElementById("cidade");
  const regiaoInput = document.getElementById("regiao");

  const compSelect = document.getElementById("componente");
  const compContainer = document.getElementById("componentes-selecionados");
  const btnAddComponente = document.getElementById("btn-add-componente");
  const btnSubmit = document.getElementById("btn-submit");

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
    localizacaoSelect.innerHTML = `<option value="">Selecione uma localização</option>`;
    localizacoes.forEach((loc) => {
      const option = document.createElement("option");
      option.value = loc.id_localizacao;
      option.textContent = `${loc.nome} — ${loc.cidade}/${loc.estado}`;
      localizacaoSelect.appendChild(option);
    });
  }

  async function carregarLocalizacoes() {
    localizacoes = await api.get("/localizacao");
    preencherSelectLocalizacoes();
  }

  function atualizarDadosLocalizacao() {
    const id = Number(localizacaoSelect.value);
    const localizacao = localizacoes.find((l) => l.id_localizacao === id);

    paisInput.value = localizacao ? localizacao.pais : "";
    estadoInput.value = localizacao ? localizacao.estado : "";
    cidadeInput.value = localizacao ? localizacao.cidade : "";
    regiaoInput.value = localizacao ? localizacao.cod_regiao : "";
  }

  localizacaoSelect.addEventListener("change", atualizarDadosLocalizacao);

  function limparFormNovaLocalizacao() {
    novaLocNome.value = "";
    novaLocPais.value = "";
    novaLocEstado.value = "";
    novaLocCidade.value = "";
    novaLocRegiao.value = "";
  }

  function toggleFormNovaLocalizacao(mostrar) {
    formNovaLocalizacao.classList.toggle("hidden", !mostrar);
    if (mostrar) limparFormNovaLocalizacao();
  }

  btnToggleNovaLocalizacao.addEventListener("click", () => {
    toggleFormNovaLocalizacao(formNovaLocalizacao.classList.contains("hidden"));
  });

  btnCancelarNovaLocalizacao.addEventListener("click", () => toggleFormNovaLocalizacao(false));

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
      localizacaoSelect.value = nova.id_localizacao;
      atualizarDadosLocalizacao();
      toggleFormNovaLocalizacao(false);
    } catch (err) {
      alert(err.message);
    }
  });

  //  Componentes 
  function preencherSelectComponentes() {
    compSelect.innerHTML = `<option value="">Selecione para adicionar...</option>`;
    componentes.forEach((c) => {
      const option = document.createElement("option");
      option.value = c.id_componente;
      option.textContent = `${c.tipo} — ${c.fabricante} ${c.modelo}`;
      compSelect.appendChild(option);
    });
  }

  async function carregarComponentes() {
    componentes = await api.get("/componente");
    preencherSelectComponentes();
  }

  function renderComponentesAdicionados() {
    if (componentesAdicionados.length === 0) {
      compContainer.innerHTML = `<div class="empty-components">Nenhum componente associado.</div>`;
      return;
    }

    compContainer.innerHTML = componentesAdicionados.map((parametro, index) => {
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

  function adicionarComponente(id) {
    if (!id) return;
    const jaExiste = componentesAdicionados.some((p) => p.fk_componente === id);
    if (jaExiste) return;

    componentesAdicionados.push({ fk_componente: id, pico_max: 100, pico_min: 0, percentual: 80 });
    renderComponentesAdicionados();
  }

  btnAddComponente.addEventListener("click", () => {
    const id = Number(compSelect.value);
    adicionarComponente(id);
    compSelect.value = "";
  });

  compContainer.addEventListener("click", (e) => {
    const button = e.target.closest(".remover-componente");
    if (!button) return;
    componentesAdicionados.splice(Number(button.dataset.index), 1);
    renderComponentesAdicionados();
  });

  compContainer.addEventListener("input", (e) => {
    const input = e.target.closest(".parametro-input");
    if (!input) return;
    componentesAdicionados[Number(input.dataset.index)][input.dataset.field] = Number(input.value);
  });

  function limparFormNovoComponente() {
    novoCompTipo.value = "";
    novoCompFabricante.value = "";
    novoCompModelo.value = "";
    novoCompSerie.value = "";
    novoCompCapacidade.value = "";
  }

  function toggleFormNovoComponente(mostrar) {
    formNovoComponente.classList.toggle("hidden", !mostrar);
    if (mostrar) limparFormNovoComponente();
  }

  btnToggleNovoComponente.addEventListener("click", () => {
    toggleFormNovoComponente(formNovoComponente.classList.contains("hidden"));
  });

  btnCancelarNovoComponente.addEventListener("click", () => toggleFormNovoComponente(false));

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
      adicionarComponente(novo.id_componente);
      toggleFormNovoComponente(false);
    } catch (err) {
      alert(err.message);
    }
  });

  //  Etapas 
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

  //  Envio do formulário 
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const hostname = hostnameInput.value.trim();
    const fabricante = fabricanteInput.value.trim();
    const modelo = modeloInput.value.trim();
    const numero_serie = numeroSerieInput.value.trim();
    const sis_operacional = soSelect.value;
    const versao_so = Number(versaoSoInput.value);
    const status = statusSelect.value;
    const fk_localizacao = Number(localizacaoSelect.value);

    if (!fk_localizacao) {
      alert("Selecione uma localização.");
      return;
    }
    if (numero_serie.length !== 6) {
      alert("O número de série do mainframe deve ter exatamente 6 caracteres.");
      return;
    }

    const corpo = {
      hostname, fabricante, modelo, numero_serie, status, sis_operacional, versao_so,
      fk_usuario: 1,
      fk_localizacao,
      parametros: componentesAdicionados,
    };

    btnSubmit.disabled = true;
    try {
      await api.post("/mainframe", corpo);
      window.location.href = "mainframes.html";
    } catch (err) {
      alert(err.message);
      btnSubmit.disabled = false;
    }
  });

  //  Inicialização 
  (async function iniciar() {
    try {
      await Promise.all([carregarLocalizacoes(), carregarComponentes()]);
      renderComponentesAdicionados();
    } catch (err) {
      console.error(err);
      alert("Não foi possível carregar os dados do servidor. Verifique se a API está no ar.");
    }
  })();
});