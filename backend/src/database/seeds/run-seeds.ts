import { DataSource } from 'typeorm';
import { runInitialSeed } from './initial-seed';

// Configuração do banco de dados
const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'aplicacao_gesta_db',
  port: 5432,
  username: 'postgres',
  password: '2084b5fb1f7fd997a2b0',
  database: 'app_gesta_db',
  entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
  synchronize: true,
  logging: false,
});

async function main() {
  try {
    console.log('🔌 Conectando ao banco de dados...');
    await AppDataSource.initialize();
    console.log('✅ Conectado ao banco de dados');

    await runInitialSeed(AppDataSource);

    console.log('🔌 Fechando conexão...');
    await AppDataSource.destroy();
    console.log('✅ Conexão fechada');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao executar seeds:', error);
    process.exit(1);
  }
}

main();
