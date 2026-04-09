"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Target,
  Calendar,
  Users,
  AlertTriangle,
  GitCommit,
  FileText,
  MessageSquare,
  Share2,
  X,
  Clock,
  Maximize2,
  Minimize2,
  Check,
  Edit2,
} from "lucide-react"
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts"
import type { Project, Task } from "@/lib/types"
import { burndownData } from "@/lib/data"
import { useAppStore } from "@/lib/store"
import { cn } from "@/lib/utils"

interface ProjectDetailProps {
  project: Project
  onClose: () => void
  isExpanded?: boolean
  onToggleExpand?: () => void
}

function ProgressRing({ progress, color, size = 100 }: { progress: number; color: string; size?: number }) {
  const strokeWidth = 10
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
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-card-foreground">{progress}%</span>
        <span className="text-xs text-muted-foreground">Complete</span>
      </div>
    </div>
  )
}

export function ProjectDetail({ project, onClose, isExpanded = false, onToggleExpand }: ProjectDetailProps) {
  const { updateTask, updateTaskStatus } = useAppStore()
  const blockedTasks = project.tasks.filter((t) => t.blockedBy || t.waitingOn)
  const [editingGoal, setEditingGoal] = useState(false)
  const [goalText, setGoalText] = useState(project.goal)
  const [editingSprintGoal, setEditingSprintGoal] = useState(false)
  const [sprintGoalText, setSprintGoalText] = useState(project.sprintGoal || "")
  const [editingDoc, setEditingDoc] = useState<string | null>(null)
  const [docContent, setDocContent] = useState("")

  const handleUnblock = (task: Task) => {
    updateTask(task.id, { blockedBy: undefined, waitingOn: undefined })
  }

  return (
    <div className="h-full min-h-0 flex flex-col bg-card">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div
            className="h-4 w-4 rounded-full"
            style={{ backgroundColor: project.color }}
          />
          <h2 className="text-xl font-semibold text-card-foreground">{project.name}</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="border-border">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          {onToggleExpand && (
            <Button variant="ghost" size="icon" onClick={onToggleExpand}>
              {isExpanded ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <div className="p-4 space-y-6">
          {/* Sprint Goal */}
          {(project.sprintGoal || editingSprintGoal) && (
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Target className="h-5 w-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-primary">Sprint Goal</p>
                      {!editingSprintGoal && (
                        <Button variant="ghost" size="sm" onClick={() => setEditingSprintGoal(true)} className="h-6 px-2">
                          <Edit2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    {editingSprintGoal ? (
                      <div className="mt-2 flex gap-2">
                        <Input
                          value={sprintGoalText}
                          onChange={(e) => setSprintGoalText(e.target.value)}
                          className="bg-card border-border text-sm"
                          placeholder="Enter sprint goal..."
                        />
                        <Button size="sm" onClick={() => setEditingSprintGoal(false)}>
                          <Check className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <p className="text-card-foreground font-semibold mt-1">{project.sprintGoal}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Progress and Timeline */}
          <div className="flex items-center gap-6">
            <ProgressRing progress={project.progress} color={project.color} />
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground" suppressHydrationWarning>
                  {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Last active: {project.lastActive}</span>
              </div>
              <p className="text-sm text-muted-foreground">{project.description}</p>
            </div>
          </div>

          {/* Goal */}
          <Card className="border-border bg-secondary/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium text-muted-foreground">Project Goal</p>
                {!editingGoal && (
                  <Button variant="ghost" size="sm" onClick={() => setEditingGoal(true)} className="h-6 px-2">
                    <Edit2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
              {editingGoal ? (
                <div className="flex gap-2">
                  <Textarea
                    value={goalText}
                    onChange={(e) => setGoalText(e.target.value)}
                    className="bg-card border-border resize-none"
                    rows={2}
                  />
                  <Button size="sm" onClick={() => setEditingGoal(false)}>
                    <Check className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <p className="text-card-foreground">{project.goal}</p>
              )}
            </CardContent>
          </Card>

          {/* Contributors */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-4 w-4 text-primary" />
                Contributors
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-wrap gap-3">
                {project.contributors.map((user) => (
                  <div key={user.id} className="flex items-center gap-2 bg-secondary/50 rounded-full pl-1 pr-3 py-1">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="bg-primary/20 text-primary text-xs">
                        {user.name.split(" ").map((n) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-card-foreground">{user.name}</span>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="rounded-full border-dashed">
                  + Add
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Burndown Chart with Ideal Line */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Burndown Chart</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={burndownData}>
                    <XAxis
                      dataKey="date"
                      tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                      axisLine={{ stroke: "var(--border)" }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                      axisLine={{ stroke: "var(--border)" }}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: "8px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="ideal"
                      name="Ideal"
                      stroke="var(--muted-foreground)"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="remaining"
                      name="Actual"
                      stroke={project.color}
                      strokeWidth={2}
                      dot={{ fill: project.color, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-center gap-6 mt-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-0.5" style={{ backgroundColor: project.color }} />
                  <span className="text-xs text-muted-foreground">Actual</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-0.5 border-t-2 border-dashed border-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Ideal</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Blocked Tasks - Editable */}
          {blockedTasks.length > 0 && (
            <Card className="border-destructive/30 bg-destructive/5">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base text-destructive">
                  <AlertTriangle className="h-4 w-4" />
                  Blocked ({blockedTasks.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                {blockedTasks.map((task) => (
                  <div key={task.id} className="p-3 rounded-lg bg-card border border-border">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-card-foreground">{task.title}</p>
                        <p className="text-sm text-destructive mt-1">
                          Waiting on: {task.waitingOn || "Dependency"}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUnblock(task)}
                        className="text-success border-success/30 hover:bg-success/10"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Unblock
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Live Commit Feed */}
          {project.commits && project.commits.length > 0 && (
            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <GitCommit className="h-4 w-4 text-primary" />
                  Recent Commits
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                {project.commits.slice(0, 5).map((commit) => (
                  <div key={commit.id} className="flex items-start gap-3">
                    <Avatar className="h-6 w-6 mt-0.5">
                      <AvatarImage src={commit.author.avatar} alt={commit.author.name} />
                      <AvatarFallback className="bg-primary/20 text-primary text-[10px]">
                        {commit.author.name.split(" ").map((n) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-card-foreground line-clamp-1 font-mono">
                        {commit.message}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground font-mono">
                          {commit.sha}
                        </span>
                        <span className="text-xs text-muted-foreground" suppressHydrationWarning>
                          {new Date(commit.timestamp).toLocaleDateString()}
                        </span>
                        {commit.taskId && (
                          <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                            #{commit.taskId}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Pinned Docs - Editable */}
          {project.pinnedDocs && project.pinnedDocs.length > 0 && (
            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="h-4 w-4 text-primary" />
                  Pinned Snippets
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                {project.pinnedDocs.map((doc) => (
                  <div key={doc.id} className="p-3 rounded-lg bg-secondary/50 border border-border">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-card-foreground">{doc.title}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2"
                        onClick={() => {
                          setEditingDoc(doc.id)
                          setDocContent(doc.content)
                        }}
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                    </div>
                    {editingDoc === doc.id ? (
                      <div className="flex gap-2">
                        <Input
                          value={docContent}
                          onChange={(e) => setDocContent(e.target.value)}
                          className="bg-card border-border text-sm font-mono"
                        />
                        <Button size="sm" onClick={() => setEditingDoc(null)}>
                          <Check className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground font-mono">{doc.content}</p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Meeting Notes */}
          {project.meetingNotes && project.meetingNotes.length > 0 && (
            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  Meeting Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                {project.meetingNotes.slice(0, 3).map((note) => (
                  <div key={note.id} className="p-3 rounded-lg bg-secondary/30 border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-card-foreground">{note.title}</p>
                      <span className="text-xs text-muted-foreground" suppressHydrationWarning>
                        {new Date(note.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{note.summary}</p>
                    <div className="flex -space-x-1 mt-2">
                      {note.attendees.map((user) => (
                        <Avatar key={user.id} className="h-5 w-5 border border-card">
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback className="bg-primary/20 text-primary text-[8px]">
                            {user.name.split(" ").map((n) => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
