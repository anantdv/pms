import React, { useState, useEffect } from 'react';
import { Send, CheckCircle2, MessageSquare, AlertCircle, BarChart2, ShieldAlert, Clock, User, Sparkles, Mic, MicOff, RefreshCw, X, HelpCircle, Check, Play, Pencil, Settings, Paperclip, Activity, FileText, Bell, Phone, Mail, Award, DollarSign } from 'lucide-react';

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

export default function Support({ tickets, onAddMessage, onCreateIssue, tenants = [], properties = [], erpnextConfig }) {
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'issue', 'tinni'
  const [dashboardRole, setDashboardRole] = useState('manager'); // 'tenant', 'technician', 'manager', 'admin'
  const [selectedTicketId, setSelectedTicketId] = useState(tickets[0]?.id || null);
  const [commTab, setCommTab] = useState('public'); // 'public', 'internal', 'emails', 'history'
  const [issueViewMode, setIssueViewMode] = useState('list'); // 'list', 'kanban'
  
  // Create Issue Modal Form States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [issueSubject, setIssueSubject] = useState('');
  const [issueCustomer, setIssueCustomer] = useState('');
  const [issueRaisedBy, setIssueRaisedBy] = useState('');
  const [issueStatus, setIssueStatus] = useState('Open');
  const [issuePriority, setIssuePriority] = useState('Medium');
  const [issueDescription, setIssueDescription] = useState('');
  const [issueCompany, setIssueCompany] = useState('CARPENTERS PROPERTIES PTE LIMITED');
  
  // Custom Upgrades form fields
  const [issueSubcategory, setIssueSubcategory] = useState('Leakage');
  const [preferredVisitDate, setPreferredVisitDate] = useState('2026-06-18');
  const [isEmergency, setIsEmergency] = useState(false);
  
  // New Booking & Issue List fields states
  const [bookingOptions, setBookingOptions] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [selectedBookingNumber, setSelectedBookingNumber] = useState('');
  const [selectedIssueList, setSelectedIssueList] = useState('Utilities & Infrastructure Issues List');
  const [issueListRows, setIssueListRows] = useState([]);
  
  // Submit status & validation message states
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Internal comment and attachment states
  const [isInternal, setIsInternal] = useState(false);
  const [attachedFile, setAttachedFile] = useState(null);

  // Local state copy of tickets to allow changing status and closing/reopening in the UI
  const [localTickets, setLocalTickets] = useState(tickets);
  const [messageText, setMessageText] = useState('');
  const [isListening, setIsListening] = useState(false);
  
  // Tinni AI Chat State
  const [tinniMessages, setTinniMessages] = useState([
    { sender: 'tinni', text: "Hello! I am Tinni, your Carpenters Estate AI Assistant. Ask me anything about lease standards, maintenance rosters, or billing rules!", timestamp: 'Just now' }
  ]);
  const [tinniInput, setTinniInput] = useState('');
  const [isTinniTyping, setIsTinniTyping] = useState(false);

  // Pagination states & calculations
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    setLocalTickets(tickets);
    if (tickets.length > 0 && !selectedTicketId) {
      setSelectedTicketId(tickets[0].id);
    }
  }, [tickets]);

  useEffect(() => {
    const fetchComments = async () => {
      if (!selectedTicketId || !erpnextConfig || !erpnextConfig.url || String(selectedTicketId).startsWith('SUP-')) {
        return;
      }
      try {
        const res = await fetch(`${erpnextConfig.url}/api/resource/Communication?filters=${encodeURIComponent(JSON.stringify([
          ['reference_doctype', '=', 'Issue'],
          ['reference_name', '=', selectedTicketId]
        ]))}&fields=${encodeURIComponent(JSON.stringify([
          'name', 'sender', 'content', 'creation', 'is_internal'
        ]))}&limit_page_length=100`, {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        if (res.ok) {
          const json = await res.json();
          const comms = json.data || [];
          const fetchedMessages = comms.map(c => {
            const contentClean = c.content ? c.content.replace(/<[^>]*>/g, '') : '';
            return {
              sender: c.sender === 'devteam@anantdv.com' || c.sender === 'admin' ? 'admin' : 'tenant',
              text: contentClean,
              timestamp: c.creation ? c.creation.split('.')[0] : 'Just now',
              is_internal: c.is_internal === 1 || c.is_internal === true
            };
          });

          setLocalTickets(prev => prev.map(t => {
            if (t.id === selectedTicketId) {
              const baseMsg = t.messages && t.messages.length > 0 ? t.messages[0] : null;
              const newMsgs = baseMsg ? [baseMsg, ...fetchedMessages] : fetchedMessages;
              return { ...t, messages: newMsgs };
            }
            return t;
          }));
        }
      } catch (err) {
        console.warn('Failed to fetch communications:', err);
      }
    };
    fetchComments();
  }, [selectedTicketId, erpnextConfig]);

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

  // Fetch detailed Booking options
  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (!erpnextConfig || !erpnextConfig.url) {
        setBookingOptions([
          { value: 'BOOKING-00222', label: 'BOOKING-00222 - Unit: 31CT28 (Cnr Rodwell/ Robertson Roads, Suva, Fiji)', customer: '', property: '31CT28' },
          { value: 'BOOKING-00226', label: 'BOOKING-00226 - Unit: 31GF10 (Public Lobby Corridor, Suva, Fiji)', customer: '', property: '31GF10' }
        ]);
        return;
      }
      setLoadingBookings(true);
      try {
        const res = await fetch(`${erpnextConfig.url}/api/resource/Booking?fields=%5B%22name%22%2C%22customer%22%2C%22property%22%5D&limit_page_length=200`, {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        if (res.ok) {
          const json = await res.json();
          const list = json.data || [];
          setBookingOptions(list.map(b => ({
            value: b.name,
            label: `${b.name} - Unit: ${b.property || 'N/A'} (${b.customer || 'Tenant'})`,
            customer: b.customer,
            property: b.property
          })));
        }
      } catch (e) {
        console.warn('Failed fetching booking details:', e);
      } finally {
        setLoadingBookings(false);
      }
    };
    if (showCreateModal) {
      fetchBookingDetails();
    }
  }, [erpnextConfig, showCreateModal]);

  // Handle booking options auto-selection based on selected customer
  useEffect(() => {
    const customerBookings = bookingOptions.filter(opt => opt.customer === issueCustomer);
    if (customerBookings.length > 0) {
      setSelectedBookingNumber(customerBookings[0].value);
    } else if (bookingOptions.length > 0) {
      setSelectedBookingNumber(bookingOptions[0].value);
    } else {
      setSelectedBookingNumber('');
    }
  }, [issueCustomer, bookingOptions]);

  // Calculate ticket age in days
  const calculateAge = (dateRaised) => {
    const diffTime = Math.abs(new Date('2026-06-16') - new Date(dateRaised));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 0 ? 'Today' : `${diffDays}d ago`;
  };

  // SLA Resolution Timer Configuration
  const getSLATarget = (priority) => {
    switch ((priority || '').toLowerCase()) {
      case 'critical': return { response: 30, resolution: 4 }; // minutes, hours
      case 'high': return { response: 120, resolution: 24 };
      case 'low': return { response: 1440, resolution: 168 };
      default: return { response: 480, resolution: 72 }; // medium
    }
  };

  // Render countdown timer for Resolution
  const renderSLATimer = (ticket) => {
    const target = getSLATarget(ticket.priority);
    const dateRaised = new Date(ticket.dateRaised || '2026-06-16');
    const deadline = new Date(dateRaised.getTime() + target.resolution * 60 * 60 * 1000);
    const now = new Date('2026-06-16T20:25:00'); // current mock time
    
    const diffMs = deadline - now;
    if (diffMs < 0 || ticket.status === 'closed' || ticket.status === 'resolved') {
      return (
        <span className="badge" style={{ background: ticket.status === 'closed' ? 'var(--color-success-bg)' : 'rgba(239,68,68,0.1)', color: ticket.status === 'closed' ? 'var(--color-success)' : 'var(--color-danger)' }}>
          {ticket.status === 'closed' ? 'SLA Met' : 'Breached'}
        </span>
      );
    }
    
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return (
      <span className="badge badge-warning" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
        <Clock size={11} style={{ marginRight: 3 }} /> {diffHrs}h {diffMins}m left
      </span>
    );
  };

  // Convert Ticket to Maintenance Schedule
  const getCsrfToken = () => {
    const cookieValue = document.cookie
      .split('; ')
      .find(row => row.startsWith('sid='))
      ?.split('=')[1];
    return cookieValue || '';
  };

  const handleConvertToMaintenance = async (ticket) => {
    alert(`Converting Ticket ${ticket.id} into an ERPNext Maintenance Schedule...`);
    
    // Resolve matching customer ID
    const matchedTenant = tenants.find(t => t.name === ticket.tenantName || t.id === ticket.customerId || t.name === ticket.customerId);
    const firstTenant = tenants[0];
    const customerId = matchedTenant ? matchedTenant.id : (firstTenant ? firstTenant.id : 'Customer-N/A');

    // Resolve valid Property Group name from ERPNext property list
    let customProperty = 'PROP-2041';
    if (properties && properties.length > 0) {
      customProperty = properties[0].id;
    } else if (matchedTenant && matchedTenant.propertyId && matchedTenant.propertyId !== 'PROP-2041') {
      customProperty = matchedTenant.propertyId;
    }

    // Resolve valid unit/item code from bookings or tenant unitSpec
    let itemCode = 'General Item';
    const matchedBookingOpt = bookingOptions.find(b => b.customer === customerId);
    if (matchedBookingOpt && matchedBookingOpt.property) {
      itemCode = matchedBookingOpt.property;
    } else if (matchedTenant && matchedTenant.unitSpec && matchedTenant.unitSpec !== 'Flat 4B') {
      itemCode = matchedTenant.unitSpec;
    } else if (bookingOptions.length > 0 && bookingOptions[0].property) {
      itemCode = bookingOptions[0].property;
    }

    const payload = {
      customer: customerId,
      transaction_date: new Date().toISOString().split('T')[0],
      custom_property: customProperty,
      periodicity: 'One-time',
      status: 'Draft',
      items: [
        {
          item_code: itemCode,
          start_date: new Date().toISOString().split('T')[0],
          end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          periodicity: 'One-time',
          description: ticket.subject || ticket.issueType || 'Maintenance requested via Helpdesk Support Ticket'
        }
      ],
      schedules: [
        {
          item_code: itemCode,
          scheduled_date: new Date().toISOString().split('T')[0],
          completion_status: 'Pending'
        }
      ]
    };

    if (erpnextConfig && erpnextConfig.url) {
      try {
        const csrfToken = getCsrfToken();
        const res = await fetch(`${erpnextConfig.url}/api/resource/Maintenance%20Schedule`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            ...(csrfToken ? { 'X-Frappe-CSRF-Token': csrfToken } : {})
          },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          alert('Maintenance Schedule successfully created in ERPNext!');
          setLocalTickets(prev => prev.map(t => t.id === ticket.id ? { ...t, status: 'assigned', lastUpdated: 'Just now' } : t));
        } else {
          const errMsg = await res.text();
          console.warn('Failed to create maintenance schedule in ERPNext:', errMsg);
          alert(`Failed to create Maintenance Schedule: ${errMsg}`);
        }
      } catch (err) {
        console.error('Error converting ticket:', err);
        alert(`Error: ${err.message}`);
      }
    } else {
      setLocalTickets(prev => prev.map(t => t.id === ticket.id ? { ...t, status: 'assigned', lastUpdated: 'Just now' } : t));
    }
  };

  // Handle status update
  const handleStatusChange = async (ticketId, nextStatus) => {
    // Map display statuses to exactly matched ERPNext ones
    let displayStatus = nextStatus;
    if (nextStatus.toLowerCase() === 'open') displayStatus = 'Open';
    else if (nextStatus.toLowerCase() === 'replied') displayStatus = 'Replied';
    else if (nextStatus.toLowerCase() === 'on hold' || nextStatus.toLowerCase() === 'onhold' || nextStatus.toLowerCase() === 'on_hold') displayStatus = 'On Hold';
    else if (nextStatus.toLowerCase() === 'resolved') displayStatus = 'Resolved';
    else if (nextStatus.toLowerCase() === 'closed') displayStatus = 'Closed';

    setLocalTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        return { 
          ...t, 
          status: displayStatus, 
          lastUpdated: 'Just now',
          messages: [
            ...t.messages,
            { sender: 'system', text: `Status changed to ${displayStatus}`, timestamp: 'Just now' }
          ]
        };
      }
      return t;
    }));

    if (erpnextConfig && erpnextConfig.url) {
      try {
        await fetch(`${erpnextConfig.url}/api/resource/Issue/${ticketId}`, {
          method: 'PUT',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: displayStatus })
        });
      } catch (err) {
        console.warn('Failed to sync status change to ERPNext:', err);
      }
    }
  };

  // Drag & drop logic for Issue Kanban
  const handleDragStart = (e, ticketId) => {
    e.dataTransfer.setData('text/plain', ticketId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetStatus) => {
    e.preventDefault();
    const ticketId = e.dataTransfer.getData('text/plain');
    if (ticketId) {
      handleStatusChange(ticketId, targetStatus);
    }
  };

  // Click handler to route dashboard lines to issue details
  const handleLineClick = (ticketId) => {
    setSelectedTicketId(ticketId);
    setActiveTab('issue');
  };

  // Add Comment/Response message
  const handleSendAdminMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() && !attachedFile) return;

    if (onAddMessage) {
      await onAddMessage(selectedTicketId, {
        text: messageText,
        isInternal: isInternal,
        file: attachedFile
      });
    }

    setLocalTickets(prev => prev.map(t => {
      if (t.id === selectedTicketId) {
        const fileMsgText = attachedFile ? ` [Attachment: ${attachedFile.name}]` : '';
        return {
          ...t,
          lastUpdated: 'Just now',
          messages: [
            ...t.messages,
            { 
              sender: 'admin', 
              text: messageText + fileMsgText, 
              timestamp: 'Just now',
              is_internal: isInternal
            }
          ]
        };
      }
      return t;
    }));

    setMessageText('');
    setIsInternal(false);
    setAttachedFile(null);
    const fileInput = document.getElementById('comment-file-input');
    if (fileInput) fileInput.value = '';
  };

  // Create Ticket Submit
  const handleCreateIssueSubmit = async (e) => {
    e.preventDefault();
    if (!issueSubject || !issueCustomer || !issueRaisedBy) return;
    setSubmitting(true);
    setErrorMsg('');

    const selectedIssuesText = issueListRows
      .filter(row => row.selected)
      .map(row => `- [${row.agreed ? 'Agreed' : 'Selected'}] ${row.issue}`)
      .join('\n');

    const fullDescription = `${issueDescription}\n\n**Subcategory:** ${issueSubcategory}\n**Preferred Visit:** ${preferredVisitDate}\n**Emergency:** ${isEmergency ? 'YES' : 'NO'}\n**Booking Link:** ${selectedBookingNumber || 'None'}\n\n**Issues Selected:**\n${selectedIssuesText || 'None'}`;

    const payload = {
      subject: issueSubject,
      customer: issueCustomer,
      raised_by: issueRaisedBy,
      status: issueStatus,
      priority: isEmergency ? 'Critical' : issuePriority,
      description: fullDescription,
      company: issueCompany,
      booking_number: selectedBookingNumber,
      main_issues: selectedIssueList
    };

    try {
      if (onCreateIssue) {
        await onCreateIssue(payload);
      }

      // Add to local state copy
      const newTicket = {
        id: `SUP-${Math.floor(800 + Math.random() * 200)}`,
        subject: issueSubject,
        tenantName: issueCustomer,
        status: issueStatus.toLowerCase(),
        priority: isEmergency ? 'critical' : issuePriority.toLowerCase(),
        lastUpdated: 'Just now',
        dateRaised: '2026-06-16',
        category: selectedIssueList,
        messages: [{ sender: 'tenant', text: fullDescription, timestamp: 'Just now' }]
      };
      setLocalTickets(prev => [newTicket, ...prev]);

      // Reset
      setIssueSubject('');
      setIssueCustomer('');
      setIssueRaisedBy('');
      setIssueStatus('Open');
      setIsEmergency(false);
      setIssueDescription('');
      setShowCreateModal(false);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create ticket');
    } finally {
      setSubmitting(false);
    }
  };

  // Tinni AI response simulation
  const handleSendTinni = (e) => {
    e.preventDefault();
    if (!tinniInput.trim()) return;

    const userMsg = { sender: 'user', text: tinniInput, timestamp: 'Just now' };
    setTinniMessages(prev => [...prev, userMsg]);
    setTinniInput('');
    setIsTinniTyping(true);

    setTimeout(() => {
      let reply = "I've checked the guidelines. For standard lease properties, utilities maintenance like plumbing issues are resolved within 24 hours. Would you like me to raise a maintenance ticket for you?";
      if (tinniInput.toLowerCase().includes('emergency') || tinniInput.toLowerCase().includes('leak')) {
        reply = "⚠️ Emergency Alert: Since this is an active leak, I have marked this as Critical and triggered an automatic technician dispatch. An emergency work order is being prepared.";
      }
      setTinniMessages(prev => [...prev, { sender: 'tinni', text: reply, timestamp: 'Just now' }]);
      setIsTinniTyping(false);
    }, 1200);
  };

  // Speech-to-text placeholder
  const toggleSpeechRecognition = (target) => {
    setIsListening(true);
    setTimeout(() => {
      setIsListening(false);
      const text = "Elevator alarm light is blinking constantly.";
      if (target === 'admin') setMessageText(text);
      else setTinniInput(text);
    }, 2000);
  };

  const openTickets = localTickets.filter(t => (t.status || '').toLowerCase() !== 'closed' && (t.status || '').toLowerCase() !== 'resolved');
  const closedTickets = localTickets.filter(t => (t.status || '').toLowerCase() === 'closed' || (t.status || '').toLowerCase() === 'resolved');
  const selectedTicket = localTickets.find(t => String(t.id).toLowerCase() === String(selectedTicketId).toLowerCase());

  const currentItems = localTickets.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(localTickets.length / itemsPerPage);

  const renderPaginationControls = (totalItems) => {
    const pagesCount = Math.ceil(totalItems / itemsPerPage);
    if (pagesCount <= 1) return null;
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, padding: '12px 16px', borderTop: '1px solid var(--border-color)' }}>
        <button 
          className="btn btn-secondary btn-sm" 
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          style={{ padding: '4px 8px', fontSize: 11 }}
        >
          Previous
        </button>
        <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
          Page {currentPage} of {pagesCount}
        </span>
        <button 
          className="btn btn-secondary btn-sm" 
          disabled={currentPage === pagesCount}
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagesCount))}
          style={{ padding: '4px 8px', fontSize: 11 }}
        >
          Next
        </button>
      </div>
    );
  };

  return (
    <div>
      <div className="view-header" style={{ flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className="view-title">Enterprise Helpdesk & Communication</h1>
          <p className="view-subtitle">Monitor service level agreements, communication threads, and automated dispatch controls.</p>
        </div>

        {/* Tab Selector */}
        <div style={{ display: 'flex', background: 'var(--bg-secondary)', padding: 4, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', flexWrap: 'wrap' }}>
          <button className={`btn btn-sm ${activeTab === 'dashboard' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('dashboard')}>
            <BarChart2 size={13} style={{ marginRight: 4 }} /> Dashboard
          </button>
          <button className={`btn btn-sm ${activeTab === 'issue' ? 'btn-primary' : 'btn-secondary'}`} style={{ marginLeft: 4 }} onClick={() => setActiveTab('issue')}>
            <MessageSquare size={13} style={{ marginRight: 4 }} /> Issue ({openTickets.length})
          </button>
          <button className={`btn btn-sm ${activeTab === 'tinni' ? 'btn-primary' : 'btn-secondary'}`} style={{ marginLeft: 4 }} onClick={() => setActiveTab('tinni')}>
            <Sparkles size={13} style={{ marginRight: 4, color: 'var(--brand-color)' }} /> Copilot Tinni
          </button>
        </div>
      </div>

      {/* TAB 1: ROLE-BASED DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* Dashboard Switcher */}
          <div className="card-panel" style={{ display: 'flex', justifyContent: 'center', padding: '10px', gap: 8, flexWrap: 'wrap' }}>
            <button className={`btn btn-sm ${dashboardRole === 'tenant' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setDashboardRole('tenant')}>
              Maintenance Request
            </button>
            <button className={`btn btn-sm ${dashboardRole === 'technician' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setDashboardRole('technician')}>
              Tasks Schedule
            </button>
            <button className={`btn btn-sm ${dashboardRole === 'manager' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setDashboardRole('manager')}>
              SLA
            </button>
            <button className={`btn btn-sm ${dashboardRole === 'admin' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setDashboardRole('admin')}>
              Admin
            </button>
          </div>

          {/* Render stats and widgets dynamically based on role */}
          {dashboardRole === 'tenant' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-header"><span>Your Open Requests</span><Clock size={16} /></div>
                  <div className="stat-value">{openTickets.length}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-header"><span>Completed Requests</span><CheckCircle2 size={16} /></div>
                  <div className="stat-value">{closedTickets.length}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-header"><span>Average Resolution</span><Sparkles size={16} /></div>
                  <div className="stat-value">24 Hours</div>
                </div>
              </div>
              <div className="card-panel">
                <h3 style={{ fontSize: 14, marginBottom: 12 }}>Open Maintenance Requests</h3>
                <div className="table-container">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Subject</th>
                        <th>Status</th>
                        <th>Priority</th>
                        <th>Estimated Visit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {openTickets.map(t => (
                        <tr key={t.id} onClick={() => handleLineClick(t.id)} style={{ cursor: 'pointer' }}>
                          <td>{t.id}</td>
                          <td>{t.subject}</td>
                          <td><span className="badge badge-warning">{t.status}</span></td>
                          <td>{t.priority}</td>
                          <td>2026-06-18</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {dashboardRole === 'technician' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-header"><span>Assigned Work Orders</span><Activity size={16} /></div>
                  <div className="stat-value">5</div>
                </div>
                <div className="stat-card">
                  <div className="stat-header"><span>Tasks Completed Today</span><CheckCircle2 size={16} /></div>
                  <div className="stat-value">3</div>
                </div>
                <div className="stat-card">
                  <div className="stat-header"><span>Pending SLA Limits</span><AlertCircle size={16} /></div>
                  <div className="stat-value">1</div>
                </div>
              </div>
              <div className="card-panel">
                <h3 style={{ fontSize: 14, marginBottom: 12 }}>Assigned Tasks</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {openTickets.map(t => (
                    <div key={t.id} onClick={() => handleLineClick(t.id)} style={{ padding: 14, background: 'var(--bg-tertiary)', borderLeft: '4px solid var(--brand-color)', borderRadius: 6, cursor: 'pointer' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                        <strong>{t.subject}</strong>
                        <span className="badge badge-warning">{t.priority}</span>
                      </div>
                      <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>Ticket: {t.id} | Due by: 2026-06-16 22:00</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {dashboardRole === 'manager' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-header"><span>Active Issues Queue</span><MessageSquare size={16} /></div>
                  <div className="stat-value">{openTickets.length}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-header"><span>SLA Breach Alerts</span><ShieldAlert size={16} /></div>
                  <div className="stat-value" style={{ color: 'var(--color-danger)' }}>{openTickets.filter(t => t.priority === 'critical' || t.priority === 'high').length}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-header"><span>Pending Work Order Cost Approvals</span><FileText size={16} /></div>
                  <div className="stat-value">$18,450</div>
                </div>
              </div>
              
              <div className="grid-2col">
                <div className="card-panel">
                  <h3 style={{ fontSize: 14, marginBottom: 12 }}>SLA Compliance Monitoring</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {openTickets.map(t => (
                      <div key={t.id} onClick={() => handleLineClick(t.id)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 8, background: 'var(--bg-tertiary)', borderRadius: 6, cursor: 'pointer' }}>
                        <span style={{ fontSize: 12, fontWeight: 500 }}>{t.id}: {t.subject}</span>
                        {renderSLATimer(t)}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="card-panel">
                  <h3 style={{ fontSize: 14, marginBottom: 12 }}>Vendor Cost Summaries</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: 4 }}>
                      <span>Pacific Elevators Ltd</span>
                      <strong>$15,000.00</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: 4 }}>
                      <span>Suva Cleaning Services</span>
                      <strong>$8,000.00</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: 4 }}>
                      <span>Fiji Security Solutions</span>
                      <strong>$12,000.00</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {dashboardRole === 'admin' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-header"><span>Global SLA Compliance</span><CheckCircle2 size={16} /></div>
                  <div className="stat-value">94.8%</div>
                </div>
                <div className="stat-card">
                  <div className="stat-header"><span>Total Maintenance Costs YTD</span><DollarSign size={16} /></div>
                  <div className="stat-value">$142,500</div>
                </div>
                <div className="stat-card">
                  <div className="stat-header"><span>Critical System Health</span><ShieldAlert size={16} /></div>
                  <div className="stat-value">98.2%</div>
                </div>
              </div>

              {/* Admin Open Tickets List */}
              <div className="card-panel">
                <h3 style={{ fontSize: 14, marginBottom: 12 }}>Global Ticket Overview Console</h3>
                <div className="table-container">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Subject</th>
                        <th>Tenant</th>
                        <th>Category</th>
                        <th>Priority</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {localTickets.map(t => (
                        <tr key={t.id} onClick={() => handleLineClick(t.id)} style={{ cursor: 'pointer' }}>
                          <td style={{ fontWeight: 600 }}>{t.id}</td>
                          <td>{t.subject}</td>
                          <td>{t.tenantName}</td>
                          <td>{t.category || 'General'}</td>
                          <td>{t.priority}</td>
                          <td><span className={`badge ${t.status === 'closed' ? 'badge-success' : 'badge-warning'}`}>{t.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ISSUE VIEW */}
      {activeTab === 'issue' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Kanban / List Toggle */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button className={`btn btn-sm ${issueViewMode === 'list' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setIssueViewMode('list')}>
              List View
            </button>
            <button className={`btn btn-sm ${issueViewMode === 'kanban' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setIssueViewMode('kanban')}>
              Kanban View
            </button>
          </div>

          {issueViewMode === 'list' ? (
            <div className="grid-2col" style={{ gridTemplateColumns: selectedTicketId ? '1.2fr 2fr' : '1fr', gap: 20 }}>
              {/* Ticket list view sidebar */}
              <div className="card-panel" style={{ padding: 0, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid var(--border-color)', marginBottom: 10 }}>
                  <h3 style={{ fontSize: '0.95rem', margin: 0 }}>Open Issues ({openTickets.length})</h3>
                  <button 
                    className="btn btn-primary btn-sm" 
                    style={{ padding: '6px 12px', fontSize: 11 }}
                    onClick={() => setShowCreateModal(true)}
                  >
                    Create Issue
                  </button>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 8, overflowY: 'auto', maxHeight: 420 }}>
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
                          {renderSLATimer(ticket)}
                        </div>
                        <div style={{ fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {ticket.subject}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 4, fontSize: 11, color: 'var(--text-secondary)' }}>
                          <div>Type: <strong style={{ color: 'var(--text-primary)' }}>{ticket.category || 'Maintenance'}</strong></div>
                          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Tenant: {ticket.tenantName}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {renderPaginationControls(localTickets.length)}
              </div>

              {/* Thread & Details drawer panel */}
              <div className="card-panel" style={{ padding: 0, display: 'flex', flexDirection: 'column', height: 500 }}>
                {selectedTicket ? (
                  <>
                    <div style={{ padding: 16, borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h3 style={{ fontSize: '0.95rem' }}>{selectedTicket.subject}</h3>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
                          Tenant: {selectedTicket.tenantName} | Date: {selectedTicket.dateRaised}
                        </div>
                      </div>
                      
                      {/* Convert controls */}
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <button 
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '5px 10px', fontSize: 10 }}
                          onClick={() => handleConvertToMaintenance(selectedTicket)}
                        >
                          Convert to Maintenance Schedule
                        </button>
                        <select 
                          value={selectedTicket.status} 
                          onChange={(e) => handleStatusChange(selectedTicket.id, e.target.value)}
                          className="form-select"
                          style={{ padding: '4px 8px', fontSize: 10, width: 110 }}
                        >
                          <option value="Open">Open</option>
                          <option value="Replied">Replied</option>
                          <option value="On Hold">On Hold</option>
                          <option value="Resolved">Resolved</option>
                          <option value="Closed">Closed</option>
                        </select>
                      </div>
                    </div>

                    {/* Sub Tab Selector for Thread Details */}
                    <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-tertiary)' }}>
                      {['public', 'internal', 'emails', 'history'].map(t => (
                        <button 
                          key={t}
                          onClick={() => setCommTab(t)}
                          style={{ 
                            flex: 1, 
                            padding: '10px 0', 
                            fontSize: 11, 
                            fontWeight: 600, 
                            border: 'none', 
                            background: 'none', 
                            color: commTab === t ? 'var(--brand-color)' : 'var(--text-secondary)',
                            borderBottom: commTab === t ? '2px solid var(--brand-color)' : 'none',
                            cursor: 'pointer'
                          }}
                        >
                          {t.toUpperCase()}
                        </button>
                      ))}
                    </div>

                    {/* Sub Tab Content */}
                    <div style={{ flex: 1, padding: 16, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {commTab === 'public' && (() => {
                        const publicMsgs = (selectedTicket.messages || []).filter(m => m.sender !== 'system' && !m.is_internal);
                        if (publicMsgs.length === 0) {
                          return <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginTop: 20 }}>No public comments.</div>;
                        }
                        return publicMsgs.map((msg, index) => (
                          <div key={index} style={{ alignSelf: msg.sender === 'admin' ? 'flex-end' : 'flex-start', maxWidth: '75%' }}>
                            <div style={{ padding: '8px 12px', borderRadius: 8, backgroundColor: msg.sender === 'admin' ? 'var(--brand-color)' : 'var(--bg-secondary)', color: msg.sender === 'admin' ? '#000' : 'var(--text-primary)', fontSize: 12 }}>
                              {msg.text}
                            </div>
                            <span style={{ fontSize: 9, color: 'var(--text-muted)', display: 'block', textAlign: msg.sender === 'admin' ? 'right' : 'left', marginTop: 2 }}>{msg.timestamp}</span>
                          </div>
                        ));
                      })()}

                      {commTab === 'internal' && (() => {
                        const internalMsgs = (selectedTicket.messages || []).filter(m => m.is_internal);
                        if (internalMsgs.length === 0) {
                          return <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginTop: 20 }}>No internal comments.</div>;
                        }
                        return internalMsgs.map((msg, index) => (
                          <div key={index} style={{ alignSelf: 'flex-start', maxWidth: '75%', width: '100%' }}>
                            <div style={{ padding: '10px 12px', background: 'rgba(251,191,36,0.1)', borderLeft: '4px solid #fbbf24', borderRadius: 4, fontSize: 11, color: 'var(--text-primary)' }}>
                              <strong>Internal Note:</strong> {msg.text}
                            </div>
                            <span style={{ fontSize: 9, color: 'var(--text-muted)', display: 'block', marginTop: 2 }}>{msg.timestamp}</span>
                          </div>
                        ));
                      })()}

                      {commTab === 'emails' && (
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          No emails synchronized for this ticket.
                        </div>
                      )}

                      {commTab === 'history' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingLeft: 10, borderLeft: '2px solid var(--border-color)' }}>
                          <div style={{ fontSize: 11 }}>
                            <strong style={{ color: 'var(--brand-color)' }}>Created</strong> - {selectedTicket.dateRaised}
                          </div>
                          {(selectedTicket.messages || []).filter(m => m.sender === 'system').map((m, idx) => (
                            <div key={idx} style={{ fontSize: 11 }}>
                              <strong>System Log:</strong> {m.text} - {m.timestamp}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Input text controls */}
                    {(commTab === 'public' || commTab === 'internal') && (
                      <form onSubmit={handleSendAdminMessage} style={{ padding: 12, borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <input 
                            type="text" 
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                            placeholder={isInternal ? "Type internal comment..." : "Type public comment response..."} 
                            className="form-input" 
                            style={{ flex: 1 }}
                          />
                          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '8px 12px', background: 'var(--bg-secondary)', borderRadius: 6, border: '1px solid var(--border-color)', margin: 0 }}>
                            <Paperclip size={14} style={{ color: attachedFile ? 'var(--brand-color)' : 'var(--text-secondary)' }} />
                            <input 
                              type="file" 
                              id="comment-file-input"
                              style={{ display: 'none' }} 
                              onChange={(e) => setAttachedFile(e.target.files[0])} 
                            />
                            {attachedFile && <span style={{ fontSize: 10, marginLeft: 4, maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{attachedFile.name}</span>}
                          </label>
                          <button type="submit" className="btn btn-primary" style={{ padding: '10px 14px' }}>
                            <Send size={14} />
                          </button>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, cursor: 'pointer', color: 'var(--text-secondary)' }}>
                            <input 
                              type="checkbox" 
                              checked={isInternal} 
                              onChange={(e) => setIsInternal(e.target.checked)} 
                            />
                            Internal Comment (Invisible to Tenant)
                          </label>
                          {attachedFile && (
                            <button 
                              type="button" 
                              className="btn btn-secondary btn-sm" 
                              onClick={() => {
                                setAttachedFile(null);
                                const fileInput = document.getElementById('comment-file-input');
                                if (fileInput) fileInput.value = '';
                              }}
                              style={{ padding: '2px 6px', fontSize: 9 }}
                            >
                              Remove Attachment
                            </button>
                          )}
                        </div>
                      </form>
                    )}
                  </>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, color: 'var(--text-muted)' }}>
                    <MessageSquare size={36} style={{ marginBottom: 12 }} />
                    <p>Select a ticket to review communication logs.</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* KANBAN VIEW FOR ISSUES */
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, minHeight: 400 }}>
              {['Open', 'Replied', 'On Hold', 'Resolved', 'Closed'].map(status => {
                const statusTickets = localTickets.filter(t => {
                  const tStatus = (t.status || 'Open').toLowerCase().replace(/[^a-z0-9]/g, '');
                  const colStatus = status.toLowerCase().replace(/[^a-z0-9]/g, '');
                  return tStatus === colStatus;
                });
                return (
                  <div 
                    key={status} 
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, status)}
                    style={{ background: 'var(--bg-tertiary)', padding: 10, borderRadius: 8 }}
                  >
                    <h3 style={{ fontSize: 12, marginBottom: 8, borderBottom: '2px solid var(--border-color)', paddingBottom: 4 }}>
                      {status} ({statusTickets.length})
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {statusTickets.map(t => (
                        <div 
                          key={t.id} 
                          draggable 
                          onDragStart={(e) => handleDragStart(e, t.id)}
                          onClick={() => { setSelectedTicketId(t.id); setIssueViewMode('list'); }}
                          style={{ background: 'var(--bg-secondary)', padding: 8, borderRadius: 6, border: '1px solid var(--border-color)', cursor: 'grab', fontSize: 11 }}
                        >
                          <div style={{ fontWeight: 700, color: 'var(--brand-color)' }}>{t.id}</div>
                          <div style={{ fontWeight: 600, margin: '2px 0' }}>{t.subject}</div>
                          <div style={{ fontSize: 9, color: 'var(--text-secondary)' }}>{t.tenantName}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )
}
        </div>
      )}

      {/* TAB 3: COPILOT TINNI */}
      {activeTab === 'tinni' && (
        <div className="card-panel" style={{ padding: 0, display: 'flex', flexDirection: 'column', height: 480, maxWidth: 800, margin: '0 auto' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--bg-accent-alpha)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={16} style={{ color: 'var(--brand-color)' }} />
              </div>
              <div>
                <strong>Tinni AI Copilot</strong>
                <span style={{ display: 'block', fontSize: 10, color: 'var(--color-success)' }}>● Agent Active</span>
              </div>
            </div>
          </div>

          <div style={{ flex: 1, padding: 18, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {tinniMessages.map((msg, index) => {
              const isTinni = msg.sender === 'tinni';
              return (
                <div key={index} style={{ alignSelf: isTinni ? 'flex-start' : 'flex-end', maxWidth: '75%' }}>
                  <div style={{ padding: '10px 14px', borderRadius: 8, backgroundColor: isTinni ? 'var(--bg-tertiary)' : 'var(--brand-color)', color: isTinni ? 'var(--text-primary)' : '#000', fontSize: 13 }}>
                    {msg.text}
                  </div>
                </div>
              );
            })}
          </div>

          <form onSubmit={handleSendTinni} style={{ padding: 12, borderTop: '1px solid var(--border-color)', display: 'flex', gap: 8 }}>
            <input 
              type="text" 
              value={tinniInput}
              onChange={(e) => setTinniInput(e.target.value)}
              placeholder="Ask Tinni anything..."
              className="form-input"
              style={{ flex: 1 }}
            />
            <button type="submit" className="btn btn-primary">Send</button>
          </form>
        </div>
      )}

      {/* CREATE TICKET MODAL */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 550 }}>
            <div className="modal-header">
              <h3>Create Enterprise Ticket</h3>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 20 }}>×</button>
            </div>
            <form onSubmit={handleCreateIssueSubmit}>
              <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                <div className="form-group">
                  <label className="form-label">Subject</label>
                  <input type="text" value={issueSubject} onChange={(e) => setIssueSubject(e.target.value)} className="form-input" required />
                </div>

                <div className="grid-2col" style={{ gap: 16, gridTemplateColumns: '1fr 1fr' }}>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select value={selectedIssueList} onChange={(e) => setSelectedIssueList(e.target.value)} className="form-select">
                      {Object.keys(MOCK_ISSUE_LISTS).map(lstName => (
                        <option key={lstName} value={lstName}>{lstName}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Subcategory</label>
                    <select value={issueSubcategory} onChange={(e) => setIssueSubcategory(e.target.value)} className="form-select">
                      <option value="Leakage">Leakage</option>
                      <option value="Wiring">Wiring</option>
                      <option value="Heating">Heating</option>
                      <option value="Pest">Pest Infestation</option>
                    </select>
                  </div>
                </div>

                <div className="grid-2col" style={{ gap: 16, gridTemplateColumns: '1fr 1fr' }}>
                  <div className="form-group">
                    <label className="form-label">Customer (Tenant)</label>
                    <select value={issueCustomer} onChange={(e) => setIssueCustomer(e.target.value)} className="form-select" required>
                      <option value="">-- Select Tenant --</option>
                      {tenants.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Raised By (Email)</label>
                    <input type="email" value={issueRaisedBy} onChange={(e) => setIssueRaisedBy(e.target.value)} className="form-input" required />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Booking Number (Mandatory in ERPNext)</label>
                  <select value={selectedBookingNumber} onChange={(e) => setSelectedBookingNumber(e.target.value)} className="form-select" required>
                    <option value="">-- Select Booking --</option>
                    {(() => {
                      const customerBookings = bookingOptions.filter(opt => !issueCustomer || opt.customer === issueCustomer);
                      const bookingsToShow = customerBookings.length > 0 ? customerBookings : bookingOptions;
                      return bookingsToShow.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ));
                    })()}
                  </select>
                </div>

                <div className="grid-2col" style={{ gap: 16, gridTemplateColumns: '1fr 1fr' }}>
                  <div className="form-group">
                    <label className="form-label">Preferred Visit Date</label>
                    <input type="date" value={preferredVisitDate} onChange={(e) => setPreferredVisitDate(e.target.value)} className="form-input" />
                  </div>
                  <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 24 }}>
                    <input type="checkbox" checked={isEmergency} onChange={(e) => setIsEmergency(e.target.checked)} id="emergencyCheck" />
                    <label htmlFor="emergencyCheck" style={{ fontWeight: 600, color: 'var(--color-danger)' }}>Mark as Emergency (Critical SLA)</label>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea value={issueDescription} onChange={(e) => setIssueDescription(e.target.value)} className="form-input" rows="3" />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Ticket</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
