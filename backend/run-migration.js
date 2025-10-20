const { DataSource } = require('typeorm');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.development' });

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  schema: 'public',
  ssl: false,
});

async function runMigration() {
  try {
    console.log('🔄 Conectando ao banco de dados...');
    await dataSource.initialize();
    
    console.log('📖 Lendo arquivo de migration...');
    const migrationPath = path.join(__dirname, 'migrations', 'add-password-recovery.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('🚀 Executando migration...');
    
    // Dividir o SQL em comandos individuais (separados por ponto e vírgula)
    const commands = migrationSQL
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
    
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      if (command.trim()) {
        try {
          console.log(`   Executando comando ${i + 1}/${commands.length}...`);
          await dataSource.query(command);
        } catch (error) {
          // Ignorar erros de "já existe" que são esperados
          if (error.message.includes('already exists') || 
              error.message.includes('já existe') ||
              error.message.includes('duplicate key')) {
            console.log(`   ⚠️ Comando ${i + 1} já executado anteriormente (ignorado)`);
          } else {
            console.error(`   ❌ Erro no comando ${i + 1}:`, error.message);
            throw error;
          }
        }
      }
    }
    
    console.log('✅ Migration executada com sucesso!');
    
    // Verificar se a tabela foi criada
    console.log('🔍 Verificando se a tabela foi criada...');
    const result = await dataSource.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'tokens_recuperacao'
    `);
    
    if (result.length > 0) {
      console.log('✅ Tabela tokens_recuperacao criada com sucesso!');
      
      // Verificar estrutura
      const columns = await dataSource.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'tokens_recuperacao'
        ORDER BY ordinal_position
      `);
      
      console.log('📋 Estrutura da tabela:');
      columns.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
      });
    } else {
      console.log('❌ Tabela tokens_recuperacao não foi criada');
    }
    
  } catch (error) {
    console.error('❌ Erro ao executar migration:', error.message);
    process.exit(1);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

runMigration();