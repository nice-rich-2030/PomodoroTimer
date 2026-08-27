import { Switch } from '@heroui/react'
import { APP_TITLE, HEADER } from '../constants/messages'
import { useTheme } from '../hooks/useTheme'
import { MoonIcon, SunIcon } from './icons'

export default function Header() {
  const { darkMode, setDarkMode } = useTheme()

  return (
    <header className="flex items-center justify-between py-5 sticky top-0 z-10 backdrop-blur-md bg-background/70">
      <h1 className="text-lg font-bold tracking-tight flex items-center gap-2">
        <span
          aria-hidden="true"
          className="w-2 h-2 rounded-full bg-gradient-to-br from-primary to-secondary"
        />
        {APP_TITLE}
      </h1>
      <Switch
        aria-label={HEADER.themeToggleLabel}
        size="sm"
        isSelected={darkMode}
        onValueChange={setDarkMode}
        startContent={<MoonIcon width={13} height={13} strokeWidth={2} />}
        endContent={<SunIcon width={13} height={13} strokeWidth={2} />}
      />
    </header>
  )
}
