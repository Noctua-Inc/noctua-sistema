{
    const sidebar = document.querySelector('[data-dashboard-sidebar]');
    const menus = [
        { pagina: 'dash-servidores.html', icone: 'fa-server', titulo: 'Servidores' },
        { pagina: 'dash-alertas.html', icone: 'fa-triangle-exclamation', titulo: 'Alertas' },
        { pagina: 'dash-previsao.html', icone: 'fa-chart-line', titulo: 'Previsões' },
        { pagina: 'dash-correlacao.html', icone: 'fa-chart-simple', titulo: 'Correlação' },
        { pagina: 'dash-processos.html', icone: 'fa-list-check', titulo: 'Processos' },
        { pagina: 'mainframes.html', icone: 'fa-pen-to-square', titulo: 'Editar Servidores' },
        { pagina: 'cargos.html', icone: 'fa-user-tag', titulo: 'Cargos', id: 'cargos-html' },
        { pagina: 'cadastro-func.html', icone: 'fa-users', titulo: 'Usuários', id: 'funcionarios-html' }
    ];

    sidebar.innerHTML = `
        <div class="sidebar-brand">
            <a href="/dash-servidores.html">
                <img src="/assets/noctua-logo-branca.png" alt="Noctua">
            </a>
        </div>
        <nav class="sidebar-nav" aria-label="Navegação principal">
            <ul class="sidebar-menu">
                ${menus.map(({ pagina, icone, titulo, id }) => `
                    <li${id ? ` id="${id}" class="hidden"` : ''}>
                        <a href="/${pagina}" title="${titulo}"${pagina === sidebar.dataset.dashboardSidebar ? ' class="active" aria-current="page"' : ''}>
                            <i class="fa-solid ${icone}" aria-hidden="true"></i>
                            <span>${titulo}</span>
                        </a>
                    </li>
                `).join('')}
            </ul>
        </nav>
        <div class="sidebar-user">
            <a href="#" onclick="abrirEditarUsuario(); return false;" title="Editar meu perfil" aria-label="Editar meu perfil">
                <div class="user-avatar"><span id="user-avatar">-</span></div>
                <div class="user-info">
                    <span id="user-name">-</span>
                    <span id="user-role">-</span>
                </div>
            </a>
            <a href="/index.html" class="sidebar-logout" title="Sair" aria-label="Sair">
                <i class="fa-solid fa-right-from-bracket" aria-hidden="true"></i>
            </a>
        </div>
    `;
}
