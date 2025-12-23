import React, { useState, useEffect } from "react";
import { Clock, MessageSquare, CheckCircle, AlertCircle, Plus, Search, Eye } from "lucide-react";
import Sidebar from './Sidebar';
import { SidebarContext } from './Sidebar';

const Badge = ({ children, className }) => (
  <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${className}`}>
    {children}
  </span>
);

const StatCard = ({ title, value, icon, iconBg }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex-1 min-w-[220px] max-w-xs px-8 py-7 flex justify-between items-center">
    <div>
      <div className="text-lg font-medium text-gray-700 mb-2">{title}</div>
      <div className="text-3xl font-bold text-gray-900">{value}</div>
    </div>
    <div className={`text-3xl ml-4 ${iconBg}`}>{icon}</div>
  </div>
);

const Dialog = ({ open, onClose, children }) =>
  open ? (
    <div className="fixed z-50 inset-0 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <div className="p-6">{children}</div>
      </div>
    </div>
  ) : null;

const DialogFooter = ({ children }) => (
  <div className="flex justify-end gap-2 mt-4">{children}</div>
);

export default function SupportCenter() {
  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem('sidebarCollapsed') : null;
    return stored === 'true';
  });

  // Tickets state (fetched from backend)
  const [tickets, setTickets] = useState([]);
  const [isCreateTicketOpen, setIsCreateTicketOpen] = useState(false);
  // Remove image from newTicket state
  const [newTicket, setNewTicket] = useState({
    category: "",
    subject: "",
    description: "",
    priority: "medium",
    email: "",
    username: localStorage.getItem("studentName") || "",
    contact: ""
  });

  // User info assumed present (already authenticated)
  const [user, setUser] = useState({
    userId: "",
    email: "",
    userType: "Student"
  });

  // Ticket details modal
  const [detailsTicket, setDetailsTicket] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [closeTicketCode, setCloseTicketCode] = useState("");
  const [closeTicketError, setCloseTicketError] = useState("");
  const [isClosing, setIsClosing] = useState(false);
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);
  // Get user info (from localStorage or context; already authenticated)
  useEffect(() => {
    setUser({
      userId: localStorage.getItem("studentId"),
      email: "",
      userType: "Student"
    });
  }, []);

  // Add openCreateTicketDialog function
  const openCreateTicketDialog = () => {
    setNewTicket((prev) => ({ ...prev, email: user.email }));
    setIsCreateTicketOpen(true);
  };

  // Fetch tickets from backend
  useEffect(() => {
    if (!user.userId) return;
    fetch(`${import.meta.env.VITE_API_URL || "http://localhost:4000"}/api/student/support/tickets?userId=${encodeURIComponent(user.userId)}`)
      .then(async res => {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          return res.json();
        } else {
          const text = await res.text();
          console.error("Expected JSON, got:", text);
          window.alert("Server returned invalid response.");
          return [];
        }
      })
      .then(data => setTickets(Array.isArray(data) ? data : []));
  }, [user.userId]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");

  // Create Ticket logic (calls backend)
  const handleCreateTicket = async () => {
    console.log("Create Ticket clicked");
    console.log("fields", "\nsub",newTicket.subject, "\ndesc",newTicket.description, "\ncat",newTicket.category, "\nuser",user.userId, "\nemail",newTicket.email, "\ntype",user.userType);
    if (
      !newTicket.subject ||
      !newTicket.description ||
      !newTicket.category ||
      !user.userId ||
      !newTicket.email ||
      !user.userType ||
      !newTicket.username ||
      !newTicket.contact
    ) {
      window.alert("Please fill in all required fields.");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("userId", user.userId);
      formData.append("userType", user.userType);
      formData.append("subject", newTicket.subject);
      formData.append("description", newTicket.description);
      formData.append("email", newTicket.email);
      formData.append("category", newTicket.category);
      formData.append("priority", newTicket.priority);
      formData.append("userName", newTicket.username);
      formData.append("contact", newTicket.contact);
      // Remove image handling from handleCreateTicket
      // (do not append image to formData)
      setIsCreatingTicket(true);
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";
      const token = localStorage.getItem("token");
      const res = await fetch(`${apiUrl}/api/student/tickets`, {
        method: "POST", 
        credentials: "include",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: formData
      });
      const contentType = res.headers.get("content-type");
      let data;
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text();
        console.error("Expected JSON, got:", text);
        window.alert("Server returned invalid response.");
        setIsCreatingTicket(false);
        return;
      }
      if (data.error) throw new Error(data.error);
      window.alert(data.message);
      setIsCreateTicketOpen(false);
      setIsCreatingTicket(false);
      setNewTicket({
        category: "",
        subject: "",
        description: "",
        priority: "medium",
        email: "",
        username: localStorage.getItem("studentName") || "",
        contact: ""
      });
      fetch(`${import.meta.env.VITE_API_URL || "http://localhost:4000"}/api/student/support/tickets?userId=${encodeURIComponent(user.userId)}`)
        .then(async res => {
          const contentType = res.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            return res.json();
          } else {
            const text = await res.text();
            console.error("Expected JSON, got:", text);
            window.alert("Server returned invalid response.");
            return [];
          }
        })
        .then(data => setTickets(Array.isArray(data) ? data : []));
    } catch (error) {
      window.alert(error.message || "Failed to create ticket");
      setIsCreatingTicket(false);
    }
  };

  // Remove handleImageChange function

  const getStatusColor = (status) => {
    if (!status) return "bg-gray-100 text-gray-700";
    if (["open", "pending"].includes(status.toLowerCase())) return "bg-red-50 text-red-600";
    if (["in-progress"].includes(status.toLowerCase())) return "bg-yellow-50 text-yellow-600";
    if (["resolved"].includes(status.toLowerCase())) return "bg-green-50 text-green-700";
    if (["closed"].includes(status.toLowerCase())) return "bg-gray-100 text-gray-700";
    return "bg-gray-100 text-gray-700";
  };

  const getPriorityColor = (priority) => {
    if (!priority) return "bg-gray-100 text-gray-700";
    if (priority === "urgent") return "bg-red-50 text-red-600";
    if (priority === "high") return "bg-yellow-100 text-yellow-700";
    if (priority === "medium") return "bg-yellow-50 text-yellow-700";
    if (priority === "low") return "bg-green-50 text-green-700";
    return "bg-gray-100 text-gray-700";
  };

  const getStatusIcon = (status) => {
    if (!status) return null;
    if (["open", "pending"].includes(status.toLowerCase()))
      return <AlertCircle className="inline-block mr-1 text-red-500" size={20} />;
    if (["in-progress"].includes(status.toLowerCase()))
      return <Clock className="inline-block mr-1 text-yellow-500" size={20} />;
    if (["resolved", "closed"].includes(status.toLowerCase()))
      return <CheckCircle className="inline-block mr-1 text-green-500" size={20} />;
    return null;
  };

  // Filtering logic
  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch =
      (ticket.subject || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ticket.description || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || (ticket.status && ticket.status.toLowerCase() === filterStatus);
    const matchesPriority = filterPriority === "all" || (ticket.priority && ticket.priority.toLowerCase() === filterPriority);
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Details modal logic
  const openTicketDetails = async (ticketId) => {
    setIsDetailsOpen(true);
    setDetailsTicket(null);
    setCloseTicketCode("");
    setCloseTicketError("");
    setIsClosing(false);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:4000"}/api/tickets/${encodeURIComponent(ticketId)}`);
      const contentType = res.headers.get("content-type");
      let data;
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text();
        console.error("Expected JSON, got:", text);
        setDetailsTicket({ error: "Failed to fetch ticket details" });
        return;
      }
      setDetailsTicket(data);
    } catch {
      setDetailsTicket({ error: "Failed to fetch ticket details" });
    }
  };

  // Handle close ticket
  const handleCloseTicket = async () => {
    setIsClosing(true);
    setCloseTicketError("");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:4000"}/api/tickets/close`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ticketId: detailsTicket.ticketId, secretCode: closeTicketCode, userId: user.userId, senderModel: 'Student', recipientModel: 'Student', title: 'Ticket Closed', message: `Ticket #${detailsTicket.ticketId} has been closed successfully.` })
      });
      const contentType = res.headers.get("content-type");
      let data;
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text();
        console.error("Expected JSON, got:", text);
        setCloseTicketError("Failed to close ticket");
        setIsClosing(false);
        return;
      }
      if (data.error) throw new Error(data.error);
      window.alert("Ticket closed successfully!");
      setIsDetailsOpen(false); // Ensure modal closes on success
      setCloseTicketCode("");
      fetch(`${import.meta.env.VITE_API_URL || "http://localhost:4000"}/api/student/support/tickets?userId=${encodeURIComponent(user.userId)}`)
        .then(async res => {
          const contentType = res.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            return res.json();
          } else {
            const text = await res.text();
            console.error("Expected JSON, got:", text);
            window.alert("Server returned invalid response.");
            return [];
          }
        })
        .then(data => setTickets(Array.isArray(data) ? data : []));
    } catch (error) {
      setCloseTicketError(error.message || "Failed to close ticket");
    } finally {
      setIsClosing(false);
    }
  };

  return (
    <SidebarContext.Provider value={{ isCollapsed }}>
      <div className="flex min-h-screen">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />
        <div className={`flex-1 flex flex-col relative min-w-0 transition-all duration-300 ease-in-out ${isCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
          <div className="min-h-screen bg-gray-50 px-6 py-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-6">
              <div>
                <h1 className="text-4xl font-extrabold text-gray-900 mb-1">Support Center</h1>
                <p className="text-lg text-gray-400 font-medium">
                  Get help with your campus services and submit support tickets
                </p>
              </div>
                <button
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-7 py-3 text-lg rounded-xl shadow transition"
                style={{ minWidth: 180 }}
                onClick={openCreateTicketDialog}
                >
                  <Plus className="w-6 h-6" />
                  Create Ticket
                </button>
            </div>
            {/* Dashboard Stats */}
            <div className="flex flex-col md:flex-row gap-6 mb-8">
              <StatCard
                title="Open Tickets"
                value={tickets.filter(t => ["pending", "open"].includes((t.status || "").toLowerCase())).length}
                icon={<AlertCircle className="text-red-500" />}
              />
              <StatCard
                title="In Progress"
                value={tickets.filter(t => (t.status || "").toLowerCase() === 'in-progress').length}
                icon={<Clock className="text-yellow-500" />}
              />
              <StatCard
                title="Resolved"
                value={tickets.filter(t => (t.status || "").toLowerCase() === 'resolved').length}
                icon={<CheckCircle className="text-green-500" />}
              />
              <StatCard
                title="Avg Response Time"
                value={<span className="font-black text-3xl">4h</span>}
                icon={<MessageSquare className="text-blue-500" />}
              />
            </div>
            {/* Filters/Search */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-6 mb-8 flex flex-col md:flex-row items-center gap-4">
              <div className="flex-1 w-full relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  className="w-full pl-12 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 text-base"
                  placeholder="Search tickets..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="border border-gray-200 bg-gray-50 rounded-lg px-6 py-3 text-base text-gray-700 font-medium focus:outline-none"
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
              <select
                className="border border-gray-200 bg-gray-50 rounded-lg px-6 py-3 text-base text-gray-700 font-medium focus:outline-none"
                value={filterPriority}
                onChange={e => setFilterPriority(e.target.value)}
              >
                <option value="all">All Priority</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            {/* Tickets List */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Your Support Tickets</h2>
              {filteredTickets.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  No tickets found matching your criteria.
                </div>
              ) : (
                filteredTickets.map(ticket => (
                  <div
                    key={ticket.ticketId}
                    className="bg-gray-50 rounded-xl border border-gray-200 flex flex-col md:flex-row md:items-center justify-between px-8 py-6 mb-4"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {getStatusIcon(ticket.status)}
                        <span className="text-lg md:text-xl font-semibold text-gray-900">
                          {ticket.subject}
                        </span>
                        <button
                          className="ml-2 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded flex items-center gap-1 text-gray-700 font-medium"
                          onClick={() => openTicketDetails(ticket.ticketId)}
                        >
                          <Eye size={18} /> View
                        </button>
                      </div>
                      <div className="text-gray-500 text-base mb-2">{ticket.description}</div>
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <span className="">{`#${ticket.ticketId}`}</span>
                        <span>·</span>
                        <span>{ticket.category}</span>
                      </div>
                    </div>
                    <div className="flex flex-col md:items-end gap-2 mt-5 md:mt-0">
                      <div className="flex gap-2 items-center">
                        {ticket.priority && (
                          <Badge className={getPriorityColor(ticket.priority)}>
                            {ticket.priority}
                          </Badge>
                        )}
                        <Badge className={getStatusColor(ticket.status)}>
                          {ticket.status}
                        </Badge>
                      </div>
                      <div className="flex flex-col items-end text-gray-400 text-sm mt-2">
                        <span>{(ticket.createdAt || "").slice(0, 10)}</span>
                        <span>{`${ticket.responses || 0} responses`}</span>
                        {ticket.closed && <span className="text-green-500">Closed</span>}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        {/* Create Ticket Dialog */}
        <Dialog open={isCreateTicketOpen} onClose={() => setIsCreateTicketOpen(false)}>
          <div>
            <h2 className="text-xl font-bold mb-4">Create Support Ticket</h2>
            <div className="grid gap-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label className="block font-semibold mb-1" htmlFor="username">Name</label>
                  <input
                    id="username"
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                    value={newTicket.username}
                    onChange={e => setNewTicket({ ...newTicket, username: e.target.value })}
                    placeholder="Enter your name"
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="block font-semibold mb-1" htmlFor="contact">Contact Phone</label>
                  <input
                    id="contact"
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                    value={newTicket.contact}
                    onChange={e => setNewTicket({ ...newTicket, contact: e.target.value })}
                    placeholder="Enter your contact number"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold mb-1" htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                  value={newTicket.email}
                  onChange={e => setNewTicket({ ...newTicket, email: e.target.value })}
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold mb-1" htmlFor="category">Issue Type</label>
                <select
                  id="category"
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                  value={newTicket.category}
                  onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                >
                  <option value="">Select issue type</option>
                  <option value="Technical">Technical Issues</option>
                  <option value="Academic">Academic Support</option>
                  <option value="Facilities">Campus Facilities</option>
                  <option value="Financial">Financial Services</option>
                  <option value="Account">Account Issues</option>
                  <option value="Document Verification">Document Verification</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1" htmlFor="subject">Subject</label>
                <input
                  id="subject"
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                  placeholder="Brief description of your issue"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1" htmlFor="description">Description</label>
                <textarea
                  id="description"
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                  placeholder="Provide detailed information about your issue"
                  rows={4}
                />
              </div>
              <div>
                <label className="block font-semibold mb-1" htmlFor="priority">Priority</label>
                <select
                  id="priority"
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                  value={newTicket.priority}
                  onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                >
                  <option value="medium">Medium</option>
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="low">Low</option>
                </select>
              </div>
              {/* Remove the image input from the Create Ticket Dialog form */}
              <DialogFooter>
                <button className="px-4 py-2 bg-gray-200 rounded font-semibold" type="button" onClick={() => setIsCreateTicketOpen(false)}>
                  Cancel
                </button>
                {isCreatingTicket?
                  <button
                  className={`px-4 py-2 bg-blue-600 hover:bg-grey-700 text-white rounded font-semibold opacity-50 cursor-not-allowed`}
                  type="button"
                  disabled={true}
                  >
                    Creating...
                  </button> :
                  <button
                  className={`px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold ${(!newTicket.subject || !newTicket.description || !newTicket.category || !newTicket.email || !newTicket.username || !newTicket.contact) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  type="button"
                  onClick={() => { handleCreateTicket(); }}
                  disabled={
                    !newTicket.subject ||
                    !newTicket.description ||
                    !newTicket.category ||
                    !newTicket.email ||
                    !newTicket.username ||
                    !newTicket.contact
                    }
                  >
                    Create Ticket
                  </button>
                }
              </DialogFooter>
            </div>
          </div>
        </Dialog>
        {/* Ticket Details Dialog */}
        <Dialog open={isDetailsOpen} onClose={() => setIsDetailsOpen(false)}>
          {!detailsTicket ? (
            <div>Loading...</div>
          ) : detailsTicket.error ? (
            <div className="text-red-500">{detailsTicket.error}</div>
          ) : (
            <div>
              <h2 className="text-xl font-bold mb-2">{detailsTicket.subject}</h2>
              <div className="mb-2 text-gray-700">{detailsTicket.description}</div>
              <div className="mb-2 text-gray-500 text-sm">Ticket ID: {detailsTicket.ticketId}</div>
              <div className="mb-2 text-gray-500 text-sm">Status: {detailsTicket.status}</div>
              <div className="mb-4 text-gray-500 text-sm">Created: {detailsTicket.createdAt?.slice(0, 19).replace("T", " ")}</div>
              <div className="mb-4">
                <strong>Category:</strong> {detailsTicket.category} <br />
                <strong>Priority:</strong> {detailsTicket.priority}
              </div>
              <div className="mb-4">
                <strong>Conversation:</strong>
                <ul className="mt-2 pl-4 border-l">
                  {detailsTicket.messages?.map((msg, i) => (
                    <li key={i} className="mb-2">
                      <span className="font-semibold">{msg.senderType === "user" ? "You" : "Support"}:</span> {msg.message}
                      <div className="text-xs text-gray-400">{msg.timestamp ? msg.timestamp.slice(0, 19).replace("T", " ") : ""}</div>
                    </li>
                  ))}
                </ul>
              </div>
              {detailsTicket.status !== "closed" && (
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">To Close Ticket Enter Code: {detailsTicket.secretCode}</h3>
                  <input
                    type="text"
                    className="border px-3 py-2 rounded w-full"
                    placeholder="Enter your secret code"
                    value={closeTicketCode}
                    onChange={e => setCloseTicketCode(e.target.value)}
                    disabled={isClosing}
                  />
                  <button
                    className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-semibold"
                    onClick={handleCloseTicket}
                    disabled={isClosing || !closeTicketCode}
                  >
                    {isClosing ? "Closing..." : "Close Ticket"}
                  </button>
                  {closeTicketError && <div className="text-red-500 mt-2">{closeTicketError}</div>}
                </div>
              )}
            </div>
          )}
        </Dialog>
      </div>
    </SidebarContext.Provider>
  );
}