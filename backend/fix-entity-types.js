const fs = require('fs');
const path = require('path');

// Lista de arquivos de entidades que precisam ser corrigidos
const entityFiles = [
  'src/modules/assinaturas/entities/assinatura.entity.ts',
  'src/modules/financeiro/entities/transacao.entity.ts',
  'src/modules/notifications/entities/notification.entity.ts',
  'src/modules/km/entities/km-diario.entity.ts',
  'src/modules/pagamentos/entities/pagamento.entity.ts',
  'src/modules/pagamentos/entities/gateway.entity.ts',
  'src/modules/auditoria/entities/auditoria.entity.ts',
  'src/modules/backup/entities/backup.entity.ts'
];

function fixEntityFile(filePath) {
  const fullPath = path.join(__dirname, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`Arquivo não encontrado: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  
  // Verificar se já tem o import
  if (!content.includes('database-types.helper')) {
    // Encontrar a última linha de import
    const importLines = content.split('\n').filter(line => line.trim().startsWith('import'));
    const lastImportIndex = content.lastIndexOf(importLines[importLines.length - 1]);
    const afterLastImport = content.indexOf('\n', lastImportIndex) + 1;
    
    // Adicionar o import
    const importStatement = "import { DB_TYPES } from '../../../database/database-types.helper';\n";
    content = content.slice(0, afterLastImport) + importStatement + content.slice(afterLastImport);
  }
  
  // Substituir type: 'timestamp' por type: DB_TYPES.TIMESTAMP
  content = content.replace(/type: 'timestamp'/g, 'type: DB_TYPES.TIMESTAMP');
  
  // Escrever o arquivo atualizado
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`✅ Arquivo corrigido: ${filePath}`);
}

console.log('🔧 Corrigindo tipos de dados nas entidades...\n');

entityFiles.forEach(fixEntityFile);

console.log('\n✅ Todas as entidades foram corrigidas!');