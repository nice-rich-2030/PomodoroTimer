import { Switch } from '@heroui/react'
import { APP_TITLE, HEADER } from '../constants/messages'
import { useTheme } from '../hooks/useTheme'

export default function Header() {
  const { darkMode, setDarkMode } = useTheme()

  return (
    <header className="flex items-center justify-between py-6">
      <h1 className="text-2xl font-bold">{APP_TITLE}</h1>
      <Switch
        aria-label={HEADER.themeToggleLabel}
        isSelected={darkMode}
        onValueChange={setDarkMode}
      />
    </header>
  )
}
