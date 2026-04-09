"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { ProjectCard } from "@/components/project-card"
import { ProjectDetail } from "@/components/project-detail"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Search, Plus, Grid3X3, List } from "lucide-react"
import { projects, tasks } from "@/lib/data"
import type { Project, Task } from "@/lib/types"
import { TaskCard } from "@/components/task-card"
import { useAppStore } from "@/lib/store"
import { cn } from "@/lib/utils"

export default function ProjectsPage() {
  const searchParams = useSearchParams()
  const { updateTaskStatus, updateTask, deleteTask } = useAppStore()
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showFilteredTasks, setShowFilteredTasks] = useState<{ type: "green" | "yellow" | "red"; tasks: Task[] } | null>(null)

  // Handle project selection from URL param
  useEffect(() => {
    const projectId = searchParams.get("id")
    if (projectId) {
      const project = projects.find((p) => p.id === projectId)
      if (project) {
        setSelectedProject(project)
      }
    }
  }, [searchParams])

  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const healthCounts = {
    green: projects.filter((p) => p.health === "green").length,
    yellow: projects.filter((p) => p.health === "yellow").length,
    red: projects.filter((p) => p.health === "red").length,
  }

  const getTasksByHealth = (health: "green" | "yellow" | "red") => {
    const projectsWithHealth = projects.filter((p) => p.health === health)
    return tasks.filter((t) => projectsWithHealth.some((p) => p.id === t.projectId) && t.status !== "done")
  }

  const handleHealthClick = (health: "green" | "yellow" | "red") => {
    const filteredTasks = getTasksByHealth(health)
    setShowFilteredTasks({ type: health, tasks: filteredTasks })
  }

  const getHealthLabel = (health: "green" | "yellow" | "red") => {
    switch (health) {
      case "green": return "On Track"
      case "yellow": return "At Risk"
      case "red": return "Blocked"
    }
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Main Content */}
      <div className={cn(
        "flex-1 overflow-auto p-8 pt-10 transition-all duration-300",
        selectedProject && isExpanded && "lg:max-w-[400px]"
      )}>
        <div className={cn(
          "mx-auto px-4",
          selectedProject && isExpanded ? "max-w-full" : "max-w-6xl"
        )}>
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Projects</h1>
              <p className="text-muted-foreground mt-1">
                Your project portfolio at a glance
              </p>
            </div>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </div>

          {/* Health Summary - Clickable Buttons */}
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="outline"
              onClick={() => handleHealthClick("green")}
              className="bg-transparent border-border hover:bg-success/10 py-1.5 px-3"
            >
              {healthCounts.green} On Track
            </Button>
            <Button
              variant="outline"
              onClick={() => handleHealthClick("yellow")}
              className="bg-transparent border-border hover:bg-warning/10 py-1.5 px-3"
            >
              {healthCounts.yellow} At Risk
            </Button>
            <Button
              variant="outline"
              onClick={() => handleHealthClick("red")}
              className="bg-transparent border-border hover:bg-destructive/10 py-1.5 px-3 text-destructive"
            >
              <div className="h-2 w-2 rounded-full bg-destructive mr-2" />
              {healthCounts.red} Blocked
            </Button>
          </div>

          {/* Search and View Toggle */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-secondary/50 border-border"
              />
            </div>
            <div className="flex items-center border border-border rounded-lg p-1 bg-secondary/30">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="h-8 px-3"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="h-8 px-3"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Project Gallery */}
          <div
            className={cn(
              viewMode === "grid"
                ? selectedProject && isExpanded
                  ? "grid grid-cols-1 gap-4"
                  : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                : "space-y-4"
            )}
          >
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onClick={() => setSelectedProject(project)}
                compact={selectedProject !== null && isExpanded}
              />
            ))}
          </div>

          {filteredProjects.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No projects found matching your search.</p>
            </div>
          )}
        </div>
      </div>

      {/* Project Detail Panel */}
      {selectedProject && (
        <aside className={cn(
          "border-l border-border hidden lg:flex lg:flex-col transition-all duration-300 min-h-0 overflow-hidden",
          isExpanded ? "flex-1" : "w-[480px]"
        )}>
          <ProjectDetail
            project={selectedProject}
            onClose={() => {
              setSelectedProject(null)
              setIsExpanded(false)
            }}
            isExpanded={isExpanded}
            onToggleExpand={() => setIsExpanded(!isExpanded)}
          />
        </aside>
      )}

      {/* Filtered Tasks Dialog */}
      <Dialog open={!!showFilteredTasks} onOpenChange={(open) => !open && setShowFilteredTasks(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] bg-card border-border flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-card-foreground">
              {showFilteredTasks && `${getHealthLabel(showFilteredTasks.type)} Tasks`}
            </DialogTitle>
            <DialogDescription>
              {showFilteredTasks?.tasks.length} tasks from projects that are {showFilteredTasks && getHealthLabel(showFilteredTasks.type).toLowerCase()}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-3 mt-4">
            {showFilteredTasks?.tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onStatusChange={(status) => updateTaskStatus(task.id, status)}
                onUpdate={(updates) => updateTask(task.id, updates)}
                onDelete={() => deleteTask(task.id)}
              />
            ))}
            {showFilteredTasks?.tasks.length === 0 && (
              <p className="text-muted-foreground text-center py-8">No tasks found</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
