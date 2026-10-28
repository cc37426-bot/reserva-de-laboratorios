import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { criar } from '../lib/api';

export default function Login() {
  const router = useRouter();
  const [login, setLogin] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  // Se ja estiver logado, vai direto para o inicio
  useEffect(() => {
    try {
      if (localStorage.getItem('usuario')) router.replace('/');
    } catch (e) {}
  }, []);

  async function onEntrar(e) {
    e.preventDefault();
    setErro('');
    setEnviando(true);
    try {
      const usuario = await criar('auth/login', { login, senha });
      localStorage.setItem('usuario', JSON.stringify(usuario));
      router.replace('/');
    } catch (err) {
      setErro(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="container" style={{ maxWidth: '420px', marginTop: '80px' }}>
      <h2>Reserva de Laboratórios e Salas</h2>
      <p className="subtitulo">Informe seu login e senha para acessar o sistema.</p>

      {erro && <div className="mensagem-erro">{erro}</div>}

      <div className="card">
        <form onSubmit={onEntrar}>
          <div className="form-grid">
            <label>
              Login
              <input value={login} onChange={(e) => setLogin(e.target.value)} required autoFocus />
            </label>
            <label>
              Senha
              <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required />
            </label>
          </div>
          <div className="botoes">
            <button type="submit" className="btn-primario" disabled={enviando}>
              {enviando ? 'Entrando...' : 'Entrar'}
            </button>
          </div>
        </form>
      </div>
    <p style={{ marginTop: '16px' }}>Não tem login? <a href="/cadastro">Criar conta</a></p>
    </main>
  );
}

