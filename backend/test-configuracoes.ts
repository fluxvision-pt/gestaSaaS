import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { ConfiguracoesService } from './src/modules/configuracoes/configuracoes.service';

async function testConfiguracoes() {
  console.log('🧪 Testando sistema de configurações...');
  
  try {
    const app = await NestFactory.createApplicationContext(AppModule);
    const configuracoesService = app.get(ConfiguracoesService);
    
    // Teste 1: Buscar configuração global
    console.log('📋 Teste 1: Buscar configuração global');
    const appName = await configuracoesService.getConfiguracao('app_name');
    console.log(`App Name: ${appName}`);
    
    // Teste 2: Buscar configuração que não existe
    console.log('📋 Teste 2: Buscar configuração inexistente');
    const inexistente = await configuracoesService.getConfiguracao('config_inexistente', null, 'valor_padrao');
    console.log(`Configuração inexistente: ${inexistente}`);
    
    // Teste 3: Definir nova configuração
    console.log('📋 Teste 3: Definir nova configuração');
    await configuracoesService.setConfiguracao('teste_config', 'valor_teste');
    const testeConfig = await configuracoesService.getConfiguracao('teste_config');
    console.log(`Teste Config: ${testeConfig}`);
    
    console.log('✅ Todos os testes passaram!');
    
    await app.close();
  } catch (error) {
    console.error('❌ Erro nos testes:', error.message);
    process.exit(1);
  }
}

testConfiguracoes();