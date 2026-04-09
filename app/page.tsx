"use client"

import { useState, useEffect } from "react"
import { FocusZone } from "@/components/focus-zone"
import { ProjectSnapshot } from "@/components/project-snapshot"
import { UnifiedFeed } from "@/components/unified-feed"
import { PlanningModal } from "@/components/planning-modal"
import { useAppStore } from "@/lib/store"
import { projects, comments, currentUser, getSuggestedTasks } from "@/lib/data"

export default function HomePage() {
  const { hasPlannedToday, setHasPlannedToday, dailyTasks, setDailyTasks } = useAppStore()
  const [showPlanningModal, setShowPlanningModal] = useState(false)
  const suggestedTasks = getSuggestedTasks()

  useEffect(() => {
    // Check if this is a new day
    const lastPlanDate = localStorage.getItem("lastPlanDate")
    const today = new Date().toDateString()
    
    if (lastPlanDate !== today) {
      // Reset planning state for new day
      setHasPlannedToday(false)
      setDailyTasks([])
    }
    
    // Show planning modal if not planned today
    if (!hasPlannedToday) {
      const timer = setTimeout(() => {
        setShowPlanningModal(true)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [hasPlannedToday, setHasPlannedToday, setDailyTasks])

  const handlePlanningComplete = (selectedTasks: typeof suggestedTasks) => {
    setDailyTasks(selectedTasks)
    setHasPlannedToday(true)
    setShowPlanningModal(false)
    localStorage.setItem("lastPlanDate", new Date().toDateString())
  }

  const handleEditTasks = () => {
    setShowPlanningModal(true)
  }

  const displayTasks = hasPlannedToday ? dailyTasks : suggestedTasks

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 overflow-auto p-8 pt-10">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">
              Welcome back, {currentUser.name.split(" ")[0]}
            </h1>
            <p className="text-muted-foreground mt-1" suppressHydrationWarning>
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          {/* Focus Zone */}
          <div className="mb-6">
            <FocusZone tasks={displayTasks} onEditTasks={handleEditTasks} />
          </div>

          {/* Project Snapshots */}
          <div>
            <ProjectSnapshot projects={projects} />
          </div>
        </div>
      </div>

      {/* Sidebar - Unified Feed */}
      <aside className="w-80 border-l border-border bg-card hidden lg:flex lg:flex-col pt-10 min-h-0 overflow-hidden">
        <UnifiedFeed comments={comments} />
      </aside>

      {/* Planning Modal */}
      <PlanningModal
        open={showPlanningModal}
        onComplete={handlePlanningComplete}
        suggestedTasks={suggestedTasks}
        userName={currentUser.name}
        onClose={() => setShowPlanningModal(false)}
      />
    </div>
  )
}
