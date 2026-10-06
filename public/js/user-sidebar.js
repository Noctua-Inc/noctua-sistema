const id = sessionStorage.getItem("idUsuario");
let usuario = [];

async function preencherUsuario(){
    try {

        const nomeUsuario = document.getElementById("user-name");
        const cargoUsuario = document.getElementById("user-role");
        const avatarUsuario = document.getElementById("user-avatar");

        if (!nomeUsuario || !cargoUsuario || !avatarUsuario) {
            console.log("sem elementos")
            return;
        }

        console.log(id)
        usuario = await api.get(`/buscarUsuario/${id}`)

        nomeUsuario.innerText = usuario.nome_usuario;
        cargoUsuario.innerText = usuario.nome_cargo;
            
        const iniciais = usuario.nome_usuario.split(" ").map(nome_usuario => nome_usuario[0]).join("").toUpperCase()

        avatarUsuario.innerText = iniciais;

    } catch (error) {
        console.log(error)
    }
}

preencherUsuario();