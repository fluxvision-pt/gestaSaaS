/**
 * Helper para tipos de dados compatíveis entre diferentes bancos de dados
 * Adapta automaticamente os tipos baseado na configuração do banco
 */

// Função para obter o tipo de timestamp compatível com o banco atual
export function getTimestampType() {
  const dbType = process.env.DB_TYPE || 'postgres';
  
  switch (dbType.toLowerCase()) {
    case 'sqlite':
      return 'datetime' as const;
    case 'postgres':
    case 'postgresql':
      return 'timestamp' as const;
    case 'mysql':
    case 'mariadb':
      return 'timestamp' as const;
    default:
      return 'timestamp' as const;
  }
}

// Função para obter o tipo de data compatível com o banco atual
export function getDateType() {
  const dbType = process.env.DB_TYPE || 'postgres';
  
  switch (dbType.toLowerCase()) {
    case 'sqlite':
      return 'date' as const;
    case 'postgres':
    case 'postgresql':
      return 'date' as const;
    case 'mysql':
    case 'mariadb':
      return 'date' as const;
    default:
      return 'date' as const;
  }
}

// Função para obter o tipo de texto compatível com o banco atual
export function getTextType() {
  const dbType = process.env.DB_TYPE || 'postgres';
  
  switch (dbType.toLowerCase()) {
    case 'sqlite':
      return 'text' as const;
    case 'postgres':
    case 'postgresql':
      return 'text' as const;
    case 'mysql':
    case 'mariadb':
      return 'text' as const;
    default:
      return 'text' as const;
  }
}

// Função para obter o tipo booleano compatível com o banco atual
export function getBooleanType() {
  const dbType = process.env.DB_TYPE || 'postgres';
  
  switch (dbType.toLowerCase()) {
    case 'sqlite':
      return 'boolean' as const;
    case 'postgres':
    case 'postgresql':
      return 'boolean' as const;
    case 'mysql':
    case 'mariadb':
      return 'boolean' as const;
    default:
      return 'boolean' as const;
  }
}

// Constantes para facilitar o uso - usando getters para avaliação dinâmica
export const DB_TYPES = {
  get TIMESTAMP() { return getTimestampType(); },
  get DATE() { return getDateType(); },
  get TEXT() { return getTextType(); },
  get BOOLEAN() { return getBooleanType(); },
} as const;