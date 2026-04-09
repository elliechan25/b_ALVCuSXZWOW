"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeftRight, Check, GripVertical, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Task } from "@/lib/types"
import { tasks as allTasks, projects } from "@/lib/data"

interface PlanningModalProps {
  open: boolean
  onComplete: (selectedTasks: Task[]) => void
  suggestedTasks: Task[]
  userName: string
  onClose: () => void
}

export function PlanningModal({ open, onComplete, suggestedTasks, userName, onClose }: PlanningModalProps) {
  const [selectedTasks, setSelectedTasks] = useState<Task[]>(suggestedTasks)
  const [showBacklog, setShowBacklog] = useState(false)
  const [swapIndex, setSwapIndex] = useState<number | null>(null)

  const backlogTasks = allTasks.filter(
    (t) => t.status !== "done" && !selectedTasks.find((st) => st.id === t.id)
  )

  const handleSwap = (backlogTask: Task) => {
    if (swapIndex !== null) {
      const newSelected = [...selectedTasks]
      newSelected[swapIndex] = backlogTask
      setSelectedTasks(newSelected)
      setSwapIndex(null)
      setShowBacklog(false)
    }
  }

  const handleStartDay = () => {
    onComplete(selectedTasks)
  }

  const getProjectColor = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId)
    return project?.color || "#888"
  }

  const getProjectName = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId)
    return project?.name || "Unknown"
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

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          onClose()
        }
      }}
    >
      <DialogContent className="max-w-xl max-h-[80vh] bg-card border-border flex flex-col overflow-hidden">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary">
            <Sparkles className="h-5 w-5" />
            <span className="text-sm font-medium">Daily Planning</span>
          </div>
          <DialogTitle className="text-2xl text-card-foreground">
            Good morning, {userName.split(" ")[0]}.
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Based on your deadlines and priorities, I suggest these 3 tasks for today.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto -mx-6 px-6">
          <div className="space-y-3 py-2">
            {selectedTasks.map((task, index) => (
              <Card
                key={task.id}
                className={cn(
                  "border-border bg-secondary/50 transition-all",
                  swapIndex === index && "ring-2 ring-primary"
                )}
              >
                <CardContent className="flex items-center gap-3 p-4">
                  <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                  <div
                    className="h-3 w-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: getProjectColor(task.projectId) }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-card-foreground truncate">{task.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {getProjectName(task.projectId)}
                      </span>
                      <span className="text-xs text-muted-foreground" suppressHydrationWarning>
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn("capitalize text-xs", getPriorityColor(task.priority))}
                  >
                    {task.priority}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSwapIndex(index)
                      setShowBacklog(true)
                    }}
                    className="text-muted-foreground hover:text-card-foreground"
                  >
                    <ArrowLeftRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {showBacklog && (
            <div className="mt-4">
              <p className="text-sm font-medium text-card-foreground mb-2">
                Select a task from your backlog:
              </p>
              <div className="max-h-40 overflow-y-auto rounded-lg border border-border bg-secondary/30">
                <div className="p-2 space-y-2">
                  {backlogTasks.map((task) => (
                    <button
                      key={task.id}
                      onClick={() => handleSwap(task)}
                      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors text-left"
                    >
                      <div
                        className="h-3 w-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: getProjectColor(task.projectId) }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-card-foreground truncate">
                          {task.title}
                        </p>
                        <span className="text-xs text-muted-foreground">
                          {getProjectName(task.projectId)}
                        </span>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn("capitalize text-xs", getPriorityColor(task.priority))}
                      >
                        {task.priority}
                      </Badge>
                    </button>
                  ))}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowBacklog(false)
                  setSwapIndex(null)
                }}
                className="mt-2 text-muted-foreground"
              >
                Cancel
              </Button>
            </div>
          )}

          <div className="mt-4 flex justify-end pt-4 border-t border-border">
            <Button
              onClick={handleStartDay}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Check className="mr-2 h-4 w-4" />
              Start My Day
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
