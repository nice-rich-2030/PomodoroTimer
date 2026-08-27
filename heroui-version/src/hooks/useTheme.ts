import { useEffect } from 'react'
import { useLocalStorage } from './useLocalStorage'

/**
 * Q-01（テーマ切替の実装方式）: Tailwindの`dark`クラス手動トグルを採用（確定済み、PLAN.md §1.3参照）。
 * 切り替えロジックをこのフック1箇所に隔離し、後で`next-themes`等に差し替える場合もここだけを直せばよい。
 */
export function useTheme() {
  const [darkMode, setDarkMode] = useLocalStorage<boolean>('darkMode', false)

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', darkMode)
    root.setAttribute('data-theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  return { darkMode, setDarkMode }
}
