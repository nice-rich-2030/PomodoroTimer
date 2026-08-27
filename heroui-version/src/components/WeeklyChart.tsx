import { useEffect, useRef, useState } from 'react'
import { Button, Card, CardBody } from '@heroui/react'
import { STATISTICS } from '../constants/messages'
import { CHART, WEEKDAY_LABELS } from '../constants/statistics'
import type { ChartDisplayMode, DailyStat } from '../types'

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
  const [size, setSize] = useState({ width: 0, height: 200 })

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => {
      setSize({ width: entry.contentRect.width, height: 200 })
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const chartData = [...weeklyData]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 7)

  const padding = 40
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
    <div className="py-4">
      <div className="flex gap-2 mb-3">
        <Button
          size="sm"
          color={mode === 'pomodoros' ? 'primary' : 'default'}
          variant={mode === 'pomodoros' ? 'solid' : 'bordered'}
          onPress={() => onModeChange('pomodoros')}
        >
          {STATISTICS.showPomodoros}
        </Button>
        <Button
          size="sm"
          color={mode === 'focusTime' ? 'secondary' : 'default'}
          variant={mode === 'focusTime' ? 'solid' : 'bordered'}
          onPress={() => onModeChange('focusTime')}
        >
          {STATISTICS.showFocusTime}
        </Button>
      </div>
      <Card>
        <CardBody className="p-0">
          <div ref={containerRef} className="h-48 w-full">
            {chartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-default-400">
                {CHART.noData}
              </div>
            ) : (
              <svg width={width} height={height}>
                <text
                  x={width / 2}
                  y={padding / 2}
                  textAnchor="middle"
                  fontSize={14}
                  fontWeight="bold"
                  style={{ fill: `hsl(var(${barColorVar}))` }}
                >
                  {CHART.title[mode]}
                </text>
                <line
                  x1={padding}
                  y1={padding}
                  x2={padding}
                  y2={height - padding}
                  className="stroke-default-400"
                />
                <line
                  x1={padding}
                  y1={height - padding}
                  x2={width - padding}
                  y2={height - padding}
                  className="stroke-default-400"
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
                        x={x + 5}
                        y={y}
                        width={Math.max(0, barWidth - 10)}
                        height={barHeight}
                        rx={4}
                        style={{ fill: `hsl(var(${barColorVar}))` }}
                      />
                      {value > 0 && (
                        <text
                          x={x + barWidth / 2}
                          y={y - 5}
                          textAnchor="middle"
                          fontSize={12}
                          className="fill-default-600"
                        >
                          {Math.round(value)}
                        </text>
                      )}
                      <text
                        x={x + barWidth / 2}
                        y={height - padding + 15}
                        textAnchor="middle"
                        fontSize={12}
                        className="fill-default-600"
                      >
                        {dateLabel}
                      </text>
                      <text
                        x={x + barWidth / 2}
                        y={height - padding + 30}
                        textAnchor="middle"
                        fontSize={10}
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
    </div>
  )
}
