"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Mail, Send, Inbox, Users, BarChart3, Settings, Search, Reply, Archive, Trash2 } from "lucide-react"
import { NotificationBell } from "@/components/email/notification-bell"
import { useToast } from "@/hooks/use-toast"

interface EmailInquiry {
  id: string
  sender_email: string
  sender_name: string
  subject: string
  content: string
  category: string
  priority: "low" | "medium" | "high" | "urgent"
  status: "new" | "in_progress" | "resolved" | "archived"
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
  created_at: string
}

interface EmailStats {
  total_sent: number
  total_received: number
  pending_inquiries: number
  response_rate: number
  avg_response_time: number
}

export default function EmailManagementPage() {
  const [inquiries, setInquiries] = useState<EmailInquiry[]>([])
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [stats, setStats] = useState<EmailStats | null>(null)
  const [selectedInquiry, setSelectedInquiry] = useState<EmailInquiry | null>(null)
  const [replyContent, setReplyContent] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterPriority, setFilterPriority] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)

      // Fetch inquiries
      const inquiriesRes = await fetch("/api/email/inquiries")
      const inquiriesData = await inquiriesRes.json()
      setInquiries(inquiriesData.inquiries || [])

      // Fetch templates
      const templatesRes = await fetch("/api/email/templates")
      const templatesData = await templatesRes.json()
      setTemplates(templatesData.templates || [])

      // Calculate stats
      const totalSent = inquiriesData.inquiries?.filter((i: EmailInquiry) => i.status === "resolved").length || 0
      const totalReceived = inquiriesData.inquiries?.length || 0
      const pendingInquiries = inquiriesData.inquiries?.filter((i: EmailInquiry) => i.status === "new").length || 0

      setStats({
        total_sent: totalSent,
        total_received: totalReceived,
        pending_inquiries: pendingInquiries,
        response_rate: totalReceived > 0 ? (totalSent / totalReceived) * 100 : 0,
        avg_response_time: 2.5, // Mock data
      })
    } catch (error) {
      console.error("Error fetching email data:", error)
      toast({
        title: "Error",
        description: "Failed to load email data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleReply = async (inquiryId: string) => {
    if (!replyContent.trim()) return

    try {
      const response = await fetch(`/api/email/inquiries/${inquiryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "in_progress",
          reply_content: replyContent,
        }),
      })

      if (response.ok) {
        toast({
          title: "Reply Sent",
          description: "Your reply has been sent successfully",
        })
        setReplyContent("")
        setSelectedInquiry(null)
        fetchData()
      }
    } catch (error) {
      console.error("Error sending reply:", error)
      toast({
        title: "Error",
        description: "Failed to send reply",
        variant: "destructive",
      })
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
        toast({
          title: "Status Updated",
          description: `Inquiry marked as ${status}`,
        })
        fetchData()
      }
    } catch (error) {
      console.error("Error updating status:", error)
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      })
    }
  }

  const filteredInquiries = inquiries.filter((inquiry) => {
    const matchesSearch =
      inquiry.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.sender_email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || inquiry.status === filterStatus
    const matchesPriority = filterPriority === "all" || inquiry.priority === filterPriority

    return matchesSearch && matchesStatus && matchesPriority
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
      case "archived":
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
          <p className="text-muted-foreground">Manage all email communications and templates</p>
        </div>
        <NotificationBell />
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
              <Send className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_sent}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Received</CardTitle>
              <Inbox className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_received}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending_inquiries}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.response_rate.toFixed(1)}%</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Response</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avg_response_time}h</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="inquiries" className="space-y-4">
        <TabsList>
          <TabsTrigger value="inquiries">Email Inquiries</TabsTrigger>
          <TabsTrigger value="templates">Email Templates</TabsTrigger>
          <TabsTrigger value="compose">Compose Email</TabsTrigger>
        </TabsList>

        <TabsContent value="inquiries" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search inquiries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Inquiries List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Inquiries ({filteredInquiries.length})</h3>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {filteredInquiries.map((inquiry) => (
                  <Card
                    key={inquiry.id}
                    className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                      selectedInquiry?.id === inquiry.id ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => setSelectedInquiry(inquiry)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{inquiry.subject}</p>
                          <p className="text-sm text-muted-foreground truncate">
                            From: {inquiry.sender_name || inquiry.sender_email}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1 ml-2">
                          <Badge className={`${getPriorityColor(inquiry.priority)} text-white text-xs`}>
                            {inquiry.priority}
                          </Badge>
                          <Badge className={`${getStatusColor(inquiry.status)} text-white text-xs`}>
                            {inquiry.status}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{inquiry.content}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(inquiry.created_at).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Inquiry Detail */}
            <div>
              {selectedInquiry ? (
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{selectedInquiry.subject}</CardTitle>
                        <CardDescription>
                          From: {selectedInquiry.sender_name || selectedInquiry.sender_email}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateInquiryStatus(selectedInquiry.id, "resolved")}
                        >
                          <Archive className="h-4 w-4 mr-1" />
                          Resolve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateInquiryStatus(selectedInquiry.id, "archived")}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Archive
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Message Content</h4>
                      <div className="bg-muted p-3 rounded-md">
                        <p className="text-sm whitespace-pre-wrap">{selectedInquiry.content}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Reply</h4>
                      <Textarea
                        placeholder="Type your reply..."
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        rows={4}
                      />
                      <Button
                        className="mt-2"
                        onClick={() => handleReply(selectedInquiry.id)}
                        disabled={!replyContent.trim()}
                      >
                        <Reply className="h-4 w-4 mr-2" />
                        Send Reply
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Select an inquiry to view details</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Email Templates ({templates.length})</h3>
            <Button>Create Template</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <CardTitle className="text-base">{template.name}</CardTitle>
                  <CardDescription>{template.subject}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-3">{template.content}</p>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">{template.category}</Badge>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        Edit
                      </Button>
                      <Button size="sm">Use</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="compose" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compose New Email</CardTitle>
              <CardDescription>Send a new email or use a template</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">To</label>
                  <Input placeholder="recipient@example.com" />
                </div>
                <div>
                  <label className="text-sm font-medium">Template</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose template (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Subject</label>
                <Input placeholder="Email subject" />
              </div>

              <div>
                <label className="text-sm font-medium">Message</label>
                <Textarea placeholder="Type your message..." rows={8} />
              </div>

              <div className="flex gap-2">
                <Button>
                  <Send className="h-4 w-4 mr-2" />
                  Send Email
                </Button>
                <Button variant="outline">Save Draft</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
