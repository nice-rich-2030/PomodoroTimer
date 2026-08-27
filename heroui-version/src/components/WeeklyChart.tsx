import { useEffect, useRef, useState } from 'react'
import { Button, Card, CardBody } from '@heroui/react'
import { STATISTICS } from '../constants/messages'
import { CHART, WEEKDAY_LABELS } from '../constants/statistics'
import type { ChartDisplayMode, DailyStat } from '../types'
import SectionLabel from './SectionLabel'
import { TrendingUpIcon } from './icons'

function formatDateLabel(dateStr: string) {
  const date = new Date(dateStr)
  const month = date.getMonth() + 1
  const day = date.getDate()
  const weekday = WEEKDAY_LABELS[date.getDay()]
  return { dateLabel: `${month}/${day}`, weekdayLabel: `(${weekday})` }
}

export default function WeeklyChart({
  weeklyData,
  mode,
  onModeChange,
}: {
  weeklyData: DailyStat[]
  mode: ChartDisplayMode
  onModeChange: (mode: ChartDisplayMode) => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ width: 0, height: 190 })

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => {
      setSize({ width: entry.contentRect.width, height: 190 })
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const chartData = [...weeklyData]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 7)

  const padding = 28
  const { width, height } = size
  const chartWidth = Math.max(0, width - padding * 2)
  const chartHeight = Math.max(0, height - padding * 2)
  const barWidth = chartData.length > 0 ? chartWidth / chartData.length : 0
  const values = chartData.map((entry) =>
    mode === 'pomodoros' ? entry.pomodoros : entry.focusTime,
  )
  const maxValue = Math.max(...values, 1)
  const barColorVar = CHART.barColorVar[mode]

  return (
    <section className="py-4">
      <div className="flex items-center justify-between mb-2.5">
        <SectionLabel icon={<TrendingUpIcon width={14} height={14} strokeWidth={2} />}>
          {CHART.title[mode]}
        </SectionLabel>
        <div className="flex gap-1 bg-default-100 rounded-full p-0.5">
          <Button
            size="sm"
            radius="full"
            className="h-6 min-w-0 px-3 text-xs"
            color={mode === 'pomodoros' ? 'primary' : 'default'}
            variant={mode === 'pomodoros' ? 'solid' : 'light'}
            onPress={() => onModeChange('pomodoros')}
          >
            {STATISTICS.showPomodoros}
          </Button>
          <Button
            size="sm"
            radius="full"
            className="h-6 min-w-0 px-3 text-xs"
            color={mode === 'focusTime' ? 'secondary' : 'default'}
            variant={mode === 'focusTime' ? 'solid' : 'light'}
            onPress={() => onModeChange('focusTime')}
          >
            {STATISTICS.showFocusTime}
          </Button>
        </div>
      </div>
      <Card shadow="sm" className="border border-divider/60">
        <CardBody className="p-0">
          <div ref={containerRef} className="h-[190px] w-full">
            {chartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-default-400">
                {CHART.noData}
              </div>
            ) : (
              <svg width={width} height={height}>
                <line
                  x1={padding}
                  y1={padding}
                  x2={padding}
                  y2={height - padding}
                  className="stroke-default-200"
                />
                <line
                  x1={padding}
                  y1={height - padding}
                  x2={width - padding}
                  y2={height - padding}
                  className="stroke-default-200"
                />
                {chartData.map((entry, index) => {
                  const value = mode === 'pomodoros' ? entry.pomodoros : entry.focusTime
                  const barHeight = (value / maxValue) * chartHeight
                  const x = padding + index * barWidth
                  const y = height - padding - barHeight
                  const { dateLabel, weekdayLabel } = formatDateLabel(entry.date)

                  return (
                    <g key={entry.date}>
                      <rect
                        x={x + 4}
                        y={y}
                        width={Math.max(0, barWidth - 8)}
                        height={barHeight}
                        rx={4}
                        style={{ fill: `hsl(var(${barColorVar}))` }}
                      />
                      {value > 0 && (
                        <text
                          x={x + barWidth / 2}
                          y={y - 5}
                          textAnchor="middle"
                          fontSize={11}
                          className="fill-default-600"
                        >
                          {Math.round(value)}
                        </text>
                      )}
                      <text
                        x={x + barWidth / 2}
                        y={height - padding + 14}
                        textAnchor="middle"
                        fontSize={10}
                        className="fill-default-500"
                      >
                        {dateLabel}
                      </text>
                      <text
                        x={x + barWidth / 2}
                        y={height - padding + 27}
                        textAnchor="middle"
                        fontSize={9}
                        className="fill-default-400"
                      >
                        {weekdayLabel}
                      </text>
                    </g>
                  )
                })}
              </svg>
            )}
          </div>
        </CardBody>
      </Card>
    </section>
  )
}
