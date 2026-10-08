const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

async function tratarResposta(res) {
  const dados = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(dados.erro || 'Erro na requisicao.');
  }
  return dados;
}

export async function listar(recurso) {
  const res = await fetch(`${API_URL}/${recurso}`);
  return tratarResposta(res);
}

export async function criar(recurso, dados) {
  const res = await fetch(`${API_URL}/${recurso}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados)
  });
  return tratarResposta(res);
}

export async function atualizar(recurso, id, dados) {
  const res = await fetch(`${API_URL}/${recurso}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados)
  });
  return tratarResposta(res);
}

export async function remover(recurso, id) {
  const res = await fetch(`${API_URL}/${recurso}/${id}`, { method: 'DELETE' });
  return tratarResposta(res);
}
