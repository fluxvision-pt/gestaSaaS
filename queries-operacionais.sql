-- =========================
-- GESTA SAAS FINANCEIRO - QUERIES OPERACIONAIS
-- Queries para operações do sistema
-- =========================

-- =========================
-- 1. AUTENTICAÇÃO E AUTORIZAÇÃO
-- =========================

-- Login de usuário
SELECT 
  u.id,
  u.tenant_id,
  u.nome,
  u.email,
  u.perfil,
  u.status,
  t.nome_fantasia as empresa,
  t.status as status_empresa
FROM usuarios u
INNER JOIN tenants t ON u.tenant_id = t.id
WHERE u.email = $1 
  AND u.status = 'ativo'
  AND t.status = 'ativo'
  AND verificar_senha($2, u.senha_hash) = true;

-- Verificar permissões do usuário
SELECT 
  u.perfil,
  CASE 
    WHEN u.perfil = 'super_admin' THEN true
    WHEN u.perfil = 'cliente_admin' AND u.tenant_id = $2 THEN true
    WHEN u.perfil = 'cliente_usuario' AND u.tenant_id = $2 THEN true
    ELSE false
  END as tem_acesso
FROM usuarios u
WHERE u.id = $1;

-- Atualizar último acesso
UPDATE usuarios 
SET ultimo_acesso = CURRENT_TIMESTAMP
WHERE id = $1;

-- =========================
-- 2. GESTÃO DE TENANTS
-- =========================

-- Listar tenants ativos
SELECT 
  id,
  nome_fantasia,
  razao_social,
  documento,
  email,
  telefone_e164,
  status,
  created_at,
  (SELECT COUNT(*) FROM usuarios WHERE tenant_id = t.id AND status = 'ativo') as total_usuarios,
  (SELECT COUNT(*) FROM assinaturas WHERE tenant_id = t.id AND status = 'ativa') as total_assinaturas
FROM tenants t
WHERE status = 'ativo'
ORDER BY nome_fantasia;

-- Buscar tenant por documento
SELECT *
FROM tenants
WHERE documento = $1;

-- Criar novo tenant
INSERT INTO tenants (
  nome_fantasia,
  razao_social,
  documento,
  email,
  telefone_e164,
  endereco_completo,
  status
) VALUES ($1, $2, $3, $4, $5, $6, 'ativo')
RETURNING id;

-- Atualizar tenant
UPDATE tenants 
SET 
  nome_fantasia = $2,
  razao_social = $3,
  email = $4,
  telefone_e164 = $5,
  endereco_completo = $6,
  updated_at = CURRENT_TIMESTAMP
WHERE id = $1;

-- =========================
-- 3. GESTÃO DE USUÁRIOS
-- =========================

-- Listar usuários de um tenant
SELECT 
  id,
  nome,
  email,
  telefone_e164,
  perfil,
  status,
  ultimo_acesso,
  created_at
FROM usuarios
WHERE tenant_id = $1
ORDER BY nome;

-- Criar novo usuário
INSERT INTO usuarios (
  tenant_id,
  nome,
  email,
  telefone_e164,
  senha_hash,
  perfil,
  status
) VALUES ($1, $2, $3, $4, gerar_senha_hash($5), $6, 'ativo')
RETURNING id;

-- Atualizar senha do usuário
UPDATE usuarios 
SET 
  senha_hash = gerar_senha_hash($2),
  updated_at = CURRENT_TIMESTAMP
WHERE id = $1;

-- Desativar usuário
UPDATE usuarios 
SET 
  status = 'inativo',
  updated_at = CURRENT_TIMESTAMP
WHERE id = $1;

-- =========================
-- 4. GESTÃO DE PLANOS E ASSINATURAS
-- =========================

-- Listar planos disponíveis
SELECT 
  p.id,
  p.nome,
  p.descricao,
  p.preco_mensal,
  p.preco_anual,
  p.status,
  array_agg(
    json_build_object(
      'recurso_id', r.id,
      'nome', r.nome,
      'limite', pr.limite_uso,
      'tipo_limite', r.tipo_limite
    )
  ) as recursos
