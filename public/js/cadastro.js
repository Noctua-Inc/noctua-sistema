function mensagem(icone, titulo, descricao) {
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

function mostrarSenha(id_senha, id_div_olho){
    let senhaValor = document.getElementById(id_senha);

    if (senhaValor.type === "password") {
        senhaValor.type = "text";
        id_botao_mostrar_senha.innerHTML = ``
    } else {
        senhaValor.type = "password";
    }
}

function emailPopup(){
    const div_content = document.querySelector('.content');
    const div_popup = document.createElement('div');

    const btn = document.createElement('button');
    const icon = document.createElement('img');
    const title = document.createElement('p');
    const desc = document.createElement('p');

    div_popup.classList.add('div_popup');

    btn.classList.add('close_btn')
    icon.classList.add('icon_popup');
    title.classList.add('title_popup');
    desc.classList.add('desc_popup');

    icon.src = '../assets/email.svg'
    title.textContent = 'Verifique sua caixa de email!';
    desc.textContent = 'Para prosseguir e acessar nossos recursos, é necessário que você verifique seu email. Verifique sua caixa de email e clique em "Confirmar email" para continuar acessando os recursos da Noctua';
    btn.textContent = 'X';

    div_popup.appendChild(icon);
    div_popup.appendChild(title);
    div_popup.appendChild(desc);
    div_popup.appendChild(btn)

    div_content.appendChild(div_popup);
}
emailPopup()

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
            mensagem(data.icon, data.mensagem, data.descricao);

            if(response.status == 200){
                emailPopup();
            }
        })
        .catch(error => {
            console.log('Erro ao cadastrar', error);
        });
}

