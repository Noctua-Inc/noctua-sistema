const API = '/api';

let usuarios = [];
let cargos = [];
let usuarioSelecionado = null;
let cargoSelecionado = null;

const listaUsuarios = document.getElementById('lista_usuarios');
const listaCargos = document.getElementById('lista_cargos');

const idUsuario = sessionStorage.getItem("idUsuario");
const idEmpresa = sessionStorage.getItem("idEmpresa");

let verificar = []

async function verificarPermissao() {
    if (!idUsuario || !idEmpresa) {
      window.location.href = '/login.html';
      return;
    }
    try {
      verificar = await api.get(`/buscarUsuario/${idUsuario}`);
      if (verificar.nome_cargo !== "Administrador") {
          window.location.href = '/proibir.html';
          return;
      }
      await carregarDados();
    } catch (erro) {
      alert('Não foi possível verificar o usuário. Faça login novamente.');
      window.location.href = '/login.html';
    }
} 

function campo(label, valor, extraClass = '') {
  const div = document.createElement('div');
  div.className = `card-field ${extraClass}`.trim();

  const l = document.createElement('span');
  l.className = 'card-label';
  l.textContent = label;

  const v = document.createElement('span');
  v.className = 'card-value';
  v.textContent = valor || '-';

  div.append(l, ' ', v);
  return div;
}

function renderUsuarios() {
  listaUsuarios.innerHTML = '';

  usuarios.forEach((u) => {
    const card = document.createElement('div');
    card.className = 'card';
    if (usuarioSelecionado && usuarioSelecionado.id_usuario === u.id_usuario) {
      card.classList.add('selected');
    }

    card.append(
      campo('USUARIO:', u.nome),
      campo('EMAIL:', u.email_institucional),
      campo('CARGO:', u.cargo),
      campo('EMPRESA:', u.empresa),
      campo('CPF:', u.cpf, 'col-span-2')
    );

    card.addEventListener('click', () => selecionarUsuario(u));
    listaUsuarios.appendChild(card);
  });
}

function renderCargos() {
  listaCargos.innerHTML = '';

  cargos.forEach((c) => {
    const div = document.createElement('div');
    div.className = 'role-card';
    if (cargoSelecionado === c.id_cargo) div.classList.add('selected');
    div.textContent = c.nome;

    div.addEventListener('click', () => {
      cargoSelecionado = c.id_cargo;
      renderCargos();
    });

    listaCargos.appendChild(div);
  });
}

function selecionarUsuario(u) {
  usuarioSelecionado = u;
  cargoSelecionado = u.fk_cargo;

  document.getElementById('sel_nome').textContent = u.nome;
  document.getElementById('sel_empresa').textContent = u.empresa || '-';
  document.getElementById('sel_email').textContent = u.email_institucional;

  renderUsuarios();
  renderCargos();
}

async function carregarDados() {
  try {
    const [resUsuarios, resCargos] = await Promise.all([
      fetch(`${API}/listar?idEmpresa=${idEmpresa}`),
      fetch(`${API}/cargos?idEmpresa=${idEmpresa}`),
    ]);

    if (!resUsuarios.ok || !resCargos.ok) throw new Error('Falha ao carregar dados');

    usuarios = await resUsuarios.json();
    cargos = await resCargos.json();

    renderUsuarios();
    renderCargos();

    if (usuarios.length > 0) selecionarUsuario(usuarios[0]);
  } catch (erro) {
    console.error(erro);
    alert('Não foi possível carregar os usuários.');
  }
}

document.getElementById('atualizarConta').addEventListener('click', async () => {
  if (!usuarioSelecionado) return alert('Selecione um usuário!');
  if (!cargoSelecionado) return alert('Selecione um cargo!');

  try {
    const res = await fetch(`${API}/atualizarConta`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: usuarioSelecionado.id_usuario,
        fk_cargo: cargoSelecionado,
        idEmpresa: idEmpresa,
      }),
    });

    const data = await res.json();
    alert(data.mensagem);

    if (res.ok) {
      const idAtual = usuarioSelecionado.id_usuario;
      await carregarDados();
      const atualizado = usuarios.find((u) => u.id_usuario === idAtual);
      if (atualizado) selecionarUsuario(atualizado);
    }
  } catch (erro) {
    console.error(erro);
    alert('Erro ao atualizar usuário.');
  }
});

document.getElementById('excluirConta').addEventListener('click', async () => {
  if (!usuarioSelecionado) return alert('Selecione um usuário!');
  if (!confirm(`Deletar o usuário ${usuarioSelecionado.nome}?`)) return;

  try {
    const res = await fetch(`${API}/excluirConta/${usuarioSelecionado.id_usuario}?idEmpresa=${idEmpresa}`, {
      method: 'DELETE',
    });

    const data = await res.json();
    alert(data.mensagem);

    if (res.ok) {
      usuarioSelecionado = null;
      cargoSelecionado = null;
      ['sel_nome', 'sel_empresa', 'sel_email'].forEach(
        (id) => (document.getElementById(id).textContent = '-')
      );
      await carregarDados();
    }
  } catch (erro) {
    console.error(erro);
    alert('Erro ao excluir usuário.');
  }
});