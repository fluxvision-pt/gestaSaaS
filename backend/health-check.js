#!/usr/bin/env node

/**
 * Health Check Script para Backend
 * Verifica se o backend está funcionando corretamente
 */

const http = require('http');
const { Client } = require('pg');

// Configurações
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';
const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_DATABASE || 'gestasaas',
  user: process.env.DB_USERNAME || 'admin',
  password: process.env.DB_PASSWORD || 'postgres',
};

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

// Verificar conectividade com PostgreSQL
async function checkDatabase() {
  try {
    const client = new Client(DB_CONFIG);
    await client.connect();
    
    // Testar query simples
    const result = await client.query('SELECT NOW() as current_time, version() as pg_version');
    await client.end();
    
    const version = result.rows[0].pg_version.split(' ')[1];
    logStatus('PostgreSQL', 'OK', `(v${version})`);
    return true;
  } catch (error) {
    logStatus('PostgreSQL', 'ERRO', `- ${error.message}`);
    return false;
  }
}

// Verificar se o backend está respondendo
async function checkBackendHealth() {
  return new Promise((resolve) => {
    const url = new URL('/health', BACKEND_URL);
    
    const req = http.get(url.toString(), (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          logStatus('Backend Health', 'OK', `(${res.statusCode})`);
          resolve(true);
        } else {
          logStatus('Backend Health', 'ERRO', `(HTTP ${res.statusCode})`);
          resolve(false);
        }
      });
    });

    req.on('error', (error) => {
      logStatus('Backend Health', 'ERRO', `- ${error.message}`);
      resolve(false);
    });

    req.setTimeout(5000, () => {
      req.destroy();
      logStatus('Backend Health', 'ERRO', '- Timeout (5s)');
      resolve(false);
    });
  });
}

// Verificar endpoint da API
async function checkApiEndpoint() {
  return new Promise((resolve) => {
    const url = new URL('/api/docs', BACKEND_URL);
    
    const req = http.get(url.toString(), (res) => {
      if (res.statusCode === 200 || res.statusCode === 302) {
        logStatus('API Docs', 'OK', `(${res.statusCode})`);
        resolve(true);
      } else {
        logStatus('API Docs', 'ERRO', `(HTTP ${res.statusCode})`);
        resolve(false);
      }
    });

    req.on('error', (error) => {
      logStatus('API Docs', 'ERRO', `- ${error.message}`);
      resolve(false);
    });

    req.setTimeout(5000, () => {
      req.destroy();
      logStatus('API Docs', 'ERRO', '- Timeout (5s)');
      resolve(false);
    });
  });
}

// Função principal
async function main() {
  log(`${colors.bold}🔍 Health Check - Backend GestaSaaS${colors.reset}`);
  log(`${colors.blue}Verificando: ${BACKEND_URL}${colors.reset}`);
  log('─'.repeat(50));

  const checks = [
    { name: 'Database', fn: checkDatabase },
    { name: 'Backend', fn: checkBackendHealth },
    { name: 'API', fn: checkApiEndpoint }
  ];

  let allPassed = true;
  
  for (const check of checks) {
    const result = await check.fn();
    if (!result) allPassed = false;
  }

  log('─'.repeat(50));
  
  if (allPassed) {
    log(`${colors.green}${colors.bold}✓ Todos os serviços estão funcionando!${colors.reset}`);
    process.exit(0);
  } else {
    log(`${colors.red}${colors.bold}✗ Alguns serviços apresentam problemas!${colors.reset}`);
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

module.exports = { checkDatabase, checkBackendHealth, checkApiEndpoint };