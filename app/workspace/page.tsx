"use client"

import { useState } from "react"
import { KanbanBoard } from "@/components/kanban-board"
import { ListView } from "@/components/list-view"
import { GanttChart } from "@/components/gantt-chart"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Plus, Filter, LayoutGrid, List, GanttChartSquare } from "lucide-react"
import { useAppStore } from "@/lib/store"
import { projects } from "@/lib/data"
import type { Task, TaskStatus } from "@/lib/types"

export default function WorkspacePage() {
  const {
    tasks,
    workspaceView,
    setWorkspaceView,
    projectFilter,
    setProjectFilter,
    dueDateFilter,
    setDueDateFilter,
    updateTaskStatus,
    addTask,
    updateTask,
    deleteTask,
  } = useAppStore()

  const [searchQuery, setSearchQuery] = useState("")
  const [showAddTask, setShowAddTask] = useState(false)
  const [newTaskStatus, setNewTaskStatus] = useState<TaskStatus>("backlog")
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    projectId: projects[0]?.id || "",
    assigneeId: "unassigned",
    priority: "medium" as Task["priority"],
    dueDate: new Date().toISOString().split("T")[0],
  })

  // Filter tasks - show ALL tasks when no project filter
  const filteredTasks = tasks.filter((task) => {
    // Search filter
    if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    // Project filter - only apply if a specific project is selected
    if (projectFilter && projectFilter !== "all" && task.projectId !== projectFilter) {
      return false
    }
    // Due date filter
    if (dueDateFilter !== "all") {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const taskDue = new Date(task.dueDate)
      taskDue.setHours(0, 0, 0, 0)
      
      switch (dueDateFilter) {
        case "today":
          if (taskDue.getTime() !== today.getTime()) return false
          break
        case "this-week":
          const weekEnd = new Date(today)
          weekEnd.setDate(weekEnd.getDate() + 7)
          if (taskDue < today || taskDue > weekEnd) return false
          break
        case "overdue":
          if (taskDue >= today) return false
          break
      }
    }
    return true
  })

  const handleAddTask = (status: TaskStatus) => {
    setNewTaskStatus(status)
    setShowAddTask(true)
  }

  const handleCreateTask = () => {
    if (!newTask.title.trim()) return
    
    const task: Task = {
      id: `task-${Date.now()}`,
      title: newTask.title,
      description: newTask.description,
      status: newTaskStatus,
      priority: newTask.priority,
      projectId: newTask.projectId,
      assigneeId: newTask.assigneeId === "unassigned" ? undefined : newTask.assigneeId,
      assignee:
        newTask.assigneeId === "unassigned"
          ? undefined
          : projects
              .find((p) => p.id === newTask.projectId)
              ?.contributors.find((u) => u.id === newTask.assigneeId),
      dueDate: newTask.dueDate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    addTask(task)
    setShowAddTask(false)
    setNewTask({
      title: "",
      description: "",
      projectId: projects[0]?.id || "",
      assigneeId: "unassigned",
      priority: "medium",
      dueDate: new Date().toISOString().split("T")[0],
    })
  }

  return (
    <div className="h-screen flex flex-col p-8 pt-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 px-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Workspace</h1>
          <p className="text-muted-foreground mt-1">
            Your infinite board for all tasks
          </p>
        </div>
        <Button
          onClick={() => handleAddTask("backlog")}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-4 mb-6 flex-wrap px-4">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-secondary/50 border-border"
          />
        </div>

        {/* Project Filter */}
        <Select value={projectFilter || "all"} onValueChange={(v) => setProjectFilter(v === "all" ? null : v)}>
          <SelectTrigger className="w-48 bg-secondary/50 border-border">
            <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="All Projects" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            <SelectItem value="all">All Projects</SelectItem>
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                <div className="flex items-center gap-2">
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: project.color }}
                  />
                  {project.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Due Date Filter */}
        <Select value={dueDateFilter} onValueChange={(v) => setDueDateFilter(v as typeof dueDateFilter)}>
          <SelectTrigger className="w-40 bg-secondary/50 border-border">
            <SelectValue placeholder="Due Date" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            <SelectItem value="all">All Tasks</SelectItem>
            <SelectItem value="today">Due Today</SelectItem>
            <SelectItem value="this-week">Due This Week</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>

        {/* View Toggle */}
        <Tabs value={workspaceView} onValueChange={(v) => setWorkspaceView(v as typeof workspaceView)}>
          <TabsList className="bg-secondary/50 border border-border">
            <TabsTrigger value="kanban" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <LayoutGrid className="h-4 w-4 mr-2" />
              Kanban
            </TabsTrigger>
            <TabsTrigger value="list" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <List className="h-4 w-4 mr-2" />
              List
            </TabsTrigger>
            <TabsTrigger value="gantt" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <GanttChartSquare className="h-4 w-4 mr-2" />
              Gantt
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden px-4">
        {workspaceView === "kanban" && (
          <ScrollArea className="h-full">
            <KanbanBoard
              tasks={filteredTasks}
              onTaskStatusChange={updateTaskStatus}
              onTaskUpdate={updateTask}
              onTaskDelete={deleteTask}
              onAddTask={handleAddTask}
            />
          </ScrollArea>
        )}
        {workspaceView === "list" && (
          <ListView
            tasks={filteredTasks}
            onTaskStatusChange={updateTaskStatus}
            onTaskUpdate={updateTask}
            onTaskDelete={deleteTask}
          />
        )}
        {workspaceView === "gantt" && (
          <ScrollArea className="h-full">
            <GanttChart
              tasks={filteredTasks}
              onTaskStatusChange={updateTaskStatus}
              onTaskUpdate={updateTask}
              onTaskDelete={deleteTask}
            />
          </ScrollArea>
        )}
      </div>

      {/* Add Task Dialog */}
      <Dialog open={showAddTask} onOpenChange={setShowAddTask}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-card-foreground">Create New Task</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Add a new task to your workspace
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Title</label>
              <Input
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="Task title..."
                className="mt-1 bg-secondary/50 border-border"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Description</label>
              <Input
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                placeholder="Task description..."
                className="mt-1 bg-secondary/50 border-border"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Project</label>
                <Select
                  value={newTask.projectId}
                  onValueChange={(v) => setNewTask({ ...newTask, projectId: v })}
                >
                  <SelectTrigger className="mt-1 bg-secondary/50 border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        <div className="flex items-center gap-2">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: project.color }}
                          />
                          {project.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Priority</label>
                <Select
                  value={newTask.priority}
                  onValueChange={(v) => setNewTask({ ...newTask, priority: v as Task["priority"] })}
                >
                  <SelectTrigger className="mt-1 bg-secondary/50 border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Assignee</label>
              <Select
                value={newTask.assigneeId}
                onValueChange={(v) => setNewTask({ ...newTask, assigneeId: v })}
              >
                <SelectTrigger className="mt-1 bg-secondary/50 border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {(projects.find((p) => p.id === newTask.projectId)?.contributors || []).map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Due Date</label>
              <Input
                type="date"
                value={newTask.dueDate}
                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                className="mt-1 bg-secondary/50 border-border"
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowAddTask(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateTask}>
                Create Task
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
