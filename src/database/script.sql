CREATE DATABASE noctua_bd;
USE noctua_bd;

CREATE TABLE empresa (
    id_empresa INT PRIMARY KEY AUTO_INCREMENT,
    razao_social VARCHAR(60) NOT NULL,
    cnpj CHAR(14) NOT NULL UNIQUE,
    dominio VARCHAR(60) NOT NULL UNIQUE
);

CREATE TABLE usuario(
    id_usuario INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    email_institucional VARCHAR(60) NOT NULL UNIQUE,
    cpf CHAR(11) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    verificado TINYINT DEFAULT 0,
    fk_empresa INT NOT NULL,
    CONSTRAINT cFkUsuarioEmpresa
        FOREIGN KEY (fk_empresa)
        REFERENCES empresa(id_empresa)
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
    pais VARCHAR(100) NOT NULL,
    estado VARCHAR(100) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    cod_regiao VARCHAR(20) NOT NULL
);
 
CREATE TABLE componente (
    id_componente INT PRIMARY KEY AUTO_INCREMENT,
    tipo VARCHAR(100) NOT NULL,
    fabricante VARCHAR(100) NOT NULL,
    modelo VARCHAR(100) NOT NULL,
    num_serie CHAR(6) NOT NULL,
    capacidade INT NOT NULL
);
 
CREATE TABLE mainframe (
    id_mainframe INT PRIMARY KEY AUTO_INCREMENT,
    hostname VARCHAR(100) NOT NULL UNIQUE,
    fabricante VARCHAR(100) NOT NULL,
    modelo VARCHAR(100) NOT NULL,
    numero_serie CHAR(6) NOT NULL,
    status VARCHAR(20) NOT NULL,
    sis_operacional VARCHAR(100) NOT NULL,
    versao_so FLOAT NOT NULL,
    fk_usuario INT NOT NULL,
    fk_localizacao INT NOT NULL,
    CONSTRAINT ckMainframeStatus
        CHECK (status IN ('ativo', 'inativo', 'manut.')),
    CONSTRAINT cFkMainframeUsuario
        FOREIGN KEY (fk_usuario)
        REFERENCES usuario(id_usuario),
    CONSTRAINT cFkMainframeLocalizacao
        FOREIGN KEY (fk_localizacao)
        REFERENCES localizacao(id_localizacao)
);
 
CREATE TABLE parametro (
    id_parametro INT PRIMARY KEY AUTO_INCREMENT,
    fk_mainframe INT NOT NULL,
    fk_componente INT NOT NULL,
    pico_max INT,
    pico_min INT,
    percentual INT,
    CONSTRAINT cFkParametroMainframe
        FOREIGN KEY (fk_mainframe)
        REFERENCES mainframe(id_mainframe),
    CONSTRAINT cFkParametroComponente
        FOREIGN KEY (fk_componente)
        REFERENCES componente(id_componente)
);

INSERT INTO empresa (razao_social, cnpj, dominio)
VALUES
('Tech Solutions LTDA', '12345678000101', 'techsolutions.com.br'),
('Nexus Sistemas LTDA', '98765432000199', 'nexussistemas.com.br'),
('Alpha Digital LTDA', '45678912000155', 'alphadigital.com.br');

