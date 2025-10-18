### PARTE 1 — Visão, Princípios e Arquitetura

Título: Gesta SaaS Financeiro — Leve, Modular, Multi-idioma e Multi-moeda

Objetivo do Produto (MVP pronto para vender):

Criar um SaaS de gestão financeira para motoristas de aplicativo, estafetas e pequenas frotas, com:

    Painel Super Admin: 
        Gestão de clientes (tenants), usuários, planos/recursos, gateways, assinaturas/pagamentos, configurações globais, auditoria, “entrar como cliente” (impersonate).
    Painel do Cliente: 
        Dashboard modular, entradas/saídas, KM diário (opcional), relatórios simples/completos, assinatura e configurações pessoais.
    APIs Públicas: 
        Integrações via n8n (e então Evolution API/WhatsApp) consumindo somente nossas APIs. Sem acoplamento interno ao Evolution.

    Leveza: 
        Backend enxuto (NestJS recomendado), frontend com Tailwind + ShadCN, banco limpo em PT-BR, sem campos de código (nada de textarea JSON para o usuário).

    Localização real: 
        Idioma, moeda e país independentes (ex.: idioma pt-BR + moeda EUR + país PT).

Princípios de Engenharia:

    Modularidade: módulos autocontenidos (auth, tenancy, usuários, planos, assinaturas, pagamentos, financeiro, km, relatórios, configurações, auditoria, metas).

    Simplicidade: endpoints REST estáveis; UI clara; formulários tipados.

    Segurança e isolamento: JWT + RBAC; multi-tenancy por tenant_id em todas as queries.

    Observabilidade mínima viável: logs estruturados e auditoria de ações sensíveis.

    Escalabilidade futura: módulos, frota, notificações, exportações, sem retrabalho estrutural.

### PARTE 2 — Banco de Dados (PostgreSQL em PT-BR) + Regras

Gerar arquivo database.sql. Nomes de tabelas/colunas em português (snake_case). Índices e constraints explícitos. Sem campos JSON em telas; quando o backend precisar, converte internamente a partir de forms amigáveis.

-- Extensões úteis
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS uuid-ossp;

-- =========================
-- TENANCY E USUÁRIOS
-- =========================
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_fantasia TEXT NOT NULL,
  razao_social TEXT,
  documento TEXT,               -- CPF/CNPJ opcional
  email TEXT,
  telefone_e164 TEXT,           -- recomendado (contato), NÃO obrigatório
  cod_pais CHAR(2) NOT NULL DEFAULT 'BR',     -- ISO 3166-1 alpha-2 (ex.: BR, PT)
  idioma_preferido TEXT NOT NULL DEFAULT 'pt-BR', -- IETF (pt-BR, pt-PT, en-US)
  moeda_preferida CHAR(3) NOT NULL DEFAULT 'BRL', -- ISO 4217 (BRL, EUR, USD)
  status TEXT NOT NULL DEFAULT 'ativo',       -- ativo, suspenso, cancelado
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_tenants_status ON tenants(status);

CREATE TABLE usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone_e164 TEXT NOT NULL,   -- OBRIGATÓRIO (n8n/WhatsApp identifica usuário por aqui)
  senha_hash TEXT NOT NULL,
  perfil TEXT NOT NULL DEFAULT 'cliente_user', -- super_admin, cliente_admin, cliente_user
  idioma_preferido TEXT,          -- override do tenant (opcional)
  moeda_preferida CHAR(3),        -- override (opcional)
  cod_pais CHAR(2),               -- override (opcional)
  status TEXT NOT NULL DEFAULT 'ativo',
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, email),
  UNIQUE (tenant_id, telefone_e164)
);
CREATE INDEX idx_usuarios_tenant ON usuarios(tenant_id);
CREATE INDEX idx_usuarios_perfil ON usuarios(perfil);

-- =========================
-- PLANOS, RECURSOS E ASSINATURAS (SEM JSON NA UI)
-- =========================
CREATE TABLE planos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,                        -- Teste Grátis, Gestão Básica, Gestão Premium
  status TEXT NOT NULL DEFAULT 'ativo',      -- ativo, inativo
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE recursos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chave TEXT NOT NULL,                       -- ex.: dashboard_basico, grafico_periodo, export_csv, relatorio_avancado, kpi_custo_km
  descricao TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'boolean',      -- boolean | int | text
  UNIQUE (chave)
);

