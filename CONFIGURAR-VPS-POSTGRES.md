# Guia para Configurar PostgreSQL no VPS

## Status Atual
- ✅ Frontend rodando em: http://localhost:5173/
- ⚠️ Backend configurado para banco local (temporário)
- ❌ PostgreSQL no VPS não está acessível externamente

## Problema Identificado
A porta 5432 do PostgreSQL não está acessível no VPS (148.230.118.81). Isso pode ser devido a:
1. PostgreSQL não instalado
2. PostgreSQL não configurado para aceitar conexões externas
3. Firewall bloqueando a porta 5432

## Solução: Configurar PostgreSQL no VPS

### Passo 1: Conectar ao VPS via SSH
```bash
ssh root@148.230.118.81
# Senha: Samuel2029#@
```

### Passo 2: Instalar PostgreSQL (se não estiver instalado)
```bash
# Atualizar sistema
apt update

# Instalar PostgreSQL
apt install -y postgresql postgresql-contrib

# Verificar instalação
which psql
```

### Passo 3: Configurar PostgreSQL
```bash
# Iniciar e habilitar PostgreSQL
systemctl start postgresql
systemctl enable postgresql

# Configurar senha do usuário postgres
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'Samuel2029#@';"

# Criar banco de dados gestasaas
sudo -u postgres createdb gestasaas
```

### Passo 4: Configurar Acesso Externo
```bash
# Editar postgresql.conf para aceitar conexões externas
echo "listen_addresses = '*'" >> /etc/postgresql/*/main/postgresql.conf

# Editar pg_hba.conf para permitir autenticação MD5
echo "host all all 0.0.0.0/0 md5" >> /etc/postgresql/*/main/pg_hba.conf

# Reiniciar PostgreSQL
systemctl restart postgresql
```

### Passo 5: Configurar Firewall
```bash
# Permitir porta 5432 no firewall
ufw allow 5432/tcp

# Verificar status do firewall
ufw status
```

### Passo 6: Verificar Configuração
```bash
# Verificar se PostgreSQL está rodando
systemctl status postgresql

# Testar conexão local
sudo -u postgres psql -c "SELECT version();"

# Verificar se está escutando na porta 5432
netstat -tlnp | grep 5432
```

## Após Configurar o VPS

### Atualizar Backend para Usar VPS
Edite o arquivo `backend/.env`:
```env
# Banco de Dados PostgreSQL (VPS)
DB_HOST=148.230.118.81
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=Samuel2029#@
DB_DATABASE=gestasaas
```

### Executar Script de Criação do Banco
```bash
# No diretório do projeto
cd backend
npm run db:create
```

### Testar Conexão
```bash
# Testar do Windows
Test-NetConnection -ComputerName 148.230.118.81 -Port 5432

# Ou usar psql (se instalado)
psql -h 148.230.118.81 -U postgres -d gestasaas
```

## Scripts Disponíveis
- `setup-vps-postgres.ps1` - Instruções para configuração
- `connect-vps.ps1` - Script para conectar ao VPS

## Próximos Passos
1. Execute os comandos acima no VPS
2. Atualize o arquivo `.env` do backend
3. Reinicie o backend
4. Execute o script de criação do banco
5. Teste a aplicação completa

## Contato
Se precisar de ajuda adicional, verifique os logs do PostgreSQL:
```bash
tail -f /var/log/postgresql/postgresql-*.log
```