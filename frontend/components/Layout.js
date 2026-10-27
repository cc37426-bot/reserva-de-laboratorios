import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function Layout({ children }) {
  const router = useRouter();
  const [usuario, setUsuario] = useState(null);
  const [verificado, setVerificado] = useState(false);

  // Se nao houver usuario salvo no navegador, volta para o login
  useEffect(() => {
    try {
      const salvo = localStorage.getItem('usuario');
      if (salvo) setUsuario(JSON.parse(salvo));
      else router.replace('/login');
    } catch (e) {
      router.replace('/login');
    }
    setVerificado(true);
  }, []);

  function sair() {
    try {
      localStorage.removeItem('usuario');
    } catch (e) {}
    router.replace('/login');
  }

  if (!verificado || !usuario) return null;

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
            <span>{usuario.nome_completo}</span>
            <button type="button" className="btn-secundario" onClick={sair}>Sair</button>
          </nav>
        </div>
      </header>
      <main className="container">{children}</main>
    </>
  );
}
