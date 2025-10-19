-- Comando PostgreSQL para criar Super Admin
-- Execute este comando diretamente no seu banco PostgreSQL

-- IMPORTANTE: Primeiro você precisa gerar o hash da senha
-- No Node.js/NestJS, execute:
-- const bcrypt = require('bcryptjs');
-- const hash = await bcrypt.hash('Samuel2029#@', 12);
-- console.log(hash);

-- Substitua o hash abaixo pelo hash gerado:
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
    '$2a$12$SUBSTITUA_PELO_HASH_GERADO',  -- Substitua pelo hash real
    'super_admin',
    'pt-BR',
    'BRL',
    'BR',
    'ativo',
    NOW(),
    NOW()
)
ON CONFLICT (tenant_id, email) DO UPDATE SET
    nome = EXCLUDED.nome,
    telefone_e164 = EXCLUDED.telefone_e164,
    senha_hash = EXCLUDED.senha_hash,
    perfil = EXCLUDED.perfil,
    status = EXCLUDED.status,
    atualizado_em = NOW();