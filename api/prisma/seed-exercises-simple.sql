-- ============================================
-- Script SIMPLIFICADO para popular exercícios
-- Execute estas queries na ordem apresentada
-- ============================================

-- PASSO 1: Verificar IDs existentes (execute primeiro para pegar os IDs)
-- ============================================
-- SELECT id, description FROM diff_types;
-- SELECT id, name FROM doctor_profile;
-- SELECT id, text FROM exercises;

-- PASSO 2: Inserir Tipos de Dificuldade (se ainda não existirem)
-- ============================================
INSERT INTO diff_types (id, description, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'Rótacismo (dificuldade com R)', NOW(), NOW()),
  (gen_random_uuid(), 'Sigmatismo (dificuldade com S)', NOW(), NOW()),
  (gen_random_uuid(), 'Dislalia - Troca de fonemas', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- PASSO 3: Pegar o ID do tipo de dificuldade que você quer usar
-- ============================================
-- Exemplo: Se você quer usar "Rótacismo", execute:
-- SELECT id FROM diff_types WHERE description = 'Rótacismo (dificuldade com R)';
-- Copie o ID retornado e use nas queries abaixo

-- PASSO 4: Inserir Exercícios (substitua 'DIFF_TYPE_ID_AQUI' pelo ID real)
-- ============================================
-- Exemplo para Rótacismo:
INSERT INTO exercises (id, diff_type_id, text, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  (SELECT id FROM diff_types WHERE description = 'Rótacismo (dificuldade com R)' LIMIT 1),
  palavra,
  NOW(),
  NOW()
FROM (VALUES 
  ('rato'),
  ('carro'),
  ('porta'),
  ('árvore'),
  ('barco'),
  ('carta'),
  ('tartaruga'),
  ('tigre'),
  ('prato'),
  ('corrida')
) AS palavras(palavra)
ON CONFLICT (id) DO NOTHING;

-- Exemplo para Sigmatismo:
INSERT INTO exercises (id, diff_type_id, text, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  (SELECT id FROM diff_types WHERE description = 'Sigmatismo (dificuldade com S)' LIMIT 1),
  palavra,
  NOW(),
  NOW()
FROM (VALUES 
  ('sapo'),
  ('sol'),
  ('mesa'),
  ('casa'),
  ('rosa'),
  ('sorriso'),
  ('sorvete'),
  ('sapato'),
  ('sino'),
  ('sombra')
) AS palavras(palavra)
ON CONFLICT (id) DO NOTHING;

-- PASSO 5: Pegar o ID de um médico (doctor_profile)
-- ============================================
-- SELECT id, name FROM doctor_profile LIMIT 1;
-- Copie o ID retornado

-- PASSO 6: Criar Lista de Exercícios (substitua 'DOCTOR_ID_AQUI' pelo ID real)
-- ============================================
-- Lista para Rótacismo
INSERT INTO exercises_lists (id, doctor_id, diff_type_id, title, difficulty_level, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  (SELECT id FROM doctor_profile LIMIT 1), -- Use o ID do médico
  (SELECT id FROM diff_types WHERE description = 'Rótacismo (dificuldade com R)' LIMIT 1),
  'Exercícios de Pronúncia - Rótacismo',
  'iniciante',
  NOW(),
  NOW()
ON CONFLICT (id) DO NOTHING;

-- Lista para Sigmatismo
INSERT INTO exercises_lists (id, doctor_id, diff_type_id, title, difficulty_level, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  (SELECT id FROM doctor_profile LIMIT 1), -- Use o ID do médico
  (SELECT id FROM diff_types WHERE description = 'Sigmatismo (dificuldade com S)' LIMIT 1),
  'Exercícios de Pronúncia - Sigmatismo',
  'iniciante',
  NOW(),
  NOW()
ON CONFLICT (id) DO NOTHING;

-- PASSO 7: Adicionar Exercícios às Listas
-- ============================================
-- Adiciona exercícios de Rótacismo à lista
INSERT INTO exercises_lists_items (id, exercise_id, exercise_list_id, "order")
SELECT 
  gen_random_uuid(),
  e.id,
  el.id,
  ROW_NUMBER() OVER (ORDER BY e.text)
FROM exercises e
CROSS JOIN exercises_lists el
WHERE e.diff_type_id = (SELECT id FROM diff_types WHERE description = 'Rótacismo (dificuldade com R)' LIMIT 1)
  AND el.title = 'Exercícios de Pronúncia - Rótacismo'
ON CONFLICT (id) DO NOTHING;

-- Adiciona exercícios de Sigmatismo à lista
INSERT INTO exercises_lists_items (id, exercise_id, exercise_list_id, "order")
SELECT 
  gen_random_uuid(),
  e.id,
  el.id,
  ROW_NUMBER() OVER (ORDER BY e.text)
FROM exercises e
CROSS JOIN exercises_lists el
WHERE e.diff_type_id = (SELECT id FROM diff_types WHERE description = 'Sigmatismo (dificuldade com S)' LIMIT 1)
  AND el.title = 'Exercícios de Pronúncia - Sigmatismo'
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- CONSULTAS DE VERIFICAÇÃO
-- ============================================

-- Ver todos os exercícios criados
SELECT 
  e.id,
  e.text,
  dt.description as tipo
FROM exercises e
JOIN diff_types dt ON e.diff_type_id = dt.id
ORDER BY dt.description, e.text;

-- Ver todas as listas criadas
SELECT 
  el.id,
  el.title,
  el.difficulty_level,
  dt.description as tipo,
  COUNT(eli.id) as total_exercicios
FROM exercises_lists el
JOIN diff_types dt ON el.diff_type_id = dt.id
LEFT JOIN exercises_lists_items eli ON el.id = eli.exercise_list_id
GROUP BY el.id, el.title, el.difficulty_level, dt.description;

-- Ver exercícios de uma lista específica
SELECT 
  eli."order",
  e.text as exercicio
FROM exercises_lists_items eli
JOIN exercises e ON eli.exercise_id = e.id
JOIN exercises_lists el ON eli.exercise_list_id = el.id
WHERE el.title = 'Exercícios de Pronúncia - Rótacismo'
ORDER BY eli."order";

