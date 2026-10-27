-- Script de criacao do banco de dados - Etapa 1
-- Execute este script no seu SQL Server (SSMS ou Azure Data Studio) antes de rodar a API

IF DB_ID('ReservaLabsSalas') IS NULL
BEGIN
    CREATE DATABASE ReservaLabsSalas;
END
GO

USE ReservaLabsSalas;
GO

-- Tabela de Usuarios (login/senha + dados de auditoria)
IF OBJECT_ID('dbo.Usuario', 'U') IS NULL
BEGIN
    CREATE TABLE Usuario (
        id INT IDENTITY(1,1) PRIMARY KEY,
        cpf VARCHAR(11) NOT NULL UNIQUE,
        nome_completo VARCHAR(150) NOT NULL,
        data_nascimento DATE NOT NULL,
        celular VARCHAR(20) NULL,
        email VARCHAR(150) NOT NULL UNIQUE,
        login VARCHAR(50) NOT NULL UNIQUE,
        senha VARCHAR(255) NOT NULL,
        data_cadastro DATETIME NOT NULL DEFAULT GETDATE(),
        data_ultimo_acesso DATETIME NULL
    );
END
GO

-- Tabela de Laboratorios (recurso reservavel)
IF OBJECT_ID('dbo.Laboratorio', 'U') IS NULL
BEGIN
    CREATE TABLE Laboratorio (
        id INT IDENTITY(1,1) PRIMARY KEY,
        codigo VARCHAR(20) NOT NULL UNIQUE,
        nome VARCHAR(100) NOT NULL,
        capacidade INT NOT NULL,
        localizacao VARCHAR(150) NULL
    );
END
GO

-- Tabela de Salas (recurso reservavel)
IF OBJECT_ID('dbo.Sala', 'U') IS NULL
BEGIN
    CREATE TABLE Sala (
        id INT IDENTITY(1,1) PRIMARY KEY,
        codigo VARCHAR(20) NOT NULL UNIQUE,
        nome VARCHAR(100) NOT NULL,
        capacidade INT NOT NULL,
        localizacao VARCHAR(150) NULL
    );
END
GO

-- Tabela de Status (sera usada na Reserva, entrega da etapa 2)
IF OBJECT_ID('dbo.Status', 'U') IS NULL
BEGIN
    CREATE TABLE Status (
        id INT IDENTITY(1,1) PRIMARY KEY,
        codigo VARCHAR(20) NOT NULL UNIQUE,
        nome VARCHAR(50) NOT NULL
    );

    INSERT INTO Status (codigo, nome) VALUES
        ('LIVRE', 'Livre'),
        ('OCUPADO', 'Ocupado'),
        ('BLOQUEADO', 'Bloqueado'),
        ('RESERVADO', 'Reservado');
END
GO
-- Tabela de Reservas (Etapa 2)
IF OBJECT_ID('dbo.Reserva', 'U') IS NULL
BEGIN
    CREATE TABLE Reserva (
        id INT IDENTITY(1,1) PRIMARY KEY,

        usuario_id INT NOT NULL,

        tipo_recurso VARCHAR(20) NOT NULL,

        laboratorio_id INT NULL,
        sala_id INT NULL,

        data_inicio DATE NOT NULL,
        data_fim DATE NOT NULL,

        hora_inicio TIME NOT NULL,
        hora_fim TIME NOT NULL,

        status_id INT NOT NULL,

        CONSTRAINT FK_Reserva_Usuario
            FOREIGN KEY (usuario_id) REFERENCES Usuario(id),

        CONSTRAINT FK_Reserva_Laboratorio
            FOREIGN KEY (laboratorio_id) REFERENCES Laboratorio(id),

        CONSTRAINT FK_Reserva_Sala
            FOREIGN KEY (sala_id) REFERENCES Sala(id),

        CONSTRAINT FK_Reserva_Status
            FOREIGN KEY (status_id) REFERENCES Status(id),

        CONSTRAINT CK_Reserva_TipoRecurso
            CHECK (tipo_recurso IN ('Laboratorio', 'Sala')),

        CONSTRAINT CK_Reserva_Recurso
            CHECK (
                (tipo_recurso = 'Laboratorio'
                    AND laboratorio_id IS NOT NULL
                    AND sala_id IS NULL)
                OR
                (tipo_recurso = 'Sala'
                    AND sala_id IS NOT NULL
                    AND laboratorio_id IS NULL)
            ),

        CONSTRAINT CK_Reserva_Datas
            CHECK (data_fim >= data_inicio),

        CONSTRAINT CK_Reserva_Horarios
            CHECK (
                data_fim > data_inicio
                OR hora_fim > hora_inicio
            )
    );
END
GO
-- Tabela de Acessos (Etapa 3): registra toda tentativa de login
IF OBJECT_ID('dbo.Acesso', 'U') IS NULL
BEGIN
    CREATE TABLE Acesso (
        id INT IDENTITY(1,1) PRIMARY KEY,
        usuario_id INT NULL,
        login_informado VARCHAR(50) NOT NULL,
        data_acesso DATETIME NOT NULL DEFAULT GETDATE(),
        sucesso BIT NOT NULL,
        ip VARCHAR(45) NULL,
        CONSTRAINT FK_Acesso_Usuario
            FOREIGN KEY (usuario_id) REFERENCES Usuario(id) ON DELETE SET NULL
    );
END
GO