FROM planos p
LEFT JOIN plano_recursos pr ON p.id = pr.plano_id
LEFT JOIN recursos r ON pr.recurso_id = r.id
WHERE p.status = 'ativo'
GROUP BY p.id, p.nome, p.descricao, p.preco_mensal, p.preco_anual, p.status
ORDER BY p.preco_mensal;

-- Buscar assinatura ativa do tenant
SELECT 
  a.id,
  a.plano_id,
  p.nome as plano_nome,
  a.data_inicio,
  a.data_fim,
  a.valor_mensal,
  a.status,
  a.auto_renovar
FROM assinaturas a
INNER JOIN planos p ON a.plano_id = p.id
WHERE a.tenant_id = $1 
  AND a.status = 'ativa'
  AND a.data_fim > CURRENT_DATE;

-- Criar nova assinatura
INSERT INTO assinaturas (
  tenant_id,
  plano_id,
  data_inicio,
  data_fim,
  valor_mensal,
  status,
  auto_renovar
) VALUES ($1, $2, $3, $4, $5, 'ativa', $6)
RETURNING id;

-- Verificar limite de uso de recurso
SELECT 
  pr.limite_uso,
  COALESCE(uso_atual.total, 0) as uso_atual,
  (pr.limite_uso - COALESCE(uso_atual.total, 0)) as disponivel
FROM assinaturas a
INNER JOIN plano_recursos pr ON a.plano_id = pr.plano_id
LEFT JOIN (
  -- Aqui você adaptaria conforme o tipo de recurso
  -- Exemplo para transações mensais:
  SELECT COUNT(*) as total
  FROM transacoes
  WHERE tenant_id = $1
    AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)
) uso_atual ON true
WHERE a.tenant_id = $1
  AND a.status = 'ativa'
  AND pr.recurso_id = $2;

-- =========================
-- 5. GESTÃO FINANCEIRA
-- =========================

-- Dashboard financeiro do tenant
SELECT 
  -- Receitas do mês atual
  COALESCE(SUM(CASE 
    WHEN tipo = 'receita' 
    AND DATE_TRUNC('month', data_transacao) = DATE_TRUNC('month', CURRENT_DATE)
    THEN valor 
    ELSE 0 
  END), 0) as receitas_mes_atual,
  
  -- Despesas do mês atual
  COALESCE(SUM(CASE 
    WHEN tipo = 'despesa' 
    AND DATE_TRUNC('month', data_transacao) = DATE_TRUNC('month', CURRENT_DATE)
    THEN valor 
    ELSE 0 
  END), 0) as despesas_mes_atual,
  
  -- Saldo do mês atual
  COALESCE(SUM(CASE 
    WHEN DATE_TRUNC('month', data_transacao) = DATE_TRUNC('month', CURRENT_DATE)
    THEN CASE WHEN tipo = 'receita' THEN valor ELSE -valor END
    ELSE 0 
  END), 0) as saldo_mes_atual,
  
  -- Total de transações do mês
  COUNT(CASE 
    WHEN DATE_TRUNC('month', data_transacao) = DATE_TRUNC('month', CURRENT_DATE)
    THEN 1 
  END) as total_transacoes_mes,
  
  -- Receitas do mês anterior
  COALESCE(SUM(CASE 
    WHEN tipo = 'receita' 
    AND DATE_TRUNC('month', data_transacao) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
    THEN valor 
    ELSE 0 
  END), 0) as receitas_mes_anterior
  
FROM transacoes
WHERE tenant_id = $1
  AND status = 'confirmada';

-- Listar transações com filtros
SELECT 
  t.id,
  t.descricao,
  t.tipo,
  t.categoria,
  t.valor,
  t.data_transacao,
  t.status,
  t.observacoes,
  t.created_at,
  p.nome as gateway_nome
