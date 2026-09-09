function login(event) {
    event.preventDefault();

    let emailUsuario = document.getElementById('email').value;
    let senhaUsuario = document.getElementById('password').value;

    fetch('/api/login', {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email_institucional: emailUsuario,
            senha: senhaUsuario,
        })
    })
        .then(response => response.json())
        .then(data => {
            console.log(data.mensagem);
            mensagem(data.icon, data.mensagem, data.descricao);

            if ((data.mensagem).includes('sucesso')) {
                setTimeout(() => {
                    window.location = '/dash-alertas.html'
                }, 2000);
            }
        })
        .catch(error => {
            console.log('Erro ao logar', error);
        });
}

function mostrarSenha(id_senha){
    let senhaValor = document.getElementById(id_senha);

    if (senhaValor.type === "password") {
        senhaValor.type = "text";
        id_botao_mostrar_senha.innerHTML = ``
    } else {
        senhaValor.type = "password";
    }
}