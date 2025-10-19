-- Comando PostgreSQL para criar Super Admin
-- Dados: santos.eltton@gmail.com / Samuel2029#@
-- Perfil: SUPER_ADMIN (acesso vitalício a todos os módulos)

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
    '+5511999999999',
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

-- Verificar se foi criado com sucesso
SELECT 
    id,
    nome,
    email,
    perfil,
    status,
    criado_em
FROM usuarios 
WHERE email = 'santos.eltton@gmail.com';

-- ========================================
-- INFORMAÇÕES IMPORTANTES:
-- ========================================
-- Login: santos.eltton@gmail.com
-- Senha: Samuel2029#@
-- Perfil: super_admin
-- 
-- Características do Super Admin:
-- • Não precisa de tenant_id (NULL)
-- • Acesso vitalício a todos os módulos
-- • Não precisa de plano ou assinatura
-- • Hash da senha gerado com bcrypt (12 salt rounds)
-- • Se o email já existir, os dados serão atualizados
-- ========================================