import { TIMER } from '../constants/messages'
import { TargetIcon } from './icons'
import type { TimerMode } from '../types'

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

const SIZE = 272
const STROKE = 14
const RADIUS = (SIZE - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export default function TimerRing({
  mode,
  currentTime,
  progressPercent,
  pomodoroCount,
}: {
  mode: TimerMode
  currentTime: number
  progressPercent: number
  pomodoroCount: number
}) {
  const offset = CIRCUMFERENCE * (1 - progressPercent / 100)
  const statusLabel = mode === 'work' ? TIMER.statusWork : TIMER.statusBreak
  const gradientId = mode === 'work' ? 'ring-gradient-work' : 'ring-gradient-break'

  return (
    <div className="relative" style={{ width: SIZE, height: SIZE }}>
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="-rotate-90 drop-shadow-[0_0_24px_hsl(var(--heroui-primary)/0.25)]"
      >
        <defs>
          <linearGradient id="ring-gradient-work" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--heroui-primary))" />
            <stop offset="100%" stopColor="hsl(var(--heroui-secondary))" />
          </linearGradient>
          <linearGradient id="ring-gradient-break" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--heroui-secondary))" />
            <stop offset="100%" stopColor="hsl(var(--heroui-success))" />
          </linearGradient>
        </defs>
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          strokeWidth={STROKE}
          className="stroke-default-100"
        />
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          strokeWidth={STROKE}
          strokeLinecap="round"
          stroke={`url(#${gradientId})`}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.3s linear' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
        <span
          className={`text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full ${
            mode === 'work'
              ? 'bg-primary/10 text-primary'
              : 'bg-secondary/10 text-secondary'
          }`}
        >
          {statusLabel}
        </span>
        <span className="text-5xl font-mono font-bold tabular-nums tracking-tight">
          {formatTime(currentTime)}
        </span>
        <span className="flex items-center gap-1 text-xs text-default-400">
          <TargetIcon width={13} height={13} strokeWidth={1.9} />
          {TIMER.pomodoroCountLabel} {pomodoroCount}
        </span>
      </div>
    </div>
  )
}
