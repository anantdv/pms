import React, { useState, useEffect } from 'react';
import { Hammer, User, Clock, CheckCircle, AlertTriangle, Plus, X, Calendar as CalendarIcon, List, BarChart3, ClipboardList, Building } from 'lucide-react';

export default function Maintenance({ 
  schedules = [], 
  visits = [], 
  tenants = [], 
  properties = [], 
  preSelectedProperty = null, 
  clearPreSelectedProperty, 
  onCreateSchedule, 
  onUpdateScheduleDate, 
  onUpdateScheduleStatus,
  onUpdateVisitStatus, 
  erpnextConfig,
  employees = [],
  onAssignResource,
  onCreateVisit
}) {
  const [showModal, setShowModal] = useState(false);
  const [activeSection, setActiveSection] = useState('schedule'); // 'schedule' or 'visit'
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' or 'list' for schedule section
  
  // Schedule selected item state
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  // Visit selected item state
  const [selectedVisit, setSelectedVisit] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Calendar Year/Month Selection
  const [currentMonth, setCurrentMonth] = useState(5); // June
  const [currentYear, setCurrentYear] = useState(2026);
  const [calendarRange, setCalendarRange] = useState('month');
  const [selectedDay, setSelectedDay] = useState(1);

  // Modal Form States
  const [customer, setCustomer] = useState('');
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [company, setCompany] = useState('CARPENTERS PROPERTIES PTE LIMITED');
  const [transactionDate, setTransactionDate] = useState('2026-06-11');
  const [scheduleTime, setScheduleTime] = useState('10:00 AM');
  const [assigning, setAssigning] = useState(false);
  const [tempTeam, setTempTeam] = useState('');
  const [tempResource, setTempResource] = useState('');
  const [submittingSchedule, setSubmittingSchedule] = useState(false);
  const [scheduleStatusMessage, setScheduleStatusMessage] = useState(null);
  const [creatingVisit, setCreatingVisit] = useState(false);
  const [visitStatusMessage, setVisitStatusMessage] = useState(null);
  const [formItems, setFormItems] = useState([
    { item_code: '31AD', start_date: '2026-06-11', end_date: '2026-07-11', periodicity: 'Weekly', description: '' }
  ]);

  useEffect(() => {
    if (preSelectedProperty) {
      setSelectedPropertyId(preSelectedProperty.id);
      const tenantForProp = tenants.find(t => t.propertyId === preSelectedProperty.id);
      if (tenantForProp) {
        setCustomer(tenantForProp.id);
      }
      setShowModal(true);
      clearPreSelectedProperty();
    }
  }, [preSelectedProperty, tenants, clearPreSelectedProperty]);

  // Extract individual schedule items for the calendar view
  const calendarTasks = [];
  schedules.forEach(parentSch => {
    (parentSch.schedules || []).forEach(row => {
      calendarTasks.push({
        id: row.name, // child row name
        parentName: parentSch.name,
        title: `Maintenance: ${row.item_code}`,
        customerName: parentSch.customer_name || parentSch.customer,
        status: (row.completion_status || 'Pending').toLowerCase() === 'pending' ? 'pending' : 'completed',
        date: row.scheduled_date, // YYYY-MM-DD
        itemCode: row.item_code
      });
    });
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
      case 'Fully Completed': return 'var(--color-success)';
      case 'in-progress':
      case 'Partially Completed': return 'var(--color-info)';
      default: return 'var(--color-danger)';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
      case 'Fully Completed':
        return <span className="badge badge-success"><CheckCircle size={12} /> Completed</span>;
      case 'in-progress':
      case 'Partially Completed':
        return <span className="badge badge-info"><Clock size={12} /> In Progress</span>;
      default:
        return <span className="badge badge-danger"><AlertTriangle size={12} /> Pending</span>;
    }
  };

  // Pagination lists
  const currentSchedulesList = schedules.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const currentVisitsList = visits.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(
    (activeSection === 'schedule' ? schedules.length : visits.length) / itemsPerPage
  );

  const renderPaginationControls = (totalItems) => {
    if (totalPages <= 1) return null;
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 24px', borderTop: '1px solid var(--border-color)', fontSize: 13, color: 'var(--text-secondary)', background: 'var(--bg-card)' }}>
        <div>
          Showing <strong>{((currentPage - 1) * itemsPerPage) + 1}</strong> to <strong>{Math.min(currentPage * itemsPerPage, totalItems)}</strong> of <strong>{totalItems}</strong> entries
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

  // Calendar logic
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const startDayOffset = new Date(currentYear, currentMonth, 1).getDay();
  const calendarCells = [];
  for (let i = 0; i < startDayOffset; i++) calendarCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d);

  const getTasksForDay = (day) => {
    if (!day) return [];
    const formattedDay = day < 10 ? `0${day}` : `${day}`;
    const monthNum = currentMonth + 1;
    const formattedMonth = monthNum < 10 ? `0${monthNum}` : `${monthNum}`;
    const dateStr = `${currentYear}-${formattedMonth}-${formattedDay}`;
    return calendarTasks.filter(t => t.date && t.date === dateStr);
  };

  // Rescheduling Drag & Drop
  const handleDragStart = (e, taskId, parentName) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ taskId, parentName }));
  };

  const handleTaskDrop = async (e, targetDay) => {
    e.preventDefault();
    const dataStr = e.dataTransfer.getData('text/plain');
    if (!dataStr) return;
    try {
      const { taskId, parentName } = JSON.parse(dataStr);
      const formattedDay = targetDay < 10 ? `0${targetDay}` : `${targetDay}`;
      const monthNum = currentMonth + 1;
      const formattedMonth = monthNum < 10 ? `0${monthNum}` : `${monthNum}`;
      const dateStr = `${currentYear}-${formattedMonth}-${formattedDay}`;

      if (onUpdateScheduleDate) {
        onUpdateScheduleDate(parentName, taskId, dateStr);
      }
    } catch (err) {
      console.error('Failed to parse drag transfer data:', err);
    }
  };

  const handleKanbanDragStart = (e, scheduleName) => {
    e.dataTransfer.setData('text/plain', scheduleName);
  };

  const handleKanbanDrop = (e, status) => {
    e.preventDefault();
    const scheduleName = e.dataTransfer.getData('text/plain');
    if (scheduleName && onUpdateScheduleStatus) {
      onUpdateScheduleStatus(scheduleName, status);
    }
  };

  // Modal Child Item Rows handlers
  const handleAddItemRow = () => {
    setFormItems([...formItems, { item_code: '31AD', start_date: '2026-06-11', end_date: '2026-07-11', periodicity: 'Weekly', description: '' }]);
  };

  const handleRemoveItemRow = (idx) => {
    if (formItems.length === 1) return;
    setFormItems(formItems.filter((_, i) => i !== idx));
  };

  const handleItemFieldChange = (idx, field, value) => {
    setFormItems(formItems.map((item, i) => {
      if (i === idx) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const generateSchedulesList = (items) => {
    const schedulesList = [];
    items.forEach(item => {
      const start = new Date(item.start_date);
      const end = new Date(item.end_date);
      let curr = new Date(start);
      
      let iterations = 0;
      while (curr <= end && iterations < 500) {
        iterations++;
        const yyyy = curr.getFullYear();
        const mm = String(curr.getMonth() + 1).padStart(2, '0');
        const dd = String(curr.getDate()).padStart(2, '0');
        const dateStr = `${yyyy}-${mm}-${dd}`;
        
        schedulesList.push({
          item_code: item.item_code,
          scheduled_date: dateStr,
          completion_status: 'Pending',
          description: item.description || ''
        });
        
        if (item.periodicity === 'Weekly') {
          curr.setDate(curr.getDate() + 7);
        } else if (item.periodicity === 'Monthly') {
          curr.setMonth(curr.getMonth() + 1);
        } else if (item.periodicity === 'Quarterly') {
          curr.setMonth(curr.getMonth() + 3);
        } else if (item.periodicity === 'Half Yearly') {
          curr.setMonth(curr.getMonth() + 6);
        } else if (item.periodicity === 'Yearly') {
          curr.setFullYear(curr.getFullYear() + 1);
        } else {
          curr.setDate(curr.getDate() + 30);
        }
      }
    });
    return schedulesList;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customer) return;

    const tenantObj = tenants.find(t => t.id === customer);
    const customerName = tenantObj ? tenantObj.name : customer;
    const matchedProp = properties.find(p => p.id === selectedPropertyId);

    const payload = {
      customer,
      customer_name: customerName,
      transaction_date: transactionDate,
      transaction_time: scheduleTime,
      company,
      custom_property: selectedPropertyId,
      propertyId: selectedPropertyId,
      propertyName: matchedProp ? matchedProp.name : '',
      items: formItems,
      schedules: generateSchedulesList(formItems)
    };

    setSubmittingSchedule(true);
    setScheduleStatusMessage(null);
    try {
      await onCreateSchedule(payload);
      setScheduleStatusMessage({ type: 'success', text: 'Maintenance Schedule created & synced with ERPNext!' });
      setTimeout(() => {
        setShowModal(false);
        setScheduleStatusMessage(null);
        // Reset Form
        setCustomer('');
        setSelectedPropertyId('');
        setFormItems([{ item_code: '31AD', start_date: '2026-06-11', end_date: '2026-07-11', periodicity: 'Weekly', description: '' }]);
      }, 1500);
    } catch (err) {
      setScheduleStatusMessage({ type: 'error', text: err.message || 'Failed to sync with ERPNext' });
    } finally {
      setSubmittingSchedule(false);
    }
  };

  return (
    <div>
      {/* Header section with view toggle */}
      <div className="view-header" style={{ marginBottom: 20 }}>
        <div>
          <h1 className="view-title">Maintenance & Facility Operations</h1>
          <p className="view-subtitle">Roster preventative maintenance visits and manage visit logs.</p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {/* Main Tab toggles */}
          <div style={{ display: 'flex', background: 'var(--bg-secondary)', padding: 4, borderRadius: 8, border: '1px solid var(--border-color)' }}>
            <button 
              className={`btn btn-sm ${activeSection === 'schedule' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '6px 12px', fontSize: 11, border: 'none' }}
              onClick={() => { setActiveSection('schedule'); setCurrentPage(1); }}
            >
              Maintenance Schedule
            </button>
            <button 
              className={`btn btn-sm ${activeSection === 'visit' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '6px 12px', fontSize: 11, border: 'none', marginLeft: 4 }}
              onClick={() => { setActiveSection('visit'); setCurrentPage(1); }}
            >
              Maintenance Visit
            </button>
          </div>

          {activeSection === 'schedule' && (
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              <Plus size={16} /> Create
            </button>
          )}
        </div>
      </div>

      {/* SECTION 1: MAINTENANCE SCHEDULE */}
      {activeSection === 'schedule' && (
        <div>
          {/* Subheader controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>Schedule View Mode:</span>
              <button 
                className={`btn btn-sm ${viewMode === 'calendar' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setViewMode('calendar')}
                style={{ padding: '4px 10px', fontSize: 11 }}
              >
                <CalendarIcon size={12} style={{ marginRight: 4 }} /> Calendar
              </button>
              <button 
                className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setViewMode('list')}
                style={{ padding: '4px 10px', fontSize: 11 }}
              >
                <List size={12} style={{ marginRight: 4 }} /> Document List
              </button>
              <button 
                className={`btn btn-sm ${viewMode === 'kanban' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setViewMode('kanban')}
                style={{ padding: '4px 10px', fontSize: 11 }}
              >
                <ClipboardList size={12} style={{ marginRight: 4 }} /> Kanban
              </button>
            </div>
            
            {viewMode === 'calendar' && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <select value={currentMonth} onChange={(e) => setCurrentMonth(Number(e.target.value))} className="form-select" style={{ width: 110, padding: '4px' }}>
                  {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map((m, i) => (
                    <option key={i} value={i}>{m}</option>
                  ))}
                </select>
                <select value={currentYear} onChange={(e) => setCurrentYear(Number(e.target.value))} className="form-select" style={{ width: 85, padding: '4px' }}>
                  {[2025, 2026, 2027, 2028].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <select value={calendarRange} onChange={(e) => setCalendarRange(e.target.value)} className="form-select" style={{ width: 110, padding: '4px' }}>
                  <option value="month">Month View</option>
                  <option value="day">Day View</option>
                </select>
              </div>
            )}
          </div>

          <div className="grid-2col" style={{ gridTemplateColumns: selectedSchedule ? '60% calc(40% - 24px)' : '1fr', gap: 24, transition: 'all 0.3s ease' }}>
            {/* Left Workspace Panel */}
            <div className="card-panel" style={{ padding: viewMode === 'calendar' ? 24 : 0, overflow: 'hidden' }}>
              {viewMode === 'list' ? (
                <div>
                  <div className="table-container">
                    <table className="custom-table">
                      <thead>
                        <tr>
                          <th>Schedule ID</th>
                          <th>Customer Name</th>
                          <th>Schedule Date</th>
                          <th>Items Count</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentSchedulesList.map(sch => (
                          <tr 
                            key={sch.name} 
                            onClick={() => { setSelectedSchedule(sch); setSelectedVisit(null); }}
                            style={{ 
                              cursor: 'pointer',
                              backgroundColor: selectedSchedule?.name === sch.name ? 'var(--bg-accent-alpha)' : ''
                            }}
                          >
                            <td style={{ fontWeight: 600, color: 'var(--brand-color)' }}>{sch.name}</td>
                            <td>{sch.customer_name || sch.customer}</td>
                            <td>{sch.transaction_date} {sch.transaction_time || '10:00 AM'}</td>
                            <td>{sch.items?.length || 0} items</td>
                            <td>
                              <span className={`badge ${sch.status === 'Submitted' ? 'badge-success' : 'badge-warning'}`}>
                                {sch.status || 'Draft'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {renderPaginationControls(schedules.length)}
                </div>
              ) : viewMode === 'kanban' ? (
                /* KANBAN BOARD VIEW */
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(4, 1fr)', 
                  gap: 16, 
                  padding: 16, 
                  overflowX: 'auto', 
                  minHeight: 500, 
                  background: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-md)'
                }}>
                  {['Draft', 'Submitted', 'Completed', 'Closed'].map(status => {
                    const statusSchedules = schedules.filter(sch => {
                      const s = sch.status || 'Draft';
                      if (status === 'Draft') return s === 'Draft' || !s;
                      return s.toLowerCase() === status.toLowerCase();
                    });
                    
                    return (
                      <div 
                        key={status}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => handleKanbanDrop(e, status)}
                        style={{
                          background: 'var(--bg-tertiary)',
                          borderRadius: 'var(--radius-md)',
                          padding: 12,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 12,
                          border: '1px solid var(--border-color)',
                          minWidth: 220,
                          boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.2)'
                        }}
                      >
                        {/* Column Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--border-color)', paddingBottom: 8 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: '#ffffff', letterSpacing: '0.5px' }}>{status}</span>
                          <span className="badge badge-secondary" style={{ fontSize: 10, padding: '2px 6px', background: 'var(--bg-accent-alpha)', color: 'var(--brand-color)' }}>{statusSchedules.length}</span>
                        </div>
                        
                        {/* Cards List */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto', flex: 1, maxHeight: '65vh', paddingBottom: 10 }}>
                          {statusSchedules.map(sch => {
                            const prop = properties.find(p => p.id === sch.custom_property || p.id === sch.propertyId);
                            const propertyGroupName = prop ? prop.name : (sch.propertyName || sch.custom_property || 'N/A');
                            const propertyAddress = prop ? prop.address : 'N/A';
                            
                            const tenant = tenants.find(t => t.id === sch.customer || t.name === sch.customer_name);
                            const unit = tenant ? tenant.unitSpec : 'N/A';
                            
                            const assignedList = sch._assign ? (typeof sch._assign === 'string' ? JSON.parse(sch._assign) : sch._assign) : [];
                            const team = sch.custom_assigned_team || '';
                            const resource = sch.custom_assigned_resource || '';

                            return (
                              <div
                                key={sch.name}
                                draggable="true"
                                onDragStart={(e) => handleKanbanDragStart(e, sch.name)}
                                onClick={() => { setSelectedSchedule(sch); setSelectedVisit(null); }}
                                style={{
                                  background: 'var(--bg-card)',
                                  border: selectedSchedule?.name === sch.name ? '2.5px solid var(--brand-color)' : '1px solid var(--border-color)',
                                  borderRadius: 'var(--radius-sm)',
                                  padding: 12,
                                  cursor: 'grab',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: 8,
                                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                                  boxShadow: 'var(--shadow-sm)',
                                  position: 'relative'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.transform = 'translateY(-2px)';
                                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.transform = 'translateY(0)';
                                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                                }}
                              >
                                {/* ID Header */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--brand-color)', background: 'rgba(255, 221, 0, 0.1)', padding: '2px 6px', borderRadius: 4 }}>
                                    {sch.name}
                                  </span>
                                  <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>
                                    {sch.transaction_date}
                                  </span>
                                </div>

                                {/* Subject */}
                                <div style={{ fontSize: 12, fontWeight: 600, color: '#ffffff', display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 4 }}>
                                  {sch.items && sch.items.length > 0 
                                    ? sch.items.map(item => item.item_code).join(', ') 
                                    : 'General Maintenance'}
                                </div>

                                {/* Tenant */}
                                <div style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)' }}>
                                  <User size={12} style={{ color: 'var(--brand-color)', flexShrink: 0 }} />
                                  <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                    Tenant: <strong>{sch.customer_name || sch.customer || 'N/A'}</strong>
                                  </span>
                                </div>

                                {/* Property Group & Address */}
                                <div style={{ fontSize: 11, display: 'flex', flexDirection: 'column', gap: 2, borderTop: '1px solid var(--border-color)', paddingTop: 6 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)' }}>
                                    <Building size={12} style={{ color: 'var(--brand-color)', flexShrink: 0 }} />
                                    <span style={{ fontWeight: 600, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{propertyGroupName}</span>
                                  </div>
                                  <span style={{ fontSize: 10, color: 'var(--text-muted)', marginLeft: 18, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                    {propertyAddress}
                                  </span>
                                </div>

                                {/* Unit */}
                                <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginLeft: 18 }}>
                                  Unit: <strong style={{ color: '#ffffff' }}>{unit}</strong>
                                </div>

                                {/* Assigned Resource info */}
                                {(team || resource || assignedList.length > 0) && (
                                  <div style={{ fontSize: 10, background: 'rgba(255, 255, 255, 0.03)', padding: 6, borderRadius: 4, border: '1px solid var(--border-color)', marginTop: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    {team && <div>Team: <strong style={{ color: 'var(--brand-color)' }}>{team}</strong></div>}
                                    {resource && <div>Staff: <strong style={{ color: '#ffffff' }}>{resource}</strong></div>}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                          {statusSchedules.length === 0 && (
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', padding: '32px 0', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                              No items
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* CALENDAR RENDER MODE */
                <div>
                  {calendarRange === 'day' ? (
                    <div>
                      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 10, marginBottom: 12 }}>
                        {[...Array(daysInMonth)].map((_, i) => (
                          <button 
                            key={i} 
                            className={`btn ${selectedDay === i + 1 ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setSelectedDay(i + 1)}
                            style={{ padding: '6px 12px', minWidth: 65, fontSize: 10 }}
                          >
                            Day {i + 1}
                          </button>
                        ))}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <h4 style={{ fontSize: 13, color: 'var(--brand-color)', fontWeight: 600 }}>
                          Tasks for {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][currentMonth]} {selectedDay}, {currentYear}:
                        </h4>
                        {getTasksForDay(selectedDay).length > 0 ? (
                          getTasksForDay(selectedDay).map(t => (
                            <div 
                              key={t.id} 
                              onClick={() => {
                                const parentDoc = schedules.find(p => p.name === t.parentName);
                                if (parentDoc) setSelectedSchedule(parentDoc);
                              }}
                              style={{ background: 'var(--bg-tertiary)', border: `1px solid ${getStatusColor(t.status)}`, borderLeftWidth: 4, borderRadius: 6, padding: 12, cursor: 'pointer' }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                <strong style={{ fontSize: 12, color: '#ffffff' }}>{t.title}</strong>
                                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{t.parentName}</span>
                              </div>
                              <p style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Customer: {t.customerName} | Item Code: {t.itemCode}</p>
                            </div>
                          ))
                        ) : (
                          <div style={{ padding: '24px 0', color: 'var(--text-muted)', textAlign: 'center', fontSize: 11 }}>
                            No schedule tasks planned for this day.
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* MONTH VIEW */
                    <>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, textAlign: 'center', fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8 }}>
                        <div>SUN</div><div>MON</div><div>TUE</div><div>WED</div><div>THU</div><div>FRI</div><div>SAT</div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, minHeight: 320 }}>
                        {calendarCells.map((day, idx) => {
                          const dayTasks = getTasksForDay(day);
                          return (
                            <div 
                              key={idx} 
                              onDragOver={(e) => day && e.preventDefault()}
                              onDrop={(e) => day && handleTaskDrop(e, day)}
                              style={{ 
                                background: day ? 'var(--bg-tertiary)' : 'transparent',
                                border: day ? '1px solid var(--border-color)' : 'none',
                                borderRadius: 'var(--radius-sm)',
                                padding: '6px 8px',
                                minHeight: 70,
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between'
                              }}
                            >
                              {day && (
                                <>
                                  <div style={{ fontSize: 11, fontWeight: 600, color: dayTasks.length > 0 ? 'var(--brand-color)' : 'var(--text-secondary)' }}>{day}</div>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginTop: 4 }}>
                                    {dayTasks.map(t => (
                                      <div 
                                        key={t.id} 
                                        draggable="true"
                                        onDragStart={(e) => handleDragStart(e, t.id, t.parentName)}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          const parentDoc = schedules.find(p => p.name === t.parentName);
                                          if (parentDoc) setSelectedSchedule(parentDoc);
                                        }}
                                        style={{ 
                                          fontSize: 8, 
                                          fontWeight: 700, 
                                          backgroundColor: 'rgba(255, 221, 0, 0.1)', 
                                          color: getStatusColor(t.status), 
                                          borderLeft: `2px solid ${getStatusColor(t.status)}`, 
                                          padding: '2px 4px', 
                                          borderRadius: 2, 
                                          cursor: 'grab',
                                          whiteSpace: 'nowrap',
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis'
                                        }}
                                        title={`${t.parentName} row: ${t.id}`}
                                      >
                                        {t.itemCode}
                                      </div>
                                    ))}
                                  </div>
                                </>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Right Side: Selected Schedule detail view */}
            {selectedSchedule && (
              <div className="card-panel" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: 12 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--brand-color)' }}>{selectedSchedule.name}</span>
                  <button onClick={() => setSelectedSchedule(null)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                    <X size={18} />
                  </button>
                </div>
                
                <div>
                  <h3 style={{ fontSize: '1rem', color: '#ffffff', marginBottom: 4 }}>{selectedSchedule.customer_name || selectedSchedule.customer}</h3>
                  <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Company: {selectedSchedule.company}</span>
                  {(selectedSchedule.propertyName || selectedSchedule.propertyId || selectedSchedule.custom_property) && (
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>
                      Property: <strong>{(() => {
                        const propObj = properties.find(p => p.id === selectedSchedule.custom_property || p.id === selectedSchedule.propertyId);
                        return propObj ? `${propObj.name} (${propObj.id})` : (selectedSchedule.propertyName || selectedSchedule.custom_property || selectedSchedule.propertyId);
                      })()}</strong>
                    </div>
                  )}
                </div>

                <div>
                  <span style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'block', marginBottom: 2 }}>Doc status / Schedule Date & Time</span>
                  <strong style={{ fontSize: 12 }}>{selectedSchedule.transaction_date} {selectedSchedule.transaction_time || '10:00 AM'} ({selectedSchedule.status || 'Draft'})</strong>
                </div>

                {/* Team & Resource Assignment */}
                <div style={{ background: 'var(--bg-tertiary)', padding: 12, borderRadius: 6, border: '1px solid var(--border-color)' }}>
                  <h4 style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 8 }}>Assignment & Resources</h4>
                  {(() => {
                    const assignedList = selectedSchedule._assign ? (typeof selectedSchedule._assign === 'string' ? JSON.parse(selectedSchedule._assign) : selectedSchedule._assign) : [];
                    const team = selectedSchedule.custom_assigned_team || '';
                    const resource = selectedSchedule.custom_assigned_resource || '';
                    return (
                      <div>
                        {assignedList.length > 0 || team || resource ? (
                          <div style={{ fontSize: 11, display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {team && <div><strong>Team/Dept</strong>: {team}</div>}
                            {resource && <div><strong>Assigned Person</strong>: {resource}</div>}
                            {assignedList.length > 0 && <div><strong>Assigned Emails</strong>: {assignedList.join(', ')}</div>}
                          </div>
                        ) : (
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>No team or resources assigned.</div>
                        )}
                        
                        {assigning ? (
                          <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8, borderTop: '1px solid var(--border-color)', paddingTop: 10 }}>
                            <div>
                              <label style={{ fontSize: 10, color: 'var(--text-muted)', display: 'block', marginBottom: 2 }}>Select Team/Department</label>
                              <select 
                                value={tempTeam} 
                                onChange={(e) => setTempTeam(e.target.value)} 
                                className="form-select"
                                style={{ fontSize: 11, padding: 4 }}
                              >
                                <option value="">-- Select Team --</option>
                                {['Operations', 'Human Resources', 'Technology', 'Finance', 'Executive'].map(dept => (
                                  <option key={dept} value={dept}>{dept}</option>
                                ))}
                              </select>
                            </div>
                            
                            <div>
                              <label style={{ fontSize: 10, color: 'var(--text-muted)', display: 'block', marginBottom: 2 }}>Select Resource</label>
                              <select 
                                value={tempResource} 
                                onChange={(e) => setTempResource(e.target.value)} 
                                className="form-select"
                                style={{ fontSize: 11, padding: 4 }}
                              >
                                <option value="">-- Select Resource --</option>
                                {employees.filter(emp => !tempTeam || emp.department === tempTeam).map(emp => (
                                  <option key={emp.name || emp.email} value={emp.email || emp.name}>{emp.employee_name || emp.name}</option>
                                ))}
                              </select>
                            </div>
                            
                            <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                              <button 
                                type="button"
                                className="btn btn-primary btn-sm"
                                style={{ fontSize: 10, padding: '3px 8px', flex: 1 }}
                                onClick={() => {
                                  onAssignResource(selectedSchedule.name, tempTeam, tempResource);
                                  setAssigning(false);
                                }}
                              >
                                Save Assignment
                              </button>
                              <button 
                                type="button"
                                className="btn btn-secondary btn-sm"
                                style={{ fontSize: 10, padding: '3px 8px' }}
                                onClick={() => setAssigning(false)}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div style={{ marginTop: 10 }}>
                            <button 
                              type="button"
                              className="btn btn-secondary btn-sm"
                              style={{ fontSize: 10, padding: '4px 8px' }}
                              onClick={() => {
                                setTempTeam(team);
                                setTempResource(resource);
                                setAssigning(true);
                              }}
                            >
                              {team || resource || assignedList.length > 0 ? "Reassign" : "Assign Team & Resource"}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* Create Visit from Schedule Option */}
                <div style={{ background: 'var(--bg-tertiary)', padding: 12, borderRadius: 6, border: '1px solid var(--border-color)', marginTop: 12 }}>
                  {visitStatusMessage && (
                    <div style={{
                      padding: '8px 12px',
                      borderRadius: 6,
                      marginBottom: 8,
                      fontSize: 10,
                      background: visitStatusMessage.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      border: `1px solid ${visitStatusMessage.type === 'success' ? 'var(--color-success)' : 'var(--color-danger)'}`,
                      color: visitStatusMessage.type === 'success' ? 'var(--color-success)' : 'var(--color-danger)'
                    }}>
                      {visitStatusMessage.text}
                    </div>
                  )}
                  <button 
                    type="button"
                    className="btn btn-primary"
                    disabled={creatingVisit}
                    style={{ width: '100%', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                    onClick={async () => {
                      const visitDate = prompt("Enter Visit Date (YYYY-MM-DD):", new Date().toISOString().split('T')[0]);
                      const visitTime = prompt("Enter Visit Time (HH:MM:SS):", "10:00:00");
                      if (visitDate && visitTime) {
                        const visitPayload = {
                          customer: selectedSchedule.customer,
                          customer_name: selectedSchedule.customer_name || selectedSchedule.customer,
                          mntc_date: visitDate,
                          mntc_time: visitTime,
                          completion_status: 'Pending',
                          maintenance_type: 'Preventive',
                          company: selectedSchedule.company || 'CARPENTERS PROPERTIES PTE LIMITED',
                          purposes: (selectedSchedule.schedules || []).map(row => ({
                            item_code: row.item_code,
                            item_name: row.item_code,
                            description: `Maintenance from schedule ${selectedSchedule.name}`,
                            work_done: 'Pending'
                          }))
                        };
                        setCreatingVisit(true);
                        setVisitStatusMessage(null);
                        try {
                          await onCreateVisit(visitPayload);
                          setVisitStatusMessage({ type: 'success', text: 'Visit created & synced successfully!' });
                          setTimeout(() => setVisitStatusMessage(null), 3000);
                        } catch (err) {
                          setVisitStatusMessage({ type: 'error', text: err.message || 'Failed to sync visit.' });
                        } finally {
                          setCreatingVisit(false);
                        }
                      }
                    }}
                  >
                    {creatingVisit ? 'Creating & Syncing...' : '+ Create Maintenance Visit'}
                  </button>
                </div>

                {/* Schedule details table */}
                <div style={{ background: 'var(--bg-tertiary)', padding: 12, borderRadius: 6, border: '1px solid var(--border-color)' }}>
                  <h4 style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>Schedule Roster Rows</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {(selectedSchedule.schedules || []).map((row, i) => (
                      <div key={row.name || i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, paddingBottom: 6, borderBottom: '1px solid var(--border-color)' }}>
                        <div>
                          <strong>{row.item_code}</strong>
                          <span style={{ display: 'block', fontSize: 9, color: 'var(--text-secondary)' }}>Date: {row.scheduled_date}</span>
                        </div>
                        <span style={{ fontSize: 9 }}>{getStatusBadge(row.completion_status)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Items child table details */}
                <div style={{ background: 'var(--bg-tertiary)', padding: 12, borderRadius: 6, border: '1px solid var(--border-color)' }}>
                  <h4 style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>Schedule Item Details</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {(selectedSchedule.items || []).map((row, i) => (
                      <div key={i} style={{ fontSize: 11, paddingBottom: 6 }}>
                        <strong>{row.item_code}</strong> ({row.periodicity})
                        <span style={{ display: 'block', fontSize: 10, color: 'var(--text-secondary)' }}>Range: {row.start_date} to {row.end_date}</span>
                        {row.description && <span style={{ display: 'block', fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>Note: {row.description}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 2: MAINTENANCE VISIT */}
      {activeSection === 'visit' && (
        <div className="grid-2col" style={{ gridTemplateColumns: selectedVisit ? '60% calc(40% - 24px)' : '1fr', gap: 24, transition: 'all 0.3s ease' }}>
          {/* Visits Table */}
          <div className="card-panel" style={{ padding: 0 }}>
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Visit ID</th>
                    <th>Customer</th>
                    <th>Scheduled Date</th>
                    <th>Visit Time</th>
                    <th>Type</th>
                    <th>Completion Status</th>
                  </tr>
                </thead>
                <tbody>
                  {currentVisitsList.map(visit => (
                    <tr 
                      key={visit.name} 
                      onClick={() => { setSelectedVisit(visit); setSelectedSchedule(null); }}
                      style={{ 
                        cursor: 'pointer',
                        backgroundColor: selectedVisit?.name === visit.name ? 'var(--bg-accent-alpha)' : ''
                      }}
                    >
                      <td style={{ fontWeight: 600, color: 'var(--brand-color)' }}>{visit.name}</td>
                      <td>{visit.customer_name || visit.customer}</td>
                      <td>{visit.mntc_date}</td>
                      <td>{visit.mntc_time || '10:00 AM'}</td>
                      <td>{visit.maintenance_type}</td>
                      <td>{getStatusBadge(visit.completion_status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {renderPaginationControls(visits.length)}
          </div>

          {/* Right Side: Selected Visit detail view */}
          {selectedVisit && (
            <div className="card-panel" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: 12 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--brand-color)' }}>{selectedVisit.name}</span>
                <button onClick={() => setSelectedVisit(null)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  <X size={18} />
                </button>
              </div>

              <div>
                <h3 style={{ fontSize: '1rem', color: '#ffffff', marginBottom: 4 }}>{selectedVisit.customer_name || selectedVisit.customer}</h3>
                <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Type: <strong>{selectedVisit.maintenance_type}</strong></span>
              </div>

              {/* Property Details */}
              {(() => {
                const tenantObj = tenants.find(t => t.id === selectedVisit.customer || t.name === selectedVisit.customer_name || t.name === selectedVisit.customer);
                const propObj = tenantObj ? properties.find(p => p.id === tenantObj.propertyId || p.name === tenantObj.propertyName) : null;
                return (
                  <div style={{ background: 'var(--bg-tertiary)', padding: 12, borderRadius: 6, border: '1px solid var(--border-color)' }}>
                    <h4 style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 6 }}>Property Reference</h4>
                    {propObj ? (
                      <div style={{ fontSize: 12 }}>
                        <div><strong>Name</strong>: {propObj.name}</div>
                        <div style={{ marginTop: 2 }}><strong>Address</strong>: {propObj.address}</div>
                        <div style={{ marginTop: 2 }}><strong>Type</strong>: <span style={{ textTransform: 'capitalize' }}>{propObj.type}</span></div>
                      </div>
                    ) : (
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>No property reference found for customer.</div>
                    )}
                  </div>
                );
              })()}

              {/* Assigned To Details */}
              <div style={{ background: 'var(--bg-tertiary)', padding: 12, borderRadius: 6, border: '1px solid var(--border-color)' }}>
                <h4 style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 6 }}>Assigned Staff</h4>
                {(() => {
                  const assignedList = selectedVisit._assign ? (typeof selectedVisit._assign === 'string' ? JSON.parse(selectedVisit._assign) : selectedVisit._assign) : [];
                  const servicePerson = selectedVisit.purposes && selectedVisit.purposes.length > 0 ? selectedVisit.purposes[0].service_person : 'Unassigned';
                  return (
                    <div style={{ fontSize: 12 }}>
                      <div><strong>Service Person</strong>: {servicePerson}</div>
                      {assignedList.length > 0 && <div style={{ marginTop: 2 }}><strong>Assigned Users</strong>: {assignedList.join(', ')}</div>}
                    </div>
                  );
                })()}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div style={{ background: 'rgba(255,255,255,0.01)', padding: 12, borderRadius: 6, border: '1px solid var(--border-color)' }}>
                  <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: 10, textTransform: 'uppercase', marginBottom: 2 }}>Completion Status</span>
                  <span>{getStatusBadge(selectedVisit.completion_status)}</span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.01)', padding: 12, borderRadius: 6, border: '1px solid var(--border-color)' }}>
                  <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: 10, textTransform: 'uppercase', marginBottom: 2 }}>Execution Company</span>
                  <span style={{ fontSize: 11 }}>{selectedVisit.company}</span>
                </div>
              </div>

              <div style={{ background: 'var(--bg-tertiary)', padding: 16, borderRadius: 6, border: '1px solid var(--border-color)' }}>
                <h4 style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 6 }}>Rostered Time Info</h4>
                <div style={{ fontSize: 12 }}>
                  <div><strong>Date</strong>: {selectedVisit.mntc_date}</div>
                  <div style={{ marginTop: 4 }}><strong>Time</strong>: {selectedVisit.mntc_time || '10:00 AM'}</div>
                </div>
              </div>

              {/* Status Change Sync Buttons */}
              <div style={{ marginTop: 'auto', display: 'flex', gap: 10 }}>
                {selectedVisit.completion_status !== 'Fully Completed' && (
                  <>
                    {selectedVisit.completion_status !== 'Partially Completed' && (
                      <button 
                        className="btn btn-primary" 
                        style={{ width: '100%', fontSize: 12 }}
                        onClick={() => {
                          onUpdateVisitStatus(selectedVisit.name, 'in-progress');
                          setSelectedVisit({ ...selectedVisit, completion_status: 'Partially Completed' });
                        }}
                      >
                        Authorize & Start Work
                      </button>
                    )}
                    <button 
                      className="btn btn-success" 
                      style={{ width: '100%', fontSize: 12, background: 'var(--color-success)', color: '#fff' }}
                      onClick={() => {
                        onUpdateVisitStatus(selectedVisit.name, 'completed');
                        setSelectedVisit({ ...selectedVisit, completion_status: 'Fully Completed' });
                      }}
                    >
                      Mark Task Complete
                    </button>
                  </>
                )}
                {selectedVisit.completion_status === 'Fully Completed' && (
                  <button className="btn btn-secondary" style={{ width: '100%', fontSize: 12 }} disabled>
                    Work Order Closed
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* CREATE MAINTENANCE SCHEDULE MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 650 }}>
            <div className="modal-header">
              <h3>Schedule Maintenance</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 20 }}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                {scheduleStatusMessage && (
                  <div style={{
                    padding: '10px 14px',
                    borderRadius: 6,
                    marginBottom: 14,
                    fontSize: 12,
                    background: scheduleStatusMessage.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    border: `1px solid ${scheduleStatusMessage.type === 'success' ? 'var(--color-success)' : 'var(--color-danger)'}`,
                    color: scheduleStatusMessage.type === 'success' ? 'var(--color-success)' : 'var(--color-danger)'
                  }}>
                    {scheduleStatusMessage.text}
                  </div>
                )}
                <div className="grid-3col" style={{ gap: 16, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}>
                  <div className="form-group">
                    <label className="form-label">Property Group</label>
                    <select 
                      value={selectedPropertyId} 
                      onChange={(e) => {
                        setSelectedPropertyId(e.target.value);
                        const linkedTenant = tenants.find(t => t.propertyId === e.target.value);
                        if (linkedTenant) {
                          setCustomer(linkedTenant.id);
                        }
                      }} 
                      className="form-select"
                    >
                      <option value="">-- Select Property --</option>
                      {properties.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Customer (Tenant)</label>
                    <select 
                      value={customer} 
                      onChange={(e) => setCustomer(e.target.value)} 
                      className="form-select"
                      required
                    >
                      <option value="">-- Select Customer --</option>
                      {tenants.map(t => (
                        <option key={t.id} value={t.id}>{t.name} ({t.propertyName})</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Company</label>
                    <input 
                      type="text" 
                      value={company} 
                      onChange={(e) => setCompany(e.target.value)} 
                      className="form-input" 
                      required 
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Schedule Date</label>
                    <input 
                      type="date" 
                      value={transactionDate} 
                      onChange={(e) => setTransactionDate(e.target.value)} 
                      className="form-input" 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Schedule Time</label>
                    <input 
                      type="text" 
                      value={scheduleTime} 
                      onChange={(e) => setScheduleTime(e.target.value)} 
                      placeholder="e.g. 10:00 AM"
                      className="form-input" 
                      required 
                    />
                  </div>
                </div>

                {/* Child Table: Items */}
                <div style={{ borderTop: '1px solid var(--border-color)', marginTop: 20, paddingTop: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <h4 style={{ fontSize: 13, fontWeight: 600 }}>Maintenance Schedule Items ({formItems.length})</h4>
                    <button 
                      type="button" 
                      className="btn btn-secondary btn-sm" 
                      onClick={handleAddItemRow}
                      style={{ padding: '4px 10px', fontSize: 11 }}
                    >
                      + Add Row
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {formItems.map((item, idx) => (
                      <div 
                        key={idx} 
                        style={{ 
                          background: 'var(--bg-tertiary)', 
                          padding: 14, 
                          borderRadius: 6, 
                          border: '1px solid var(--border-color)',
                          position: 'relative' 
                        }}
                      >
                        {formItems.length > 1 && (
                          <button 
                            type="button" 
                            onClick={() => handleRemoveItemRow(idx)}
                            style={{ 
                              position: 'absolute', 
                              right: 8, 
                              top: 8, 
                              background: 'none', 
                              border: 'none', 
                              color: 'var(--color-danger)', 
                              cursor: 'pointer' 
                            }}
                          >
                            <X size={16} />
                          </button>
                        )}
                        <div className="grid-2col" style={{ gap: 12, gridTemplateColumns: '1.2fr 1fr' }}>
                          <div className="form-group">
                            <label className="form-label" style={{ fontSize: 10 }}>Item Code (Space/Asset)</label>
                            <input 
                              type="text" 
                              value={item.item_code} 
                              onChange={(e) => handleItemFieldChange(idx, 'item_code', e.target.value)} 
                              placeholder="e.g. 31AD" 
                              className="form-input"
                              required 
                            />
                          </div>
                          <div className="form-group">
                            <label className="form-label" style={{ fontSize: 10 }}>Periodicity</label>
                            <select 
                              value={item.periodicity} 
                              onChange={(e) => handleItemFieldChange(idx, 'periodicity', e.target.value)}
                              className="form-select"
                            >
                              <option value="Weekly">Weekly</option>
                              <option value="Monthly">Monthly</option>
                              <option value="Quarterly">Quarterly</option>
                              <option value="Half Yearly">Half Yearly</option>
                              <option value="Yearly">Yearly</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid-2col" style={{ gap: 12, gridTemplateColumns: '1fr 1fr', marginTop: 10 }}>
                          <div className="form-group">
                            <label className="form-label" style={{ fontSize: 10 }}>Start Date</label>
                            <input 
                              type="date" 
                              value={item.start_date} 
                              onChange={(e) => handleItemFieldChange(idx, 'start_date', e.target.value)} 
                              className="form-input" 
                              required 
                            />
                          </div>
                          <div className="form-group">
                            <label className="form-label" style={{ fontSize: 10 }}>End Date</label>
                            <input 
                              type="date" 
                              value={item.end_date} 
                              onChange={(e) => handleItemFieldChange(idx, 'end_date', e.target.value)} 
                              className="form-input" 
                              required 
                            />
                          </div>
                        </div>

                        <div className="form-group" style={{ marginTop: 10 }}>
                          <label className="form-label" style={{ fontSize: 10 }}>Description</label>
                          <input 
                            type="text" 
                            value={item.description} 
                            onChange={(e) => handleItemFieldChange(idx, 'description', e.target.value)} 
                            placeholder="Details of operation..." 
                            className="form-input" 
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)} disabled={submittingSchedule}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submittingSchedule}>
                  {submittingSchedule ? 'Syncing with ERPNext...' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
