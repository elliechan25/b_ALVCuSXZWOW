"use client"

import { useMemo, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Trash2, ChevronDown, ChevronRight, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Task } from "@/lib/types"
import { projects } from "@/lib/data"

interface GanttChartProps {
  tasks: Task[]
  onTaskStatusChange?: (taskId: string, status: Task["status"]) => void
  onTaskUpdate?: (taskId: string, updates: Partial<Task>) => void
  onTaskDelete?: (taskId: string) => void
}

export function GanttChart({ tasks, onTaskStatusChange, onTaskUpdate, onTaskDelete }: GanttChartProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [showSubtasks, setShowSubtasks] = useState(false)
  const [newSubtask, setNewSubtask] = useState("")

  const { weeks, startDate, endDate } = useMemo(() => {
    // Find date range from tasks
    const dates = tasks.flatMap((t) => [new Date(t.dueDate), new Date(t.createdAt)])
    const minDate = new Date(Math.min(...dates.map((d) => d.getTime())))
    const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())))
    
    // Extend range by 2 weeks on each side
    minDate.setDate(minDate.getDate() - 14)
    maxDate.setDate(maxDate.getDate() + 14)
    
    // Generate weeks
    const weeks: { label: string; start: Date; end: Date }[] = []
    const current = new Date(minDate)
    current.setDate(current.getDate() - current.getDay()) // Start from Sunday
    
    while (current < maxDate) {
      const weekStart = new Date(current)
      const weekEnd = new Date(current)
      weekEnd.setDate(weekEnd.getDate() + 6)
      
      weeks.push({
        label: `W${Math.ceil(current.getDate() / 7)}`,
        start: weekStart,
        end: weekEnd,
      })
      
      current.setDate(current.getDate() + 7)
    }
    
    return { weeks, startDate: minDate, endDate: maxDate }
  }, [tasks])

  // Group tasks by project
  const tasksByProject = useMemo(() => {
    const grouped: Record<string, Task[]> = {}
    tasks.forEach((task) => {
      if (!grouped[task.projectId]) {
        grouped[task.projectId] = []
      }
      grouped[task.projectId].push(task)
    })
    return grouped
  }, [tasks])

  const getTaskPosition = (task: Task) => {
    const taskStart = new Date(task.createdAt)
    const taskEnd = new Date(task.dueDate)
    const totalDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    
    const startOffset = (taskStart.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    const duration = (taskEnd.getTime() - taskStart.getTime()) / (1000 * 60 * 60 * 24)
    
    return {
      left: `${(startOffset / totalDays) * 100}%`,
      width: `${Math.max((duration / totalDays) * 100, 2)}%`,
    }
  }

  // Get months for header
  const months = useMemo(() => {
    const monthMap: Record<string, { label: string; weeks: number }> = {}
    weeks.forEach((week) => {
      const monthLabel = week.start.toLocaleDateString("en-US", { month: "short" })
      if (!monthMap[monthLabel]) {
        monthMap[monthLabel] = { label: monthLabel, weeks: 0 }
      }
      monthMap[monthLabel].weeks++
    })
    return Object.values(monthMap)
  }, [weeks])

  const getProject = (projectId: string) => projects.find((p) => p.id === projectId)

  const addSubtask = () => {
    if (!newSubtask.trim() || !selectedTask || !onTaskUpdate) return
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

  return (
    <>
      <div className="border border-border rounded-lg overflow-hidden bg-[#0D1B2A] h-full flex flex-col">
        <ScrollArea className="flex-1">
          <div className="min-w-[1200px]">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-[#0D1B2A] border-b border-border">
              {/* Month Row */}
              <div className="flex">
                <div className="w-48 flex-shrink-0 px-4 py-2 border-r border-border">
                  <span className="text-sm font-semibold text-foreground">PROJECT MANAGEMENT</span>
                </div>
                <div className="flex-1 flex">
                  {months.map((month, i) => (
                    <div
                      key={i}
                      className="border-r border-border text-center py-2"
                      style={{ width: `${(month.weeks / weeks.length) * 100}%` }}
                    >
                      <span className="text-sm font-medium text-foreground">{month.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Week Row */}
              <div className="flex">
                <div className="w-48 flex-shrink-0 border-r border-border" />
                <div className="flex-1 flex">
                  {weeks.map((week, i) => (
                    <div
                      key={i}
                      className="flex-1 text-center py-1 border-r border-border"
                    >
                      <span className="text-xs text-muted-foreground">{week.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Content */}
            <div>
              {Object.entries(tasksByProject).map(([projectId, projectTasks]) => {
                const project = projects.find((p) => p.id === projectId)
                if (!project) return null

                return (
                  <div key={projectId}>
                    {/* Project Header */}
                    <div className="flex border-b border-border bg-[#1B2838]">
                      <div className="w-48 flex-shrink-0 px-4 py-3 border-r border-border">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: project.color }}
                          />
                          <span className="font-semibold text-foreground">{project.name}</span>
                        </div>
                      </div>
                      <div className="flex-1 relative py-3 px-2">
                        {/* Assignee indicator */}
                        {project.contributors[0] && (
                          <div className="flex items-center gap-2">
                            <Avatar className="h-5 w-5">
                              <AvatarImage src={project.contributors[0].avatar} />
                              <AvatarFallback className="text-[8px]">
                                {project.contributors[0].name.split(" ").map((n) => n[0]).join("")}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-muted-foreground">
                              {project.contributors[0].name}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Tasks */}
                    {projectTasks.map((task) => {
                      const position = getTaskPosition(task)
                      
                      return (
                        <div
                          key={task.id}
                          className="flex border-b border-border hover:bg-[#1B2838]/50 cursor-pointer"
                          onClick={() => setSelectedTask(task)}
                        >
                          <div className="w-48 flex-shrink-0 px-4 py-2 border-r border-border">
                            <span className="text-sm text-muted-foreground pl-4">{task.title}</span>
                          </div>
                          <div className="flex-1 relative py-2">
                            {/* Grid lines */}
                            <div className="absolute inset-0 flex">
                              {weeks.map((_, i) => (
                                <div key={i} className="flex-1 border-r border-border/30" />
                              ))}
                            </div>
                            {/* Task Bar */}
                            <div
                              className={cn(
                                "absolute top-1/2 -translate-y-1/2 h-6 rounded-full gantt-bar flex items-center justify-end pr-2",
                                task.status === "done" && "bg-success",
                                task.status === "review" && "bg-warning",
                                task.status === "blocked" && "bg-destructive",
                                task.status === "doing" && "opacity-90",
                                task.status === "backlog" && "opacity-60"
                              )}
                              style={{
                                left: position.left,
                                width: position.width,
                                backgroundColor: task.status === "done" 
                                  ? "var(--success)" 
                                  : task.status === "review"
                                  ? "var(--warning)"
                                  : task.status === "blocked"
                                  ? "var(--destructive)"
                                  : project.color,
                                minWidth: "40px",
                              }}
                            >
                              {task.assignee && (
                                <Avatar className="h-4 w-4 border border-white/20">
                                  <AvatarImage src={task.assignee.avatar} />
                                  <AvatarFallback className="text-[6px] bg-white/20">
                                    {task.assignee.name.split(" ").map((n) => n[0]).join("")}
                                  </AvatarFallback>
                                </Avatar>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

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
                      onTaskUpdate?.(selectedTask.id, { description: e.target.value })
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
                        onTaskStatusChange?.(selectedTask.id, e.target.value as Task["status"])
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
                        onTaskUpdate?.(selectedTask.id, { priority: e.target.value as Task["priority"] })
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
                      onTaskUpdate?.(selectedTask.id, { dueDate: e.target.value })
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
                      const contributors = getProject(selectedTask.projectId)?.contributors || []
                      if (selectedId === "unassigned") {
                        onTaskUpdate?.(selectedTask.id, { assigneeId: undefined, assignee: undefined })
                        setSelectedTask({ ...selectedTask, assigneeId: undefined, assignee: undefined })
                        return
                      }
                      const selectedUser = contributors.find((u) => u.id === selectedId)
                      onTaskUpdate?.(selectedTask.id, { assigneeId: selectedId, assignee: selectedUser })
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
                              onTaskUpdate?.(selectedTask.id, { subtasks: updated })
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
                      onTaskDelete?.(selectedTask.id)
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
