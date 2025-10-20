const { DataSource } = require('typeorm');
require('dotenv').config({ path: '.env.development' });

// Configuração do banco de dados
const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_DATABASE || 'gestasaas',
  schema: 'public',
  ssl: false,
  synchronize: false,
  logging: true,
});

async function testConnection() {
  console.log('🔄 Testando conexão com o banco de dados...');
  console.log(`📍 Host: ${process.env.DB_HOST}`);
  console.log(`🔌 Porta: ${process.env.DB_PORT}`);
  console.log(`👤 Usuário: ${process.env.DB_USERNAME}`);
  console.log(`🗄️ Database: ${process.env.DB_DATABASE}`);
  console.log('');

  try {
    // Inicializar conexão
    await dataSource.initialize();
    console.log('✅ Conexão estabelecida com sucesso!');

    // Testar uma query simples
    const result = await dataSource.query('SELECT version()');
    console.log('📊 Versão do PostgreSQL:', result[0].version);

    // Verificar se o schema public existe
    const schemas = await dataSource.query(`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name = 'public'
    `);
    console.log('🏗️ Schema public encontrado:', schemas.length > 0 ? 'Sim' : 'Não');

    // Listar tabelas no schema public
    const tables = await dataSource.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    console.log('📋 Tabelas encontradas no schema public:');
    tables.forEach(table => {
      console.log(`   - ${table.table_name}`);
    });

    if (tables.length === 0) {
      console.log('⚠️ Nenhuma tabela encontrada. Pode ser necessário executar migrations.');
    }

  } catch (error) {
    console.error('❌ Erro ao conectar com o banco de dados:');
    console.error('📝 Detalhes do erro:', error.message);
    
    if (error.code) {
      console.error('🔢 Código do erro:', error.code);
    }
    
    if (error.code === 'ECONNREFUSED') {
      console.error('🚫 Conexão recusada. Verifique se:');
      console.error('   - O servidor PostgreSQL está rodando');
      console.error('   - O host e porta estão corretos');
      console.error('   - O firewall permite a conexão');
    } else if (error.code === 'ENOTFOUND') {
      console.error('🔍 Host não encontrado. Verifique o endereço do servidor.');
    } else if (error.message.includes('password authentication failed')) {
      console.error('🔐 Falha na autenticação. Verifique usuário e senha.');
    } else if (error.message.includes('database') && error.message.includes('does not exist')) {
      console.error('🗄️ Database não existe. Verifique o nome do banco.');
    }
  } finally {
    // Fechar conexão
    if (dataSource.isInitialized) {
      await dataSource.destroy();
      console.log('🔌 Conexão fechada.');
    }
  }
}

// Executar teste
testConnection().catch(console.error);