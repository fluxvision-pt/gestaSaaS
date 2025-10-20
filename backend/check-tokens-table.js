const { DataSource } = require('typeorm');
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

async function checkTokensTable() {
  try {
    await dataSource.initialize();
    
    // Verificar se a tabela tokens_recuperacao existe
    const result = await dataSource.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'tokens_recuperacao'
    `);
    
    console.log('🔍 Verificando tabela tokens_recuperacao...');
    console.log('Tabela tokens_recuperacao existe:', result.length > 0 ? 'Sim' : 'Não');
    
    if (result.length === 0) {
      console.log('⚠️ Tabela tokens_recuperacao não encontrada.');
      console.log('📝 Esta tabela é necessária para recuperação de senha.');
      console.log('💡 Recomendação: Executar migration ou sincronização do banco.');
    } else {
      console.log('✅ Tabela tokens_recuperacao encontrada!');
      
      // Verificar estrutura da tabela
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
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

checkTokensTable();