// Core Types for Project Management Tool

export type TaskStatus = "backlog" | "doing" | "review" | "blocked" | "done"
export type TaskPriority = "low" | "medium" | "high" | "urgent"
export type HealthStatus = "green" | "yellow" | "red"

export interface User {
  id: string
  name: string
  email: string
  avatar: string
}

export interface Task {
  id: string
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  projectId: string
  assigneeId?: string
  assignee?: User
  dueDate: string
  createdAt: string
  updatedAt: string
  blockedBy?: string
  waitingOn?: string
  subtasks?: Task[]
  timeCategory?: "debugging" | "feature" | "meeting" | "planning" | "other"
  estimatedHours?: number
  actualHours?: number
  tags?: string[]
}

export interface Project {
  id: string
  name: string
  description: string
  goal: string
  color: string
  progress: number
  health: HealthStatus
  lastActive: string
  sprintGoal?: string
  contributors: User[]
  tasks: Task[]
  pinnedDocs?: PinnedDoc[]
  meetingNotes?: MeetingNote[]
  commits?: Commit[]
  startDate: string
  endDate: string
}

export interface PinnedDoc {
  id: string
  title: string
  content: string
  type: "api" | "colors" | "schema" | "other"
}

export interface MeetingNote {
  id: string
  title: string
  summary: string
  date: string
  attendees: User[]
}

export interface Commit {
  id: string
  message: string
  author: User
  timestamp: string
  taskId?: string
  sha: string
}

export interface Comment {
  id: string
  content: string
  author: User
  projectId: string
  projectName: string
  taskId?: string
  createdAt: string
  type: "comment" | "status_change"
}

export interface AutomationRule {
  id: string
  name: string
  trigger: string
  action: string
  isActive: boolean
  projectId?: string
}

export interface IntegrationConfig {
  id: string
  type: "github" | "gitlab" | "slack"
  repoUrl?: string
  isConnected: boolean
  lastSync?: string
}
