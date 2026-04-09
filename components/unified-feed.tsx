"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, RefreshCw, Pin } from "lucide-react"
import type { Comment } from "@/lib/types"
import { projects } from "@/lib/data"

interface UnifiedFeedProps {
  comments: Comment[]
}

export function UnifiedFeed({ comments }: UnifiedFeedProps) {
  const getProjectColor = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId)
    return project?.color || "#888"
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor(diff / (1000 * 60))

    if (hours > 24) {
      return date.toLocaleDateString()
    } else if (hours > 0) {
      return `${hours}h ago`
    } else if (minutes > 0) {
      return `${minutes}m ago`
    } else {
      return "Just now"
    }
  }

  return (
    <div className="h-full min-h-0 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="font-semibold text-card-foreground">Activity Feed</h3>
        <Badge variant="secondary" className="bg-primary/10 text-primary border-0">
          {comments.length}
        </Badge>
      </div>
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-4 space-y-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="flex gap-3 p-3 rounded-lg bg-secondary/30 border border-border hover:border-primary/20 transition-colors"
            >
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
                <AvatarFallback className="bg-primary/20 text-primary text-xs">
                  {comment.author.name.split(" ").map((n) => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm text-card-foreground">
                    {comment.author.name}
                  </span>
                  <span className="text-xs text-muted-foreground" suppressHydrationWarning>
                    {formatTime(comment.createdAt)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  {comment.type === "comment" ? (
                    <MessageSquare className="h-3 w-3 text-muted-foreground" />
                  ) : (
                    <RefreshCw className="h-3 w-3 text-muted-foreground" />
                  )}
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {comment.content}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 mt-2">
                  <Pin className="h-3 w-3 text-muted-foreground" />
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: getProjectColor(comment.projectId) }}
                  />
                  <span className="text-xs text-muted-foreground">{comment.projectName}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
