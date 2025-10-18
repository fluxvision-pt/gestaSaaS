# Script de Conexão SSH para VPS GestaSaaS
# =========================================

param(
    [string]$Action = "connect"
)

$VPS_HOST = "148.230.118.81"
$VPS_USER = "root"
$VPS_PASSWORD = "Samuel2029#@"

Write-Host "=== GestaSaaS VPS Connection Script ===" -ForegroundColor Green
Write-Host "VPS: $VPS_HOST" -ForegroundColor Yellow
Write-Host "User: $VPS_USER" -ForegroundColor Yellow
Write-Host ""

switch ($Action.ToLower()) {
    "connect" {
        Write-Host "Conectando ao VPS..." -ForegroundColor Blue
        Write-Host "Senha: $VPS_PASSWORD" -ForegroundColor Red
        Write-Host ""
        ssh $VPS_USER@$VPS_HOST
    }
    "info" {
        Write-Host "Informações de Conexão:" -ForegroundColor Cyan
        Write-Host "Host: $VPS_HOST"
        Write-Host "User: $VPS_USER"
        Write-Host "Password: $VPS_PASSWORD"
        Write-Host ""
        Write-Host "Comando manual: ssh $VPS_USER@$VPS_HOST"
    }
    "test" {
        Write-Host "Testando conectividade..." -ForegroundColor Blue
        Test-NetConnection -ComputerName $VPS_HOST -Port 22
    }
    default {
        Write-Host "Uso: .\connect-vps.ps1 [connect|info|test]" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Opções:"
        Write-Host "  connect - Conecta ao VPS via SSH (padrão)"
        Write-Host "  info    - Mostra informações de conexão"
        Write-Host "  test    - Testa conectividade na porta 22"
    }
}

# Exemplos de uso:
# .\connect-vps.ps1           # Conecta ao VPS
# .\connect-vps.ps1 info      # Mostra informações
# .\connect-vps.ps1 test      # Testa conectividade