import { useEffect, useState } from 'react'
import Header from './components/Header'
import TimerPanel from './components/TimerPanel'
import SettingsPanel from './components/SettingsPanel'
import TaskList from './components/TaskList'
import StatisticsPanel from './components/StatisticsPanel'
import WeeklyChart from './components/WeeklyChart'
import { useTimer } from './hooks/useTimer'
import { useTasks } from './hooks/useTasks'
import { useStatistics } from './hooks/useStatistics'
import { useNotification } from './hooks/useNotification'
import { useLocalStorage } from './hooks/useLocalStorage'
import type { ChartDisplayMode } from './types'

export default function App() {
  const tasksApi = useTasks()
  const statistics = useStatistics()
  const { notify } = useNotification()
  const timer = useTimer((finishedMode, durationSeconds) => {
    if (finishedMode === 'work') {
      statistics.recordPomodoroCompletion(durationSeconds)
    }
    notify(finishedMode)
  })
  const [focusMode, setFocusMode] = useLocalStorage('focusMode', false)
  const [chartMode, setChartMode] = useState<ChartDisplayMode>('pomodoros')

  const completedTaskCount = tasksApi.tasks.filter((task) => task.completed).length

  useEffect(() => {
    statistics.syncCompletedTasksCount(completedTaskCount)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completedTaskCount])

  return (
    <div className="min-h-screen w-full max-w-[420px] mx-auto px-5 flex flex-col gap-1">
      <Header />
      <TimerPanel timer={timer} />
      <SettingsPanel
        timer={timer}
        focusMode={focusMode}
        onFocusModeChange={setFocusMode}
      />
      {!focusMode && (
        <>
          <TaskList tasksApi={tasksApi} />
          <StatisticsPanel
            todayPomodoros={statistics.todayPomodoros}
            todayFocusTime={statistics.todayFocusTime}
            completedTasks={statistics.statistics.completedTasks}
          />
          <WeeklyChart
            weeklyData={statistics.statistics.weeklyData}
            mode={chartMode}
            onModeChange={setChartMode}
          />
        </>
      )}
    </div>
  )
}
