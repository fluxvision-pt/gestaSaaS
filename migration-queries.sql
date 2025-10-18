-- =========================
-- GESTA SAAS FINANCEIRO - QUERIES DE MIGRAÇÃO E MANUTENÇÃO
-- PostgreSQL - Scripts para migração, backup e manutenção
-- =========================

-- =========================
-- 1. VERIFICAÇÃO DE INTEGRIDADE
-- =========================

-- Verificar se todas as tabelas foram criadas
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Verificar índices criados
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Verificar triggers
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table;

-- =========================
-- 2. QUERIES DE BACKUP
-- =========================

-- Backup completo (estrutura + dados)
-- Execute via psql ou pg_dump:
-- pg_dump -h localhost -U postgres -d gestasaas > backup_completo.sql

-- Backup apenas da estrutura
-- pg_dump -h localhost -U postgres -d gestasaas --schema-only > backup_estrutura.sql

-- Backup apenas dos dados
-- pg_dump -h localhost -U postgres -d gestasaas --data-only > backup_dados.sql

-- =========================
-- 3. QUERIES DE LIMPEZA E MANUTENÇÃO
-- =========================

-- Limpar dados de teste (CUIDADO - USE APENAS EM DESENVOLVIMENTO)
DO $$
BEGIN
  -- Desabilitar triggers temporariamente
  SET session_replication_role = replica;
  
  -- Limpar dados em ordem de dependência
  DELETE FROM auditoria;
  DELETE FROM pagamentos;
  DELETE FROM credenciais_gateway;
  DELETE FROM gateways WHERE nome LIKE '%Teste%';
  DELETE FROM km_diario;
  DELETE FROM transacoes;
  DELETE FROM assinaturas;
  DELETE FROM plano_recursos;
  DELETE FROM recursos WHERE chave LIKE '%teste%';
  DELETE FROM planos WHERE nome LIKE '%Teste%';
  DELETE FROM usuarios WHERE email LIKE '%@teste.com';
  DELETE FROM tenants WHERE nome_fantasia LIKE '%Teste%';
  DELETE FROM configuracoes WHERE chave LIKE '%teste%';
  
  -- Reabilitar triggers
  SET session_replication_role = DEFAULT;
END $$;

-- Vacuum e analyze para otimização
VACUUM ANALYZE;

-- =========================
-- 4. QUERIES DE MONITORAMENTO
-- =========================

-- Verificar tamanho das tabelas
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Verificar número de registros por tabela
SELECT 
  'tenants' as tabela, COUNT(*) as registros FROM tenants
UNION ALL
SELECT 'usuarios', COUNT(*) FROM usuarios
UNION ALL
SELECT 'planos', COUNT(*) FROM planos
UNION ALL
SELECT 'recursos', COUNT(*) FROM recursos
UNION ALL
SELECT 'assinaturas', COUNT(*) FROM assinaturas
UNION ALL
SELECT 'transacoes', COUNT(*) FROM transacoes
UNION ALL
SELECT 'km_diario', COUNT(*) FROM km_diario
UNION ALL
SELECT 'pagamentos', COUNT(*) FROM pagamentos
UNION ALL
SELECT 'auditoria', COUNT(*) FROM auditoria
ORDER BY registros DESC;

-- Verificar conexões ativas
SELECT 
  pid,
  usename,
  application_name,
  client_addr,
  state,
  query_start,
  query
FROM pg_stat_activity 
WHERE datname = current_database()
AND state = 'active';

-- =========================
-- 5. QUERIES DE RELATÓRIOS ÚTEIS
-- =========================

-- Resumo de tenants ativos
SELECT 
  COUNT(*) as total_tenants,
  COUNT(CASE WHEN status = 'ativo' THEN 1 END) as tenants_ativos,
  COUNT(CASE WHEN status = 'suspenso' THEN 1 END) as tenants_suspensos,
  COUNT(CASE WHEN status = 'cancelado' THEN 1 END) as tenants_cancelados
FROM tenants;

-- Resumo de assinaturas por plano
SELECT 
  p.nome as plano,
  COUNT(a.id) as total_assinaturas,
  COUNT(CASE WHEN a.status = 'ativa' THEN 1 END) as assinaturas_ativas,
  SUM(CASE WHEN a.status = 'ativa' THEN a.preco_cents ELSE 0 END) as receita_mensal_cents
FROM planos p
LEFT JOIN assinaturas a ON p.id = a.plano_id
GROUP BY p.id, p.nome
ORDER BY total_assinaturas DESC;

-- Top 10 tenants por volume de transações
SELECT 
  t.nome_fantasia,
  COUNT(tr.id) as total_transacoes,
  SUM(CASE WHEN tr.tipo = 'entrada' THEN tr.valor_cents ELSE 0 END) as total_entradas_cents,
  SUM(CASE WHEN tr.tipo = 'saida' THEN tr.valor_cents ELSE 0 END) as total_saidas_cents
