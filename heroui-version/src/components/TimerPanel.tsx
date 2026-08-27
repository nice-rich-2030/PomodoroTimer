import { Button } from '@heroui/react'
import { TIMER } from '../constants/messages'
import { useTimer } from '../hooks/useTimer'
import TimerRing from './TimerRing'
import { PauseIcon, PlayIcon, RotateCcwIcon } from './icons'

export type TimerApi = ReturnType<typeof useTimer>

export default function TimerPanel({ timer }: { timer: TimerApi }) {
  const { mode, isRunning, currentTime, progressPercent, pomodoroCount, start, pause, reset } =
    timer

  return (
    <section className="flex flex-col items-center gap-6 py-8">
      <TimerRing
        mode={mode}
        currentTime={currentTime}
        progressPercent={progressPercent}
        pomodoroCount={pomodoroCount}
      />
      <div className="flex items-center gap-4">
        <Button
          isIconOnly
          variant="flat"
          radius="full"
          size="lg"
          onPress={reset}
          aria-label={TIMER.reset}
        >
          <RotateCcwIcon width={18} height={18} />
        </Button>
        <Button
          isIconOnly
          color={mode === 'work' ? 'primary' : 'secondary'}
          radius="full"
          size="lg"
          className="w-20 h-20 shadow-lg shadow-primary/30"
          onPress={isRunning ? pause : start}
          aria-label={isRunning ? TIMER.pause : TIMER.start}
        >
          {isRunning ? (
            <PauseIcon width={30} height={30} strokeWidth={2} />
          ) : (
            <PlayIcon width={30} height={30} strokeWidth={2} className="translate-x-0.5" />
          )}
        </Button>
      </div>
    </section>
  )
}
