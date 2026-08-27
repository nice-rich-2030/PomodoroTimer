import { Card, CardBody } from '@heroui/react'
import { STATISTICS } from '../constants/messages'
import SectionLabel from './SectionLabel'
import { BarChartIcon } from './icons'

export default function StatisticsPanel({
  todayPomodoros,
  todayFocusTime,
  completedTasks,
}: {
  todayPomodoros: number
  todayFocusTime: number
  completedTasks: number
}) {
  const stats = [
    { label: STATISTICS.todayPomodoros, value: todayPomodoros },
    { label: STATISTICS.todayFocusTime, value: Math.round(todayFocusTime) },
    { label: STATISTICS.completedTasks, value: completedTasks },
  ]

  return (
    <section className="py-4">
      <SectionLabel icon={<BarChartIcon width={14} height={14} strokeWidth={2} />}>
        {STATISTICS.sectionTitle}
      </SectionLabel>
      <div className="grid grid-cols-3 gap-2">
        {stats.map((stat) => (
          <Card key={stat.label} shadow="sm" className="border border-divider/60">
            <CardBody className="text-center py-3 px-1 gap-0.5">
              <div className="text-xl font-bold tabular-nums">{stat.value}</div>
              <div className="text-[10px] leading-tight text-default-400">
                {stat.label}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </section>
  )
}
