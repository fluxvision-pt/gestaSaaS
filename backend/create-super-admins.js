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

async function createSuperAdmins() {
  try {
    console.log('🔄 Conectando ao banco de dados...');
    await dataSource.initialize();
    
    console.log('🏗️ Preparando estrutura da tabela para super admins...');
    
    // 1. Alterar tenant_id para permitir NULL
    try {
      await dataSource.query('ALTER TABLE usuarios ALTER COLUMN tenant_id DROP NOT NULL');
      console.log('   ✅ tenant_id agora permite NULL');
    } catch (error) {
      if (error.message.includes('does not exist')) {
        console.log('   ⚠️ Constraint NOT NULL já foi removida');
      } else {
        console.log('   ⚠️ Erro ao alterar tenant_id:', error.message);
      }
    }
    
    // 2. Remover constraints antigas (pode dar erro, mas é ok)
    try {
      await dataSource.query('ALTER TABLE usuarios DROP CONSTRAINT usuarios_tenant_id_email_key');
      console.log('   ✅ Constraint usuarios_tenant_id_email_key removida');
    } catch (error) {
      console.log('   ⚠️ Constraint usuarios_tenant_id_email_key não existe ou já foi removida');
    }
    
    try {
      await dataSource.query('ALTER TABLE usuarios DROP CONSTRAINT usuarios_tenant_id_telefone_e164_key');
      console.log('   ✅ Constraint usuarios_tenant_id_telefone_e164_key removida');
    } catch (error) {
      console.log('   ⚠️ Constraint usuarios_tenant_id_telefone_e164_key não existe ou já foi removida');
    }
    
    // 3. Adicionar constraint UNIQUE para email global
    try {
      await dataSource.query('ALTER TABLE usuarios ADD CONSTRAINT usuarios_email_unique UNIQUE (email)');
      console.log('   ✅ Constraint usuarios_email_unique adicionada');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('   ⚠️ Constraint usuarios_email_unique já existe');
      } else {
        console.log('   ⚠️ Erro ao adicionar constraint email:', error.message);
      }
    }
    
    // 4. Criar índices únicos condicionais
    try {
      await dataSource.query(`
        CREATE UNIQUE INDEX usuarios_tenant_email_unique 
        ON usuarios (tenant_id, email) 
        WHERE tenant_id IS NOT NULL
      `);
      console.log('   ✅ Índice usuarios_tenant_email_unique criado');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('   ⚠️ Índice usuarios_tenant_email_unique já existe');
      } else {
        console.log('   ⚠️ Erro ao criar índice email:', error.message);
      }
    }
    
    try {
      await dataSource.query(`
        CREATE UNIQUE INDEX usuarios_tenant_telefone_unique 
        ON usuarios (tenant_id, telefone_e164) 
        WHERE tenant_id IS NOT NULL
      `);
      console.log('   ✅ Índice usuarios_tenant_telefone_unique criado');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('   ⚠️ Índice usuarios_tenant_telefone_unique já existe');
      } else {
        console.log('   ⚠️ Erro ao criar índice telefone:', error.message);
      }
    }
    
    console.log('👤 Criando super admins...');
    
    // 5. Criar Super Admin 1: Eltton Santos
    try {
      await dataSource.query(`
        INSERT INTO usuarios (
          id,
          tenant_id,
          nome,
          email,
          telefone_e164,
          senha_hash,
          perfil,
          idioma_preferido,
          moeda_preferida,
          cod_pais,
          status,
          criado_em,
          atualizado_em
        ) VALUES (
          gen_random_uuid(),
          NULL,
          'Eltton Santos',
          'santos.eltton@gmail.com',
          '+351967247471',
          '$2a$12$kdeIL5BxI1Uz.gt6f.lc6efZryWdDF89QwBJIpOpaliEpYyOV5jY.',
          'super_admin',
          'pt-BR',
          'BRL',
          'BR',
          'ativo',
          NOW(),
          NOW()
        )
        ON CONFLICT (email) DO UPDATE SET
          nome = EXCLUDED.nome,
          telefone_e164 = EXCLUDED.telefone_e164,
          senha_hash = EXCLUDED.senha_hash,
          perfil = EXCLUDED.perfil,
          status = EXCLUDED.status,
          atualizado_em = NOW()
      `);
      console.log('   ✅ Super Admin Eltton Santos criado/atualizado');
    } catch (error) {
      console.log('   ❌ Erro ao criar Eltton Santos:', error.message);
    }
    
    // 6. Criar Super Admin 2: Admin GestaSaaS
    try {
      await dataSource.query(`
        INSERT INTO usuarios (
          id,
          tenant_id,
          nome,
          email,
          telefone_e164,
          senha_hash,
          perfil,
          idioma_preferido,
          moeda_preferida,
          cod_pais,
          status,
          criado_em,
          atualizado_em
        ) VALUES (
          gen_random_uuid(),
          NULL,
          'Admin GestaSaaS',
          'admin@gestasaas.com',
          '+5511999999999',
          '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3xp9vflXvO',
          'super_admin',
          'pt-BR',
          'BRL',
          'BR',
          'ativo',
          NOW(),
          NOW()
        )
        ON CONFLICT (email) DO UPDATE SET
          nome = EXCLUDED.nome,
          telefone_e164 = EXCLUDED.telefone_e164,
          senha_hash = EXCLUDED.senha_hash,
          perfil = EXCLUDED.perfil,
          status = EXCLUDED.status,
          atualizado_em = NOW()
      `);
      console.log('   ✅ Super Admin GestaSaaS criado/atualizado');
    } catch (error) {
      console.log('   ❌ Erro ao criar Admin GestaSaaS:', error.message);
    }
    
    console.log('🔍 Verificando super admins criados...');
    const superAdmins = await dataSource.query(`
      SELECT 
        id,
        tenant_id,
        nome,
        email,
        perfil,
        status,
        criado_em
      FROM usuarios 
      WHERE perfil = 'super_admin'
      ORDER BY criado_em
    `);
    
    console.log('📋 Super Admins encontrados:');
    superAdmins.forEach((admin, index) => {
      console.log(`   ${index + 1}. ${admin.nome} (${admin.email}) - Status: ${admin.status}`);
    });
    
    console.log('✅ Processo concluído com sucesso!');
    console.log('');
    console.log('🔐 CREDENCIAIS DE ACESSO:');
    console.log('   1. santos.eltton@gmail.com / Samuel2029#@');
    console.log('   2. admin@gestasaas.com / SuperAdmin@123');
    console.log('');
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  } finally {
    await dataSource.destroy();
    console.log('🔌 Conexão fechada.');
  }
}

createSuperAdmins();