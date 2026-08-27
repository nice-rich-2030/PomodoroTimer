import { useState } from 'react'
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { Button, Card, CardBody, Input } from '@heroui/react'
import { TASKS } from '../constants/messages'
import type { useTasks } from '../hooks/useTasks'
import TaskItem from './TaskItem'
import SectionLabel from './SectionLabel'
import { ChecklistIcon, EyeIcon, PlusIcon } from './icons'

export type TasksApi = ReturnType<typeof useTasks>

export default function TaskList({ tasksApi }: { tasksApi: TasksApi }) {
  const { tasks, addTask, toggleCompleted, deleteTask, reorderTasks } = tasksApi
  const [text, setText] = useState('')
  const [plannedPomodoros, setPlannedPomodoros] = useState('1')
  const [hideCompleted, setHideCompleted] = useState(false)

  const sensors = useSensors(useSensor(PointerSensor))

  const visibleTasks = hideCompleted ? tasks.filter((task) => !task.completed) : tasks
  const completedCount = tasks.filter((task) => task.completed).length

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) return
    addTask(trimmed, parseInt(plannedPomodoros, 10) || 1)
    setText('')
    setPlannedPomodoros('1')
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (over && active.id !== over.id) {
      reorderTasks(String(active.id), String(over.id))
    }
  }

  return (
    <section className="py-4">
      <SectionLabel icon={<ChecklistIcon width={14} height={14} strokeWidth={2} />}>
        {TASKS.sectionTitle}
      </SectionLabel>

      <form onSubmit={handleSubmit} className="flex flex-col gap-2 mb-3">
        <Input
          size="sm"
          placeholder="新しいタスクを入力..."
          value={text}
          onValueChange={setText}
        />
        <div className="flex gap-2">
          <Input
            size="sm"
            type="number"
            className="w-20"
            value={plannedPomodoros}
            onValueChange={setPlannedPomodoros}
            aria-label="予定ポモドーロ数"
          />
          <Button
            size="sm"
            color="primary"
            type="submit"
            className="flex-1"
            startContent={<PlusIcon width={16} height={16} strokeWidth={2.2} />}
          >
            {TASKS.addButton}
          </Button>
        </div>
      </form>

      {visibleTasks.length === 0 ? (
        <Card shadow="sm" className="border border-divider/60">
          <CardBody className="text-default-400 text-center text-sm py-6">
            {TASKS.emptyState}
          </CardBody>
        </Card>
      ) : (
        <Card shadow="sm" className="border border-divider/60">
          <CardBody className="py-1 px-2">
            <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
              <SortableContext
                items={visibleTasks.map((task) => task.id)}
                strategy={verticalListSortingStrategy}
              >
                <ul>
                  {visibleTasks.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onToggleCompleted={toggleCompleted}
                      onDelete={deleteTask}
                    />
                  ))}
                </ul>
              </SortableContext>
            </DndContext>
          </CardBody>
        </Card>
      )}
      <div className="mt-2 flex items-center justify-between">
        <Button
          variant="light"
          size="sm"
          startContent={<EyeIcon width={15} height={15} strokeWidth={1.9} />}
          onPress={() => setHideCompleted((value) => !value)}
        >
          {TASKS.toggleCompleted}
        </Button>
        <span className="text-xs text-default-400">
          {tasks.length}件中 {completedCount}件完了
        </span>
      </div>
    </section>
  )
}
