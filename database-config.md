# Configuração do Banco de Dados - GestaSaaS

## 📋 Resumo dos Arquivos Criados

### 1. `database.sql` - Schema Principal
- Estrutura completa das tabelas
- Relacionamentos e constraints
- Índices para performance
- Triggers automáticos

### 2. `deploy-database.sql` - Deploy Inicial
- Criação do banco e estrutura
- Dados iniciais (seed data)
- Configurações básicas
- Views úteis

### 3. `setup-database.sql` - Configuração Inicial
- Configuração do PostgreSQL
- Criação de usuários e permissões
- Extensões necessárias
- Funções utilitárias
- Configurações de segurança

### 4. `queries-operacionais.sql` - Queries do Sistema
- Autenticação e autorização
- CRUD de todas as entidades
- Relatórios e dashboards
- Auditoria e logs

### 5. `migration-queries.sql` - Manutenção
- Queries de migração
- Backup e restore
- Monitoramento
- Limpeza de dados

## 🔧 Configurações de Conexão

### Desenvolvimento Local
```env
# .env.development
DATABASE_URL=postgresql://gestasaas_app:sua_senha@localhost:5432/gestasaas
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=gestasaas_app
DB_PASSWORD=sua_senha_segura
DB_DATABASE=gestasaas
DB_SCHEMA=public
DB_SYNCHRONIZE=false
DB_LOGGING=true
DB_SSL=false
```

### Produção
```env
# .env.production
DATABASE_URL=postgresql://usuario:senha@host:5432/gestasaas?sslmode=require
DB_HOST=seu-host-producao.com
DB_PORT=5432
DB_USERNAME=gestasaas_prod
DB_PASSWORD=senha_super_segura
DB_DATABASE=gestasaas
DB_SCHEMA=public
DB_SYNCHRONIZE=false
DB_LOGGING=false
DB_SSL=true
DB_SSL_REJECT_UNAUTHORIZED=true
```

### Docker Compose
```yaml
# docker-compose.yml
version: '3.8'
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: gestasaas
      POSTGRES_USER: gestasaas_app
      POSTGRES_PASSWORD: sua_senha_segura
      POSTGRES_INITDB_ARGS: "--encoding=UTF8 --lc-collate=pt_BR.UTF-8 --lc-ctype=pt_BR.UTF-8"
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database.sql:/docker-entrypoint-initdb.d/01-schema.sql
      - ./deploy-database.sql:/docker-entrypoint-initdb.d/02-deploy.sql
    restart: unless-stopped

volumes:
  postgres_data:
```

## 🚀 Processo de Deploy

### 1. Primeiro Deploy (Banco Novo)
```bash
# 1. Criar banco e usuário (como superuser)
psql -U postgres -c "CREATE DATABASE gestasaas;"
psql -U postgres -c "CREATE USER gestasaas_app WITH PASSWORD 'sua_senha';"

# 2. Executar setup inicial
psql -U postgres -d gestasaas -f setup-database.sql

# 3. Criar estrutura
psql -U gestasaas_app -d gestasaas -f database.sql

# 4. Inserir dados iniciais
psql -U gestasaas_app -d gestasaas -f deploy-database.sql

# 5. Conceder permissões finais
psql -U postgres -d gestasaas -c "GRANT ALL ON ALL TABLES IN SCHEMA public TO gestasaas_app;"
psql -U postgres -d gestasaas -c "GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO gestasaas_app;"
```

### 2. Atualizações (Migrations)
```bash
# Backup antes da atualização
pg_dump -U gestasaas_app -d gestasaas > backup_$(date +%Y%m%d_%H%M%S).sql

# Aplicar migrations
psql -U gestasaas_app -d gestasaas -f migration-queries.sql
```

## 🔐 Configurações de Segurança

### 1. Configuração do PostgreSQL (postgresql.conf)
```conf
# Conexões
listen_addresses = 'localhost'  # ou '*' para produção
port = 5432
max_connections = 100

# SSL (produção)
ssl = on
ssl_cert_file = 'server.crt'
ssl_key_file = 'server.key'

# Logs de segurança
log_connections = on
log_disconnections = on
log_statement = 'mod'
log_min_duration_statement = 1000

# Autenticação
password_encryption = scram-sha-256
```

