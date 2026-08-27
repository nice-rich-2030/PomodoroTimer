import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Button, Checkbox } from '@heroui/react'
import type { Task } from '../types'

export default function TaskItem({
  task,
  onToggleCompleted,
  onDelete,
}: {
  task: Task
  onToggleCompleted: (id: string) => void
  onDelete: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 py-2 border-b border-divider last:border-none"
    >
      <span
        {...attributes}
        {...listeners}
        className="cursor-grab text-default-400 px-1"
        aria-label="ドラッグして並べ替え"
      >
        ⠿
      </span>
      <Checkbox
        isSelected={task.completed}
        onValueChange={() => onToggleCompleted(task.id)}
      />
      <span className={`flex-1 ${task.completed ? 'line-through text-default-400' : ''}`}>
        {task.text}（予定{task.plannedPomodoros}ポモドーロ）
      </span>
      <Button
        size="sm"
        variant="light"
        color="danger"
        onPress={() => onDelete(task.id)}
      >
        削除
      </Button>
    </li>
  )
}
