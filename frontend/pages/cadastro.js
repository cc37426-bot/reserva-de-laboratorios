import { useState } from 'react';
import { useRouter } from 'next/router';
import { criar } from '../lib/api';

const VAZIO = {
  cpf: '',
  nome_completo: '',
  data_nascimento: '',
  celular: '',
  email: '',
  login: '',
  senha: '',
  confirmar: ''
};

export default function Cadastro() {
  const router = useRouter();
  const [form, setForm] = useState(VAZIO);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [enviando, setEnviando] = useState(false);

  function onChange(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  async function onCadastrar(e) {
    e.preventDefault();
    setErro('');
    setSucesso('');

    // O CPF e guardado so com numeros (a coluna tem 11 posicoes)
    const cpf = form.cpf.replace(/\D/g, '');
    if (cpf.length !== 11) {
      setErro('O CPF deve ter 11 numeros.');
      return;
    }
    if (form.senha !== form.confirmar) {
      setErro('As senhas nao conferem.');
      return;
    }

    setEnviando(true);
    try {
      const { confirmar, ...dados } = form;
      await criar('usuarios', { ...dados, cpf });
      setSucesso('Conta criada com sucesso! Voce sera levado para o login...');
      setForm(VAZIO);
      setTimeout(() => router.push('/login'), 2000);
    } catch (err) {
      setErro(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="container" style={{ maxWidth: '640px', marginTop: '40px' }}>
      <h2>Criar conta</h2>
      <p className="subtitulo">Preencha os dados para se cadastrar no sistema.</p>

      {erro && <div className="mensagem-erro">{erro}</div>}
      {sucesso && <div className="mensagem-sucesso">{sucesso}</div>}

      <div className="card">
        <form onSubmit={onCadastrar}>
          <div className="form-grid">
            <label>
              CPF (somente números)
              <input value={form.cpf} onChange={(e) => onChange('cpf', e.target.value)} maxLength={14} required />
            </label>
            <label>
              Nome completo
              <input value={form.nome_completo} onChange={(e) => onChange('nome_completo', e.target.value)} required />
            </label>
            <label>
              Data de nascimento
              <input type="date" value={form.data_nascimento} onChange={(e) => onChange('data_nascimento', e.target.value)} required />
            </label>
            <label>
              Celular
              <input value={form.celular} onChange={(e) => onChange('celular', e.target.value)} />
            </label>
            <label>
              E-mail
              <input type="email" value={form.email} onChange={(e) => onChange('email', e.target.value)} required />
            </label>
            <label>
              Login
              <input value={form.login} onChange={(e) => onChange('login', e.target.value)} required />
            </label>
            <label>
              Senha
              <input type="password" value={form.senha} onChange={(e) => onChange('senha', e.target.value)} required />
            </label>
            <label>
              Confirmar senha
              <input type="password" value={form.confirmar} onChange={(e) => onChange('confirmar', e.target.value)} required />
            </label>
          </div>
          <div className="botoes">
            <button type="submit" className="btn-primario" disabled={enviando}>
              {enviando ? 'Cadastrando...' : 'Criar conta'}
            </button>
            <button type="button" className="btn-secundario" onClick={() => router.push('/login')}>
              Voltar ao login
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
