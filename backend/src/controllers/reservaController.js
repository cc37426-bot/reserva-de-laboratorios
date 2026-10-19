// backend/src/controllers/reservaController.js  (Etapa 2)
//
// AJUSTE ESTA LINHA copiando o mesmo require de conexao usado no salaController.js.
// Aqui assumo que o arquivo de conexao exporta { getPool, sql }.
const { sql, getPool } = require('../config/db');

// Expressoes que juntam DATE + TIME em um unico datetime (usadas na checagem de conflito)
const INICIO = `DATEADD(SECOND, DATEDIFF(SECOND, 0, r.hora_inicio), CAST(r.data_inicio AS DATETIME2))`;
const FIM = `DATEADD(SECOND, DATEDIFF(SECOND, 0, r.hora_fim), CAST(r.data_fim AS DATETIME2))`;

// SELECT base: traz a reserva ja com nome/codigo do recurso, usuario e status
const SELECT_BASE = `
  SELECT
    r.id,
    r.usuario_id,
    u.nome_completo AS usuario_nome,
    r.tipo_recurso,
    r.laboratorio_id,
    r.sala_id,
    COALESCE(l.codigo, s.codigo) AS recurso_codigo,
    COALESCE(l.nome, s.nome)     AS recurso_nome,
    CONVERT(VARCHAR(10), r.data_inicio, 23) AS data_inicio,
    CONVERT(VARCHAR(10), r.data_fim, 23)    AS data_fim,
    CONVERT(VARCHAR(5), r.hora_inicio, 108) AS hora_inicio,
    CONVERT(VARCHAR(5), r.hora_fim, 108)    AS hora_fim,
    r.status_id,
    st.codigo AS status_codigo,
    st.nome   AS status_nome
  FROM Reserva r
  JOIN Usuario u  ON u.id = r.usuario_id
  JOIN Status st  ON st.id = r.status_id
  LEFT JOIN Laboratorio l ON l.id = r.laboratorio_id
  LEFT JOIN Sala s        ON s.id = r.sala_id
`;

// Valida o corpo da requisicao. Retorna mensagem de erro ou null.
function validar(b) {
  if (!b.usuario_id) return 'Usuario e obrigatorio.';
  if (!['Laboratorio', 'Sala'].includes(b.tipo_recurso)) return 'tipo_recurso deve ser "Laboratorio" ou "Sala".';
  if (b.tipo_recurso === 'Laboratorio' && !b.laboratorio_id) return 'Selecione o laboratorio.';
  if (b.tipo_recurso === 'Sala' && !b.sala_id) return 'Selecione a sala.';
  if (!b.data_inicio || !b.data_fim || !b.hora_inicio || !b.hora_fim) return 'Datas e horas sao obrigatorias.';
  if (!b.status_id) return 'Status e obrigatorio.';
  if (b.data_fim < b.data_inicio) return 'A data final nao pode ser anterior a data inicial.';
  if (b.data_fim === b.data_inicio && b.hora_fim <= b.hora_inicio) return 'A hora final deve ser maior que a hora inicial.';
  return null;
}

// Liga os parametros comuns de criar/atualizar em uma request do mssql
function bindCampos(request, b) {
  const labId = b.tipo_recurso === 'Laboratorio' ? b.laboratorio_id : null;
  const salaId = b.tipo_recurso === 'Sala' ? b.sala_id : null;
  return request
    .input('usuario_id', sql.Int, b.usuario_id)
    .input('tipo_recurso', sql.VarChar(20), b.tipo_recurso)
    .input('laboratorio_id', sql.Int, labId)
    .input('sala_id', sql.Int, salaId)
    .input('data_inicio', sql.VarChar(10), b.data_inicio)
    .input('data_fim', sql.VarChar(10), b.data_fim)
    .input('hora_inicio', sql.VarChar(8), b.hora_inicio)
    .input('hora_fim', sql.VarChar(8), b.hora_fim)
    .input('status_id', sql.Int, b.status_id);
}

// Verifica se ja existe reserva ativa (status diferente de LIVRE) no mesmo recurso e periodo.
// Duas reservas conflitam quando: inicio_existente < fim_novo  E  fim_existente > inicio_novo
async function temConflito(pool, b, ignorarId = null) {
  const request = bindCampos(pool.request(), b).input('ignorar_id', sql.Int, ignorarId);
  const result = await request.query(`
    SELECT TOP 1 r.id
    FROM Reserva r
    JOIN Status st ON st.id = r.status_id
    WHERE st.codigo <> 'LIVRE'
      AND r.id <> ISNULL(@ignorar_id, -1)
      AND r.tipo_recurso = @tipo_recurso
      AND (
            (@tipo_recurso = 'Laboratorio' AND r.laboratorio_id = @laboratorio_id)
         OR (@tipo_recurso = 'Sala'        AND r.sala_id = @sala_id)
      )
      AND ${INICIO} < DATEADD(SECOND, DATEDIFF(SECOND, 0, CAST(@hora_fim AS TIME)), CAST(CAST(@data_fim AS DATE) AS DATETIME2))
      AND ${FIM}    > DATEADD(SECOND, DATEDIFF(SECOND, 0, CAST(@hora_inicio AS TIME)), CAST(CAST(@data_inicio AS DATE) AS DATETIME2))
  `);
  return result.recordset.length > 0;
}

