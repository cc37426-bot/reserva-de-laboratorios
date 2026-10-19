import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { listar } from '../lib/api';

const FILTROS_VAZIOS = {
  recurso_codigo: '',
  recurso_nome: '',
  tipo_recurso: '',
  data_de: '',
  data_ate: '',
  hora: '',
  usuario: '',
  status_id: ''
};

function formatarData(iso) {
  if (!iso) return '';
  const [a, m, d] = iso.split('-');
  return `${d}/${m}/${a}`;
}

export default function Consulta() {
  const [filtros, setFiltros] = useState(FILTROS_VAZIOS);
  const [reservas, setReservas] = useState([]);
  const [statusLista, setStatusLista] = useState([]);
  const [erro, setErro] = useState('');

  // Monta a query string so com os filtros preenchidos
  async function buscar(f) {
    setErro('');
    try {
      const params = new URLSearchParams();
      Object.entries(f).forEach(([chave, valor]) => {
        if (valor) params.append(chave, valor);
      });
      const qs = params.toString();
      setReservas(await listar(qs ? `reservas?${qs}` : 'reservas'));
    } catch (e) {
      setErro(e.message);
    }
  }

  useEffect(() => {
    listar('status').then(setStatusLista).catch((e) => setErro(e.message));
    buscar(FILTROS_VAZIOS);
  }, []);

  function onChange(campo, valor) {
    setFiltros((f) => ({ ...f, [campo]: valor }));
  }

  function onFiltrar(e) {
    e.preventDefault();
    buscar(filtros);
  }

  function onLimpar() {
    setFiltros(FILTROS_VAZIOS);
    buscar(FILTROS_VAZIOS);
  }

  return (
    <Layout>
      <h2>Consulta de Reservas</h2>
      <p className="subtitulo">Filtre por recurso, período, horário, usuário e status.</p>

      {erro && <div className="mensagem-erro">{erro}</div>}

      <div className="card">
        <form onSubmit={onFiltrar}>
          <div className="form-grid">
            <label>
              Código do recurso
              <input value={filtros.recurso_codigo} onChange={(e) => onChange('recurso_codigo', e.target.value)} />
            </label>
            <label>
              Nome do recurso
              <input value={filtros.recurso_nome} onChange={(e) => onChange('recurso_nome', e.target.value)} />
            </label>
            <label>
              Tipo de recurso
              <select value={filtros.tipo_recurso} onChange={(e) => onChange('tipo_recurso', e.target.value)}>
                <option value="">Todos</option>
                <option value="Laboratorio">Laboratório</option>
                <option value="Sala">Sala</option>
              </select>
            </label>
            <label>
              Usuário (nome)
              <input value={filtros.usuario} onChange={(e) => onChange('usuario', e.target.value)} />
            </label>
            <label>
              Data de
              <input type="date" value={filtros.data_de} onChange={(e) => onChange('data_de', e.target.value)} />
            </label>
            <label>
              Data até
              <input type="date" value={filtros.data_ate} onChange={(e) => onChange('data_ate', e.target.value)} />
            </label>
            <label>
              Hora
              <input type="time" value={filtros.hora} onChange={(e) => onChange('hora', e.target.value)} />
            </label>
            <label>
              Status
              <select value={filtros.status_id} onChange={(e) => onChange('status_id', e.target.value)}>
                <option value="">Todos</option>
                {statusLista.map((s) => (
                  <option key={s.id} value={s.id}>{s.nome}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="botoes">
            <button type="submit" className="btn-primario">Filtrar</button>
            <button type="button" className="btn-secundario" onClick={onLimpar}>Limpar filtros</button>
          </div>
        </form>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Recurso</th>
              <th>Tipo</th>
              <th>Usuário</th>
              <th>Período</th>
              <th>Horário</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {reservas.map((item) => (
              <tr key={item.id}>
                <td>{item.recurso_codigo} - {item.recurso_nome}</td>
                <td>{item.tipo_recurso}</td>
                <td>{item.usuario_nome}</td>
                <td>{formatarData(item.data_inicio)} a {formatarData(item.data_fim)}</td>
                <td>{item.hora_inicio} às {item.hora_fim}</td>
                <td>{item.status_nome}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {reservas.length === 0 && <p className="vazio">Nenhuma reserva encontrada.</p>}
      </div>
    </Layout>
  );
}
