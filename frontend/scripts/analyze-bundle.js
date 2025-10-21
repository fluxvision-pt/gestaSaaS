#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

/**
 * Script para análise automática do bundle
 * Executa após o build e gera relatório de performance
 */

const DIST_DIR = path.join(__dirname, '../dist')
const REPORT_DIR = path.join(__dirname, '../reports')

// Cores para output no terminal
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function analyzeFiles(dir, basePath = '') {
  const files = []
  
  if (!fs.existsSync(dir)) {
    return files
  }

  const items = fs.readdirSync(dir)
  
  for (const item of items) {
    const fullPath = path.join(dir, item)
    const relativePath = path.join(basePath, item)
    const stats = fs.statSync(fullPath)
    
    if (stats.isDirectory()) {
      files.push(...analyzeFiles(fullPath, relativePath))
    } else {
      files.push({
        name: item,
        path: relativePath,
        size: stats.size,
        type: path.extname(item)
      })
    }
  }
  
  return files
}

function generateReport() {
  log('\n🔍 Analisando bundle...', 'cyan')
  
  if (!fs.existsSync(DIST_DIR)) {
    log('❌ Diretório dist não encontrado. Execute o build primeiro.', 'red')
    process.exit(1)
  }

  const files = analyzeFiles(DIST_DIR)
  
  // Separar por tipo
  const jsFiles = files.filter(f => f.type === '.js')
  const cssFiles = files.filter(f => f.type === '.css')
  const assetFiles = files.filter(f => !['.js', '.css', '.html'].includes(f.type))
  
  // Calcular estatísticas
  const totalSize = files.reduce((sum, file) => sum + file.size, 0)
  const jsSize = jsFiles.reduce((sum, file) => sum + file.size, 0)
  const cssSize = cssFiles.reduce((sum, file) => sum + file.size, 0)
  const assetSize = assetFiles.reduce((sum, file) => sum + file.size, 0)
  
  // Encontrar maiores arquivos
  const largestFiles = files.sort((a, b) => b.size - a.size).slice(0, 10)
  
  // Gerar relatório
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalFiles: files.length,
      totalSize: totalSize,
      jsSize: jsSize,
      cssSize: cssSize,
      assetSize: assetSize
    },
    breakdown: {
      javascript: jsFiles.map(f => ({ name: f.name, size: f.size, path: f.path })),
      css: cssFiles.map(f => ({ name: f.name, size: f.size, path: f.path })),
      assets: assetFiles.map(f => ({ name: f.name, size: f.size, path: f.path }))
    },
    largestFiles: largestFiles.map(f => ({ name: f.name, size: f.size, path: f.path })),
    recommendations: generateRecommendations(jsFiles, cssFiles, totalSize)
  }
  
  // Exibir no terminal
  displayReport(report)
  
  // Salvar relatório
  saveReport(report)
  
  return report
}

function generateRecommendations(jsFiles, cssFiles, totalSize) {
  const recommendations = []
  
  // Verificar tamanho total
  if (totalSize > 2 * 1024 * 1024) { // 2MB
    recommendations.push({
      type: 'warning',
      message: 'Bundle total muito grande (>2MB). Considere implementar mais code splitting.'
    })
  }
  
  // Verificar arquivos JS grandes
  const largeJsFiles = jsFiles.filter(f => f.size > 500 * 1024) // 500KB
  if (largeJsFiles.length > 0) {
    recommendations.push({
      type: 'warning',
      message: `${largeJsFiles.length} arquivo(s) JS muito grande(s). Considere dividir em chunks menores.`,
      files: largeJsFiles.map(f => f.name)
    })
  }
  
  // Verificar se há lazy loading
  const hasLazyChunks = jsFiles.some(f => f.name.includes('chunk') || f.name.includes('lazy'))
  if (!hasLazyChunks) {
    recommendations.push({
      type: 'info',
      message: 'Considere implementar lazy loading para reduzir o bundle inicial.'
    })
  }
  
  // Verificar compressão
  recommendations.push({
    type: 'info',
    message: 'Certifique-se de que o servidor está configurado para servir arquivos com compressão gzip/brotli.'
  })
  
  return recommendations
}

function displayReport(report) {
  log('\n📊 RELATÓRIO DE BUNDLE', 'magenta')
  log('=' * 50, 'magenta')
  
  log(`\n📈 RESUMO:`, 'cyan')
  log(`  Total de arquivos: ${report.summary.totalFiles}`)
  log(`  Tamanho total: ${formatBytes(report.summary.totalSize)}`)
  log(`  JavaScript: ${formatBytes(report.summary.jsSize)} (${((report.summary.jsSize / report.summary.totalSize) * 100).toFixed(1)}%)`)
  log(`  CSS: ${formatBytes(report.summary.cssSize)} (${((report.summary.cssSize / report.summary.totalSize) * 100).toFixed(1)}%)`)
  log(`  Assets: ${formatBytes(report.summary.assetSize)} (${((report.summary.assetSize / report.summary.totalSize) * 100).toFixed(1)}%)`)
  
  log(`\n📁 MAIORES ARQUIVOS:`, 'cyan')
  report.largestFiles.slice(0, 5).forEach((file, index) => {
    const color = file.size > 500 * 1024 ? 'red' : file.size > 200 * 1024 ? 'yellow' : 'green'
    log(`  ${index + 1}. ${file.name} - ${formatBytes(file.size)}`, color)
  })
  
  log(`\n💡 RECOMENDAÇÕES:`, 'cyan')
  report.recommendations.forEach(rec => {
    const color = rec.type === 'warning' ? 'yellow' : 'blue'
    log(`  • ${rec.message}`, color)
    if (rec.files) {
      rec.files.forEach(file => log(`    - ${file}`, 'reset'))
    }
  })
  
  // Score de performance
  const score = calculatePerformanceScore(report)
  const scoreColor = score > 80 ? 'green' : score > 60 ? 'yellow' : 'red'
  log(`\n🎯 SCORE DE PERFORMANCE: ${score}/100`, scoreColor)
  
  log('\n' + '=' * 50, 'magenta')
}

function calculatePerformanceScore(report) {
  let score = 100
  
  // Penalizar tamanho total grande
  if (report.summary.totalSize > 2 * 1024 * 1024) score -= 30
  else if (report.summary.totalSize > 1 * 1024 * 1024) score -= 15
  
  // Penalizar arquivos JS muito grandes
  const largeJsFiles = report.breakdown.javascript.filter(f => f.size > 500 * 1024)
  score -= largeJsFiles.length * 10
  
  // Bonificar se há code splitting (múltiplos arquivos JS)
  if (report.breakdown.javascript.length > 3) score += 10
  
  return Math.max(0, Math.min(100, score))
}

function saveReport(report) {
  if (!fs.existsSync(REPORT_DIR)) {
    fs.mkdirSync(REPORT_DIR, { recursive: true })
  }
  
  const reportPath = path.join(REPORT_DIR, `bundle-analysis-${Date.now()}.json`)
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
  
  log(`\n💾 Relatório salvo em: ${reportPath}`, 'green')
}

// Executar análise se chamado diretamente
if (require.main === module) {
  try {
    generateReport()
  } catch (error) {
    log(`❌ Erro durante análise: ${error.message}`, 'red')
    process.exit(1)
  }
}

module.exports = { generateReport, analyzeFiles, formatBytes }