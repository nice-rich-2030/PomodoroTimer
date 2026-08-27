import { Button, Slider, Switch } from '@heroui/react'
import { SETTINGS } from '../constants/messages'
import {
  WORK_TIME_MIN_MINUTES,
  WORK_TIME_MAX_MINUTES,
  BREAK_TIME_MIN_MINUTES,
  BREAK_TIME_MAX_MINUTES,
  PRESETS,
} from '../constants/timer'
import type { TimerApi } from './TimerPanel'

export default function SettingsPanel({
  timer,
  focusMode,
  onFocusModeChange,
}: {
  timer: TimerApi
  focusMode: boolean
  onFocusModeChange: (value: boolean) => void
}) {
  const { workTime, setWorkTime, breakTime, setBreakTime } = timer
  const workMinutes = workTime / 60
  const breakMinutes = breakTime / 60

  return (
    <section className="py-6">
      <h2 className="text-xl font-semibold mb-3">{SETTINGS.title}</h2>
      <div className="flex flex-col gap-6">
        <div>
          <p className="mb-2 text-sm">
            {SETTINGS.workLabel}: {workMinutes}
            {SETTINGS.minutesUnit}
          </p>
          <Slider
            aria-label={SETTINGS.workLabel}
            minValue={WORK_TIME_MIN_MINUTES}
            maxValue={WORK_TIME_MAX_MINUTES}
            step={1}
            value={workMinutes}
            onChange={(value) =>
              setWorkTime((Array.isArray(value) ? value[0] : value) * 60)
            }
          />
        </div>
        <div>
          <p className="mb-2 text-sm">
            {SETTINGS.breakLabel}: {breakMinutes}
            {SETTINGS.minutesUnit}
          </p>
          <Slider
            aria-label={SETTINGS.breakLabel}
            minValue={BREAK_TIME_MIN_MINUTES}
            maxValue={BREAK_TIME_MAX_MINUTES}
            step={1}
            value={breakMinutes}
            onChange={(value) =>
              setBreakTime((Array.isArray(value) ? value[0] : value) * 60)
            }
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {PRESETS.map((preset) => (
            <Button
              key={`${preset.work}-${preset.break}`}
              size="sm"
              variant="flat"
              onPress={() => {
                setWorkTime(preset.work * 60)
                setBreakTime(preset.break * 60)
              }}
            >
              {preset.work}/{preset.break}
            </Button>
          ))}
        </div>
        <Switch isSelected={focusMode} onValueChange={onFocusModeChange}>
          {SETTINGS.focusModeLabel}
        </Switch>
      </div>
    </section>
  )
}