FROM transacoes t
LEFT JOIN pagamentos pg ON t.pagamento_id = pg.id
LEFT JOIN gateways g ON pg.gateway_id = g.id
WHERE t.tenant_id = $1
  AND ($2 IS NULL OR t.tipo = $2)
  AND ($3 IS NULL OR t.categoria = $3)
  AND ($4 IS NULL OR t.status = $4)
  AND ($5 IS NULL OR t.data_transacao >= $5)
  AND ($6 IS NULL OR t.data_transacao <= $6)
ORDER BY t.data_transacao DESC, t.created_at DESC
LIMIT $7 OFFSET $8;

-- Criar nova transação
INSERT INTO transacoes (
  tenant_id,
  descricao,
  tipo,
  categoria,
  valor,
  data_transacao,
  status,
  observacoes,
  metadados
) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
RETURNING id;

-- Atualizar status da transação
UPDATE transacoes 
SET 
  status = $2,
  updated_at = CURRENT_TIMESTAMP
WHERE id = $1 AND tenant_id = $3;

-- Relatório mensal por categoria
SELECT 
  categoria,
  tipo,
  COUNT(*) as quantidade,
  SUM(valor) as total,
  AVG(valor) as media
FROM transacoes
WHERE tenant_id = $1
  AND DATE_TRUNC('month', data_transacao) = DATE_TRUNC('month', $2::DATE)
  AND status = 'confirmada'
GROUP BY categoria, tipo
ORDER BY tipo, total DESC;

-- =========================
-- 6. CONTROLE DE KM DIÁRIO
-- =========================

-- Registrar KM do dia
INSERT INTO km_diario (
  tenant_id,
  data_registro,
  km_inicial,
  km_final,
  km_percorrido,
  observacoes
) VALUES ($1, $2, $3, $4, ($4 - $3), $5)
ON CONFLICT (tenant_id, data_registro) 
DO UPDATE SET
  km_inicial = EXCLUDED.km_inicial,
  km_final = EXCLUDED.km_final,
  km_percorrido = EXCLUDED.km_percorrido,
  observacoes = EXCLUDED.observacoes,
  updated_at = CURRENT_TIMESTAMP
RETURNING id;

-- Buscar registros de KM por período
SELECT 
  data_registro,
  km_inicial,
  km_final,
  km_percorrido,
  observacoes,
  created_at
FROM km_diario
WHERE tenant_id = $1
  AND data_registro BETWEEN $2 AND $3
ORDER BY data_registro DESC;

-- Relatório mensal de KM
SELECT 
  DATE_TRUNC('month', data_registro) as mes,
  COUNT(*) as dias_registrados,
  SUM(km_percorrido) as total_km,
  AVG(km_percorrido) as media_diaria,
  MIN(km_percorrido) as menor_km,
  MAX(km_percorrido) as maior_km
FROM km_diario
WHERE tenant_id = $1
  AND data_registro >= DATE_TRUNC('year', CURRENT_DATE)
GROUP BY DATE_TRUNC('month', data_registro)
ORDER BY mes DESC;

-- =========================
-- 7. CONFIGURAÇÕES DO SISTEMA
-- =========================

-- Buscar configuração específica
SELECT valor
FROM configuracoes
WHERE chave = $1
  AND (tenant_id = $2 OR tenant_id IS NULL)
ORDER BY tenant_id NULLS LAST
LIMIT 1;

-- Salvar configuração do tenant
INSERT INTO configuracoes (tenant_id, chave, valor, descricao)
VALUES ($1, $2, $3, $4)
ON CONFLICT (tenant_id, chave)
DO UPDATE SET
  valor = EXCLUDED.valor,
  descricao = EXCLUDED.descricao,
  updated_at = CURRENT_TIMESTAMP;

-- Listar todas as configurações do tenant
SELECT 
  chave,
  valor,
  descricao,
  updated_at
FROM configuracoes
WHERE tenant_id = $1 OR tenant_id IS NULL
ORDER BY tenant_id NULLS LAST, chave;

-- =========================
-- 8. AUDITORIA E LOGS
-- =========================

