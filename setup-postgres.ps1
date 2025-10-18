# Script para configurar PostgreSQL para o projeto GestaSaaS

Write-Host "=== Configuração do PostgreSQL para GestaSaaS ===" -ForegroundColor Green

Write-Host "1. Verificando se o PostgreSQL está rodando..." -ForegroundColor Yellow
$service = Get-Service -Name "*postgresql*" -ErrorAction SilentlyContinue
if ($service -and $service.Status -eq "Running") {
    Write-Host "✓ PostgreSQL está rodando" -ForegroundColor Green
} else {
    Write-Host "✗ PostgreSQL não está rodando. Iniciando..." -ForegroundColor Red
    Start-Service -Name "postgresql-x64-18"
    Start-Sleep -Seconds 3
}

Write-Host ""
Write-Host "2. Instruções para configurar a senha do PostgreSQL:" -ForegroundColor Yellow
Write-Host "   Se você não souber a senha do usuário 'postgres', siga estes passos:" -ForegroundColor White
Write-Host "   a) Abra o pgAdmin 4" -ForegroundColor White
Write-Host "   b) Ou execute: psql -U postgres" -ForegroundColor White
Write-Host "   c) Se pedir senha, tente: postgres, 123456, admin" -ForegroundColor White

Write-Host ""
Write-Host "3. Para criar o banco de dados 'gestasaas', execute:" -ForegroundColor Yellow
Write-Host "   psql -U postgres -c ""CREATE DATABASE gestasaas;""" -ForegroundColor Cyan

Write-Host ""
Write-Host "4. Para importar o schema, execute:" -ForegroundColor Yellow
Write-Host "   psql -U postgres -d gestasaas -f database.sql" -ForegroundColor Cyan

Write-Host ""
Write-Host "5. Configurações atuais no .env:" -ForegroundColor Yellow
Write-Host "   DB_HOST=localhost" -ForegroundColor White
Write-Host "   DB_PORT=5432" -ForegroundColor White
Write-Host "   DB_USERNAME=postgres" -ForegroundColor White
Write-Host "   DB_PASSWORD=postgres" -ForegroundColor White
Write-Host "   DB_DATABASE=gestasaas" -ForegroundColor White

Write-Host ""
Write-Host "6. Se a senha for diferente de 'postgres', atualize o arquivo .env" -ForegroundColor Yellow

Write-Host ""
Write-Host "Pressione qualquer tecla para continuar..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")