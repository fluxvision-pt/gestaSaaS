/**
 * Interface que define os módulos e limitações disponíveis por plano
 */
export interface PlanoModulos {
  // Módulo de Transações Financeiras
  transacoes: {
    limite: number | 'ilimitado';
    categorias_personalizadas: boolean;
    importacao_automatica: boolean;
    anexos: boolean;
    tags: boolean;
    busca_avancada: boolean;
  };

  // Módulo de Veículos
  veiculos: {
    limite: number | 'ilimitado';
    manutencao: boolean;
    combustivel: boolean;
    rentabilidade: boolean;
    historico_completo: boolean;
    alertas: boolean;
  };

  // Módulo de Relatórios
  relatorios: {
    basicos: boolean;
    avancados: boolean;
    exportacao: boolean;
    agendamento: boolean;
    graficos_interativos: boolean;
    comparativos: boolean;
  };

  // Módulo de Dashboard
  dashboard: {
    widgets_basicos: boolean;
    widgets_avancados: boolean;
    personalizacao: boolean;
    tempo_real: boolean;
    historico_detalhado: boolean;
  };

  // Módulo de Usuários
  usuarios: {
    limite: number | 'ilimitado';
    perfis_personalizados: boolean;
    permissoes_granulares: boolean;
  };

  // Módulo de Integrações
  integracoes: {
    api_externa: boolean;
    webhooks: boolean;
    open_banking: boolean;
    apps_terceiros: boolean;
  };

  // Módulo de Suporte
  suporte: {
    chat: boolean;
    email: boolean;
    telefone: boolean;
    prioridade: 'baixa' | 'media' | 'alta';
    sla_horas: number;
  };

  // Módulo de Backup e Segurança
  backup: {
    automatico: boolean;
    frequencia_dias: number;
    retencao_meses: number;
    criptografia: boolean;
  };
}

/**
 * Enum dos módulos disponíveis no sistema
 */
export enum ModuloSistema {
  TRANSACOES = 'transacoes',
  VEICULOS = 'veiculos',
  RELATORIOS = 'relatorios',
  DASHBOARD = 'dashboard',
  USUARIOS = 'usuarios',
  INTEGRACOES = 'integracoes',
  SUPORTE = 'suporte',
  BACKUP = 'backup',
}

/**
 * Enum dos recursos específicos por módulo
 */
export enum RecursoModulo {
  // Transações
  TRANSACOES_LIMITE = 'transacoes.limite',
  TRANSACOES_CATEGORIAS_PERSONALIZADAS = 'transacoes.categorias_personalizadas',
  TRANSACOES_IMPORTACAO_AUTOMATICA = 'transacoes.importacao_automatica',
  TRANSACOES_ANEXOS = 'transacoes.anexos',
  TRANSACOES_TAGS = 'transacoes.tags',
  TRANSACOES_BUSCA_AVANCADA = 'transacoes.busca_avancada',

  // Veículos
  VEICULOS_LIMITE = 'veiculos.limite',
  VEICULOS_MANUTENCAO = 'veiculos.manutencao',
  VEICULOS_COMBUSTIVEL = 'veiculos.combustivel',
  VEICULOS_RENTABILIDADE = 'veiculos.rentabilidade',
  VEICULOS_HISTORICO_COMPLETO = 'veiculos.historico_completo',
  VEICULOS_ALERTAS = 'veiculos.alertas',

  // Relatórios
  RELATORIOS_BASICOS = 'relatorios.basicos',
  RELATORIOS_AVANCADOS = 'relatorios.avancados',
  RELATORIOS_EXPORTACAO = 'relatorios.exportacao',
  RELATORIOS_AGENDAMENTO = 'relatorios.agendamento',
  RELATORIOS_GRAFICOS_INTERATIVOS = 'relatorios.graficos_interativos',
  RELATORIOS_COMPARATIVOS = 'relatorios.comparativos',

  // Dashboard
  DASHBOARD_WIDGETS_BASICOS = 'dashboard.widgets_basicos',
  DASHBOARD_WIDGETS_AVANCADOS = 'dashboard.widgets_avancados',
  DASHBOARD_PERSONALIZACAO = 'dashboard.personalizacao',
  DASHBOARD_TEMPO_REAL = 'dashboard.tempo_real',
  DASHBOARD_HISTORICO_DETALHADO = 'dashboard.historico_detalhado',

  // Usuários
  USUARIOS_LIMITE = 'usuarios.limite',
  USUARIOS_PERFIS_PERSONALIZADOS = 'usuarios.perfis_personalizados',
  USUARIOS_PERMISSOES_GRANULARES = 'usuarios.permissoes_granulares',

  // Integrações
  INTEGRACOES_API_EXTERNA = 'integracoes.api_externa',
  INTEGRACOES_WEBHOOKS = 'integracoes.webhooks',
  INTEGRACOES_OPEN_BANKING = 'integracoes.open_banking',
  INTEGRACOES_APPS_TERCEIROS = 'integracoes.apps_terceiros',

  // Suporte
  SUPORTE_CHAT = 'suporte.chat',
  SUPORTE_EMAIL = 'suporte.email',
  SUPORTE_TELEFONE = 'suporte.telefone',
  SUPORTE_PRIORIDADE = 'suporte.prioridade',
  SUPORTE_SLA_HORAS = 'suporte.sla_horas',

