const bcrypt = require('bcryptjs');
const { sql, getPool } = require('../config/db');

// Grava toda tentativa de acesso (certa ou errada) na tabela Acesso
async function registrarAcesso(pool, usuarioId, loginInformado, sucesso, ip) {
  await pool.request()
    .input('usuario_id', sql.Int, usuarioId)
    .input('login_informado', sql.VarChar(50), String(loginInformado).slice(0, 50))
    .input('sucesso', sql.Bit, sucesso)
    .input('ip', sql.VarChar(45), ip ? String(ip).slice(0, 45) : null)
    .query(
      `INSERT INTO Acesso (usuario_id, login_informado, sucesso, ip)
       VALUES (@usuario_id, @login_informado, @sucesso, @ip)`
    );
}

// POST /api/auth/login
async function login(req, res) {
  try {
    const { login, senha } = req.body;
    if (!login || !senha) {
      return res.status(400).json({ erro: 'Informe login e senha.' });
    }

    const pool = await getPool();
    const result = await pool.request()
      .input('login', sql.VarChar(50), login)
      .query('SELECT id, nome_completo, login, senha FROM Usuario WHERE login = @login');

    const usuario = result.recordset[0];
    const senhaOk = usuario ? await bcrypt.compare(senha, usuario.senha) : false;

    await registrarAcesso(pool, usuario ? usuario.id : null, login, senhaOk, req.ip);

    if (!senhaOk) {
      return res.status(401).json({ erro: 'Login ou senha invalidos.' });
    }

    await pool.request()
      .input('id', sql.Int, usuario.id)
      .query('UPDATE Usuario SET data_ultimo_acesso = GETDATE() WHERE id = @id');

    res.json({ id: usuario.id, nome_completo: usuario.nome_completo, login: usuario.login });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}

// GET /api/auth/acessos  (ultimos 100 acessos, para consulta/auditoria)
async function listarAcessos(req, res) {
  try {
    const pool = await getPool();
    const result = await pool.request().query(
      `SELECT TOP 100 a.id, a.login_informado, a.sucesso, a.ip,
              a.data_acesso, u.nome_completo
       FROM Acesso a
       LEFT JOIN Usuario u ON u.id = a.usuario_id
       ORDER BY a.data_acesso DESC`
    );
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}

module.exports = { login, listarAcessos };