CREATE TABLE plano_recursos (
  plano_id UUID NOT NULL REFERENCES planos(id) ON DELETE CASCADE,
  recurso_id UUID NOT NULL REFERENCES recursos(id) ON DELETE CASCADE,
  valor_texto TEXT,                          -- "true"/"false" ou números/textos conforme tipo
  PRIMARY KEY (plano_id, recurso_id)
);

CREATE TABLE assinaturas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  plano_id UUID NOT NULL REFERENCES planos(id),
  ciclo TEXT NOT NULL DEFAULT 'mensal',      -- mensal | trimestral | semestral | anual
  preco_cents INTEGER NOT NULL DEFAULT 0,
  moeda CHAR(3) NOT NULL DEFAULT 'BRL',
  status TEXT NOT NULL DEFAULT 'ativa',      -- ativa, pendente, expirada, cancelada
  status_pagamento TEXT NOT NULL DEFAULT 'pendente', -- pendente, pago, falhou
  inicio_em DATE NOT NULL DEFAULT CURRENT_DATE,
  fim_em DATE,
  renovacao_automatica BOOLEAN NOT NULL DEFAULT TRUE,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_assinaturas_tenant ON assinaturas(tenant_id);
CREATE INDEX idx_assinaturas_status ON assinaturas(status);

-- =========================
-- GATEWAYS E PAGAMENTOS
-- =========================
CREATE TABLE gateways (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,                         -- Stripe, PayPal, MercadoPago, Pix, MBWay, Transferencia
  tipo TEXT NOT NULL,                         -- online, offline
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE credenciais_gateway (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gateway_id UUID NOT NULL REFERENCES gateways(id) ON DELETE CASCADE,
  chave TEXT NOT NULL,                        -- ex.: public_key, secret_key, merchant_id, webhook_url
  valor TEXT NOT NULL,                        -- armazenado cifrado no app
  UNIQUE (gateway_id, chave)
);

CREATE TABLE pagamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assinatura_id UUID NOT NULL REFERENCES assinaturas(id) ON DELETE CASCADE,
  gateway_id UUID REFERENCES gateways(id),
  valor_cents INTEGER NOT NULL,
  moeda CHAR(3) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente',    -- pendente, aprovado, falhou, estornado
  referencia_externa TEXT,                    -- id externo (n8n/checkout)
  comprovante_url TEXT,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_pagamentos_assinatura ON pagamentos(assinatura_id);
CREATE INDEX idx_pagamentos_status ON pagamentos(status);

-- =========================
-- FINANCEIRO E KM DIÁRIO
-- =========================
CREATE TABLE transacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  usuario_id UUID REFERENCES usuarios(id),
  tipo TEXT NOT NULL,                         -- entrada, saida
  categoria TEXT NOT NULL,                    -- combustivel, manutencao, taxas, pedagio, plataforma, gorjeta...
  descricao TEXT,
  valor_cents INTEGER NOT NULL,
  km NUMERIC(10,2),                           -- opcional por transação
  data DATE NOT NULL,
  origem TEXT NOT NULL DEFAULT 'web',         -- web, api, importacao
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_transacoes_tenant_data ON transacoes(tenant_id, data);
CREATE INDEX idx_transacoes_tipo ON transacoes(tipo);
CREATE INDEX idx_transacoes_categoria ON transacoes(categoria);

CREATE TABLE km_diario (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  usuario_id UUID REFERENCES usuarios(id),
  data DATE NOT NULL,
  km_inicio NUMERIC(10,2),
  km_fim NUMERIC(10,2),
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, data)
);
CREATE INDEX idx_km_diario_tenant_data ON km_diario(tenant_id, data);

-- =========================
-- CONFIGURAÇÕES TIPADAS E AUDITORIA
-- =========================
CREATE TABLE configuracoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE, -- null = global
  chave TEXT NOT NULL,                                     -- ex.: timezone, formato_data
  valor TEXT NOT NULL,
  UNIQUE (tenant_id, chave)
);

CREATE TABLE auditoria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID,
  usuario_id UUID,
  acao TEXT NOT NULL,                                      -- ex.: criar_transacao, login, alterar_plano
  entidade TEXT,                                           -- ex.: transacoes
  entidade_id UUID,
  ip TEXT,
  user_agent TEXT,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_auditoria_tenant ON auditoria(tenant_id);

