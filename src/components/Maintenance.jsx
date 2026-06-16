import React, { useState, useEffect } from 'react';
import { Hammer, User, Clock, CheckCircle, AlertTriangle, Plus, X, Calendar as CalendarIcon, List, BarChart3, ClipboardList, Building, Search, Activity, Settings, DollarSign, PenTool, Archive, Check } from 'lucide-react';

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
  const [activeSection, setActiveSection] = useState('schedule'); // 'schedule', 'visit', 'work_order', 'technician', 'vendor', 'asset'
  const [viewMode, setViewMode] = useState('list'); // 'calendar' or 'list'
  const [maintenanceSearch, setMaintenanceSearch] = useState('');
  
  // Custom states for upgraded sections
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [selectedVendor, setSelectedVendor] = useState(null);
  
  // MOCK Internal Databases to support enterprise features
  const [workOrders, setWorkOrders] = useState([
    {
      id: "WO-2026-0001",
      relatedTicket: "SUP-728",
      property: "Stratford Court Apartments",
      unit: "Flat 4B",
      category: "Plumbing",
      technician: "EMP-005 - Michael Chang",
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
      technician: "EMP-007 - Sarah Connor",
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
    { id: "EMP-005", name: "Michael Chang", skill: "Plumbing", certs: "Master Plumber Class-A", availability: "Available", activeJobs: 1 },
    { id: "EMP-007", name: "Sarah Connor", skill: "Electrical", certs: "High-Voltage certified", availability: "Available", activeJobs: 2 },
    { id: "EMP-012", name: "John Miller", skill: "HVAC", certs: "EPA Universal certified", availability: "On Leave", activeJobs: 0 }
  ]);

  const [vendorDir, setVendorDir] = useState([
    { id: "SUP-0001", name: "Pacific Elevators Ltd", group: "Local", type: "Technical Services", rating: 4.8, quotesCount: 5 },
    { id: "SUP-0002", name: "Suva Cleaning Services", group: "Local", type: "Cleaning", rating: 4.5, quotesCount: 2 },
    { id: "SUP-0003", name: "Fiji Security Solutions", group: "Local", type: "Security", rating: 4.7, quotesCount: 8 }
  ]);

  const [assetsList, setAssetsList] = useState([
    { id: "AST-0091", name: "Emergency Power Generator 80KVA", serial: "G-88129A", warranty: "2028-12-31", amc: "Contract Active - Cummins Fiji", breakdownCount: 1, properties: ["Stratford Court Apartments"] },
    { id: "AST-0092", name: "Passenger Elevator Block B", serial: "E-10022", warranty: "Expired", amc: "Contract Active - Otis Elevators", breakdownCount: 3, properties: ["Stratford Court Apartments"] }
  ]);

  const [stockItems, setStockItems] = useState([
    { code: "31AD", name: "Submersible Pump 1HP", qty: 5, unitCost: 450 },
    { code: "EL-CABLE", name: "Copper Wiring Kit 50m", qty: 15, unitCost: 150 },
    { code: "HV-FIL", name: "Heavy Duty Air Filter B", qty: 30, unitCost: 85 }
  ]);

  // PM Schedule States
  const [pmSchedules, setPmSchedules] = useState([
    { id: "PM-001", asset: "Passenger Elevator Block B", frequency: "Monthly", lastService: "2026-05-15", nextService: "2026-06-15", status: "Overdue" },
    { id: "PM-002", asset: "Emergency Power Generator 80KVA", frequency: "Quarterly", lastService: "2026-04-10", nextService: "2026-07-10", status: "Active" }
  ]);

  // Cost Tier approval message
  const getApprovalRequired = (cost) => {
    if (cost < 5000) return "Auto Approved";
    if (cost >= 5000 && cost < 25000) return "Pending Manager Approval";
    if (cost >= 25000 && cost < 100000) return "Pending Operations Head Approval";
    return "Pending Property Owner Approval";
  };

  // Convert ticket workflow simulation
  useEffect(() => {
    if (preSelectedProperty) {
      setSelectedPropertyId(preSelectedProperty.id);
      setShowModal(true);
      clearPreSelectedProperty();
    }
  }, [preSelectedProperty, clearPreSelectedProperty]);

  // Modal Form States
  const [customer, setCustomer] = useState('');
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [transactionDate, setTransactionDate] = useState('2026-06-16');
  const [scheduleTime, setScheduleTime] = useState('10:00 AM');
  const [submittingSchedule, setSubmittingSchedule] = useState(false);
  const [scheduleStatusMessage, setScheduleStatusMessage] = useState(null);
  
  // Work Order Creation Modal States
  const [showWOModal, setShowWOModal] = useState(false);
  const [woPriority, setWoPriority] = useState('Medium');
  const [woCategory, setWoCategory] = useState('Plumbing');
  const [woTechnician, setWoTechnician] = useState('');
  const [woVendor, setWoVendor] = useState('');
  const [woEstCost, setWoEstCost] = useState(0);
  const [woDescription, setWoDescription] = useState('');

  // Item consumption modal inside WO Details
  const [showConsumeModal, setShowConsumeModal] = useState(false);
  const [consumeItemCode, setConsumeItemCode] = useState('');
  const [consumeItemQty, setConsumeItemQty] = useState(1);

  const getPropertyByUnit = (unitId) => {
    const tenant = tenants.find(t => t.unitSpec === unitId || t.id === unitId || t.name === unitId);
    if (tenant) {
      return tenant.propertyGroup || tenant.propertyName;
    }
    const prop = properties.find(p => p.id === unitId || p.name === unitId);
    if (prop) return prop.name;
    return 'N/A';
  };

  // Work Order actions
  const handleWOStatusChange = (woId, newStatus) => {
    setWorkOrders(prev => prev.map(wo => {
      if (wo.id === woId) {
        let actual = wo.actualCost;
        if (newStatus === 'Completed' && wo.actualCost === 0) {
          actual = wo.estCost; // set mockup actual cost
        }
        return { ...wo, status: newStatus, actualCost: actual };
      }
      return wo;
    }));
  };

  // Submit Work Order Creation
  const handleCreateWO = (e) => {
    e.preventDefault();
    const newWO = {
      id: `WO-2026-000${workOrders.length + 1}`,
      relatedTicket: "Manual Request",
      property: properties.find(p => p.id === selectedPropertyId)?.name || "Stratford Court Apartments",
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

  // Stock deduction inside work order
  const handleConsumeItem = (e) => {
    e.preventDefault();
    if (!consumeItemCode) return;
    const item = stockItems.find(s => s.code === consumeItemCode);
    if (!item) return;

    if (item.qty < consumeItemQty) {
      alert("Warning: Insufficient stock!");
      return;
    }

    // Deduct stock
    setStockItems(prev => prev.map(s => s.code === consumeItemCode ? { ...s, qty: s.qty - consumeItemQty } : s));

    // Add consumed item to selected WO
    const cost = item.unitCost * consumeItemQty;
    setWorkOrders(prev => prev.map(wo => {
      if (wo.id === selectedWorkOrder.id) {
        const updatedItems = [...(wo.consumedItems || []), { item: item.name, qty: consumeItemQty, cost }];
        const newActual = wo.actualCost + cost;
        return { ...wo, consumedItems: updatedItems, actualCost: newActual };
      }
      return wo;
    }));

    // Update locally inspected copy
    setSelectedWorkOrder(prev => {
      const updatedItems = [...(prev.consumedItems || []), { item: item.name, qty: consumeItemQty, cost }];
      return { ...prev, consumedItems: updatedItems, actualCost: prev.actualCost + cost };
    });

    setShowConsumeModal(false);
  };

  // PM recurrence handler
  const handlePMTrigger = (pm) => {
    alert(`Auto-generating preventative maintenance Work Order for ${pm.asset}...`);
    const newWO = {
      id: `WO-PM-${Math.floor(100 + Math.random() * 900)}`,
      relatedTicket: `PM Schedule - ${pm.id}`,
      property: "Stratford Court Apartments",
      unit: "Central Engine Room",
      category: "Electrical",
      technician: "EMP-005 - Michael Chang",
      vendor: "Cummins Fiji",
      estHours: 8,
      estCost: 4500,
      actualCost: 0,
      status: "Assigned",
      sla: "Medium",
      dueDate: pm.nextService,
      consumedItems: []
    };
    setWorkOrders([newWO, ...workOrders]);
  };

  // Approve Work Order
  const handleApproveWO = (woId) => {
    setWorkOrders(prev => prev.map(wo => wo.id === woId ? { ...wo, status: "Assigned" } : wo));
    setSelectedWorkOrder(prev => ({ ...prev, status: "Assigned" }));
  };

  const filteredSchedules = schedules.filter(sch => {
    const term = maintenanceSearch.toLowerCase();
    const firstItemCode = sch.items && sch.items.length > 0 ? sch.items[0].item_code : '';
    const propName = getPropertyByUnit(firstItemCode) || '';
    return (
      sch.name.toLowerCase().includes(term) ||
      (sch.customer_name || sch.customer || '').toLowerCase().includes(term) ||
      propName.toLowerCase().includes(term)
    );
  });

  return (
    <div>
      <div className="view-header" style={{ flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className="view-title">Maintenance Ops & Facility management</h1>
          <p className="view-subtitle">Roster preventative maintenance visits, manage work orders, assign tasks, and track logs.</p>
        </div>

        {/* Section selectors */}
        <div style={{ display: 'flex', background: 'var(--bg-secondary)', padding: 4, borderRadius: 8, border: '1px solid var(--border-color)', flexWrap: 'wrap' }}>
          <button className={`btn btn-sm ${activeSection === 'schedule' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveSection('schedule')}>
            PM Schedules
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

      {/* SECTION 1: PM SCHEDULES */}
      {activeSection === 'schedule' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', flexWrap: 'wrap', gap: 10 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <Search size={16} />
              <input 
                type="text" 
                placeholder="Search schedules..." 
                className="form-input" 
                style={{ width: 220, padding: '4px 10px' }}
                value={maintenanceSearch}
                onChange={(e) => setMaintenanceSearch(e.target.value)}
              />
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
              <Plus size={14} /> New Schedule
            </button>
          </div>

          <div className="grid-2col" style={{ gridTemplateColumns: selectedSchedule ? '60% calc(40% - 24px)' : '1fr', gap: 24 }}>
            <div className="card-panel" style={{ padding: 0 }}>
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Schedule ID</th>
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
                          <td>{sch.customer_name || sch.customer}</td>
                          <td>{firstItem ? getPropertyByUnit(firstItem.item_code) : 'N/A'}</td>
                          <td>{firstItem ? firstItem.periodicity : 'Monthly'}</td>
                          <td><span className="badge badge-success">Active</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {selectedSchedule && (
              <div className="card-panel" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: 10 }}>
                  <strong>{selectedSchedule.name}</strong>
                  <button onClick={() => setSelectedSchedule(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={16} /></button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12 }}>
                  <div>Company: <strong>{selectedSchedule.company}</strong></div>
                  <div>Property Group ID: <strong>{selectedSchedule.custom_property}</strong></div>
                  <div>Transaction Date: <strong>{selectedSchedule.transaction_date}</strong></div>
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
                  <div>Cost Approval: <strong>{getApprovalRequired(selectedWorkOrder.estCost)}</strong></div>
                  <div>Estimated Cost: <strong>${selectedWorkOrder.estCost.toLocaleString()}</strong></div>
                  <div>Actual Cost Log: <strong>${selectedWorkOrder.actualCost.toLocaleString()}</strong></div>
                  <div>Assigned Vendor: <strong>{selectedWorkOrder.vendor}</strong></div>
                  <div>Assigned Technician: <strong>{selectedWorkOrder.technician}</strong></div>
                </div>

                {/* Approvals button */}
                {selectedWorkOrder.status === 'Pending Approval' && (
                  <button className="btn btn-primary" onClick={() => handleApproveWO(selectedWorkOrder.id)}>
                    <Check size={14} style={{ marginRight: 6 }} /> Approve Estimated Cost
                  </button>
                )}

                {/* Stock consumption inside WO details drawer */}
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
                  <th>Active Jobs</th>
                </tr>
              </thead>
              <tbody>
                {techProfiles.map(tech => (
                  <tr key={tech.id}>
                    <td><strong>{tech.name}</strong></td>
                    <td>{tech.skill}</td>
                    <td>{tech.certs}</td>
                    <td><span className={`badge ${tech.availability === 'Available' ? 'badge-success' : 'badge-warning'}`}>{tech.availability}</span></td>
                    <td>{tech.activeJobs} Jobs</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 4: VENDORS */}
      {activeSection === 'vendor' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
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
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {vendorDir.map(v => (
                    <tr key={v.id}>
                      <td style={{ fontWeight: 600 }}>{v.id}</td>
                      <td>{v.name}</td>
                      <td>{v.type}</td>
                      <td>⭐ {v.rating}</td>
                      <td>
                        <button className="btn btn-secondary btn-sm" onClick={() => setSelectedVendor(v)}>View Info</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {selectedVendor && (
            <div className="card-panel" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: 10 }}>
                <strong>{selectedVendor.name} Details</strong>
                <button onClick={() => setSelectedVendor(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={16} /></button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10, fontSize: 12 }}>
                <div>Total Quotes Submitted: <strong>{selectedVendor.quotesCount}</strong></div>
                <div>Status: <span className="badge badge-success">Approved Vendor</span></div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SECTION 5: ASSETS */}
      {activeSection === 'asset' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* PM Schedule controls */}
          <div className="card-panel">
            <h3 style={{ fontSize: 14, marginBottom: 12 }}>Preventative Maintenance Schedules</h3>
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>PM ID</th>
                    <th>Asset Name</th>
                    <th>Frequency</th>
                    <th>Next Service Due</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pmSchedules.map(pm => (
                    <tr key={pm.id}>
                      <td style={{ fontWeight: 600 }}>{pm.id}</td>
                      <td>{pm.asset}</td>
                      <td>{pm.frequency}</td>
                      <td><span style={{ color: pm.status === 'Overdue' ? 'var(--color-danger)' : '' }}>{pm.nextService}</span></td>
                      <td>
                        <button className="btn btn-primary btn-sm" onClick={() => handlePMTrigger(pm)}>Trigger WO</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Asset health overview */}
          <div className="card-panel">
            <h3 style={{ fontSize: 15, marginBottom: 14 }}>Assets Warranty & AMC Management</h3>
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Asset ID</th>
                    <th>Asset Name</th>
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
                      <td>{a.warranty}</td>
                      <td>{a.amc}</td>
                      <td><span className={`badge ${a.breakdownCount > 2 ? 'badge-danger' : 'badge-success'}`}>{a.breakdownCount} breakdowns</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
                    {properties.map(p => (
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
                        <option key={t.id} value={`${t.id} - ${t.name}`}>{t.name} ({t.skill})</option>
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
