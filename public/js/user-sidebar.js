const id = sessionStorage.getItem("idUsuario");
let usuario = [];

const cargoHtml = document.getElementById("cargos-html");
const funcHtml = document.getElementById("funcionarios-html");

function verificarCargo() {
    if (!cargoHtml || !funcHtml) {
        console.log("Elementos não encontrados");
        return;
    }

    if (usuario.nome_cargo === "Administrador") {
        cargoHtml.classList.remove("hidden");
        funcHtml.classList.remove("hidden");
    } else {
        cargoHtml.classList.add("hidden");
        funcHtml.classList.add("hidden");
    }

}

async function preencherUsuario(){
    try {

        const nomeUsuario = document.getElementById("user-name");
        const cargoUsuario = document.getElementById("user-role");
        const avatarUsuario = document.getElementById("user-avatar");

        if (!nomeUsuario || !cargoUsuario || !avatarUsuario) {
            console.log("sem elementos")
            return;
        }

        usuario = await api.get(`/buscarUsuario/${id}`)


        nomeUsuario.innerText = usuario.nome_usuario;
        cargoUsuario.innerText = usuario.nome_cargo;
            
        const iniciais = usuario.nome_usuario.split(" ").map(nome_usuario => nome_usuario[0]).join("").toUpperCase()

        avatarUsuario.innerText = iniciais;

        verificarCargo();

    } catch (error) {
        console.log(error)
    }
}

preencherUsuario();

document.querySelector('.sidebar-user > a:last-child')?.addEventListener('click', () => {
    sessionStorage.clear();
});