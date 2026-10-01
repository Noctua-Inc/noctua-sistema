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
    nome VARCHAR(100) NOT NULL UNIQUE
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
    modelo VARCHAR(100) NOT NULL,
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
 
CREATE TABLE fabricante (
	id_fabricante INT PRIMARY KEY AUTO_INCREMENT,
    nome_fabricante VARCHAR(45) NOT NULL UNIQUE
);

CREATE TABLE componente (
	id_componente INT PRIMARY KEY AUTO_INCREMENT,
    tipo VARCHAR(100) NOT NULL,
    capacidade INT NOT NULL,
    fk_fabricante INT NOT NULL,
    CONSTRAINT cFkComponenteFabricante
		FOREIGN KEY (fk_fabricante)
        REFERENCES fabricante(id_fabricante)
);

CREATE TABLE parametro (
	id_mainframe INT NOT NULL,
    id_componente INT NOT NULL,
    pico_min INT,
	pico_max INT,
    percentual INT,
    
    PRIMARY KEY (id_mainframe ,id_componente),
    
	CONSTRAINT cFkParametroMainframe
        FOREIGN KEY (id_mainframe)
        REFERENCES mainframe(id_mainframe),
    CONSTRAINT cFkParametroComponente
        FOREIGN KEY (id_componente)
        REFERENCES componente(id_componente)
);

USE noctua_bd;

-- ============================================
-- EMPRESAS
-- ============================================

INSERT INTO empresa (razao_social, cnpj, dominio)
VALUES
('Tech Solutions LTDA', '12345678000101', 'techsolutions.com.br'),
('São Paulo Tech School', '99765432000199', 'sptech.school'),
('Nexus Sistemas LTDA', '98765432000199', 'nexussistemas.com.br'),
('Alpha Digital LTDA', '45678912000155', 'alphadigital.com.br');


-- ============================================
-- CARGOS
-- ============================================

INSERT INTO cargo (nome)
VALUES
('Estagiário'),
('Administrador');


-- ============================================
-- PERMISSÕES
-- ============================================

INSERT INTO permissao (nome)
VALUES
('Criar'),
('Visualizar'),
('Editar'),
('Excluir');


-- ============================================
-- CARGO x PERMISSÃO
-- ============================================

-- Estagiário
-- Pode apenas visualizar
INSERT INTO cargo_permissao (id_cargo, id_permissao)
VALUES
(1, 2);

-- Administrador
-- Possui todas as permissões
INSERT INTO cargo_permissao (id_cargo, id_permissao)
VALUES
(2, 1),
(2, 2),
(2, 3),
(2, 4);


-- ============================================
-- USUÁRIOS
-- ============================================

-- senha padrão: 123456
INSERT INTO usuario
(nome, email_institucional, cpf, senha, verificado, fk_empresa, fk_cargo)
VALUES
(
    'Carlos Almeida',
    'carlos.almeida@techsolutions.com.br',
    '12345678901',
    '$2b$10$F5URwsnCnQc5TIv9oWweheTzawJUh8u3FgoxMUV3soPzV1Jl23Dta',
    1,
    1,
    1
),
(
    'Mariana Santos',
    'mariana.santos@techsolutions.com.br',
    '23456789012',
    '$2b$10$F5URwsnCnQc5TIv9oWweheTzawJUh8u3FgoxMUV3soPzV1Jl23Dta',
    1,
    1,
    2
),
(
    'Ana Souza',
    'ana.souza@sptech.school',
    '45678901234',
    '$2b$10$F5URwsnCnQc5TIv9oWweheTzawJUh8u3FgoxMUV3soPzV1Jl23Dta',
    1,
    2,
    2
),
(
    'Pedro Costa',
    'pedro.costa@nexussistemas.com.br',
    '56789012345',
    '$2b$10$F5URwsnCnQc5TIv9oWweheTzawJUh8u3FgoxMUV3soPzV1Jl23Dta',
    1,
    3,
    1
),
(
    'Lucas Ferreira',
    'lucas.ferreira@alphadigital.com.br',
    '67890123456',
    '$2b$10$F5URwsnCnQc5TIv9oWweheTzawJUh8u3FgoxMUV3soPzV1Jl23Dta',
    0,
    4,
    1
);


-- ============================================
-- LOCALIZAÇÕES
-- ============================================

