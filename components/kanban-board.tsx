"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, X } from "lucide-react"
import { TaskCard } from "@/components/task-card"
import { cn } from "@/lib/utils"
import type { Task, TaskStatus } from "@/lib/types"

interface KanbanBoardProps {
  tasks: Task[]
  onTaskStatusChange: (taskId: string, status: TaskStatus) => void
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void
  onTaskDelete: (taskId: string) => void
  onAddTask: (status: TaskStatus) => void
}

const columns: { id: TaskStatus; title: string; color: string }[] = [
  { id: "backlog", title: "Backlog", color: "#F87171" },
  { id: "doing", title: "Doing", color: "#4ADE80" },
  { id: "review", title: "Review", color: "#FACC15" },
  { id: "done", title: "Done", color: "#22C55E" },
]

export function KanbanBoard({
  tasks,
  onTaskStatusChange,
  onTaskUpdate,
  onTaskDelete,
  onAddTask,
}: KanbanBoardProps) {
  const [draggedTask, setDraggedTask] = useState<string | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null)

  const handleDragStart = (taskId: string) => {
    setDraggedTask(taskId)
  }

  const handleDragEnd = () => {
    setDraggedTask(null)
    setDragOverColumn(null)
  }

  const handleDragOver = (e: React.DragEvent, columnId: TaskStatus) => {
    e.preventDefault()
    setDragOverColumn(columnId)
  }

  const handleDrop = (columnId: TaskStatus) => {
    if (draggedTask) {
      onTaskStatusChange(draggedTask, columnId)
    }
    handleDragEnd()
  }

  return (
    <div className="h-full pb-4 space-y-4">
      <div className="flex gap-3 h-[70%] min-h-[360px]">
        {columns.map((column) => {
          const columnTasks = tasks.filter((t) => t.status === column.id)
          
          return (
            <div
              key={column.id}
              className={cn(
                "flex-1 min-w-[240px] max-w-[280px] flex flex-col rounded-lg border border-border bg-secondary/20",
                dragOverColumn === column.id && "border-primary ring-1 ring-primary"
              )}
              onDragOver={(e) => handleDragOver(e, column.id)}
              onDrop={() => handleDrop(column.id)}
              onDragLeave={() => setDragOverColumn(null)}
            >
              {/* Column Header */}
              <div
                className="px-3 py-2 rounded-t-lg"
                style={{ backgroundColor: column.color }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-white">{column.title}</span>
                  <span className="text-xs text-white/80 bg-white/20 px-2 py-0.5 rounded-full">
                    {columnTasks.length}
                  </span>
                </div>
              </div>

              {/* Column Content */}
              <ScrollArea className="flex-1 p-2">
                <div className="space-y-2">
                  {columnTasks.map((task) => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={() => handleDragStart(task.id)}
                      onDragEnd={handleDragEnd}
                      className="relative group"
                    >
                      <TaskCard
                        task={task}
                        isDragging={draggedTask === task.id}
                        onStatusChange={(status) => onTaskStatusChange(task.id, status)}
                        onUpdate={(updates) => onTaskUpdate(task.id, updates)}
                        onDelete={() => onTaskDelete(task.id)}
                      />
                      {/* Quick Delete Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onTaskDelete(task.id)
                        }}
                        className="absolute top-1 right-1 h-5 w-5 rounded bg-destructive/80 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Add Task Button */}
              <div className="p-2 border-t border-border">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-muted-foreground hover:text-card-foreground"
                  onClick={() => onAddTask(column.id)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add task
                </Button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Separate Blocked Section */}
      <div
        className={cn(
          "rounded-lg border border-border bg-secondary/20 h-[30%] min-h-[220px] flex flex-col",
          dragOverColumn === "blocked" && "border-primary ring-1 ring-primary"
        )}
        onDragOver={(e) => handleDragOver(e, "blocked")}
        onDrop={() => handleDrop("blocked")}
        onDragLeave={() => setDragOverColumn(null)}
      >
        <div className="px-3 py-2 rounded-t-lg bg-destructive">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-sm text-white">Blocked</span>
            <span className="text-xs text-white/80 bg-white/20 px-2 py-0.5 rounded-full">
              {tasks.filter((t) => t.status === "blocked").length}
            </span>
          </div>
        </div>

        <ScrollArea className="flex-1 p-2">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {tasks
              .filter((t) => t.status === "blocked")
              .map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={() => handleDragStart(task.id)}
                  onDragEnd={handleDragEnd}
                  className="relative group"
                >
                  <TaskCard
                    task={task}
                    isDragging={draggedTask === task.id}
                    onStatusChange={(status) => onTaskStatusChange(task.id, status)}
                    onUpdate={(updates) => onTaskUpdate(task.id, updates)}
                    onDelete={() => onTaskDelete(task.id)}
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onTaskDelete(task.id)
                    }}
                    className="absolute top-1 right-1 h-5 w-5 rounded bg-destructive/80 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
