require('dotenv').config();
const sql = require('mssql');

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 1433,
  options: {
    encrypt: false,            // true se estiver usando Azure SQL
    trustServerCertificate: true
  }
};

let poolPromise;

function getPool() {
  if (!poolPromise) {
    poolPromise = sql.connect(config)
      .then((pool) => {
        console.log('Conectado ao SQL Server com sucesso.');
        return pool;
      })
      .catch((err) => {
        poolPromise = null;
        console.error('Erro ao conectar no SQL Server:', err.message);
        throw err;
      });
  }
  return poolPromise;
}

module.exports = { sql, getPool };
