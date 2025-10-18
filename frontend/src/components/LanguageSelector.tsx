import { useTranslation } from 'react-i18next'
import { Languages } from 'lucide-react'

const languages = [
  { code: 'pt-BR', name: 'Português', flag: '🇧🇷' },
  { code: 'en-US', name: 'English', flag: '🇺🇸' }
]

export function LanguageSelector() {
  const { i18n } = useTranslation()

  const changeLanguage = (event: React.ChangeEvent<HTMLSelectElement>) => {
    i18n.changeLanguage(event.target.value)
  }

  return (
    <div className="flex items-center gap-2">
      <Languages className="h-4 w-4 text-gray-500" />
      <select
        value={i18n.language}
        onChange={changeLanguage}
        className="bg-transparent border-none text-sm focus:outline-none cursor-pointer"
      >
        {languages.map((language) => (
          <option key={language.code} value={language.code}>
            {language.flag} {language.name}
          </option>
        ))}
      </select>
    </div>
  )
}