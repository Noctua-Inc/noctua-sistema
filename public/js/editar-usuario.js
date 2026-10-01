let localizacaoPopUpEditarUsuario = document.getElementById("editar-usuario");
let localizacaoContainerMain = document.getElementById("container_main");

const popUpEditarUsuario = `
    <div class="popup-editar">
        <p class="fechar" onclick="fecharEditarUsuario()"> 
            X
        </p>
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

function abrirEditarUsuario() {
    localizacaoPopUpEditarUsuario.style.display = "block";
    localizacaoContainerMain.style.filter = "brightness(0.5)";
    localizacaoContainerMain.style.background = "rgba(221, 221, 221, 0.9)";
}

function fecharEditarUsuario() {
    localizacaoPopUpEditarUsuario.style.display = "none";
    localizacaoContainerMain.style.filter = "none";
    localizacaoContainerMain.style.background = "none";
}