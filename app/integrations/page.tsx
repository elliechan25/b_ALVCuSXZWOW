"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Github,
  Gitlab,
  Slack,
  Plus,
  RefreshCw,
  Check,
  X,
  Zap,
  ArrowRight,
  Trash2,
  Eye,
  EyeOff,
  Clock,
} from "lucide-react"
import { integrations, automationRules, projects } from "@/lib/data"
import { useAppStore } from "@/lib/store"
import { cn } from "@/lib/utils"

export default function IntegrationsPage() {
  const { gritMode, setGritMode } = useAppStore()
  const [showAddRule, setShowAddRule] = useState(false)
  const [showConnectGit, setShowConnectGit] = useState(false)
  const [repoUrl, setRepoUrl] = useState("")
  const [rules, setRules] = useState(automationRules)
  const [newRule, setNewRule] = useState({
    trigger: "",
    action: "",
    projectId: "",
  })

  const handleAddRule = () => {
    if (!newRule.trigger || !newRule.action) return
    setRules([
      ...rules,
      {
        id: `rule-${Date.now()}`,
        name: `${newRule.trigger} -> ${newRule.action}`,
        trigger: newRule.trigger,
        action: newRule.action,
        isActive: true,
        projectId: newRule.projectId || undefined,
      },
    ])
    setShowAddRule(false)
    setNewRule({ trigger: "", action: "", projectId: "" })
  }

  const toggleRule = (ruleId: string) => {
    setRules(rules.map((r) => (r.id === ruleId ? { ...r, isActive: !r.isActive } : r)))
  }

  const deleteRule = (ruleId: string) => {
    setRules(rules.filter((r) => r.id !== ruleId))
  }

  const getIntegrationIcon = (type: string) => {
    switch (type) {
      case "github":
        return <Github className="h-6 w-6" />
      case "gitlab":
        return <Gitlab className="h-6 w-6" />
      case "slack":
        return <Slack className="h-6 w-6" />
      default:
        return <Zap className="h-6 w-6" />
    }
  }

  return (
    <div className="p-8 pt-10 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Sync Hub</h1>
        <p className="text-muted-foreground mt-1">
          Connect your tools and automate your workflow
        </p>
      </div>

      {/* Git Sync Section */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-4">Git Sync</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {integrations.map((integration) => (
            <Card
              key={integration.id}
              className={cn(
                "border-border",
                integration.isConnected && "border-success/30 bg-success/5"
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "p-2 rounded-lg",
                        integration.isConnected
                          ? "bg-success/10 text-success"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {getIntegrationIcon(integration.type)}
                    </div>
                    <div>
                      <p className="font-semibold text-card-foreground capitalize">
                        {integration.type}
                      </p>
                      {integration.isConnected ? (
                        <div className="flex items-center gap-1 text-xs text-success">
                          <Check className="h-3 w-3" />
                          Connected
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <X className="h-3 w-3" />
                          Not connected
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    variant={integration.isConnected ? "outline" : "default"}
                    size="sm"
                    onClick={() => !integration.isConnected && setShowConnectGit(true)}
                  >
                    {integration.isConnected ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Sync
                      </>
                    ) : (
                      "Connect"
                    )}
                  </Button>
                </div>
                {integration.repoUrl && (
                  <div className="mt-3 p-2 rounded bg-secondary/30 border border-border">
                    <p className="text-xs text-muted-foreground font-mono truncate">
                      {integration.repoUrl}
                    </p>
                    {integration.lastSync && (
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Last sync: {new Date(integration.lastSync).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator className="my-8" />

      {/* Automation Rules Section */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Automation Rules</h2>
            <p className="text-sm text-muted-foreground">
              Create If-This-Then-That rules to automate your workflow
            </p>
          </div>
          <Button onClick={() => setShowAddRule(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Rule
          </Button>
        </div>

        <div className="space-y-3">
          {rules.map((rule) => (
            <Card
              key={rule.id}
              className={cn(
                "border-border",
                !rule.isActive && "opacity-50"
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Switch
                      checked={rule.isActive}
                      onCheckedChange={() => toggleRule(rule.id)}
                    />
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                        IF
                      </Badge>
                      <span className="text-sm text-card-foreground">{rule.trigger}</span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                        THEN
                      </Badge>
                      <span className="text-sm text-card-foreground">{rule.action}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {rule.projectId && (
                      <Badge variant="secondary" className="text-xs">
                        {projects.find((p) => p.id === rule.projectId)?.name}
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => deleteRule(rule.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator className="my-8" />

      {/* Grit Mode Section */}
      <section>
        <Card className="border-border bg-warning/5 border-warning/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-card-foreground">Grit Mode</CardTitle>
                <CardDescription className="mt-1">
                  Hide low priority tasks when a deadline is within 48 hours
                </CardDescription>
              </div>
              <Switch checked={gritMode} onCheckedChange={setGritMode} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border">
              {gritMode ? (
                <>
                  <EyeOff className="h-5 w-5 text-warning" />
                  <div>
                    <p className="text-sm font-medium text-card-foreground">Grit Mode Active</p>
                    <p className="text-xs text-muted-foreground">
                      Low priority tasks are hidden across all views
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <Eye className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-card-foreground">All Tasks Visible</p>
                    <p className="text-xs text-muted-foreground">
                      Showing tasks of all priority levels
                    </p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Connect Git Dialog */}
      <Dialog open={showConnectGit} onOpenChange={setShowConnectGit}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-card-foreground">Connect Repository</DialogTitle>
            <DialogDescription>
              Enter your repository URL to connect and sync commits
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Repository URL</label>
              <Input
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/user/repo"
                className="mt-1 bg-secondary/50 border-border"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowConnectGit(false)}>
                Cancel
              </Button>
              <Button onClick={() => setShowConnectGit(false)}>
                <Github className="h-4 w-4 mr-2" />
                Connect
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Rule Dialog */}
      <Dialog open={showAddRule} onOpenChange={setShowAddRule}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-card-foreground">Create Automation Rule</DialogTitle>
            <DialogDescription>
              Set up an If-This-Then-That automation
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">When this happens (Trigger)</label>
              <Select
                value={newRule.trigger}
                onValueChange={(v) => setNewRule({ ...newRule, trigger: v })}
              >
                <SelectTrigger className="mt-1 bg-secondary/50 border-border">
                  <SelectValue placeholder="Select trigger..." />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="PR is merged">PR is merged</SelectItem>
                  <SelectItem value="Issue is closed">Issue is closed</SelectItem>
                  <SelectItem value="Task marked as blocked">Task marked as blocked</SelectItem>
                  <SelectItem value="24 hours before due date">24 hours before due date</SelectItem>
                  <SelectItem value="New commit pushed">New commit pushed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Do this (Action)</label>
              <Select
                value={newRule.action}
                onValueChange={(v) => setNewRule({ ...newRule, action: v })}
              >
                <SelectTrigger className="mt-1 bg-secondary/50 border-border">
                  <SelectValue placeholder="Select action..." />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="Move linked task to Done">Move linked task to Done</SelectItem>
                  <SelectItem value="Move linked task to Review">Move linked task to Review</SelectItem>
                  <SelectItem value="Send Slack notification">Send Slack notification</SelectItem>
                  <SelectItem value="Notify project lead">Notify project lead</SelectItem>
                  <SelectItem value="Add comment to task">Add comment to task</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">For Project (Optional)</label>
              <Select
                value={newRule.projectId}
                onValueChange={(v) => setNewRule({ ...newRule, projectId: v })}
              >
                <SelectTrigger className="mt-1 bg-secondary/50 border-border">
                  <SelectValue placeholder="All projects" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="">All projects</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: project.color }}
                        />
                        {project.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowAddRule(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddRule}>
                <Zap className="h-4 w-4 mr-2" />
                Create Rule
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
