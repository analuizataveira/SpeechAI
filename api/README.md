# Speech AI - NestJS API

API desenvolvida em NestJS com Prisma e PostgreSQL para gerenciamento de usuários (médicos e pacientes).

## Arquitetura

O projeto segue o princípio KISS (Keep It Simple, Stupid) e está organizado em:

- **Config**: variáveis de ambiente e configurações globais
- **DTOs**: objetos de transferência de dados com validação
- **Framework**: decorators, filters, guards, interceptors, middlewares, pipes e utilitários
- **Mocks**: dados mock para testes
- **Providers**: serviços externos como banco de dados, email, etc.
- **Resources**: lógica de negócio da aplicação
  - **Controller**: ponto de entrada do recurso
  - **Service**: lógica de negócio
  - **DTOs**: objetos de transferência de dados
  - **Interfaces**: interfaces que definem a estrutura das classes de serviço

## Estrutura do Banco de Dados

O banco segue o diagrama ERD fornecido com as seguintes entidades:

- **users**: usuários do sistema (médicos e pacientes)
- **doctor_profile**: perfis específicos de médicos
- **patient_profile**: perfis específicos de pacientes

## Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/speech_ai"

# JWT
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_EXPIRES_IN="24h"

# Application
NODE_ENV="development"
PORT=3000
```

### Docker Compose

Para subir a aplicação com PostgreSQL:

```bash
docker-compose up -d
```

### Instalação de Dependências

```bash
yarn install
```

### Configuração do Banco de Dados

```bash
# Gerar cliente Prisma
yarn prisma:generate

# Aplicar migrações
yarn prisma:migrate

# Ou usar push para desenvolvimento
yarn prisma:push
```

## Execução

### Desenvolvimento

```bash
yarn start:dev
```

### Produção

```bash
yarn build
yarn start:prod
```

## Endpoints

### Autenticação

- `POST /auth/login` - Login de usuário
- `GET /auth/me` - Obter dados do usuário logado (requer autenticação)

### Usuários

- `POST /users` - Criar novo usuário

## Exemplos de Uso

### Criar Usuário Médico

```json
POST /users
{
  "email": "doctor@example.com",
  "password": "password123",
  "role": "doctor",
  "name": "Dr. João Silva",
  "birthDate": "1980-01-01",
  "phone": "(11) 99999-9999",
  "specialty": "Cardiologia"
}
```

### Criar Usuário Paciente

```json
POST /users
{
  "email": "patient@example.com",
  "password": "password123",
  "role": "patient",
  "name": "Maria Santos",
  "birthDate": "1990-05-15",
  "phone": "(11) 88888-8888"
}
```

### Login

```json
POST /auth/login
{
  "email": "doctor@example.com",
  "password": "password123"
}
```

### Obter Dados do Usuário

```bash
GET /auth/me
Authorization: Bearer <token>
```

## Scripts Disponíveis

- `yarn prisma:generate` - Gerar cliente Prisma
- `yarn prisma:push` - Aplicar schema ao banco (desenvolvimento)
- `yarn prisma:migrate` - Criar e aplicar migrações
- `yarn prisma:studio` - Abrir Prisma Studio
