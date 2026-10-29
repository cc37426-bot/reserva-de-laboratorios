// usuarios.js - Lista de usuarios do sistema. Aqui nao se cadastra usuario novo:
// o cadastro e feito apenas na tela de login ("Criar conta"). Esta tela permite
// consultar, editar (o formulario so aparece ao clicar em Editar) e excluir.
import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { listar, atualizar, remover } from '../lib/api';

const VAZIO = {
  cpf: '',
  nome_completo: '',
  data_nascimento: '',
  celular: '',
  email: '',
  login: '',
  senha: ''
};

export default function Usuarios() {
  const [itens, setItens] = useState([]);
  const [form, setForm] = useState(VAZIO);
  const [editandoId, setEditandoId] = useState(null);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  async function carregar() {
    try {
      const dados = await listar('usuarios');
      setItens(dados);
    } catch (e) {
      setErro(e.message);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  function onChange(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  function limparFormulario() {
    setForm(VAZIO);
    setEditandoId(null);
  }

  async function onSalvar(e) {
    e.preventDefault();
    setErro('');
    setSucesso('');
    if (!editandoId) return; // nao existe cadastro novo nesta tela
    try {
      const payload = { ...form };
      if (!payload.senha) {
        delete payload.senha; // mantem a senha atual se o campo ficar em branco
      }
      await atualizar('usuarios', editandoId, payload);
      setSucesso('Usuário atualizado com sucesso.');
      limparFormulario();
      carregar();
    } catch (e) {
      setErro(e.message);
    }
  }

  function onEditar(item) {
    setEditandoId(item.id);
    setForm({
      cpf: item.cpf,
      nome_completo: item.nome_completo,
      data_nascimento: item.data_nascimento ? item.data_nascimento.substring(0, 10) : '',
      celular: item.celular || '',
      email: item.email,
      login: item.login,
      senha: ''
    });
    setErro('');
    setSucesso('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function onRemover(id) {
    if (!confirm('Confirma a exclusão deste usuário?')) return;
    try {
      await remover('usuarios', id);
      carregar();
    } catch (e) {
      setErro(e.message);
    }
  }

  return (
    <Layout>
      <h2>Usuários</h2>
      <p className="subtitulo">
        Lista dos usuários do sistema. Para cadastrar um novo usuário, use “Criar conta” na tela de login.
      </p>

      {erro && <div className="mensagem-erro">{erro}</div>}
      {sucesso && <div className="mensagem-sucesso">{sucesso}</div>}

      {editandoId && (
        <div className="card">
          <form onSubmit={onSalvar}>
            <div className="form-grid">
              <label>
                CPF
                <input
                  value={form.cpf}
                  onChange={(e) => onChange('cpf', e.target.value.replace(/\D/g, ''))}
                  maxLength={11}
                  placeholder="Somente números"
                  required
                />
              </label>
              <label>
                Nome completo
                <input
                  value={form.nome_completo}
                  onChange={(e) => onChange('nome_completo', e.target.value)}
                  required
                />
              </label>
              <label>
                Data de nascimento
                <input
                  type="date"
                  value={form.data_nascimento}
                  onChange={(e) => onChange('data_nascimento', e.target.value)}
                  required
                />
              </label>
              <label>
                Celular
                <input
                  value={form.celular}
                  onChange={(e) => onChange('celular', e.target.value)}
                  placeholder="(00) 00000-0000"
                />
              </label>
              <label>
                E-mail
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => onChange('email', e.target.value)}
                  required
                />
              </label>
              <label>
                Login
                <input
                  value={form.login}
                  onChange={(e) => onChange('login', e.target.value)}
                  required
                />
              </label>
              <label className="form-full">
                Senha (deixe em branco para manter a atual)
                <input
                  type="password"
                  value={form.senha}
                  onChange={(e) => onChange('senha', e.target.value)}
                />
              </label>
            </div>
            <div className="botoes">
              <button type="submit" className="btn-primario">Salvar alterações</button>
              <button type="button" className="btn-secundario" onClick={limparFormulario}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>CPF</th>
              <th>E-mail</th>
              <th>Login</th>
              <th>Cadastrado em</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {itens.map((item) => (
              <tr key={item.id}>
                <td>{item.nome_completo}</td>
                <td>{item.cpf}</td>
                <td>{item.email}</td>
                <td>{item.login}</td>
                <td>{item.data_cadastro ? new Date(item.data_cadastro).toLocaleDateString('pt-BR') : '-'}</td>
                <td>
                  <button className="btn-editar" onClick={() => onEditar(item)}>Editar</button>
                  <button className="btn-perigo" onClick={() => onRemover(item.id)}>Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {itens.length === 0 && <p className="vazio">Nenhum usuário cadastrado ainda.</p>}
      </div>
    </Layout>
  );
}
