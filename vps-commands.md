# Comandos Úteis para VPS GestaSaaS

## 🔐 Conexão SSH
```bash
ssh root@148.230.118.81
# Senha: Samuel2029#@
```

## 📁 Transferência de Arquivos

### Upload (Local → VPS)
```bash
# Arquivo único
scp arquivo.txt root@148.230.118.81:/caminho/destino/

# Pasta completa
scp -r pasta/ root@148.230.118.81:/caminho/destino/

# Usando rsync (recomendado)
rsync -avz --progress pasta/ root@148.230.118.81:/caminho/destino/
```

### Download (VPS → Local)
```bash
# Arquivo único
scp root@148.230.118.81:/caminho/arquivo.txt ./

# Pasta completa
scp -r root@148.230.118.81:/caminho/pasta/ ./

# Usando rsync
rsync -avz --progress root@148.230.118.81:/caminho/pasta/ ./
```

## 🐳 Comandos Docker (EasyPanel)

### Verificar containers
```bash
docker ps                    # Containers rodando
docker ps -a                 # Todos os containers
docker images                # Imagens disponíveis
```

### Logs e monitoramento
```bash
docker logs container_name   # Ver logs
docker logs -f container_name # Seguir logs em tempo real
docker stats                 # Uso de recursos
```

### Gerenciamento
```bash
docker restart container_name
docker stop container_name
docker start container_name
```

## 📊 Monitoramento do Sistema

### Recursos
```bash
htop                         # Monitor de processos
df -h                        # Espaço em disco
free -h                      # Memória RAM
netstat -tulpn              # Portas em uso
```

### Logs do sistema
```bash
journalctl -f               # Logs do sistema em tempo real
tail -f /var/log/syslog     # Log do sistema
```

## 🗄️ PostgreSQL

### Conectar ao banco
```bash
psql -U postgres -d app_gesta_db
```

### Comandos úteis no psql
```sql
\l                          -- Listar databases
\dt                         -- Listar tabelas
\d nome_tabela             -- Descrever tabela
\q                         -- Sair
```

### Backup e restore
```bash
# Backup
pg_dump -U postgres app_gesta_db > backup.sql

# Restore
psql -U postgres app_gesta_db < backup.sql
```

## 🔧 Comandos de Deploy

### Atualizar aplicação
```bash
cd /caminho/da/aplicacao
git pull origin main
docker-compose down
docker-compose up -d --build
```

### Verificar status
```bash
systemctl status nginx      # Status do Nginx
systemctl status postgresql # Status do PostgreSQL
```

## 🛡️ Segurança

### Firewall
```bash
ufw status                  # Status do firewall
ufw allow 22               # Permitir SSH
ufw allow 80               # Permitir HTTP
ufw allow 443              # Permitir HTTPS
```

### Usuários
```bash
who                        # Usuários conectados
last                       # Últimos logins
```

## 📝 Arquivos Importantes

- **EasyPanel**: `/etc/easypanel/`
- **Nginx**: `/etc/nginx/`
- **SSL**: `/etc/letsencrypt/`
- **Logs**: `/var/log/`
- **Aplicações**: `/var/lib/docker/`

## ⚡ Scripts Rápidos

### Reiniciar serviços
```bash
systemctl restart nginx
systemctl restart postgresql
docker-compose restart
```

### Limpeza
```bash
docker system prune -a     # Limpar Docker
apt autoremove             # Remover pacotes desnecessários
```