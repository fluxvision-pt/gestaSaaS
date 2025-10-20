-- =========================
-- GESTA SAAS FINANCEIRO - ESTRUTURA DO BANCO DE DADOS
-- PostgreSQL com nomes em português (snake_case)
-- Incluindo sistema de recuperação de senha
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
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  telefone_e164 TEXT,           -- Opcional para cadastro público
  senha_hash TEXT NOT NULL,
  perfil TEXT NOT NULL DEFAULT 'cliente_user', -- super_admin, cliente_admin, cliente_user
  idioma_preferido TEXT,          -- override do tenant (opcional)
  moeda_preferida CHAR(3),        -- override (opcional)
  cod_pais CHAR(2),               -- override (opcional)
  status TEXT NOT NULL DEFAULT 'ativo',
  email_verificado BOOLEAN NOT NULL DEFAULT FALSE,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_usuarios_tenant ON usuarios(tenant_id);
CREATE INDEX idx_usuarios_perfil ON usuarios(perfil);
CREATE INDEX idx_usuarios_email ON usuarios(email);

-- =========================
-- SISTEMA DE RECUPERAÇÃO DE SENHA E VERIFICAÇÃO DE EMAIL
-- =========================
CREATE TABLE tokens_recuperacao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  tipo TEXT NOT NULL DEFAULT 'password_reset', -- password_reset, email_verification
  usado BOOLEAN NOT NULL DEFAULT FALSE,
  expira_em TIMESTAMPTZ NOT NULL,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_tokens_recuperacao_token ON tokens_recuperacao(token);
CREATE INDEX idx_tokens_recuperacao_usuario ON tokens_recuperacao(usuario_id);
CREATE INDEX idx_tokens_recuperacao_expira ON tokens_recuperacao(expira_em);

-- =========================
-- PLANOS, RECURSOS E ASSINATURAS (SEM JSON NA UI)
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
-- CONFIGURAÇÕES TIPADAS E AUDITORIA
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
-- FUNÇÃO PARA LIMPEZA AUTOMÁTICA DE TOKENS EXPIRADOS
-- =========================
CREATE OR REPLACE FUNCTION limpar_tokens_expirados()
RETURNS INTEGER AS $$
DECLARE
    tokens_removidos INTEGER;
BEGIN
    DELETE FROM tokens_recuperacao 
    WHERE expira_em < NOW() OR usado = TRUE;
    
    GET DIAGNOSTICS tokens_removidos = ROW_COUNT;
    RETURN tokens_removidos;
END;
$$ LANGUAGE plpgsql;

-- =========================
-- DADOS INICIAIS
-- =========================

-- Inserir plano gratuito padrão
INSERT INTO planos (id, nome, status) VALUES 
('00000000-0000-0000-0000-000000000001', 'Plano Gratuito', 'ativo');

-- Inserir recursos básicos
INSERT INTO recursos (chave, descricao, tipo) VALUES 
('dashboard_basico', 'Dashboard básico com métricas essenciais', 'boolean'),
('max_transacoes_mes', 'Máximo de transações por mês', 'int'),
('export_csv', 'Exportação de dados em CSV', 'boolean'),
('relatorio_avancado', 'Relatórios avançados', 'boolean'),
('suporte_email', 'Suporte por email', 'boolean');

-- Associar recursos ao plano gratuito
INSERT INTO plano_recursos (plano_id, recurso_id, valor_texto) 
SELECT '00000000-0000-0000-0000-000000000001', id, 
CASE 
    WHEN chave = 'dashboard_basico' THEN 'true'
    WHEN chave = 'max_transacoes_mes' THEN '100'
    WHEN chave = 'export_csv' THEN 'false'
    WHEN chave = 'relatorio_avancado' THEN 'false'
    WHEN chave = 'suporte_email' THEN 'true'
END
FROM recursos;

-- Inserir gateways padrão
INSERT INTO gateways (nome, tipo, ativo) VALUES 
('PIX', 'online', true),
('Transferência Bancária', 'offline', true),
('Cartão de Crédito', 'online', true);