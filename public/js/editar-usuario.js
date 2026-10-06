const idUser = sessionStorage.getItem("idUsuario");
let localizacaoPopUpEditarUsuario = document.getElementById("editar-usuario");
let localizacaoContainerMain = document.getElementById("container_main");
let user = [];

const popUpEditarUsuario = `
    <div class="popup-editar">
        <p class="fechar fa-solid fa-xmark" onclick="fecharEditarUsuario()"></p>
        <h3 class="titulo">
            Atualize as suas informações
        </h3>

        <form>
            <div class="input-form">
                <label for="ipt_nome_completo">
                    Nome Completo
                </label>
                <input 
                type="text" 
                id="ipt_nome_completo"
                value="Ana Souza">
            </div>

            <div class="input-form">
                <label for="ipt_email_corporativo">
                    E-mail Corporativo
                </label>
                <input 
                type="email" 
                id="ipt_email_corporativo"
                value="ana@empresa.com.br">
            </div>

            <div class="input-form">
                <label for="ipt_redefinir_senha">
                    Redefinir Senha
                </label>
                <input 
                type="password" 
                id="ipt_redefinir_senha"
                value="">
            </div>

            <div class="input-form">
                <label for="ipt_confirmar_senha">
                    Confirmar Senha
                </label>
                <input 
                type="password" 
                id="ipt_confirmar_senha"
                value="">
            </div>
        </form>

        <div class="sessao-butoes">
            <button class="botao atualizar-conta">
                Atualizar Informações
            </button>

            <button class="botao deletar-conta">
                Deletar Conta
            </button>
        </div>

    </div>
`
localizacaoPopUpEditarUsuario.innerHTML = popUpEditarUsuario;

async function abrirEditarUsuario() {
    await carregarUsuario();

    localizacaoPopUpEditarUsuario.style.display = "block";
    localizacaoContainerMain.style.filter = "brightness(0.5)";
    localizacaoContainerMain.style.background = "rgba(221, 221, 221, 0.9)";

    const nome = document.getElementById("ipt_nome_completo");
    const email = document.getElementById("ipt_email_corporativo");

    console.log("USUÁRIO:", user);
        console.log("NOME:", user.nome_usuario);
        console.log("EMAIL:", user.email_institucional);

    nome.value = user.nome_usuario;
    email.value = user.email_institucional;
}

function fecharEditarUsuario() {
    localizacaoPopUpEditarUsuario.style.display = "none";
    localizacaoContainerMain.style.filter = "none";
    localizacaoContainerMain.style.background = "none";
}

async function carregarUsuario() {
    user = await api.get(`/buscarUsuario/${idUser}`);
}