import type { User, Project, Task, Comment, AutomationRule, IntegrationConfig } from "./types"

export const users: User[] = [
  { id: "1", name: "Ellie Chen", email: "ellie@example.com", avatar: "/avatars/ellie.jpg" },
  { id: "2", name: "Marcus Rivera", email: "marcus@example.com", avatar: "/avatars/marcus.jpg" },
  { id: "3", name: "Sarah Kim", email: "sarah@example.com", avatar: "/avatars/sarah.jpg" },
  { id: "4", name: "Alex Thompson", email: "alex@example.com", avatar: "/avatars/alex.jpg" },
]

export const currentUser = users[0]

export const projects: Project[] = [
  {
    id: "1",
    name: "Finance Tracker",
    description: "Personal finance management application with budget tracking and analytics",
    goal: "Launch MVP by end of Q2 with core budgeting features",
    color: "#3B82F6",
    progress: 75,
    health: "green",
    lastActive: "2 hours ago",
    sprintGoal: "Finish the SQL integration for the Login Page",
    contributors: [users[0], users[1], users[2]],
    startDate: "2026-01-15",
    endDate: "2026-04-30",
    tasks: [],
    pinnedDocs: [
      { id: "1", title: "API Base URL", content: "https://api.financetracker.dev/v1", type: "api" },
      { id: "2", title: "Color Palette", content: "#3B82F6, #10B981, #F59E0B, #EF4444", type: "colors" },
    ],
    meetingNotes: [
      { id: "1", title: "Sprint Planning", summary: "Decided to prioritize login flow and dashboard. Backend team to focus on API stability.", date: "2026-04-04", attendees: [users[0], users[1]] },
      { id: "2", title: "Design Review", summary: "Approved new dashboard mockups. Minor tweaks needed for mobile responsiveness.", date: "2026-04-02", attendees: [users[0], users[2]] },
    ],
    commits: [
      { id: "1", message: "fix: #102 login bug - resolved session timeout issue", author: users[1], timestamp: "2026-04-06T10:30:00Z", taskId: "102", sha: "a1b2c3d" },
      { id: "2", message: "feat: add expense categories dropdown", author: users[0], timestamp: "2026-04-06T09:15:00Z", sha: "e4f5g6h" },
      { id: "3", message: "refactor: optimize database queries", author: users[2], timestamp: "2026-04-05T16:45:00Z", sha: "i7j8k9l" },
    ],
  },
  {
    id: "2",
    name: "Task Manager",
    description: "Team collaboration and task management platform",
    goal: "Complete core features for beta testing",
    color: "#10B981",
    progress: 45,
    health: "yellow",
    lastActive: "5 hours ago",
    sprintGoal: "Implement drag-and-drop Kanban board",
    contributors: [users[0], users[3]],
    startDate: "2026-02-01",
    endDate: "2026-05-15",
    tasks: [],
    pinnedDocs: [
      { id: "3", title: "Database Schema", content: "Users -> Tasks -> Projects (many-to-many)", type: "schema" },
    ],
    meetingNotes: [
      { id: "3", title: "Architecture Review", summary: "Decided on React Query for state management. Will implement optimistic updates.", date: "2026-04-03", attendees: [users[0], users[3]] },
    ],
    commits: [
      { id: "4", message: "feat: basic kanban layout", author: users[3], timestamp: "2026-04-05T14:20:00Z", sha: "m1n2o3p" },
    ],
  },
  {
    id: "3",
    name: "E-commerce Platform",
    description: "Full-stack e-commerce solution with payment integration",
    goal: "Launch store with Stripe payments by May",
    color: "#F59E0B",
    progress: 30,
    health: "red",
    lastActive: "1 day ago",
    sprintGoal: "Complete checkout flow and payment integration",
    contributors: [users[1], users[2], users[3]],
    startDate: "2026-03-01",
    endDate: "2026-06-30",
    tasks: [],
    pinnedDocs: [],
    meetingNotes: [],
    commits: [],
  },
]

