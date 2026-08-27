import { Card, CardBody } from '@heroui/react'
import { STATISTICS } from '../constants/messages'

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
    <section className="py-6">
      <h2 className="text-xl font-semibold mb-3">
        {STATISTICS.sectionTitle}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardBody className="text-center py-6">
              <div className="text-3xl font-bold">{stat.value}</div>
              <div className="text-sm text-default-500">{stat.label}</div>
            </CardBody>
          </Card>
        ))}
      </div>
    </section>
  )
}
