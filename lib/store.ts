"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Task, TaskStatus } from "./types"
import { tasks as initialTasks, projects as initialProjects } from "./data"

interface AppState {
  // Daily planning
  hasPlannedToday: boolean
  dailyTasks: Task[]
  setHasPlannedToday: (value: boolean) => void
  setDailyTasks: (tasks: Task[]) => void
  
  // Tasks
  tasks: Task[]
  updateTaskStatus: (taskId: string, status: TaskStatus) => void
  addTask: (task: Task) => void
  updateTask: (taskId: string, updates: Partial<Task>) => void
  deleteTask: (taskId: string) => void
  
  // View preferences
  workspaceView: "kanban" | "list" | "gantt"
  setWorkspaceView: (view: "kanban" | "list" | "gantt") => void
  
  // Filters
  projectFilter: string | null
  dueDateFilter: "all" | "today" | "this-week" | "overdue"
  setProjectFilter: (projectId: string | null) => void
  setDueDateFilter: (filter: "all" | "today" | "this-week" | "overdue") => void
  
  // Grit mode
  gritMode: boolean
  setGritMode: (value: boolean) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Daily planning
      hasPlannedToday: false,
      dailyTasks: [],
      setHasPlannedToday: (value) => set({ hasPlannedToday: value }),
      setDailyTasks: (tasks) => set({ dailyTasks: tasks }),
      
      // Tasks
      tasks: initialTasks,
      updateTaskStatus: (taskId, status) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId ? { ...t, status, updatedAt: new Date().toISOString() } : t
          ),
        })),
      addTask: (task) =>
        set((state) => ({
          tasks: [...state.tasks, task],
        })),
      updateTask: (taskId, updates) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
          ),
        })),
      deleteTask: (taskId) =>
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== taskId),
        })),
      
      // View preferences
      workspaceView: "kanban",
      setWorkspaceView: (view) => set({ workspaceView: view }),
      
      // Filters
      projectFilter: null,
      dueDateFilter: "all",
      setProjectFilter: (projectId) => set({ projectFilter: projectId }),
      setDueDateFilter: (filter) => set({ dueDateFilter: filter }),
      
      // Grit mode
      gritMode: false,
      setGritMode: (value) => set({ gritMode: value }),
    }),
    {
      name: "pm-app-storage",
      partialize: (state) => ({
        hasPlannedToday: state.hasPlannedToday,
        dailyTasks: state.dailyTasks,
        workspaceView: state.workspaceView,
        gritMode: state.gritMode,
      }),
    }
  )
)
