function errorMessage(icone, titulo, descricao) {
    const div_content = document.querySelector('.content');

    const div_erro = document.createElement('div');

    const icon = document.createElement('img');
    const title = document.createElement('p');
    const desc = document.createElement('p');

    div_erro.classList.add('div_erro');
    icon.classList.add('icon');
    title.classList.add('title');
    desc.classList.add('desc');
    
    icon.src = `${icone}`;
    title.textContent = `${titulo}`
    desc.textContent = `${descricao}`

    div_erro.appendChild(icon);
    div_erro.appendChild(title);
    div_erro.appendChild(desc);
    div_content.appendChild(div_erro);

    setTimeout(() => {
        div_erro.style.display = 'none';
    }, 5000);
}

function cadastrar(event) {
    event.preventDefault();

    let nomeUsuario = document.getElementById('nome_completo').value
    let emailUsuario = document.getElementById('email').value
    let cpfUsuario = document.getElementById('cpf').value
    let senhaUsuario = document.getElementById('password').value
    let confirmSenhaUsuario = document.getElementById('confirm_password').value

    fetch('/api/cadastro', {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            nome: nomeUsuario,
            email_institucional: emailUsuario,
            cpf: cpfUsuario,
            senha: senhaUsuario,
            confirmacao_senha: confirmSenhaUsuario
        })
    })
        .then(response => response.json())
        .then(data => {
            errorMessage(data.icon, data.mensagem, data.descricao);
        })
        .catch(error => {
            console.log('Erro ao cadastrar', error);
        });
}

