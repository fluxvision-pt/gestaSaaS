# Guia Completo: Node PostgreSQL no n8n para GestaSaaS

## 📋 Índice
1. [Configuração da Conexão](#configuração-da-conexão)
2. [Estrutura do Banco de Dados](#estrutura-do-banco-de-dados)
3. [Operações CRUD](#operações-crud)
4. [Exemplos de Workflows](#exemplos-de-workflows)
5. [Melhores Práticas](#melhores-práticas)

---

## 🔧 Configuração da Conexão

### 1. Credenciais PostgreSQL no n8n

No n8n, vá em **Settings > Credentials** e crie uma nova credencial **PostgreSQL**:

```
Host: seu-host-postgresql
Port: 5432
Database: gestasaas
Username: seu-usuario
Password: sua-senha
SSL Mode: prefer (ou require para produção)
```

### 2. Configuração para Desenvolvimento Local
Se estiver usando SQLite em desenvolvimento, você precisará migrar para PostgreSQL:

```env
# .env.development (para PostgreSQL)
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=admin
DB_DATABASE=gestasaas
DATABASE_URL=postgresql://postgres:admin@localhost:5432/gestasaas
```

---

## 🗄️ Estrutura do Banco de Dados

### Principais Tabelas e Campos

#### **Tenants** (Empresas)
```sql
-- Tabela: tenants
id (uuid)                    -- ID único do tenant
nome_fantasia (text)         -- Nome fantasia
razao_social (text)          -- Razão social
documento (text)             -- CPF/CNPJ
email (text)                 -- Email principal
telefone_e164 (text)         -- Telefone formato E.164
cod_pais (char)              -- Código do país (BR)
idioma_preferido (text)      -- Idioma (pt-BR)
moeda_preferida (char)       -- Moeda (BRL)
status (text)                -- ativo, suspenso, cancelado
criado_em (timestamp)        -- Data de criação
atualizado_em (timestamp)    -- Data de atualização
```

#### **Usuários**
```sql
-- Tabela: usuarios
id (uuid)                    -- ID único do usuário
tenant_id (uuid)             -- ID do tenant
nome (text)                  -- Nome completo
email (text)                 -- Email único
telefone_e164 (text)         -- Telefone formato E.164
senha_hash (text)            -- Hash da senha
perfil (text)                -- super_admin, cliente_admin, cliente_user
idioma_preferido (text)      -- Override do tenant
moeda_preferida (text)       -- Override do tenant
cod_pais (text)              -- Código do país
status (text)                -- ativo, inativo, suspenso
email_verificado (boolean)   -- Email verificado
criado_em (timestamp)        -- Data de criação
atualizado_em (timestamp)    -- Data de atualização
```

#### **Transações**
```sql
-- Tabela: transacoes
id (uuid)                    -- ID único da transação
tenant_id (uuid)             -- ID do tenant
usuario_id (uuid)            -- ID do usuário
tipo (text)                  -- entrada, saida
categoria (text)             -- combustivel, manutencao, etc.
descricao (text)             -- Descrição
valor_cents (integer)        -- Valor em centavos
km (decimal)                 -- Quilometragem
data (date)                  -- Data da transação
origem (text)                -- web, api, importacao
criado_em (timestamp)        -- Data de criação
atualizado_em (timestamp)    -- Data de atualização
```

---

## 🔄 Operações CRUD

### 1. **CREATE** - Inserir Dados

#### Criar Tenant
```sql
INSERT INTO public.tenants (
    id, nome_fantasia, razao_social, documento, email, 
    telefone_e164, cod_pais, idioma_preferido, moeda_preferida, status
) VALUES (
    gen_random_uuid(),
    '{{ $json.nome_fantasia }}',
    '{{ $json.razao_social }}',
    '{{ $json.documento }}',
    '{{ $json.email }}',
    '{{ $json.telefone_e164 }}',
    COALESCE('{{ $json.cod_pais }}', 'BR'),
    COALESCE('{{ $json.idioma_preferido }}', 'pt-BR'),
    COALESCE('{{ $json.moeda_preferida }}', 'BRL'),
    COALESCE('{{ $json.status }}', 'ativo')
) RETURNING *;
```

#### Criar Usuário
```sql
INSERT INTO public.usuarios (
    id, tenant_id, nome, email, telefone_e164, 
    senha_hash, perfil, status, email_verificado
) VALUES (
    gen_random_uuid(),
    '{{ $json.tenant_id }}',
    '{{ $json.nome }}',
    '{{ $json.email }}',
    '{{ $json.telefone_e164 }}',
    '{{ $json.senha_hash }}',
    COALESCE('{{ $json.perfil }}', 'cliente_user'),
    COALESCE('{{ $json.status }}', 'ativo'),
    COALESCE({{ $json.email_verificado }}, false)
) RETURNING *;
```

#### Criar Transação
```sql
INSERT INTO public.transacoes (
    id, tenant_id, usuario_id, tipo, categoria, 
    descricao, valor_cents, km, data, origem
) VALUES (
    gen_random_uuid(),
    '{{ $json.tenant_id }}',
    '{{ $json.usuario_id }}',
    '{{ $json.tipo }}',
    '{{ $json.categoria }}',
    '{{ $json.descricao }}',
    {{ $json.valor_cents }},
    {{ $json.km }},
    '{{ $json.data }}',
    COALESCE('{{ $json.origem }}', 'api')
) RETURNING *;
```

### 2. **READ** - Consultar Dados

#### Buscar Tenant por ID
```sql
SELECT 
    id, nome_fantasia, razao_social, documento, email,
    telefone_e164, cod_pais, idioma_preferido, moeda_preferida,
    status, criado_em, atualizado_em
FROM public.tenants 
WHERE id = '{{ $json.tenant_id }}';
```

#### Buscar Usuários de um Tenant
```sql
SELECT 
    u.id, u.tenant_id, u.nome, u.email, u.telefone_e164,
    u.perfil, u.status, u.email_verificado, u.criado_em,
    t.nome_fantasia as tenant_nome
FROM public.usuarios u
LEFT JOIN public.tenants t ON u.tenant_id = t.id
WHERE u.tenant_id = '{{ $json.tenant_id }}'
    AND u.status = 'ativo'
ORDER BY u.nome;
```

#### Buscar Transações com Filtros
```sql
SELECT 
    tr.id, tr.tenant_id, tr.usuario_id, tr.tipo, tr.categoria,
    tr.descricao, tr.valor_cents, tr.km, tr.data, tr.origem,
    tr.criado_em, u.nome as usuario_nome, t.nome_fantasia as tenant_nome
FROM public.transacoes tr
LEFT JOIN public.usuarios u ON tr.usuario_id = u.id
LEFT JOIN public.tenants t ON tr.tenant_id = t.id
WHERE tr.tenant_id = '{{ $json.tenant_id }}'
    AND tr.data BETWEEN '{{ $json.data_inicio }}' AND '{{ $json.data_fim }}'
    AND (CASE WHEN '{{ $json.tipo }}' != '' THEN tr.tipo = '{{ $json.tipo }}' ELSE true END)
    AND (CASE WHEN '{{ $json.categoria }}' != '' THEN tr.categoria = '{{ $json.categoria }}' ELSE true END)
ORDER BY tr.data DESC, tr.criado_em DESC
LIMIT {{ $json.limit || 100 }};
```

#### Relatório Financeiro por Período
```sql
SELECT 
    tr.tipo,
    tr.categoria,
    COUNT(*) as quantidade,
    SUM(tr.valor_cents) as total_cents,
    ROUND(SUM(tr.valor_cents) / 100.0, 2) as total_reais,
    AVG(tr.valor_cents) as media_cents,
    ROUND(AVG(tr.valor_cents) / 100.0, 2) as media_reais
FROM public.transacoes tr
WHERE tr.tenant_id = '{{ $json.tenant_id }}'
    AND tr.data BETWEEN '{{ $json.data_inicio }}' AND '{{ $json.data_fim }}'
GROUP BY tr.tipo, tr.categoria
ORDER BY tr.tipo, total_cents DESC;
```

### 3. **UPDATE** - Atualizar Dados

#### Atualizar Tenant
```sql
UPDATE public.tenants SET
    nome_fantasia = COALESCE('{{ $json.nome_fantasia }}', nome_fantasia),
    razao_social = COALESCE('{{ $json.razao_social }}', razao_social),
    documento = COALESCE('{{ $json.documento }}', documento),
    email = COALESCE('{{ $json.email }}', email),
    telefone_e164 = COALESCE('{{ $json.telefone_e164 }}', telefone_e164),
    status = COALESCE('{{ $json.status }}', status),
    atualizado_em = NOW()
WHERE id = '{{ $json.tenant_id }}'
RETURNING *;
```

#### Atualizar Usuário
```sql
UPDATE public.usuarios SET
    nome = COALESCE('{{ $json.nome }}', nome),
    email = COALESCE('{{ $json.email }}', email),
    telefone_e164 = COALESCE('{{ $json.telefone_e164 }}', telefone_e164),
    perfil = COALESCE('{{ $json.perfil }}', perfil),
    status = COALESCE('{{ $json.status }}', status),
    email_verificado = COALESCE({{ $json.email_verificado }}, email_verificado),
    atualizado_em = NOW()
WHERE id = '{{ $json.usuario_id }}'
    AND tenant_id = '{{ $json.tenant_id }}'
RETURNING *;
```

#### Atualizar Transação
```sql
UPDATE public.transacoes SET
    tipo = COALESCE('{{ $json.tipo }}', tipo),
    categoria = COALESCE('{{ $json.categoria }}', categoria),
    descricao = COALESCE('{{ $json.descricao }}', descricao),
    valor_cents = COALESCE({{ $json.valor_cents }}, valor_cents),
    km = COALESCE({{ $json.km }}, km),
    data = COALESCE('{{ $json.data }}', data),
    atualizado_em = NOW()
WHERE id = '{{ $json.transacao_id }}'
    AND tenant_id = '{{ $json.tenant_id }}'
RETURNING *;
```

### 4. **DELETE** - Excluir Dados

#### Excluir Transação (Soft Delete)
```sql
-- Opção 1: Exclusão física
DELETE FROM public.transacoes 
WHERE id = '{{ $json.transacao_id }}' 
    AND tenant_id = '{{ $json.tenant_id }}'
RETURNING *;

-- Opção 2: Soft delete (recomendado)
UPDATE public.transacoes SET
    status = 'excluido',
    atualizado_em = NOW()
WHERE id = '{{ $json.transacao_id }}'
    AND tenant_id = '{{ $json.tenant_id }}'
RETURNING *;
```

#### Desativar Usuário
```sql
UPDATE public.usuarios SET
    status = 'inativo',
    atualizado_em = NOW()
WHERE id = '{{ $json.usuario_id }}'
    AND tenant_id = '{{ $json.tenant_id }}'
RETURNING *;
```

#### Cancelar Tenant
```sql
UPDATE public.tenants SET
    status = 'cancelado',
    atualizado_em = NOW()
WHERE id = '{{ $json.tenant_id }}'
RETURNING *;
```

---

## 📱 Tratamento de Números do WhatsApp

### Extrair Número de Telefone do WhatsApp
Quando você recebe `351967247471@s.whatsapp.net`, precisa extrair apenas o número e adicionar o `+`:

#### Function Node (JavaScript)
```javascript
// Extrair número do WhatsApp e formatar para E.164
const whatsappId = $json.body.data.key.remoteJid; // "351967247471@s.whatsapp.net"
const phoneNumber = whatsappId.split('@')[0]; // "351967247471"
const phoneE164 = '+' + phoneNumber; // "+351967247471"

return {
  ...items[0].json,
  telefone_whatsapp: whatsappId,
  telefone_e164: phoneE164,
  telefone_numero: phoneNumber
};
```

#### Query para Buscar Usuário por Telefone
```sql
SELECT 
    u.id, u.tenant_id, u.nome, u.email, u.telefone_e164,
    u.perfil, u.status, u.email_verificado, u.criado_em,
    t.nome_fantasia as tenant_nome
FROM public.usuarios u
LEFT JOIN public.tenants t ON u.tenant_id = t.id
WHERE u.telefone_e164 = '{{ $json.telefone_e164 }}'
    AND u.status = 'ativo'
ORDER BY u.nome
LIMIT 1;
```

### Verificar se Usuário Existe (EXISTS)
```sql
SELECT EXISTS (
    SELECT 1 
    FROM public.usuarios u 
    WHERE u.telefone_e164 = '{{ $json.telefone_e164 }}'
        AND u.status = 'ativo'
) as usuario_existe;
```

### Query Completa com Validação
```sql
-- Buscar usuário e verificar se existe
WITH usuario_encontrado AS (
    SELECT 
        u.id, u.tenant_id, u.nome, u.email, u.telefone_e164,
        u.perfil, u.status, u.email_verificado, u.criado_em,
        t.nome_fantasia as tenant_nome,
        t.status as tenant_status
    FROM public.usuarios u
    LEFT JOIN public.tenants t ON u.tenant_id = t.id
    WHERE u.telefone_e164 = '{{ $json.telefone_e164 }}'
        AND u.status = 'ativo'
        AND t.status = 'ativo'
    LIMIT 1
)
SELECT 
    *,
    CASE 
        WHEN id IS NOT NULL THEN true 
        ELSE false 
    END as usuario_existe
FROM usuario_encontrado;
```

---

## 🔄 Exemplos de Workflows

### Workflow 1: Sincronização de Dados
```
1. Webhook Trigger (recebe dados)
2. PostgreSQL Node (busca dados existentes)
3. IF Node (verifica se existe)
4. PostgreSQL Node (INSERT ou UPDATE)
5. Response Node (retorna resultado)
```

### Workflow 2: Relatório Automático
```
1. Cron Trigger (diário às 08:00)
2. PostgreSQL Node (busca transações do dia anterior)
3. Function Node (processa dados)
4. Email Node (envia relatório)
```

### Workflow 3: Validação de Dados
```
1. Webhook Trigger
2. Function Node (valida dados)
3. IF Node (dados válidos?)
4. PostgreSQL Node (salva dados)
5. Response Node (sucesso/erro)
```

---

## 🛡️ Melhores Práticas

### Segurança
1. **Sempre use parâmetros** em vez de concatenar strings
2. **Valide dados** antes de inserir no banco
3. **Use transações** para operações críticas
4. **Limite resultados** com LIMIT
5. **Use índices** nas colunas de busca frequente

### Performance
1. **Evite SELECT \*** em tabelas grandes
2. **Use EXPLAIN** para analisar queries
3. **Implemente paginação** para listas grandes
4. **Cache resultados** quando possível

### Monitoramento
1. **Log todas as operações** importantes
2. **Monitore tempo de execução** das queries
3. **Alerte sobre falhas** de conexão
4. **Backup regular** dos dados

### Exemplo de Query com Validação
```sql
-- Validação antes de inserir
DO $$
BEGIN
    -- Verifica se o tenant existe e está ativo
    IF NOT EXISTS (
        SELECT 1 FROM public.tenants 
        WHERE id = '{{ $json.tenant_id }}' 
        AND status = 'ativo'
    ) THEN
        RAISE EXCEPTION 'Tenant não encontrado ou inativo';
    END IF;
    
    -- Insere a transação
    INSERT INTO public.transacoes (
        id, tenant_id, usuario_id, tipo, categoria,
        descricao, valor_cents, data, origem
    ) VALUES (
        gen_random_uuid(),
        '{{ $json.tenant_id }}',
        '{{ $json.usuario_id }}',
        '{{ $json.tipo }}',
        '{{ $json.categoria }}',
        '{{ $json.descricao }}',
        {{ $json.valor_cents }},
        '{{ $json.data }}',
        'api'
    );
END $$;
```

---

## 📞 Suporte

Para dúvidas específicas sobre implementação ou problemas com queries, consulte:
- Documentação do n8n: https://docs.n8n.io/
- PostgreSQL Docs: https://www.postgresql.org/docs/
- Logs do sistema GestaSaaS

---

**Última atualização:** $(date)
**Versão:** 1.0