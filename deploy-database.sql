-- =========================
-- GESTA SAAS FINANCEIRO - DEPLOY QUERIES
-- PostgreSQL - Queries para criação e inicialização do banco
-- =========================

-- Extensões úteis
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================
-- TENANCY E USUÁRIOS
-- =========================
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_fantasia TEXT NOT NULL,
  razao_social TEXT,
  documento TEXT,               -- CPF/CNPJ opcional
  email TEXT,
  telefone_e164 TEXT,           -- recomendado (contato), NÃO obrigatório
  cod_pais CHAR(2) NOT NULL DEFAULT 'BR',     -- ISO 3166-1 alpha-2 (ex.: BR, PT)
  idioma_preferido TEXT NOT NULL DEFAULT 'pt-BR', -- IETF (pt-BR, pt-PT, en-US)
  moeda_preferida CHAR(3) NOT NULL DEFAULT 'BRL', -- ISO 4217 (BRL, EUR, USD)
  status TEXT NOT NULL DEFAULT 'ativo',       -- ativo, suspenso, cancelado
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_tenants_status ON tenants(status);

CREATE TABLE usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone_e164 TEXT NOT NULL,   -- OBRIGATÓRIO (n8n/WhatsApp identifica usuário por aqui)
  senha_hash TEXT NOT NULL,
  perfil TEXT NOT NULL DEFAULT 'cliente_user', -- super_admin, cliente_admin, cliente_user
  idioma_preferido TEXT,          -- override do tenant (opcional)
  moeda_preferida CHAR(3),        -- override (opcional)
  cod_pais CHAR(2),               -- override (opcional)
  status TEXT NOT NULL DEFAULT 'ativo',
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, email),
  UNIQUE (tenant_id, telefone_e164)
);
CREATE INDEX idx_usuarios_tenant ON usuarios(tenant_id);
CREATE INDEX idx_usuarios_perfil ON usuarios(perfil);

-- =========================
-- PLANOS, RECURSOS E ASSINATURAS
-- =========================
CREATE TABLE planos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,                        -- Teste Grátis, Gestão Básica, Gestão Premium
  status TEXT NOT NULL DEFAULT 'ativo',      -- ativo, inativo
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE recursos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chave TEXT NOT NULL,                       -- ex.: dashboard_basico, grafico_periodo, export_csv, relatorio_avancado, kpi_custo_km
  descricao TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'boolean',      -- boolean | int | text
  UNIQUE (chave)
);

CREATE TABLE plano_recursos (
  plano_id UUID NOT NULL REFERENCES planos(id) ON DELETE CASCADE,
  recurso_id UUID NOT NULL REFERENCES recursos(id) ON DELETE CASCADE,
  valor_texto TEXT,                          -- "true"/"false" ou números/textos conforme tipo
  PRIMARY KEY (plano_id, recurso_id)
);

CREATE TABLE assinaturas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  plano_id UUID NOT NULL REFERENCES planos(id),
  ciclo TEXT NOT NULL DEFAULT 'mensal',      -- mensal | trimestral | semestral | anual
  preco_cents INTEGER NOT NULL DEFAULT 0,
  moeda CHAR(3) NOT NULL DEFAULT 'BRL',
  status TEXT NOT NULL DEFAULT 'ativa',      -- ativa, pendente, expirada, cancelada
  status_pagamento TEXT NOT NULL DEFAULT 'pendente', -- pendente, pago, falhou
  inicio_em DATE NOT NULL DEFAULT CURRENT_DATE,
  fim_em DATE,
  renovacao_automatica BOOLEAN NOT NULL DEFAULT TRUE,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_assinaturas_tenant ON assinaturas(tenant_id);
CREATE INDEX idx_assinaturas_status ON assinaturas(status);