Regras essenciais do modelo:

    Usuário precisa de telefone_e164 obrigatório (formato E.164: +5511999999999) — integrações externas (n8n/WhatsApp) localizarão o usuário por telefone e tenant_id.

    Idioma/Moeda/País definidos no tenant e com override por usuário (quando definidos).

    Recursos de plano: sem JSON na UI. O relacionamento plano_recursos viabiliza checkboxes/inputs (o backend transforma internamente quando precisar).

    Integridade de moeda: valores sempre em centavos (inteiros). UI formata conforme idioma/moeda.

    Origem em transacoes: registrar se foi web (painel) ou api (n8n).

    Índices por tenant_id em tudo que é consultado por cliente ⇒ performance em multi-tenancy.

### PARTE 3 — Backend (NestJS enxuto), Módulos e Endpoints

Stack: NestJS + TypeScript + JWT + RBAC.
Padrões: DTOs com validações; pipes para parse de moeda/data; guards de perfil; interceptors de auditoria.

Módulos:

auth
    POST /auth/login (email, senha) → JWT/refresh.
    POST /auth/recuperar-senha (token/expiração, envio por e-mail).
    Guard de RBAC: super_admin, cliente_admin, cliente_user.
tenancy
    GET/POST/PATCH /tenants (super_admin).
    POST /tenants/{id}/impersonate (gera token temporário para “entrar como cliente”).
    Regras: país/idioma/moeda obrigatórios; status (ativo/suspenso/cancelado).
usuarios
    GET/POST/PATCH /usuarios (respeitando tenant_id).
    Filtros: nome, email, telefone, perfil, status.
    Telefone E.164 obrigatório.
    Possível override por usuário: idioma/moeda/país.
planos, recursos e plano_recursos
    CRUD de planos e recursos.
    Atribuições via plano_recursos com telas amigáveis (checkbox/inputs) — nunca JSON.
    Endpoint específico: POST /planos/{planoId}/recursos/{recursoId} com valor_texto.
assinaturas
    GET/POST/PATCH /assinaturas (por tenant).
    Estados: pendente, ativa, expirada, cancelada; status_pagamento: pendente, pago, falhou.
        Ciclos: mensal, trimestral, semestral, anual.
        Integração com pagamento é externa via n8n → nós apenas expomos pagamentos.
pagamentos
    POST /pagamentos (criar); PATCH /pagamentos/{id} (atualizar status/refs).
    Campo referencia_externa para idempotência (n8n reenvia).
    Ao aprovar pagamento, atualizar assinaturas.status_pagamento e ciclo.
financeiro
    GET/POST/PATCH /transacoes (CRUD).
    Filtros: período, tipo, categoria, faixa de valor, origem.
    Pipes: converter valor (string máscara) → valor_cents (int).
    Datas: aceitar DD/MM/AAAA e normalizar para YYYY-MM-DD.

km
    POST /km/iniciar (data + km_inicio, único por dia/tenant).
    POST /km/encerrar (data + km_fim).
    GET /km?inicio=YYYY-MM-DD&fim=....

relatorios
    GET /relatorios/simples?periodo=hoje|ontem|semana|mes|... → totais entradas/saídas/lucro.
    GET /relatorios/completo?inicio=YYYY-MM-DD&fim=YYYY-MM-DD → por categoria, custo/km (se existir KM).
    Exportação CSV somente quando recurso export_csv estiver ativo (gera arquivo e URL temporária).

configuracoes
    GET/POST /configuracoes (tipos simples: timezone, formato_data, separador_decimal, etc.).
    Sem JSON na UI; pares chave/valor bem rotulados.

auditoria
    Interceptor registra: quem, o quê, quando, IP, user agent.
    GET /auditoria (super_admin; cliente vê apenas seu tenant).

Contexto de Localização (locale/currency/country):
    Em cada request autenticada:
        idioma_efetivo = usuário.idioma_preferido || tenant.idioma_preferido
        moeda_efetiva = usuário.moeda_preferida || tenant.moeda_preferida
        pais_efetivo = usuário.cod_pais || tenant.cod_pais

### PARTE 4 — Frontend (React + Tailwind + ShadCN) e UI Sem Código

