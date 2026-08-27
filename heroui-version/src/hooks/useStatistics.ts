import { useEffect } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { WEEKLY_DATA_MAX_DAYS } from '../constants/statistics'
import type { Statistics } from '../types'

const DATE_CHECK_INTERVAL_MS = 60 * 1000

function todayYMD() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const INITIAL_STATISTICS: Statistics = { completedTasks: 0, weeklyData: [] }

export function useStatistics() {
  const [statistics, setStatistics] = useLocalStorage<Statistics>(
    'statistics',
    INITIAL_STATISTICS,
  )

  /** F-01完了時にF-04へ渡す：本日分のポモドーロ数・集中時間を加算する（受け渡し基準、SPEC.md §1.3） */
  function recordPomodoroCompletion(workSeconds: number) {
    const today = todayYMD()
    setStatistics((prev) => {
      const weeklyData = [...prev.weeklyData]
      if (!weeklyData.some((entry) => entry.date === today)) {
        weeklyData.unshift({ date: today, pomodoros: 0, focusTime: 0 })
        while (weeklyData.length > WEEKLY_DATA_MAX_DAYS) weeklyData.pop()
      }
      return {
        ...prev,
        weeklyData: weeklyData.map((entry) =>
          entry.date === today
            ? {
                ...entry,
                pomodoros: entry.pomodoros + 1,
                focusTime: entry.focusTime + workSeconds / 60,
              }
            : entry,
        ),
      }
    })
  }

  function syncCompletedTasksCount(count: number) {
    setStatistics((prev) =>
      prev.completedTasks === count ? prev : { ...prev, completedTasks: count },
    )
  }

  /**
   * F-04-3: 今日のデータ枠がなければ追加する。冪等なので起動時とポーリングの両方から呼べる。
   * アプリを開いたまま日付をまたいでも、1分ごとのポーリングで当日カウンタが自動的に0から始まる（異常系深掘り）。
   */
  function ensureTodayEntry() {
    const today = todayYMD()
    setStatistics((prev) => {
      if (prev.weeklyData.some((entry) => entry.date === today)) return prev
      const weeklyData = [
        { date: today, pomodoros: 0, focusTime: 0 },
        ...prev.weeklyData,
      ].slice(0, WEEKLY_DATA_MAX_DAYS)
      return { ...prev, weeklyData }
    })
  }

  useEffect(() => {
    ensureTodayEntry()
    const id = setInterval(ensureTodayEntry, DATE_CHECK_INTERVAL_MS)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const today = todayYMD()
  const todayEntry = statistics.weeklyData.find((entry) => entry.date === today)

  return {
    statistics,
    todayPomodoros: todayEntry?.pomodoros ?? 0,
    todayFocusTime: todayEntry?.focusTime ?? 0,
    recordPomodoroCompletion,
    syncCompletedTasksCount,
  }
}
