import { useState, useEffect, useRef } from 'react';
import { FaChevronRight, FaTicketAlt, FaChartLine, FaPaperPlane, FaUserGraduate, FaRobot, FaTimes, FaCheck } from 'react-icons/fa';
import Sidebar from '../Sidebar';
import SearchBar from '../SearchBar';
import CollegeSettingsModal from './CollegeSettingsModal';
import axios from 'axios';
axios.defaults.withCredentials = true;
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Support = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [collegeId, setCollegeId] = useState(null);
  const [collegeName, setCollegeName] = useState('');
  const [currentTicket, setCurrentTicket] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [showTicketList, setShowTicketList] = useState(false);
  const [quickHelpTopics, setQuickHelpTopics] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [college, setCollege] = useState(null);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const messagesEndRef = useRef(null);
  // Add state for modal and new ticket form
  const [isCreateTicketOpen, setIsCreateTicketOpen] = useState(false);
  const [newTicket, setNewTicket] = useState({
    subject: '',
    description: '',
    category: '',
    priority: 'medium',
    email: college?.email || '',
    contact: college?.contactPhone || '',
    username: collegeName || ''
  });
  const [detailsTicket, setDetailsTicket] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [closeTicketCode, setCloseTicketCode] = useState("");
  const [closeTicketError, setCloseTicketError] = useState("");
  const [isClosing, setIsClosing] = useState(false);
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const id = localStorage.getItem('collegeId');
    const name = localStorage.getItem('collegeName');
    setCollegeId(id);
    setCollegeName(name);
    
    if (id) {
      // Fetch college details
      axios.get(`${apiUrl}/api/colleges/${id}`)
        .then(res => {
          setCollege(res.data);
        })
        .catch(err => {
          console.error('Error fetching college:', err);
        });
      
      fetchTickets(id);
      fetchQuickHelpTopics();
    }
  }, []);

  const fetchTickets = async (userId) => {
    try {
      const response = await axios.get(`${apiUrl}/api/tickets/college/${userId}`);
      setTickets(response.data.tickets || []);
    } catch (error) {
      // Error handling without console logging
    }
  };

  const fetchQuickHelpTopics = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/support/quick-help/college`);
      setQuickHelpTopics(response.data.topics || []);
    } catch (error) {
      // Error handling without console logging
    }
  };

  const handleQuickHelpClick = (topic) => {
    setNewMessage(topic.title);
  };

  const handleSubmitMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !collegeId) return;

    setLoading(true);
    setError(null);

    try {
      let response;
      const userMessage = {
        message: newMessage,
        sender: collegeName,
        senderType: 'user',
        timestamp: new Date().toISOString()
      };
      
      // First, add user's message to the UI
      setMessages(prev => [...prev, userMessage]);
      setNewMessage('');
      
      // Show bot typing indicator
      setIsBotTyping(true);
      
      if (!currentTicket) {
        // Create new ticket
        response = await axios.post(`${apiUrl}/api/company/tickets`, {
          userId: collegeId,
          userType: 'College',
          subject: newMessage.substring(0, 50) + (newMessage.length > 50 ? '...' : ''),
          message: newMessage
        });
        
        setCurrentTicket(response.data.ticket);
        // Add bot's response after a delay
        setTimeout(() => {
          setIsBotTyping(false);
          setMessages(prev => [...prev, {
            message: response.data.ticket.messages[1].message,
            sender: 'Support Bot',
            senderType: 'support_bot',
            timestamp: new Date().toISOString()
          }]);
        }, 2000);
        
        setTickets(prev => [response.data.ticket, ...prev]);
      } else {
        // Add message to existing ticket
        response = await axios.post(`${apiUrl}/api/support/tickets/${collegeId}/${currentTicket.ticketId}/messages`, {
          message: newMessage,
          userType: 'college'
        });
        
        setCurrentTicket(response.data.ticket);
        // Add bot's response after a delay
        setTimeout(() => {
          setIsBotTyping(false);
          setMessages(prev => [...prev, {
            message: response.data.ticket.messages[response.data.ticket.messages.length - 1].message,
            sender: 'Support Bot',
            senderType: 'support_bot',
            timestamp: new Date().toISOString()
          }]);
        }, 2000);
      }
      
    } catch (err) {
      setError('Failed to send message. Please try again.');
      setIsBotTyping(false);
    } finally {
      setLoading(false);
    }
  };

  const handleTicketClick = async (ticket) => {
    try {
      const response = await axios.get(`${apiUrl}/api/support/tickets/${collegeId}/${ticket.ticketId}`);
      setCurrentTicket(response.data.ticket);
      setMessages(response.data.ticket.messages || []);
      setShowTicketList(false);
    } catch (error) {
      setError('Failed to load ticket');
    }
  };

  const handleNewConversation = () => {
    setCurrentTicket(null);
    setMessages([]);
    setNewMessage('');
    setError(null);
  };

  const handleCollegeUpdate = (updatedCollege) => {
    setCollege(updatedCollege);
    setCollegeName(updatedCollege.name);
  };

  // Add handler for creating ticket
  const handleCreateTicket = async () => {
    if (!newTicket.subject || !newTicket.description || !newTicket.category || !newTicket.email) {
      alert('Please fill in all required fields.');
      return;
    }
    try {
      setIsCreatingTicket(true);
      const token = localStorage.getItem('token');
      const res = await axios.post(`${apiUrl}/api/colleges/tickets`, {
        userId: collegeId,
        userType: 'College',
        subject: newTicket.subject,
        description: newTicket.description,
        category: newTicket.category,
        priority: newTicket.priority,
        email: newTicket.email,
        userName: newTicket.username,
        contact: newTicket.contact
      }, token ? { headers: { Authorization: `Bearer ${token}` } } : {});
      alert('Ticket created successfully!');
      setIsCreatingTicket(false);
      setIsCreateTicketOpen(false);
      setNewTicket({ subject: '', description: '', category: '', priority: 'medium', email: college?.email || '', contact: college?.contactPhone || '', username: collegeName || '' });
      fetchTickets(collegeId);
    } catch (error) {
      setIsCreatingTicket(false);
      alert(error.response?.data?.error || 'Failed to create ticket');
    }
  };

  const handleViewTicket = async (ticket) => {
    setIsDetailsOpen(true);
    setDetailsTicket(null);
    setCloseTicketCode("");
    setCloseTicketError("");
    setIsClosing(false);
    try {
      const res = await axios.get(`${apiUrl}/api/support/tickets/${collegeId}/${encodeURIComponent(ticket.ticketId)}`);
      setDetailsTicket(res.data.ticket);
    } catch (error) {
      setDetailsTicket({ error: "Failed to fetch ticket details" });
    }
  };

  const handleCloseTicket = async () => {
    setIsClosing(true);
    setCloseTicketError("");
    try {
      const res = await axios.post(`${apiUrl}/api/tickets/close`, {
        ticketId: detailsTicket.ticketId,
        secretCode: closeTicketCode,
        userId: collegeId,
        senderModel: 'College',
        recipientModel: 'College',
        title: 'Ticket Closed',
        message: `Ticket #${detailsTicket.ticketId} has been closed successfully.`
      }, { withCredentials: true });
      const contentType = res.headers.get("content-type");
      let data;
      if (contentType && contentType.includes("application/json")) {
        data = await res.data;
      } else {
        setCloseTicketError("Failed to close ticket");
        setIsClosing(false);
        return;
      }
      if (data.error) throw new Error(data.error);
      window.alert("Ticket closed successfully!");
      setIsDetailsOpen(false);
      setCloseTicketCode("");
      fetchTickets(collegeId);
    } catch (error) {
        console.log(error);
        setCloseTicketError(
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Failed to close ticket"
      );
    } finally {
      setIsClosing(false);
    }
  };

  // Navigation items with college ID
  const navItems = [
    { label: 'Dashboard', href: `/college/${collegeId}/dashboard`, icon: <FaChevronRight /> },
    { label: 'View Jobs', href: `/college/${collegeId}/view-jobs`, icon: <FaChevronRight /> },
    { label: 'Scheduled Applications', href: `/college/${collegeId}/scheduled-applications`, icon: <FaChevronRight /> },
    { label: 'Add Students', href: `/college/${collegeId}/add-students`, icon: <FaUserGraduate /> },
    { label: 'Support', href: `/college/${collegeId}/support`, icon: <FaTicketAlt /> },
    { label: 'Placement Analysis', href: `/college/${collegeId}/placement-analysis`, icon: <FaChartLine /> },
  ];

  const sidebarUser = {
    name: collegeName || 'College Admin',
    role: 'Administrator',
    initials: collegeName ? collegeName.substring(0, 2).toUpperCase() : 'CA'
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return '#3b82f6';
      case 'in_progress': return '#f59e0b';
      case 'resolved': return '#10b981';
      case 'closed': return '#6b7280';
      default: return '#6b7280';
    }
  };

    return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar navItems={navItems} user={sidebarUser} sectionLabel="COLLEGE SERVICES" />
      <div className="main-container" style={{ marginLeft: 260, width: '100%', padding: 0, position: 'relative' }}>
        <div style={{ padding: '0 24px' }}>
          <SearchBar onSettingsClick={() => setShowSettings(true)} />
        </div>
        <div style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ color: '#1f2937' }}>Support Center</h2>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setIsCreateTicketOpen(true)}
                style={{
                  padding: '8px 16px',
                  background: '#059669',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={e => e.currentTarget.style.background = '#047857'}
                onMouseOut={e => e.currentTarget.style.background = '#059669'}
              >
                Generate Ticket
              </button>
            </div>
          </div>
          {/* Ticket List - full width */}
          <div style={{ width: '100%' }}>
              <div style={{
                background: '#fff',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                overflowY: 'auto',
                border: '1px solid #e5e7eb'
              }}>
              <h3 style={{ marginBottom: '16px', color: '#1f2937' }}>All Tickets</h3>
                {tickets.length === 0 ? (
                  <div style={{ color: '#6b7280', textAlign: 'center' }}>No tickets yet</div>
                ) : (
                  tickets.map(ticket => (
                    <div
                      key={ticket.ticketId}
                      style={{
                        padding: '12px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        marginBottom: '8px',
                      background: '#fff',
                        transition: 'all 0.2s ease',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px' }}>{ticket.subject}</div>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '4px' }}>{formatDate(ticket.createdAt)}</div>
                      <div style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', background: getStatusColor(ticket.status) + '20', color: getStatusColor(ticket.status) }}>{ticket.status.replace('_', ' ')}</div>
                    </div>
                    <button onClick={() => handleViewTicket(ticket)} style={{ padding: '6px 16px', borderRadius: 6, border: 'none', background: '#2563eb', color: '#fff', cursor: 'pointer' }}>View</button>
                    </div>
                  ))
                )}
              </div>
          </div>
          {/* Ticket Details Modal */}
          {isDetailsOpen && (
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', zIndex: 1001, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setIsDetailsOpen(false)}>
              <div style={{ background: '#fff', borderRadius: 12, padding: 32, minWidth: 350, maxWidth: 500 }} onClick={e => e.stopPropagation()}>
                {!detailsTicket ? (
                  <div>Loading...</div>
                ) : detailsTicket.error ? (
                  <div style={{ color: 'red' }}>{detailsTicket.error}</div>
                ) : (
                  <div>
                    <h2 style={{ fontWeight: 'bold', fontSize: 20, marginBottom: 8 }}>{detailsTicket.subject}</h2>
                    <div style={{ marginBottom: 8 }}>{detailsTicket.description}</div>
                    <div style={{ marginBottom: 8, color: '#555' }}>Ticket ID: {detailsTicket.ticketId}</div>
                    <div style={{ marginBottom: 8, color: '#555' }}>Status: {detailsTicket.status}</div>
                    <div style={{ marginBottom: 8, color: '#555' }}>Created: {detailsTicket.createdAt?.slice(0, 19).replace('T', ' ')}</div>
                    <div style={{ marginBottom: 8 }}><strong>Category:</strong> {detailsTicket.category} <br /><strong>Priority:</strong> {detailsTicket.priority}</div>
                    <div style={{ marginBottom: 8 }}>
                      <strong>Conversation:</strong>
                      <ul style={{ marginTop: 8, paddingLeft: 16, borderLeft: '2px solid #eee' }}>
                        {detailsTicket.messages?.map((msg, i) => (
                          <li key={i} style={{ marginBottom: 8 }}>
                            <span style={{ fontWeight: 600 }}>{msg.senderType === 'user' ? 'You' : 'Support'}:</span> {msg.message}
                            <div style={{ fontSize: 12, color: '#888' }}>{msg.timestamp ? msg.timestamp.slice(0, 19).replace('T', ' ') : ''}</div>
                          </li>
                        ))}
                      </ul>
                    </div>
                    {detailsTicket.status !== 'closed' && (
                      <div style={{ marginTop: 16 }}>
                        <div style={{ marginBottom: 8, fontWeight: 500 }}>To Close Ticket Enter Code: {detailsTicket.secretCode}</div>
                        <input
                          type="text"
                          style={{ border: '1px solid #ccc', padding: 8, borderRadius: 6, width: '100%' }}
                          placeholder="Enter your secret code"
                          value={closeTicketCode}
                          onChange={e => setCloseTicketCode(e.target.value)}
                          disabled={isClosing}
                        />
            <button
                          style={{ marginTop: 12, padding: '8px 16px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}
                    onClick={handleCloseTicket}
                          disabled={isClosing || !closeTicketCode}
                        >
                          {isClosing ? 'Closing...' : 'Close Ticket'}
                        </button>
                        {closeTicketError && <div style={{ color: 'red', marginTop: 8 }}>{closeTicketError}</div>}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Settings Modal */}
      <CollegeSettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        college={college}
        onUpdate={handleCollegeUpdate}
      />

      {/* Modal for creating a ticket */}
      {isCreateTicketOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.3)', zIndex: 1001, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }} onClick={() => setIsCreateTicketOpen(false)}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 32, minWidth: 350, maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: 16 }}>Create Support Ticket</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input
                type="text"
                placeholder="Name"
                value={newTicket.username}
                onChange={e => setNewTicket({ ...newTicket, username: e.target.value })}
                style={{ padding: 8, borderRadius: 6, border: '1px solid #e5e7eb' }}
              />
              <input
                type="email"
                placeholder="Email"
                value={newTicket.email}
                onChange={e => setNewTicket({ ...newTicket, email: e.target.value })}
                style={{ padding: 8, borderRadius: 6, border: '1px solid #e5e7eb' }}
              />
              <input
                type="text"
                placeholder="Contact Phone"
                value={newTicket.contact}
                onChange={e => setNewTicket({ ...newTicket, contact: e.target.value })}
                style={{ padding: 8, borderRadius: 6, border: '1px solid #e5e7eb' }}
              />
              <select
                value={newTicket.category}
                onChange={e => setNewTicket({ ...newTicket, category: e.target.value })}
                style={{ padding: 8, borderRadius: 6, border: '1px solid #e5e7eb' }}
              >
                <option value="">Select Category</option>
                <option value="Technical">Technical Issues</option>
                <option value="Academic">Academic Support</option>
                <option value="Facilities">Campus Facilities</option>
                <option value="Financial">Financial Services</option>
                <option value="Account">Account Issues</option>
                <option value="Document Verification">Document Verification</option>
                <option value="Other">Other</option>
              </select>
              <input
                type="text"
                placeholder="Subject"
                value={newTicket.subject}
                onChange={e => setNewTicket({ ...newTicket, subject: e.target.value })}
                style={{ padding: 8, borderRadius: 6, border: '1px solid #e5e7eb' }}
              />
              <textarea
                placeholder="Description"
                value={newTicket.description}
                onChange={e => setNewTicket({ ...newTicket, description: e.target.value })}
                rows={4}
                style={{ padding: 8, borderRadius: 6, border: '1px solid #e5e7eb' }}
              />
              <select
                value={newTicket.priority}
                onChange={e => setNewTicket({ ...newTicket, priority: e.target.value })}
                style={{ padding: 8, borderRadius: 6, border: '1px solid #e5e7eb' }}
              >
                <option value="medium">Medium</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="low">Low</option>
              </select>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
                <button onClick={() => setIsCreateTicketOpen(false)} style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: '#e5e7eb', color: '#374151', cursor: 'pointer' }}>Cancel</button>
                {isCreatingTicket? 
                  <button style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: 'grey', color: '#fff', cursor: 'pointer' }}>Creating...</button>
                  :<button onClick={handleCreateTicket} style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: '#2563eb', color: '#fff', cursor: 'pointer' }}>Create Ticket</button>
                }
                
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );
};

export default Support; 