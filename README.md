# 🎤 SpeechAI

Sistema inteligente de assistência à fala desenvolvido para auxiliar pacientes com dificuldades de pronúncia através de exercícios personalizados e análise de fala com IA.

## 📋 Sobre o Projeto

O **SpeechAI** é uma aplicação web completa que permite a criação e execução de exercícios de fala personalizados para pacientes com dificuldades de pronúncia. O sistema utiliza tecnologias de IA (Whisper) para transcrever e analisar a pronúncia, oferecendo feedback em tempo real e acompanhamento do progresso.

### Principais Funcionalidades

- 🧠 **Análise com IA**: Avaliação inteligente da pronúncia usando Whisper e análise fonética avançada
- 👥 **Testes Personalizados**: Seleção dinâmica de palavras baseada na idade e tipo de dificuldade do paciente
- 📊 **Acompanhamento de Progresso**: Monitoramento detalhado da evolução com métricas e histórico de sessões
- 🏥 **Gestão de Pacientes**: Médicos podem criar listas de exercícios e acompanhar seus pacientes
- 📈 **Relatórios e Estatísticas**: Visualização de desempenho e progresso ao longo do tempo
- 🔐 **Sistema de Autenticação**: Controle de acesso baseado em roles (Admin, Médico, Paciente)

## 🛠️ Tecnologias Utilizadas

### Backend
- **NestJS** - Framework Node.js para construção de APIs escaláveis
- **Prisma** - ORM moderno para gerenciamento de banco de dados
- **PostgreSQL** - Banco de dados relacional
- **JWT** - Autenticação e autorização
- **Swagger** - Documentação automática da API
- **TypeScript** - Tipagem estática

### Frontend
- **React 19** - Biblioteca para construção de interfaces
- **Vite** - Build tool e dev server
- **TypeScript** - Tipagem estática
- **React Router** - Roteamento
- **TailwindCSS** - Framework CSS utilitário
- **Radix UI** - Componentes acessíveis
- **Axios** - Cliente HTTP
- **React Hook Form** - Gerenciamento de formulários
- **Zustand** - Gerenciamento de estado

### Integrações
- **OpenAI Whisper** - Transcrição de áudio para texto
- **n8n** - Automação de workflows (análise de pronúncia)

## 📁 Estrutura do Projeto

```
SpeechAI/
├── api/                    # Backend NestJS
│   ├── src/
│   │   ├── config/         # Configurações e variáveis de ambiente
│   │   ├── framework/      # Guards, decorators, strategies
│   │   ├── providers/      # Serviços externos (Prisma, etc)
│   │   └── resources/      # Módulos da aplicação
│   │       ├── auth/       # Autenticação e autorização
│   │       ├── users/      # Gerenciamento de usuários
│   │       ├── exercises/  # Exercícios de fala
│   │       ├── sessions/   # Sessões de exercícios
│   │       ├── transcription/ # Transcrição de áudio
│   │       └── ...
│   ├── prisma/             # Schema e migrações do banco
│   └── docker-compose.yml  # Configuração Docker
│
└── web/                    # Frontend React
    ├── src/
    │   ├── data/           # Repositórios e providers
    │   ├── domain/         # Tipos e constantes
    │   ├── hooks/          # Custom hooks React
    │   ├── presentation/   # Componentes e páginas
    │   ├── router/         # Configuração de rotas
    │   └── utils/          # Utilitários
    └── public/             # Arquivos estáticos
```

## 🚀 Pré-requisitos

Antes de começar, você precisa ter instalado:

- **Node.js** (v18 ou superior)
- **Yarn** ou **npm**
- **PostgreSQL** (v15 ou superior) ou **Docker** e **Docker Compose**
- **Git**

## 📦 Instalação

### 1. Clone o repositório

```bash
git clone <url-do-repositorio>
cd SpeechAI
```

### 2. Configure o Backend

```bash
cd api

# Instale as dependências
yarn install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

**Variáveis de ambiente necessárias (`api/.env`):**

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

### 3. Configure o Banco de Dados

**Opção 1: Usando Docker Compose (Recomendado)**

```bash
cd api
docker-compose up -d
```

**Opção 2: PostgreSQL Local**

Certifique-se de que o PostgreSQL está rodando e crie o banco de dados:

```sql
CREATE DATABASE speech_ai;
```

### 4. Execute as Migrações

```bash
cd api

# Gere o cliente Prisma
yarn prisma:generate

# Execute as migrações
yarn prisma:migrate

# (Opcional) Popule o banco com dados iniciais
# Veja api/prisma/README-EXERCISES.md para mais detalhes
```

### 5. Configure o Frontend

```bash
cd web

# Instale as dependências
yarn install

# Configure as variáveis de ambiente (se necessário)
# O frontend se conecta à API em http://localhost:3000 por padrão
```

## ▶️ Como Executar

### Desenvolvimento

**Terminal 1 - Backend:**

```bash
cd api
yarn start:dev
```

A API estará disponível em `http://localhost:3000`
A documentação Swagger estará em `http://localhost:3000/api`

