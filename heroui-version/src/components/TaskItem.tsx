import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Button, Checkbox } from '@heroui/react'
import { GripIcon, TargetIcon, TrashIcon } from './icons'
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
      className="flex items-center gap-1.5 py-2 border-b border-divider last:border-none"
    >
      <span
        {...attributes}
        {...listeners}
        className="cursor-grab text-default-300 shrink-0"
        aria-label="ドラッグして並べ替え"
      >
        <GripIcon width={16} height={16} />
      </span>
      <Checkbox
        size="sm"
        isSelected={task.completed}
        onValueChange={() => onToggleCompleted(task.id)}
      />
      <span
        className={`flex-1 text-sm min-w-0 truncate ${
          task.completed ? 'line-through text-default-400' : ''
        }`}
      >
        {task.text}
        <span className="inline-flex items-center gap-0.5 text-default-400 ml-1.5">
          <TargetIcon width={11} height={11} strokeWidth={1.9} />
          {task.plannedPomodoros}
        </span>
      </span>
      <Button
        isIconOnly
        size="sm"
        variant="light"
        color="danger"
        aria-label="削除"
        onPress={() => onDelete(task.id)}
      >
        <TrashIcon width={16} height={16} />
      </Button>
    </li>
  )
}
