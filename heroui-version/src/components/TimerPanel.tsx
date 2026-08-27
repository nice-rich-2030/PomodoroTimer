import { Button, CircularProgress } from '@heroui/react'
import { TIMER } from '../constants/messages'
import { useTimer } from '../hooks/useTimer'

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export type TimerApi = ReturnType<typeof useTimer>

export default function TimerPanel({ timer }: { timer: TimerApi }) {
  const { mode, isRunning, currentTime, progressPercent, pomodoroCount, start, pause, reset } =
    timer
  const statusLabel = mode === 'work' ? TIMER.statusWork : TIMER.statusBreak

  return (
    <section className="flex flex-col items-center gap-4 py-8">
      <CircularProgress
        aria-label={statusLabel}
        size="lg"
        value={progressPercent}
        color={mode === 'work' ? 'primary' : 'secondary'}
        classNames={{ svg: 'w-56 h-56' }}
        showValueLabel={false}
      />
      <div className="text-4xl font-mono">{formatTime(currentTime)}</div>
      <div className="text-lg">{statusLabel}</div>
      <div className="flex gap-3">
        <Button color="primary" onPress={start} isDisabled={isRunning}>
          {TIMER.start}
        </Button>
        <Button color="default" onPress={pause} isDisabled={!isRunning}>
          {TIMER.pause}
        </Button>
        <Button variant="bordered" onPress={reset}>
          {TIMER.reset}
        </Button>
      </div>
      <div className="text-sm text-default-500">
        {TIMER.pomodoroCountLabel}: {pomodoroCount}
      </div>
    </section>
  )
}