**Terminal 2 - Frontend:**

```bash
cd web
yarn dev
```

O frontend estará disponível em `http://localhost:5173`

### Produção

**Backend:**

```bash
cd api
yarn build
yarn start:prod
```

**Frontend:**

```bash
cd web
yarn build
yarn preview
```

## 👥 Roles e Permissões

O sistema possui três tipos de usuários:

### 🔴 Admin
- Acesso completo ao sistema
- Gerenciamento de todos os recursos
- Visualização de todas as sessões e usuários

### 👨‍⚕️ Doctor (Médico)
- Criar e gerenciar listas de exercícios
- Vincular pacientes
- Visualizar sessões e progresso dos pacientes vinculados
- Criar exercícios personalizados

### 👤 Patient (Paciente)
- Realizar exercícios de fala
- Visualizar histórico de sessões
- Acompanhar próprio progresso
- Ver resultados e feedback das sessões

## 📡 Principais Endpoints da API

### Autenticação
- `POST /auth/login` - Login de usuário
- `POST /auth/register` - Registro de novo usuário

### Usuários
- `GET /users` - Listar usuários (Admin/Doctor)
- `GET /users/me` - Obter dados do usuário autenticado
- `PATCH /users/me` - Atualizar perfil

### Exercícios
- `GET /exercises` - Listar exercícios
- `POST /exercises` - Criar exercício (Doctor/Admin)
- `GET /exercise-lists` - Listar listas de exercícios
- `POST /exercise-lists` - Criar lista de exercícios (Doctor/Admin)

### Sessões
- `POST /sessions` - Criar nova sessão (Patient)
- `GET /sessions/my-sessions` - Obter minhas sessões (Patient)
- `GET /sessions/patient/:patientId` - Sessões de um paciente (Doctor/Admin)
- `PATCH /sessions/:id` - Atualizar sessão
- `POST /sessions/webhook/complete/:id` - Finalizar sessão (Webhook n8n)

### Transcrição
- `POST /transcription/transcribe` - Transcrever áudio

### Dificuldades
- `GET /difficulties/my-difficulties` - Minhas dificuldades (Patient)
- `POST /difficulties` - Criar dificuldade

📚 **Documentação completa**: Acesse `http://localhost:3000/api` quando a API estiver rodando para ver a documentação Swagger interativa.

## 🗄️ Banco de Dados

### Principais Entidades

- **User**: Usuários do sistema (Admin, Doctor, Patient)
- **DoctorProfile**: Perfil específico de médicos
- **PatientProfile**: Perfil específico de pacientes
- **DiffType**: Tipos de dificuldades de fala (ex: R, S, L)
- **Difficulty**: Dificuldades associadas a pacientes
- **Exercise**: Exercícios individuais de fala
- **ExerciseList**: Listas de exercícios criadas por médicos
- **Session**: Sessões de exercícios realizadas por pacientes
- **UserDoctor**: Relacionamento entre médicos e pacientes

### Visualizar o Banco de Dados

```bash
cd api
yarn prisma:studio
```

Isso abrirá o Prisma Studio em `http://localhost:5555` para visualizar e editar dados.

## 🔄 Fluxo de Uso

1. **Registro/Login**: Usuário se registra ou faz login no sistema
2. **Criação de Exercícios** (Médico): Médico cria listas de exercícios personalizadas
3. **Início de Sessão** (Paciente): Paciente seleciona uma lista de exercícios
4. **Execução**: Paciente pronuncia palavras enquanto o sistema grava o áudio
5. **Análise**: Áudio é transcrito e analisado via n8n/Whisper
6. **Feedback**: Sistema fornece feedback sobre a pronúncia
7. **Resultados**: Paciente visualiza resultados e progresso

## 🧪 Testes

### Backend

```bash
cd api

# Testes unitários
yarn test

# Testes com cobertura
yarn test:cov

# Testes e2e
yarn test:e2e
```

### Frontend

```bash
cd web
yarn test
```

## 📝 Scripts Úteis

### Backend

```bash
yarn start:dev      # Inicia em modo desenvolvimento
yarn build          # Compila para produção
yarn lint           # Executa o linter
yarn prisma:generate # Gera cliente Prisma
yarn prisma:migrate  # Executa migrações
yarn prisma:studio   # Abre Prisma Studio
```

### Frontend

```bash
yarn dev            # Inicia servidor de desenvolvimento
yarn build          # Compila para produção
yarn preview        # Preview da build de produção
yarn lint           # Executa o linter
```

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto foi desenvolvido para a disciplina **C317** do Inatel.

## 👨‍💻 Desenvolvedores

- Equipe do projeto SpeechAI

## 📞 Suporte

Para dúvidas ou problemas, abra uma issue no repositório.

---

**Desenvolvido com ❤️ para auxiliar na reabilitação da fala**
