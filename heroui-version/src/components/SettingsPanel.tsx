import { useState } from 'react'
import { Button, Card, CardBody, Slider, Switch } from '@heroui/react'
import { SETTINGS } from '../constants/messages'
import {
  WORK_TIME_MIN_MINUTES,
  WORK_TIME_MAX_MINUTES,
  BREAK_TIME_MIN_MINUTES,
  BREAK_TIME_MAX_MINUTES,
  PRESETS,
} from '../constants/timer'
import type { TimerApi } from './TimerPanel'
import { ChevronDownIcon, GearIcon } from './icons'

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
  const [expanded, setExpanded] = useState(false)

  return (
    <section className="py-3">
      <Card shadow="sm" className="border border-divider/60">
        <CardBody className="gap-4">
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            className="flex items-center justify-between w-full text-left"
          >
            <span className="text-sm font-semibold flex items-center gap-2">
              <GearIcon width={15} height={15} strokeWidth={1.9} className="text-default-400" />
              {SETTINGS.title}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-default-400">
              {workMinutes}/{breakMinutes} {SETTINGS.minutesUnit}
              <ChevronDownIcon
                width={14}
                height={14}
                strokeWidth={2}
                className={`transition-transform ${expanded ? 'rotate-180' : ''}`}
              />
            </span>
          </button>

          {expanded && (
            <div className="flex flex-col gap-5 pt-1">
              <div>
                <p className="mb-2 text-xs text-default-500">
                  {SETTINGS.workLabel}: {workMinutes}
                  {SETTINGS.minutesUnit}
                </p>
                <Slider
                  aria-label={SETTINGS.workLabel}
                  size="sm"
                  color="primary"
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
                <p className="mb-2 text-xs text-default-500">
                  {SETTINGS.breakLabel}: {breakMinutes}
                  {SETTINGS.minutesUnit}
                </p>
                <Slider
                  aria-label={SETTINGS.breakLabel}
                  size="sm"
                  color="secondary"
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
                    radius="full"
                    onPress={() => {
                      setWorkTime(preset.work * 60)
                      setBreakTime(preset.break * 60)
                    }}
                  >
                    {preset.work}/{preset.break}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <Switch
            size="sm"
            isSelected={focusMode}
            onValueChange={onFocusModeChange}
          >
            {SETTINGS.focusModeLabel}
          </Switch>
        </CardBody>
      </Card>
    </section>
  )
}
