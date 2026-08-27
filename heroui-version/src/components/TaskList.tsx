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
    <section className="py-6">
      <h2 className="text-xl font-semibold mb-3">{TASKS.sectionTitle}</h2>
      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <Input
          placeholder="新しいタスクを入力..."
          className="flex-1"
          value={text}
          onValueChange={setText}
        />
        <Input
          type="number"
          className="w-24"
          value={plannedPomodoros}
          onValueChange={setPlannedPomodoros}
        />
        <Button color="primary" type="submit">
          {TASKS.addButton}
        </Button>
      </form>
      {visibleTasks.length === 0 ? (
        <Card>
          <CardBody className="text-default-500 text-center py-8">
            {TASKS.emptyState}
          </CardBody>
        </Card>
      ) : (
        <Card>
          <CardBody className="py-2">
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
      <div className="mt-3 flex items-center gap-3">
        <Button
          variant="light"
          size="sm"
          onPress={() => setHideCompleted((value) => !value)}
        >
          {TASKS.toggleCompleted}
        </Button>
        <span className="text-sm text-default-500">
          全タスク: {tasks.length} / 完了: {completedCount}
        </span>
      </div>
    </section>
  )
}