-- =========================
-- GATEWAYS E PAGAMENTOS
-- =========================
CREATE TABLE gateways (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,                         -- Stripe, PayPal, MercadoPago, Pix, MBWay, Transferencia
  tipo TEXT NOT NULL,                         -- online, offline
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE credenciais_gateway (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gateway_id UUID NOT NULL REFERENCES gateways(id) ON DELETE CASCADE,
  chave TEXT NOT NULL,                        -- ex.: public_key, secret_key, merchant_id, webhook_url
  valor TEXT NOT NULL,                        -- armazenado cifrado no app
  UNIQUE (gateway_id, chave)
);

CREATE TABLE pagamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assinatura_id UUID NOT NULL REFERENCES assinaturas(id) ON DELETE CASCADE,
  gateway_id UUID REFERENCES gateways(id),
  valor_cents INTEGER NOT NULL,
  moeda CHAR(3) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente',    -- pendente, aprovado, falhou, estornado
  referencia_externa TEXT,                    -- id externo (n8n/checkout)
  comprovante_url TEXT,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_pagamentos_assinatura ON pagamentos(assinatura_id);
CREATE INDEX idx_pagamentos_status ON pagamentos(status);

-- =========================
-- FINANCEIRO E KM DIÁRIO
-- =========================
CREATE TABLE transacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  usuario_id UUID REFERENCES usuarios(id),
  tipo TEXT NOT NULL,                         -- entrada, saida
  categoria TEXT NOT NULL,                    -- combustivel, manutencao, taxas, pedagio, plataforma, gorjeta...
  descricao TEXT,
  valor_cents INTEGER NOT NULL,
  km NUMERIC(10,2),                           -- opcional por transação
  data DATE NOT NULL,
  origem TEXT NOT NULL DEFAULT 'web',         -- web, api, importacao
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_transacoes_tenant_data ON transacoes(tenant_id, data);
CREATE INDEX idx_transacoes_tipo ON transacoes(tipo);
CREATE INDEX idx_transacoes_categoria ON transacoes(categoria);

CREATE TABLE km_diario (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  usuario_id UUID REFERENCES usuarios(id),
  data DATE NOT NULL,
  km_inicio NUMERIC(10,2),
  km_fim NUMERIC(10,2),
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, data)
);
CREATE INDEX idx_km_diario_tenant_data ON km_diario(tenant_id, data);

-- =========================
-- CONFIGURAÇÕES E AUDITORIA
-- =========================
CREATE TABLE configuracoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE, -- null = global
  chave TEXT NOT NULL,                                     -- ex.: timezone, formato_data
  valor TEXT NOT NULL,
  UNIQUE (tenant_id, chave)
);

CREATE TABLE auditoria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID,
  usuario_id UUID,
  acao TEXT NOT NULL,                                      -- ex.: criar_transacao, login, alterar_plano
  entidade TEXT,                                           -- ex.: transacoes
  entidade_id UUID,
  ip TEXT,
  user_agent TEXT,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_auditoria_tenant ON auditoria(tenant_id);

-- =========================
-- TRIGGERS PARA ATUALIZAÇÃO AUTOMÁTICA
-- =========================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger em todas as tabelas com atualizado_em
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_planos_updated_at BEFORE UPDATE ON planos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assinaturas_updated_at BEFORE UPDATE ON assinaturas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_gateways_updated_at BEFORE UPDATE ON gateways FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pagamentos_updated_at BEFORE UPDATE ON pagamentos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transacoes_updated_at BEFORE UPDATE ON transacoes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_km_diario_updated_at BEFORE UPDATE ON km_diario FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =========================
-- DADOS INICIAIS (SEEDS)
-- =========================

-- Inserir planos padrão
INSERT INTO planos (id, nome, status) VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Teste Grátis', 'ativo'),
  ('22222222-2222-2222-2222-222222222222', 'Gestão Básica', 'ativo'),
  ('33333333-3333-3333-3333-333333333333', 'Gestão Premium', 'ativo');

-- Inserir recursos padrão
INSERT INTO recursos (id, chave, descricao, tipo) VALUES 
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'dashboard_basico', 'Dashboard básico com visão geral', 'boolean'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'grafico_periodo', 'Gráficos por período', 'boolean'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'export_csv', 'Exportação de dados em CSV', 'boolean'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'relatorio_avancado', 'Relatórios avançados', 'boolean'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'kpi_custo_km', 'KPI de custo por quilômetro', 'boolean'),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'limite_transacoes', 'Limite de transações por mês', 'int'),
  ('gggggggg-gggg-gggg-gggg-gggggggggggg', 'suporte_prioritario', 'Suporte prioritário', 'boolean');

