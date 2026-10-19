import Layout from '../components/Layout';

export default function Home() {
  return (
    <Layout>
      <h2>Sistema de Reservas</h2>

      <p className="subtitulo">
        Sistema de Reserva de Laboratórios e Salas de Aula.
        Escolha uma opção abaixo.
      </p>

      <h3>Reservas</h3>

      <div className="grid-menu">
        <a href="/reservas">
          📅 Reservar recursos
        </a>

        <a href="/consulta">
          🔎 Consultar reservas
        </a>
      </div>

      <h3>Cadastros</h3>

      <div className="grid-menu">
        <a href="/usuarios">👤 Usuários</a>
        <a href="/laboratorios">🔬 Laboratórios</a>
        <a href="/salas">🏫 Salas</a>
        <a href="/status">🏷️ Status</a>
      </div>
    </Layout>
  );
}
