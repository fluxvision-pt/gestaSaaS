# Script para configurar PostgreSQL no VPS
# ==========================================

$VPS_HOST = "148.230.118.81"
$VPS_USER = "root"
$VPS_PASSWORD = "Samuel2029#@"

Write-Host "=== Configuração PostgreSQL no VPS ===" -ForegroundColor Green
Write-Host "VPS: $VPS_HOST" -ForegroundColor Yellow
Write-Host ""

# Comandos para executar no VPS
$commands = @(
    "# Verificar se PostgreSQL está instalado",
    "which psql || echo 'PostgreSQL não encontrado'",
    "",
    "# Instalar PostgreSQL se necessário",
    "apt update && apt install -y postgresql postgresql-contrib",
    "",
    "# Iniciar PostgreSQL",
    "systemctl start postgresql",
    "systemctl enable postgresql",
    "",
    "# Configurar senha do usuário postgres",
    "sudo -u postgres psql -c ""ALTER USER postgres PASSWORD 'Samuel2029#@';""",
    "",
    "# Criar banco de dados gestasaas",
    "sudo -u postgres createdb gestasaas",
    "",
    "# Configurar PostgreSQL para aceitar conexões externas",
    "echo ""listen_addresses = '*'"" >> /etc/postgresql/*/main/postgresql.conf",
    "echo ""host all all 0.0.0.0/0 md5"" >> /etc/postgresql/*/main/pg_hba.conf",
    "",
    "# Reiniciar PostgreSQL",
    "systemctl restart postgresql",
    "",
    "# Verificar status",
    "systemctl status postgresql --no-pager",
    "",
    "# Testar conexão local",
    "sudo -u postgres psql -c ""SELECT version();"""
)

Write-Host "Comandos que serão executados no VPS:" -ForegroundColor Cyan
foreach ($cmd in $commands) {
    if ($cmd -notlike "#*" -and $cmd.Trim() -ne "") {
        Write-Host "  $cmd" -ForegroundColor White
    }
}

Write-Host ""
Write-Host "Para executar manualmente:" -ForegroundColor Yellow
Write-Host "1. ssh root@$VPS_HOST" -ForegroundColor White
Write-Host "2. Digite a senha: $VPS_PASSWORD" -ForegroundColor White
Write-Host "3. Execute os comandos acima um por um" -ForegroundColor White

Write-Host ""
Write-Host "Após a configuração, teste a conexão:" -ForegroundColor Yellow
Write-Host "psql -h $VPS_HOST -U postgres -d gestasaas" -ForegroundColor White