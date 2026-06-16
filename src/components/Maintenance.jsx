import React, { useState, useEffect } from 'react';
import { Hammer, User, Clock, CheckCircle, AlertTriangle, Plus, X, Calendar as CalendarIcon, List, BarChart3, ClipboardList, Building, Search, Activity, Settings, DollarSign, PenTool, Archive, Check, ArrowRight, UserCheck, ShieldCheck, Mail, Phone, MapPin } from 'lucide-react';

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
  const [activeSection, setActiveSection] = useState('schedule'); // 'schedule', 'visit', 'work_order', 'technician', 'vendor', 'asset'
  const [viewMode, setViewMode] = useState('list'); // 'list', 'kanban', 'calendar' for Maintenance Schedule
  const [maintenanceSearch, setMaintenanceSearch] = useState('');
  
  // Selection states
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [selectedTechnician, setSelectedTechnician] = useState(null);

  // Reassignment states
  const [reassignWOId, setReassignWOId] = useState(null);
  const [reassignTech, setReassignTech] = useState('');
  const [reassignVendor, setReassignVendor] = useState('');

  // Modals
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showWOModal, setShowWOModal] = useState(false);
  const [showConsumeModal, setShowConsumeModal] = useState(false);

  // Schedule Creation Form States
  const [schedType, setSchedType] = useState('PM Schedule'); // PM Schedule, On-demand, Breakdown
  const [schedCustomer, setSchedCustomer] = useState('');
  const [schedPropertyId, setSchedPropertyId] = useState('');
  const [schedUnitSpec, setSchedUnitSpec] = useState('');
  const [schedStartDate, setSchedStartDate] = useState('2026-06-16');
  const [schedEndDate, setSchedEndDate] = useState('2026-07-16');
  const [schedPeriodicity, setSchedPeriodicity] = useState('Weekly');
  const [schedDescription, setSchedDescription] = useState('');
  const [schedVisitDate, setSchedVisitDate] = useState('2026-06-16');
  const [schedVisitTime, setSchedVisitTime] = useState('10:00 AM');
  const [schedAssignedTech, setSchedAssignedTech] = useState('');
  const [schedVisitStatus, setSchedVisitStatus] = useState('Pending');

  const [submittingSchedule, setSubmittingSchedule] = useState(false);
  const [scheduleStatusMessage, setScheduleStatusMessage] = useState(null);

  // Work Order Creation Form States
  const [woPriority, setWoPriority] = useState('Medium');
  const [woCategory, setWoCategory] = useState('Plumbing');
  const [woTechnician, setWoTechnician] = useState('');
  const [woVendor, setWoVendor] = useState('');
  const [woEstCost, setWoEstCost] = useState(0);
  const [woDescription, setWoDescription] = useState('');

  // Consume parts form states
  const [consumeItemCode, setConsumeItemCode] = useState('');
  const [consumeItemQty, setConsumeItemQty] = useState(1);

  // Database stores
  const [localSchedules, setLocalSchedules] = useState([]);
  
  const [workOrders, setWorkOrders] = useState([
    {
      id: "WO-2026-0001",
      relatedTicket: "SUP-728",
      property: "Stratford Court Apartments",
      unit: "Flat 4B",
      category: "Plumbing",
      technician: "Michael Chang",
      vendor: "Pacific Elevators Ltd",
      estHours: 6,
      estCost: 6500,
      actualCost: 0,
      status: "Pending Approval",
      sla: "High",
      dueDate: "2026-06-19",
      consumedItems: []
    },
    {
      id: "WO-2026-0002",
      relatedTicket: "SUP-729",
      property: "Estate Galleria Mall",
      unit: "Suite 102",
      category: "Electrical",
      technician: "Sarah Connor",
      vendor: "Fiji Security Solutions",
      estHours: 3,
      estCost: 1200,
      actualCost: 1200,
      status: "In Progress",
      sla: "Critical",
      dueDate: "2026-06-17",
      consumedItems: [{ item: "Copper Wiring Kit", qty: 2, cost: 150 }]
    }
  ]);

  const [techProfiles, setTechProfiles] = useState([
    { id: "EMP-005", name: "Michael Chang", skill: "Plumbing", certs: "Master Plumber Class-A", availability: "Available", activeJobs: 1, phone: "+679 881 2021", email: "mchang@carpenters.com.fj", img: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=120" },
    { id: "EMP-007", name: "Sarah Connor", skill: "Electrical", certs: "High-Voltage certified", availability: "Available", activeJobs: 2, phone: "+679 992 4812", email: "sconnor@carpenters.com.fj", img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=120" },
    { id: "EMP-012", name: "John Miller", skill: "HVAC", certs: "EPA Universal certified", availability: "On Leave", activeJobs: 0, phone: "+679 773 1928", email: "jmiller@carpenters.com.fj", img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=120" }
  ]);

  const [vendorDir, setVendorDir] = useState([
    { id: "SUP-0001", name: "Pacific Elevators Ltd", group: "Local", type: "Technical Services", rating: 4.8, quotesCount: 5, phone: "+679 330 1199", email: "service@pacificelevators.com", address: "14 Walu Bay Road, Suva, Fiji" },
    { id: "SUP-0002", name: "Suva Cleaning Services", group: "Local", type: "Cleaning", rating: 4.5, quotesCount: 2, phone: "+679 331 4455", email: "cleanup@suvaclean.com", address: "24 Victoria Parade, Suva, Fiji" },
    { id: "SUP-0003", name: "Fiji Security Solutions", group: "Local", type: "Security", rating: 4.7, quotesCount: 8, phone: "+679 338 9988", email: "alerts@fijisecurity.com", address: "88 Laucala Bay Road, Suva, Fiji" }
  ]);

  const [assetsList, setAssetsList] = useState([
    { id: "AST-0091", name: "Emergency Power Generator 80KVA", serial: "G-88129A", warranty: "2028-12-31", amc: "Cummins Fiji", breakdownCount: 1, propertyId: "PROP-2041" },
    { id: "AST-0092", name: "Passenger Elevator Block B", serial: "E-10022", warranty: "Expired", amc: "Otis Elevators", breakdownCount: 3, propertyId: "PROP-2041" }
  ]);

  const [stockItems, setStockItems] = useState([
    { code: "31AD", name: "Submersible Pump 1HP", qty: 5, unitCost: 450 },
    { code: "EL-CABLE", name: "Copper Wiring Kit 50m", qty: 15, unitCost: 150 },
    { code: "HV-FIL", name: "Heavy Duty Air Filter B", qty: 30, unitCost: 85 }
  ]);

  useEffect(() => {
    if (schedules && schedules.length > 0) {
      setLocalSchedules(schedules);
    } else {
      setLocalSchedules([
        { name: "MS-0001", customer: "CUST-0001", customer_name: "Biswajit Maity", transaction_date: "2026-06-16", custom_property: "PROP-2041", type: "PM Schedule", status: "Pending", items: [{ item_code: "Elevator Service", start_date: "2026-06-16", end_date: "2026-07-16", periodicity: "Weekly", description: "Regular monthly check" }] },
        { name: "MS-0002", customer: "CUST-0002", customer_name: "Jane Doe", transaction_date: "2026-06-16", custom_property: "PROP-9910", type: "Breakdown", status: "In Progress", items: [{ item_code: "Lobby Leak", start_date: "2026-06-16", end_date: "2026-06-17", periodicity: "Weekly", description: "Pipe replacement" }] }
      ]);
    }
  }, [schedules]);

  useEffect(() => {
    if (preSelectedProperty) {
      setSchedPropertyId(preSelectedProperty.id);
      const tenantForProp = tenants.find(t => t.propertyId === preSelectedProperty.id);
      if (tenantForProp) {
        setSchedCustomer(tenantForProp.id);
      }
      setShowScheduleModal(true);
      clearPreSelectedProperty();
    }
  }, [preSelectedProperty, tenants, clearPreSelectedProperty]);

  const getPropertyByUnit = (unitId) => {
    const tenant = (tenants || []).find(t => t.unitSpec === unitId || t.id === unitId || t.name === unitId);
    if (tenant) {
      return tenant.propertyGroup || tenant.propertyName;
    }
    const prop = (properties || []).find(p => p.id === unitId || p.name === unitId);
    if (prop) return prop.name;
    return 'N/A';
  };

  const getPropertyNameById = (propId) => {
    const prop = (properties || []).find(p => p.id === propId || p.name === propId);
    return prop ? prop.name : "Stratford Court Apartments";
  };

  // Reassign handler
  const handleReassignSubmit = (woId) => {
    setWorkOrders(prev => prev.map(wo => {
      if (wo.id === woId) {
        return { 
          ...wo, 
          technician: reassignTech || wo.technician, 
          vendor: reassignVendor || wo.vendor 
        };
      }
      return wo;
    }));
    setSelectedWorkOrder(prev => {
      if (prev.id === woId) {
        return { 
          ...prev, 
          technician: reassignTech || prev.technician, 
          vendor: reassignVendor || prev.vendor 
        };
      }
      return prev;
    });
    setReassignWOId(null);
    setReassignTech('');
    setReassignVendor('');
  };

  // Drag & drop logic
  const handleDragStart = (e, scheduleName) => {
    e.dataTransfer.setData('text/plain', scheduleName);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetStatus) => {
    e.preventDefault();
    const scheduleName = e.dataTransfer.getData('text/plain');
    if (scheduleName) {
      setLocalSchedules(prev => prev.map(s => s.name === scheduleName ? { ...s, status: targetStatus } : s));
      if (onUpdateScheduleStatus) {
        onUpdateScheduleStatus(scheduleName, targetStatus);
      }
    }
  };

  // Create Maintenance Schedule Submit
  const handleCreateScheduleSubmit = async (e) => {
    e.preventDefault();
    setSubmittingSchedule(true);
    setScheduleStatusMessage(null);

    const tenantObj = tenants.find(t => t.id === schedCustomer);
    const customerName = tenantObj ? tenantObj.name : schedCustomer;
    const propName = getPropertyNameById(schedPropertyId);

    const payload = {
      customer: schedCustomer,
      customer_name: customerName,
      transaction_date: schedStartDate,
      transaction_time: schedVisitTime,
      type: schedType,
      custom_property: schedPropertyId,
      propertyName: propName,
      status: schedVisitStatus,
      items: [
        {
          item_code: schedUnitSpec || 'General Item',
          start_date: schedStartDate,
          end_date: schedEndDate,
          periodicity: schedPeriodicity,
          description: schedDescription
        }
      ],
      schedules: [
        {
          item_code: schedUnitSpec || 'General Item',
          scheduled_date: schedStartDate,
          completion_status: schedVisitStatus
        }
      ],
      // Visit Details logic fields
      visit_date: schedVisitDate,
      visit_time: schedVisitTime,
      assigned_technician: schedAssignedTech,
      visit_status: schedVisitStatus
    };

    try {
      if (onCreateSchedule) {
        await onCreateSchedule(payload);
      }

      // Add to local state
      const newSched = {
        name: `MS-000${localSchedules.length + 1}`,
        customer: schedCustomer,
        customer_name: customerName,
        transaction_date: schedStartDate,
        custom_property: schedPropertyId,
        type: schedType,
        status: schedVisitStatus,
        items: [
          {
            item_code: schedUnitSpec,
            start_date: schedStartDate,
            end_date: schedEndDate,
            periodicity: schedPeriodicity,
            description: schedDescription
          }
        ]
      };
      setLocalSchedules([newSched, ...localSchedules]);

      setScheduleStatusMessage({ type: 'success', text: 'Maintenance Schedule created & Visit scheduled successfully!' });
      setTimeout(() => {
        setShowScheduleModal(false);
        setScheduleStatusMessage(null);
      }, 1200);
    } catch (err) {
      setScheduleStatusMessage({ type: 'error', text: err.message || 'Failed to sync with ERPNext' });
    } finally {
      setSubmittingSchedule(false);
    }
  };

  const handleWOStatusChange = (woId, newStatus) => {
    setWorkOrders(prev => prev.map(wo => {
      if (wo.id === woId) {
        let actual = wo.actualCost;
        if (newStatus === 'Completed' && wo.actualCost === 0) {
          actual = wo.estCost;
        }
        return { ...wo, status: newStatus, actualCost: actual };
      }
      return wo;
    }));
  };

  const handleCreateWO = (e) => {
    e.preventDefault();
    const newWO = {
      id: `WO-2026-000${workOrders.length + 1}`,
      relatedTicket: "Manual Request",
      property: getPropertyNameById(selectedPropertyId),
      unit: "Flat 1A",
      category: woCategory,
      technician: woTechnician || "None",
      vendor: woVendor || "None",
      estHours: 4,
      estCost: Number(woEstCost),
      actualCost: 0,
      status: Number(woEstCost) < 5000 ? "Assigned" : "Pending Approval",
      sla: woPriority,
      dueDate: "2026-06-20",
      consumedItems: []
    };
    setWorkOrders([newWO, ...workOrders]);
    setShowWOModal(false);
  };

  const handleConsumeItem = (e) => {
    e.preventDefault();
    if (!consumeItemCode) return;
    const item = stockItems.find(s => s.code === consumeItemCode);
    if (!item) return;

    if (item.qty < consumeItemQty) {
      alert("Insufficient stock!");
      return;
    }

    setStockItems(prev => prev.map(s => s.code === consumeItemCode ? { ...s, qty: s.qty - consumeItemQty } : s));
    const cost = item.unitCost * consumeItemQty;
    setWorkOrders(prev => prev.map(wo => {
      if (wo.id === selectedWorkOrder.id) {
        const updatedItems = [...(wo.consumedItems || []), { item: item.name, qty: consumeItemQty, cost }];
        return { ...wo, consumedItems: updatedItems, actualCost: wo.actualCost + cost };
      }
      return wo;
    }));

    setSelectedWorkOrder(prev => ({
      ...prev,
      consumedItems: [...(prev.consumedItems || []), { item: item.name, qty: consumeItemQty, cost }],
      actualCost: prev.actualCost + cost
    }));

    setShowConsumeModal(false);
  };

  const filteredSchedules = localSchedules.filter(sch => {
    const term = maintenanceSearch.toLowerCase();
    const firstItemCode = sch.items && sch.items.length > 0 ? sch.items[0].item_code : '';
    const propName = getPropertyNameById(sch.custom_property) || '';
    return (
      sch.name.toLowerCase().includes(term) ||
      (sch.customer_name || sch.customer || '').toLowerCase().includes(term) ||
      propName.toLowerCase().includes(term) ||
      (sch.type || '').toLowerCase().includes(term)
    );
  });

  return (
    <div>
      <div className="view-header" style={{ flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className="view-title">Maintenance Ops & Facility management</h1>
          <p className="view-subtitle">Roster preventative maintenance visits, manage work orders, assign tasks, and track logs.</p>
        </div>

        {/* Navigation Selector */}
        <div style={{ display: 'flex', background: 'var(--bg-secondary)', padding: 4, borderRadius: 8, border: '1px solid var(--border-color)', flexWrap: 'wrap' }}>
          <button className={`btn btn-sm ${activeSection === 'schedule' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveSection('schedule')}>
            Maintenance Schedule
          </button>
          <button className={`btn btn-sm ${activeSection === 'work_order' ? 'btn-primary' : 'btn-secondary'}`} style={{ marginLeft: 4 }} onClick={() => setActiveSection('work_order')}>
            Work Orders
          </button>
          <button className={`btn btn-sm ${activeSection === 'technician' ? 'btn-primary' : 'btn-secondary'}`} style={{ marginLeft: 4 }} onClick={() => setActiveSection('technician')}>
            Technicians
          </button>
          <button className={`btn btn-sm ${activeSection === 'vendor' ? 'btn-primary' : 'btn-secondary'}`} style={{ marginLeft: 4 }} onClick={() => setActiveSection('vendor')}>
            Vendors
          </button>
          <button className={`btn btn-sm ${activeSection === 'asset' ? 'btn-primary' : 'btn-secondary'}`} style={{ marginLeft: 4 }} onClick={() => setActiveSection('asset')}>
            Assets
          </button>
        </div>
      </div>

      {/* SECTION 1: MAINTENANCE SCHEDULES */}
      {activeSection === 'schedule' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', flexWrap: 'wrap', gap: 10 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <Search size={16} />
                <input 
                  type="text" 
                  placeholder="Search schedules..." 
                  className="form-input" 
                  style={{ width: 200, padding: '4px 10px' }}
                  value={maintenanceSearch}
                  onChange={(e) => setMaintenanceSearch(e.target.value)}
                />
              </div>

              {/* View mode toggle */}
              <div style={{ display: 'flex', background: 'var(--bg-tertiary)', padding: 2, borderRadius: 6 }}>
                {['list', 'kanban', 'calendar'].map(mode => (
                  <button 
                    key={mode} 
                    className={`btn btn-sm ${viewMode === mode ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '3px 8px', fontSize: 10, textTransform: 'capitalize' }}
                    onClick={() => setViewMode(mode)}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
            
            <button className="btn btn-primary btn-sm" onClick={() => setShowScheduleModal(true)}>
              <Plus size={14} /> New Schedule
            </button>
          </div>

          {/* Rendering based on viewMode */}
          <div className="grid-2col" style={{ gridTemplateColumns: selectedSchedule ? '60% calc(40% - 24px)' : '1fr', gap: 24 }}>
            
            {viewMode === 'list' && (
              <div className="card-panel" style={{ padding: 0 }}>
                <div className="table-container">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Schedule ID</th>
                        <th>Type</th>
                        <th>Tenant / Partner</th>
                        <th>Property Group</th>
                        <th>Periodicity</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSchedules.map(sch => {
                        const firstItem = sch.items && sch.items.length > 0 ? sch.items[0] : null;
                        return (
                          <tr key={sch.name} onClick={() => setSelectedSchedule(sch)} style={{ cursor: 'pointer', backgroundColor: selectedSchedule?.name === sch.name ? 'var(--bg-accent-alpha)' : '' }}>
                            <td style={{ fontWeight: 600, color: 'var(--brand-color)' }}>{sch.name}</td>
                            <td><span className="badge badge-secondary" style={{ textTransform: 'none' }}>{sch.type || 'PM Schedule'}</span></td>
                            <td>{sch.customer_name || sch.customer}</td>
                            <td>{getPropertyNameById(sch.custom_property)}</td>
                            <td>{firstItem ? firstItem.periodicity : 'Weekly'}</td>
                            <td>
                              <span className={`badge ${sch.status === 'Completed' ? 'badge-success' : 'badge-warning'}`}>
                                {sch.status || 'Pending'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {viewMode === 'kanban' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                {['Pending', 'In Progress', 'Completed'].map(status => {
                  const statusSchedules = filteredSchedules.filter(s => (s.status || 'Pending') === status);
                  return (
                    <div 
                      key={status} 
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, status)}
                      style={{ background: 'var(--bg-tertiary)', padding: 14, borderRadius: 8, minHeight: 300 }}
                    >
                      <h3 style={{ fontSize: 13, marginBottom: 10, borderBottom: '2px solid var(--border-color)', paddingBottom: 6 }}>
                        {status} ({statusSchedules.length})
                      </h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {statusSchedules.map(sch => (
                          <div 
                            key={sch.name} 
                            draggable 
                            onDragStart={(e) => handleDragStart(e, sch.name)}
                            onClick={() => setSelectedSchedule(sch)}
                            style={{ background: 'var(--bg-secondary)', padding: 10, borderRadius: 6, border: '1px solid var(--border-color)', cursor: 'grab' }}
                          >
                            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--brand-color)' }}>{sch.name}</div>
                            <div style={{ fontSize: 12, fontWeight: 600 }}>{sch.customer_name}</div>
                            <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>Property: {getPropertyNameById(sch.custom_property)}</div>
                            <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>Type: {sch.type}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {viewMode === 'calendar' && (
              <div className="card-panel" style={{ padding: 20 }}>
                <h3 style={{ fontSize: 14, marginBottom: 12 }}>Calendar Schedule Agenda View</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {filteredSchedules.map(sch => (
                    <div key={sch.name} style={{ display: 'flex', gap: 12, padding: 10, background: 'var(--bg-tertiary)', borderRadius: 6 }}>
                      <div style={{ background: 'var(--brand-color)', color: '#fff', padding: '6px 12px', borderRadius: 4, textAlign: 'center', fontWeight: 600 }}>
                        {sch.transaction_date.split('-')[2] || '16'}
                      </div>
                      <div>
                        <strong>{sch.name} - {sch.customer_name}</strong>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Type: {sch.type} | Property: {getPropertyNameById(sch.custom_property)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedSchedule && (
              <div className="card-panel" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: 10 }}>
                  <strong>{selectedSchedule.name}</strong>
                  <button onClick={() => setSelectedSchedule(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={16} /></button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12 }}>
                  <div>Type: <strong>{selectedSchedule.type}</strong></div>
                  <div>Property: <strong>{getPropertyNameById(selectedSchedule.custom_property)}</strong></div>
                  <div>Tenant Name: <strong>{selectedSchedule.customer_name}</strong></div>
                  <div>Start Date: <strong>{selectedSchedule.transaction_date}</strong></div>
                  <div>Status: <strong>{selectedSchedule.status || 'Pending'}</strong></div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 2: WORK ORDERS */}
      {activeSection === 'work_order' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px' }}>
            <span style={{ fontSize: 14, fontWeight: 700 }}>Maintenance Work Orders</span>
            <button className="btn btn-primary btn-sm" onClick={() => setShowWOModal(true)}>
              <Plus size={14} /> Create Work Order
            </button>
          </div>

          <div className="grid-2col" style={{ gridTemplateColumns: selectedWorkOrder ? '60% calc(40% - 24px)' : '1fr', gap: 24 }}>
            <div className="card-panel" style={{ padding: 0 }}>
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>WO ID</th>
                      <th>Property</th>
                      <th>Category</th>
                      <th>Estimated Cost</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workOrders.map(wo => (
                      <tr key={wo.id} onClick={() => setSelectedWorkOrder(wo)} style={{ cursor: 'pointer', backgroundColor: selectedWorkOrder?.id === wo.id ? 'var(--bg-accent-alpha)' : '' }}>
                        <td style={{ fontWeight: 600, color: 'var(--brand-color)' }}>{wo.id}</td>
                        <td>{wo.property}</td>
                        <td>{wo.category}</td>
                        <td>${wo.estCost.toLocaleString()}</td>
                        <td>
                          <span className={`badge ${wo.status === 'Completed' ? 'badge-success' : wo.status === 'Pending Approval' ? 'badge-warning' : 'badge-info'}`}>
                            {wo.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {selectedWorkOrder && (
              <div className="card-panel" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: 10 }}>
                  <strong>{selectedWorkOrder.id} Details</strong>
                  <button onClick={() => setSelectedWorkOrder(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={16} /></button>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12 }}>
                  <div>Status: <strong style={{ color: 'var(--brand-color)' }}>{selectedWorkOrder.status}</strong></div>
                  <div>Estimated Cost: <strong>${selectedWorkOrder.estCost.toLocaleString()}</strong></div>
                  <div>Actual Cost: <strong>${selectedWorkOrder.actualCost.toLocaleString()}</strong></div>
                  <div>Assigned Vendor: <strong>{selectedWorkOrder.vendor}</strong></div>
                  <div>Assigned Technician: <strong>{selectedWorkOrder.technician}</strong></div>
                </div>

                {/* Technician & Vendor Reassign Interface */}
                <div style={{ border: '1px solid var(--border-color)', padding: 12, borderRadius: 6, background: 'var(--bg-tertiary)' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 8 }}>Reassign Resource Settings</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div>
                      <label style={{ fontSize: 10, display: 'block', color: 'var(--text-secondary)' }}>New Technician</label>
                      <select value={reassignTech} onChange={(e) => setReassignTech(e.target.value)} className="form-select" style={{ padding: 4, fontSize: 11 }}>
                        <option value="">-- Reassign Tech --</option>
                        {techProfiles.map(t => (
                          <option key={t.id} value={t.name}>{t.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: 10, display: 'block', color: 'var(--text-secondary)' }}>New Vendor</label>
                      <select value={reassignVendor} onChange={(e) => setReassignVendor(e.target.value)} className="form-select" style={{ padding: 4, fontSize: 11 }}>
                        <option value="">-- Reassign Vendor --</option>
                        {vendorDir.map(v => (
                          <option key={v.id} value={v.name}>{v.name}</option>
                        ))}
                      </select>
                    </div>
                    <button className="btn btn-primary btn-sm" style={{ marginTop: 4 }} onClick={() => handleReassignSubmit(selectedWorkOrder.id)}>Save Assignment</button>
                  </div>
                </div>

                {/* Approvals button */}
                {selectedWorkOrder.status === 'Pending Approval' && (
                  <button className="btn btn-primary" onClick={() => handleWOStatusChange(selectedWorkOrder.id, 'Assigned')}>
                    <Check size={14} style={{ marginRight: 6 }} /> Approve Work Order
                  </button>
                )}

                {/* Stock consumption */}
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)' }}>Material Consumed</span>
                    <button className="btn btn-secondary btn-sm" style={{ padding: '2px 6px', fontSize: 10 }} onClick={() => setShowConsumeModal(true)}>+ Consume Part</button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {(selectedWorkOrder.consumedItems || []).map((c, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, background: 'var(--bg-tertiary)', padding: 6, borderRadius: 4 }}>
                        <span>{c.item} (x{c.qty})</span>
                        <strong>${c.cost}</strong>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Lifecycle status updates */}
                {selectedWorkOrder.status !== 'Pending Approval' && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                    <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => handleWOStatusChange(selectedWorkOrder.id, 'In Progress')}>Start Job</button>
                    <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => handleWOStatusChange(selectedWorkOrder.id, 'Completed')}>Complete Job</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 3: TECHNICIANS */}
      {activeSection === 'technician' && (
        <div className="grid-2col" style={{ gridTemplateColumns: selectedTechnician ? '60% calc(40% - 24px)' : '1fr', gap: 24 }}>
          <div className="card-panel">
            <h3 style={{ fontSize: 15, marginBottom: 14 }}>Active Technicians Directory</h3>
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Tech Name</th>
                    <th>Skill Category</th>
                    <th>Certifications</th>
                    <th>Availability</th>
                  </tr>
                </thead>
                <tbody>
                  {techProfiles.map(tech => (
                    <tr key={tech.id} onClick={() => setSelectedTechnician(tech)} style={{ cursor: 'pointer', backgroundColor: selectedTechnician?.id === tech.id ? 'var(--bg-accent-alpha)' : '' }}>
                      <td><strong>{tech.name}</strong></td>
                      <td>{tech.skill}</td>
                      <td>{tech.certs}</td>
                      <td><span className={`badge ${tech.availability === 'Available' ? 'badge-success' : 'badge-warning'}`}>{tech.availability}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {selectedTechnician && (
            <div className="card-panel" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: 10 }}>
                <strong>{selectedTechnician.name} Details</strong>
                <button onClick={() => setSelectedTechnician(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={16} /></button>
              </div>

              <div style={{ display: 'flex', gap: 14, alignItems: 'center', background: 'var(--bg-tertiary)', padding: 12, borderRadius: 8 }}>
                <img 
                  src={selectedTechnician.img} 
                  alt={selectedTechnician.name} 
                  style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--brand-color)' }}
                />
                <div>
                  <h4 style={{ fontSize: 14, margin: 0 }}>{selectedTechnician.name}</h4>
                  <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Skill: {selectedTechnician.skill}</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Award size={14} /> Certs: {selectedTechnician.certs}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Phone size={14} /> Phone: {selectedTechnician.phone}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Mail size={14} /> Email: {selectedTechnician.email}</div>
                <div>Status: <span className="badge badge-success">{selectedTechnician.availability}</span></div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SECTION 4: VENDORS */}
      {activeSection === 'vendor' && (
        <div className="grid-2col" style={{ gridTemplateColumns: selectedVendor ? '60% calc(40% - 24px)' : '1fr', gap: 24 }}>
          <div className="card-panel">
            <h3 style={{ fontSize: 15, marginBottom: 14 }}>Vendor Directory & Quotations Log</h3>
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Vendor ID</th>
                    <th>Vendor Name</th>
                    <th>Service Category</th>
                    <th>Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {vendorDir.map(v => (
                    <tr key={v.id} onClick={() => setSelectedVendor(v)} style={{ cursor: 'pointer', backgroundColor: selectedVendor?.id === v.id ? 'var(--bg-accent-alpha)' : '' }}>
                      <td style={{ fontWeight: 600, color: 'var(--brand-color)' }}>{v.id}</td>
                      <td>{v.name}</td>
                      <td>{v.type}</td>
                      <td>⭐ {v.rating}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {selectedVendor && (
            <div className="card-panel" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: 10 }}>
                <strong>{selectedVendor.name} Details</strong>
                <button onClick={() => setSelectedVendor(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={16} /></button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12 }}>
                <div>Vendor Group: <strong>{selectedVendor.group}</strong></div>
                <div>Category Type: <strong>{selectedVendor.type}</strong></div>
                <div>Phone: <strong>{selectedVendor.phone}</strong></div>
                <div>Email: <strong>{selectedVendor.email}</strong></div>
                <div>Address: <strong>{selectedVendor.address}</strong></div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SECTION 5: ASSETS */}
      {activeSection === 'asset' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card-panel">
            <h3 style={{ fontSize: 15, marginBottom: 14 }}>Assets Warranty & AMC Management</h3>
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Asset ID</th>
                    <th>Asset Name</th>
                    <th>Property Name</th>
                    <th>Warranty Expiry</th>
                    <th>AMC status</th>
                    <th>Breakdowns YTD</th>
                  </tr>
                </thead>
                <tbody>
                  {assetsList.map(a => (
                    <tr key={a.id}>
                      <td style={{ fontWeight: 600 }}>{a.id}</td>
                      <td>{a.name}</td>
                      <td><strong>{getPropertyNameById(a.propertyId)}</strong></td>
                      <td>{a.warranty}</td>
                      <td>Active Contract ({a.amc})</td>
                      <td><span className="badge badge-success">{a.breakdownCount} breakdowns</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CREATE MAINTENANCE SCHEDULE MODAL */}
      {showScheduleModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 550 }}>
            <div className="modal-header">
              <h3>Create Maintenance Schedule</h3>
              <button onClick={() => setShowScheduleModal(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 20 }}>×</button>
            </div>
            <form onSubmit={handleCreateScheduleSubmit}>
              <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                {scheduleStatusMessage && (
                  <div style={{ background: scheduleStatusMessage.type === 'success' ? 'rgba(6,95,70,0.1)' : 'rgba(239,68,68,0.1)', padding: 10, borderRadius: 6, fontSize: 12, marginBottom: 14 }}>
                    {scheduleStatusMessage.text}
                  </div>
                )}
                
                <div className="grid-2col" style={{ gap: 16, gridTemplateColumns: '1fr 1fr' }}>
                  <div className="form-group">
                    <label className="form-label">Schedule Type</label>
                    <select value={schedType} onChange={(e) => setSchedType(e.target.value)} className="form-select">
                      <option value="PM Schedule">PM Schedule</option>
                      <option value="On-demand">On-demand</option>
                      <option value="Breakdown">Breakdown</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Assign Property Group</label>
                    <select value={schedPropertyId} onChange={(e) => setSchedPropertyId(e.target.value)} className="form-select" required>
                      <option value="">-- Choose Property --</option>
                      {(properties || []).map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid-2col" style={{ gap: 16, gridTemplateColumns: '1fr 1fr' }}>
                  <div className="form-group">
                    <label className="form-label">Customer (Tenant)</label>
                    <select value={schedCustomer} onChange={(e) => setSchedCustomer(e.target.value)} className="form-select">
                      <option value="">-- Choose Tenant --</option>
                      {(tenants || []).map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Unit Specification</label>
                    <input type="text" value={schedUnitSpec} onChange={(e) => setSchedUnitSpec(e.target.value)} placeholder="e.g. Unit 4B" className="form-input" />
                  </div>
                </div>

                <div className="grid-2col" style={{ gap: 16, gridTemplateColumns: '1fr 1fr' }}>
                  <div className="form-group">
                    <label className="form-label">Periodicity</label>
                    <select value={schedPeriodicity} onChange={(e) => setSchedPeriodicity(e.target.value)} className="form-select">
                      <option value="Weekly">Weekly</option>
                      <option value="Monthly">Monthly</option>
                      <option value="Quarterly">Quarterly</option>
                      <option value="Yearly">Yearly</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Start Date</label>
                    <input type="date" value={schedStartDate} onChange={(e) => setSchedStartDate(e.target.value)} className="form-input" />
                  </div>
                </div>

                {/* Additional fields to create maintenance visit in ERPNext */}
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 12, marginTop: 12 }}>
                  <h4 style={{ fontSize: 12, fontWeight: 700, marginBottom: 8, color: 'var(--text-secondary)' }}>ERPNext Maintenance Visit Dispatch Fields</h4>
                  <div className="grid-2col" style={{ gap: 16, gridTemplateColumns: '1fr 1fr' }}>
                    <div className="form-group">
                      <label className="form-label">Visit Scheduled Date</label>
                      <input type="date" value={schedVisitDate} onChange={(e) => setSchedVisitDate(e.target.value)} className="form-input" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Visit Scheduled Time</label>
                      <input type="text" value={schedVisitTime} onChange={(e) => setSchedVisitTime(e.target.value)} placeholder="e.g. 10:00 AM" className="form-input" />
                    </div>
                  </div>
                  <div className="grid-2col" style={{ gap: 16, gridTemplateColumns: '1fr 1fr' }}>
                    <div className="form-group">
                      <label className="form-label">Assigned Technician</label>
                      <select value={schedAssignedTech} onChange={(e) => setSchedAssignedTech(e.target.value)} className="form-select">
                        <option value="">-- Choose Tech --</option>
                        {techProfiles.map(t => (
                          <option key={t.id} value={t.name}>{t.name} ({t.skill})</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Completion Status</label>
                      <select value={schedVisitStatus} onChange={(e) => setSchedVisitStatus(e.target.value)} className="form-select">
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Scope Description</label>
                  <textarea value={schedDescription} onChange={(e) => setSchedDescription(e.target.value)} className="form-input" rows="2" />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowScheduleModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submittingSchedule}>Create Maintenance Schedule</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* WORK ORDER CREATION MODAL */}
      {showWOModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <h3>Create Work Order</h3>
              <button onClick={() => setShowWOModal(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 20 }}>×</button>
            </div>
            <form onSubmit={handleCreateWO}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Property group</label>
                  <select value={selectedPropertyId} onChange={(e) => setSelectedPropertyId(e.target.value)} className="form-select" required>
                    <option value="">-- Choose Property --</option>
                    {(properties || []).map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div className="grid-2col" style={{ gap: 16, gridTemplateColumns: '1fr 1fr' }}>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select value={woCategory} onChange={(e) => setWoCategory(e.target.value)} className="form-select">
                      <option value="Plumbing">Plumbing</option>
                      <option value="Electrical">Electrical</option>
                      <option value="HVAC">HVAC</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Priority</label>
                    <select value={woPriority} onChange={(e) => setWoPriority(e.target.value)} className="form-select">
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                </div>

                <div className="grid-2col" style={{ gap: 16, gridTemplateColumns: '1fr 1fr' }}>
                  <div className="form-group">
                    <label className="form-label">Assign Technician</label>
                    <select value={woTechnician} onChange={(e) => setWoTechnician(e.target.value)} className="form-select">
                      <option value="">-- Choose Tech --</option>
                      {techProfiles.map(t => (
                        <option key={t.id} value={t.name}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Assign Vendor</label>
                    <select value={woVendor} onChange={(e) => setWoVendor(e.target.value)} className="form-select">
                      <option value="">-- Choose Vendor --</option>
                      {vendorDir.map(v => (
                        <option key={v.id} value={v.name}>{v.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Estimated Cost ($)</label>
                  <input type="number" value={woEstCost} onChange={(e) => setWoEstCost(e.target.value)} className="form-input" required />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowWOModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Work Order</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ITEM CONSUMPTION MODAL */}
      {showConsumeModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 400 }}>
            <div className="modal-header">
              <h3>Deduct Stock & Consume Part</h3>
              <button onClick={() => setShowConsumeModal(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 20 }}>×</button>
            </div>
            <form onSubmit={handleConsumeItem}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Select Stock Item</label>
                  <select value={consumeItemCode} onChange={(e) => setConsumeItemCode(e.target.value)} className="form-select" required>
                    <option value="">-- Select Item --</option>
                    {stockItems.map(s => (
                      <option key={s.code} value={s.code}>{s.name} (Qty: {s.qty} - ${s.unitCost}/ea)</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Quantity to consume</label>
                  <input type="number" value={consumeItemQty} onChange={(e) => setConsumeItemQty(Number(e.target.value))} className="form-input" min="1" required />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowConsumeModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Deduct & Record</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
