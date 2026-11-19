CREATE DATABASE noctua_bd;
USE noctua_bd;

CREATE TABLE empresa (
    id_empresa INT PRIMARY KEY AUTO_INCREMENT,
    razao_social VARCHAR(60) NOT NULL,
    cnpj CHAR(14) NOT NULL UNIQUE,
    dominio VARCHAR(60) NOT NULL UNIQUE
);

CREATE TABLE permissao (
	id_permissao INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE cargo (
	id_cargo INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL UNIQUE,
    fk_empresa INT,
    CONSTRAINT cFkEmpresa
		FOREIGN KEY (fk_empresa)
        REFERENCES empresa (id_empresa)
);

CREATE TABLE cargo_permissao (
	id_cargo INT,
    id_permissao INT,
    
    PRIMARY KEY (id_cargo, id_permissao),
    
    FOREIGN KEY (id_cargo) REFERENCES cargo (id_cargo),
    FOREIGN KEY (id_permissao) REFERENCES permissao (id_permissao)
);

CREATE TABLE usuario(
    id_usuario INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    email_institucional VARCHAR(60) NOT NULL UNIQUE,
    cpf CHAR(11) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    verificado TINYINT DEFAULT 0,
    fk_empresa INT NOT NULL,
    fk_cargo INT DEFAULT 1,
    CONSTRAINT cFkUsuarioEmpresa
        FOREIGN KEY (fk_empresa)
        REFERENCES empresa(id_empresa),
	CONSTRAINT cFkUsuarioCargo 
		FOREIGN KEY (fk_cargo)
        REFERENCES cargo(id_cargo)
);

CREATE TABLE verificacao_email (
    id_verificacao INT PRIMARY KEY AUTO_INCREMENT,
    token VARCHAR(255) NOT NULL UNIQUE,
    dt_expiracao DATETIME NOT NULL,
    fk_usuario INT NOT NULL,    
    CONSTRAINT fk_verificacao_usuario
        FOREIGN KEY (fk_usuario)
        REFERENCES usuario(id_usuario)
);

CREATE TABLE localizacao (
    id_localizacao INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    estado VARCHAR(100) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    cep char(8) NOT NULL
);

CREATE TABLE mainframe (
    id_mainframe INT PRIMARY KEY AUTO_INCREMENT,
    hostname VARCHAR(100) NOT NULL UNIQUE,
    numero_serie CHAR(6) NOT NULL,
    status VARCHAR(20) NOT NULL,
    sis_operacional VARCHAR(100) NOT NULL,
    versao_so VARCHAR(20) NOT NULL,
    fk_empresa INT NOT NULL,
    fk_localizacao INT NOT NULL,
    CONSTRAINT ckMainframeStatus
        CHECK (status IN ('ativo', 'inativo', 'manutenção')),
    CONSTRAINT cFkMainframeUsuario
        FOREIGN KEY (fk_empresa)
        REFERENCES empresa(id_empresa),
    CONSTRAINT cFkMainframeLocalizacao
        FOREIGN KEY (fk_localizacao)
        REFERENCES localizacao(id_localizacao)
);

CREATE TABLE componente (
	id_componente INT PRIMARY KEY AUTO_INCREMENT,
    tipo VARCHAR(50) NOT NULL UNIQUE
);

-- Dados fictícios para demonstração. Os IDs também são usados em dados-alertas.js.
-- Todos os usuários usam o mesmo hash de senha da Ana Souza da base anterior.
SET @senha_demo = '$2b$10$F5URwsnCnQc5TIv9oWweheTzawJUh8u3FgoxMUV3soPzV1Jl23Dta';

INSERT INTO empresa (id_empresa, razao_social, cnpj, dominio) VALUES
(1, 'São Paulo Tech School', '99765432000199', 'sptech.school'),
(2, 'Nexus Sistemas LTDA', '98765432000199', 'nexussistemas.com.br');

-- Cargos padrão compartilhados. Cada empresa também tem um cargo próprio.
INSERT INTO cargo (id_cargo, nome, fk_empresa) VALUES
(1, 'Estagiário', NULL),
(2, 'Administrador', NULL),
(3, 'Analista SPTech', 1),
(4, 'Operador Nexus', 2);

-- IDs compatíveis com as permissões usadas na tela de mainframes.
INSERT INTO permissao (id_permissao, nome) VALUES
(1, 'Criar'), (2, 'Editar'), (3, 'Excluir'), (4, 'Visualizar');

INSERT INTO cargo_permissao (id_cargo, id_permissao) VALUES
(1, 4),
(2, 1), (2, 2), (2, 3), (2, 4),
(3, 2), (3, 4),
(4, 4);

INSERT INTO usuario (id_usuario, nome, email_institucional, cpf, senha, verificado, fk_empresa, fk_cargo) VALUES
(1, 'Ana Souza', 'ana.souza@sptech.school', '45678901234', @senha_demo, 1, 1, 2),
(2, 'Augusto', 'augusto@sptech.school', '12345678901', @senha_demo, 1, 1, 2),
(3, 'Bianca', 'bianca@sptech.school', '23456789012', @senha_demo, 1, 1, 3),
(4, 'Pedro Costa', 'pedro.costa@nexussistemas.com.br', '56789012345', @senha_demo, 1, 2, 2),
(5, 'Marina Santos', 'marina.santos@nexussistemas.com.br', '67890123456', @senha_demo, 1, 2, 4);

INSERT INTO localizacao (id_localizacao, nome, estado, cidade, cep) VALUES
(1, 'Data Center São Paulo', 'SP', 'São Paulo', '01310100'),
(2, 'Data Center Osasco', 'SP', 'Osasco', '06016020'),
(3, 'Data Center Campinas', 'SP', 'Campinas', '13010000'),
(4, 'Data Center Rio de Janeiro', 'RJ', 'Rio de Janeiro', '20040002'),
(5, 'Data Center Curitiba', 'PR', 'Curitiba', '80010000');

INSERT INTO mainframe (id_mainframe, hostname, numero_serie, status, sis_operacional, versao_so, fk_empresa, fk_localizacao) VALUES
(1, 'MF-SPTECH-001', 'IBM001', 'ativo', 'Linux', '9.2', 1, 1),
(2, 'MF-SPTECH-002', 'DEL001', 'ativo', 'Linux', '22.04', 1, 2),
(3, 'MF-SPTECH-003', 'LEN001', 'ativo', 'Linux', '24.04', 1, 3),
(4, 'MF-SPTECH-004', 'IBM002', 'manutenção', 'Linux', '8.8', 1, 1),
(5, 'MF-SPTECH-005', 'HPE001', 'inativo', 'Windows Server', '2022', 1, 3),
(6, 'MF-NEXUS-001', 'DEL002', 'ativo', 'Linux', '22.04.1', 2, 4),
(7, 'MF-NEXUS-002', 'IBM003', 'inativo', 'Linux', '9.2', 2, 5);

CREATE TABLE parametro (
	id_mainframe INT NOT NULL,
    id_componente INT NOT NULL,

    -- CPU: Porcentagem (%) e Frequência (MHz)
    cpu_pct_min DECIMAL(5,2),
    cpu_pct_max DECIMAL(5,2),
    freq_min INT,
    freq_max INT,

    -- RAM: Porcentagem (%) e Quantidade livre (GB)
    ram_pct_min DECIMAL(5,2),
    ram_pct_max DECIMAL(5,2),
    gb_min DECIMAL(10,2),
    gb_max DECIMAL(10,2),

    -- SWAP: Porcentagem (%)
    swap_pct_min DECIMAL(5,2),
    swap_pct_max DECIMAL(5,2),

    -- DISCO: Porcentagem (%), Quantidade livre (PB) e Requisições Leitura/Escrita (req/s)
    disco_pct_min DECIMAL(5,2),
    disco_pct_max DECIMAL(5,2),
    pb_min DECIMAL(10,4),
    pb_max DECIMAL(10,4),
    req_min BIGINT,
    req_max BIGINT,

    -- REDE: Dados enviados/recebidos (TB), Pacotes perdidos e Sockets TIME_WAIT
    tb_min DECIMAL(10,4),
    tb_max DECIMAL(10,4),
    pkt_min BIGINT,
    pkt_max BIGINT,
    tw_min INT,
    tw_max INT,

    PRIMARY KEY (id_mainframe, id_componente),

	CONSTRAINT cFkParametroMainframe
        FOREIGN KEY (id_mainframe)
        REFERENCES mainframe(id_mainframe),
    CONSTRAINT cFkParametroComponente
        FOREIGN KEY (id_componente)
        REFERENCES componente(id_componente)
);

-- Componentes fixos monitorados por todos os mainframes
-- 1: CPU | 2: RAM | 3: SWAP | 4: DISCO | 5: REDE
INSERT INTO componente (id_componente, tipo) VALUES
(1, 'CPU'),
(2, 'RAM'),
(3, 'SWAP'),
(4, 'DISCO'),
(5, 'REDE');

-- Parâmetros iniciais para TODOS os 7 mainframes (todos os 5 componentes por mainframe)
INSERT INTO parametro (
    id_mainframe, id_componente,
    cpu_pct_min, cpu_pct_max, freq_min, freq_max,
    ram_pct_min, ram_pct_max, gb_min, gb_max,
    swap_pct_min, swap_pct_max,
    disco_pct_min, disco_pct_max, pb_min, pb_max, req_min, req_max,
    tb_min, tb_max, pkt_min, pkt_max, tw_min, tw_max
) VALUES
-- Mainframe 1: MF-SPTECH-001
(1, 1, 0.00, 85.00, 1200, 4800, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1, 2, NULL, NULL, NULL, NULL, 10.00, 90.00, 16.00, 512.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1, 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 50.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1, 4, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 85.00, 0.5000, 10.0000, 100, 50000, NULL, NULL, NULL, NULL, NULL, NULL),
(1, 5, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.1000, 50.0000, 0, 50, 0, 1000),

-- Mainframe 2: MF-SPTECH-002
(2, 1, 0.00, 80.00, 1000, 4500, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(2, 2, NULL, NULL, NULL, NULL, 5.00, 88.00, 8.00, 256.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(2, 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 40.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(2, 4, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 80.00, 0.2500, 5.0000, 50, 30000, NULL, NULL, NULL, NULL, NULL, NULL),
(2, 5, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.0500, 25.0000, 0, 30, 0, 800),

-- Mainframe 3: MF-SPTECH-003
(3, 1, 0.00, 90.00, 1500, 5000, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(3, 2, NULL, NULL, NULL, NULL, 10.00, 92.00, 32.00, 1024.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(3, 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 60.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(3, 4, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 90.00, 1.0000, 20.0000, 200, 80000, NULL, NULL, NULL, NULL, NULL, NULL),
(3, 5, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.2000, 80.0000, 0, 100, 0, 1500),

-- Mainframe 4: MF-SPTECH-004
(4, 1, 0.00, 85.00, 1200, 4600, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(4, 2, NULL, NULL, NULL, NULL, 10.00, 85.00, 16.00, 512.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(4, 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 45.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(4, 4, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 85.00, 0.5000, 8.0000, 100, 40000, NULL, NULL, NULL, NULL, NULL, NULL),
(4, 5, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.1000, 40.0000, 0, 40, 0, 1000),

-- Mainframe 5: MF-SPTECH-005
(5, 1, 0.00, 75.00, 1000, 4200, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(5, 2, NULL, NULL, NULL, NULL, 5.00, 80.00, 8.00, 128.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(5, 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 35.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(5, 4, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 80.00, 0.2000, 4.0000, 50, 20000, NULL, NULL, NULL, NULL, NULL, NULL),
(5, 5, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.0500, 20.0000, 0, 25, 0, 500),

-- Mainframe 6: MF-NEXUS-001
(6, 1, 0.00, 88.00, 1400, 4900, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6, 2, NULL, NULL, NULL, NULL, 10.00, 90.00, 32.00, 768.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6, 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 50.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6, 4, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 85.00, 1.0000, 15.0000, 150, 60000, NULL, NULL, NULL, NULL, NULL, NULL),
(6, 5, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.2500, 60.0000, 0, 60, 0, 1200),

-- Mainframe 7: MF-NEXUS-002
(7, 1, 0.00, 85.00, 1200, 4800, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(7, 2, NULL, NULL, NULL, NULL, 10.00, 85.00, 16.00, 512.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(7, 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 50.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(7, 4, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 85.00, 0.5000, 10.0000, 100, 50000, NULL, NULL, NULL, NULL, NULL, NULL),
(7, 5, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.1000, 50.0000, 0, 50, 0, 1000);