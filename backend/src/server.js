require('dotenv').config();
const express = require('express');
const cors = require('cors');

const usuarioRoutes = require('./routes/usuarioRoutes');
const laboratorioRoutes = require('./routes/laboratorioRoutes');
const salaRoutes = require('./routes/salaRoutes');
const statusRoutes = require('./routes/statusRoutes');
const reservaRoutes = require('./routes/reservaRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ mensagem: 'API do Sistema de Reserva de Laboratorios e Salas' });
});

app.use('/api/usuarios', usuarioRoutes);
app.use('/api/laboratorios', laboratorioRoutes);
app.use('/api/salas', salaRoutes);
app.use('/api/status', statusRoutes);
app.use('/api/reservas', reservaRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});