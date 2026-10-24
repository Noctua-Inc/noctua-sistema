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
            mensagem(data.icon, data.mensagem, data.descricao, data.id_usuario, data.id_empresa);

            if ((data.mensagem).includes('sucesso')) {

                console.log("Dados recebidos:", data);
                console.log("ID usuário:", data.usuario.id_usuario);
                console.log("ID empresa:", data.usuario.empresa);

                sessionStorage.setItem("idUsuario", data.usuario.id_usuario);
                sessionStorage.setItem("idEmpresa", data.usuario.id_empresa);
                
                setTimeout(() => {
                    window.location = '/dash-servidores.html'
                }, 2000);
            }
        })
        .catch(error => {
            console.log('Erro ao logar', error);
        });
}