# Sistema de Reserva de Laboratórios e Salas — Etapa 1

Cadastros implementados nesta etapa (entrega até 06/10/2026):
- Usuários (CPF, nome, data de nascimento, celular, e-mail, login e senha)
- Laboratórios (código, nome, capacidade, localização)
- Salas (código, nome, capacidade, localização)
- Status (código e nome — já vem com Livre, Ocupado, Bloqueado e Reservado)

Stack: **Node.js + Express** (backend) / **React + Next.js** (frontend) / **SQL Server** (banco).

## 1. Banco de dados

1. Abra o SQL Server Management Studio (ou Azure Data Studio).
2. Execute o script `backend/src/db/schema.sql`. Ele cria o banco `ReservaLabsSalas`
   e as 4 tabelas, já inserindo os status padrão.

## 2. Backend (API)

```bash
cd backend
npm install
cp .env.example .env
# edite o .env com o usuário, senha e servidor do seu SQL Server
npm run dev
```

A API sobe em `http://localhost:3001`. Endpoints disponíveis (mesmo padrão para as 4 tabelas):

- `GET    /api/usuarios`
- `GET    /api/usuarios/:id`
- `POST   /api/usuarios`
- `PUT    /api/usuarios/:id`
- `DELETE /api/usuarios/:id`

(troque `usuarios` por `laboratorios`, `salas` ou `status`)

## 3. Frontend (telas)

Em outro terminal:

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

Acesse `http://localhost:3000`. O menu tem as 4 telas de cadastro, cada uma com
formulário de criação/edição e uma lista com os registros (editar/excluir).

## 4. Para a entrega

- Suba este código no GitHub (crie o repositório da dupla).
- Cole o link do repositório no Classroom da disciplina Prática Profissional,
  até 06/10/2026.
- Qualquer material consultado (sites, vídeos, IA) para codificar deve constar
  na bibliografia do projeto — cópia direta não é aceita.

## Próximas etapas (não fazem parte desta entrega)

- Tela principal com menu, reserva de recursos e consulta de reservas (até 20/10/2026)
- Tela de login (até 10/11/2026, junto com a entrega final)
