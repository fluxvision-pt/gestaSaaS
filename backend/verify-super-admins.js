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

async function verifySuperAdmins() {
  try {
    console.log('🔄 Conectando ao banco de dados...');
    await dataSource.initialize();
    
    console.log('🔍 Verificando super admins...');
    
    const superAdmins = await dataSource.query(`
      SELECT 
        id,
        tenant_id,
        nome,
        email,
        telefone_e164,
        perfil,
        status,
        idioma_preferido,
        moeda_preferida,
        cod_pais,
        criado_em,
        atualizado_em
      FROM usuarios 
      WHERE perfil = 'super_admin'
      ORDER BY criado_em
    `);
    
    console.log('📋 Super Admins encontrados:', superAdmins.length);
    console.log('');
    
    superAdmins.forEach((admin, index) => {
      console.log(`🔹 Super Admin ${index + 1}:`);
      console.log(`   ID: ${admin.id}`);
      console.log(`   Nome: ${admin.nome}`);
      console.log(`   Email: ${admin.email}`);
      console.log(`   Telefone: ${admin.telefone_e164}`);
      console.log(`   Tenant ID: ${admin.tenant_id || 'NULL (Super Admin)'}`);
      console.log(`   Perfil: ${admin.perfil}`);
      console.log(`   Status: ${admin.status}`);
      console.log(`   Idioma: ${admin.idioma_preferido}`);
      console.log(`   Moeda: ${admin.moeda_preferida}`);
      console.log(`   País: ${admin.cod_pais}`);
      console.log(`   Criado em: ${admin.criado_em}`);
      console.log(`   Atualizado em: ${admin.atualizado_em}`);
      console.log('');
    });
    
    console.log('🔐 CREDENCIAIS DISPONÍVEIS:');
    console.log('   1. santos.eltton@gmail.com / Samuel2029#@');
    console.log('   2. admin@gestasaas.com / SuperAdmin@123');
    console.log('');
    
    // Verificar estrutura da tabela
    console.log('🏗️ Verificando estrutura da tabela usuarios...');
    const tableStructure = await dataSource.query(`
      SELECT 
        column_name,
        is_nullable,
        data_type,
        column_default
      FROM information_schema.columns 
      WHERE table_name = 'usuarios' 
      AND column_name IN ('tenant_id', 'email', 'telefone_e164', 'perfil')
      ORDER BY ordinal_position
    `);
    
    console.log('📊 Estrutura da tabela:');
    tableStructure.forEach(col => {
      console.log(`   ${col.column_name}: ${col.data_type} (NULL: ${col.is_nullable})`);
    });
    
    // Verificar constraints
    console.log('');
    console.log('🔒 Verificando constraints...');
    const constraints = await dataSource.query(`
      SELECT 
        constraint_name,
        constraint_type
      FROM information_schema.table_constraints 
      WHERE table_name = 'usuarios'
      AND constraint_type IN ('UNIQUE', 'PRIMARY KEY')
      ORDER BY constraint_name
    `);
    
    console.log('📋 Constraints encontradas:');
    constraints.forEach(constraint => {
      console.log(`   ${constraint.constraint_name}: ${constraint.constraint_type}`);
    });
    
    // Verificar índices
    console.log('');
    console.log('📇 Verificando índices...');
    const indexes = await dataSource.query(`
      SELECT 
        indexname,
        indexdef
      FROM pg_indexes 
      WHERE tablename = 'usuarios'
      AND indexname LIKE '%unique%'
      ORDER BY indexname
    `);
    
    console.log('📋 Índices únicos encontrados:');
    indexes.forEach(index => {
      console.log(`   ${index.indexname}`);
      console.log(`     ${index.indexdef}`);
    });
    
    console.log('');
    console.log('✅ Verificação concluída!');
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await dataSource.destroy();
    console.log('🔌 Conexão fechada.');
  }
}

verifySuperAdmins();