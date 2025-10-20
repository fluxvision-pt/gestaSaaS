#!/usr/bin/env node

/**
 * Health Check Script para Frontend
 * Verifica se o frontend está funcionando corretamente
 */

const http = require('http');
const https = require('https');

// Configurações
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const BACKEND_URL = process.env.VITE_API_URL || 'http://localhost:3001';

// Cores para output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStatus(service, status, details = '') {
  const statusColor = status === 'OK' ? 'green' : 'red';
  const statusSymbol = status === 'OK' ? '✓' : '✗';
  log(`${statusSymbol} ${service}: ${colors[statusColor]}${status}${colors.reset} ${details}`);
}

// Função para fazer requisições HTTP/HTTPS
function makeRequest(url, timeout = 5000) {
  return new Promise((resolve) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;
    
    const req = client.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          success: true,
          statusCode: res.statusCode,
          data: data.substring(0, 200) // Primeiros 200 caracteres
        });
      });
    });

    req.on('error', (error) => {
      resolve({
        success: false,
        error: error.message
      });
    });

    req.setTimeout(timeout, () => {
      req.destroy();
      resolve({
        success: false,
        error: 'Timeout'
      });
    });
  });
}

// Verificar se o frontend está acessível
async function checkFrontend() {
  try {
    const result = await makeRequest(FRONTEND_URL);
    
    if (result.success && (result.statusCode === 200 || result.statusCode === 304)) {
      // Verificar se contém elementos típicos de uma SPA React
      const hasReactElements = result.data.includes('div id="root"') || 
                              result.data.includes('script') ||
                              result.data.includes('<!DOCTYPE html>');
      
      if (hasReactElements) {
        logStatus('Frontend App', 'OK', `(${result.statusCode})`);
        return true;
      } else {
        logStatus('Frontend App', 'AVISO', '- Conteúdo inesperado');
        return false;
      }
    } else if (result.success) {
      logStatus('Frontend App', 'ERRO', `(HTTP ${result.statusCode})`);
      return false;
    } else {
      logStatus('Frontend App', 'ERRO', `- ${result.error}`);
      return false;
    }
  } catch (error) {
    logStatus('Frontend App', 'ERRO', `- ${error.message}`);
    return false;
  }
}

// Verificar conectividade com o backend
async function checkBackendConnectivity() {
  try {
    const result = await makeRequest(`${BACKEND_URL}/health`);
    
    if (result.success && result.statusCode === 200) {
      logStatus('Backend Connectivity', 'OK', `(${result.statusCode})`);
      return true;
    } else if (result.success) {
      logStatus('Backend Connectivity', 'ERRO', `(HTTP ${result.statusCode})`);
      return false;
    } else {
      logStatus('Backend Connectivity', 'ERRO', `- ${result.error}`);
      return false;
    }
  } catch (error) {
    logStatus('Backend Connectivity', 'ERRO', `- ${error.message}`);
    return false;
  }
}

// Verificar recursos estáticos
async function checkStaticAssets() {
  try {
    // Tentar acessar o favicon ou vite.svg
    const assetUrls = [
      `${FRONTEND_URL}/vite.svg`,
      `${FRONTEND_URL}/favicon.ico`
    ];
    
    let assetFound = false;
    
    for (const assetUrl of assetUrls) {
      const result = await makeRequest(assetUrl, 3000);
      if (result.success && result.statusCode === 200) {
        assetFound = true;
        break;
      }
    }
    
    if (assetFound) {
      logStatus('Static Assets', 'OK', '- Assets carregando');
      return true;
    } else {
      logStatus('Static Assets', 'AVISO', '- Assets não encontrados');
      return false;
    }
  } catch (error) {
    logStatus('Static Assets', 'ERRO', `- ${error.message}`);
    return false;
  }
}

// Verificar variáveis de ambiente
function checkEnvironmentVariables() {
  const requiredVars = [
    'VITE_API_URL'
  ];
  
  const missingVars = [];
  
  // Tentar ler do arquivo .env se existir
  try {
    const fs = require('fs');
    const path = require('path');
    const envPath = path.join(__dirname, '.env');
    
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const envVars = {};
      
      envContent.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
          envVars[key.trim()] = value.trim();
        }
      });
      
      requiredVars.forEach(varName => {
        if (!envVars[varName] && !process.env[varName]) {
          missingVars.push(varName);
        }
      });
    }
  } catch (error) {
    // Ignorar erros de leitura do arquivo
  }
  
  if (missingVars.length === 0) {
    logStatus('Environment Variables', 'OK', '- Variáveis configuradas');
    return true;
  } else {
    logStatus('Environment Variables', 'AVISO', `- Faltam: ${missingVars.join(', ')}`);
    return false;
  }
}

// Função principal
async function main() {
  log(`${colors.bold}🔍 Health Check - Frontend GestaSaaS${colors.reset}`);
  log(`${colors.blue}Verificando: ${FRONTEND_URL}${colors.reset}`);
  log('─'.repeat(50));

  const checks = [
    { name: 'Environment', fn: checkEnvironmentVariables },
    { name: 'Frontend', fn: checkFrontend },
    { name: 'Backend Connection', fn: checkBackendConnectivity },
    { name: 'Static Assets', fn: checkStaticAssets }
  ];

  let allPassed = true;
  let warnings = 0;
  
  for (const check of checks) {
    const result = await check.fn();
    if (!result) {
      if (check.name === 'Static Assets' || check.name === 'Environment') {
        warnings++;
      } else {
        allPassed = false;
      }
    }
  }

  log('─'.repeat(50));
  
  if (allPassed && warnings === 0) {
    log(`${colors.green}${colors.bold}✓ Frontend funcionando perfeitamente!${colors.reset}`);
    process.exit(0);
  } else if (allPassed && warnings > 0) {
    log(`${colors.yellow}${colors.bold}⚠ Frontend funcionando com avisos!${colors.reset}`);
    process.exit(0);
  } else {
    log(`${colors.red}${colors.bold}✗ Frontend apresenta problemas críticos!${colors.reset}`);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main().catch(error => {
    log(`Erro inesperado: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = { checkFrontend, checkBackendConnectivity, checkStaticAssets, checkEnvironmentVariables };