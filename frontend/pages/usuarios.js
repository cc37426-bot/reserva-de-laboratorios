import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { listar, criar, atualizar, remover } from '../lib/api';

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
    try {
      const payload = { ...form };
      if (editandoId && !payload.senha) {
        delete payload.senha; // mantem a senha atual se o campo ficar em branco na edicao
      }
      if (editandoId) {
        await atualizar('usuarios', editandoId, payload);
        setSucesso('Usuário atualizado com sucesso.');
      } else {
        await criar('usuarios', payload);
        setSucesso('Usuário cadastrado com sucesso.');
      }
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
      <h2>Cadastro de Usuários</h2>
      <p className="subtitulo">CPF, nome completo, data de nascimento, celular, e-mail, login e senha.</p>

      {erro && <div className="mensagem-erro">{erro}</div>}
      {sucesso && <div className="mensagem-sucesso">{sucesso}</div>}

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
              Senha {editandoId && '(deixe em branco para manter a atual)'}
              <input
                type="password"
                value={form.senha}
                onChange={(e) => onChange('senha', e.target.value)}
                required={!editandoId}
              />
            </label>
          </div>
          <div className="botoes">
            <button type="submit" className="btn-primario">
              {editandoId ? 'Salvar alterações' : 'Cadastrar usuário'}
            </button>
            {editandoId && (
              <button type="button" className="btn-secundario" onClick={limparFormulario}>
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

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
