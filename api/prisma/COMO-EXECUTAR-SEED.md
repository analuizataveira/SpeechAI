# 🌱 Como Executar o Seed de Exercícios

Existem várias formas de executar o script SQL de seed. Escolha a que preferir:

## 📋 Pré-requisitos

Antes de executar, certifique-se de que:
- ✅ O banco de dados está rodando
- ✅ Você tem pelo menos um **médico** (`doctor_profile`) cadastrado no banco
- ✅ As migrações do Prisma foram executadas

## 🚀 Opção 1: Via psql (Linha de Comando)

### Se estiver usando Docker:
```bash
# Acesse o container do PostgreSQL
docker exec -it speech_ai_postgres psql -U postgres -d speech_ai

# Dentro do psql, execute:
\i /path/to/seed-exercises-simple.sql
```

### Se o PostgreSQL estiver instalado localmente:
```bash
# Conecte-se ao banco
psql -h localhost -U postgres -d speech_ai -p 5433

# Dentro do psql, execute:
\i prisma/seed-exercises-simple.sql
```

### Ou execute diretamente:
```bash
# Windows (PowerShell)
cd api
psql -h localhost -U postgres -d speech_ai -p 5433 -f prisma/seed-exercises-simple.sql

# Linux/Mac
cd api
psql -h localhost -U postgres -d speech_ai -p 5433 -f prisma/seed-exercises-simple.sql
```

## 🖥️ Opção 2: Via Cliente Gráfico (pgAdmin, DBeaver, etc)

1. Abra seu cliente SQL favorito (pgAdmin, DBeaver, TablePlus, etc)
2. Conecte-se ao banco:
   - **Host:** localhost
   - **Porta:** 5433 (se usando Docker) ou 5432 (se local)
   - **Database:** speech_ai
   - **User:** postgres
   - **Password:** postgres
3. Abra o arquivo `api/prisma/seed-exercises-simple.sql`
4. Copie todo o conteúdo
5. Cole no editor SQL do cliente
6. Execute o script (F5 ou botão "Execute")

## 🔧 Opção 3: Via Docker Exec (Recomendado)

```bash
# Navegue até a pasta do projeto
cd api

# Execute o script SQL diretamente no container
docker exec -i speech_ai_postgres psql -U postgres -d speech_ai < prisma/seed-exercises-simple.sql
```

## 📝 Opção 4: Criar Script NPM (Mais Conveniente)

Adicione este script ao `package.json`:

```json
"scripts": {
  "prisma:seed": "docker exec -i speech_ai_postgres psql -U postgres -d speech_ai < prisma/seed-exercises-simple.sql"
}
```

Depois execute:
```bash
yarn prisma:seed
```

## ✅ Verificar se Funcionou

Após executar o seed, verifique os dados:

```sql
-- Ver tipos de dificuldade criados
SELECT * FROM diff_types;

-- Ver exercícios criados
SELECT e.text, dt.description 
FROM exercises e 
JOIN diff_types dt ON e.diff_type_id = dt.id;

-- Ver listas criadas
SELECT el.title, dt.description, COUNT(eli.id) as total_exercicios
FROM exercises_lists el
JOIN diff_types dt ON el.diff_type_id = dt.id
LEFT JOIN exercises_lists_items eli ON el.id = eli.exercise_list_id
GROUP BY el.id, el.title, dt.description;
```

## ⚠️ Problemas Comuns

### Erro: "relation does not exist"
- **Solução:** Execute as migrações primeiro: `yarn prisma:migrate`

### Erro: "doctor_profile não encontrado"
- **Solução:** Crie um médico primeiro via API ou diretamente no banco:
  ```sql
  -- Primeiro crie um usuário
  INSERT INTO users (id, email, password_hash, role, created_at, updated_at)
  VALUES (gen_random_uuid(), 'medico@teste.com', '$2b$10$...', 'DOCTOR', NOW(), NOW());
  
  -- Depois crie o perfil do médico
  INSERT INTO doctor_profile (id, user_id, name, birth_date, phone, specialty, created_at, updated_at)
  SELECT gen_random_uuid(), u.id, 'Dr. Teste', '1990-01-01', '11999999999', 'Fonoaudiologia', NOW(), NOW()
  FROM users u WHERE u.email = 'medico@teste.com';
  ```

### Erro de permissão
- **Solução:** Verifique se o usuário `postgres` tem permissões no banco

## 🎯 Próximos Passos

Após executar o seed:
1. Verifique se os dados foram inseridos corretamente
2. Teste a API para listar exercícios
3. Crie uma sessão de exercício no frontend