  // Backup
  BACKUP_AUTOMATICO = 'backup.automatico',
  BACKUP_FREQUENCIA_DIAS = 'backup.frequencia_dias',
  BACKUP_RETENCAO_MESES = 'backup.retencao_meses',
  BACKUP_CRIPTOGRAFIA = 'backup.criptografia',
}

/**
 * Configurações padrão dos planos
 */
export const PLANOS_CONFIGURACAO: Record<string, PlanoModulos> = {
  GRATUITO: {
    transacoes: {
      limite: 50,
      categorias_personalizadas: false,
      importacao_automatica: false,
      anexos: false,
      tags: false,
      busca_avancada: false,
    },
    veiculos: {
      limite: 1,
      manutencao: false,
      combustivel: true,
      rentabilidade: false,
      historico_completo: false,
      alertas: false,
    },
    relatorios: {
      basicos: true,
      avancados: false,
      exportacao: false,
      agendamento: false,
      graficos_interativos: false,
      comparativos: false,
    },
    dashboard: {
      widgets_basicos: true,
      widgets_avancados: false,
      personalizacao: false,
      tempo_real: false,
      historico_detalhado: false,
    },
    usuarios: {
      limite: 1,
      perfis_personalizados: false,
      permissoes_granulares: false,
    },
    integracoes: {
      api_externa: false,
      webhooks: false,
      open_banking: false,
      apps_terceiros: false,
    },
    suporte: {
      chat: false,
      email: true,
      telefone: false,
      prioridade: 'baixa',
      sla_horas: 72,
    },
    backup: {
      automatico: false,
      frequencia_dias: 30,
      retencao_meses: 1,
      criptografia: false,
    },
  },

  BASICO: {
    transacoes: {
      limite: 'ilimitado',
      categorias_personalizadas: true,
      importacao_automatica: false,
      anexos: true,
      tags: true,
      busca_avancada: false,
    },
    veiculos: {
      limite: 3,
      manutencao: true,
      combustivel: true,
      rentabilidade: true,
      historico_completo: false,
      alertas: true,
    },
    relatorios: {
      basicos: true,
      avancados: true,
      exportacao: true,
      agendamento: false,
      graficos_interativos: true,
      comparativos: false,
    },
    dashboard: {
      widgets_basicos: true,
      widgets_avancados: true,
      personalizacao: false,
      tempo_real: true,
      historico_detalhado: false,
    },
    usuarios: {
      limite: 3,
      perfis_personalizados: false,
      permissoes_granulares: false,
    },
    integracoes: {
      api_externa: false,
      webhooks: false,
      open_banking: false,
      apps_terceiros: false,
    },
    suporte: {
      chat: true,
      email: true,
      telefone: false,
      prioridade: 'media',
      sla_horas: 24,
    },
    backup: {
      automatico: true,
      frequencia_dias: 7,
      retencao_meses: 3,
      criptografia: true,
    },
  },

  PROFISSIONAL: {
    transacoes: {
      limite: 'ilimitado',
      categorias_personalizadas: true,
      importacao_automatica: true,
      anexos: true,
      tags: true,
      busca_avancada: true,
    },
    veiculos: {
      limite: 'ilimitado',
      manutencao: true,
      combustivel: true,
      rentabilidade: true,
      historico_completo: true,
      alertas: true,
    },
    relatorios: {
      basicos: true,
      avancados: true,
      exportacao: true,
      agendamento: true,
      graficos_interativos: true,
      comparativos: true,
    },
    dashboard: {
      widgets_basicos: true,
      widgets_avancados: true,
      personalizacao: true,
      tempo_real: true,
      historico_detalhado: true,
    },
    usuarios: {
      limite: 10,
      perfis_personalizados: true,
      permissoes_granulares: false,
    },
    integracoes: {
      api_externa: true,
      webhooks: true,
      open_banking: false,
      apps_terceiros: true,
    },
    suporte: {
      chat: true,
      email: true,
      telefone: true,
      prioridade: 'alta',
      sla_horas: 8,
    },
    backup: {
      automatico: true,
      frequencia_dias: 1,
      retencao_meses: 12,
      criptografia: true,
    },
  },

  PREMIUM: {
    transacoes: {
      limite: 'ilimitado',
      categorias_personalizadas: true,
      importacao_automatica: true,
      anexos: true,
      tags: true,
      busca_avancada: true,
    },
    veiculos: {
      limite: 'ilimitado',
      manutencao: true,
      combustivel: true,
      rentabilidade: true,
      historico_completo: true,
      alertas: true,
    },
    relatorios: {
      basicos: true,
      avancados: true,
      exportacao: true,
      agendamento: true,
      graficos_interativos: true,
      comparativos: true,
    },
    dashboard: {
      widgets_basicos: true,
      widgets_avancados: true,
      personalizacao: true,
      tempo_real: true,
      historico_detalhado: true,
    },
    usuarios: {
      limite: 'ilimitado',
      perfis_personalizados: true,
      permissoes_granulares: true,
    },
    integracoes: {
      api_externa: true,
      webhooks: true,
      open_banking: true,
      apps_terceiros: true,
    },
    suporte: {
      chat: true,
      email: true,
      telefone: true,
      prioridade: 'alta',
      sla_horas: 2,
    },
    backup: {
      automatico: true,
      frequencia_dias: 1,
      retencao_meses: 24,
      criptografia: true,
    },
  },
};