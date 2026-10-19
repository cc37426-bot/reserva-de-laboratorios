import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { listar, criar, atualizar, remover } from '../lib/api';

const VAZIO = {
  usuario_id: '',
  tipo_recurso: 'Laboratorio',
  recurso_id: '',
  data_inicio: '',
  data_fim: '',
  hora_inicio: '',
  hora_fim: '',
  status_id: ''
};

function formatarData(iso) {
  if (!iso) return '';
  const [a, m, d] = iso.split('-');
  return `${d}/${m}/${a}`;
}

export default function Reservas() {
  const [reservas, setReservas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [laboratorios, setLaboratorios] = useState([]);
  const [salas, setSalas] = useState([]);
  const [statusLista, setStatusLista] = useState([]);
  const [form, setForm] = useState(VAZIO);
  const [editandoId, setEditandoId] = useState(null);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  async function carregarReservas() {
    try {
      setReservas(await listar('reservas'));
    } catch (e) {
      setErro(e.message);
    }
  }

  async function carregarOpcoes() {
    try {
      const [u, l, s, st] = await Promise.all([
        listar('usuarios'),
        listar('laboratorios'),
        listar('salas'),
        listar('status')
      ]);
      setUsuarios(u);
      setLaboratorios(l);
      setSalas(s);
      setStatusLista(st);
    } catch (e) {
      setErro(e.message);
    }
  }

  useEffect(() => {
    carregarOpcoes();
    carregarReservas();
  }, []);

  function onChange(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  function onMudarTipo(tipo) {
    // ao trocar entre laboratorio e sala, limpa o recurso escolhido
    setForm((f) => ({ ...f, tipo_recurso: tipo, recurso_id: '' }));
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
      const ehLab = form.tipo_recurso === 'Laboratorio';
      const payload = {
        usuario_id: Number(form.usuario_id),
        tipo_recurso: form.tipo_recurso,
        laboratorio_id: ehLab ? Number(form.recurso_id) : null,
        sala_id: ehLab ? null : Number(form.recurso_id),
        data_inicio: form.data_inicio,
        data_fim: form.data_fim,
        hora_inicio: form.hora_inicio,
        hora_fim: form.hora_fim,
        status_id: Number(form.status_id)
      };
      if (editandoId) {
        await atualizar('reservas', editandoId, payload);
        setSucesso('Reserva atualizada com sucesso.');
      } else {
        await criar('reservas', payload);
        setSucesso('Reserva cadastrada com sucesso.');
      }
      limparFormulario();
      carregarReservas();
    } catch (e) {
      setErro(e.message);
    }
  }

  function onEditar(item) {
    setEditandoId(item.id);
    setForm({
      usuario_id: String(item.usuario_id),
      tipo_recurso: item.tipo_recurso,
      recurso_id: String(item.tipo_recurso === 'Laboratorio' ? item.laboratorio_id : item.sala_id),
      data_inicio: item.data_inicio,
      data_fim: item.data_fim,
      hora_inicio: item.hora_inicio,
      hora_fim: item.hora_fim,
      status_id: String(item.status_id)
    });
    setErro('');
    setSucesso('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function onRemover(id) {
    if (!confirm('Confirma a exclusão desta reserva?')) return;
    try {
      await remover('reservas', id);
      carregarReservas();
    } catch (e) {
      setErro(e.message);
    }
  }

  const recursos = form.tipo_recurso === 'Laboratorio' ? laboratorios : salas;

  return (
    <Layout>
      <h2>Reserva de Laboratórios e Salas</h2>
      <p className="subtitulo">Período, horário, usuário, recurso e status da reserva.</p>

      {erro && <div className="mensagem-erro">{erro}</div>}
      {sucesso && <div className="mensagem-sucesso">{sucesso}</div>}

      <div className="card">
        <form onSubmit={onSalvar}>
          <div className="form-grid">
            <label>
              Usuário
              <select value={form.usuario_id} onChange={(e) => onChange('usuario_id', e.target.value)} required>
                <option value="">Selecione...</option>
                {usuarios.map((u) => (
                  <option key={u.id} value={u.id}>{u.nome_completo}</option>
                ))}
              </select>
            </label>
            <label>
              Tipo de recurso
              <select value={form.tipo_recurso} onChange={(e) => onMudarTipo(e.target.value)} required>
                <option value="Laboratorio">Laboratório</option>
                <option value="Sala">Sala</option>
              </select>
            </label>
            <label>
              Recurso
              <select value={form.recurso_id} onChange={(e) => onChange('recurso_id', e.target.value)} required>
                <option value="">Selecione...</option>
                {recursos.map((r) => (
                  <option key={r.id} value={r.id}>{r.codigo} - {r.nome}</option>
                ))}
              </select>
            </label>
            <label>
              Status
              <select value={form.status_id} onChange={(e) => onChange('status_id', e.target.value)} required>
                <option value="">Selecione...</option>
                {statusLista.map((s) => (
                  <option key={s.id} value={s.id}>{s.nome}</option>
                ))}
              </select>
            </label>
            <label>
              Data inicial
              <input type="date" value={form.data_inicio} onChange={(e) => onChange('data_inicio', e.target.value)} required />
            </label>
            <label>
              Data final
              <input type="date" value={form.data_fim} onChange={(e) => onChange('data_fim', e.target.value)} required />
            </label>
            <label>
              Hora inicial
              <input type="time" value={form.hora_inicio} onChange={(e) => onChange('hora_inicio', e.target.value)} required />
            </label>
            <label>
              Hora final
              <input type="time" value={form.hora_fim} onChange={(e) => onChange('hora_fim', e.target.value)} required />
            </label>
          </div>
          <div className="botoes">
            <button type="submit" className="btn-primario">
              {editandoId ? 'Salvar alterações' : 'Cadastrar reserva'}
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
              <th>Recurso</th>
              <th>Usuário</th>
              <th>Período</th>
              <th>Horário</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {reservas.map((item) => (
              <tr key={item.id}>
                <td>{item.recurso_codigo} - {item.recurso_nome}</td>
                <td>{item.usuario_nome}</td>
                <td>{formatarData(item.data_inicio)} a {formatarData(item.data_fim)}</td>
                <td>{item.hora_inicio} às {item.hora_fim}</td>
                <td>{item.status_nome}</td>
                <td>
                  <button className="btn-editar" onClick={() => onEditar(item)}>Editar</button>
                  <button className="btn-perigo" onClick={() => onRemover(item.id)}>Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {reservas.length === 0 && <p className="vazio">Nenhuma reserva cadastrada ainda.</p>}
      </div>
    </Layout>
  );
}