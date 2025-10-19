-- ========================================
-- SCRIPT COMPLETO: MIGRAÇÃO + SUPER ADMIN
-- ========================================
-- Este script:
-- 1. Altera a estrutura da tabela para permitir super admins
-- 2. Cria o super admin com os dados especificados

-- PARTE 1: MIGRAÇÃO DA ESTRUTURA
-- ========================================

-- Remover a constraint NOT NULL do tenant_id
ALTER TABLE usuarios ALTER COLUMN tenant_id DROP NOT NULL;

-- Remover as constraints UNIQUE que dependem de tenant_id
ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS usuarios_tenant_id_email_key;
ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS usuarios_tenant_id_telefone_e164_key;

-- Adicionar nova constraint UNIQUE para email global
ALTER TABLE usuarios ADD CONSTRAINT usuarios_email_unique UNIQUE (email);

-- Adicionar constraints UNIQUE condicionais para tenants
CREATE UNIQUE INDEX IF NOT EXISTS usuarios_tenant_email_unique 
ON usuarios (tenant_id, email) 
WHERE tenant_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS usuarios_tenant_telefone_unique 
ON usuarios (tenant_id, telefone_e164) 
WHERE tenant_id IS NOT NULL;

-- PARTE 2: CRIAR SUPER ADMIN
-- ========================================

INSERT INTO usuarios (
    id,
    tenant_id,
    nome,
    email,
    telefone_e164,
    senha_hash,
    perfil,
    idioma_preferido,
    moeda_preferida,
    cod_pais,
    status,
    criado_em,
    atualizado_em
) VALUES (
    gen_random_uuid(),
    NULL,
    'Eltton Santos',
    'santos.eltton@gmail.com',
    '+351967247471',
    '$2a$12$kdeIL5BxI1Uz.gt6f.lc6efZryWdDF89QwBJIpOpaliEpYyOV5jY.',
    'super_admin',
    'pt-BR',
    'BRL',
    'BR',
    'ativo',
    NOW(),
    NOW()
)
ON CONFLICT (email) DO UPDATE SET
    nome = EXCLUDED.nome,
    telefone_e164 = EXCLUDED.telefone_e164,
    senha_hash = EXCLUDED.senha_hash,
    perfil = EXCLUDED.perfil,
    status = EXCLUDED.status,
    atualizado_em = NOW();

-- PARTE 3: VERIFICAÇÃO
-- ========================================

-- Verificar se o super admin foi criado
SELECT 
    id,
    tenant_id,
    nome,
    email,
    perfil,
    status,
    criado_em
FROM usuarios 
WHERE email = 'santos.eltton@gmail.com';

-- Verificar a estrutura da tabela
SELECT 
    column_name,
    is_nullable,
    data_type,
    column_default
FROM information_schema.columns 
WHERE table_name = 'usuarios' 
AND column_name IN ('tenant_id', 'email', 'telefone_e164')
ORDER BY ordinal_position;

-- ========================================
-- INFORMAÇÕES DO SUPER ADMIN CRIADO:
-- ========================================
-- Login: santos.eltton@gmail.com
-- Senha: Samuel2029#@
-- Perfil: super_admin
-- Telefone: +5511999999999
-- 
-- Características:
-- • tenant_id = NULL (não pertence a nenhum tenant)
-- • Acesso vitalício a todos os módulos
-- • Não precisa de plano ou assinatura
-- ========================================