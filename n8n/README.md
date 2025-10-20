# GestaSaaS - Workflows n8n

Este diretório contém os workflows do n8n para integração do sistema GestaSaaS com WhatsApp e operações CRUD via API.

## 📁 Arquivos

- `gestasaas-whatsapp-workflow.json` - Workflow principal para interação via WhatsApp
- `gestasaas-crud-operations.json` - Workflow para operações CRUD via API
- `postgresql-guide.md` - Guia de configuração do PostgreSQL
- `README.md` - Esta documentação

## 🚀 Configuração Inicial

### 1. Credenciais Necessárias

Antes de importar os workflows, configure as seguintes credenciais no n8n:

#### PostgreSQL
- **Nome:** `postgres-gestasaas`
- **Host:** Seu servidor PostgreSQL
- **Database:** gestasaas
- **Username:** Usuário do banco
- **Password:** Senha do banco
- **Port:** 5432 (padrão)

#### OpenAI (para IA)
- **Nome:** `openai-gestasaas`
- **API Key:** Sua chave da OpenAI

#### Evolution API (para WhatsApp)
- **URL Base:** https://sua-evolution-api.com
- **API Key:** Sua chave da Evolution API
- **Instance Name:** Nome da instância WhatsApp

### 2. Variáveis de Ambiente

Configure as seguintes variáveis no n8n:

```env
EVOLUTION_API_URL=https://sua-evolution-api.com
EVOLUTION_API_KEY=sua-chave-api
EVOLUTION_INSTANCE=gestasaas
OPENAI_API_KEY=sua-chave-openai
```

## 📱 Workflow WhatsApp (`gestasaas-whatsapp-workflow.json`)

### Funcionalidades

- ✅ Validação de usuário por número de telefone
- ✅ Isolamento de dados por tenant
- ✅ Menu interativo via WhatsApp
- ✅ Listagem de transações
- ✅ Relatórios financeiros
- ✅ Assistente IA (Sofia)
- ✅ Integração com Evolution API

### Comandos Disponíveis

| Comando | Descrição |
|---------|-----------|
| `menu` ou `ajuda` | Exibe menu principal |
| `transacoes` ou `extrato` | Lista últimas transações |
| `nova transacao` | Guia para adicionar transação |
| `editar transacao` | Guia para editar transação |
| `excluir transacao` | Guia para excluir transação |
| `relatorio` | Relatório financeiro dos últimos 30 dias |
| `perfil` | Dados do usuário |

### Fluxo de Funcionamento

1. **Webhook WhatsApp** recebe mensagem
2. **Processar Dados** extrai número e comando
3. **Validar Dados** verifica estrutura da mensagem
4. **Buscar Usuário** consulta no banco de dados
5. **Switch Comandos** direciona para função específica
6. **Assistente IA** processa mensagens não estruturadas
7. **Evolution API** envia resposta via WhatsApp

### Exemplo de Uso

```
Usuário: menu
Bot: 🏠 Menu Principal - GestaSaaS
     Olá, João! 👋
     [opções do menu...]

Usuário: transacoes
Bot: 📋 Extrato - Últimas 10 Transações
     [lista de transações...]

Usuário: Como adicionar uma nova corrida?
IA: Olá! Para adicionar uma nova transação...
```

## 🔧 Workflow CRUD (`gestasaas-crud-operations.json`)

### Operações Disponíveis

- **CREATE** - Criar nova transação
- **UPDATE** - Atualizar transação existente
- **DELETE** - Excluir transação
- **SEARCH** - Buscar transações com filtros

### Endpoint

```
POST /webhook/gestasaas-crud
```

### Estrutura de Requisição

#### Criar Transação
```json
{
  "operation": "create",
  "user_id": "uuid-do-usuario",
  "tenant_id": "uuid-do-tenant",
  "data": {
    "tipo": "entrada",
    "categoria": "plataforma",
    "valor_cents": 2500,
    "descricao": "Corrida Centro-Aeroporto",
    "km": 15.5,
    "data": "2024-10-20",
    "observacoes": "Cliente pagou em dinheiro"
  }
}
```

#### Atualizar Transação
```json
{
  "operation": "update",
  "user_id": "uuid-do-usuario",
  "tenant_id": "uuid-do-tenant",
  "transaction_id": "uuid-da-transacao",
  "data": {
    "valor_cents": 2800,
    "descricao": "Corrida Centro-Aeroporto (atualizada)"
  }
}
```

#### Excluir Transação
```json
{
  "operation": "delete",
  "user_id": "uuid-do-usuario",
  "tenant_id": "uuid-do-tenant",
  "transaction_id": "uuid-da-transacao"
}
```

#### Buscar Transações
```json
{
  "operation": "search",
  "user_id": "uuid-do-usuario",
  "tenant_id": "uuid-do-tenant",
  "search_params": {
    "tipo": "entrada",
    "categoria": "plataforma",
    "data_inicio": "2024-10-01",
    "data_fim": "2024-10-31",
    "valor_min_cents": 1000,
    "valor_max_cents": 5000,
    "descricao": "aeroporto",
    "order_by": "data",
    "order_direction": "DESC",
    "limit": 20,
    "offset": 0
  }
}
```

