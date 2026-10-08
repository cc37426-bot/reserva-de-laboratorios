const { sql, getPool } = require('../config/db');

async function listar(req, res) {
  try {
    const pool = await getPool();
    const result = await pool.request().query('SELECT * FROM Laboratorio ORDER BY nome');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}

async function buscarPorId(req, res) {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('id', sql.Int, req.params.id)
      .query('SELECT * FROM Laboratorio WHERE id = @id');
    if (result.recordset.length === 0) {
      return res.status(404).json({ erro: 'Laboratorio nao encontrado.' });
    }
    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}

async function criar(req, res) {
  try {
    const { codigo, nome, capacidade, localizacao } = req.body;
    if (!codigo || !nome || !capacidade) {
      return res.status(400).json({ erro: 'Preencha codigo, nome e capacidade.' });
    }
    const pool = await getPool();
    const result = await pool.request()
      .input('codigo', sql.VarChar(20), codigo)
      .input('nome', sql.VarChar(100), nome)
      .input('capacidade', sql.Int, capacidade)
      .input('localizacao', sql.VarChar(150), localizacao || null)
      .query(
        `INSERT INTO Laboratorio (codigo, nome, capacidade, localizacao)
         OUTPUT INSERTED.id
         VALUES (@codigo, @nome, @capacidade, @localizacao)`
      );
    res.status(201).json({ id: result.recordset[0].id, mensagem: 'Laboratorio criado com sucesso.' });
  } catch (err) {
    if (err.number === 2627 || err.number === 2601) {
      return res.status(409).json({ erro: 'Codigo de laboratorio ja cadastrado.' });
    }
    res.status(500).json({ erro: err.message });
  }
}

async function atualizar(req, res) {
  try {
    const { codigo, nome, capacidade, localizacao } = req.body;
    const pool = await getPool();
    const result = await pool.request()
      .input('id', sql.Int, req.params.id)
      .input('codigo', sql.VarChar(20), codigo)
      .input('nome', sql.VarChar(100), nome)
      .input('capacidade', sql.Int, capacidade)
      .input('localizacao', sql.VarChar(150), localizacao || null)
      .query(
        `UPDATE Laboratorio SET codigo = @codigo, nome = @nome,
                capacidade = @capacidade, localizacao = @localizacao
         WHERE id = @id`
      );
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ erro: 'Laboratorio nao encontrado.' });
    }
    res.json({ mensagem: 'Laboratorio atualizado com sucesso.' });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}

async function remover(req, res) {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('id', sql.Int, req.params.id)
      .query('DELETE FROM Laboratorio WHERE id = @id');
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ erro: 'Laboratorio nao encontrado.' });
    }
    res.json({ mensagem: 'Laboratorio removido com sucesso.' });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}

module.exports = { listar, buscarPorId, criar, atualizar, remover };
