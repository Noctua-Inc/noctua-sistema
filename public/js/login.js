const { response } = require("express");

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
            message(data.icon, data.mensagem, data.descricao);

            if (response.status == 200) {
                setTimeout(() => {
                    window.location = '/dash-alertas.html'
                }, 2000);
            }
        })
        .catch(error => {
            console.log('Erro ao logar', error);
        });
}