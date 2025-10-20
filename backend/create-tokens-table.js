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

async function createTokensTable() {
  try {
    console.log('🔄 Conectando ao banco de dados...');
    await dataSource.initialize();
    
    console.log('🚀 Criando extensão uuid-ossp se não existir...');
    try {
      await dataSource.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
      console.log('✅ Extensão uuid-ossp criada/verificada');
    } catch (error) {
      console.log('⚠️ Extensão uuid-ossp já existe ou erro:', error.message);
    }
    
    console.log('🚀 Criando enum tipo_token...');
    try {
      await dataSource.query(`
        DO $$ 
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_token') THEN
                CREATE TYPE tipo_token AS ENUM ('PASSWORD_RESET', 'EMAIL_VERIFICATION');
            END IF;
        END $$;
      `);
      console.log('✅ Enum tipo_token criado/verificado');
    } catch (error) {
      console.log('⚠️ Enum tipo_token já existe ou erro:', error.message);
    }
    
    console.log('🚀 Adicionando campo email_verificado na tabela usuarios...');
    try {
      await dataSource.query(`
        ALTER TABLE usuarios 
        ADD COLUMN IF NOT EXISTS email_verificado BOOLEAN DEFAULT FALSE
      `);
      console.log('✅ Campo email_verificado adicionado/verificado');
    } catch (error) {
      console.log('⚠️ Campo email_verificado já existe ou erro:', error.message);
    }
    
    console.log('🚀 Criando tabela tokens_recuperacao...');
    await dataSource.query(`
      CREATE TABLE IF NOT EXISTS tokens_recuperacao (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
        token VARCHAR(255) NOT NULL UNIQUE,
        tipo tipo_token NOT NULL,
        usado BOOLEAN DEFAULT FALSE,
        expira_em TIMESTAMP WITH TIME ZONE NOT NULL,
        criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabela tokens_recuperacao criada');
    
    console.log('🚀 Criando índices...');
    const indices = [
      'CREATE INDEX IF NOT EXISTS idx_tokens_recuperacao_usuario_id ON tokens_recuperacao(usuario_id)',
      'CREATE INDEX IF NOT EXISTS idx_tokens_recuperacao_token ON tokens_recuperacao(token)',
      'CREATE INDEX IF NOT EXISTS idx_tokens_recuperacao_expira_em ON tokens_recuperacao(expira_em)',
      'CREATE INDEX IF NOT EXISTS idx_tokens_recuperacao_tipo ON tokens_recuperacao(tipo)'
    ];
    
    for (const index of indices) {
      try {
        await dataSource.query(index);
        console.log('✅ Índice criado');
      } catch (error) {
        console.log('⚠️ Índice já existe ou erro:', error.message);
      }
    }
    
    console.log('🚀 Criando função update_updated_at_column...');
    try {
      await dataSource.query(`
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.atualizado_em = CURRENT_TIMESTAMP;
            RETURN NEW;
        END;
        $$ language 'plpgsql'
      `);
      console.log('✅ Função update_updated_at_column criada');
    } catch (error) {
      console.log('⚠️ Função já existe ou erro:', error.message);
    }
    
    console.log('🚀 Criando trigger...');
    try {
      await dataSource.query(`
        CREATE TRIGGER update_tokens_recuperacao_updated_at
        BEFORE UPDATE ON tokens_recuperacao
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column()
      `);
      console.log('✅ Trigger criado');
    } catch (error) {
      console.log('⚠️ Trigger já existe ou erro:', error.message);
    }
    
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
    
    console.log('🎉 Migration concluída com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao executar migration:', error.message);
    process.exit(1);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

createTokensTable();