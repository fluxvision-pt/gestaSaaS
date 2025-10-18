-- =========================
-- GESTA SAAS FINANCEIRO - ESTRUTURA DO BANCO DE DADOS
-- PostgreSQL com nomes em português (snake_case)
-- =========================

-- Extensões úteis
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS uuid-ossp;

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
CREATE TRIGGER update_transacoes_updated_at BEFORE UPDATE ON transacoes FOR EACH ROW EXECUTE FUNCTION update_transacoes_updated_at_column();
CREATE TRIGGER update_km_diario_updated_at BEFORE UPDATE ON km_diario FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();