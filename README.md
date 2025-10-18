# GestaSaaS - Sistema de Gestão SaaS

Sistema completo de gestão SaaS com multi-tenancy, desenvolvido com NestJS (backend) e React + TypeScript (frontend).

## 🚀 Funcionalidades

- **Multi-tenancy**: Suporte completo a múltiplos inquilinos
- **Gestão de Usuários**: Criação, edição e gerenciamento de usuários
- **Gestão de Empresas**: Cadastro e administração de empresas/tenants
- **Planos e Assinaturas**: Sistema de planos e controle de assinaturas
- **Dashboard**: Painel administrativo com métricas e relatórios
- **Autenticação**: Sistema seguro de login e autorização
- **Auditoria**: Log de ações e auditoria do sistema
- **Configurações**: Painel de configurações gerais
- **Relatórios**: Geração de relatórios diversos
- **Financeiro**: Controle financeiro e pagamentos

## 🛠️ Tecnologias

### Backend
- **NestJS** - Framework Node.js
- **TypeScript** - Linguagem de programação
- **SQLite** - Banco de dados
- **TypeORM** - ORM para banco de dados
- **JWT** - Autenticação
- **Swagger** - Documentação da API
- **Class Validator** - Validação de dados

### Frontend
- **React** - Biblioteca JavaScript
- **TypeScript** - Linguagem de programação
- **Vite** - Build tool
- **Tailwind CSS** - Framework CSS
- **Shadcn/ui** - Componentes UI
- **React Query** - Gerenciamento de estado
- **React Router** - Roteamento
- **Lucide React** - Ícones

## 📋 Pré-requisitos

- Node.js (versão 18 ou superior)
- npm ou yarn

## 🔧 Instalação

### 1. Clone o repositório
```bash
git clone <url-do-repositorio>
cd gestaSaaS
```

### 2. Configuração do Backend

```bash
cd backend
npm install
```

Copie o arquivo de exemplo de variáveis de ambiente:
```bash
cp .env.example .env
```

Configure as variáveis no arquivo `.env`:
```env
# Database
DATABASE_URL="file:./database.sqlite"

# JWT
JWT_SECRET="seu-jwt-secret-aqui"
JWT_EXPIRES_IN="7d"

# App
PORT=3000
NODE_ENV="development"
```

Execute as migrações do banco de dados:
```bash
npm run build
npm run start:dev
```

### 3. Configuração do Frontend

```bash
cd ../frontend
npm install
```

Copie o arquivo de exemplo de variáveis de ambiente:
```bash
cp .env.example .env
```

Configure as variáveis no arquivo `.env`:
```env
VITE_API_URL=http://localhost:3000/api/v1
```

## 🚀 Executando o projeto

### Backend
```bash
cd backend
npm run start:dev
```
O backend estará disponível em: `http://localhost:3000`
Documentação da API (Swagger): `http://localhost:3000/api`

### Frontend
```bash
cd frontend
npm run dev
```
O frontend estará disponível em: `http://localhost:5173`

## 📁 Estrutura do Projeto

```
gestaSaaS/
├── backend/                 # API NestJS
│   ├── src/
│   │   ├── modules/        # Módulos da aplicação
│   │   │   ├── usuarios/   # Gestão de usuários
│   │   │   ├── tenants/    # Gestão de empresas
│   │   │   ├── planos/     # Gestão de planos
│   │   │   └── ...
│   │   ├── database/       # Configuração do banco
│   │   └── main.ts         # Arquivo principal
│   ├── database.sqlite     # Banco de dados SQLite
│   └── package.json
├── frontend/               # Interface React
│   ├── src/
│   │   ├── components/     # Componentes reutilizáveis
│   │   ├── pages/          # Páginas da aplicação
│   │   ├── services/       # Serviços de API
│   │   ├── types/          # Tipos TypeScript
│   │   └── ...
│   └── package.json
└── README.md
```

## 🔐 Autenticação

O sistema utiliza JWT para autenticação. Após o login, o token é armazenado no localStorage e enviado em todas as requisições.

### Perfis de Usuário
- **super_admin**: Acesso total ao sistema
- **cliente_admin**: Administrador de empresa/tenant
- **cliente_usuario**: Usuário comum da empresa

## 📊 API

A documentação completa da API está disponível via Swagger em:
`http://localhost:3000/api`

### Principais endpoints:
- `POST /auth/login` - Login
- `GET /usuarios` - Listar usuários
- `POST /usuarios` - Criar usuário
- `PATCH /usuarios/:id` - Atualizar usuário
- `GET /tenants` - Listar empresas
- `POST /tenants` - Criar empresa
- `GET /planos` - Listar planos

## 🧪 Testes

### Backend
```bash
cd backend
npm run test
npm run test:e2e
```

### Frontend
```bash
cd frontend
npm run test
```

## 📦 Build para Produção

### Backend
```bash
cd backend
npm run build
npm run start:prod
```

### Frontend
```bash
cd frontend
npm run build
```

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

Para suporte, entre em contato através do email: [seu-email@exemplo.com]

## 🔄 Changelog

### v1.0.0
- Versão inicial do sistema
- Implementação de multi-tenancy
- Sistema de autenticação
- CRUD de usuários, empresas e planos
- Dashboard administrativo
- Sistema de auditoria

---

Desenvolvido com ❤️ por [Seu Nome]