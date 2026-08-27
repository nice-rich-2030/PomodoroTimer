export interface Task {
  id: string
  text: string
  completed: boolean
  plannedPomodoros: number
  completedPomodoros: number
  createdAt: number
  order: number
}

export type TimerMode = 'work' | 'break'

export interface TimerState {
  workTime: number
  breakTime: number
  currentTime: number
  isRunning: boolean
  mode: TimerMode
  pomodoroCount: number
  targetEndTime: number | null
}

export interface DailyStat {
  date: string
  pomodoros: number
  focusTime: number
}

export interface Statistics {
  completedTasks: number
  weeklyData: DailyStat[]
}

export type ChartDisplayMode = 'pomodoros' | 'focusTime'

export interface Settings {
  workTime: number
  breakTime: number
  darkMode: boolean
  focusMode: boolean
  chartDisplayMode: ChartDisplayMode
}
