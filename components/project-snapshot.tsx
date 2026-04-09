"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Project } from "@/lib/types"

interface ProjectSnapshotProps {
  projects: Project[]
}

function ProgressRing({ progress, color, size = 60 }: { progress: number; color: string; size?: number }) {
  const strokeWidth = 6
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
          className="progress-ring transition-all duration-500"
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
        <span className="text-sm font-semibold text-card-foreground">{progress}%</span>
      </div>
    </div>
  )
}

export function ProjectSnapshot({ projects }: ProjectSnapshotProps) {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-card-foreground">
          Active Projects
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {projects.map((project) => (
          <Link
            key={project.id}
            href={`/projects?id=${project.id}`}
            className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50 border border-border hover:border-primary/30 transition-all group"
          >
            <ProgressRing progress={project.progress} color={project.color} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: project.color }}
                />
                <p className="font-medium text-card-foreground group-hover:text-primary transition-colors truncate">
                  {project.name}
                </p>
              </div>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                {project.description}
              </p>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-xs text-muted-foreground">
                  {project.tasks.filter((t) => t.status === "done").length}/{project.tasks.length} tasks
                </span>
                <span className="text-xs text-muted-foreground">
                  Last active: {project.lastActive}
                </span>
              </div>
            </div>
            <div
              className="h-2 w-2 rounded-full flex-shrink-0"
              style={{
                backgroundColor:
                  project.health === "green"
                    ? "var(--success)"
                    : project.health === "yellow"
                    ? "var(--warning)"
                    : "var(--destructive)",
              }}
            />
          </Link>
        ))}
      </CardContent>
    </Card>
  )
}