Dependências recomendadas (instale):

    Core/estado: react, react-dom, react-router-dom, @tanstack/react-query, zustand, clsx, class-variance-authority, tailwind-merge
    Estilo/UI: tailwindcss, postcss, autoprefixer, shadcn-ui (via CLI), @radix-ui/* (implícito)
    Ícones e gráficos: lucide-react, recharts
    Formulários: react-hook-form, zod, @hookform/resolvers
    i18n: i18next, react-i18next
    Datas e números: date-fns (parse/format), Intl.NumberFormat nativo (moeda)
    Toasts: sonner
    Tabelas: @tanstack/react-table
    API: axios, jwt-decode

Layout padrão (Cliente & Admin):

    Topbar/Header: logo + título + menu usuário com Meu Perfil, Configurações, Meu Plano, Sair.
    Sidebar colapsável: Dashboard, Financeiro (Entradas, Saídas, KM, Relatórios), Assinatura, Configurações, Ajuda; Admin tem sessões extra (Tenants, Usuários, Planos, Gateways, Assinaturas, Auditoria).
    Page Header (secundário): breadcrumbs + ações de contexto.

Formulários SEM código/JSON (exemplos):

    Planos: 
        “Nome”, “Status”; tabela de “Recursos do Plano” com linhas (Recurso, Descrição, Tipo, Valor) → UI controla checkbox/inputs; backend recebe valores atômicos e preenche plano_recursos.
    Gateways: 
        telas por provedor com campos nomeados (Public Key, Secret Key, Webhook URL, etc.). Nunca textarea JSON.
    Transações: 
        tipo (entrada/saída), categoria (select com autocomplete), valor (máscara PT-BR), km opcional, data (DD/MM/AAAA), descrição.
    KM Diário: 
        “Iniciar dia” (km_inicio) / “Encerrar dia” (km_fim), 1 registro por data.
    Configurações: 
        idioma (select IETF), moeda (ISO-4217), país (ISO-3166), timezone, formato de data — todos campos simples.

Dashboard modular por plano:

    Teste Grátis: cartões Entradas/Saídas/Lucro + últimas 5 transações.
    Gestão Básica: adiciona gráfico semanal/mensal + tabela por categoria.
    Gestão Premium: inclui KPI custo/km, ranking por plataforma, Exportar CSV.

Internacionalização real:

    Carregar locale do usuário/tenant na sessão.
    useTranslation() e Intl.NumberFormat(locale, { style: 'currency', currency }) para exibir textos e moeda.
    Ex.: idioma pt-BR com moeda EUR → interface PT-BR + €.

### PARTE 5 — APIs Públicas para Integração (n8n/WhatsApp)

O n8n é quem conversa com Evolution API/WhatsApp. Nosso sistema expõe contratos REST simples e estáveis.

Autenticação para integrações:

    Token de serviço (Bearer) ou usuário dedicado com escopo api.

Operações típicas (exemplos):

    1. Descobrir usuário por telefone (para vincular conversa):
        GET /usuarios?telefone_e164=%2B351912345678&tenant_id=<uuid>

    2. Criar entrada/saída a partir de mensagem parseada no n8n:
        POST /transacoes

            {
            "tenant_id": "uuid-do-tenant",
            "usuario_id": "uuid-do-usuario",
            "tipo": "entrada",
            "categoria": "plataforma",
            "descricao": "Uber aeroporto",
            "valor_cents": 12050,
            "km": 12.4,
            "data": "2025-10-17",
            "origem": "api"
            }


KM diário:
    POST /km/iniciar → { "tenant_id":"...", "usuario_id":"...", "data":"2025-10-17", "km_inicio":45678.9 }
    POST /km/encerrar → { "tenant_id":"...", "usuario_id":"...", "data":"2025-10-17", "km_fim":45798.2 }

Resumo para resposta automática no WhatsApp:
    GET /relatorios/simples?tenant_id=...&periodo=semana

Pagamento (checkout externo confirma):
POST /pagamentos (criar rascunho)
PATCH /pagamentos/{id} → { "status":"aprovado", "referencia_externa":"..." }
→ atualizar assinaturas.status_pagamento = 'pago'.

Boas práticas técnicas:

    Idempotência por referencia_externa.
    Auditoria origem=api em todas as gravações vindas do n8n.
    Rate limit básico em endpoints públicos.

### PARTE 6 — Validações, Segurança, Performance e Acessibilidade

Validações (backend e frontend):

Telefone E.164 obrigatório (regex robusta; normalizar + remover espaços).
Moeda (ISO-4217 3 letras), País (ISO-3166-1 alpha-2), Idioma (IETF).
Valores monetários: front em máscara PT-BR → back normaliza para centavos (inteiros).
Datas: aceitar DD/MM/AAAA no front e persistir YYYY-MM-DD.
KM: decimal, permitir vírgula no front → normalizar ponto no back.

Segurança e RBAC:

    JWT curto + refresh; invalidar ao trocar senha.
    Guard de tenant: tudo filtra por tenant_id.
    Impersonate (apenas super_admin), token curto e auditado.
    Criptografar credenciais_gateway.valor.
    CORS por allowlist.
    Logs com correlação (request_id).

Performance:

    Índices por tenant_id nas tabelas quentes (transacoes, km_diario, assinaturas, pagamentos).
    Paginação padrão (cursor/offset) em listagens.
    Evitar N+1 no back (use JOINs e SELECT com colunas necessárias).

Acessibilidade (A11y):

    Componentes ShadCN (Radix) já acessíveis.
    Labels em todos inputs; foco visível; contraste suficiente.
    Leitura de gráficos com sumário textual (total, variação).

### PARTE 7 — Seeds, Dependências de UI e Entregáveis

Seeds iniciais (SQL ou script):

Planos:

    Teste Grátis
    Gestão Básica
    Gestão Premium

Recursos (exemplos):

    dashboard_basico (boolean)
    grafico_periodo (boolean)
    export_csv (int)
    relatorio_avancado (boolean)
    kpi_custo_km (boolean)

Plano → Recurso (sugestão):

    Teste Grátis: dashboard_basico=true, grafico_periodo=false, relatorio_avancado=false, kpi_custo_km=false, export_csv=0
    
    Gestão Básica: dashboard_basico=true, grafico_periodo=true, relatorio_avancado=true, kpi_custo_km=false, export_csv=1000
    
    Gestão Premium: tudo true, export_csv=-1 (ilimitado)

    Super Admin padrão (email/senha).
    Gateway “Transferência” ativo para testes.

.env.example:

    NODE_ENV=production
    APP_PORT=8080
    DATABASE_URL=postgres://usuario:senha@host:5432/gesta
    JWT_SECRET=troque_este_valor
    ALLOWLIST_ORIGINS=https://app.seudominio.com


Dependências de UI (instalar):

    npm i react react-dom react-router-dom @tanstack/react-query zustand clsx class-variance-authority tailwind-merge
    npm i tailwindcss postcss autoprefixer && npx tailwindcss init -p
    npx shadcn-ui@latest init
    npx shadcn-ui@latest add button card input label textarea select checkbox dialog dropdown-menu sheet table tabs toast tooltip avatar badge breadcrumb pagination progress separator
    npm i lucide-react recharts
    npm i react-hook-form zod @hookform/resolvers
    npm i i18next react-i18next
    npm i date-fns axios jwt-decode sonner @tanstack/react-table

Entregáveis do MVP:

    DB completo (database.sql) com índices/constraints.
    Backend NestJS com módulos e endpoints acima (documentados por OpenAPI).
    Frontend React com layout (Topbar + Sidebar + Header), menu usuário (Meu Perfil, Configurações, Meu Plano, Sair), telas: Tenants, Usuários, Planos/Recursos, Gateways, Assinaturas, Transações, KM, Relatórios, Configurações, Auditoria.
    APIs públicas consumíveis pelo n8n (criar transações, KM, pagamentos, relatórios).
    Seeds de planos/recursos/super admin/gateway.
    Validações de locale (idioma/moeda/país) funcionando ponta-a-ponta.
    Auditoria básica e logs.

### PARTE 8 — Conclusão e Melhorias Futuras

Conclusão (racional de arquitetura):

    O sistema foi desenhado para ser leve e modular, com multi-tenancy forte, multi-idioma/moeda real, e integrações externas via APIs públicas (n8n/WhatsApp), evitando qualquer acoplamento ao Evolution API.
    UI sem campos de código/JSON garante operação amigável e reduz suporte.
    Recursos de plano foram normalizados em tabelas (sem JSON em tela), habilitando feature flags claras e seguras.
    Valores em centavos, datas normalizadas e telefone E.164 evitam ambiguidade e erros comuns.
    Índices por tenant_id, paginação e DTOs tipados asseguram performance e robustez desde o MVP.

Melhorias Futuras (prontas para plugar):

    Módulo Metas (diárias/semanais/mensais) + lembretes via n8n/WhatsApp/Email.
    Módulo Frota (vários veículos/condutores por tenant).
    Conversão cambial (tabela taxas_cambio) com jobs diários.
    Exportações avançadas (PDF assinado, planilhas multi-aba).
    Notificações centralizadas (canal e template por evento).
    SDK JS/TS de cliente para parceiros integrarem-se mais rápido.