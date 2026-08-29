    function cadastrar(event){
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
        console.log(data.mensagem);
    })
    .catch(error => {
        console.log('Erro ao cadastrar', error);
    });
}
    
