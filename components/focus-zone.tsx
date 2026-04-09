"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Clock, Pencil, Trash2, ChevronDown, ChevronRight, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Task } from "@/lib/types"
import { projects } from "@/lib/data"
import { useAppStore } from "@/lib/store"

interface FocusZoneProps {
  tasks: Task[]
  onEditTasks?: () => void
}

export function FocusZone({ tasks, onEditTasks }: FocusZoneProps) {
  const { updateTaskStatus, updateTask, deleteTask } = useAppStore()
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [showSubtasks, setShowSubtasks] = useState(false)
  const [newSubtask, setNewSubtask] = useState("")

  const getProjectColor = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId)
    return project?.color || "#888"
  }

  const getProjectName = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId)
    return project?.name || "Unknown"
  }

  const handleComplete = (taskId: string, checked: boolean) => {
    if (checked) {
      updateTaskStatus(taskId, "done")
    }
  }

  const addSubtask = () => {
    if (!newSubtask.trim() || !selectedTask) return
    const subtask: Task = {
      id: `${selectedTask.id}-sub-${Date.now()}`,
      title: newSubtask,
      description: "",
      status: "backlog",
      priority: "medium",
      projectId: selectedTask.projectId,
      dueDate: selectedTask.dueDate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    updateTask(selectedTask.id, { subtasks: [...(selectedTask.subtasks || []), subtask] })
    setSelectedTask({ ...selectedTask, subtasks: [...(selectedTask.subtasks || []), subtask] })
    setNewSubtask("")
  }

  if (tasks.length === 0) {
    return (
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg text-card-foreground">
            Focus Zone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            No tasks planned for today. Enjoy your free time!
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg text-card-foreground">
              Focus Zone
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-primary/10 text-primary border-0">
                {tasks.length} tasks today
              </Badge>
              {onEditTasks && (
                <Button variant="ghost" size="sm" onClick={onEditTasks} className="h-8 px-2">
                  <Pencil className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Your top priorities for today. Stay focused!
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {tasks.map((task, index) => (
            <div
              key={task.id}
              className={cn(
                "flex items-start gap-3 p-4 rounded-lg bg-secondary/50 border border-border transition-all hover:border-primary/30 cursor-pointer",
                task.status === "done" && "opacity-50"
              )}
              onClick={() => setSelectedTask(task)}
            >
              <Checkbox
                checked={task.status === "done"}
                onCheckedChange={(checked) => {
                  handleComplete(task.id, checked as boolean)
                }}
                onClick={(e) => e.stopPropagation()}
                className="mt-1 border-muted-foreground data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">#{index + 1}</span>
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: getProjectColor(task.projectId) }}
                  />
                  <span className="text-xs text-muted-foreground">
                    {getProjectName(task.projectId)}
                  </span>
                </div>
                <p
                  className={cn(
                    "font-medium text-card-foreground mt-1",
                    task.status === "done" && "line-through"
                  )}
                >
                  {task.title}
                </p>
                <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">
                  {task.description}
                </p>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span suppressHydrationWarning>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                  </div>
                  {task.estimatedHours && (
                    <span className="text-xs text-muted-foreground">
                      Est: {task.estimatedHours}h
                    </span>
                  )}
                </div>
              </div>
              <Badge
                variant="outline"
                className={cn(
                  "capitalize text-xs flex-shrink-0",
                  task.priority === "urgent" && "bg-destructive/10 text-destructive border-destructive/20",
                  task.priority === "high" && "bg-warning/10 text-warning border-warning/30",
                  task.priority === "medium" && "bg-primary/10 text-primary border-primary/20",
                  task.priority === "low" && "bg-muted text-muted-foreground border-muted"
                )}
              >
                {task.priority}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Task Detail Modal */}
      <Dialog open={!!selectedTask} onOpenChange={(open) => !open && setSelectedTask(null)}>
        <DialogContent className="max-w-lg bg-card border-border">
          {selectedTask && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: getProjectColor(selectedTask.projectId) }}
                  />
                  <span className="text-sm text-muted-foreground">{getProjectName(selectedTask.projectId)}</span>
                </div>
                <DialogTitle className="text-xl text-card-foreground">{selectedTask.title}</DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Edit task details, manage subtasks, and update status
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                {/* Description */}
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Description</p>
                  <Textarea
                    value={selectedTask.description}
                    onChange={(e) => {
                      updateTask(selectedTask.id, { description: e.target.value })
                      setSelectedTask({ ...selectedTask, description: e.target.value })
                    }}
                    placeholder="Add a description..."
                    className="bg-secondary/50 border-border resize-none"
                    rows={3}
                  />
                </div>

                {/* Status and Priority */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Status</p>
                    <select
                      value={selectedTask.status}
                      onChange={(e) => {
                        updateTaskStatus(selectedTask.id, e.target.value as Task["status"])
                        setSelectedTask({ ...selectedTask, status: e.target.value as Task["status"] })
                      }}
                      className="w-full h-9 px-3 rounded-md bg-secondary/50 border border-border text-sm text-card-foreground"
                    >
                      <option value="backlog">Backlog</option>
                      <option value="doing">Doing</option>
                      <option value="review">Review</option>
                      <option value="blocked">Blocked</option>
                      <option value="done">Done</option>
                    </select>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Priority</p>
                    <select
                      value={selectedTask.priority}
                      onChange={(e) => {
                        updateTask(selectedTask.id, { priority: e.target.value as Task["priority"] })
                        setSelectedTask({ ...selectedTask, priority: e.target.value as Task["priority"] })
                      }}
                      className="w-full h-9 px-3 rounded-md bg-secondary/50 border border-border text-sm text-card-foreground"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                {/* Due Date */}
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Due Date</p>
                  <Input
                    type="date"
                    value={selectedTask.dueDate}
                    onChange={(e) => {
                      updateTask(selectedTask.id, { dueDate: e.target.value })
                      setSelectedTask({ ...selectedTask, dueDate: e.target.value })
                    }}
                    className="bg-secondary/50 border-border"
                  />
                </div>

                {/* Assignee */}
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Assignee</p>
                  <select
                    value={selectedTask.assigneeId || "unassigned"}
                    onChange={(e) => {
                      const selectedId = e.target.value
                      const contributors = projects.find((p) => p.id === selectedTask.projectId)?.contributors || []
                      if (selectedId === "unassigned") {
                        updateTask(selectedTask.id, { assigneeId: undefined, assignee: undefined })
                        setSelectedTask({ ...selectedTask, assigneeId: undefined, assignee: undefined })
                        return
                      }
                      const selectedUser = contributors.find((u) => u.id === selectedId)
                      updateTask(selectedTask.id, { assigneeId: selectedId, assignee: selectedUser })
                      setSelectedTask({ ...selectedTask, assigneeId: selectedId, assignee: selectedUser })
                    }}
                    className="w-full h-9 px-3 rounded-md bg-secondary/50 border border-border text-sm text-card-foreground"
                  >
                    <option value="unassigned">Unassigned</option>
                    {(projects.find((p) => p.id === selectedTask.projectId)?.contributors || []).map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subtasks */}
                <div>
                  <button
                    className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2 hover:text-card-foreground"
                    onClick={() => setShowSubtasks(!showSubtasks)}
                  >
                    {showSubtasks ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    Subtasks ({selectedTask.subtasks?.length || 0})
                  </button>
                  
                  {showSubtasks && (
                    <div className="space-y-2 pl-4 border-l-2 border-border">
                      {selectedTask.subtasks?.map((subtask) => (
                        <div key={subtask.id} className="flex items-center gap-2 p-2 rounded bg-secondary/30">
                          <Checkbox
                            checked={subtask.status === "done"}
                            onCheckedChange={(checked) => {
                              const updated = selectedTask.subtasks?.map((s) =>
                                s.id === subtask.id
                                  ? { ...s, status: checked ? "done" as const : "backlog" as const }
                                  : s
                              )
                              updateTask(selectedTask.id, { subtasks: updated })
                              setSelectedTask({ ...selectedTask, subtasks: updated })
                            }}
                          />
                          <span className={cn(
                            "text-sm flex-1",
                            subtask.status === "done" && "line-through text-muted-foreground"
                          )}>
                            {subtask.title}
                          </span>
                        </div>
                      ))}
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder="Add subtask..."
                          value={newSubtask}
                          onChange={(e) => setNewSubtask(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && addSubtask()}
                          className="bg-secondary/50 border-border text-sm h-8"
                        />
                        <Button size="sm" variant="ghost" onClick={addSubtask}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex justify-between pt-4 border-t border-border">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      deleteTask(selectedTask.id)
                      setSelectedTask(null)
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                  <Button onClick={() => setSelectedTask(null)}>
                    Save & Close
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
