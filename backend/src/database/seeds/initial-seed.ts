import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';

// Entidades
import { Usuario } from '../../modules/usuarios/entities/usuario.entity';
import { Plano } from '../../modules/planos/entities/plano.entity';
import { Recurso, TipoRecurso } from '../../modules/planos/entities/recurso.entity';
import { PlanoRecurso } from '../../modules/planos/entities/plano-recurso.entity';
import { Gateway, TipoGateway } from '../../modules/pagamentos/entities/gateway.entity';
import { PerfilUsuario, StatusUsuario } from '../../modules/usuarios/entities/usuario.entity';
import { StatusPlano } from '../../modules/planos/entities/plano.entity';

export async function runInitialSeed(dataSource: DataSource) {
  console.log('🌱 Executando seeds iniciais...');

  // Repositórios
  const usuarioRepository = dataSource.getRepository(Usuario);
  const planoRepository = dataSource.getRepository(Plano);
  const recursoRepository = dataSource.getRepository(Recurso);
  const planoRecursoRepository = dataSource.getRepository(PlanoRecurso);
  const gatewayRepository = dataSource.getRepository(Gateway);

  // 1. Criar Super Admin
  console.log('👤 Criando Super Admin...');
  const adminEmail = process.env.SUPER_ADMIN_EMAIL || 'admin@exemplo.com';
  const adminPassword = process.env.SUPER_ADMIN_PASSWORD || 'ChangeMe@123';
  const senhaHash = await bcrypt.hash(adminPassword, 12);
  
  const superAdmin = usuarioRepository.create({
    nome: 'Super Administrador',
    email: adminEmail,
    senhaHash,
    perfil: PerfilUsuario.SUPER_ADMIN,
    status: StatusUsuario.ATIVO,
    idiomaPreferido: 'pt-BR',
    moedaPreferida: 'BRL',
    codPais: 'BR',
  });

  await usuarioRepository.save(superAdmin);
  console.log('✅ Super Admin criado com sucesso');

  // 2. Criar Recursos do Sistema
  console.log('🔧 Criando recursos do sistema...');
  const recursos = [
    // Recursos básicos
    { chave: 'usuarios_max', descricao: 'Número máximo de usuários', tipo: TipoRecurso.INT },
    { chave: 'transacoes_max_mes', descricao: 'Número máximo de transações por mês', tipo: TipoRecurso.INT },
    { chave: 'km_tracking', descricao: 'Controle de quilometragem', tipo: TipoRecurso.BOOLEAN },
    { chave: 'relatorios_avancados', descricao: 'Relatórios avançados', tipo: TipoRecurso.BOOLEAN },
    { chave: 'api_integracoes', descricao: 'Integrações via API', tipo: TipoRecurso.BOOLEAN },
    { chave: 'whatsapp_bot', descricao: 'Bot do WhatsApp', tipo: TipoRecurso.BOOLEAN },
    { chave: 'backup_automatico', descricao: 'Backup automático', tipo: TipoRecurso.BOOLEAN },
    { chave: 'suporte_prioritario', descricao: 'Suporte prioritário', tipo: TipoRecurso.BOOLEAN },
    { chave: 'multi_moeda', descricao: 'Suporte a múltiplas moedas', tipo: TipoRecurso.BOOLEAN },
    { chave: 'auditoria_completa', descricao: 'Auditoria completa', tipo: TipoRecurso.BOOLEAN },
  ];

  const recursosCreated = [];
  for (const recursoData of recursos) {
    const recurso = recursoRepository.create(recursoData);
    const savedRecurso = await recursoRepository.save(recurso);
    recursosCreated.push(savedRecurso);
  }
  console.log('✅ Recursos criados com sucesso');

  // 3. Criar Planos
  console.log('📋 Criando planos...');
  
  // Plano Básico
  const planoBasico = planoRepository.create({
    nome: 'Básico',
    status: StatusPlano.ATIVO,
  });
  const savedPlanoBasico = await planoRepository.save(planoBasico);

  // Plano Profissional
  const planoProfissional = planoRepository.create({
    nome: 'Profissional',
    status: StatusPlano.ATIVO,
  });
  const savedPlanoProfissional = await planoRepository.save(planoProfissional);

  // Plano Empresarial
  const planoEmpresarial = planoRepository.create({
    nome: 'Empresarial',
    status: StatusPlano.ATIVO,
  });
  const savedPlanoEmpresarial = await planoRepository.save(planoEmpresarial);

  console.log('✅ Planos criados com sucesso');

  // 4. Associar Recursos aos Planos
  console.log('🔗 Associando recursos aos planos...');

  // Configurações do Plano Básico
  const configBasico = [
    { recurso: 'usuarios_max', valor: '3' },
    { recurso: 'transacoes_max_mes', valor: '100' },
    { recurso: 'km_tracking', valor: 'true' },
    { recurso: 'relatorios_avancados', valor: 'false' },
    { recurso: 'api_integracoes', valor: 'false' },
    { recurso: 'whatsapp_bot', valor: 'false' },
    { recurso: 'backup_automatico', valor: 'false' },
    { recurso: 'suporte_prioritario', valor: 'false' },
    { recurso: 'multi_moeda', valor: 'false' },
    { recurso: 'auditoria_completa', valor: 'false' },
  ];

  // Configurações do Plano Profissional
  const configProfissional = [
    { recurso: 'usuarios_max', valor: '10' },
    { recurso: 'transacoes_max_mes', valor: '500' },
    { recurso: 'km_tracking', valor: 'true' },
    { recurso: 'relatorios_avancados', valor: 'true' },
    { recurso: 'api_integracoes', valor: 'true' },
    { recurso: 'whatsapp_bot', valor: 'true' },
    { recurso: 'backup_automatico', valor: 'true' },
    { recurso: 'suporte_prioritario', valor: 'false' },
    { recurso: 'multi_moeda', valor: 'true' },
    { recurso: 'auditoria_completa', valor: 'false' },
  ];

  // Configurações do Plano Empresarial
  const configEmpresarial = [
    { recurso: 'usuarios_max', valor: '50' },
    { recurso: 'transacoes_max_mes', valor: '2000' },
    { recurso: 'km_tracking', valor: 'true' },
    { recurso: 'relatorios_avancados', valor: 'true' },
    { recurso: 'api_integracoes', valor: 'true' },
    { recurso: 'whatsapp_bot', valor: 'true' },
    { recurso: 'backup_automatico', valor: 'true' },
    { recurso: 'suporte_prioritario', valor: 'true' },
    { recurso: 'multi_moeda', valor: 'true' },
    { recurso: 'auditoria_completa', valor: 'true' },
  ];

  // Função para associar recursos a um plano
  const associarRecursos = async (plano: Plano, configs: any[]) => {
    for (const config of configs) {
      const recurso = recursosCreated.find(r => r.chave === config.recurso);
      if (recurso) {
        const planoRecurso = planoRecursoRepository.create({
          planoId: plano.id,
          recursoId: recurso.id,
          valorTexto: config.valor,
        });
        await planoRecursoRepository.save(planoRecurso);
      }
    }
  };

  await associarRecursos(savedPlanoBasico, configBasico);
  await associarRecursos(savedPlanoProfissional, configProfissional);
  await associarRecursos(savedPlanoEmpresarial, configEmpresarial);

  console.log('✅ Recursos associados aos planos com sucesso');

  // 5. Criar Gateway de Transferência
  console.log('💳 Criando gateway de transferência...');
  const gatewayTransferencia = gatewayRepository.create({
    nome: 'Transferência Bancária',
    tipo: TipoGateway.OFFLINE,
    ativo: true,
  });
  await gatewayRepository.save(gatewayTransferencia);
  console.log('✅ Gateway de transferência criado com sucesso');

  console.log('🎉 Seeds iniciais executados com sucesso!');
  console.log('');
  console.log('📋 Resumo:');
  console.log(`👤 Super Admin criado com email: ${adminEmail}`);
  console.log(`📋 Planos: ${savedPlanoBasico.nome}, ${savedPlanoProfissional.nome}, ${savedPlanoEmpresarial.nome}`);
  console.log(`🔧 Recursos: ${recursosCreated.length} recursos criados`);
  console.log(`💳 Gateway: ${gatewayTransferencia.nome}`);
}
