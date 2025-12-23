import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { 
  Ticket, 
  MessageSquare, 
  Mail, 
  Clock, 
  CheckCircle,
  AlertCircle,
  User,
  Search,
  Send,
  Eye,
  Edit,
  Trash2,
  Filter,
  Users,
  RefreshCw
} from "lucide-react";
import "./SupportPanel.css";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function SupportPanel() {
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [userTypeFilter, setUserTypeFilter] = useState("all");
  const [chatSearchQuery, setChatSearchQuery] = useState("");
  const [chatStatusFilter, setChatStatusFilter] = useState("all");
  const [staffSearchQuery, setStaffSearchQuery] = useState("");
  const [isCreateTicketOpen, setIsCreateTicketOpen] = useState(false);
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [isLiveChatOpen, setIsLiveChatOpen] = useState(false);
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [newTicket, setNewTicket] = useState({
    subject: "",
    description: "",
    priority: "medium",
    userEmail: ""
  });
  const [emailData, setEmailData] = useState({
    to: "",
    subject: "",
    message: ""
  });
  const [newStaff, setNewStaff] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: ""
  });
  const [users, setUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [userError, setUserError] = useState(null);
  const [groupedUsers, setGroupedUsers] = useState({});
  const [scheduledMeetings, setScheduledMeetings] = useState([]);
  const [loadingMeetings, setLoadingMeetings] = useState(false);

  const fetchUsers = async () => {
  setIsLoadingUsers(true);
  setUserError(null);
  try {
    const response = await axios.get(`${API_URL}/api/admin/user`);
    setGroupedUsers(response.data);
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message;
    setUserError(errorMessage);
    toast({
      title: "Error",
      description: `Failed to fetch staff: ${errorMessage}`,
      variant: "destructive",
    });
  } finally {
    setIsLoadingUsers(false);
  }
};

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchScheduledMeetings = async () => {
      setLoadingMeetings(true);
      try {
        const res = await axios.get(`${API_URL}/api/interviews/scheduled`);
        if (res.data && res.data.success) {
          setScheduledMeetings(res.data.interviews);
        } else {
          setScheduledMeetings([]);
        }
      } catch (err) {
        setScheduledMeetings([]);
        toast({
          title: "Error",
          description: "Failed to fetch scheduled meetings",
          variant: "destructive",
        });
      } finally {
        setLoadingMeetings(false);
      }
    };
    fetchScheduledMeetings();
  }, []);

  const supportStats = [
    {
      title: "Open Tickets",
      value: "24",
      change: "+3",
      icon: Ticket,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
    {
      title: "In Progress",
      value: "18",
      change: "+5",
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      title: "Resolved Today",
      value: "42",
      change: "+15",
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Avg Response Time",
      value: "2.4h",
      change: "-0.3h",
      icon: MessageSquare,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
  ];

 // REMOVE the dummy array, keep only the state:
const [supportTickets, setSupportTickets] = useState([]);

 const filteredTickets = supportTickets.filter((ticket) => {
  const matchesSearch = (ticket.subject || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                       (ticket.email || ticket.user || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                       (ticket.id || ticket._id || "").toLowerCase().includes(searchQuery.toLowerCase());
  const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
  const matchesPriority = priorityFilter === "all" || ticket.priority === priorityFilter;
  const matchesUserType = userTypeFilter === "all" || (ticket.userType || "").toLowerCase() === userTypeFilter.toLowerCase();
  return matchesSearch && matchesStatus && matchesPriority && matchesUserType;
});

  const filteredStaff = users.filter((user) => {
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    return fullName.includes(staffSearchQuery.toLowerCase()) ||
           user.email.toLowerCase().includes(staffSearchQuery.toLowerCase());
  });

  const clearAllFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setPriorityFilter("all");
    setUserTypeFilter("all");
    setChatSearchQuery("");
    setChatStatusFilter("all");
    setStaffSearchQuery("");
    toast({
      title: "Filters Cleared",
      description: "All search and filter criteria have been reset",
    });
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case "high":
        return <Badge className="priority-badge priority-high">High</Badge>;
      case "medium":
        return <Badge className="priority-badge priority-medium">Medium</Badge>;
      case "low":
        return <Badge className="priority-badge priority-low">Low</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "open":
        return <Badge className="status-badge status-open">Open</Badge>;
      case "in_progress":
        return <Badge className="status-badge status-progress">In Progress</Badge>;
      case "resolved":
        return <Badge className="status-badge status-resolved">Resolved</Badge>;
      case "closed":
        return <Badge variant="secondary">Closed</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getChatStatusBadge = (status) => {
    switch (status) {
      case "active":
        return <Badge className="chat-badge chat-active">Active</Badge>;
      case "waiting":
        return <Badge className="chat-badge chat-waiting">Waiting</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

const [isLoadingTickets, setIsLoadingTickets] = useState(false);
const [ticketError, setTicketError] = useState(null);

const fetchSupportTickets = async () => {
  setIsLoadingTickets(true);
  setTicketError(null);
  try {
    const token = localStorage.getItem("token");
    const res = await axios.get(
      `${API_URL}/api/admin/allsupport-tickets`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // Adjust this line based on actual response structure
    setSupportTickets(res.data.data || []);
  } catch (error) {
    setTicketError(error.response?.data?.message || error.message);
    toast({
      title: "Error",
      description: `Failed to fetch support tickets: ${error.response?.data?.message || error.message}`,
      variant: "destructive",
    });
  } finally {
    setIsLoadingTickets(false);
  }
};

useEffect(() => {
  fetchSupportTickets();
}, []);

  const handleCreateTicket = () => {
    if (!newTicket.userEmail || !newTicket.subject || !newTicket.description) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    console.log("Creating ticket:", newTicket);
    toast({
      title: "Ticket Created",
      description: `Ticket created successfully for ${newTicket.userEmail}`,
    });
    setNewTicket({ subject: "", description: "", priority: "medium", userEmail: "" });
    setIsCreateTicketOpen(false);
  };

  const handleSendEmail = async () => {
    if (!emailData.to || !emailData.subject || !emailData.message) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    try {
      const response = await axios.post(`${API_URL}/api/support/email`, emailData);
      if (response.data.success) {
        toast({
          title: "Email Sent",
          description: `Email sent successfully to ${emailData.to}`,
        });
        setEmailData({ to: "", subject: "", message: "" });
        setIsEmailDialogOpen(false);
      } else {
        toast({
          title: "Error",
          description: response.data.message || "Failed to send email",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || error.message || "Failed to send email",
        variant: "destructive",
      });
    }
  };

  const handleJoinChat = (chatId) => {
    console.log("Joining chat:", chatId);
    toast({
      title: "Joined Chat",
      description: `Connected to chat session #${chatId}`,
    });
  };

  const handleLiveChat = () => {
    setIsLiveChatOpen(true);
  };

  const handleViewTicket = (ticket) => {
    setSelectedTicket(ticket);
  };

  const handleUpdateTicketStatus = (ticketId, newStatus) => {
    console.log("Updating ticket status:", ticketId, newStatus);
    toast({
      title: "Status Updated",
      description: `Ticket ${ticketId} status changed to ${newStatus}`,
    });
  };

  const handleDeleteTicket = (ticketId) => {
    console.log("Deleting ticket:", ticketId);
    toast({
      title: "Ticket Deleted",
      description: `Ticket ${ticketId} has been deleted`,
      variant: "destructive"
    });
  };

  const handleSystemAlert = () => {
    console.log("Creating system alert");
    toast({
      title: "System Alert",
      description: "System alert broadcast to all users",
    });
  };

  const handleAddStaff = async () => {
    const { firstName, lastName, email, password } = newStaff;
    if (!firstName || !lastName || !email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }
    if (password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }
    try {
      const response = await axios.post(`${API_URL}/api/signup`, newStaff);
      toast({
        title: "Staff Added",
        description: `Staff member ${firstName} ${lastName} added successfully`,
      });
      setNewStaff({ firstName: "", lastName: "", email: "", password: "" });
      setIsAddStaffOpen(false);
      fetchUsers(); // Refresh staff list
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to add staff: ${error.response?.data?.message || error.message}`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="support-panel">
      <div className="support-header">
        <div className="header-content">
          <h1 className="main-title">Support Panel</h1>
          <p className="subtitle">Manage user support and assistance</p>
        </div>
        <div className="header-actions">
          <Button variant="outline" onClick={clearAllFilters} className="action-btn">
            <Filter className="w-4 h-4 mr-2" />
            Clear Filters
          </Button>
          <Button className="primary-btn" onClick={handleLiveChat}>
            <MessageSquare className="w-4 h-4 mr-2" />
            Schedule Meeting
          </Button>
        </div>
      </div>

      <div className="stats-grid">
        {supportStats.map((stat) => (
          <Card key={stat.title} className="stat-card">
            <CardContent className="stat-content">
              <div className="stat-info">
                <div className="stat-text">
                  <p className="stat-label">{stat.title}</p>
                  <p className="stat-value">{stat.value}</p>
                  <p className="stat-change">{stat.change} from yesterday</p>
                </div>
                <div className={`stat-icon ${stat.bgColor}`}>
                  <stat.icon className={`icon ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="main-content">
        <div className="content-left">
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle>Support Dashboard</CardTitle>
              <CardDescription>Manage tickets, live support, emails, and staff</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="tickets" className="dashboard-tabs">
                <TabsList className="tabs-list">
                  <TabsTrigger value="tickets" className="tab-trigger">
                    <Ticket className="w-4 h-4" />
                    <span>Tickets</span>
                  </TabsTrigger>
                  <TabsTrigger value="live-chat" className="tab-trigger">
                    <MessageSquare className="w-4 h-4" />
                    <span>Live Chat</span>
                  </TabsTrigger>
                  <TabsTrigger value="email" className="tab-trigger">
                    <Mail className="w-4 h-4" />
                    <span>Email</span>
                  </TabsTrigger>
                  <TabsTrigger value="staff" className="tab-trigger">
                    <Users className="w-4 h-4" />
                    <span>Staff</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="tickets" className="tickets-content">
                  <div className="filters-section">
                    <div className="search-box">
                      <div className="search-input">
                        <Search className="search-icon" />
                        <Input 
                          placeholder="Search tickets by ID, user, or subject..." 
                          className="search-field" 
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="filter-row">
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="filter-select">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                        <SelectTrigger className="filter-select">
                          <SelectValue placeholder="Priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Priority</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select value={userTypeFilter} onValueChange={setUserTypeFilter}>
                        <SelectTrigger className="filter-select">
                          <SelectValue placeholder="User Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="Student">Student</SelectItem>
                          <SelectItem value="Company">Company</SelectItem>
                          <SelectItem value="College">College</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="filter-info">
                      <p className="result-count">
                        Showing {filteredTickets.length} of {supportTickets.length} tickets
                      </p>
                      {(searchQuery || statusFilter !== "all" || priorityFilter !== "all" || userTypeFilter !== "all") && (
                        <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                          Clear all filters
                        </Button>
                      )}
                    </div>
                  </div>

                  <Table className="tickets-table">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ticket ID</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Updated</TableHead>
                        {/* <TableHead>Actions</TableHead> */}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTickets.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="empty-state">
                            <div className="empty-content">
                              <Search className="empty-icon" />
                              <p className="empty-text">No tickets found matching your criteria</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredTickets.map((ticket) => (
                          <TableRow key={ticket.ticketId} className="ticket-row">
                            <TableCell className="ticket-id">{ticket.ticketId}</TableCell>
                            <TableCell>
                              <div className="user-cell">
                                <p className="user-email">{ticket.user}</p>
                                <p className="user-type">{ticket.userType}</p>
                              </div>
                            </TableCell>
                            <TableCell>{ticket.subject}</TableCell>
                            <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                            <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                            <TableCell>{ticket.updated}</TableCell>
                            <TableCell>
                              {/* <div className="action-buttons">
                                <Button size="sm" variant="outline" onClick={() => handleViewTicket(ticket)}>
                                  <Eye className="w-3 h-3" />
                                </Button>
                                <Select onValueChange={(value) => handleUpdateTicketStatus(ticket.id, value)}>
                                  <SelectTrigger className="action-select">
                                    <Edit className="w-3 h-3" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="open">Open</SelectItem>
                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                    <SelectItem value="resolved">Resolved</SelectItem>
                                    <SelectItem value="closed">Closed</SelectItem>
                                  </SelectContent>
                                </Select>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button size="sm" variant="outline">
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Ticket</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete ticket {ticket.id}? This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDeleteTicket(ticket.id)}>
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div> */}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TabsContent>

                <TabsContent value="live-chat" className="chat-content">
                  <div className="scheduled-meetings-section" style={{ marginBottom: 24 }}>
                    <h3 className="chat-title">Scheduled Meetings</h3>
                    {loadingMeetings ? (
                      <div className="empty-state"><p>Loading meetings...</p></div>
                    ) : scheduledMeetings.length === 0 ? (
                      <div className="empty-state"><p>No scheduled meetings found.</p></div>
                    ) : (
                      scheduledMeetings.map((meeting) => (
                        <div key={meeting._id} className="chat-item meeting-item" style={{ border: '1px solid #eee', borderRadius: 8, padding: 12, marginBottom: 12 }}>
                          <div><strong>Interviewer:</strong> {meeting.interviewer?.firstName} {meeting.interviewer?.lastName} ({meeting.interviewer?.email})</div>
                          <div><strong>Interviewee:</strong> {meeting.interviewee?.firstName} {meeting.interviewee?.lastName} ({meeting.interviewee?.email})</div>
                          <div><strong>Date:</strong> {meeting.date ? new Date(meeting.date).toLocaleString() : 'N/A'}</div>
                          {meeting.link ? (
                            <Button asChild style={{ marginTop: 8 }}>
                              <a href={meeting.link} target="_blank" rel="noopener noreferrer">Join Meeting</a>
                            </Button>
                          ) : (
                            <span style={{ color: '#888', marginTop: 8, display: 'inline-block' }}>No meeting link</span>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                  <div className="chat-filters">
                    <div className="chat-search">
                      <div className="search-input">
                        <Search className="search-icon" />
                        <Input 
                          placeholder="Search chats by user, issue, or type..." 
                          className="search-field" 
                          value={chatSearchQuery}
                          onChange={(e) => setChatSearchQuery(e.target.value)}
                        />
                      </div>
                      <Select value={chatStatusFilter} onValueChange={setChatStatusFilter}>
                        <SelectTrigger className="filter-select">
                          <SelectValue placeholder="Chat Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="waiting">Waiting</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="chat-info">
                      <p className="result-count">
                        {/* {filteredChats.length} active chat sessions */}
                        0 active chat sessions
                      </p>
                      {(chatSearchQuery || chatStatusFilter !== "all") && (
                        <Button variant="ghost" size="sm" onClick={() => {
                          setChatSearchQuery("");
                          setChatStatusFilter("all");
                        }}>
                          Clear filters
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="chat-list">
                    <h3 className="chat-title">Active Chats</h3>
                    {/* {filteredChats.length === 0 ? (
                      <div className="empty-state">
                        <div className="empty-content">
                          <MessageSquare className="empty-icon" />
                          <p className="empty-text">No active chats found matching your criteria</p>
                        </div>
                      </div>
                    ) : (
                      filteredChats.map((chat) => (
                        <div key={chat.id} className="chat-item">
                          <div className="chat-details">
                            <div className="chat-user">
                              <User className="user-icon" />
                              <div className="user-info">
                                <p className="user-email">{chat.user}</p>
                                <p className="user-meta">{chat.userType} • {chat.issue}</p>
                              </div>
                            </div>
                            <div className="chat-actions">
                              {getChatStatusBadge(chat.status)}
                              <span className="chat-duration">{chat.duration}</span>
                              <Button size="sm" onClick={() => handleJoinChat(chat.id)}>Join</Button>
                            </div>
                          </div>
                        </div>
                      ))
                    } */}
                    <div className="empty-state">
                      <div className="empty-content">
                        <MessageSquare className="empty-icon" />
                        <p className="empty-text">No active chats found matching your criteria</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="email" className="email-content">
                  <div className="email-center">
                    <Mail className="email-icon" />
                    <h3 className="email-title">Email Support</h3>
                    <p className="email-description">Send support emails directly to users</p>
                    <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="compose-btn">
                          <Send className="w-4 h-4 mr-2" />
                          Compose Email
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="email-dialog">
                        <DialogHeader>
                          <DialogTitle>Compose Email</DialogTitle>
                          <DialogDescription>Send an email to users or support team</DialogDescription>
                        </DialogHeader>
                        <div className="email-form">
                          <div className="form-field">
                            <Label htmlFor="email-to">To</Label>
                            <Input
                              id="email-to"
                              placeholder="user@example.com"
                              value={emailData.to}
                              onChange={(e) => setEmailData({...emailData, to: e.target.value})}
                            />
                          </div>
                          <div className="form-field">
                            <Label htmlFor="email-subject">Subject</Label>
                            <Input
                              id="email-subject"
                              placeholder="Email subject"
                              value={emailData.subject}
                              onChange={(e) => setEmailData({...emailData, subject: e.target.value})}
                            />
                          </div>
                          <div className="form-field">
                            <Label htmlFor="email-message">Message</Label>
                            <Textarea
                              id="email-message"
                              placeholder="Type your message here"
                              value={emailData.message}
                              onChange={(e) => setEmailData({...emailData, message: e.target.value})}
                              rows={5}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsEmailDialogOpen(false)}>Cancel</Button>
                          <Button onClick={handleSendEmail}>Send Email</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </TabsContent>

                <TabsContent value="staff" className="staff-content">
                  <div className="filters-section">
                    <div className="search-box">
                      <div className="search-input">
                        <Search className="search-icon" />
                        <Input 
                          placeholder="Search staff by name or email..." 
                          className="search-field" 
                          value={staffSearchQuery}
                          onChange={(e) => setStaffSearchQuery(e.target.value)}
                        />
                      </div>
                      <Button variant="ghost" size="sm" onClick={fetchUsers} disabled={isLoadingUsers}>
                        <RefreshCw className={`w-4 h-4 mr-2 ${isLoadingUsers ? 'animate-spin' : ''}`} />
                        Refresh
                      </Button>
                    </div>
                    <div className="filter-info">
                      <p className="result-count">
                        Showing {filteredStaff.length} of {users.length} staff members
                      </p>
                      {staffSearchQuery && (
                        <Button variant="ghost" size="sm" onClick={() => setStaffSearchQuery("")}>
                          Clear search
                        </Button>
                      )}
                    </div>
                  </div>

                  <Table className="staff-table">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Sales ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Joined Date</TableHead>
                        <TableHead>Students</TableHead>
                        <TableHead>Colleges</TableHead>
                        <TableHead>Companies</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoadingUsers ? (
                        <TableRow>
                          <TableCell colSpan={7} className="empty-state">
                            <p>Loading staff...</p>
                          </TableCell>
                        </TableRow>
                      ) : userError ? (
                        <TableRow>
                          <TableCell colSpan={7} className="empty-state">
                            <p className="error-text">Error: {userError}</p>
                          </TableCell>
                        </TableRow>
                      ) : Object.keys(groupedUsers).length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="empty-state">
                            <div className="empty-content">
                              <Users className="empty-icon" />
                              <p className="empty-text">No staff found matching your criteria</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        Object.entries(groupedUsers).map(([salesId, group]) => {
                          const usersArr = Array.isArray(group.users) ? group.users : [];
                          // If no users, still show a row for the salesId
                          if (usersArr.length === 0) {
                            return (
                              <TableRow key={salesId}>
                                <TableCell>{salesId}</TableCell>
                                <TableCell colSpan={3}>No staff found</TableCell>
                                <TableCell>{group.studentCount || 0}</TableCell>
                                <TableCell>{group.collegeCount || 0}</TableCell>
                                <TableCell>{group.companyCount || 0}</TableCell>
                              </TableRow>
                            );
                          }
                          return usersArr.map((user, idx) => (
                            <TableRow key={user._id}>
                              {idx === 0 && (
                                <TableCell rowSpan={usersArr.length}>{salesId}</TableCell>
                              )}
                              <TableCell>{user.firstName} {user.lastName}</TableCell>
                              <TableCell>{user.email}</TableCell>
                              <TableCell>{user.date ? new Date(user.date).toLocaleString() : ""}</TableCell>
                              {idx === 0 && (
                                <>
                                  <TableCell rowSpan={usersArr.length}>{group.studentCount || 0}</TableCell>
                                  <TableCell rowSpan={usersArr.length}>{group.collegeCount || 0}</TableCell>
                                  <TableCell rowSpan={usersArr.length}>{group.companyCount || 0}</TableCell>
                                </>
                              )}
                            </TableRow>
                          ));
                        })
                      )}
                    </TableBody>
                  </Table>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="sidebar">
          <Card className="quick-actions-card">
            <CardHeader>
              <CardTitle className="card-title">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="quick-actions">
              <Dialog open={isCreateTicketOpen} onOpenChange={setIsCreateTicketOpen}>
                <DialogTrigger asChild>
                  {/* <Button variant="outline" className="action-button">
                    <Ticket className="w-4 h-4 mr-2" />
                    Create New Ticket
                  </Button> */}
                </DialogTrigger>
                <DialogContent className="ticket-dialog">
                  <DialogHeader>
                    <DialogTitle>Create New Ticket</DialogTitle>
                    <DialogDescription>Create a support ticket for a user</DialogDescription>
                  </DialogHeader>
                  <div className="ticket-form">
                    <div className="form-field">
                      <Label htmlFor="user-email">User Email</Label>
                      <Input
                        id="user-email"
                        placeholder="user@example.com"
                        value={newTicket.userEmail}
                        onChange={(e) => setNewTicket({...newTicket, userEmail: e.target.value})}
                      />
                    </div>
                    <div className="form-field">
                      <Label htmlFor="ticket-subject">Subject</Label>
                      <Input
                        id="ticket-subject"
                        placeholder="Ticket subject"
                        value={newTicket.subject}
                        onChange={(e) => setNewTicket({...newTicket, subject: e.target.value})}
                      />
                    </div>
                    <div className="form-field">
                      <Label htmlFor="ticket-priority">Priority</Label>
                      <Select value={newTicket.priority} onValueChange={(value) => setNewTicket({...newTicket, priority: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="form-field">
                      <Label htmlFor="ticket-description">Description</Label>
                      <Textarea
                        id="ticket-description"
                        placeholder="Describe the issue"
                        value={newTicket.description}
                        onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                        rows={4}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreateTicketOpen(false)}>Cancel</Button>
                    <Button onClick={handleCreateTicket}>Create Ticket</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={isLiveChatOpen} onOpenChange={setIsLiveChatOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="action-button">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Start Live Chat
                  </Button>
                </DialogTrigger>
                <DialogContent className="chat-dialog">
                  <DialogHeader>
                    <DialogTitle>Live Chat Dashboard</DialogTitle>
                    <DialogDescription>Monitor and join active chat sessions</DialogDescription>
                  </DialogHeader>
                  <div className="chat-dashboard">
                    <p className="chat-count">Active chat sessions: 0</p>
                  </div>
                  <DialogFooter>
                    <Button onClick={() => setIsLiveChatOpen(false)}>Close</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={isAddStaffOpen} onOpenChange={setIsAddStaffOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="action-button">
                    <Users className="w-4 h-4 mr-2" />
                    Add Staff
                  </Button>
                </DialogTrigger>
                <DialogContent className="staff-dialog">
                  <DialogHeader>
                    <DialogTitle>Add New Staff</DialogTitle>
                    <DialogDescription>Create a new staff account</DialogDescription>
                  </DialogHeader>
                  <div className="staff-form">
                    <div className="form-field">
                      <Label htmlFor="staff-firstname">First Name</Label>
                      <Input
                        id="staff-firstname"
                        placeholder="Enter first name"
                        value={newStaff.firstName}
                        onChange={(e) => setNewStaff({...newStaff, firstName: e.target.value})}
                      />
                    </div>
                    <div className="form-field">
                      <Label htmlFor="staff-lastname">Last Name</Label>
                      <Input
                        id="staff-lastname"
                        placeholder="Enter last name"
                        value={newStaff.lastName}
                        onChange={(e) => setNewStaff({...newStaff, lastName: e.target.value})}
                      />
                    </div>
                    <div className="form-field">
                      <Label htmlFor="staff-email">Email</Label>
                      <Input
                        id="staff-email"
                        placeholder="staff@example.com"
                        type="email"
                        value={newStaff.email}
                        onChange={(e) => setNewStaff({...newStaff, email: e.target.value})}
                      />
                    </div>
                    <div className="form-field">
                      <Label htmlFor="staff-password">Password</Label>
                      <Input
                        id="staff-password"
                        placeholder="Enter password"
                        type="password"
                        value={newStaff.password}
                        onChange={(e) => setNewStaff({...newStaff, password: e.target.value})}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddStaffOpen(false)}>Cancel</Button>
                    <Button onClick={handleAddStaff}>Add Staff</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Button variant="outline" className="action-button" onClick={() => setIsEmailDialogOpen(true)}>
                <Mail className="w-4 h-4 mr-2" />
                Send Bulk Email
              </Button>
              <Button variant="outline" className="action-button" onClick={handleSystemAlert}>
                <AlertCircle className="w-4 h-4 mr-2" />
                System Alert
              </Button>
            </CardContent>
          </Card>

          <Card className="knowledge-card">
            <CardHeader>
              <CardTitle className="card-title">Knowledge Base</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="knowledge-section">
                <h4 className="section-title">Popular Articles</h4>
                <ul className="article-list">
                  <li className="article-link" onClick={() => toast({title: "Article", description: "Opening: How to reset password"})}>Reset password</li>
                  <li className="article-link" onClick={() => toast({title: "Article", description: "Opening: Upload resume guide"})}>Upload resume guide</li>
                  <li className="article-link" onClick={() => toast({title: "Article", description: "Opening: Company verification"})}>Company verification</li>
                  <li className="article-link" onClick={() => toast({title: "Article", description: "Opening: Employee profile setup"})}>Employee profile setup</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="metrics-card">
            <CardHeader>
              <CardTitle className="card-title">Support Metrics</CardTitle>
            </CardHeader>
            <CardContent className="metrics-content">
              <div className="metric-item">
                <span className="metric-label">Resolution Rate</span>
                <span className="metric-value">94.5%</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Satisfaction Score</span>
                <span className="metric-value">4.8/5</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">First Response</span>
                <span className="metric-value">45 min</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="ticket-detail-dialog">
          <DialogHeader>
            <DialogTitle>Ticket Details - {selectedTicket?.id}</DialogTitle>
            <DialogDescription>View and manage ticket information</DialogDescription>
          </DialogHeader>
          {selectedTicket && (
            <div className="ticket-details">
              <div className="detail-grid">
                <div className="detail-item">
                  <Label>User</Label>
                  <p className="detail-value">{selectedTicket.user}</p>
                </div>
                <div className="detail-item">
                  <Label>User Type</Label>
                  <p className="detail-value">{selectedTicket.userType}</p>
                </div>
                <div className="detail-item">
                  <Label>Priority</Label>
                  <div className="detail-badge">{getPriorityBadge(selectedTicket.priority)}</div>
                </div>
                <div className="detail-item">
                  <Label>Status</Label>
                  <div className="detail-badge">{getStatusBadge(selectedTicket.status)}</div>
                </div>
                <div className="detail-item">
                  <Label>Created</Label>
                  <p className="detail-value">{selectedTicket.created}</p>
                </div>
                <div className="detail-item">
                  <Label>Last Update</Label>
                  <p className="detail-value">{selectedTicket.lastUpdate}</p>
                </div>
              </div>
              <div className="detail-full">
                <Label>Subject</Label>
                <p className="detail-value">{selectedTicket.subject}</p>
              </div>
              <div className="detail-full">
                <Label>Description</Label>
                <p className="detail-value">{selectedTicket.description}</p>
              </div>
              <div className="detail-full">
                <Label>Assigned To</Label>
                <p className="detail-value">{selectedTicket.assignedTo}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedTicket(null)}>Close</Button>
            <Button onClick={() => toast({title: "Updated", description: "Ticket updated successfully"})}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}