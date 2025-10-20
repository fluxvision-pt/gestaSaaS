-- ========================================
-- SCRIPT SIMPLIFICADO: CRIAR SUPER ADMINS
-- ========================================

-- Primeiro, vamos alterar a estrutura da tabela para permitir super admins
ALTER TABLE usuarios ALTER COLUMN tenant_id DROP NOT NULL;

-- Remover constraints existentes (pode dar erro se não existir, mas é ok)
ALTER TABLE usuarios DROP CONSTRAINT usuarios_tenant_id_email_key;
ALTER TABLE usuarios DROP CONSTRAINT usuarios_tenant_id_telefone_e164_key;

-- Adicionar constraint UNIQUE para email global
ALTER TABLE usuarios ADD CONSTRAINT usuarios_email_unique UNIQUE (email);

-- Criar índices únicos condicionais para tenants
CREATE UNIQUE INDEX usuarios_tenant_email_unique 
ON usuarios (tenant_id, email) 
WHERE tenant_id IS NOT NULL;

CREATE UNIQUE INDEX usuarios_tenant_telefone_unique 
ON usuarios (tenant_id, telefone_e164) 
WHERE tenant_id IS NOT NULL;

-- ========================================
-- CRIAR SUPER ADMIN 1: Eltton Santos
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

-- ========================================
-- CRIAR SUPER ADMIN 2: Admin GestaSaaS
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
    'Admin GestaSaaS',
    'admin@gestasaas.com',
    '+5511999999999',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3xp9vflXvO',
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

-- ========================================
-- VERIFICAÇÃO
-- ========================================
SELECT 
    id,
    tenant_id,
    nome,
    email,
    perfil,
    status,
    criado_em
FROM usuarios 
WHERE perfil = 'super_admin'
ORDER BY criado_em;