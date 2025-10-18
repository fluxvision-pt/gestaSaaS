-- =========================
-- GESTA SAAS FINANCEIRO - SETUP INICIAL DO BANCO
-- PostgreSQL - Configuração inicial e conexão
-- =========================

-- =========================
-- 1. CONFIGURAÇÃO INICIAL DO BANCO
-- =========================

-- Criar banco de dados (execute como superuser)
-- CREATE DATABASE gestasaas 
--   WITH ENCODING 'UTF8' 
--   LC_COLLATE='pt_BR.UTF-8' 
--   LC_CTYPE='pt_BR.UTF-8' 
--   TEMPLATE=template0;

-- Conectar ao banco gestasaas
\c gestasaas;

-- Configurar timezone
SET timezone = 'America/Sao_Paulo';

-- Configurar locale para números e datas
SET lc_monetary = 'pt_BR.UTF-8';
SET lc_numeric = 'pt_BR.UTF-8';
SET lc_time = 'pt_BR.UTF-8';

-- =========================
-- 2. CRIAR USUÁRIO ESPECÍFICO PARA A APLICAÇÃO
-- =========================

-- Criar usuário para a aplicação (execute como superuser)
CREATE USER gestasaas_app WITH PASSWORD 'sua_senha_segura_aqui';

-- Conceder permissões necessárias
GRANT CONNECT ON DATABASE gestasaas TO gestasaas_app;
GRANT USAGE ON SCHEMA public TO gestasaas_app;
GRANT CREATE ON SCHEMA public TO gestasaas_app;

-- Após criar as tabelas, conceder permissões específicas
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO gestasaas_app;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO gestasaas_app;

-- =========================
-- 3. CONFIGURAÇÕES DE PERFORMANCE
-- =========================

-- Configurações recomendadas para PostgreSQL (ajuste conforme seu servidor)
-- Adicione estas configurações no postgresql.conf:

/*
# Configurações de memória
shared_buffers = 256MB                    # 25% da RAM disponível
effective_cache_size = 1GB                # 75% da RAM disponível
work_mem = 4MB                           # Para operações de ordenação
maintenance_work_mem = 64MB              # Para VACUUM, CREATE INDEX

# Configurações de WAL
wal_buffers = 16MB
checkpoint_completion_target = 0.9
wal_writer_delay = 200ms

# Configurações de conexão
max_connections = 100
shared_preload_libraries = 'pg_stat_statements'

# Configurações de log
log_statement = 'mod'                    # Log apenas modificações
log_min_duration_statement = 1000       # Log queries > 1 segundo
log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h '
*/

-- =========================
-- 4. EXTENSÕES NECESSÁRIAS
-- =========================

-- Verificar extensões disponíveis
SELECT name, default_version, installed_version 
FROM pg_available_extensions 
WHERE name IN ('pgcrypto', 'uuid-ossp', 'pg_stat_statements', 'unaccent');

-- Instalar extensões necessárias
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
CREATE EXTENSION IF NOT EXISTS unaccent;

-- =========================
-- 5. FUNÇÕES UTILITÁRIAS
-- =========================

