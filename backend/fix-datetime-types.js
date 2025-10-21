const fs = require('fs');
const path = require('path');

function fixDatetimeTypes(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      fixDatetimeTypes(filePath);
    } else if (file.endsWith('.entity.ts')) {
      let content = fs.readFileSync(filePath, 'utf8');
      const originalContent = content;
      
      // Substituir type: 'datetime' por type: 'timestamp'
      content = content.replace(/type: 'datetime'/g, "type: 'timestamp'");
      
      if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Corrigido: ${filePath}`);
      }
    }
  });
}

console.log('🔄 Corrigindo tipos datetime para timestamp...');
fixDatetimeTypes('./src');
console.log('✅ Correção concluída!');