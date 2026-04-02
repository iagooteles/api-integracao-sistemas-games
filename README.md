# api-integracao-sistemas-games

API REST para gerenciamento de games, usuários, conquistas (achievements) e publishers.

## Descrição

Esta é uma API RESTful desenvolvida em Node.js utilizando o framework Express e persistência em arquivos JSON. 
Permite cadastrar, listar, editar e remover jogos, usuários, conquistas e publishers, com endpoints claros e validador de campos obrigatórios.

## Funcionalidades

- Gerenciamento de **Games** (jogos)
- Gerenciamento de **Users** (usuários)
- Gerenciamento de **Achievements** (conquistas)
- Gerenciamento de **Publishers** (publicadoras)
- Validação automática de campos obrigatórios
- Armazenamento e inicialização automática via arquivos JSON (em `storage/`)

## Tecnologias

- Node.js >= 18
- Express 4.x

## Instalação

Clone o repositório e instale as dependências:

```bash
git clone https://github.com/iagooteles/api-integracao-sistemas-games.git
cd api-integracao-sistemas-games
npm install
```

## Execução

### Em modo desenvolvimento (hot reload Node.js >= 18):

```bash
npm run dev
```

### Em modo produção:

```bash
npm start
```

A aplicação será iniciada em `http://localhost:3030` (por padrão).

## Estrutura dos Principais Endpoints

Após subir o servidor, faça uma requisição GET para a raiz `/` para descobrir os endpoints disponíveis:

```http
GET /
```

Response:

```json
{
  "name": "API Games",
  "version": "1.0.0",
  "endpoints": {
    "games": "/api/games",
    "users": "/api/users",
    "achievements": "/api/achievements",
    "publishers": "/api/publishers"
  }
}
```

### Exemplos de Endpoints

#### Games

- `GET /api/games` — listar todos os jogos
- `GET /api/games/:id` — obter detalhes de um jogo
- `POST /api/games` — adicionar novo jogo
- `PUT /api/games/:id` — atualizar jogo existente
- `DELETE /api/games/:id` — remover jogo

**Campos de um game:**
- `title` (string), `genre` (string), `releaseYear` (number), `price` (number), `platform` (string), `publisherId` (number), `metacriticScore` (number)

#### Users

- `GET /api/users` — listar todos os usuários
- `GET /api/users/:id` — obter detalhes de usuário
- `POST /api/users` — adicionar usuário
- `PUT /api/users/:id` — atualizar usuário
- `DELETE /api/users/:id` — remover usuário

**Campos de um usuário:**
- `name`, `email`, `username`, `country`, `birthDate`, `bio`

#### Achievements

- `GET /api/achievements` — listar conquistas
- `GET /api/achievements/:id` — detalhes de conquista
- `POST /api/achievements` — adicionar conquista
- `PUT /api/achievements/:id` — atualizar
- `DELETE /api/achievements/:id` — remover

**Campos de uma achievement:**
- `title`, `description`, `points`, `rarity`, `gameId`, `secret`

#### Publishers

- `GET /api/publishers` — listar publishers
- `GET /api/publishers/:id` — detalhes
- `POST /api/publishers` — adicionar
- `PUT /api/publishers/:id` — atualizar
- `DELETE /api/publishers/:id` — remover

**Campos de uma publisher:**
- `name`, `country`, `foundedYear`, `website`, `headquarters`, `isIndie`

## Armazenamento

Os dados são persistidos em arquivos JSON dentro da pasta `storage/`, um para cada entidade (`games.json`, `users.json`, etc.).

## Validação de Campos

As rotas `POST` e `PUT` validam se os campos obrigatórios estão presentes. Em caso de falta, a resposta será HTTP 400 com os campos ausentes.

## Exemplo de uso: adicionar um game

```http
POST /api/games
Content-Type: application/json

{
  "title": "Cyberpunk",
  "genre": "RPG",
  "releaseYear": 2022,
  "price": 59990.99,
  "platform": "PC",
  "publisherId": 1,
  "metacriticScore": 88
}
```

## Licença

[MIT](LICENSE) (sugestão – altere se desejar)

---

> DOC
