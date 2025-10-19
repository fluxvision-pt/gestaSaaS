-- Migração para permitir Super Admins sem tenant_id
-- Este script altera a estrutura da tabela usuarios para permitir tenant_id NULL

-- 1. Remover a constraint NOT NULL do tenant_id
ALTER TABLE usuarios ALTER COLUMN tenant_id DROP NOT NULL;

-- 2. Remover as constraints UNIQUE que dependem de tenant_id
ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS usuarios_tenant_id_email_key;
ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS usuarios_tenant_id_telefone_e164_key;

-- 3. Adicionar nova constraint UNIQUE para email global (para super admins)
ALTER TABLE usuarios ADD CONSTRAINT usuarios_email_unique UNIQUE (email);

-- 4. Adicionar constraint UNIQUE condicional para tenant_id + email (apenas quando tenant_id não é NULL)
CREATE UNIQUE INDEX usuarios_tenant_email_unique 
ON usuarios (tenant_id, email) 
WHERE tenant_id IS NOT NULL;

-- 5. Adicionar constraint UNIQUE condicional para tenant_id + telefone_e164 (apenas quando tenant_id não é NULL)
CREATE UNIQUE INDEX usuarios_tenant_telefone_unique 
ON usuarios (tenant_id, telefone_e164) 
WHERE tenant_id IS NOT NULL;

-- 6. Verificar a estrutura atualizada
\d usuarios;

-- Comentários sobre as mudanças:
-- • tenant_id agora pode ser NULL (para super admins)
-- • email deve ser único globalmente
-- • Dentro de um tenant, email e telefone devem ser únicos
-- • Super admins (tenant_id = NULL) podem ter qualquer email/telefone