"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, Clock, GripVertical, Pin, Plus, Trash2, ChevronDown, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Task } from "@/lib/types"
import { projects } from "@/lib/data"

interface TaskCardProps {
  task: Task
  onStatusChange?: (status: Task["status"]) => void
  onUpdate?: (updates: Partial<Task>) => void
  onDelete?: () => void
  isDragging?: boolean
}

export function TaskCard({ task, onStatusChange, onUpdate, onDelete, isDragging }: TaskCardProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showSubtasks, setShowSubtasks] = useState(false)
  const [newSubtask, setNewSubtask] = useState("")

  const project = projects.find((p) => p.id === task.projectId)

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-destructive/10 text-destructive border-destructive/20"
      case "high":
        return "bg-warning/10 text-warning border-warning/30"
      case "medium":
        return "bg-primary/10 text-primary border-primary/20"
      default:
        return "bg-muted text-muted-foreground border-muted"
    }
  }

  const addSubtask = () => {
    if (!newSubtask.trim()) return
    const subtask: Task = {
      id: `${task.id}-sub-${Date.now()}`,
      title: newSubtask,
      description: "",
      status: "backlog",
      priority: "medium",
      projectId: task.projectId,
      dueDate: task.dueDate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    onUpdate?.({ subtasks: [...(task.subtasks || []), subtask] })
    setNewSubtask("")
  }

  return (
    <>
      <Card
        className={cn(
          "border-border bg-card hover:border-primary/30 transition-all cursor-pointer group",
          isDragging && "opacity-50 rotate-2"
        )}
        onClick={() => setIsOpen(true)}
      >
        <CardContent className="p-3">
          <div className="flex items-start gap-2">
            <GripVertical className="h-4 w-4 text-muted-foreground mt-1 opacity-0 group-hover:opacity-100 cursor-grab" />
            <div className="flex-1 min-w-0">
              {/* Project Pin */}
              <div className="flex items-center gap-1.5 mb-2">
                <Pin className="h-3 w-3 text-muted-foreground" />
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: project?.color || "#888" }}
                />
                <span className="text-xs text-muted-foreground truncate">
                  {project?.name || "Unknown"}
                </span>
              </div>

              {/* Title */}
              <p className="font-medium text-card-foreground text-sm line-clamp-2">
                {task.title}
              </p>

              {/* Description */}
              {task.description && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {task.description}
                </p>
              )}

              {/* Subtasks indicator */}
              {task.subtasks && task.subtasks.length > 0 && (
                <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                  <ChevronRight className="h-3 w-3" />
                  <span>
                    {task.subtasks.filter((s) => s.status === "done").length}/{task.subtasks.length} subtasks
                  </span>
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={cn("capitalize text-[10px] px-1.5 py-0", getPriorityColor(task.priority))}
                  >
                    {task.priority}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                  </div>
                </div>
                {task.assignee && (
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={task.assignee.avatar} alt={task.assignee.name} />
                    <AvatarFallback className="bg-primary/20 text-primary text-[10px]">
                      {task.assignee.name.split(" ").map((n) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>

              {/* Blocked indicator */}
              {(task.blockedBy || task.waitingOn) && (
                <div className="mt-2 p-2 rounded bg-destructive/10 border border-destructive/20">
                  <p className="text-xs text-destructive">
                    Waiting on: {task.waitingOn || "Dependency"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Task Detail Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-lg bg-card border-border">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: project?.color || "#888" }}
              />
              <span className="text-sm text-muted-foreground">{project?.name}</span>
            </div>
            <DialogTitle className="text-xl text-card-foreground">{task.title}</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Edit task details, manage subtasks, and update status
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Description */}
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Description</p>
              <Textarea
                value={task.description}
                onChange={(e) => onUpdate?.({ description: e.target.value })}
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
                  value={task.status}
                  onChange={(e) => onStatusChange?.(e.target.value as Task["status"])}
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
                  value={task.priority}
                  onChange={(e) => onUpdate?.({ priority: e.target.value as Task["priority"] })}
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
                value={task.dueDate}
                onChange={(e) => onUpdate?.({ dueDate: e.target.value })}
                className="bg-secondary/50 border-border"
              />
            </div>

            {/* Assignee */}
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Assignee</p>
              <select
                value={task.assigneeId || "unassigned"}
                onChange={(e) => {
                  const selectedId = e.target.value
                  if (!project || selectedId === "unassigned") {
                    onUpdate?.({ assigneeId: undefined, assignee: undefined })
                    return
                  }
                  const selectedUser = project.contributors.find((u) => u.id === selectedId)
                  onUpdate?.({ assigneeId: selectedId, assignee: selectedUser })
                }}
                className="w-full h-9 px-3 rounded-md bg-secondary/50 border border-border text-sm text-card-foreground"
              >
                <option value="unassigned">Unassigned</option>
                {(project?.contributors || []).map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Subtasks (Mini-Board) */}
            <div>
              <button
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2 hover:text-card-foreground"
                onClick={() => setShowSubtasks(!showSubtasks)}
              >
                {showSubtasks ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                Subtasks ({task.subtasks?.length || 0})
              </button>
              
              {showSubtasks && (
                <div className="space-y-2 pl-4 border-l-2 border-border">
                  {task.subtasks?.map((subtask) => (
                    <div key={subtask.id} className="flex items-center gap-2 p-2 rounded bg-secondary/30">
                      <Checkbox
                        checked={subtask.status === "done"}
                        onCheckedChange={(checked) => {
                          const updated = task.subtasks?.map((s) =>
                            s.id === subtask.id
                              ? { ...s, status: checked ? "done" as const : "backlog" as const }
                              : s
                          )
                          onUpdate?.({ subtasks: updated })
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
              <Button variant="destructive" size="sm" onClick={() => { onDelete?.(); setIsOpen(false); }}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
              <Button onClick={() => setIsOpen(false)}>
                Save & Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
