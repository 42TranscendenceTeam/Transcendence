/**
 * Language Selector Component
 * Dropdown to change the application's language
 */

import { useTranslation } from 'react-i18next';

const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' }
];

interface LanguageSelectorProps {
  value: string;
  onChange: (lang: string) => void;
}

function LanguageSelector({ value, onChange }: LanguageSelectorProps) {
  const { i18n } = useTranslation();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  };

  return (
    <select
      value={value || i18n.language}
      onChange={handleChange}
      className="language-select"
    >
      {languages.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.flag} {lang.name}
        </option>
      ))}
    </select>
  );
}

export default LanguageSelector;