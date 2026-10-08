import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { listar, criar, atualizar, remover } from '../lib/api';

const VAZIO = { codigo: '', nome: '', capacidade: '', localizacao: '' };
const RECURSO = 'salas';

export default function Salas() {
  const [itens, setItens] = useState([]);
  const [form, setForm] = useState(VAZIO);
  const [editandoId, setEditandoId] = useState(null);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  async function carregar() {
    try {
      setItens(await listar(RECURSO));
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
      const payload = { ...form, capacidade: Number(form.capacidade) };
      if (editandoId) {
        await atualizar(RECURSO, editandoId, payload);
        setSucesso('Sala atualizado com sucesso.');
      } else {
        await criar(RECURSO, payload);
        setSucesso('Sala cadastrado com sucesso.');
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
      codigo: item.codigo,
      nome: item.nome,
      capacidade: String(item.capacidade),
      localizacao: item.localizacao || ''
    });
    setErro('');
    setSucesso('');
  }

  async function onRemover(id) {
    if (!confirm('Confirma a exclusão deste sala?')) return;
    try {
      await remover(RECURSO, id);
      carregar();
    } catch (e) {
      setErro(e.message);
    }
  }

  return (
    <Layout>
      <h2>Cadastro de Salas</h2>
      <p className="subtitulo">Código, nome, capacidade e localização.</p>

      {erro && <div className="mensagem-erro">{erro}</div>}
      {sucesso && <div className="mensagem-sucesso">{sucesso}</div>}

      <div className="card">
        <form onSubmit={onSalvar}>
          <div className="form-grid">
            <label>
              Código
              <input value={form.codigo} onChange={(e) => onChange('codigo', e.target.value)} required />
            </label>
            <label>
              Nome
              <input value={form.nome} onChange={(e) => onChange('nome', e.target.value)} required />
            </label>
            <label>
              Capacidade
              <input
                type="number"
                min="1"
                value={form.capacidade}
                onChange={(e) => onChange('capacidade', e.target.value)}
                required
              />
            </label>
            <label>
              Localização
              <input value={form.localizacao} onChange={(e) => onChange('localizacao', e.target.value)} />
            </label>
          </div>
          <div className="botoes">
            <button type="submit" className="btn-primario">
              {editandoId ? 'Salvar alterações' : 'Cadastrar sala'}
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
              <th>Código</th>
              <th>Nome</th>
              <th>Capacidade</th>
              <th>Localização</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {itens.map((item) => (
              <tr key={item.id}>
                <td>{item.codigo}</td>
                <td>{item.nome}</td>
                <td>{item.capacidade}</td>
                <td>{item.localizacao || '-'}</td>
                <td>
                  <button className="btn-editar" onClick={() => onEditar(item)}>Editar</button>
                  <button className="btn-perigo" onClick={() => onRemover(item.id)}>Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {itens.length === 0 && <p className="vazio">Nenhum sala cadastrado ainda.</p>}
      </div>
    </Layout>
  );
}
