"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { TrendingUp, TrendingDown, AlertTriangle, Clock, CheckCircle, Activity } from "lucide-react"
import { velocityData, timeAllocationData, projects } from "@/lib/data"
import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAppStore } from "@/lib/store"

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("month")
  const [selectedBlockedTaskId, setSelectedBlockedTaskId] = useState<string | null>(null)
  const blockerSectionRef = useRef<HTMLDivElement | null>(null)
  const router = useRouter()
  const { tasks, updateTask } = useAppStore()

  // Calculate stats
  const totalTasks = tasks.length
  const completedTasks = tasks.filter((t) => t.status === "done").length
  const inProgressTasks = tasks.filter((t) => t.status === "doing").length
  const blockedTasks = tasks.filter((t) => t.blockedBy || t.waitingOn)

  // Calculate velocity trend
  const avgVelocity = velocityData.reduce((acc, d) => acc + d.completed, 0) / velocityData.length
  const lastWeekVelocity = velocityData[velocityData.length - 1]?.completed || 0
  const velocityTrend = lastWeekVelocity > avgVelocity ? "up" : "down"
  const velocityChange = Math.abs(((lastWeekVelocity - avgVelocity) / avgVelocity) * 100).toFixed(0)

  // Time allocation colors
  const pieColors = ["#06B6D4", "#10B981", "#F59E0B", "#8B5CF6", "#6B7280"]

  // Blocker map data
  const blockerMapData = blockedTasks.map((task) => ({
    id: task.id,
    name: task.title.substring(0, 20) + (task.title.length > 20 ? "..." : ""),
    waitingOn: task.waitingOn || "Dependency",
    project: projects.find((p) => p.id === task.projectId)?.name || "Unknown",
    daysBlocked: Math.floor(
      (new Date().getTime() - new Date(task.updatedAt).getTime()) / (1000 * 60 * 60 * 24)
    ),
  }))
  const selectedBlockedTask = blockedTasks.find((task) => task.id === selectedBlockedTaskId) || null

  return (
    <div className="p-8 pt-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Pulse</h1>
          <p className="text-muted-foreground mt-1">
            Analytics and insights for your projects
          </p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-40 bg-secondary/50 border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="quarter">This Quarter</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card
          className="border-border cursor-pointer hover:border-primary/30 transition-colors"
          onClick={() => router.push("/workspace")}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Tasks</p>
                <p className="text-3xl font-bold text-card-foreground">{totalTasks}</p>
              </div>
              <div className="p-3 rounded-lg bg-primary/10">
                <Activity className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="border-border cursor-pointer hover:border-primary/30 transition-colors"
          onClick={() => router.push("/workspace")}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-3xl font-bold text-card-foreground">{completedTasks}</p>
                <p className="text-xs text-success mt-1">
                  {((completedTasks / totalTasks) * 100).toFixed(0)}% completion rate
                </p>
              </div>
              <div className="p-3 rounded-lg bg-success/10">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="border-border cursor-pointer hover:border-primary/30 transition-colors"
          onClick={() => router.push("/workspace")}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-3xl font-bold text-card-foreground">{inProgressTasks}</p>
              </div>
              <div className="p-3 rounded-lg bg-warning/10">
                <Clock className="h-6 w-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="border-border cursor-pointer hover:border-primary/30 transition-colors"
          onClick={() => {
            if (blockerSectionRef.current) {
              blockerSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" })
            }
          }}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Blocked</p>
                <p className="text-3xl font-bold text-card-foreground">{blockedTasks.length}</p>
                {blockedTasks.length > 0 && (
                  <p className="text-xs text-destructive mt-1">Needs attention</p>
                )}
              </div>
              <div className="p-3 rounded-lg bg-destructive/10">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Velocity Chart */}
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg text-card-foreground">Velocity</CardTitle>
                <CardDescription>Tasks completed per week</CardDescription>
              </div>
              <Badge
                variant="outline"
                className={
                  velocityTrend === "up"
                    ? "bg-success/10 text-success border-success/20"
                    : "bg-destructive/10 text-destructive border-destructive/20"
                }
              >
                {velocityTrend === "up" ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1" />
                )}
                {velocityChange}%
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={velocityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis
                    dataKey="week"
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
                  <Bar
                    dataKey="completed"
                    fill="var(--primary)"
                    radius={[4, 4, 0, 0]}
                    name="Tasks Completed"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Time Allocation */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-lg text-card-foreground">Time Allocation</CardTitle>
            <CardDescription>Where time is being spent</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={timeAllocationData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="hours"
                    nameKey="category"
                  >
                    {timeAllocationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                  {/* Tooltip intentionally omitted to avoid hover overlay */}
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value) => (
                      <span style={{ color: "var(--card-foreground)", fontSize: "12px" }}>
                        {value}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Blocker Map */}
      <Card className="border-border mt-6" ref={blockerSectionRef}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-card-foreground">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Blocker Map
          </CardTitle>
          <CardDescription>Tasks waiting on dependencies or external factors</CardDescription>
        </CardHeader>
        <CardContent>
          {blockerMapData.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-success mx-auto mb-3" />
              <p className="text-card-foreground font-medium">No blockers found</p>
              <p className="text-sm text-muted-foreground">All tasks are progressing smoothly</p>
            </div>
          ) : (
            <div className="space-y-3">
              {blockerMapData.map((blocker, index) => (
                <button
                  key={index}
                  type="button"
                  className="w-full flex items-center justify-between p-4 rounded-lg bg-destructive/5 border border-destructive/20 hover:border-destructive/40 transition-colors text-left"
                  onClick={() => setSelectedBlockedTaskId(blocker.id)}
                >
                  <span>{blocker.name}</span>
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                    </div>
                    <div>
                      <p className="font-medium text-card-foreground">{blocker.name}</p>
                      <p className="text-sm text-muted-foreground">{blocker.project}</p>
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 mb-1">
                      {blocker.daysBlocked} days blocked
                    </Badge>
                    <p className="text-sm text-muted-foreground">Waiting on: {blocker.waitingOn}</p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-success border-success/30 hover:bg-success/10"
                      onClick={(e) => {
                        e.stopPropagation()
                        updateTask(blocker.id, { blockedBy: undefined, waitingOn: undefined })
                      }}
                    >
                      Unblock
                    </Button>
                  </div>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedBlockedTask} onOpenChange={(open) => !open && setSelectedBlockedTaskId(null)}>
        <DialogContent className="max-w-lg bg-card border-border">
          {selectedBlockedTask && (
            <>
              <DialogHeader>
                <DialogTitle className="text-card-foreground">{selectedBlockedTask.title}</DialogTitle>
                <DialogDescription>Edit blocked task details</DialogDescription>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Description</p>
                  <Textarea
                    value={selectedBlockedTask.description}
                    onChange={(e) => updateTask(selectedBlockedTask.id, { description: e.target.value })}
                    className="bg-secondary/50 border-border resize-none"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Status</p>
                    <select
                      value={selectedBlockedTask.status}
                      onChange={(e) =>
                        updateTask(selectedBlockedTask.id, { status: e.target.value as typeof selectedBlockedTask.status })
                      }
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
                      value={selectedBlockedTask.priority}
                      onChange={(e) =>
                        updateTask(selectedBlockedTask.id, { priority: e.target.value as typeof selectedBlockedTask.priority })
                      }
                      className="w-full h-9 px-3 rounded-md bg-secondary/50 border border-border text-sm text-card-foreground"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Due Date</p>
                    <Input
                      type="date"
                      value={selectedBlockedTask.dueDate}
                      onChange={(e) => updateTask(selectedBlockedTask.id, { dueDate: e.target.value })}
                      className="bg-secondary/50 border-border"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Waiting On</p>
                    <Input
                      value={selectedBlockedTask.waitingOn || ""}
                      onChange={(e) => updateTask(selectedBlockedTask.id, { waitingOn: e.target.value || undefined })}
                      placeholder="Dependency or teammate"
                      className="bg-secondary/50 border-border"
                    />
                  </div>
                </div>

                <div className="flex justify-between pt-4 border-t border-border">
                  <Button
                    variant="outline"
                    className="text-success border-success/30 hover:bg-success/10"
                    onClick={() => updateTask(selectedBlockedTask.id, { blockedBy: undefined, waitingOn: undefined })}
                  >
                    Unblock
                  </Button>
                  <Button onClick={() => setSelectedBlockedTaskId(null)}>Save & Close</Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Project Health Overview */}
      <div className="mt-6">
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-lg text-card-foreground">Project Health Overview</CardTitle>
            <CardDescription>Status of all active projects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {projects.map((project) => {
                const projectTasks = tasks.filter((t) => t.projectId === project.id)
                const completed = projectTasks.filter((t) => t.status === "done").length
                const total = projectTasks.length

                return (
                  <div
                    key={project.id}
                    className="p-4 rounded-lg bg-secondary/30 border border-border"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: project.color }}
                        />
                        <span className="font-medium text-card-foreground">{project.name}</span>
                      </div>
                      <div
                        className={`h-2 w-2 rounded-full ${
                          project.health === "green"
                            ? "bg-success"
                            : project.health === "yellow"
                            ? "bg-warning"
                            : "bg-destructive"
                        }`}
                      />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="text-card-foreground font-medium">{project.progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full mt-2 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${project.progress}%`,
                          backgroundColor: project.color,
                        }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {completed}/{total} tasks completed
                    </p>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