export const tasks: Task[] = [
  // Finance Tracker tasks
  { id: "1", title: "Implement login authentication", description: "Set up JWT-based auth flow", status: "done", priority: "high", projectId: "1", assigneeId: "1", assignee: users[0], dueDate: "2026-04-05", createdAt: "2026-03-20", updatedAt: "2026-04-05", timeCategory: "feature", estimatedHours: 8, actualHours: 10 },
  { id: "2", title: "Design dashboard layout", description: "Create responsive dashboard with widgets", status: "review", priority: "high", projectId: "1", assigneeId: "2", assignee: users[1], dueDate: "2026-04-06", createdAt: "2026-03-22", updatedAt: "2026-04-06", timeCategory: "feature", estimatedHours: 6, actualHours: 5 },
  { id: "3", title: "Add expense tracking", description: "CRUD operations for expenses", status: "doing", priority: "medium", projectId: "1", assigneeId: "1", assignee: users[0], dueDate: "2026-04-07", createdAt: "2026-03-25", updatedAt: "2026-04-06", timeCategory: "feature", estimatedHours: 12 },
  { id: "4", title: "Fix budget calculation bug", description: "Monthly totals not calculating correctly", status: "doing", priority: "urgent", projectId: "1", assigneeId: "3", assignee: users[2], dueDate: "2026-04-06", createdAt: "2026-04-01", updatedAt: "2026-04-06", timeCategory: "debugging", estimatedHours: 4 },
  { id: "5", title: "Implement data export", description: "Export to CSV and PDF", status: "backlog", priority: "low", projectId: "1", dueDate: "2026-04-15", createdAt: "2026-04-02", updatedAt: "2026-04-02", timeCategory: "feature", estimatedHours: 8 },
  { id: "6", title: "Add recurring transactions", description: "Support for monthly recurring entries", status: "backlog", priority: "medium", projectId: "1", dueDate: "2026-04-12", createdAt: "2026-04-03", updatedAt: "2026-04-03", timeCategory: "feature", estimatedHours: 10 },
  
  // Task Manager tasks
  { id: "7", title: "Build Kanban board UI", description: "Drag and drop columns", status: "doing", priority: "high", projectId: "2", assigneeId: "1", assignee: users[0], dueDate: "2026-04-08", createdAt: "2026-03-28", updatedAt: "2026-04-06", timeCategory: "feature", estimatedHours: 16 },
  { id: "8", title: "Implement task filtering", description: "Filter by status, assignee, project", status: "backlog", priority: "medium", projectId: "2", dueDate: "2026-04-10", createdAt: "2026-04-01", updatedAt: "2026-04-01", timeCategory: "feature", estimatedHours: 6 },
  { id: "9", title: "Add subtask support", description: "Nested tasks with progress tracking", status: "backlog", priority: "medium", projectId: "2", assigneeId: "4", assignee: users[3], dueDate: "2026-04-12", createdAt: "2026-04-02", updatedAt: "2026-04-02", blockedBy: "7", waitingOn: "Kanban board completion", timeCategory: "feature", estimatedHours: 8 },
  
  // E-commerce tasks
  { id: "10", title: "Integrate Stripe payments", description: "Set up Stripe checkout", status: "doing", priority: "urgent", projectId: "3", assigneeId: "2", assignee: users[1], dueDate: "2026-04-07", createdAt: "2026-03-15", updatedAt: "2026-04-05", blockedBy: "figma", waitingOn: "Figma Assets from Design Team", timeCategory: "feature", estimatedHours: 20 },
  { id: "11", title: "Build product catalog", description: "Product listing and search", status: "review", priority: "high", projectId: "3", assigneeId: "3", assignee: users[2], dueDate: "2026-04-08", createdAt: "2026-03-20", updatedAt: "2026-04-06", timeCategory: "feature", estimatedHours: 15 },
  { id: "12", title: "Shopping cart functionality", description: "Add to cart, update quantities", status: "backlog", priority: "high", projectId: "3", dueDate: "2026-04-10", createdAt: "2026-04-01", updatedAt: "2026-04-01", timeCategory: "feature", estimatedHours: 12 },
]