### 2. Configuração de Acesso (pg_hba.conf)
```conf
# Desenvolvimento local
local   gestasaas    gestasaas_app                     scram-sha-256
host    gestasaas    gestasaas_app    127.0.0.1/32     scram-sha-256

# Produção (ajustar IPs conforme necessário)
hostssl gestasaas    gestasaas_prod   0.0.0.0/0        scram-sha-256
```

## 📊 Monitoramento

### 1. Queries de Monitoramento
```sql
-- Conexões ativas
SELECT count(*) as conexoes_ativas FROM pg_stat_activity WHERE state = 'active';

-- Tamanho do banco
SELECT pg_size_pretty(pg_database_size('gestasaas')) as tamanho_banco;

-- Queries mais lentas
SELECT query, mean_exec_time, calls 
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;

-- Bloqueios
SELECT blocked_locks.pid AS blocked_pid,
       blocked_activity.usename AS blocked_user,
       blocking_locks.pid AS blocking_pid,
       blocking_activity.usename AS blocking_user,
       blocked_activity.query AS blocked_statement,
       blocking_activity.query AS current_statement_in_blocking_process
FROM pg_catalog.pg_locks blocked_locks
JOIN pg_catalog.pg_stat_activity blocked_activity ON blocked_activity.pid = blocked_locks.pid
JOIN pg_catalog.pg_locks blocking_locks ON blocking_locks.locktype = blocked_locks.locktype
JOIN pg_catalog.pg_stat_activity blocking_activity ON blocking_activity.pid = blocking_locks.pid
WHERE NOT blocked_locks.granted;
```

### 2. Alertas Recomendados
- Conexões > 80% do limite
- Queries > 5 segundos
- Espaço em disco < 20%
- Backup com falha
- Bloqueios > 30 segundos

## 🔄 Backup e Restore

### 1. Backup Automático
```bash
#!/bin/bash
# backup-gestasaas.sh

DB_NAME="gestasaas"
DB_USER="gestasaas_app"
BACKUP_DIR="/var/backups/gestasaas"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup completo
pg_dump -U $DB_USER -d $DB_NAME -f $BACKUP_DIR/gestasaas_$DATE.sql

# Backup compactado
pg_dump -U $DB_USER -d $DB_NAME | gzip > $BACKUP_DIR/gestasaas_$DATE.sql.gz

# Manter apenas 7 dias
find $BACKUP_DIR -name "gestasaas_*.sql*" -mtime +7 -delete
```

### 2. Restore
```bash
# Restore completo
psql -U gestasaas_app -d gestasaas < backup_20240101_120000.sql

# Restore específico (apenas dados)
pg_restore -U gestasaas_app -d gestasaas --data-only backup_20240101_120000.sql
```

## 🧪 Testes

### 1. Teste de Conexão
```sql
-- Verificar se consegue conectar e executar queries básicas
SELECT 
  current_database() as banco,
  current_user as usuario,
  now() as timestamp;
```

### 2. Teste de Performance
```sql
-- Testar inserção em lote
EXPLAIN ANALYZE 
INSERT INTO transacoes (tenant_id, descricao, tipo, categoria, valor, data_transacao, status)
SELECT 
  '99999999-9999-9999-9999-999999999999',
  'Teste ' || generate_series,
  'receita',
  'vendas',
  random() * 1000,
  CURRENT_DATE - (random() * 365)::int,
  'confirmada'
FROM generate_series(1, 1000);
```

## 📝 Notas Importantes

1. **Multi-tenancy**: Todas as queries já incluem filtro por `tenant_id`
2. **Segurança**: Row Level Security (RLS) configurado para isolamento
3. **Performance**: Índices otimizados para queries mais comuns
4. **Auditoria**: Log automático de todas as operações importantes
5. **Validação**: Funções para validar CPF/CNPJ e formatar dados
6. **Backup**: Scripts automáticos de backup configurados
7. **Monitoramento**: Queries para acompanhar performance e uso

## 🔗 Próximos Passos

1. Executar o setup inicial no seu ambiente
2. Configurar as variáveis de ambiente
3. Testar a conexão da aplicação
4. Configurar backup automático
5. Implementar monitoramento
6. Configurar alertas de segurança

Todos os arquivos SQL estão prontos para uso e podem ser executados na ordem indicada!