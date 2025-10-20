-- Migration: Adicionar funcionalidade de recuperação de senha
-- Data: 2024
-- Descrição: Adiciona tabela de tokens de recuperação e campo de email verificado

-- 1. Adicionar campo email_verificado na tabela usuarios
ALTER TABLE usuarios 
ADD COLUMN IF NOT EXISTS email_verificado BOOLEAN DEFAULT FALSE;

-- 2. Adicionar constraint UNIQUE no email (se não existir)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'usuarios_email_unique' 
        AND table_name = 'usuarios'
    ) THEN
        ALTER TABLE usuarios ADD CONSTRAINT usuarios_email_unique UNIQUE (email);
    END IF;
END $$;

-- 3. Criar enum para tipos de token
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_token') THEN
        CREATE TYPE tipo_token AS ENUM ('PASSWORD_RESET', 'EMAIL_VERIFICATION');
    END IF;
END $$;

-- 4. Criar tabela tokens_recuperacao
CREATE TABLE IF NOT EXISTS tokens_recuperacao (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL UNIQUE,
    tipo tipo_token NOT NULL,
    usado BOOLEAN DEFAULT FALSE,
    expira_em TIMESTAMP WITH TIME ZONE NOT NULL,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_tokens_recuperacao_usuario_id ON tokens_recuperacao(usuario_id);
CREATE INDEX IF NOT EXISTS idx_tokens_recuperacao_token ON tokens_recuperacao(token);
CREATE INDEX IF NOT EXISTS idx_tokens_recuperacao_expira_em ON tokens_recuperacao(expira_em);
CREATE INDEX IF NOT EXISTS idx_tokens_recuperacao_tipo ON tokens_recuperacao(tipo);

-- 6. Adicionar trigger para atualizar updated_at
CREATE TRIGGER update_tokens_recuperacao_updated_at
    BEFORE UPDATE ON tokens_recuperacao
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 7. Criar função para limpar tokens expirados
CREATE OR REPLACE FUNCTION limpar_tokens_expirados()
RETURNS INTEGER AS $$
DECLARE
    tokens_removidos INTEGER;
BEGIN
    DELETE FROM tokens_recuperacao 
    WHERE expira_em < CURRENT_TIMESTAMP OR usado = TRUE;
    
    GET DIAGNOSTICS tokens_removidos = ROW_COUNT;
    
    RETURN tokens_removidos;
END;
$$ LANGUAGE plpgsql;

-- 8. Comentários nas tabelas e colunas
COMMENT ON TABLE tokens_recuperacao IS 'Tabela para armazenar tokens de recuperação de senha e verificação de email';
COMMENT ON COLUMN tokens_recuperacao.id IS 'Identificador único do token';
COMMENT ON COLUMN tokens_recuperacao.usuario_id IS 'Referência ao usuário proprietário do token';
COMMENT ON COLUMN tokens_recuperacao.token IS 'Token único para recuperação/verificação';
COMMENT ON COLUMN tokens_recuperacao.tipo IS 'Tipo do token: PASSWORD_RESET ou EMAIL_VERIFICATION';
COMMENT ON COLUMN tokens_recuperacao.usado IS 'Indica se o token já foi utilizado';
COMMENT ON COLUMN tokens_recuperacao.expira_em IS 'Data e hora de expiração do token';
COMMENT ON COLUMN tokens_recuperacao.criado_em IS 'Data e hora de criação do token';
COMMENT ON COLUMN tokens_recuperacao.atualizado_em IS 'Data e hora da última atualização';

COMMENT ON COLUMN usuarios.email_verificado IS 'Indica se o email do usuário foi verificado';

-- 9. Atualizar usuários existentes para ter email verificado como true (opcional)
-- Descomente a linha abaixo se quiser que usuários existentes tenham email como verificado
-- UPDATE usuarios SET email_verificado = TRUE WHERE email_verificado IS NULL;

-- Fim da migration