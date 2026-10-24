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
    fabricante VARCHAR(100),
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
    
    PRIMARY KEY (id_mainframe ,id_componente),
    
	CONSTRAINT cFkParametroMainframe
        FOREIGN KEY (id_mainframe)
        REFERENCES mainframe(id_mainframe),
    CONSTRAINT cFkParametroComponente
        FOREIGN KEY (id_componente)
        REFERENCES componente(id_componente)
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

INSERT INTO mainframe (id_mainframe, hostname, fabricante, modelo, numero_serie, status, sis_operacional, versao_so, fk_empresa, fk_localizacao) VALUES
(1, 'MF-SPTECH-001', 'IBM', 'z16', 'IBM001', 'ativo', 'Linux', '9.2', 1, 1),
(2, 'MF-SPTECH-002', 'Dell', 'PowerEdge R750', 'DEL001', 'ativo', 'Linux', '22.04', 1, 2),
(3, 'MF-SPTECH-003', 'Lenovo', 'ThinkSystem SR650', 'LEN001', 'ativo', 'Linux', '24.04', 1, 3),
(4, 'MF-SPTECH-004', 'IBM', 'z15', 'IBM002', 'manutenção', 'Linux', '8.8', 1, 1),
(5, 'MF-SPTECH-005', 'HPE', 'ProLiant DL380', 'HPE001', 'inativo', 'Windows Server', '2022', 1, 3),
(6, 'MF-NEXUS-001', 'Dell', 'PowerEdge R760', 'DEL002', 'ativo', 'Linux', '22.04.1', 2, 4),
(7, 'MF-NEXUS-002', 'IBM', 'z16', 'IBM003', 'inativo', 'Linux', '9.2', 2, 5);

INSERT INTO fabricante (id_fabricante, nome_fabricante) VALUES
(1, 'Intel'), (2, 'AMD'), (3, 'Samsung'), (4, 'Kingston'), (5, 'Western Digital');

INSERT INTO componente (id_componente, tipo, fk_fabricante) VALUES
(1, 'CPU', 1), (2, 'CPU', 2), (3, 'RAM', 3),
(4, 'RAM', 4), (5, 'DISCO', 5), (6, 'SWAP', 4);

-- Cada vínculo define os limites daquela mainframe.
INSERT INTO parametro (id_mainframe, id_componente, pico_min, pico_max) VALUES
(1, 1, 10, 90), (1, 3, 20, 85), (1, 5, 10, 90),
(2, 2, 10, 90), (2, 4, 20, 85), (2, 6, 0, 80),
(3, 3, 20, 85), (3, 5, 10, 90),
(4, 1, 10, 90), (4, 3, 20, 85),
(5, 2, 10, 90), (5, 5, 10, 90),
(6, 2, 10, 90), (6, 4, 20, 85), (6, 5, 10, 90),
(7, 1, 10, 90), (7, 3, 20, 85), (7, 6, 0, 80);