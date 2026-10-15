# Encurtador

Projeto de encurtador de URLs — backend em Node.js + TypeScript + Express + Prisma (Postgres) e Redis; frontend em React + Vite + Tailwind.

Rápido para rodar em desenvolvimento via Docker Compose.

Links
- Repo: https://github.com/Akinori5184/Encurtador

Pré-requisitos
- Docker & Docker Compose
- Git

Como rodar (local, dev)

1. Copie o .env.example para .env no diretório backend e preencha se necessário.
2. docker-compose up --build
3. Backend: http://localhost:4000
4. Frontend: http://localhost:5173

Estrutura inicial
- backend/: código do servidor
- frontend/: app React + Tailwind
- docker-compose.yml: postgres + redis + backend + frontend

Próximos passos
- Rodar migrations do Prisma: dentro de backend: `npx prisma migrate dev` (após o contêiner do Postgres estar levantado)
- Criar conta e testar endpoints: POST /api/links, GET /:short_code

Contribuição
Abra issues ou PRs no repo.
