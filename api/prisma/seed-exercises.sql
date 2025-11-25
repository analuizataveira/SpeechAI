-- ============================================
-- Script para popular o banco com exercícios
-- ============================================
-- 
-- IMPORTANTE: Execute estas queries na ordem apresentada
-- Substitua os IDs pelos IDs reais do seu banco de dados
--
-- 1. Primeiro, verifique os IDs existentes:
--    SELECT id, description FROM diff_types;
--    SELECT id FROM doctor_profile LIMIT 1;
--
-- 2. Depois, substitua os placeholders abaixo pelos IDs reais
-- ============================================

-- ============================================
-- 1. INSERIR TIPOS DE DIFICULDADE (DiffTypes)
-- ============================================
-- Se já existirem, você pode pular esta parte ou usar os IDs existentes

INSERT INTO diff_types (id, description, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'Dislalia - Troca de fonemas', NOW(), NOW()),
  (gen_random_uuid(), 'Dislalia - Omissão de fonemas', NOW(), NOW()),
  (gen_random_uuid(), 'Dislalia - Distorção de fonemas', NOW(), NOW()),
  (gen_random_uuid(), 'Gagueira', NOW(), NOW()),
  (gen_random_uuid(), 'Rótacismo (dificuldade com R)', NOW(), NOW()),
  (gen_random_uuid(), 'Sigmatismo (dificuldade com S)', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 2. INSERIR EXERCÍCIOS
-- ============================================
-- IMPORTANTE: Substitua 'SEU_DIFF_TYPE_ID_AQUI' pelos IDs reais dos diff_types acima

-- Exemplo: Exercícios para Rótacismo (R)
INSERT INTO exercises (id, diff_type_id, text, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  dt.id,
  palavra,
  NOW(),
  NOW()
FROM (VALUES 
  ('rato'),
  ('rato'),
  ('carro'),
  ('porta'),
  ('árvore'),
  ('barco'),
  ('carta'),
  ('tartaruga'),
  ('tigre'),
  ('prato')
) AS palavras(palavra)
CROSS JOIN diff_types dt
WHERE dt.description = 'Rótacismo (dificuldade com R)'
ON CONFLICT (id) DO NOTHING;

-- Exemplo: Exercícios para Sigmatismo (S)
INSERT INTO exercises (id, diff_type_id, text, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  dt.id,
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
CROSS JOIN diff_types dt
WHERE dt.description = 'Sigmatismo (dificuldade com S)'
ON CONFLICT (id) DO NOTHING;

-- Exemplo: Exercícios para Dislalia - Troca de fonemas
INSERT INTO exercises (id, diff_type_id, text, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  dt.id,
  palavra,
  NOW(),
  NOW()
FROM (VALUES 
  ('bola'),
  ('gato'),
  ('dado'),
  ('tigre'),
  ('pato'),
  ('casa'),
  ('faca'),
  ('vaca'),
  ('zebra'),
  ('chave')
) AS palavras(palavra)
CROSS JOIN diff_types dt
WHERE dt.description = 'Dislalia - Troca de fonemas'
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 3. INSERIR LISTA DE EXERCÍCIOS (ExerciseList)
-- ============================================
-- IMPORTANTE: Substitua 'SEU_DOCTOR_ID_AQUI' pelo ID real de um médico

INSERT INTO exercises_lists (id, doctor_id, diff_type_id, title, difficulty_level, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  dp.id,
  dt.id,
  'Exercícios de Pronúncia - Rótacismo',
  'iniciante',
  NOW(),
  NOW()
FROM doctor_profile dp
CROSS JOIN diff_types dt
WHERE dt.description = 'Rótacismo (dificuldade com R)'
LIMIT 1
ON CONFLICT (id) DO NOTHING;

INSERT INTO exercises_lists (id, doctor_id, diff_type_id, title, difficulty_level, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  dp.id,
  dt.id,
  'Exercícios de Pronúncia - Sigmatismo',
  'iniciante',
  NOW(),
  NOW()
FROM doctor_profile dp
CROSS JOIN diff_types dt
WHERE dt.description = 'Sigmatismo (dificuldade com S)'
LIMIT 1
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 4. INSERIR ITENS NAS LISTAS (ExerciseListItem)
-- ============================================
-- Adiciona exercícios de Rótacismo à lista correspondente

INSERT INTO exercises_lists_items (id, exercise_id, exercise_list_id, "order")
SELECT 
  gen_random_uuid(),
  e.id,
  el.id,
  ROW_NUMBER() OVER (ORDER BY e.text)
FROM exercises e
CROSS JOIN exercises_lists el
CROSS JOIN diff_types dt
WHERE e.diff_type_id = dt.id
  AND el.diff_type_id = dt.id
  AND dt.description = 'Rótacismo (dificuldade com R)'
  AND el.title = 'Exercícios de Pronúncia - Rótacismo'
ON CONFLICT (id) DO NOTHING;

-- Adiciona exercícios de Sigmatismo à lista correspondente

INSERT INTO exercises_lists_items (id, exercise_id, exercise_list_id, "order")
SELECT 
  gen_random_uuid(),
  e.id,
  el.id,
  ROW_NUMBER() OVER (ORDER BY e.text)
FROM exercises e
CROSS JOIN exercises_lists el
CROSS JOIN diff_types dt
WHERE e.diff_type_id = dt.id
  AND el.diff_type_id = dt.id
  AND dt.description = 'Sigmatismo (dificuldade com S)'
  AND el.title = 'Exercícios de Pronúncia - Sigmatismo'
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- VERIFICAÇÃO - Consultas para verificar os dados inseridos
-- ============================================

-- Ver todos os tipos de dificuldade
SELECT id, description FROM diff_types;

-- Ver todos os exercícios
SELECT e.id, e.text, dt.description as tipo_dificuldade
FROM exercises e
JOIN diff_types dt ON e.diff_type_id = dt.id
ORDER BY dt.description, e.text;

-- Ver todas as listas de exercícios
SELECT 
  el.id,
  el.title,
  el.difficulty_level,
  dt.description as tipo_dificuldade,
  dp.name as medico
FROM exercises_lists el
JOIN diff_types dt ON el.diff_type_id = dt.id
JOIN doctor_profile dp ON el.doctor_id = dp.id;

-- Ver itens de uma lista específica
SELECT 
  eli.id,
  eli."order",
  e.text as exercicio,
  el.title as lista
FROM exercises_lists_items eli
JOIN exercises e ON eli.exercise_id = e.id
JOIN exercises_lists el ON eli.exercise_list_id = el.id
ORDER BY el.title, eli."order";

