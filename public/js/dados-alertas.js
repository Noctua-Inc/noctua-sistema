// Cenário fixo de demonstração. Empresas, hostnames e componentes acompanham os inserts SQL.
// 1 = SPTech (sptech.school). 2 = Nexus Sistemas (nexussistemas.com.br).
const DADOS_EMPRESAS = {
    1: {
        atualizadoEm: "2026-10-24T00:00:00-03:00",
        fusoHorario: "America/Sao_Paulo",
        localizacoes: ["Data Center São Paulo", "Data Center Osasco", "Data Center Campinas"],
        mainframes: [
            {"id_mainframe": 1, "hostname": "MF-SPTECH-001", "localizacao": "Data Center São Paulo", "componentes": ["CPU", "RAM", "DISCO"]},
            {"id_mainframe": 2, "hostname": "MF-SPTECH-002", "localizacao": "Data Center Osasco", "componentes": ["CPU", "RAM", "SWAP"]},
            {"id_mainframe": 3, "hostname": "MF-SPTECH-003", "localizacao": "Data Center Campinas", "componentes": ["RAM", "DISCO"]},
            {"id_mainframe": 4, "hostname": "MF-SPTECH-004", "localizacao": "Data Center São Paulo", "componentes": ["CPU", "RAM"]},
            {"id_mainframe": 5, "hostname": "MF-SPTECH-005", "localizacao": "Data Center Campinas", "componentes": ["CPU", "DISCO"]},
        ],
        alertas: [
            {"id": "ALT-001", "mainframe": "MF-SPTECH-001", "componente": "RAM", "severidade": "critica", "status": "aberto", "inicio": "2026-10-23T23:42:00-03:00", "resolvidoEm": null, "reincidente": true},
            {"id": "ALT-004", "mainframe": "MF-SPTECH-001", "componente": "CPU", "severidade": "alta", "status": "aberto", "inicio": "2026-10-23T23:50:00-03:00", "resolvidoEm": null, "reincidente": true},
            {"id": "ALT-002", "mainframe": "MF-SPTECH-002", "componente": "CPU", "severidade": "alta", "status": "investigacao", "inicio": "2026-10-23T23:25:00-03:00", "resolvidoEm": null, "reincidente": true},
            {"id": "ALT-005", "mainframe": "MF-SPTECH-002", "componente": "SWAP", "severidade": "moderada", "status": "investigacao", "inicio": "2026-10-23T23:10:00-03:00", "resolvidoEm": null, "reincidente": true},
            {"id": "ALT-003", "mainframe": "MF-SPTECH-003", "componente": "DISCO", "severidade": "moderada", "status": "aberto", "inicio": "2026-10-23T22:40:00-03:00", "resolvidoEm": null, "reincidente": true},
            {"id": "ALT-006", "mainframe": "MF-SPTECH-001", "componente": "RAM", "severidade": "critica", "status": "resolvido", "inicio": "2026-10-23T20:00:00-03:00", "resolvidoEm": "2026-10-23T20:20:00-03:00", "reincidente": true},
            {"id": "ALT-010", "mainframe": "MF-SPTECH-004", "componente": "RAM", "severidade": "critica", "status": "resolvido", "inicio": "2026-10-23T12:00:00-03:00", "resolvidoEm": "2026-10-23T12:40:00-03:00", "reincidente": false},
            {"id": "ALT-015", "mainframe": "MF-SPTECH-001", "componente": "CPU", "severidade": "critica", "status": "resolvido", "inicio": "2026-10-23T01:00:00-03:00", "resolvidoEm": "2026-10-23T02:10:00-03:00", "reincidente": false},
            {"id": "ALT-019", "mainframe": "MF-SPTECH-002", "componente": "RAM", "severidade": "critica", "status": "resolvido", "inicio": "2026-10-20T14:00:00-03:00", "resolvidoEm": "2026-10-20T14:50:00-03:00", "reincidente": false},
            {"id": "ALT-007", "mainframe": "MF-SPTECH-002", "componente": "CPU", "severidade": "alta", "status": "resolvido", "inicio": "2026-10-23T18:10:00-03:00", "resolvidoEm": "2026-10-23T18:35:00-03:00", "reincidente": false},
            {"id": "ALT-009", "mainframe": "MF-SPTECH-001", "componente": "DISCO", "severidade": "alta", "status": "resolvido", "inicio": "2026-10-23T15:20:00-03:00", "resolvidoEm": "2026-10-23T15:50:00-03:00", "reincidente": false},
            {"id": "ALT-012", "mainframe": "MF-SPTECH-001", "componente": "RAM", "severidade": "alta", "status": "resolvido", "inicio": "2026-10-23T08:00:00-03:00", "resolvidoEm": "2026-10-23T08:20:00-03:00", "reincidente": false},
            {"id": "ALT-013", "mainframe": "MF-SPTECH-003", "componente": "RAM", "severidade": "alta", "status": "resolvido", "inicio": "2026-10-23T06:10:00-03:00", "resolvidoEm": "2026-10-23T06:45:00-03:00", "reincidente": false},
            {"id": "ALT-016", "mainframe": "MF-SPTECH-005", "componente": "DISCO", "severidade": "alta", "status": "resolvido", "inicio": "2026-10-22T16:00:00-03:00", "resolvidoEm": "2026-10-22T16:25:00-03:00", "reincidente": false},
            {"id": "ALT-017", "mainframe": "MF-SPTECH-004", "componente": "CPU", "severidade": "alta", "status": "resolvido", "inicio": "2026-10-22T12:00:00-03:00", "resolvidoEm": "2026-10-22T12:30:00-03:00", "reincidente": false},
            {"id": "ALT-020", "mainframe": "MF-SPTECH-001", "componente": "CPU", "severidade": "alta", "status": "resolvido", "inicio": "2026-10-19T11:00:00-03:00", "resolvidoEm": "2026-10-19T11:20:00-03:00", "reincidente": false},
            {"id": "ALT-008", "mainframe": "MF-SPTECH-003", "componente": "DISCO", "severidade": "moderada", "status": "resolvido", "inicio": "2026-10-23T17:00:00-03:00", "resolvidoEm": "2026-10-23T17:15:00-03:00", "reincidente": false},
            {"id": "ALT-011", "mainframe": "MF-SPTECH-002", "componente": "RAM", "severidade": "moderada", "status": "resolvido", "inicio": "2026-10-23T10:30:00-03:00", "resolvidoEm": "2026-10-23T10:45:00-03:00", "reincidente": false},
            {"id": "ALT-014", "mainframe": "MF-SPTECH-002", "componente": "SWAP", "severidade": "moderada", "status": "resolvido", "inicio": "2026-10-23T03:15:00-03:00", "resolvidoEm": "2026-10-23T03:25:00-03:00", "reincidente": false},
            {"id": "ALT-018", "mainframe": "MF-SPTECH-003", "componente": "DISCO", "severidade": "moderada", "status": "resolvido", "inicio": "2026-10-21T10:00:00-03:00", "resolvidoEm": "2026-10-21T10:15:00-03:00", "reincidente": false},
            {"id": "ALT-021", "mainframe": "MF-SPTECH-005", "componente": "CPU", "severidade": "moderada", "status": "resolvido", "inicio": "2026-10-18T09:00:00-03:00", "resolvidoEm": "2026-10-18T09:10:00-03:00", "reincidente": false},
        ],
    },
    2: {
        atualizadoEm: "2026-10-24T00:00:00-03:00",
        fusoHorario: "America/Sao_Paulo",
        localizacoes: ["Data Center Rio de Janeiro", "Data Center Curitiba"],
        mainframes: [
            {"id_mainframe": 6, "hostname": "MF-NEXUS-001", "localizacao": "Data Center Rio de Janeiro", "componentes": ["CPU", "RAM", "DISCO"]},
            {"id_mainframe": 7, "hostname": "MF-NEXUS-002", "localizacao": "Data Center Curitiba", "componentes": ["CPU", "RAM", "SWAP"]},
        ],
        alertas: [
            {"id": "ALT-022", "mainframe": "MF-NEXUS-001", "componente": "RAM", "severidade": "critica", "status": "aberto", "inicio": "2026-10-23T23:45:00-03:00", "resolvidoEm": null, "reincidente": true},
            {"id": "ALT-025", "mainframe": "MF-NEXUS-001", "componente": "RAM", "severidade": "critica", "status": "resolvido", "inicio": "2026-10-23T10:00:00-03:00", "resolvidoEm": "2026-10-23T10:40:00-03:00", "reincidente": false},
            {"id": "ALT-029", "mainframe": "MF-NEXUS-002", "componente": "RAM", "severidade": "critica", "status": "resolvido", "inicio": "2026-10-19T08:00:00-03:00", "resolvidoEm": "2026-10-19T09:10:00-03:00", "reincidente": false},
            {"id": "ALT-023", "mainframe": "MF-NEXUS-001", "componente": "CPU", "severidade": "alta", "status": "resolvido", "inicio": "2026-10-23T21:00:00-03:00", "resolvidoEm": "2026-10-23T21:20:00-03:00", "reincidente": false},
            {"id": "ALT-026", "mainframe": "MF-NEXUS-002", "componente": "CPU", "severidade": "alta", "status": "resolvido", "inicio": "2026-10-22T18:00:00-03:00", "resolvidoEm": "2026-10-22T18:25:00-03:00", "reincidente": false},
            {"id": "ALT-028", "mainframe": "MF-NEXUS-001", "componente": "CPU", "severidade": "alta", "status": "resolvido", "inicio": "2026-10-20T15:00:00-03:00", "resolvidoEm": "2026-10-20T15:30:00-03:00", "reincidente": false},
            {"id": "ALT-024", "mainframe": "MF-NEXUS-001", "componente": "DISCO", "severidade": "moderada", "status": "resolvido", "inicio": "2026-10-23T16:00:00-03:00", "resolvidoEm": "2026-10-23T16:10:00-03:00", "reincidente": false},
            {"id": "ALT-027", "mainframe": "MF-NEXUS-002", "componente": "SWAP", "severidade": "moderada", "status": "resolvido", "inicio": "2026-10-21T13:00:00-03:00", "resolvidoEm": "2026-10-21T13:15:00-03:00", "reincidente": false},
            {"id": "ALT-030", "mainframe": "MF-NEXUS-001", "componente": "DISCO", "severidade": "moderada", "status": "resolvido", "inicio": "2026-10-18T11:00:00-03:00", "resolvidoEm": "2026-10-18T11:10:00-03:00", "reincidente": false},
        ],
    },
};

// O login já guarda o ID da empresa. Cada conta vê somente o seu cenário de alertas.
const idEmpresaAlertas = sessionStorage.getItem('idEmpresa');
const DADOS_DASHBOARD = DADOS_EMPRESAS[idEmpresaAlertas] || {
    atualizadoEm: '2026-10-24T00:00:00-03:00',
    fusoHorario: 'America/Sao_Paulo',
    localizacoes: [],
    mainframes: [],
    alertas: []
};
