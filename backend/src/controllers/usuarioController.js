const bcrypt = require('bcryptjs');
const { sql, getPool } = require('../config/db');

// Retorna todos os usuarios (sem a senha)
async function listar(req, res) {
  try {
    const pool = await getPool();
    const result = await pool.request().query(
      `SELECT id, cpf, nome_completo, data_nascimento, celular, email, login,
              data_cadastro, data_ultimo_acesso
       FROM Usuario ORDER BY nome_completo`
    );
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}

// Retorna um usuario pelo id
async function buscarPorId(req, res) {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('id', sql.Int, req.params.id)
      .query(
        `SELECT id, cpf, nome_completo, data_nascimento, celular, email, login,
                data_cadastro, data_ultimo_acesso
         FROM Usuario WHERE id = @id`
      );
    if (result.recordset.length === 0) {
      return res.status(404).json({ erro: 'Usuario nao encontrado.' });
    }
    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}

// Cria um novo usuario
async function criar(req, res) {
  try {
    const { cpf, nome_completo, data_nascimento, celular, email, login, senha } = req.body;

    if (!cpf || !nome_completo || !data_nascimento || !email || !login || !senha) {
      return res.status(400).json({ erro: 'Preencha CPF, nome completo, data de nascimento, e-mail, login e senha.' });
    }

    const senhaHash = await bcrypt.hash(senha, 10);
    const pool = await getPool();

    const result = await pool.request()
      .input('cpf', sql.VarChar(11), cpf)
      .input('nome_completo', sql.VarChar(150), nome_completo)
      .input('data_nascimento', sql.Date, data_nascimento)
      .input('celular', sql.VarChar(20), celular || null)
      .input('email', sql.VarChar(150), email)
      .input('login', sql.VarChar(50), login)
      .input('senha', sql.VarChar(255), senhaHash)
      .query(
        `INSERT INTO Usuario (cpf, nome_completo, data_nascimento, celular, email, login, senha, data_cadastro)
         OUTPUT INSERTED.id
         VALUES (@cpf, @nome_completo, @data_nascimento, @celular, @email, @login, @senha, GETDATE())`
      );

    res.status(201).json({ id: result.recordset[0].id, mensagem: 'Usuario criado com sucesso.' });
  } catch (err) {
    if (err.number === 2627 || err.number === 2601) {
      return res.status(409).json({ erro: 'CPF, e-mail ou login ja cadastrado.' });
    }
    res.status(500).json({ erro: err.message });
  }
}

// Atualiza um usuario existente
async function atualizar(req, res) {
  try {
    const { cpf, nome_completo, data_nascimento, celular, email, login, senha } = req.body;
    const pool = await getPool();

    const request = pool.request()
      .input('id', sql.Int, req.params.id)
      .input('cpf', sql.VarChar(11), cpf)
      .input('nome_completo', sql.VarChar(150), nome_completo)
      .input('data_nascimento', sql.Date, data_nascimento)
      .input('celular', sql.VarChar(20), celular || null)
      .input('email', sql.VarChar(150), email)
      .input('login', sql.VarChar(50), login);

    let setSenha = '';
    if (senha) {
      const senhaHash = await bcrypt.hash(senha, 10);
      request.input('senha', sql.VarChar(255), senhaHash);
      setSenha = ', senha = @senha';
    }

    const result = await request.query(
      `UPDATE Usuario SET
         cpf = @cpf,
         nome_completo = @nome_completo,
         data_nascimento = @data_nascimento,
         celular = @celular,
         email = @email,
         login = @login
         ${setSenha}
       WHERE id = @id`
    );

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ erro: 'Usuario nao encontrado.' });
    }
    res.json({ mensagem: 'Usuario atualizado com sucesso.' });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}

// Remove um usuario
async function remover(req, res) {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('id', sql.Int, req.params.id)
      .query('DELETE FROM Usuario WHERE id = @id');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ erro: 'Usuario nao encontrado.' });
    }
    res.json({ mensagem: 'Usuario removido com sucesso.' });
  } catch (err) {
    // Erro 547 do SQL Server = o usuario ainda possui reservas
    if (err.number === 547) {
      return res.status(409).json({ erro: 'Este usuario possui reservas e nao pode ser excluido.' });
    }
    res.status(500).json({ erro: err.message });
  }
}

module.exports = { listar, buscarPorId, criar, atualizar, remover };

