import { useLocalStorage } from './useLocalStorage'
import type { Task } from '../types'

export function useTasks() {
  const [tasks, setTasks] = useLocalStorage<Task[]>('tasks', [])

  function addTask(text: string, plannedPomodoros: number) {
    const newTask: Task = {
      id: Date.now().toString(),
      text,
      completed: false,
      plannedPomodoros,
      completedPomodoros: 0,
      createdAt: Date.now(),
      order: tasks.length,
    }
    setTasks([...tasks, newTask])
  }

  function toggleCompleted(id: string) {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task,
      ),
    )
  }

  function deleteTask(id: string) {
    setTasks(tasks.filter((task) => task.id !== id))
  }

  function reorderTasks(activeId: string, overId: string) {
    if (activeId === overId) return
    const sorted = [...tasks].sort((a, b) => a.order - b.order)
    const activeIndex = sorted.findIndex((task) => task.id === activeId)
    const overIndex = sorted.findIndex((task) => task.id === overId)
    if (activeIndex === -1 || overIndex === -1) return

    const [moved] = sorted.splice(activeIndex, 1)
    sorted.splice(overIndex, 0, moved)
    setTasks(sorted.map((task, index) => ({ ...task, order: index })))
  }

  const sortedTasks = [...tasks].sort((a, b) => a.order - b.order)

  return { tasks: sortedTasks, addTask, toggleCompleted, deleteTask, reorderTasks }
}
