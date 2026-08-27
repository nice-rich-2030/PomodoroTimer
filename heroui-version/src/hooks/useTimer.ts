import { useEffect, useRef, useState } from 'react'
import { useLocalStorage } from './useLocalStorage'
import {
  DEFAULT_WORK_TIME_MINUTES,
  DEFAULT_BREAK_TIME_MINUTES,
  TIMER_TICK_MS,
} from '../constants/timer'
import type { TimerMode } from '../types'

/**
 * F-01（開始/一時停止/リセット/自動切替）の実装。
 * `targetEndTime`（終了予定時刻）ベースで残り時間を都度再計算する方式（🔒不変核、PLAN.md §1.1）。
 * バックグラウンドタブでは`setInterval`が間引かれるため、`visibilitychange`で復帰時に即座に再計算する（F-01-3）。
 * 既存版(js/app.js)の挙動に合わせ、モード自動切替時はカウントダウンを自動再開せず停止する。
 */
export function useTimer(
  onSessionEnd?: (finishedMode: TimerMode, durationSeconds: number) => void,
) {
  const [workTime, setWorkTime] = useLocalStorage(
    'workTime',
    DEFAULT_WORK_TIME_MINUTES * 60,
  )
  const [breakTime, setBreakTime] = useLocalStorage(
    'breakTime',
    DEFAULT_BREAK_TIME_MINUTES * 60,
  )
  const [pomodoroCount, setPomodoroCount] = useLocalStorage('pomodoroCount', 0)

  const [mode, setMode] = useState<TimerMode>('work')
  const [isRunning, setIsRunning] = useState(false)
  const [currentTime, setCurrentTime] = useState(workTime)

  const targetEndTimeRef = useRef<number | null>(null)
  const pausedRemainingRef = useRef<number | null>(null)
  const tickRef = useRef<() => void>(() => {})

  useEffect(() => {
    if (!isRunning) {
      setCurrentTime(mode === 'work' ? workTime : breakTime)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workTime, breakTime])

  useEffect(() => {
    tickRef.current = () => {
      if (!isRunning) return
      const targetEndTime = targetEndTimeRef.current
      if (targetEndTime === null) return
      const remainingMs = targetEndTime - Date.now()

      if (remainingMs <= 0) {
        const finishedMode = mode
        const finishedDuration = finishedMode === 'work' ? workTime : breakTime
        const nextMode: TimerMode = finishedMode === 'work' ? 'break' : 'work'
        const nextDuration = nextMode === 'work' ? workTime : breakTime

        if (finishedMode === 'work') {
          setPomodoroCount((count) => count + 1)
        }
        onSessionEnd?.(finishedMode, finishedDuration)

        setMode(nextMode)
        setCurrentTime(nextDuration)
        setIsRunning(false)
        targetEndTimeRef.current = null
        pausedRemainingRef.current = null
        return
      }

      setCurrentTime(Math.ceil(remainingMs / 1000))
    }
  }, [isRunning, mode, workTime, breakTime, setPomodoroCount, onSessionEnd])

  useEffect(() => {
    if (!isRunning) return
    const id = setInterval(() => tickRef.current(), TIMER_TICK_MS)
    return () => clearInterval(id)
  }, [isRunning])

  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') {
        tickRef.current()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () =>
      document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  function start() {
    if (isRunning) return
    const now = Date.now()
    if (pausedRemainingRef.current !== null) {
      targetEndTimeRef.current = now + pausedRemainingRef.current * 1000
      pausedRemainingRef.current = null
    } else {
      const duration = mode === 'work' ? workTime : breakTime
      setCurrentTime(duration)
      targetEndTimeRef.current = now + duration * 1000
    }
    setIsRunning(true)
  }

  function pause() {
    if (!isRunning) return
    const targetEndTime = targetEndTimeRef.current
    if (targetEndTime !== null) {
      pausedRemainingRef.current = Math.max(
        0,
        Math.round((targetEndTime - Date.now()) / 1000),
      )
    }
    setIsRunning(false)
  }

  function reset() {
    setIsRunning(false)
    setMode('work')
    setCurrentTime(workTime)
    targetEndTimeRef.current = null
    pausedRemainingRef.current = null
  }

  const totalTime = mode === 'work' ? workTime : breakTime
  const progressPercent =
    totalTime > 0 ? Math.min(100, 100 - (currentTime / totalTime) * 100) : 0

  return {
    workTime,
    setWorkTime,
    breakTime,
    setBreakTime,
    pomodoroCount,
    mode,
    isRunning,
    currentTime,
    progressPercent,
    start,
    pause,
    reset,
  }
}
