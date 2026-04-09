"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Trash2, Edit, Pin, ChevronDown, ChevronRight, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Task, TaskStatus } from "@/lib/types"
import { projects } from "@/lib/data"

interface ListViewProps {
  tasks: Task[]
  onTaskStatusChange: (taskId: string, status: TaskStatus) => void
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void
  onTaskDelete: (taskId: string) => void
}

export function ListView({ tasks, onTaskStatusChange, onTaskUpdate, onTaskDelete }: ListViewProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [showSubtasks, setShowSubtasks] = useState(false)
  const [newSubtask, setNewSubtask] = useState("")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case "backlog":
        return "bg-muted text-muted-foreground"
      case "doing":
        return "bg-primary/10 text-primary"
      case "review":
        return "bg-warning/10 text-warning-foreground"
      case "blocked":
        return "bg-destructive/10 text-destructive"
      case "done":
        return "bg-success/10 text-success"
    }
  }

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

  const getProject = (projectId: string) => projects.find((p) => p.id === projectId)

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
    onTaskUpdate(selectedTask.id, { subtasks: [...(selectedTask.subtasks || []), subtask] })
    setSelectedTask({ ...selectedTask, subtasks: [...(selectedTask.subtasks || []), subtask] })
    setNewSubtask("")
  }

  const sortedTasks = [...tasks].sort((a, b) => {
    const aDate = new Date(a.dueDate).getTime()
    const bDate = new Date(b.dueDate).getTime()
    return sortDirection === "asc" ? aDate - bDate : bDate - aDate
  })

  return (
    <>
      <ScrollArea className="h-full">
        <div className="flex items-center justify-end mb-2">
          <button
            className="text-xs text-muted-foreground hover:text-card-foreground underline-offset-2 hover:underline"
            onClick={() =>
              setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
            }
          >
            Sort by due date ({sortDirection === "asc" ? "oldest first" : "newest first"})
          </button>
        </div>
        <div className="border border-border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/30 hover:bg-secondary/30">
                <TableHead className="w-12"></TableHead>
                <TableHead>Task</TableHead>
                <TableHead className="w-32">Project</TableHead>
                <TableHead className="w-24">Status</TableHead>
                <TableHead className="w-24">Priority</TableHead>
                <TableHead className="w-32">Due Date</TableHead>
                <TableHead className="w-32">Assignee</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedTasks.map((task) => {
                const project = getProject(task.projectId)
                return (
                  <TableRow
                    key={task.id}
                    className={cn(
                      "hover:bg-secondary/30 cursor-pointer",
                      task.status === "done" && "opacity-60"
                    )}
                    onClick={() => setSelectedTask(task)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={task.status === "done"}
                        onCheckedChange={(checked) =>
                          onTaskStatusChange(task.id, checked ? "done" : "backlog")
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <p
                          className={cn(
                            "font-medium text-card-foreground",
                            task.status === "done" && "line-through"
                          )}
                        >
                          {task.title}
                        </p>
                        {task.description && (
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {task.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Pin className="h-3 w-3 text-muted-foreground" />
                        <div
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: project?.color || "#888" }}
                        />
                        <span className="text-sm text-muted-foreground truncate">
                          {project?.name || "Unknown"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={cn("capitalize", getStatusColor(task.status))}>
                        {task.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn("capitalize", getPriorityColor(task.priority))}
                      >
                        {task.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground" suppressHydrationWarning>
                        {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      {task.assignee ? (
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={task.assignee.avatar} alt={task.assignee.name} />
                            <AvatarFallback className="bg-primary/20 text-primary text-[10px]">
                              {task.assignee.name.split(" ").map((n) => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-muted-foreground truncate">
                            {task.assignee.name.split(" ")[0]}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-popover border-border">
                          <DropdownMenuItem className="cursor-pointer" onClick={() => setSelectedTask(task)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer text-destructive focus:text-destructive"
                            onClick={() => onTaskDelete(task.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </ScrollArea>

      {/* Task Detail Modal */}
      <Dialog open={!!selectedTask} onOpenChange={(open) => !open && setSelectedTask(null)}>
        <DialogContent className="max-w-lg bg-card border-border">
          {selectedTask && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: getProject(selectedTask.projectId)?.color || "#888" }}
                  />
                  <span className="text-sm text-muted-foreground">{getProject(selectedTask.projectId)?.name}</span>
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
                      onTaskUpdate(selectedTask.id, { description: e.target.value })
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
                        onTaskStatusChange(selectedTask.id, e.target.value as Task["status"])
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
                        onTaskUpdate(selectedTask.id, { priority: e.target.value as Task["priority"] })
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
                      onTaskUpdate(selectedTask.id, { dueDate: e.target.value })
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
                      const projectContributors = getProject(selectedTask.projectId)?.contributors || []
                      if (selectedId === "unassigned") {
                        onTaskUpdate(selectedTask.id, { assigneeId: undefined, assignee: undefined })
                        setSelectedTask({ ...selectedTask, assigneeId: undefined, assignee: undefined })
                        return
                      }
                      const selectedUser = projectContributors.find((u) => u.id === selectedId)
                      onTaskUpdate(selectedTask.id, { assigneeId: selectedId, assignee: selectedUser })
                      setSelectedTask({ ...selectedTask, assigneeId: selectedId, assignee: selectedUser })
                    }}
                    className="w-full h-9 px-3 rounded-md bg-secondary/50 border border-border text-sm text-card-foreground"
                  >
                    <option value="unassigned">Unassigned</option>
                    {(getProject(selectedTask.projectId)?.contributors || []).map((user) => (
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
                              onTaskUpdate(selectedTask.id, { subtasks: updated })
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
                      onTaskDelete(selectedTask.id)
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