INSERT INTO localizacao
(nome, estado, cidade, cep)
VALUES
(
    'Data Center São Paulo',
    'São Paulo',
    'São Paulo',
    '01310100'
),
(
    'Data Center Osasco',
    'São Paulo',
    'Osasco',
    '06016020'
),
(
    'Data Center Campinas',
    'São Paulo',
    'Campinas',
    '13010000'
),
(
    'Data Center Rio de Janeiro',
    'Rio de Janeiro',
    'Rio de Janeiro',
    '20040002'
),
(
    'Data Center Curitiba',
    'Paraná',
    'Curitiba',
    '80010000'
),
(
    'Data Center Belo Horizonte',
    'Minas Gerais',
    'Belo Horizonte',
    '30130000'
);


-- ============================================
-- MAINFRAMES
-- ============================================

INSERT INTO mainframe
(
    hostname,
    modelo,
    numero_serie,
    status,
    sis_operacional,
    versao_so,
    fk_empresa,
    fk_localizacao
)
VALUES
(
    'MF-TECH-001',
    'z16',
    'IBM001',
    'ativo',
    'Linux',
    '9.2',
    1,
    1
),
(
    'MF-TECH-002',
    'PowerEdge R760',
    'DEL001',
    'ativo',
    'Windows Server',
    '2022',
    1,
    2
),
(
    'MF-SPTECH-001',
    'z15',
    'IBM002',
    'ativo',
    'Linux',
    '8.8',
    2,
    1
),
(
    'MF-SPTECH-002',
    'PowerEdge R750',
    'DEL002',
    'manutenção',
    'Linux',
    '22.04',
    2,
    3
),
(
    'MF-NEXUS-001',
    'ThinkSystem SR650',
    'LEN001',
    'ativo',
    'Linux',
    '20.04',
    3,
    4
),
(
    'MF-NEXUS-002',
    'ProLiant DL380',
    'HPE001',
    'inativo',
    'Windows Server',
    '2019',
    3,
    5
),
(
    'MF-ALPHA-001',
    'PowerEdge R650',
    'DEL003',
    'ativo',
    'Linux',
    '24.04',
    4,
    6
),
(
    'MF-ALPHA-002',
    'ProLiant DL360',
    'HPE002',
    'manutenção',
    'Linux',
    '22.04',
    4,
    1
);


-- ============================================
-- FABRICANTES
-- ============================================

INSERT INTO fabricante (nome_fabricante)
VALUES
('Intel'),
('AMD'),
('NVIDIA'),
('Samsung'),
('Kingston'),
('Western Digital');


-- ============================================
-- COMPONENTES
-- ============================================

INSERT INTO componente
(tipo, capacidade, fk_fabricante)
VALUES
('CPU', 16, 1),
('CPU', 32, 2),
('RAM', 64, 4),
('RAM', 128, 5),
('DISCO', 1000, 6),
('DISCO', 2000, 4),
('SWAP', 24, 3),
('SWAP', 48, 3),
('DISCO', 4000, 6);

-- ============================================
-- PARÂMETROS DOS MAINFRAMES
-- ============================================

INSERT INTO parametro
(
    id_mainframe,
    id_componente,
    pico_min,
    pico_max,
    percentual
)
VALUES

-- Mainframe 1
(1, 1, 10, 100, 80),
(1, 3, 20, 90, 75),
(1, 5, 30, 95, 85),

-- Mainframe 2
(2, 2, 15, 100, 80),
(2, 4, 20, 90, 75),
(2, 6, 30, 95, 85),

-- Mainframe 3
(3, 1, 10, 100, 80),
(3, 4, 20, 90, 80),

-- Mainframe 4
(4, 2, 15, 100, 80),
(4, 5, 30, 95, 85),

-- Mainframe 5
(5, 2, 20, 100, 85),
(5, 3, 20, 90, 75),
(5, 7, 30, 95, 90),

-- Mainframe 6
(6, 1, 10, 100, 80),
(6, 6, 30, 95, 85),

-- Mainframe 7
(7, 2, 20, 100, 85),
(7, 4, 20, 90, 80),
(7, 8, 30, 95, 90),

-- Mainframe 8
(8, 1, 10, 100, 80),
(8, 9, 30, 95, 85);