import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, School, Building2, Ticket, MessageSquare, Mail, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function DashboardOverview() {
  const [counts, setCounts] = useState({
    colleges: 0,
    companies: 0,
    students: 0,
    loading: true,
  });

  const [recentActivity, setRecentActivity] = useState([]);
  const [loadingActivity, setLoadingActivity] = useState(true);
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

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [collegesRes, companiesRes, studentsRes] = await Promise.all([
          axios.get(`${API_URL}/api/admin/college-count`),
          axios.get(`${API_URL}/api/admin/company-count`),
          axios.get(`${API_URL}/api/admin/student-count`),
        ]);
        setCounts({
          colleges: collegesRes.data.count || 0,
          companies: companiesRes.data.count || 0,
          students: studentsRes.data.count || 0,
          loading: false,
        });
      } catch (err) {
        setCounts({ colleges: 0, companies: 0, students: 0, loading: false });
      }
    };

    const fetchRecentActivity = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/admin/recent-activity`);
        const activities = [];

        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);

        res.data.students.forEach(student => {
          const createdAt = new Date(student.createdAt);
          if (createdAt >= oneDayAgo) {
            activities.push({
              type: "New Student",
              description: `Student ${student.name} registered`,
              time: createdAt.toLocaleString(),
              status: "new",
            });
          }
        });

        res.data.colleges.forEach(college => {
          const createdAt = new Date(college.createdAt);
          if (createdAt >= oneDayAgo) {
            activities.push({
              type: "New College",
              description: `College ${college.name} added`,
              time: createdAt.toLocaleString(),
              status: "new",
            });
          }
        });

        res.data.companies.forEach(company => {
          const createdAt = new Date(company.createdAt);
          if (createdAt >= oneDayAgo) {
            activities.push({
              type: "New Company",
              description: `Company ${company.name} added`,
              time: createdAt.toLocaleString(),
              status: "new",
            });
          }
        });

        res.data.supportTickets.forEach(ticket => {
          const createdAt = new Date(ticket.createdAt);
          if (createdAt >= oneDayAgo) {
            activities.push({
              type: "New Support Ticket",
              description: `Support ticket #${ticket.ticketId} created: ${ticket.subject}`,
              time: createdAt.toLocaleString(),
              status: "new",
            });
          }
        });

        setRecentActivity(activities);
        setLoadingActivity(false);
      } catch (err) {
        setRecentActivity([]);
        setLoadingActivity(false);
      }
    };

    fetchCounts();
    fetchRecentActivity();
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

  const handleLiveChat = () => {
    setIsLiveChatOpen(true);
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
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to add staff: ${error.response?.data?.message || error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleSystemAlert = () => {
    console.log("Creating system alert");
    toast({
      title: "System Alert",
      description: "System alert broadcast to all users",
    });
  };

  const stats = [
    {
      title: "Total Users",
      value: counts.loading
        ? "..."
        : (counts.colleges + counts.companies + counts.students).toLocaleString(),
      change: "",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Active Colleges",
      value: counts.loading ? "..." : counts.colleges.toLocaleString(),
      change: "",
      icon: School,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Companies",
      value: counts.loading ? "..." : counts.companies.toLocaleString(),
      change: "",
      icon: Building2,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ];

  const quickActions = [
    // {
    //   icon: <Ticket className="w-5 h-5 mr-2" />,
    //   label: "Create New Ticket",
    //   onClick: () => setIsCreateTicketOpen(true),
    // },
    {
      icon: <MessageSquare className="w-5 h-5 mr-2" />,
      label: "Start Live Chat",
      onClick: handleLiveChat,
    },
    {
      icon: <Users className="w-5 h-5 mr-2" />,
      label: "Add Staff",
      onClick: () => setIsAddStaffOpen(true),
    },
    {
      icon: <Mail className="w-5 h-5 mr-2" />,
      label: "Send Bulk Email",
      onClick: () => setIsEmailDialogOpen(true),
    },
    {
      icon: <AlertCircle className="w-5 h-5 mr-2" />,
      label: "System Alert",
      onClick: handleSystemAlert,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Monitor and manage your placement platform</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-green-600 font-medium">{stat.change} from last month</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {quickActions.map((action) => (
              <Button
                key={action.label}
                variant="outline"
                className="justify-start w-full text-base font-medium flex items-center"
                onClick={action.onClick}
              >
                {action.icon}
                {action.label}
              </Button>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest platform events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loadingActivity ? (
                <p>Loading recent activity...</p>
              ) : (
                recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900">{activity.type}</p>
                      <p className="text-sm text-gray-600 truncate">{activity.description}</p>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-gray-500">{activity.time}</p>
                        <Badge className={`text-xs ${getStatusColor(activity.status)}`}>
                          {activity.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isCreateTicketOpen} onOpenChange={setIsCreateTicketOpen}>
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

      <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
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

      <Dialog open={isLiveChatOpen} onOpenChange={setIsLiveChatOpen}>
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
    </div>
  );
}