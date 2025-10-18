# GestaSaaS Backend

Backend do sistema de gestão SaaS multi-tenant desenvolvido com NestJS, TypeORM e MySQL.

## 🚀 Tecnologias

- **NestJS** - Framework Node.js para aplicações escaláveis
- **TypeORM** - ORM para TypeScript e JavaScript
- **MySQL** - Banco de dados relacional
- **JWT** - Autenticação baseada em tokens
- **Swagger** - Documentação automática da API
- **bcryptjs** - Hash de senhas
- **Passport** - Middleware de autenticação

## 📋 Pré-requisitos

- Node.js 18+ 
- MySQL 8.0+
- npm ou yarn

## 🔧 Instalação

1. **Clone o repositório**
```bash
git clone <repository-url>
cd gestasaas/backend
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:
- Configurações do banco de dados MySQL
- Chaves JWT (gere chaves seguras para produção)
- Outras configurações conforme necessário

4. **Configure o banco de dados**
```bash
# Crie o banco de dados MySQL
mysql -u root -p
CREATE DATABASE gestasaas;
```

5. **Execute as migrações**
```bash
npm run migration:run
```

6. **Execute os seeds iniciais**
```bash
npm run seed:run
```

## 🏃‍♂️ Executando a aplicação

```bash
# Desenvolvimento
npm run start:dev

# Produção
npm run build
npm run start:prod
```

A aplicação estará disponível em `http://localhost:3001`

## 📚 Documentação da API

Acesse a documentação Swagger em: `http://localhost:3001/api/docs`

## 🔐 Credenciais Iniciais

Após executar os seeds, você terá:

- **Super Admin**: admin@gestasaas.com / SuperAdmin@123
- **Planos**: Básico, Profissional, Empresarial
- **Gateway**: Transferência Bancária

## 🏗️ Estrutura do Projeto

```
src/
├── modules/           # Módulos da aplicação
│   ├── auth/         # Autenticação e autorização
│   ├── tenancy/      # Gestão de tenants
│   ├── usuarios/     # Gestão de usuários
│   ├── planos/       # Gestão de planos e recursos
│   ├── assinaturas/  # Gestão de assinaturas
│   ├── pagamentos/   # Gestão de pagamentos
│   ├── financeiro/   # Gestão financeira
│   ├── km/           # Controle de quilometragem
│   ├── relatorios/   # Relatórios e dashboards
│   ├── configuracoes/ # Configurações do sistema
│   └── auditoria/    # Logs de auditoria
├── database/         # Configurações do banco
│   ├── entities/     # Entidades TypeORM
│   ├── migrations/   # Migrações do banco
│   └── seeds/        # Seeds de dados iniciais
├── common/           # Utilitários e decorators
├── app.module.ts     # Módulo principal
└── main.ts          # Arquivo de entrada
```

## 🔒 Segurança

- **JWT** com refresh tokens
- **RBAC** (Role-Based Access Control)
- **Rate Limiting** para proteção contra ataques
- **Helmet** para headers de segurança
- **CORS** configurado
- **Validação** de dados de entrada
- **Hash** de senhas com bcrypt

## 🧪 Testes

```bash
# Testes unitários
npm run test

# Testes e2e
npm run test:e2e

# Coverage
npm run test:cov
```

## 📦 Scripts Disponíveis

- `npm run start:dev` - Inicia em modo desenvolvimento
- `npm run build` - Compila a aplicação
- `npm run start:prod` - Inicia em modo produção
- `npm run migration:generate` - Gera nova migração
- `npm run migration:run` - Executa migrações
- `npm run seed:run` - Executa seeds
- `npm run lint` - Executa linter
- `npm run test` - Executa testes

## 🌐 Endpoints Principais

### Autenticação
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/refresh` - Refresh token
- `POST /api/v1/auth/impersonate/:tenantId` - Impersonação (super admin)

### Tenants
- `GET /api/v1/tenancy` - Listar tenants
- `POST /api/v1/tenancy` - Criar tenant
- `PUT /api/v1/tenancy/:id` - Atualizar tenant
- `DELETE /api/v1/tenancy/:id` - Remover tenant

### Usuários
- `GET /api/v1/usuarios` - Listar usuários
- `POST /api/v1/usuarios` - Criar usuário
- `PUT /api/v1/usuarios/:id` - Atualizar usuário
- `PATCH /api/v1/usuarios/:id/change-password` - Alterar senha

## 🔄 Multi-tenancy

O sistema implementa multi-tenancy através de:
- Isolamento de dados por `tenantId`
- Middleware de tenant context
- Guards de autorização por tenant
- Validações de acesso cross-tenant

## 📝 Licença

Este projeto é propriedade privada. Todos os direitos reservados.