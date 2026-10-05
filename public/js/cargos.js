let cargos = [];
let cargoSelecionado = null;

const id = sessionStorage.getItem("idUsuario");
const idEmpresa = sessionStorage.getItem("idEmpresa");

async function carregarCargos() {
    // BACK-END: conferir se a rota GET /api/cargo retorna os cargos
    // no formato: [{ id_cargo, nome_cargo, permissoes: [1, 2, 3] }]
    cargos = await api.get(`/cargo/${idEmpresa}`);

    let container = document.getElementById("roles-list");

    container.innerHTML = "";

    for (let i = 0; i < cargos.length; i++) {
        let cargo = cargos[i];
        let permissoes = "";

        if (cargo.permissoes.includes(3)) {
            permissoes += `<span class="permission-tag">Criação</span>`;
        }

        if (cargo.permissoes.includes(1)) {
            permissoes += `<span class="permission-tag">Visualização</span>`;
        }

        if (cargo.permissoes.includes(2)) {
            permissoes += `<span class="permission-tag">Edição</span>`;
        }

        if (cargo.permissoes.includes(4)) {
            permissoes +=`<span class="permission-tag">Exclusão</span>`;
        }

        let classeSelecionado = "";

        if (cargoSelecionado && cargoSelecionado.id_cargo == cargo.id_cargo) { classeSelecionado = "selected"; }

        container.innerHTML += `
            <div class="role-row ${classeSelecionado}">
                <div class="role-name">
                    ${cargo.nome_cargo}
                </div>
                <div class="permission-tags">
                    ${permissoes}
                </div>
                <div class="role-actions">
                    <button
                        class="icon-action"
                        onclick="selecionarCargo(${cargo.id_cargo})"
                    >
                        <i class="fa-solid fa-pen-to-square"></i>
                    </button>

                    <button
                        class="icon-action btn-role-delete"
                        onclick="abrirPopup(${cargo.id_cargo})"
                    >
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            </div>
        `;
    }

    document.getElementById("roles-count").textContent = `Mostrando ${cargos.length} cargos`;

    if (cargos.length == 0) {
        document.getElementById("empty-state").classList.remove("hidden");
    } else {
        document.getElementById("empty-state").classList.add("hidden");
    }
}

function selecionarCargo(idCargo) {
    for (let i = 0; i < cargos.length; i++) {
        if (cargos[i].id_cargo == idCargo) {
            cargoSelecionado = cargos[i];
            break;
        }
    }

    document.getElementById("edit-card").classList.remove("disabled");
    document.getElementById("editar-nome-cargo").disabled = false;
    document.getElementById("btn-editar-cargo").disabled = false;

    let checkboxes = document.querySelectorAll('input[name="editar-permissao"]');

    for (let i = 0; i < checkboxes.length; i++) {
        let idPermissao = Number(checkboxes[i].value);

        if (cargoSelecionado.permissoes.includes(idPermissao)) {
            checkboxes[i].checked = true;
        } else {
            checkboxes[i].checked = false;
        }

        checkboxes[i].disabled = false;
    }

    document.getElementById("editar-nome-cargo").value = cargoSelecionado.nome_cargo;

    carregarCargos();
}

async function editarCargo() {

    if (!cargoSelecionado) {
        return;
    }

    let nome = document.getElementById("editar-nome-cargo").value;

    let checkboxes = document.querySelectorAll('input[name="editar-permissao"]');
    let permissoes = [];

    for (let i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i].checked) {
            permissoes.push(Number(checkboxes[i].value));
        }
    }

    // BACK-END: conferir se a rota PUT /api/cargo/:id aceita
    // { nome_cargo: nome, permissoes: [ids das permissões] }
    await api.put(`/cargo/${cargoSelecionado.id_cargo}`, {
            nome_cargo: nome,
            permissoes: permissoes
        }
    );

    cargoSelecionado = null;

    document.getElementById("edit-card").classList.add("disabled");
    document.getElementById("editar-nome-cargo").disabled = true;
    document.getElementById("btn-editar-cargo").disabled = true;

    carregarCargos();
}

async function criarCargo() {

    let nome = document.getElementById("criar-nome-cargo").value;
    let checkboxes = document.querySelectorAll('input[name="criar-permissao"]');
    let permissoes = [];

    for (let i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i].checked) {
            permissoes.push(Number(checkboxes[i].value));
        }
    }

    if (nome == "") {
        alert("Digite o nome do cargo.");
        return;
    }

    // BACK-END: conferir se a rota POST /api/cargo aceita
    // { nome_cargo: nome, permissoes: [ids das permissões] }
    await api.post(
        `/cargo/${idEmpresa}`,
        {
            nome_cargo: nome,
            permissoes: permissoes
        }
    );

    document.getElementById("criar-nome-cargo").value = "";

    for (let i = 0; i < checkboxes.length; i++) {
        checkboxes[i].checked = false;
    }

    carregarCargos();
}

function abrirPopup(idCargo) {
    cargoExcluindo = idCargo;
    document.getElementById("modal-excluir").classList.remove("hidden");
}

function fecharPopup() {
    cargoExcluindo = null;
    document.getElementById("modal-excluir").classList.add("hidden");
}

async function excluirCargo() {

    // BACK-END: conferir se a rota DELETE /api/cargo/:id
    // remove o cargo e suas permissões relacionadas.
    await api.delete(
        `/cargo/${cargoExcluindo}`
    );

    fecharPopup();

    if (cargoSelecionado && cargoSelecionado.id_cargo == cargoExcluindo) {
        cargoSelecionado = null;
        document.getElementById("edit-card").classList.add("disabled");
        document.getElementById("editar-nome-cargo").disabled = true;
        document.getElementById("btn-editar-cargo").disabled = true;
    }

    carregarCargos();
}

let cargoExcluindo = null;

document.getElementById("btn-criar-cargo").addEventListener("click", criarCargo);
document.getElementById("btn-editar-cargo").addEventListener("click", editarCargo);
document.getElementById("btn-cancelar-exclusao").addEventListener("click", fecharPopup);
document.getElementById("btn-confirmar-exclusao").addEventListener("click", excluirCargo);

carregarCargos();