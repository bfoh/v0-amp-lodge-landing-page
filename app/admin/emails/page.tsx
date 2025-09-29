"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Mail, Send, Eye, Search, BarChart3, Settings } from "lucide-react"
import { NotificationBell } from "@/components/email/notification-bell"

interface EmailInquiry {
  id: string
  from_email: string
  subject: string
  content: string
  category: string
  priority: "low" | "medium" | "high" | "urgent"
  status: "new" | "in_progress" | "resolved" | "closed"
  created_at: string
  updated_at: string
}

interface EmailTemplate {
  id: string
  name: string
  subject: string
  content: string
  variables: string[]
  category: string
  is_active: boolean
}

interface EmailLog {
  id: string
  to_email: string
  subject: string
  status: "sent" | "delivered" | "bounced" | "failed"
  template_name?: string
  sent_at: string
  error_message?: string
}

export default function EmailManagementPage() {
  const [inquiries, setInquiries] = useState<EmailInquiry[]>([])
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [logs, setLogs] = useState<EmailLog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedInquiry, setSelectedInquiry] = useState<EmailInquiry | null>(null)
  const [replyContent, setReplyContent] = useState("")

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [inquiriesRes, templatesRes, logsRes] = await Promise.all([
        fetch("/api/email/inquiries"),
        fetch("/api/email/templates"),
        fetch("/api/email/logs"),
      ])

      const [inquiriesData, templatesData, logsData] = await Promise.all([
        inquiriesRes.json(),
        templatesRes.json(),
        logsRes.json(),
      ])

      setInquiries(inquiriesData)
      setTemplates(templatesData)
      setLogs(logsData)
    } catch (error) {
      console.error("Failed to fetch email data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleReply = async (inquiryId: string) => {
    if (!selectedInquiry || !replyContent.trim()) return

    try {
      const response = await fetch(`/api/email/inquiries/${inquiryId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: replyContent }),
      })

      if (response.ok) {
        setReplyContent("")
        setSelectedInquiry(null)
        fetchData()
      }
    } catch (error) {
      console.error("Failed to send reply:", error)
    }
  }

  const updateInquiryStatus = async (inquiryId: string, status: string) => {
    try {
      const response = await fetch(`/api/email/inquiries/${inquiryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        fetchData()
      }
    } catch (error) {
      console.error("Failed to update inquiry status:", error)
    }
  }

  const filteredInquiries = inquiries.filter((inquiry) => {
    const matchesSearch =
      inquiry.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.from_email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || inquiry.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-500"
      case "high":
        return "bg-orange-500"
      case "medium":
        return "bg-yellow-500"
      case "low":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-500"
      case "in_progress":
        return "bg-yellow-500"
      case "resolved":
        return "bg-green-500"
      case "closed":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Email Management</h1>
          <p className="text-muted-foreground">Manage inquiries, templates, and email communications</p>
        </div>
        <NotificationBell />
      </div>

      <Tabs defaultValue="inquiries" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="inquiries" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Inquiries
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Email Logs
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inquiries" className="space-y-6">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search inquiries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4">
            {filteredInquiries.map((inquiry) => (
              <Card key={inquiry.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge className={getPriorityColor(inquiry.priority)}>{inquiry.priority}</Badge>
                      <Badge variant="outline" className={getStatusColor(inquiry.status)}>
                        {inquiry.status}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{inquiry.category}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setSelectedInquiry(inquiry)}>
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Select
                        value={inquiry.status}
                        onValueChange={(status) => updateInquiryStatus(inquiry.id, status)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <CardTitle className="text-lg">{inquiry.subject}</CardTitle>
                  <CardDescription>
                    From: {inquiry.from_email} • {new Date(inquiry.created_at).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">{inquiry.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Email Templates</h2>
            <Button>
              <Settings className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </div>

          <div className="grid gap-4">
            {templates.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{template.name}</CardTitle>
                    <div className="flex gap-2">
                      <Badge variant={template.is_active ? "default" : "secondary"}>
                        {template.is_active ? "Active" : "Inactive"}
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>
                  <CardDescription>
                    Category: {template.category} • Variables: {template.variables.join(", ")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-medium mb-2">Subject: {template.subject}</p>
                  <p className="text-sm text-muted-foreground line-clamp-3">{template.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          <h2 className="text-2xl font-semibold">Email Delivery Logs</h2>

          <div className="grid gap-4">
            {logs.map((log) => (
              <Card key={log.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{log.subject}</p>
                      <p className="text-sm text-muted-foreground">
                        To: {log.to_email} • {new Date(log.sent_at).toLocaleString()}
                      </p>
                      {log.template_name && (
                        <p className="text-sm text-muted-foreground">Template: {log.template_name}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={
                          log.status === "delivered" ? "default" : log.status === "sent" ? "secondary" : "destructive"
                        }
                      >
                        {log.status}
                      </Badge>
                      {log.error_message && <p className="text-sm text-red-500 mt-1">{log.error_message}</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <h2 className="text-2xl font-semibold">Email Analytics</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Total Inquiries</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{inquiries.length}</p>
                <p className="text-sm text-muted-foreground">
                  {inquiries.filter((i) => i.status === "new").length} new
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Emails Sent</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{logs.length}</p>
                <p className="text-sm text-muted-foreground">
                  {logs.filter((l) => l.status === "delivered").length} delivered
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Active Templates</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{templates.filter((t) => t.is_active).length}</p>
                <p className="text-sm text-muted-foreground">{templates.length} total</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Reply Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Reply to Inquiry</CardTitle>
              <CardDescription>
                From: {selectedInquiry.from_email} • Subject: {selectedInquiry.subject}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Original Message:</h4>
                <div className="bg-muted p-3 rounded-md">
                  <p className="text-sm">{selectedInquiry.content}</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Your Reply:</h4>
                <Textarea
                  placeholder="Type your reply..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  rows={6}
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedInquiry(null)
                    setReplyContent("")
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={() => handleReply(selectedInquiry.id)}>
                  <Send className="h-4 w-4 mr-2" />
                  Send Reply
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
