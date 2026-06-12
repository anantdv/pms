import React, { useState, useEffect } from 'react';
import { Send, CheckCircle2, MessageSquare, AlertCircle, BarChart2, ShieldAlert, Clock, User, Sparkles, Mic, MicOff, RefreshCw, X, HelpCircle, Check, Play, Pencil, Settings } from 'lucide-react';

const MOCK_ISSUE_LISTS = {
  "Utilities & Infrastructure Issues List": [
    "Water supply interruptions",
    "Low water pressure",
    "Drainage and sewage blockage",
    "Power outages",
    "Faulty wiring",
    "Elevator/lift malfunction",
    "HVAC (heating/cooling) issues",
    "Internet/telecom infrastructure problems",
    "Gas pipeline issues"
  ],
  "Safety & Security Issues List": [
    "Broken door locks",
    "CCTV surveillance camera down",
    "Unauthorized intrusion alarm",
    "Emergency fire exit blockage",
    "Smoke detector warning beep",
    "Intercom device malfunctioning"
  ],
  "Cleaning & Janitorial Issues List": [
    "Garbage chute blocked",
    "Stairwell lighting broken",
    "Water leakage in public lobby",
    "Graffiti on entrance corridor",
    "Pest activity spotted"
  ]
};

export default function Support({ tickets, onAddMessage, onCreateIssue, tenants = [], erpnextConfig }) {
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'console', 'tinni'
  const [selectedTicketId, setSelectedTicketId] = useState(tickets[0]?.id || null);
  
  // Create Issue Modal Form States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [issueSubject, setIssueSubject] = useState('');
  const [issueCustomer, setIssueCustomer] = useState('');
  const [issueRaisedBy, setIssueRaisedBy] = useState('');
  const [issueStatus, setIssueStatus] = useState('Open');
  const [issuePriority, setIssuePriority] = useState('Medium');
  const [issueDescription, setIssueDescription] = useState('');
  const [issueCompany, setIssueCompany] = useState('CARPENTERS PROPERTIES PTE LIMITED');
  
  // New Booking & Issue List fields states
  const [bookingList, setBookingList] = useState([]);
  const [selectedBookingNumber, setSelectedBookingNumber] = useState('');
  const [selectedIssueList, setSelectedIssueList] = useState('Utilities & Infrastructure Issues List');
  const [issueListRows, setIssueListRows] = useState([]);
  
  // Submit status & validation message states
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch Booking Numbers
  useEffect(() => {
    const fetchBookingNumbers = async () => {
      if (erpnextConfig && erpnextConfig.url) {
        try {
          const res = await fetch(`${erpnextConfig.url}/api/resource/Booking?fields=["name"]&limit_page_length=100`, {
            headers: {
              'Authorization': `token ${erpnextConfig.apiKey}:${erpnextConfig.apiSecret}`,
              'Content-Type': 'application/json'
            }
          });
          if (res.ok) {
            const json = await res.json();
            const list = json.data || [];
            setBookingList(list.map(b => b.name));
          } else {
            setBookingList(['BOOK-0001', 'BOOK-0002']);
          }
        } catch {
          setBookingList(['BOOK-0001', 'BOOK-0002']);
        }
      } else {
        setBookingList(['BOOK-0001', 'BOOK-0002']);
      }
    };
    if (showCreateModal) {
      fetchBookingNumbers();
    }
  }, [erpnextConfig, showCreateModal]);

  // Sync issue rows on list selection
  useEffect(() => {
    const items = MOCK_ISSUE_LISTS[selectedIssueList] || [];
    setIssueListRows(items.map((item, idx) => ({
      no: idx + 1,
      selected: false,
      agreed: false,
      issue: item
    })));
  }, [selectedIssueList]);
  const [messageText, setMessageText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [recognitionInstance, setRecognitionInstance] = useState(null);
  
  // Tinni AI Chat State
  const [tinniMessages, setTinniMessages] = useState([
    { sender: 'tinni', text: "Hello! I am Tinni, your Carpenters Estate AI Assistant. Ask me anything about lease standards, maintenance rosters, or billing rules!", timestamp: 'Just now' }
  ]);
  const [tinniInput, setTinniInput] = useState('');
  const [isTinniTyping, setIsTinniTyping] = useState(false);

  // Local state copy of tickets to allow changing status and closing/reopening in the UI
  const [localTickets, setLocalTickets] = useState(tickets);

  // Pagination states & calculations
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const totalPages = Math.ceil(localTickets.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = localTickets.slice(indexOfFirstItem, indexOfLastItem);

  const renderPaginationControls = () => {
    if (totalPages <= 1) return null;
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 24px', borderTop: '1px solid var(--border-color)', fontSize: 13, color: 'var(--text-secondary)', background: 'var(--bg-card)' }}>
        <div>
          Showing <strong>{indexOfFirstItem + 1}</strong> to <strong>{Math.min(indexOfLastItem, localTickets.length)}</strong> of <strong>{localTickets.length}</strong> entries
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button 
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            className="btn btn-secondary"
            style={{ padding: '6px 12px', fontSize: 12, opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
          >
            Previous
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              type="button"
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`btn ${currentPage === i + 1 ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '6px 12px', fontSize: 12 }}
            >
              {i + 1}
            </button>
          ))}
          <button 
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            className="btn btn-secondary"
            style={{ padding: '6px 12px', fontSize: 12, opacity: currentPage === totalPages ? 0.5 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  useEffect(() => {
    setLocalTickets(tickets);
  }, [tickets]);

  const selectedTicket = localTickets.find(t => t.id === selectedTicketId);

  // Helper to calculate age from raised date
  const calculateAge = (dateStr) => {
    if (!dateStr) return 'N/A';
    const raised = new Date(dateStr);
    const now = new Date('2026-06-03'); // Simulated system date
    const diffTime = Math.abs(now - raised);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) - 1;
    if (diffDays === 0) return 'Raised today';
    if (diffDays === 1) return '1 day old';
    return `${diffDays} days old`;
  };

  // Change ticket status handler
  const handleStatusChange = async (ticketId, newStatus) => {
    setLocalTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        return { ...t, status: newStatus, lastUpdated: 'Just now' };
      }
      return t;
    }));

    if (erpnextConfig) {
      const erpStatus = newStatus === 'open' ? 'Open' : newStatus === 'closed' ? 'Closed' : newStatus === 'in-progress' ? 'Open' : newStatus === 'resolved' ? 'Resolved' : 'Open';
      try {
        await fetch(`${erpnextConfig.url}/api/resource/Issue/${ticketId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `token ${erpnextConfig.apiKey}:${erpnextConfig.apiSecret}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status: erpStatus })
        });
      } catch (err) {
        console.warn('Failed to sync status change to ERPNext Issue:', err);
      }
    }
  };

  // Create Issue submit handler
  const handleCreateIssueSubmit = async (e) => {
    e.preventDefault();
    if (!issueSubject || !issueCustomer || !issueRaisedBy) return;
    setSubmitting(true);
    setErrorMsg('');

    const selectedIssuesText = issueListRows
      .filter(row => row.selected)
      .map(row => `- [${row.agreed ? 'Agreed' : 'Selected'}] ${row.issue}`)
      .join('\n');

    const fullDescription = `${issueDescription}\n\n**Booking Link:** ${selectedBookingNumber || 'None'}\n**Main Issue List:** ${selectedIssueList}\n\n**Selected Issues:**\n${selectedIssuesText || 'None'}`;

    const payload = {
      subject: issueSubject,
      customer: issueCustomer,
      raised_by: issueRaisedBy,
      status: issueStatus,
      priority: issuePriority,
      description: fullDescription,
      company: issueCompany,
      booking_number: selectedBookingNumber,
      main_issues: selectedIssueList
    };

    try {
      if (onCreateIssue) {
        await onCreateIssue(payload);
      }
      
      // Reset Form
      setIssueSubject('');
      setIssueCustomer('');
      setIssueRaisedBy('');
      setIssueStatus('Open');
      setIssuePriority('Medium');
      setIssueDescription('');
      setSelectedBookingNumber('');
      setSelectedIssueList('Utilities & Infrastructure Issues List');
      setShowCreateModal(false);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create issue on ERPNext server');
    } finally {
      setSubmitting(false);
    }
  };

  // Close/Reopen handler
  const handleToggleClose = async (ticketId) => {
    let nextStatus = '';
    setLocalTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        nextStatus = t.status === 'closed' ? 'open' : 'closed';
        return { ...t, status: nextStatus, lastUpdated: 'Just now' };
      }
      return t;
    }));

    if (erpnextConfig && nextStatus) {
      const erpStatus = nextStatus === 'closed' ? 'Closed' : 'Open';
      try {
        await fetch(`${erpnextConfig.url}/api/resource/Issue/${ticketId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `token ${erpnextConfig.apiKey}:${erpnextConfig.apiSecret}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status: erpStatus })
        });
      } catch (err) {
        console.warn('Failed to sync close/reopen to ERPNext Issue:', err);
      }
    }
  };

  // Web Speech API Voice Recognition
  const toggleSpeechRecognition = (targetInput) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech-to-text not supported in this browser layout. Simulating voice input...");
      const simulatedText = targetInput === 'admin' 
        ? "Please draft a notification to Aroma Cafe regarding their signage permission."
        : "Explain lease guidelines for multi-level shopping centers.";
      
      if (targetInput === 'admin') {
        setMessageText(simulatedText);
      } else {
        setTinniInput(simulatedText);
      }
      return;
    }

    if (isListening) {
      if (recognitionInstance) {
        recognitionInstance.stop();
      }
      setIsListening(false);
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.lang = 'en-US';
    rec.interimResults = false;
    rec.maxAlternatives = 1;

    rec.onstart = () => {
      setIsListening(true);
    };

    rec.onresult = (event) => {
      const resultText = event.results[0][0].transcript;
      if (targetInput === 'admin') {
        setMessageText(prev => prev ? prev + ' ' + resultText : resultText);
      } else {
        setTinniInput(prev => prev ? prev + ' ' + resultText : resultText);
      }
    };

    rec.onerror = (e) => {
      console.error("Voice Recognition Error: ", e);
      setIsListening(false);
    };

    rec.onend = () => {
      setIsListening(false);
    };

    setRecognitionInstance(rec);
    rec.start();
  };

  // Send admin reply in ticket thread
  const handleSendAdminMessage = (e) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedTicketId) return;

    onAddMessage(selectedTicketId, {
      sender: 'admin',
      text: messageText,
      timestamp: 'Just now'
    });

    // Also update local copy messages
    setLocalTickets(prev => prev.map(t => {
      if (t.id === selectedTicketId) {
        return {
          ...t,
          lastUpdated: 'Just now',
          messages: [...t.messages, { sender: 'admin', text: messageText, timestamp: 'Just now' }]
        };
      }
      return t;
    }));

    setMessageText('');
  };

  // Send message to Tinni AI agent
  const handleSendTinni = (e) => {
    e.preventDefault();
    if (!tinniInput.trim()) return;

    const userMsg = { sender: 'tenant', text: tinniInput, timestamp: 'Just now' };
    setTinniMessages(prev => [...prev, userMsg]);
    const prompt = tinniInput.toLowerCase();
    setTinniInput('');
    setIsTinniTyping(true);

    setTimeout(() => {
      let reply = "";
      if (prompt.includes('hi') || prompt.includes('hello') || prompt.includes('hey')) {
        reply = "Hello! I am Tinni, your AI Assistant. How can I help you manage Carpenters Estate properties, leases, or support logs today?";
      } else if (prompt.includes('rent') || prompt.includes('invoice') || prompt.includes('billing')) {
        reply = "Under Carpenters terms, rent invoices are issued on the 1st of every month and are due within 10 days. Outstanding balances can be settled via Suva Bank of Baroda account BARB0DTSUVA.";
      } else if (prompt.includes('maintenance') || prompt.includes('repair') || prompt.includes('carpenter')) {
        reply = "Carpenters maintenance roster accepts plumbing, carpentry, and electrical issues. You can raise a ticket under Operations, and our system will route it to the next available crew member.";
      } else {
        reply = "I've recorded that query. Let me know if you would like me to draft a support ticket for the Carpenters Trust Group management team!";
      }

      setTinniMessages(prev => [...prev, { sender: 'tinni', text: reply, timestamp: 'Just now' }]);
      setIsTinniTyping(false);
    }, 1000);
  };

  // Calculate Support stats for dashboard
  const openTickets = localTickets.filter(t => t.status !== 'closed');
  const closedTickets = localTickets.filter(t => t.status === 'closed');
  const totalCount = localTickets.length;

  return (
    <div>
      <div className="view-header">
        <div>
          <h1 className="view-title">Tenant Support & Communications</h1>
          <p className="view-subtitle">Access Tinni AI tenant chat assistant, answer tenant inquiries, and record logs.</p>
        </div>

        {/* Support Tabs */}
        <div style={{ display: 'flex', background: 'var(--bg-secondary)', padding: 4, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <button className={`btn btn-sm ${activeTab === 'dashboard' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('dashboard')}>
            <BarChart2 size={13} style={{ marginRight: 4 }} /> Dashboard
          </button>
          <button className={`btn btn-sm ${activeTab === 'console' ? 'btn-primary' : 'btn-secondary'}`} style={{ marginLeft: 4 }} onClick={() => setActiveTab('console')}>
            <MessageSquare size={13} style={{ marginRight: 4 }} /> Inquiries ({openTickets.length})
          </button>
          <button className={`btn btn-sm ${activeTab === 'tinni' ? 'btn-primary' : 'btn-secondary'}`} style={{ marginLeft: 4 }} onClick={() => setActiveTab('tinni')}>
            <Sparkles size={13} style={{ marginRight: 4, color: 'var(--brand-color)' }} /> Tinni AI Chat
          </button>
        </div>
      </div>

      {/* 1. SUPPORT DASHBOARD VIEW */}
      {activeTab === 'dashboard' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-header">
                <span>Active Inquiries</span>
                <Clock size={18} style={{ color: 'var(--brand-color)' }} />
              </div>
              <div className="stat-value">{openTickets.length}</div>
              <div className="stat-indicator indicator-up">Waiting response</div>
            </div>
            <div className="stat-card">
              <div className="stat-header">
                <span>Resolved Tickets</span>
                <CheckCircle2 size={18} className="indicator-up" style={{ color: 'var(--color-success)' }} />
              </div>
              <div className="stat-value">{closedTickets.length}</div>
              <div className="stat-indicator text-muted">Closed & Confirmed</div>
            </div>
            <div className="stat-card">
              <div className="stat-header">
                <span>Average Response Time</span>
                <Sparkles size={18} style={{ color: 'var(--brand-color)' }} />
              </div>
              <div className="stat-value">12 Min</div>
              <div className="stat-indicator indicator-up">Powered by Tinni AI</div>
            </div>
          </div>

          <div className="grid-2col" style={{ gridTemplateColumns: '1.2fr 1fr', gap: 20 }}>
            {/* Recent issues */}
            <div className="card-panel">
              <h3 style={{ fontSize: '1rem', marginBottom: 14 }}>Urgent Active Inquiries</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {localTickets.filter(t => t.priority === 'high' && t.status !== 'closed').map(t => (
                  <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-tertiary)', padding: 12, borderRadius: 6, borderLeft: '3px solid var(--color-danger)' }}>
                    <div>
                      <strong style={{ fontSize: 13, color: '#ffffff' }}>{t.subject}</strong>
                      <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>{t.tenantName} | {t.dateRaised}</p>
                    </div>
                    <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: 11 }} onClick={() => { setSelectedTicketId(t.id); setActiveTab('console'); }}>
                      Respond
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Assist helper */}
            <div className="card-panel">
              <h3 style={{ fontSize: '1rem', marginBottom: 14 }}>Support Category distribution</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                    <span>Billing Inquiries</span>
                    <span>40%</span>
                  </div>
                  <div style={{ height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 3 }}>
                    <div style={{ width: '40%', height: '100%', background: 'var(--brand-color)', borderRadius: 3 }} />
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                    <span>Maintenance & Carpentry</span>
                    <span>35%</span>
                  </div>
                  <div style={{ height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 3 }}>
                    <div style={{ width: '35%', height: '100%', background: 'var(--brand-color)', borderRadius: 3 }} />
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                    <span>Signage/Permits</span>
                    <span>25%</span>
                  </div>
                  <div style={{ height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 3 }}>
                    <div style={{ width: '25%', height: '100%', background: 'var(--brand-color)', borderRadius: 3 }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. SUPPORT INQUIRIES & CHAT */}
      {activeTab === 'console' && (
        <div className="grid-2col" style={{ gridTemplateColumns: '1.2fr 2fr', gap: 20 }}>
          {/* Ticket list view */}
          <div className="card-panel" style={{ padding: 0, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid var(--border-color)', marginBottom: 10 }}>
              <h3 style={{ fontSize: '0.95rem', margin: 0 }}>Open Inquiries ({openTickets.length})</h3>
              <button 
                className="btn btn-primary btn-sm" 
                style={{ padding: '6px 12px', fontSize: 11 }}
                onClick={() => setShowCreateModal(true)}
              >
                Create Issue
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', overflowY: 'auto', maxHeight: 420 }}>
              {currentItems.map(ticket => {
                const isSelected = selectedTicketId === ticket.id;
                return (
                  <div 
                    key={ticket.id} 
                    onClick={() => setSelectedTicketId(ticket.id)}
                    style={{ 
                      padding: 12, 
                      backgroundColor: isSelected ? 'var(--bg-accent-alpha)' : 'var(--bg-tertiary)', 
                      border: `1px solid ${isSelected ? 'var(--brand-color)' : 'var(--border-color)'}`,
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--brand-color)' }}>{ticket.id}</span>
                      <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>{ticket.lastUpdated}</span>
                    </div>
                    <div style={{ fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {ticket.subject}
                    </div>
                    
                    {/* Metadata requested */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6, fontSize: 9 }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Raised: {ticket.dateRaised || '2026-06-01'}</span>
                      <span style={{ color: 'var(--text-muted)' }}>•</span>
                      <span style={{ color: 'var(--text-secondary)' }}>{calculateAge(ticket.dateRaised || '2026-06-01')}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                      <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>Tenant: {ticket.tenantName}</span>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <span className={`badge ${ticket.priority === 'high' ? 'badge-danger' : 'badge-warning'}`} style={{ fontSize: 8, padding: '1px 5px' }}>
                          {ticket.priority || 'medium'}
                        </span>
                        <span className={`badge ${ticket.status === 'closed' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: 8, padding: '1px 5px' }}>
                          {ticket.status}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {renderPaginationControls()}
          </div>

          {/* Chat thread box */}
          <div className="card-panel" style={{ padding: 0, display: 'flex', flexDirection: 'column', height: 460 }}>
            {selectedTicket ? (
              <>
                {/* Chat Header */}
                <div style={{ padding: 16, borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                  <div>
                    <h3 style={{ fontSize: '0.95rem' }}>{selectedTicket.subject}</h3>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
                      Tenant: {selectedTicket.tenantName} ({selectedTicket.propertyId}) | Age: {calculateAge(selectedTicket.dateRaised || '2026-06-01')}
                    </div>
                  </div>
                  
                  {/* Status update controls requested */}
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <select 
                      value={selectedTicket.status} 
                      onChange={(e) => handleStatusChange(selectedTicket.id, e.target.value)}
                      className="form-select"
                      style={{ padding: '4px 8px', fontSize: 10, width: 100 }}
                    >
                      <option value="open">Open</option>
                      <option value="in-progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>

                    <button 
                      className={`btn btn-sm ${selectedTicket.status === 'closed' ? 'btn-primary' : 'btn-danger'}`} 
                      style={{ padding: '5px 10px', fontSize: 10 }}
                      onClick={() => handleToggleClose(selectedTicket.id)}
                    >
                      {selectedTicket.status === 'closed' ? 'Reopen Ticket' : 'Close Ticket'}
                    </button>
                  </div>
                </div>

                {/* Messages List */}
                <div style={{ flex: 1, padding: 18, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {selectedTicket.messages.map((msg, index) => {
                    const isAdmin = msg.sender === 'admin';
                    return (
                      <div 
                        key={index}
                        style={{ 
                          alignSelf: isAdmin ? 'flex-end' : 'flex-start',
                          maxWidth: '75%',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: isAdmin ? 'flex-end' : 'flex-start'
                        }}
                      >
                        <div 
                          style={{ 
                            padding: '8px 12px', 
                            borderRadius: 'var(--radius-md)', 
                            backgroundColor: isAdmin ? 'var(--brand-color)' : 'var(--bg-tertiary)',
                            color: isAdmin ? '#000000' : 'var(--text-primary)',
                            fontWeight: 500,
                            fontSize: '0.825rem',
                            border: isAdmin ? 'none' : '1px solid var(--border-color)'
                          }}
                        >
                          {msg.text}
                        </div>
                        <span style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 4 }}>
                          {msg.timestamp}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Input reply form with Mic icon */}
                <form onSubmit={handleSendAdminMessage} style={{ padding: 12, borderTop: '1px solid var(--border-color)', display: 'flex', gap: 8 }}>
                  <button 
                    type="button" 
                    onClick={() => toggleSpeechRecognition('admin')}
                    className={`btn ${isListening ? 'btn-danger' : 'btn-secondary'}`}
                    style={{ padding: 10, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    title="Speak message (Speech-to-Text)"
                  >
                    {isListening ? <MicOff size={15} style={{ animation: 'pulse 1s infinite' }} /> : <Mic size={15} />}
                  </button>
                  <input 
                    type="text" 
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder={isListening ? "Listening to speech..." : "Type response to tenant..."} 
                    className="form-input" 
                    style={{ flex: 1 }}
                  />
                  <button type="submit" className="btn btn-primary" style={{ padding: '10px 14px' }}>
                    <Send size={14} />
                  </button>
                </form>
              </>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, color: 'var(--text-muted)' }}>
                <MessageSquare size={36} style={{ marginBottom: 12 }} />
                <p>Select a ticket thread from the left menu to view correspondence.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. TINNI AI CHAT VIEW */}
      {activeTab === 'tinni' && (
        <div className="card-panel" style={{ padding: 0, display: 'flex', flexDirection: 'column', height: 480, maxWidth: 800, margin: '0 auto' }}>
          {/* Header */}
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--bg-accent-alpha)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--brand-color)' }}>
                <Sparkles size={16} style={{ color: 'var(--brand-color)' }} />
              </div>
              <div>
                <strong style={{ fontSize: 13, color: 'var(--text-primary)' }}>AI Agent Tinni</strong>
                <span style={{ display: 'block', fontSize: 10, color: 'var(--color-success)' }}>● Copilot Active</span>
              </div>
            </div>
            <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: 10 }} onClick={() => setTinniMessages([{ sender: 'tinni', text: "Chat history cleared. How can I help you today?", timestamp: 'Just now' }])}>
              <RefreshCw size={11} /> Clear history
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, padding: 18, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {tinniMessages.map((msg, index) => {
              const isTinni = msg.sender === 'tinni';
              return (
                <div 
                  key={index}
                  style={{ 
                    alignSelf: isTinni ? 'flex-start' : 'flex-end',
                    maxWidth: '75%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isTinni ? 'flex-start' : 'flex-end'
                  }}
                >
                  <div 
                    style={{ 
                      padding: '10px 14px', 
                      borderRadius: 'var(--radius-md)', 
                      backgroundColor: isTinni ? 'var(--bg-tertiary)' : 'var(--brand-color)',
                      color: isTinni ? 'var(--text-primary)' : '#000000',
                      fontSize: '0.85rem',
                      border: isTinni ? '1px solid var(--border-color)' : 'none',
                      lineHeight: 1.4
                    }}
                  >
                    {msg.text}
                  </div>
                  <span style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 4 }}>
                    {msg.timestamp}
                  </span>
                </div>
              );
            })}
            
            {isTinniTyping && (
              <div style={{ alignSelf: 'flex-start', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', padding: '8px 14px', borderRadius: 8, fontSize: 11, color: 'var(--text-muted)' }}>
                Tinni is thinking...
              </div>
            )}
          </div>

          {/* Input form */}
          <form onSubmit={handleSendTinni} style={{ padding: 12, borderTop: '1px solid var(--border-color)', display: 'flex', gap: 8 }}>
            <button 
              type="button" 
              onClick={() => toggleSpeechRecognition('tinni')}
              className={`btn ${isListening ? 'btn-danger' : 'btn-secondary'}`}
              style={{ padding: 10, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              title="Speak message (Speech-to-Text)"
            >
              {isListening ? <MicOff size={15} /> : <Mic size={15} />}
            </button>
            <input 
              type="text" 
              value={tinniInput}
              onChange={(e) => setTinniInput(e.target.value)}
              placeholder={isListening ? "Listening to voice input..." : "Ask Tinni about leases, billing codes, rules..."} 
              className="form-input" 
              style={{ flex: 1 }}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '10px 14px' }}>
              <Send size={14} />
            </button>
          </form>
        </div>
      )}
      {/* CREATE ISSUE MODAL */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 550 }}>
            <div className="modal-header">
              <h3>Create Issue Ticket</h3>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 20 }}>×</button>
            </div>
             <form onSubmit={handleCreateIssueSubmit}>
              <div className="modal-body">
                {errorMsg && (
                  <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--color-danger)', borderRadius: 6, padding: '10px 14px', color: 'var(--color-danger)', fontSize: 12, marginBottom: 14 }}>
                    {errorMsg}
                  </div>
                )}
                <div className="form-group">
                  <label className="form-label">Subject</label>
                  <input 
                    type="text" 
                    value={issueSubject} 
                    onChange={(e) => setIssueSubject(e.target.value)} 
                    placeholder="e.g. Grinding noise in Lift B" 
                    className="form-input" 
                    required 
                    disabled={submitting}
                  />
                </div>

                <div className="grid-2col" style={{ gap: 16, gridTemplateColumns: '1fr 1fr' }}>
                  <div className="form-group">
                    <label className="form-label">Customer (Tenant)</label>
                    <select 
                      value={issueCustomer} 
                      onChange={(e) => setIssueCustomer(e.target.value)} 
                      className="form-select"
                      required
                      disabled={submitting}
                    >
                      <option value="">-- Select Tenant --</option>
                      {tenants.map(t => (
                        <option key={t.id} value={t.id}>{t.name} ({t.propertyName})</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Raised By (Email)</label>
                    <input 
                      type="email" 
                      value={issueRaisedBy} 
                      onChange={(e) => setIssueRaisedBy(e.target.value)} 
                      placeholder="e.g. tenant@example.com" 
                      className="form-input" 
                      required 
                      disabled={submitting}
                    />
                  </div>
                </div>

                <div className="grid-2col" style={{ gap: 16, gridTemplateColumns: '1fr 1fr' }}>
                  <div className="form-group">
                    <label className="form-label">Priority</label>
                    <select 
                      value={issuePriority} 
                      onChange={(e) => setIssuePriority(e.target.value)} 
                      className="form-select"
                      disabled={submitting}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select 
                      value={issueStatus} 
                      onChange={(e) => setIssueStatus(e.target.value)} 
                      className="form-select"
                      disabled={submitting}
                    >
                      <option value="Open">Open</option>
                      <option value="Replied">Replied</option>
                      <option value="On Hold">On Hold</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Company</label>
                  <input 
                    type="text" 
                    value={issueCompany} 
                    onChange={(e) => setIssueCompany(e.target.value)} 
                    className="form-input" 
                    required 
                    disabled={submitting}
                  />
                </div>

                <div className="grid-2col" style={{ gap: 16, gridTemplateColumns: '1fr 1fr' }}>
                  <div className="form-group">
                    <label className="form-label">Booking Number</label>
                    <select
                      value={selectedBookingNumber}
                      onChange={(e) => setSelectedBookingNumber(e.target.value)}
                      className="form-select"
                      disabled={submitting}
                    >
                      <option value="">-- Link to Booking --</option>
                      {bookingList.map(bNo => (
                        <option key={bNo} value={bNo}>{bNo}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Issue List Type</label>
                    <select
                      value={selectedIssueList}
                      onChange={(e) => setSelectedIssueList(e.target.value)}
                      className="form-select"
                      disabled={submitting}
                    >
                      {Object.keys(MOCK_ISSUE_LISTS).map(lstName => (
                        <option key={lstName} value={lstName}>{lstName}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Sub Issue List Table from selection */}
                <div style={{ marginTop: 10, marginBottom: 14 }}>
                  <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>Issue Selection Table</h4>
                  <div style={{ border: '1px solid var(--border-color)', borderRadius: 8, overflow: 'hidden', background: 'var(--bg-secondary)' }}>
                    <table className="custom-table" style={{ margin: 0, fontSize: 12 }}>
                      <thead>
                        <tr>
                          <th style={{ width: 40, textAlign: 'center' }}>
                            <input 
                              type="checkbox" 
                              checked={issueListRows.length > 0 && issueListRows.every(r => r.selected)}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setIssueListRows(issueListRows.map(r => ({ ...r, selected: checked })));
                              }}
                            />
                          </th>
                          <th style={{ width: 50, textAlign: 'center' }}>No.</th>
                          <th style={{ width: 70, textAlign: 'center' }}>Agreed</th>
                          <th>Issue</th>
                          <th style={{ width: 50, textAlign: 'center' }}><Settings size={14} style={{ color: 'var(--text-muted)' }} /></th>
                        </tr>
                      </thead>
                      <tbody>
                        {issueListRows.map((row, idx) => (
                          <tr key={idx} style={{ backgroundColor: row.selected ? 'var(--bg-accent-alpha)' : '' }}>
                            <td style={{ textAlign: 'center' }}>
                              <input 
                                type="checkbox" 
                                checked={row.selected}
                                onChange={(e) => {
                                  const checked = e.target.checked;
                                  setIssueListRows(issueListRows.map((r, i) => i === idx ? { ...r, selected: checked } : r));
                                }}
                              />
                            </td>
                            <td style={{ textAlign: 'center', fontWeight: 600 }}>{row.no}</td>
                            <td style={{ textAlign: 'center' }}>
                              <input 
                                type="checkbox" 
                                checked={row.agreed}
                                onChange={(e) => {
                                  const checked = e.target.checked;
                                  // Auto-select the row if Agreed is checked
                                  setIssueListRows(issueListRows.map((r, i) => i === idx ? { ...r, agreed: checked, selected: checked ? true : r.selected } : r));
                                }}
                              />
                            </td>
                            <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{row.issue}</td>
                            <td style={{ textAlign: 'center' }}>
                              <button
                                type="button"
                                onClick={() => {
                                  const edited = prompt("Edit Issue Text:", row.issue);
                                  if (edited !== null && edited.trim() !== "") {
                                    setIssueListRows(issueListRows.map((r, i) => i === idx ? { ...r, issue: edited } : r));
                                  }
                                }}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--brand-color)' }}
                              >
                                <Pencil size={12} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea 
                    value={issueDescription} 
                    onChange={(e) => setIssueDescription(e.target.value)} 
                    rows="3" 
                    placeholder="Enter issue details..." 
                    className="form-textarea" 
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)} disabled={submitting}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Syncing with ERPNext...' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
