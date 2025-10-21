import { DataSource } from 'typeorm';
import { runInitialSeed } from './initial-seed';
import * as dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config({ path: '.env.development' });

// Configuração do banco de dados
const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'admin',
  database: process.env.DB_DATABASE || 'app_gesta_db',
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
