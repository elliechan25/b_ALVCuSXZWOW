"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Clock, Users } from "lucide-react"
import type { Project } from "@/lib/types"
import { LineChart, Line, ResponsiveContainer } from "recharts"
import { burndownData } from "@/lib/data"
import { cn } from "@/lib/utils"

interface ProjectCardProps {
  project: Project
  onClick: () => void
  compact?: boolean
}

function ProgressRing({ progress, color, size = 80 }: { progress: number; color: string; size?: number }) {
  const strokeWidth = 8
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (progress / 100) * circumference

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          className="text-muted"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className="progress-ring transition-all duration-700"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke={color}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold text-card-foreground">{progress}%</span>
      </div>
    </div>
  )
}

function HealthIndicator({ health }: { health: "green" | "yellow" | "red" }) {
  const colors = {
    green: "bg-success",
    yellow: "bg-warning",
    red: "bg-destructive",
  }
  const labels = {
    green: "On Track",
    yellow: "At Risk",
    red: "Blocked",
  }

  return (
    <div className="flex items-center gap-2">
      <div className={`h-2.5 w-2.5 rounded-full ${colors[health]}`} />
      <span className="text-xs text-muted-foreground">{labels[health]}</span>
    </div>
  )
}

function MiniBurndown({ color }: { color: string }) {
  return (
    <div className="h-12 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={burndownData}>
          <Line
            type="monotone"
            dataKey="remaining"
            stroke={color}
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="ideal"
            stroke="var(--muted-foreground)"
            strokeWidth={1}
            strokeDasharray="4 4"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export function ProjectCard({ project, onClick, compact = false }: ProjectCardProps) {
  const blockedTasks = project.tasks.filter((t) => t.blockedBy || t.waitingOn)
  const hasDeadlineSoon = project.tasks.some((t) => {
    const dueDate = new Date(t.dueDate)
    const now = new Date()
    const diff = dueDate.getTime() - now.getTime()
    const hours = diff / (1000 * 60 * 60)
    return hours > 0 && hours < 48
  })

  if (compact) {
    return (
      <Card
        className="border-border bg-card hover:border-primary/30 transition-all cursor-pointer group"
        onClick={onClick}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <ProgressRing progress={project.progress} color={project.color} size={50} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <div
                  className="h-3 w-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: project.color }}
                />
                <h3 className="font-semibold text-card-foreground group-hover:text-primary transition-colors truncate text-sm">
                  {project.name}
                </h3>
              </div>
              <HealthIndicator health={project.health} />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      className="border-border bg-card hover:border-primary/30 transition-all cursor-pointer group"
      onClick={onClick}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <div
                className="h-3 w-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: project.color }}
              />
              <h3 className="font-semibold text-card-foreground group-hover:text-primary transition-colors truncate">
                {project.name}
              </h3>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
          </div>
          <ProgressRing progress={project.progress} color={project.color} />
        </div>

        <div className="flex items-center justify-between mb-4">
          <HealthIndicator health={project.health} />
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{project.lastActive}</span>
          </div>
        </div>

        {/* Mini Burndown Chart */}
        <div className="mb-4">
          <p className="text-xs text-muted-foreground mb-1">Burndown</p>
          <MiniBurndown color={project.color} />
        </div>

        {/* Contributors */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <div className="flex -space-x-2">
              {project.contributors.slice(0, 4).map((contributor) => (
                <Avatar key={contributor.id} className="h-6 w-6 border-2 border-card">
                  <AvatarImage src={contributor.avatar} alt={contributor.name} />
                  <AvatarFallback className="bg-primary/20 text-primary text-[10px]">
                    {contributor.name.split(" ").map((n) => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
              ))}
              {project.contributors.length > 4 && (
                <div className="h-6 w-6 rounded-full bg-muted border-2 border-card flex items-center justify-center text-[10px] text-muted-foreground">
                  +{project.contributors.length - 4}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!compact && blockedTasks.length > 0 && (
              <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 text-xs">
                {blockedTasks.length} blocked
              </Badge>
            )}
            {!compact && hasDeadlineSoon && (
              <Badge variant="outline" className="bg-warning/10 text-warning-foreground border-warning/20 text-xs">
                Due soon
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
