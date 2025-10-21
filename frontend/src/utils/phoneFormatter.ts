interface PhoneMask {
  [key: string]: string
}

// Máscaras de telefone por código de país
const phoneMasks: PhoneMask = {
  '+55': '(##) #####-####', // Brasil
  '+1': '(###) ###-####',   // EUA/Canadá
  '+54': '## ####-####',    // Argentina
  '+56': '# ####-####',     // Chile
  '+57': '### ###-####',    // Colômbia
  '+51': '### ###-###',     // Peru
  '+598': '#### ####',      // Uruguai
  '+595': '### ###-###',    // Paraguai
  '+591': '#### ####',      // Bolívia
  '+593': '## ###-####',    // Equador
  '+58': '###-###-####',    // Venezuela
  '+52': '## ####-####',    // México
  '+351': '### ### ###',    // Portugal
  '+34': '### ### ###',     // Espanha
  '+33': '## ## ## ## ##',  // França
  '+39': '### ### ####',    // Itália
  '+49': '### ### ####',    // Alemanha
  '+44': '#### ### ####',   // Reino Unido
  '+61': '### ### ###'      // Austrália
}

export const formatPhoneNumber = (value: string, dialCode: string): string => {
  // Remove todos os caracteres não numéricos
  const numbers = value.replace(/\D/g, '')
  
  // Pega a máscara para o código do país
  const mask = phoneMasks[dialCode] || '### ### ####'
  
  let formatted = ''
  let numberIndex = 0
  
  for (let i = 0; i < mask.length && numberIndex < numbers.length; i++) {
    if (mask[i] === '#') {
      formatted += numbers[numberIndex]
      numberIndex++
    } else {
      formatted += mask[i]
    }
  }
  
  return formatted
}

export const getMaxLength = (dialCode: string): number => {
  const mask = phoneMasks[dialCode] || '### ### ####'
  return mask.replace(/[^#]/g, '').length
}

export const cleanPhoneNumber = (value: string): string => {
  return value.replace(/\D/g, '')
}

export const formatToE164 = (phoneNumber: string, dialCode: string): string => {
  const cleanNumber = cleanPhoneNumber(phoneNumber)
  return `${dialCode}${cleanNumber}`
}

export const parseE164 = (e164Number: string): { dialCode: string; number: string } => {
  // Encontra o código de país mais longo que corresponde
  const sortedDialCodes = Object.keys(phoneMasks).sort((a, b) => b.length - a.length)
  
  for (const dialCode of sortedDialCodes) {
    if (e164Number.startsWith(dialCode)) {
      return {
        dialCode,
        number: e164Number.substring(dialCode.length)
      }
    }
  }
  
  // Fallback para Brasil se não encontrar
  return {
    dialCode: '+55',
    number: e164Number.startsWith('+') ? e164Number.substring(3) : e164Number
  }
}