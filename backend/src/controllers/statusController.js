const { sql, getPool } = require('../config/db');

async function listar(req, res) {
  try {
    const pool = await getPool();
    const result = await pool.request().query('SELECT * FROM Status ORDER BY nome');
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
      .query('SELECT * FROM Status WHERE id = @id');
    if (result.recordset.length === 0) {
      return res.status(404).json({ erro: 'Status nao encontrado.' });
    }
    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}

async function criar(req, res) {
  try {
    const { codigo, nome } = req.body;
    if (!codigo || !nome) {
      return res.status(400).json({ erro: 'Preencha codigo e nome do status.' });
    }
    const pool = await getPool();
    const result = await pool.request()
      .input('codigo', sql.VarChar(20), codigo)
      .input('nome', sql.VarChar(50), nome)
      .query(
        `INSERT INTO Status (codigo, nome)
         OUTPUT INSERTED.id
         VALUES (@codigo, @nome)`
      );
    res.status(201).json({ id: result.recordset[0].id, mensagem: 'Status criado com sucesso.' });
  } catch (err) {
    if (err.number === 2627 || err.number === 2601) {
      return res.status(409).json({ erro: 'Codigo de status ja cadastrado.' });
    }
    res.status(500).json({ erro: err.message });
  }
}

async function atualizar(req, res) {
  try {
    const { codigo, nome } = req.body;
    const pool = await getPool();
    const result = await pool.request()
      .input('id', sql.Int, req.params.id)
      .input('codigo', sql.VarChar(20), codigo)
      .input('nome', sql.VarChar(50), nome)
      .query('UPDATE Status SET codigo = @codigo, nome = @nome WHERE id = @id');
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ erro: 'Status nao encontrado.' });
    }
    res.json({ mensagem: 'Status atualizado com sucesso.' });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}

async function remover(req, res) {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('id', sql.Int, req.params.id)
      .query('DELETE FROM Status WHERE id = @id');
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ erro: 'Status nao encontrado.' });
    }
    res.json({ mensagem: 'Status removido com sucesso.' });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}

module.exports = { listar, buscarPorId, criar, atualizar, remover };
