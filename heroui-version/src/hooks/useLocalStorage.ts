import { useEffect, useState } from 'react'

const STORAGE_PREFIX = 'flowstate-heroui:'

export function useLocalStorage<T>(key: string, initialValue: T) {
  const storageKey = STORAGE_PREFIX + key

  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(storageKey)
      return stored !== null ? (JSON.parse(stored) as T) : initialValue
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(value))
    } catch {
      // LocalStorageが利用できない環境（プライベートブラウジング等）では保存をスキップする
    }
  }, [storageKey, value])

  return [value, setValue] as const
}