-- Associar recursos aos planos
-- Plano Teste Grátis (limitado)
INSERT INTO plano_recursos (plano_id, recurso_id, valor_texto) VALUES 
  ('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'true'),
  ('11111111-1111-1111-1111-111111111111', 'ffffffff-ffff-ffff-ffff-ffffffffffff', '50');

-- Plano Gestão Básica
INSERT INTO plano_recursos (plano_id, recurso_id, valor_texto) VALUES 
  ('22222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'true'),
  ('22222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'true'),
  ('22222222-2222-2222-2222-222222222222', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'true'),
  ('22222222-2222-2222-2222-222222222222', 'ffffffff-ffff-ffff-ffff-ffffffffffff', '500');

-- Plano Gestão Premium (completo)
INSERT INTO plano_recursos (plano_id, recurso_id, valor_texto) VALUES 
  ('33333333-3333-3333-3333-333333333333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'true'),
  ('33333333-3333-3333-3333-333333333333', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'true'),
  ('33333333-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'true'),
  ('33333333-3333-3333-3333-333333333333', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'true'),
  ('33333333-3333-3333-3333-333333333333', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'true'),
  ('33333333-3333-3333-3333-333333333333', 'ffffffff-ffff-ffff-ffff-ffffffffffff', '-1'),
  ('33333333-3333-3333-3333-333333333333', 'gggggggg-gggg-gggg-gggg-gggggggggggg', 'true');

-- Inserir gateways de pagamento padrão
INSERT INTO gateways (id, nome, tipo, ativo) VALUES 
  ('pay00001-0001-0001-0001-000000000001', 'Stripe', 'online', true),
  ('pay00002-0002-0002-0002-000000000002', 'PayPal', 'online', true),
  ('pay00003-0003-0003-0003-000000000003', 'MercadoPago', 'online', true),
  ('pay00004-0004-0004-0004-000000000004', 'Pix', 'online', true),
  ('pay00005-0005-0005-0005-000000000005', 'MBWay', 'online', true),
  ('pay00006-0006-0006-0006-000000000006', 'Transferência Bancária', 'offline', true);

-- Configurações globais padrão
INSERT INTO configuracoes (tenant_id, chave, valor) VALUES 
  (NULL, 'timezone_default', 'America/Sao_Paulo'),
  (NULL, 'formato_data_default', 'DD/MM/YYYY'),
  (NULL, 'formato_moeda_default', 'R$ #.##0,00'),
  (NULL, 'idioma_sistema_default', 'pt-BR'),
  (NULL, 'moeda_sistema_default', 'BRL');

-- =========================
-- VIEWS ÚTEIS PARA RELATÓRIOS
-- =========================

-- View para resumo financeiro por tenant
CREATE VIEW vw_resumo_financeiro AS
SELECT 
  t.id as tenant_id,
  t.nome_fantasia,
  COALESCE(SUM(CASE WHEN tr.tipo = 'entrada' THEN tr.valor_cents ELSE 0 END), 0) as total_entradas_cents,
  COALESCE(SUM(CASE WHEN tr.tipo = 'saida' THEN tr.valor_cents ELSE 0 END), 0) as total_saidas_cents,
  COALESCE(SUM(CASE WHEN tr.tipo = 'entrada' THEN tr.valor_cents ELSE -tr.valor_cents END), 0) as saldo_cents,
  COUNT(tr.id) as total_transacoes
FROM tenants t
LEFT JOIN transacoes tr ON t.id = tr.tenant_id
WHERE t.status = 'ativo'
GROUP BY t.id, t.nome_fantasia;

-- View para assinaturas ativas
CREATE VIEW vw_assinaturas_ativas AS
SELECT 
  a.id,
  a.tenant_id,
  t.nome_fantasia,
  p.nome as plano_nome,
  a.ciclo,
  a.preco_cents,
  a.moeda,
  a.status,
  a.status_pagamento,
  a.inicio_em,
  a.fim_em
FROM assinaturas a
JOIN tenants t ON a.tenant_id = t.id
JOIN planos p ON a.plano_id = p.id
WHERE a.status = 'ativa';

-- =========================
-- ÍNDICES ADICIONAIS PARA PERFORMANCE
-- =========================
CREATE INDEX idx_transacoes_data_desc ON transacoes(data DESC);
CREATE INDEX idx_transacoes_valor ON transacoes(valor_cents);
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_telefone ON usuarios(telefone_e164);
CREATE INDEX idx_assinaturas_fim_em ON assinaturas(fim_em);
CREATE INDEX idx_pagamentos_criado_em ON pagamentos(criado_em DESC);

-- =========================
-- COMENTÁRIOS PARA DOCUMENTAÇÃO
-- =========================
COMMENT ON TABLE tenants IS 'Tabela principal de tenants/clientes do sistema SaaS';
COMMENT ON TABLE usuarios IS 'Usuários do sistema, vinculados a tenants';
COMMENT ON TABLE planos IS 'Planos de assinatura disponíveis';
COMMENT ON TABLE recursos IS 'Recursos/funcionalidades do sistema';
COMMENT ON TABLE assinaturas IS 'Assinaturas ativas dos tenants';
COMMENT ON TABLE transacoes IS 'Transações financeiras dos motoristas';
COMMENT ON TABLE km_diario IS 'Controle diário de quilometragem';
COMMENT ON TABLE pagamentos IS 'Histórico de pagamentos das assinaturas';
COMMENT ON TABLE auditoria IS 'Log de auditoria do sistema';

-- =========================
-- FIM DO SCRIPT DE DEPLOY
-- =========================