### Respostas

#### Sucesso
```json
{
  "success": true,
  "error": false,
  "operation": "create",
  "message": "Transação criada com sucesso",
  "data": {
    "id": "uuid-da-transacao",
    "tipo": "entrada",
    "categoria": "plataforma",
    "valor_reais": 25.00,
    "descricao": "Corrida Centro-Aeroporto",
    "km": 15.5,
    "data": "2024-10-20",
    "criado_em": "2024-10-20T15:30:00Z"
  },
  "timestamp": "2024-10-20T15:30:00Z"
}
```

#### Erro
```json
{
  "success": false,
  "error": true,
  "message": "Campos obrigatórios ausentes: tipo, categoria",
  "details": {
    "missing_fields": ["tipo", "categoria"]
  },
  "timestamp": "2024-10-20T15:30:00Z"
}
```

## 🔒 Segurança

### Isolamento por Tenant

Todos os workflows implementam isolamento rigoroso por tenant:

- Validação de `user_id` e `tenant_id` em todas as operações
- Queries sempre incluem filtro por tenant
- Usuários só acessam dados do próprio tenant

### Validações Implementadas

1. **Estrutura de dados** - Campos obrigatórios
2. **Tipos de dados** - Validação de formatos
3. **Autorização** - Usuário ativo e tenant válido
4. **Categorias** - Validação de categorias por tipo
5. **Valores** - Conversão segura de valores monetários

## 📊 Categorias de Transações

### Entradas
- `plataforma` - Ganhos da plataforma (Uber, 99, etc.)
- `gorjeta` - Gorjetas recebidas
- `bonus` - Bônus e promoções
- `outros_ganhos` - Outros tipos de ganhos

### Saídas
- `combustivel` - Gastos com combustível
- `manutencao` - Manutenção do veículo
- `taxas` - Taxas da plataforma
- `pedagio` - Pedágios
- `alimentacao` - Alimentação durante trabalho
- `estacionamento` - Estacionamento
- `outros_gastos` - Outros gastos

## 🛠️ Instalação

### 1. Importar Workflows

1. Acesse seu n8n
2. Vá em **Workflows** > **Import from file**
3. Importe `gestasaas-whatsapp-workflow.json`
4. Importe `gestasaas-crud-operations.json`

### 2. Configurar Credenciais

1. Configure as credenciais PostgreSQL
2. Configure as credenciais OpenAI
3. Configure as variáveis da Evolution API

### 3. Ativar Workflows

1. Ative o workflow WhatsApp
2. Ative o workflow CRUD
3. Teste os webhooks

### 4. Configurar Evolution API

Configure o webhook da Evolution API para apontar para:
```
https://seu-n8n.com/webhook/whatsapp-webhook
```

## 🧪 Testes

### Testar Workflow WhatsApp

1. Envie mensagem "menu" para o WhatsApp configurado
2. Verifique se recebe o menu principal
3. Teste comandos como "transacoes", "relatorio"

### Testar Workflow CRUD

```bash
# Criar transação
curl -X POST https://seu-n8n.com/webhook/gestasaas-crud \
  -H "Content-Type: application/json" \
  -d '{
    "operation": "create",
    "user_id": "seu-user-id",
    "tenant_id": "seu-tenant-id",
    "data": {
      "tipo": "entrada",
      "categoria": "plataforma",
      "valor_cents": 2500,
      "descricao": "Teste de corrida"
    }
  }'
```

## 📈 Monitoramento

### Logs Importantes

- Execuções dos workflows
- Erros de validação
- Falhas de conexão com APIs
- Performance das queries

### Métricas

- Tempo de resposta dos workflows
- Taxa de sucesso das operações
- Volume de mensagens processadas
- Uso de recursos do banco

## 🔧 Troubleshooting

### Problemas Comuns

#### 1. Usuário não encontrado
- Verificar se telefone está no formato E.164
- Confirmar se usuário está ativo
- Validar tenant_id

#### 2. Erro de conexão PostgreSQL
- Verificar credenciais
- Testar conectividade
- Verificar firewall

#### 3. Evolution API não responde
- Verificar URL e API key
- Confirmar instância ativa
- Testar webhook manualmente

#### 4. IA não funciona
- Verificar chave OpenAI
- Confirmar créditos disponíveis
- Testar API diretamente

### Debug

Para debugar os workflows:

1. Ative logs detalhados no n8n
2. Use o modo de execução manual
3. Verifique dados entre nodes
4. Monitore logs do PostgreSQL

## 📞 Suporte

Para suporte técnico:

1. Verifique logs dos workflows
2. Consulte esta documentação
3. Teste componentes individualmente
4. Entre em contato com a equipe técnica

---

**Versão:** 1.0  
**Última atualização:** 20/10/2024  
**Compatibilidade:** n8n v1.0+, PostgreSQL 12+