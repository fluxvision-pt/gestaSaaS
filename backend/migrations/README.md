# Migrações do Banco de Dados

Este diretório contém as migrações necessárias para adicionar funcionalidades ao sistema.

## Recuperação de Senha e Verificação de Email

### Arquivo: `add-password-recovery.sql`

Esta migração adiciona a funcionalidade completa de recuperação de senha e verificação de email ao sistema.

#### O que a migração faz:

1. **Adiciona campo `email_verificado`** na tabela `usuarios`
2. **Adiciona constraint UNIQUE** no campo `email` da tabela `usuarios`
3. **Cria enum `tipo_token`** para tipos de token (PASSWORD_RESET, EMAIL_VERIFICATION)
4. **Cria tabela `tokens_recuperacao`** para armazenar tokens de recuperação
5. **Adiciona índices** para melhor performance
6. **Adiciona trigger** para atualizar `updated_at` automaticamente
7. **Cria função `limpar_tokens_expirados()`** para limpeza automática

#### Como aplicar:

```bash
# Conectar ao PostgreSQL
psql -U seu_usuario -d nome_do_banco

# Executar a migração
\i add-password-recovery.sql
```

Ou usando um cliente SQL:

```sql
-- Copie e cole o conteúdo do arquivo add-password-recovery.sql
-- e execute no seu cliente PostgreSQL
```

#### Verificação:

Após aplicar a migração, você pode verificar se tudo foi criado corretamente:

```sql
-- Verificar se a tabela foi criada
\d tokens_recuperacao

-- Verificar se o campo foi adicionado
\d usuarios

-- Verificar se a função foi criada
\df limpar_tokens_expirados

-- Verificar se o enum foi criado
\dT tipo_token
```

#### Limpeza de tokens expirados:

Para limpar tokens expirados manualmente:

```sql
SELECT limpar_tokens_expirados();
```

Recomenda-se configurar um job/cron para executar esta função periodicamente:

```sql
-- Exemplo de como criar um job no PostgreSQL (se usando pg_cron)
SELECT cron.schedule('limpar-tokens', '0 2 * * *', 'SELECT limpar_tokens_expirados();');
```

#### Rollback (se necessário):

Se precisar reverter as alterações:

```sql
-- Remover tabela
DROP TABLE IF EXISTS tokens_recuperacao;

-- Remover enum
DROP TYPE IF EXISTS tipo_token;

-- Remover campo (cuidado - isso remove dados!)
ALTER TABLE usuarios DROP COLUMN IF EXISTS email_verificado;

-- Remover constraint
ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS usuarios_email_unique;

-- Remover função
DROP FUNCTION IF EXISTS limpar_tokens_expirados();
```

## Notas Importantes

- **Backup**: Sempre faça backup do banco antes de aplicar migrações
- **Ambiente**: Teste primeiro em ambiente de desenvolvimento
- **Dados existentes**: A migração preserva todos os dados existentes
- **Performance**: Os índices criados melhoram a performance das consultas
- **Segurança**: Os tokens têm expiração automática para segurança