// Assign tasks to projects
projects[0].tasks = tasks.filter(t => t.projectId === "1")
projects[1].tasks = tasks.filter(t => t.projectId === "2")
projects[2].tasks = tasks.filter(t => t.projectId === "3")

export const comments: Comment[] = [
  { id: "1", content: "Dashboard mockups look great! Ready for review.", author: users[1], projectId: "1", projectName: "Finance Tracker", taskId: "2", createdAt: "2026-04-06T11:30:00Z", type: "comment" },
  { id: "2", content: "Task moved to Review", author: users[2], projectId: "3", projectName: "E-commerce Platform", taskId: "11", createdAt: "2026-04-06T10:15:00Z", type: "status_change" },
  { id: "3", content: "Found the root cause of the bug. Working on fix now.", author: users[2], projectId: "1", projectName: "Finance Tracker", taskId: "4", createdAt: "2026-04-06T09:45:00Z", type: "comment" },
  { id: "4", content: "Stripe sandbox is set up. Need design assets to proceed.", author: users[1], projectId: "3", projectName: "E-commerce Platform", taskId: "10", createdAt: "2026-04-05T16:00:00Z", type: "comment" },
  { id: "5", content: "Sprint goal updated for this week", author: users[0], projectId: "2", projectName: "Task Manager", createdAt: "2026-04-05T14:30:00Z", type: "status_change" },
]

export const automationRules: AutomationRule[] = [
  { id: "1", name: "Auto-complete on merge", trigger: "When PR is merged in Finance Tracker", action: "Move linked task to Done", isActive: true, projectId: "1" },
  { id: "2", name: "Deadline reminder", trigger: "24 hours before due date", action: "Send Slack notification", isActive: true },
  { id: "3", name: "Blocker alert", trigger: "Task marked as blocked", action: "Notify project lead", isActive: false },
]

export const integrations: IntegrationConfig[] = [
  { id: "1", type: "github", repoUrl: "https://github.com/user/finance-tracker", isConnected: true, lastSync: "2026-04-06T10:30:00Z" },
  { id: "2", type: "slack", isConnected: true },
  { id: "3", type: "gitlab", isConnected: false },
]

// Helper to get tasks due today
export function getTasksDueToday(): Task[] {
  const today = new Date().toISOString().split("T")[0]
  return tasks.filter(t => t.dueDate === today && t.status !== "done")
}

// Helper to get suggested daily tasks (top 3 by priority and due date)
export function getSuggestedTasks(): Task[] {
  const priorityOrder: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 }
  return tasks
    .filter(t => t.status !== "done")
    .sort((a, b) => {
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority]
      if (priorityDiff !== 0) return priorityDiff
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    })
    .slice(0, 3)
}

// Helper to get blocked tasks
export function getBlockedTasks(): Task[] {
  return tasks.filter(t => t.blockedBy || t.waitingOn)
}

// Velocity data (tasks completed per week)
export const velocityData = [
  { week: "W1 Mar", completed: 8 },
  { week: "W2 Mar", completed: 12 },
  { week: "W3 Mar", completed: 10 },
  { week: "W4 Mar", completed: 15 },
  { week: "W1 Apr", completed: 11 },
  { week: "W2 Apr", completed: 14 },
]

// Time allocation data
export const timeAllocationData = [
  { category: "Feature Work", hours: 45, fill: "var(--chart-1)" },
  { category: "Debugging", hours: 20, fill: "var(--chart-2)" },
  { category: "Meetings", hours: 10, fill: "var(--chart-3)" },
  { category: "Planning", hours: 8, fill: "var(--chart-4)" },
  { category: "Other", hours: 5, fill: "var(--chart-5)" },
]

// Burndown data for Finance Tracker
export const burndownData = [
  { date: "Mar 15", remaining: 25, ideal: 25 },
  { date: "Mar 22", remaining: 22, ideal: 20 },
  { date: "Mar 29", remaining: 18, ideal: 15 },
  { date: "Apr 5", remaining: 12, ideal: 10 },
  { date: "Apr 12", remaining: 8, ideal: 5 },
  { date: "Apr 19", remaining: 4, ideal: 0 },
]