-- Registrar ação de auditoria
INSERT INTO auditoria (
  tenant_id,
  usuario_id,
  acao,
  tabela_afetada,
  registro_id,
  dados_anteriores,
  dados_novos,
  ip_origem,
  user_agent
) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);

-- Buscar logs de auditoria
SELECT 
  a.id,
  a.acao,
  a.tabela_afetada,
  a.registro_id,
  a.timestamp,
  a.ip_origem,
  u.nome as usuario_nome,
  u.email as usuario_email
FROM auditoria a
LEFT JOIN usuarios u ON a.usuario_id = u.id
WHERE a.tenant_id = $1
  AND ($2 IS NULL OR a.usuario_id = $2)
  AND ($3 IS NULL OR a.tabela_afetada = $3)
  AND ($4 IS NULL OR a.timestamp >= $4)
  AND ($5 IS NULL OR a.timestamp <= $5)
ORDER BY a.timestamp DESC
LIMIT $6 OFFSET $7;

-- =========================
-- 9. RELATÓRIOS E ESTATÍSTICAS
-- =========================

-- Evolução mensal de receitas/despesas
SELECT 
  DATE_TRUNC('month', data_transacao) as mes,
  tipo,
  COUNT(*) as quantidade,
  SUM(valor) as total
FROM transacoes
WHERE tenant_id = $1
  AND status = 'confirmada'
  AND data_transacao >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '12 months')
GROUP BY DATE_TRUNC('month', data_transacao), tipo
ORDER BY mes, tipo;

-- Top categorias por valor
SELECT 
  categoria,
  tipo,
  COUNT(*) as quantidade,
  SUM(valor) as total,
  ROUND(AVG(valor), 2) as media
FROM transacoes
WHERE tenant_id = $1
  AND status = 'confirmada'
  AND data_transacao >= $2
  AND data_transacao <= $3
GROUP BY categoria, tipo
ORDER BY total DESC
LIMIT 10;

-- Estatísticas gerais do tenant
SELECT 
  (SELECT COUNT(*) FROM usuarios WHERE tenant_id = $1 AND status = 'ativo') as usuarios_ativos,
  (SELECT COUNT(*) FROM transacoes WHERE tenant_id = $1) as total_transacoes,
  (SELECT SUM(valor) FROM transacoes WHERE tenant_id = $1 AND tipo = 'receita' AND status = 'confirmada') as total_receitas,
  (SELECT SUM(valor) FROM transacoes WHERE tenant_id = $1 AND tipo = 'despesa' AND status = 'confirmada') as total_despesas,
  (SELECT COUNT(DISTINCT data_registro) FROM km_diario WHERE tenant_id = $1) as dias_km_registrados,
  (SELECT SUM(km_percorrido) FROM km_diario WHERE tenant_id = $1) as total_km_percorrido;

-- =========================
-- 10. QUERIES DE MANUTENÇÃO
-- =========================

-- Limpar logs antigos de auditoria (manter últimos 6 meses)
DELETE FROM auditoria 
WHERE timestamp < CURRENT_DATE - INTERVAL '6 months';

-- Atualizar estatísticas das tabelas
ANALYZE tenants;
ANALYZE usuarios;
ANALYZE transacoes;
ANALYZE km_diario;
ANALYZE auditoria;

-- Verificar integridade dos dados
SELECT 
  'Tenants sem usuários' as problema,
  COUNT(*) as quantidade
FROM tenants t
LEFT JOIN usuarios u ON t.id = u.tenant_id
WHERE u.id IS NULL AND t.status = 'ativo'

UNION ALL

SELECT 
  'Usuários sem tenant' as problema,
  COUNT(*) as quantidade
FROM usuarios u
LEFT JOIN tenants t ON u.tenant_id = t.id
WHERE t.id IS NULL

UNION ALL

SELECT 
  'Transações sem tenant' as problema,
  COUNT(*) as quantidade
FROM transacoes tr
LEFT JOIN tenants t ON tr.tenant_id = t.id
WHERE t.id IS NULL;

-- =========================
-- FIM DAS QUERIES OPERACIONAIS
-- =========================