FROM tenants t
LEFT JOIN transacoes tr ON t.id = tr.tenant_id
WHERE t.status = 'ativo'
GROUP BY t.id, t.nome_fantasia
ORDER BY total_transacoes DESC
LIMIT 10;

-- Transações por categoria (últimos 30 dias)
SELECT 
  categoria,
  tipo,
  COUNT(*) as quantidade,
  SUM(valor_cents) as total_cents,
  AVG(valor_cents) as media_cents
FROM transacoes 
WHERE data >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY categoria, tipo
ORDER BY total_cents DESC;

-- =========================
-- 6. QUERIES DE MIGRAÇÃO DE DADOS
-- =========================

-- Migrar dados de sistema antigo (exemplo)
-- Ajuste conforme necessário para sua migração específica

-- Exemplo: Inserir tenant de migração
INSERT INTO tenants (
  id,
  nome_fantasia,
  razao_social,
  documento,
  email,
  telefone_e164,
  status
) VALUES (
  gen_random_uuid(),
  'Empresa Migrada',
  'Empresa Migrada LTDA',
  '12345678000199',
  'contato@empresamigrada.com',
  '+5511999999999',
  'ativo'
) ON CONFLICT DO NOTHING;

-- Exemplo: Migrar usuários
-- INSERT INTO usuarios (tenant_id, nome, email, telefone_e164, senha_hash, perfil)
-- SELECT 
--   (SELECT id FROM tenants WHERE nome_fantasia = 'Empresa Migrada'),
--   nome_antigo,
--   email_antigo,
--   telefone_antigo,
--   senha_hash_antigo,
--   'cliente_user'
-- FROM sistema_antigo.usuarios_antigos;

-- =========================
-- 7. QUERIES DE PERFORMANCE
-- =========================

-- Verificar queries lentas
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  rows
FROM pg_stat_statements 
WHERE query NOT LIKE '%pg_stat_statements%'
ORDER BY mean_time DESC
LIMIT 10;

-- Verificar índices não utilizados
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes 
WHERE idx_tup_read = 0 
AND idx_tup_fetch = 0
ORDER BY schemaname, tablename;

-- Verificar tabelas que precisam de VACUUM
SELECT 
  schemaname,
  tablename,
  n_dead_tup,
  n_live_tup,
  ROUND(n_dead_tup * 100.0 / GREATEST(n_live_tup + n_dead_tup, 1), 2) as dead_percentage
FROM pg_stat_user_tables 
WHERE n_dead_tup > 0
ORDER BY dead_percentage DESC;

-- =========================
-- 8. QUERIES DE SEGURANÇA
-- =========================

-- Verificar usuários do banco
SELECT 
  usename,
  usesuper,
  usecreatedb,
  usebypassrls,
  valuntil
FROM pg_user
ORDER BY usename;

-- Verificar permissões por tabela
SELECT 
  grantee,
  table_schema,
  table_name,
  privilege_type
FROM information_schema.role_table_grants 
WHERE table_schema = 'public'
ORDER BY table_name, grantee;

-- =========================
-- 9. QUERIES DE AUDITORIA
-- =========================

-- Últimas ações por usuário
SELECT 
  u.nome,
  u.email,
  a.acao,
  a.entidade,
  a.criado_em
FROM auditoria a
JOIN usuarios u ON a.usuario_id = u.id
ORDER BY a.criado_em DESC
LIMIT 50;

-- Ações suspeitas (múltiplos logins)
SELECT 
  usuario_id,
  COUNT(*) as tentativas_login,
  MIN(criado_em) as primeira_tentativa,
  MAX(criado_em) as ultima_tentativa
FROM auditoria 
WHERE acao = 'login'
AND criado_em >= CURRENT_DATE - INTERVAL '1 day'
GROUP BY usuario_id
HAVING COUNT(*) > 10
ORDER BY tentativas_login DESC;

-- =========================
-- 10. QUERIES DE TESTE
-- =========================

-- Verificar integridade referencial
DO $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN 
    SELECT conname, conrelid::regclass, confrelid::regclass
    FROM pg_constraint 
    WHERE contype = 'f'
  LOOP
    RAISE NOTICE 'Verificando FK: %', rec.conname;
  END LOOP;
END $$;

-- Testar triggers de atualização
UPDATE tenants 
SET nome_fantasia = nome_fantasia 
WHERE id = (SELECT id FROM tenants LIMIT 1);

-- Verificar se atualizado_em foi atualizado
SELECT 
  nome_fantasia,
  criado_em,
  atualizado_em,
  (atualizado_em > criado_em) as trigger_funcionando
FROM tenants 
LIMIT 5;

-- =========================
-- FIM DOS SCRIPTS DE MIGRAÇÃO
-- =========================