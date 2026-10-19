import Link from 'next/link';

export default function Layout({ children }) {
  return (
    <>
      <header className="topo">
        <div className="container">
          <h1>Reserva de Laboratórios e Salas</h1>
          <nav className="menu">
            <Link href="/">Início</Link>
            <Link href="/usuarios">Usuários</Link>
            <Link href="/laboratorios">Laboratórios</Link>
            <Link href="/salas">Salas</Link>
            <Link href="/status">Status</Link>
            <Link href="/reservas">Reservas</Link>
            <Link href="/consulta">Consulta</Link>
          </nav>
        </div>
      </header>
      <main className="container">{children}</main>
    </>
  );
}