// GET /api/reservas -> consulta com filtros opcionais (query string):
//   recurso_codigo, recurso_nome, tipo_recurso, data_de, data_ate, hora, usuario, status_id
exports.listar = async (req, res) => {
  try {
    const pool = await getPool();
    const request = pool.request();
    const where = [];
    const q = req.query;

    if (q.recurso_codigo) {
      where.push('COALESCE(l.codigo, s.codigo) LIKE @recurso_codigo');
      request.input('recurso_codigo', sql.VarChar(50), `%${q.recurso_codigo}%`);
    }
    if (q.recurso_nome) {
      where.push('COALESCE(l.nome, s.nome) LIKE @recurso_nome');
      request.input('recurso_nome', sql.VarChar(150), `%${q.recurso_nome}%`);
    }
    if (q.tipo_recurso) {
      where.push('r.tipo_recurso = @tipo_recurso');
      request.input('tipo_recurso', sql.VarChar(20), q.tipo_recurso);
    }
    // Periodo: reservas que se sobrepoem ao intervalo informado
    if (q.data_de) {
      where.push('r.data_fim >= CAST(@data_de AS DATE)');
      request.input('data_de', sql.VarChar(10), q.data_de);
    }
    if (q.data_ate) {
      where.push('r.data_inicio <= CAST(@data_ate AS DATE)');
      request.input('data_ate', sql.VarChar(10), q.data_ate);
    }
    // Hora: reservas cujo horario contem a hora informada
    if (q.hora) {
      where.push('r.hora_inicio <= CAST(@hora AS TIME) AND r.hora_fim >= CAST(@hora AS TIME)');
      request.input('hora', sql.VarChar(8), q.hora);
    }
    if (q.usuario) {
      where.push('u.nome_completo LIKE @usuario');
      request.input('usuario', sql.VarChar(150), `%${q.usuario}%`);
    }
    if (q.status_id) {
      where.push('r.status_id = @status_id');
      request.input('status_id', sql.Int, Number(q.status_id));
    }

    const sqlText =
      SELECT_BASE +
      (where.length ? ' WHERE ' + where.join(' AND ') : '') +
      ' ORDER BY r.data_inicio DESC, r.hora_inicio DESC';

    const result = await request.query(sqlText);
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao consultar reservas.' });
  }
};

// GET /api/reservas/:id
exports.buscarPorId = async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('id', sql.Int, req.params.id)
      .query(SELECT_BASE + ' WHERE r.id = @id');
    if (!result.recordset.length) return res.status(404).json({ erro: 'Reserva nao encontrada.' });
    res.json(result.recordset[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar reserva.' });
  }
};

// POST /api/reservas
exports.criar = async (req, res) => {
  const erro = validar(req.body);
  if (erro) return res.status(400).json({ erro });
  try {
    const pool = await getPool();
    if (await temConflito(pool, req.body)) {
      return res.status(409).json({ erro: 'Ja existe uma reserva para este recurso neste periodo.' });
    }
    const result = await bindCampos(pool.request(), req.body).query(`
      INSERT INTO Reserva
        (usuario_id, tipo_recurso, laboratorio_id, sala_id, data_inicio, data_fim, hora_inicio, hora_fim, status_id)
      OUTPUT INSERTED.id
      VALUES
        (@usuario_id, @tipo_recurso, @laboratorio_id, @sala_id,
         CAST(@data_inicio AS DATE), CAST(@data_fim AS DATE),
         CAST(@hora_inicio AS TIME), CAST(@hora_fim AS TIME), @status_id)
    `);
    res.status(201).json({ id: result.recordset[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao criar reserva.' });
  }
};

// PUT /api/reservas/:id
exports.atualizar = async (req, res) => {
  const erro = validar(req.body);
  if (erro) return res.status(400).json({ erro });
  try {
    const pool = await getPool();
    const id = Number(req.params.id);
    if (await temConflito(pool, req.body, id)) {
      return res.status(409).json({ erro: 'Ja existe uma reserva para este recurso neste periodo.' });
    }
    const result = await bindCampos(pool.request(), req.body).input('id', sql.Int, id).query(`
      UPDATE Reserva SET
        usuario_id = @usuario_id,
        tipo_recurso = @tipo_recurso,
        laboratorio_id = @laboratorio_id,
        sala_id = @sala_id,
        data_inicio = CAST(@data_inicio AS DATE),
        data_fim = CAST(@data_fim AS DATE),
        hora_inicio = CAST(@hora_inicio AS TIME),
        hora_fim = CAST(@hora_fim AS TIME),
        status_id = @status_id
      WHERE id = @id
    `);
    if (!result.rowsAffected[0]) return res.status(404).json({ erro: 'Reserva nao encontrada.' });
    res.json({ id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao atualizar reserva.' });
  }
};

// DELETE /api/reservas/:id
exports.remover = async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().input('id', sql.Int, req.params.id).query('DELETE FROM Reserva WHERE id = @id');
    if (!result.rowsAffected[0]) return res.status(404).json({ erro: 'Reserva nao encontrada.' });
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao excluir reserva.' });
  }
};