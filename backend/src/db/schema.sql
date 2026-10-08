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
