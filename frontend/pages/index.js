import Layout from '../components/Layout';

export default function Home() {
  return (
    <Layout>
      <h2>Etapa 1 — Cadastros</h2>
      <p className="subtitulo">
        Sistema de Reserva de Laboratórios e Salas de Aula. Escolha um cadastro abaixo.
      </p>
      <div className="grid-menu">
        <a href="/usuarios">👤 Usuários</a>
        <a href="/laboratorios">🔬 Laboratórios</a>
        <a href="/salas">🏫 Salas</a>
        <a href="/status">🏷️ Status</a>
      </div>
    </Layout>
  );
}
