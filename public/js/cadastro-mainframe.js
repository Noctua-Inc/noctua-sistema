document.addEventListener("DOMContentLoaded", () => {
  const idEmpresa = sessionStorage.getItem("idEmpresa");

  let localizacoes = [];
  let currentStep = 1;

  const form = document.getElementById("form-mainframe");
  if (!form) return;

  const hostnameInput = document.getElementById("hostname");
  const numeroSerieInput = document.getElementById("numero-serie");
  const soSelect = document.getElementById("sistema-operacional");
  const versaoSoInput = document.getElementById("versao-so");
  const statusSelect = document.getElementById("status-mainframe");

  const localizacaoSelect = document.getElementById("localizacao");
  const estadoInput = document.getElementById("estado");
  const cidadeInput = document.getElementById("cidade");
  const regiaoInput = document.getElementById("regiao");

  const btnSubmit = document.getElementById("btn-submit");

  // Nova localização
  const btnToggleNovaLocalizacao = document.getElementById("btn-toggle-nova-localizacao");
  const btnCancelarNovaLocalizacao = document.getElementById("btn-cancelar-nova-localizacao");
  const btnSalvarNovaLocalizacao = document.getElementById("btn-salvar-nova-localizacao");
  const formNovaLocalizacao = document.getElementById("form-nova-localizacao");
  const novaLocNome = document.getElementById("nova-loc-nome");
  const novaLocEstado = document.getElementById("nova-loc-estado");
  const novaLocCidade = document.getElementById("nova-loc-cidade");
  const novaLocRegiao = document.getElementById("nova-loc-regiao");

  // Localizações
  function preencherSelectLocalizacoes() {
    localizacaoSelect.innerHTML = `<option value="">Selecione uma localização</option>`;
    localizacoes.forEach((loc) => {
      const option = document.createElement("option");
      option.value = loc.id_localizacao;
      option.textContent = `${loc.nome} — ${loc.cidade}/${loc.estado}`;
      localizacaoSelect.appendChild(option);
    });
  }

  async function carregarEstado() {
    novaLocEstado.innerHTML = '<option value="">Selecione o estado</option>';

    const res = await fetch("https://servicodados.ibge.gov.br/api/v1/localidades/estados");
    const estados = await res.json();

    estados.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));

    estados.forEach((estado) => {
      const option = document.createElement("option");
      option.value = estado.sigla;
      option.textContent = estado.nome;
      novaLocEstado.appendChild(option);
    });
  }

  async function carregarCidade(uf, cidadeSelecionada = "") {
    novaLocCidade.innerHTML = '<option value="">Selecione a cidade</option>';
    novaLocCidade.disabled = true;

    if (!uf) {
      return;
    }

    const res = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`);
    const cidades = await res.json();

    cidades.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));

    cidades.forEach((cidade) => {
      const option = document.createElement("option");
      option.value = cidade.nome;
      option.textContent = cidade.nome;

      novaLocCidade.appendChild(option);

      if (cidade.nome === cidadeSelecionada) {
        option.selected = true;
      }
    });

    novaLocCidade.disabled = false;
  }

  novaLocEstado.addEventListener("change", async () => {
    await carregarCidade(novaLocEstado.value);
  });

  novaLocRegiao.addEventListener("blur", async () => {
    const cep = novaLocRegiao.value.replace(/\D/g, "");

    if (cep.length !== 8) {
      alert("O cep deve conter 8 dígitos!");
      return;
    }

    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const endereco = await res.json();

      if (endereco.erro) {
        alert("Endereço não encontrado");
        return;
      }

      novaLocEstado.value = endereco.uf;
      await carregarCidade(novaLocEstado.value, endereco.localidade);
    } catch (erro) {
      console.error("Erro ao consultar o CEP:", erro);
    }
  });

  async function carregarLocalizacoes() {
    localizacoes = await api.get("/localizacao");
    preencherSelectLocalizacoes();
  }

  function atualizarDadosLocalizacao() {
    const id = Number(localizacaoSelect.value);
    const localizacao = localizacoes.find((l) => l.id_localizacao === id);

    estadoInput.value = localizacao ? localizacao.estado : "";
    cidadeInput.value = localizacao ? localizacao.cidade : "";
    regiaoInput.value = localizacao ? localizacao.cep : "";
  }

  localizacaoSelect.addEventListener("change", atualizarDadosLocalizacao);

  function limparFormNovaLocalizacao() {
    novaLocNome.value = "";
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
    const estado = novaLocEstado.value.trim();
    const cidade = novaLocCidade.value.trim();
    const cep = novaLocRegiao.value.trim();

    if (!nome || !estado || !cidade || !cep) {
      alert("Preencha todos os campos da nova localização.");
      return;
    }

    try {
      const nova = await api.post("/localizacao", { nome, estado, cidade, cep });
      await carregarLocalizacoes();
      localizacaoSelect.value = nova.id_localizacao;
      atualizarDadosLocalizacao();
      toggleFormNovaLocalizacao(false);
    } catch (err) {
      alert(err.message);
    }
  });

  function lerValorNumerico(id) {
    const componenteEscolhido = document.getElementById(id);
    if (!componenteEscolhido || componenteEscolhido.value === "") return null;
    return Number(componenteEscolhido.value);
  }

  function coletarParametrosComponentes() {
    return {
      CPU: {
        pct_min: lerValorNumerico("cpu-pct-min"),
        pct_max: lerValorNumerico("cpu-pct-max"),
        freq_min: lerValorNumerico("cpu-freq-min"),
        freq_max: lerValorNumerico("cpu-freq-max"),
      },
      RAM: {
        pct_min: lerValorNumerico("ram-pct-min"),
        pct_max: lerValorNumerico("ram-pct-max"),
        gb_min: lerValorNumerico("ram-gb-min"),
        gb_max: lerValorNumerico("ram-gb-max"),
      },
      SWAP: {
        pct_min: lerValorNumerico("swap-pct-min"),
        pct_max: lerValorNumerico("swap-pct-max"),
      },
      DISCO: {
        pct_min: lerValorNumerico("disco-pct-min"),
        pct_max: lerValorNumerico("disco-pct-max"),
        pb_min: lerValorNumerico("disco-pb-min"),
        pb_max: lerValorNumerico("disco-pb-max"),
        req_min: lerValorNumerico("disco-req-min"),
        req_max: lerValorNumerico("disco-req-max"),
      },
      REDE: {
        tb_min: lerValorNumerico("rede-tb-min"),
        tb_max: lerValorNumerico("rede-tb-max"),
        pkt_min: lerValorNumerico("rede-pkt-min"),
        pkt_max: lerValorNumerico("rede-pkt-max"),
        tw_min: lerValorNumerico("rede-tw-min"),
        tw_max: lerValorNumerico("rede-tw-max"),
      },
    };
  }

  // Etapas
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

  // Envio do formulário
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const hostname = hostnameInput.value.trim();
    const numero_serie = numeroSerieInput.value.trim();
    const sis_operacional = soSelect.value;
    const versao_so = versaoSoInput.value.trim();
    const status = statusSelect.value;
    const fk_localizacao = Number(localizacaoSelect.value);

    if (!idEmpresa) {
      alert("Faça login novamente para identificar a empresa do cadastro.");
      return;
    }
    if (!fk_localizacao) {
      alert("Selecione uma localização.");
      return;
    }
    if (numero_serie.length !== 6) {
      alert("O número de série do mainframe deve ter exatamente 6 caracteres.");
      return;
    }

    const parametros = coletarParametrosComponentes();

    const corpo = {
      hostname,
      numero_serie,
      status,
      sis_operacional,
      versao_so,
      fk_empresa: Number(idEmpresa),
      fk_localizacao,
      parametros
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

  // Inicialização
  (async function iniciar() {
    try {
      await Promise.all([carregarLocalizacoes(), carregarEstado()]);
    } catch (err) {
      console.error(err);
      alert("Não foi possível carregar os dados do servidor. Verifique se a API está no ar.");
    }
  })();
});