-- Função para gerar senhas hash
CREATE OR REPLACE FUNCTION gerar_senha_hash(senha TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN crypt(senha, gen_salt('bf', 12));
END;
$$ LANGUAGE plpgsql;

-- Função para verificar senha
CREATE OR REPLACE FUNCTION verificar_senha(senha TEXT, hash_armazenado TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN hash_armazenado = crypt(senha, hash_armazenado);
END;
$$ LANGUAGE plpgsql;

-- Função para limpar texto (remover acentos)
CREATE OR REPLACE FUNCTION limpar_texto(texto TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN lower(unaccent(trim(texto)));
END;
$$ LANGUAGE plpgsql;

-- Função para formatar telefone brasileiro
CREATE OR REPLACE FUNCTION formatar_telefone_br(telefone TEXT)
RETURNS TEXT AS $$
BEGIN
  -- Remove todos os caracteres não numéricos
  telefone := regexp_replace(telefone, '[^0-9]', '', 'g');
  
  -- Adiciona +55 se não tiver código do país
  IF length(telefone) = 11 AND left(telefone, 2) != '55' THEN
    telefone := '55' || telefone;
  END IF;
  
  -- Adiciona + no início
  IF left(telefone, 1) != '+' THEN
    telefone := '+' || telefone;
  END IF;
  
  RETURN telefone;
END;
$$ LANGUAGE plpgsql;

-- Função para validar CPF
CREATE OR REPLACE FUNCTION validar_cpf(cpf TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  cpf_numerico TEXT;
  soma INTEGER;
  resto INTEGER;
  dv1 INTEGER;
  dv2 INTEGER;
BEGIN
  -- Remove caracteres não numéricos
  cpf_numerico := regexp_replace(cpf, '[^0-9]', '', 'g');
  
  -- Verifica se tem 11 dígitos
  IF length(cpf_numerico) != 11 THEN
    RETURN FALSE;
  END IF;
  
  -- Verifica sequências inválidas
  IF cpf_numerico IN ('00000000000', '11111111111', '22222222222', '33333333333', 
                      '44444444444', '55555555555', '66666666666', '77777777777', 
                      '88888888888', '99999999999') THEN
    RETURN FALSE;
  END IF;
  
  -- Calcula primeiro dígito verificador
  soma := 0;
  FOR i IN 1..9 LOOP
    soma := soma + (substring(cpf_numerico, i, 1)::INTEGER * (11 - i));
  END LOOP;
  
  resto := soma % 11;
  IF resto < 2 THEN
    dv1 := 0;
  ELSE
    dv1 := 11 - resto;
  END IF;
  
  -- Verifica primeiro dígito
  IF dv1 != substring(cpf_numerico, 10, 1)::INTEGER THEN
    RETURN FALSE;
  END IF;
  
  -- Calcula segundo dígito verificador
  soma := 0;
  FOR i IN 1..10 LOOP
    soma := soma + (substring(cpf_numerico, i, 1)::INTEGER * (12 - i));
  END LOOP;
  
  resto := soma % 11;
  IF resto < 2 THEN
    dv2 := 0;
  ELSE
    dv2 := 11 - resto;
  END IF;
  
  -- Verifica segundo dígito
  RETURN dv2 = substring(cpf_numerico, 11, 1)::INTEGER;
END;
$$ LANGUAGE plpgsql;

-- Função para validar CNPJ
CREATE OR REPLACE FUNCTION validar_cnpj(cnpj TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  cnpj_numerico TEXT;
  soma INTEGER;
  resto INTEGER;
  dv1 INTEGER;
  dv2 INTEGER;
  multiplicadores1 INTEGER[] := ARRAY[5,4,3,2,9,8,7,6,5,4,3,2];
  multiplicadores2 INTEGER[] := ARRAY[6,5,4,3,2,9,8,7,6,5,4,3,2];
BEGIN
  -- Remove caracteres não numéricos
  cnpj_numerico := regexp_replace(cnpj, '[^0-9]', '', 'g');
  
  -- Verifica se tem 14 dígitos
  IF length(cnpj_numerico) != 14 THEN
    RETURN FALSE;
  END IF;
  
  -- Calcula primeiro dígito verificador
  soma := 0;
  FOR i IN 1..12 LOOP
    soma := soma + (substring(cnpj_numerico, i, 1)::INTEGER * multiplicadores1[i]);
  END LOOP;
  
  resto := soma % 11;
  IF resto < 2 THEN
    dv1 := 0;
  ELSE
    dv1 := 11 - resto;
  END IF;
  
  -- Verifica primeiro dígito
  IF dv1 != substring(cnpj_numerico, 13, 1)::INTEGER THEN
    RETURN FALSE;
  END IF;
  
  -- Calcula segundo dígito verificador
  soma := 0;
  FOR i IN 1..13 LOOP
    soma := soma + (substring(cnpj_numerico, i, 1)::INTEGER * multiplicadores2[i]);
  END LOOP;
  
  resto := soma % 11;
  IF resto < 2 THEN
    dv2 := 0;
  ELSE
    dv2 := 11 - resto;
  END IF;
  
  -- Verifica segundo dígito
  RETURN dv2 = substring(cnpj_numerico, 14, 1)::INTEGER;
END;
$$ LANGUAGE plpgsql;

-- =========================
-- 6. CONFIGURAÇÕES DE SEGURANÇA
-- =========================

-- Configurar row level security (RLS) para multi-tenancy
-- Será aplicado após criar as tabelas

-- Política para tenants (cada tenant só vê seus dados)
-- CREATE POLICY tenant_isolation ON tenants FOR ALL TO gestasaas_app USING (id = current_setting('app.current_tenant_id')::UUID);

-- Política para usuários
-- CREATE POLICY usuario_tenant_isolation ON usuarios FOR ALL TO gestasaas_app USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- Política para transações
-- CREATE POLICY transacao_tenant_isolation ON transacoes FOR ALL TO gestasaas_app USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- =========================
-- 7. CONFIGURAÇÕES DE BACKUP AUTOMÁTICO
-- =========================

-- Script para backup automático (salve como backup_gestasaas.sh)
/*
#!/bin/bash
# Configurações
DB_NAME="gestasaas"
DB_USER="postgres"
DB_HOST="localhost"
BACKUP_DIR="/var/backups/gestasaas"
DATE=$(date +%Y%m%d_%H%M%S)

# Criar diretório se não existir
mkdir -p $BACKUP_DIR

# Backup completo
pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME -f $BACKUP_DIR/gestasaas_$DATE.sql

# Backup compactado
pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME | gzip > $BACKUP_DIR/gestasaas_$DATE.sql.gz

# Manter apenas os últimos 7 dias
find $BACKUP_DIR -name "gestasaas_*.sql*" -mtime +7 -delete

echo "Backup concluído: gestasaas_$DATE.sql"
*/

-- =========================
-- 8. QUERIES DE VERIFICAÇÃO INICIAL
-- =========================

-- Verificar se o banco foi criado corretamente
SELECT 
  current_database() as banco_atual,
  current_user as usuario_atual,
  version() as versao_postgresql;

-- Verificar extensões instaladas
SELECT 
  extname as extensao,
  extversion as versao
FROM pg_extension
ORDER BY extname;

-- Verificar configurações importantes
SELECT 
  name,
  setting,
  unit,
  context
FROM pg_settings 
WHERE name IN (
  'shared_buffers',
  'effective_cache_size', 
  'work_mem',
  'maintenance_work_mem',
  'max_connections',
  'timezone'
)
ORDER BY name;

-- Verificar espaço em disco
SELECT 
  pg_database.datname,
  pg_size_pretty(pg_database_size(pg_database.datname)) AS size
FROM pg_database
WHERE datname = current_database();

-- =========================
-- 9. DADOS DE TESTE (OPCIONAL)
-- =========================

-- Inserir tenant de teste
INSERT INTO tenants (
  id,
  nome_fantasia,
  razao_social,
  documento,
  email,
  telefone_e164,
  status
) VALUES (
  '99999999-9999-9999-9999-999999999999',
  'Empresa Teste',
  'Empresa Teste LTDA',
  '12345678000199',
  'teste@gestasaas.com',
  '+5511999999999',
  'ativo'
) ON CONFLICT (id) DO NOTHING;

-- Inserir usuário administrador de teste
INSERT INTO usuarios (
  id,
  tenant_id,
  nome,
  email,
  telefone_e164,
  senha_hash,
  perfil,
  status
) VALUES (
  '88888888-8888-8888-8888-888888888888',
  '99999999-9999-9999-9999-999999999999',
  'Admin Teste',
  'admin@gestasaas.com',
  '+5511888888888',
  gerar_senha_hash('123456'),
  'cliente_admin',
  'ativo'
) ON CONFLICT (id) DO NOTHING;

-- =========================
-- 10. COMANDOS FINAIS
-- =========================

-- Atualizar estatísticas
ANALYZE;

-- Verificar se tudo está funcionando
SELECT 'Setup concluído com sucesso!' as status;

-- =========================
-- FIM DO SETUP INICIAL
-- =========================