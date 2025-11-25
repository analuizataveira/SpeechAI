# Estrutura de Dados - Exercícios

## 📋 Visão Geral

Este documento explica a estrutura de dados relacionada a exercícios no banco de dados.

## 🗂️ Estrutura das Tabelas

### 1. `diff_types` (Tipos de Dificuldade)
Armazena os tipos de dificuldades de fala.

```sql
- id (UUID, PK)
- description (String) - Ex: "Rótacismo (dificuldade com R)"
- created_at (DateTime)
- updated_at (DateTime)
```

### 2. `exercises` (Exercícios)
Armazena os exercícios individuais (palavras para pronunciar).

```sql
- id (UUID, PK)
- diff_type_id (UUID, FK -> diff_types)
- text (String) - A palavra do exercício, ex: "rato", "carro"
- created_at (DateTime)
- updated_at (DateTime)
```

### 3. `exercises_lists` (Listas de Exercícios)
Armazena listas de exercícios criadas por médicos.

```sql
- id (UUID, PK)
- doctor_id (UUID, FK -> doctor_profile)
- diff_type_id (UUID, FK -> diff_types)
- title (String) - Ex: "Exercícios de Pronúncia - Rótacismo"
- difficulty_level (String) - Ex: "iniciante", "intermediário", "avançado"
- created_at (DateTime)
- updated_at (DateTime)
```

### 4. `exercises_lists_items` (Itens das Listas)
Relaciona exercícios com listas (tabela de junção).

```sql
- id (UUID, PK)
- exercise_id (UUID, FK -> exercises)
- exercise_list_id (UUID, FK -> exercises_lists)
- order (Integer, nullable) - Ordem do exercício na lista
```

## 🔗 Relacionamentos

```
diff_types (1) ──< (N) exercises
diff_types (1) ──< (N) exercises_lists
doctor_profile (1) ──< (N) exercises_lists
exercises (1) ──< (N) exercises_lists_items
exercises_lists (1) ──< (N) exercises_lists_items
```

## 📝 Como Popular o Banco

### Opção 1: Script Simplificado (Recomendado)
Use o arquivo `seed-exercises-simple.sql` que contém queries mais diretas.

### Opção 2: Script Completo
Use o arquivo `seed-exercises.sql` que contém queries mais complexas com JOINs.

### Passos para Executar:

1. **Conecte-se ao banco PostgreSQL:**
   ```bash
   psql -h localhost -U postgres -d speech_ai
   ```
   Ou use uma ferramenta gráfica como pgAdmin, DBeaver, etc.

2. **Execute o script SQL:**
   ```sql
   \i prisma/seed-exercises-simple.sql
   ```
   Ou copie e cole o conteúdo do arquivo no seu cliente SQL.

3. **Verifique os dados inseridos:**
   ```sql
   -- Ver tipos de dificuldade
   SELECT * FROM diff_types;
   
   -- Ver exercícios
   SELECT e.*, dt.description 
   FROM exercises e 
   JOIN diff_types dt ON e.diff_type_id = dt.id;
   
   -- Ver listas
   SELECT el.*, dt.description, dp.name as medico
   FROM exercises_lists el
   JOIN diff_types dt ON el.diff_type_id = dt.id
   JOIN doctor_profile dp ON el.doctor_id = dp.id;
   ```

## 📊 Exemplo de Dados

### Tipos de Dificuldade Comuns:
- Rótacismo (dificuldade com R)
- Sigmatismo (dificuldade com S)
- Dislalia - Troca de fonemas
- Dislalia - Omissão de fonemas
- Dislalia - Distorção de fonemas
- Gagueira

### Exemplos de Exercícios:

**Para Rótacismo:**
- rato, carro, porta, árvore, barco, carta, tartaruga, tigre, prato

**Para Sigmatismo:**
- sapo, sol, mesa, casa, rosa, sorriso, sorvete, sapato, sino, sombra

## ⚠️ Importante

- Certifique-se de que existe pelo menos um **médico** (`doctor_profile`) no banco antes de criar listas
- Os IDs são gerados automaticamente usando `gen_random_uuid()`
- As queries usam `ON CONFLICT DO NOTHING` para evitar erros se os dados já existirem
- A ordem dos exercícios nas listas é definida pelo campo `order` na tabela `exercises_lists_items`

## 🔍 Consultas Úteis

### Ver todos os exercícios de um tipo específico:
```sql
SELECT e.text, dt.description
FROM exercises e
JOIN diff_types dt ON e.diff_type_id = dt.id
WHERE dt.description = 'Rótacismo (dificuldade com R)';
```

### Ver exercícios de uma lista específica:
```sql
SELECT eli."order", e.text
FROM exercises_lists_items eli
JOIN exercises e ON eli.exercise_id = e.id
JOIN exercises_lists el ON eli.exercise_list_id = el.id
WHERE el.title = 'Exercícios de Pronúncia - Rótacismo'
ORDER BY eli."order";
```

### Contar exercícios por tipo:
```sql
SELECT dt.description, COUNT(e.id) as total
FROM diff_types dt
LEFT JOIN exercises e ON dt.id = e.diff_type_id
GROUP BY dt.id, dt.description;
```

