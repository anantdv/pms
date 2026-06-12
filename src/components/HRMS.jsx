import React, { useState, useRef, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Briefcase, 
  MapPin, 
  Calendar, 
  Mail, 
  Phone, 
  Search, 
  Filter, 
  Check, 
  X, 
  UserCheck, 
  UserMinus, 
  Network, 
  Plus, 
  Trash2, 
  PieChart, 
  Play,
  Clock,
  ArrowRight,
  Shield,
  Layers,
  Sparkles,
  Maximize2,
  Minimize2
} from 'lucide-react';

export const INITIAL_EMPLOYEES = [
  { 
    id: 'EMP-001', 
    name: 'Alisi Ratuvou', 
    email: 'alisi.r@carpenters.com.fj', 
    phone: '+679 990 1234', 
    department: 'Executive', 
    designation: 'Chief Executive Officer', 
    status: 'Active', 
    joiningDate: '2018-03-15', 
    reportsTo: [], 
    avatar: 'AR',
    role: 'Executive Director',
    rosterShift: 'Morning (08:00 - 16:00)',
    tasks: ['Review Quarterly Portfolio Performance', 'Approve Board Expenditures'],
    x: 450,
    y: 40
  },
  { 
    id: 'EMP-002', 
    name: 'Biswajit Maity', 
    email: 'biswajit.m@carpenters.com.fj', 
    phone: '+679 992 5678', 
    department: 'Technology', 
    designation: 'Chief Technology Officer', 
    status: 'Active', 
    joiningDate: '2020-07-01', 
    reportsTo: ['EMP-001'], 
    avatar: 'BM',
    role: 'IT Administrator & Strategy',
    rosterShift: 'Morning (08:00 - 16:00)',
    tasks: ['Resolve ERPNext CRM integration latency', 'Deploy secure ledger database patch'],
    x: 180,
    y: 180
  },
  { 
    id: 'EMP-003', 
    name: 'Siteri Cavuilati', 
    email: 'siteri.c@carpenters.com.fj', 
    phone: '+679 883 4567', 
    department: 'Human Resources', 
    designation: 'HR Director', 
    status: 'Active', 
    joiningDate: '2019-11-10', 
    reportsTo: ['EMP-001'], 
    avatar: 'SC',
    role: 'People & Culture Manager',
    rosterShift: 'Morning (08:00 - 16:00)',
    tasks: ['Onboard new building management technicians', 'Update roster schedule compliance policies'],
    x: 450,
    y: 180
  },
  { 
    id: 'EMP-005', 
    name: 'Priya Prasad', 
    email: 'priya.p@carpenters.com.fj', 
    phone: '+679 934 7654', 
    department: 'Finance', 
    designation: 'Chief Financial Officer', 
    status: 'Active', 
    joiningDate: '2019-01-20', 
    reportsTo: ['EMP-001'], 
    avatar: 'PP',
    role: 'Financial Audit Manager',
    rosterShift: 'Morning (08:00 - 16:00)',
    tasks: ['Reconcile Trial Balance discrepancy', 'Process payroll payouts schedule'],
    x: 720,
    y: 180
  },
  { 
    id: 'EMP-004', 
    name: 'Jone Vakaloloma', 
    email: 'jone.v@carpenters.com.fj', 
    phone: '+679 775 8901', 
    department: 'Operations', 
    designation: 'Operations Manager', 
    status: 'Active', 
    joiningDate: '2021-02-18', 
    reportsTo: ['EMP-001'], 
    avatar: 'JV',
    role: 'Facility Operations Lead',
    rosterShift: 'Afternoon (16:00 - 00:00)',
    tasks: ['Schedule Preventive AC maintenance roster', 'Inspect high-voltage grids of commercial suites'],
    x: 980,
    y: 180
  },
  { 
    id: 'EMP-006', 
    name: 'Rahul Sharma', 
    email: 'rahul.s@carpenters.com.fj', 
    phone: '+679 865 4321', 
    department: 'Technology', 
    designation: 'Lead Systems Architect', 
    status: 'Active', 
    joiningDate: '2021-06-15', 
    reportsTo: ['EMP-002'], 
    avatar: 'RS',
    role: 'Full Stack Engineer',
    rosterShift: 'Morning (08:00 - 16:00)',
    tasks: ['Design 3D Mall tracking components'],
    x: 80,
    y: 340
  },
  { 
    id: 'EMP-010', 
    name: 'Samisoni Bola', 
    email: 'samisoni.b@carpenters.com.fj', 
    phone: '+679 844 7788', 
    department: 'Technology', 
    designation: 'Support Engineer', 
    status: 'Active', 
    joiningDate: '2023-11-01', 
    reportsTo: ['EMP-002', 'EMP-004'], 
    avatar: 'SB',
    role: 'IT Support & Operations Dispatcher',
    rosterShift: 'Night (00:00 - 08:00)',
    tasks: ['Answer active tenant inquiries', 'Monitor server logs during night shifts'],
    x: 280,
    y: 340
  },
  { 
    id: 'EMP-007', 
    name: 'Mere Nailati', 
    email: 'mere.n@carpenters.com.fj', 
    phone: '+679 922 1100', 
    department: 'Human Resources', 
    designation: 'HR Officer', 
    status: 'Active', 
    joiningDate: '2022-08-01', 
    reportsTo: ['EMP-003'], 
    avatar: 'MN',
    role: 'Recruitment & Attendance Compliance',
    rosterShift: 'Morning (08:00 - 16:00)',
    tasks: ['Draft vacancy requests for maintenance tech assistants'],
    x: 450,
    y: 340
  },
  { 
    id: 'EMP-009', 
    name: 'Kavita Singh', 
    email: 'kavita.s@carpenters.com.fj', 
    phone: '+679 911 3322', 
    department: 'Finance', 
    designation: 'Senior Accountant', 
    status: 'Active', 
    joiningDate: '2022-04-05', 
    reportsTo: ['EMP-005'], 
    avatar: 'KS',
    role: 'General Ledger Auditor',
    rosterShift: 'Morning (08:00 - 16:00)',
    tasks: ['Aggregate account balances for billing ledger report'],
    x: 720,
    y: 340
  },
  { 
    id: 'EMP-008', 
    name: 'David Underwood', 
    email: 'david.u@carpenters.com.fj', 
    phone: '+679 732 4455', 
    department: 'Operations', 
    designation: 'Facility Supervisor', 
    status: 'On Leave', 
    joiningDate: '2023-01-10', 
    reportsTo: ['EMP-004'], 
    avatar: 'DU',
    role: 'Night Warden & Security Coordinator',
    rosterShift: 'Night (00:00 - 08:00)',
    tasks: ['Organize safety keys audit checklists'],
    x: 980,
    y: 340
  }
];

const INITIAL_LEAVE_REQUESTS = [
  { id: 'LR-101', name: 'David Underwood', department: 'Operations', type: 'Annual Leave', start: '2026-06-15', end: '2026-06-19', status: 'Pending', reason: 'Family trip to Coral Coast' },
  { id: 'LR-102', name: 'Kavita Singh', department: 'Finance', type: 'Sick Leave', start: '2026-06-13', end: '2026-06-14', status: 'Pending', reason: 'Medical Checkup' },
  { id: 'LR-103', name: 'Samisoni Bola', department: 'Technology', type: 'Casual Leave', start: '2026-06-25', end: '2026-06-25', status: 'Approved', reason: 'Personal errands' }
];

export default function HRMS({ employees, setEmployees, onCreateEmployee, departments = [], designations = [], erpnextConfig }) {
  const [activeTab, setActiveTab] = useState('orgchart'); // Default to Orgchart
  const [leaveRequests, setLeaveRequests] = useState(INITIAL_LEAVE_REQUESTS);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('data:')) {
      return imagePath;
    }
    const baseUrl = erpnextConfig?.url || '';
    const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const cleanPath = imagePath.startsWith('/') ? imagePath : '/' + imagePath;
    return `${cleanBase}${cleanPath}`;
  };
  
  // Search & Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal form states
  const [showAddModal, setShowAddModal] = useState(false);
  const [empFirstName, setEmpFirstName] = useState('');
  const [empLastName, setEmpLastName] = useState('');
  const [empEmail, setEmpEmail] = useState('');
  const [empPhone, setEmpPhone] = useState('');
  const [empDept, setEmpDept] = useState('');
  const [empDesg, setEmpDesg] = useState('');
  const [empStatus, setEmpStatus] = useState('Active');
  const [empJoinDate, setEmpJoinDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (departments.length > 0 && !empDept) {
      setEmpDept(departments[0]);
    }
  }, [departments, empDept]);

  useEffect(() => {
    if (designations.length > 0 && !empDesg) {
      setEmpDesg(designations[0]);
    }
  }, [designations, empDesg]);
  const [empGender, setEmpGender] = useState('Male');
  const [empDob, setEmpDob] = useState('1995-01-01');
  const [empCompany, setEmpCompany] = useState('CARPENTERS PROPERTIES PTE LIMITED');
  const [empReportsTo, setEmpReportsTo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Selected employee detail state
  const [selectedEmpId, setSelectedEmpId] = useState(null);

  // Drag & Drop position state
  const canvasRef = useRef(null);
  const [draggedNodeId, setDraggedNodeId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Roster / task edit state
  const [editingRole, setEditingRole] = useState('');
  const [editingShift, setEditingShift] = useState('');
  const [newTaskText, setNewTaskText] = useState('');

  // Full screen chart view state
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Connection line drawing state
  const [drawingConnectionFromId, setDrawingConnectionFromId] = useState(null);
  const [drawingLineEnd, setDrawingLineEnd] = useState({ x: 0, y: 0 });

  // Sync edits when selected employee changes
  useEffect(() => {
    if (selectedEmpId) {
      const emp = employees.find(e => e.id === selectedEmpId);
      if (emp) {
        setEditingRole(emp.role || emp.designation || '');
        setEditingShift(emp.rosterShift || 'Morning (08:00 - 16:00)');
      }
    }
  }, [selectedEmpId, employees]);

  // Handle Add Employee
  const handleAddEmployeeSubmit = async (e) => {
    e.preventDefault();
    if (!empFirstName || !empLastName || !empEmail) return;

    setIsLoading(true);
    setMessage({ text: 'Registering employee in ERPNext...', type: 'info' });

    const newId = `EMP-${String(employees.length + 1).padStart(3, '0')}`;
    const initials = `${empFirstName[0] || ''}${empLastName[0] || ''}`.toUpperCase();
    const fullName = `${empFirstName} ${empLastName}`;

    const newEmp = {
      id: newId,
      name: fullName,
      firstName: empFirstName,
      lastName: empLastName,
      email: empEmail,
      phone: empPhone || '+679 000 0000',
      department: empDept,
      designation: empDesg || 'Staff Associate',
      status: empStatus,
      joiningDate: empJoinDate,
      gender: empGender,
      dateOfBirth: empDob,
      company: empCompany,
      reportsTo: empReportsTo ? [empReportsTo] : [],
      avatar: initials,
      role: empDesg || 'Staff Associate',
      rosterShift: 'Morning (08:00 - 16:00)',
      tasks: [],
      x: 300 + Math.random() * 200,
      y: 200 + Math.random() * 100
    };

    try {
      if (onCreateEmployee) {
        await onCreateEmployee(newEmp);
      } else {
        setEmployees([...employees, newEmp]);
      }
      
      setMessage({ text: 'Employee registered successfully in ERPNext!', type: 'success' });
      setSelectedEmpId(newId);

      setTimeout(() => {
        setEmpFirstName('');
        setEmpLastName('');
        setEmpEmail('');
        setEmpPhone('');
        setEmpDesg('');
        setEmpStatus('Active');
        setEmpJoinDate(new Date().toISOString().split('T')[0]);
        setEmpGender('Male');
        setEmpDob('1995-01-01');
        setEmpCompany('CARPENTERS PROPERTIES PTE LIMITED');
        setEmpReportsTo('');
        setMessage({ text: '', type: '' });
        setIsLoading(false);
        setShowAddModal(false);
      }, 1500);

    } catch (err) {
      setMessage({ text: `Failed to register employee: ${err.message}`, type: 'error' });
      setIsLoading(false);
    }
  };

  // Delete Employee
  const handleDeleteEmployee = (id) => {
    if (window.confirm('Are you sure you want to delete this employee record?')) {
      setEmployees(employees.filter(emp => emp.id !== id).map(emp => {
        return {
          ...emp,
          reportsTo: emp.reportsTo.filter(mgrId => mgrId !== id)
        };
      }));
      if (selectedEmpId === id) setSelectedEmpId(null);
    }
  };

  // Update Roster details (Role, Shift)
  const handleSaveRosterDetails = () => {
    if (!selectedEmpId) return;
    setEmployees(employees.map(emp => {
      if (emp.id === selectedEmpId) {
        return {
          ...emp,
          role: editingRole,
          rosterShift: editingShift
        };
      }
      return emp;
    }));
  };

  // Add Task to Roster list
  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskText || !selectedEmpId) return;
    setEmployees(employees.map(emp => {
      if (emp.id === selectedEmpId) {
        return {
          ...emp,
          tasks: [...(emp.tasks || []), newTaskText]
        };
      }
      return emp;
    }));
    setNewTaskText('');
  };

  // Remove Task from roster list
  const handleRemoveTask = (taskIndex) => {
    if (!selectedEmpId) return;
    setEmployees(employees.map(emp => {
      if (emp.id === selectedEmpId) {
        return {
          ...emp,
          tasks: emp.tasks.filter((_, idx) => idx !== taskIndex)
        };
      }
      return emp;
    }));
  };

  // Leave Approval Handlers
  const handleApproveLeave = (id) => {
    setLeaveRequests(leaveRequests.map(lr => lr.id === id ? { ...lr, status: 'Approved' } : lr));
    const req = leaveRequests.find(lr => lr.id === id);
    if (req) {
      setEmployees(employees.map(emp => emp.name === req.name ? { ...emp, status: 'On Leave' } : emp));
    }
  };

  const handleRejectLeave = (id) => {
    setLeaveRequests(leaveRequests.map(lr => lr.id === id ? { ...lr, status: 'Rejected' } : lr));
  };

  // Drag operations for Node coordinates
  const handleNodeMouseDown = (e, nodeId) => {
    if (drawingConnectionFromId) return; // Ignore if drawing line
    e.preventDefault();
    setSelectedEmpId(nodeId);
    setDraggedNodeId(nodeId);
    const node = employees.find(emp => emp.id === nodeId);
    if (node) {
      const rect = canvasRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      setDragOffset({
        x: clickX - node.x,
        y: clickY - node.y
      });
    }
  };

  const handleCanvasMouseMove = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (draggedNodeId) {
      const newX = Math.max(10, Math.min(mouseX - dragOffset.x, 1200));
      const newY = Math.max(10, Math.min(mouseY - dragOffset.y, 750));
      setEmployees(employees.map(emp => {
        if (emp.id === draggedNodeId) {
          return { ...emp, x: newX, y: newY };
        }
        return emp;
      }));
    } else if (drawingConnectionFromId) {
      setDrawingLineEnd({ x: mouseX, y: mouseY });
    }
  };

  const handleCanvasMouseUp = (e) => {
    setDraggedNodeId(null);
    setDrawingConnectionFromId(null);
  };

  // Handle connection release on node card (establish reports to relationship)
  const handleNodeMouseUp = (e, targetId) => {
    if (drawingConnectionFromId && drawingConnectionFromId !== targetId) {
      e.stopPropagation();
      setEmployees(prev => prev.map(emp => {
        if (emp.id === targetId) {
          const alreadyReports = emp.reportsTo.includes(drawingConnectionFromId);
          if (!alreadyReports) {
            return {
              ...emp,
              reportsTo: [...emp.reportsTo, drawingConnectionFromId]
            };
          }
        }
        return emp;
      }));
    }
    setDrawingConnectionFromId(null);
  };

  // Filtered employees list
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          emp.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          emp.designation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = deptFilter === 'All' || emp.department === deptFilter;
    const matchesStatus = statusFilter === 'All' || emp.status === statusFilter;
    return matchesSearch && matchesDept && matchesStatus;
  });

  const filterDepts = ['All', ...new Set(employees.map(emp => emp.department))];

  return (
    <div className="view-container">
      {/* Top Header */}
      <header className="view-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="view-title">Human Resource Management (HRMS)</h1>
          <p className="view-subtitle">Manage organization structure, dynamic drag-and-drop flow charts, and roster schedules.</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <UserPlus size={16} style={{ marginRight: 6 }} /> Register Employee
          </button>
        </div>
      </header>

      {/* Sub Tabs Navigation */}
      <div className="tabs-container" style={{ display: 'flex', gap: 12, borderBottom: '1px solid var(--border-color)', marginBottom: 24, paddingBottom: 10 }}>
        <button 
          className={`tab-btn ${activeTab === 'orgchart' ? 'active' : ''}`} 
          onClick={() => setActiveTab('orgchart')}
          style={{ 
            background: 'none', 
            border: 'none', 
            padding: '8px 16px', 
            fontSize: 13, 
            fontWeight: 600, 
            color: activeTab === 'orgchart' ? 'var(--brand-color)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'orgchart' ? '2.5px solid var(--brand-color)' : 'none',
            cursor: 'pointer'
          }}
        >
          <Network size={14} style={{ marginRight: 6, display: 'inline', verticalAlign: 'middle' }} />
          Flow Chart Builder
        </button>
        <button 
          className={`tab-btn ${activeTab === 'employees' ? 'active' : ''}`} 
          onClick={() => setActiveTab('employees')}
          style={{ 
            background: 'none', 
            border: 'none', 
            padding: '8px 16px', 
            fontSize: 13, 
            fontWeight: 600, 
            color: activeTab === 'employees' ? 'var(--brand-color)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'employees' ? '2.5px solid var(--brand-color)' : 'none',
            cursor: 'pointer'
          }}
        >
          <Users size={14} style={{ marginRight: 6, display: 'inline', verticalAlign: 'middle' }} />
          Employee Directory
        </button>
        <button 
          className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`} 
          onClick={() => setActiveTab('dashboard')}
          style={{ 
            background: 'none', 
            border: 'none', 
            padding: '8px 16px', 
            fontSize: 13, 
            fontWeight: 600, 
            color: activeTab === 'dashboard' ? 'var(--brand-color)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'dashboard' ? '2.5px solid var(--brand-color)' : 'none',
            cursor: 'pointer'
          }}
        >
          <PieChart size={14} style={{ marginRight: 6, display: 'inline', verticalAlign: 'middle' }} />
          Leave & Roster Stats
        </button>
      </div>

      {/* RENDER ACTIVE TAB */}
      {activeTab === 'orgchart' && (
        <div style={{ display: 'grid', gridTemplateColumns: isFullScreen ? '1fr' : '1fr 340px', gap: 24 }}>
          {/* Flow Chart Canvas Container */}
          <div className="card-panel" style={isFullScreen ? {
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 9999,
            background: '#121824',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 0,
            padding: 0
          } : { padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            
            <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-secondary)' }}>
              <div>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700 }}>Interactive Flow Organization Chart</h3>
                <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>Drag nodes to arrange. Click and drag the <span style={{ color: 'var(--brand-color)', fontWeight: 700 }}>circle handle (+)</span> at bottom of node to target reportee to draw connection lines.</p>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button 
                  onClick={() => setIsFullScreen(!isFullScreen)}
                  className="btn btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, padding: '4px 10px' }}
                >
                  {isFullScreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
                  {isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
                </button>
                <span className="badge badge-success" style={{ fontSize: 9 }}>Interactive Diagram Flow</span>
              </div>
            </div>

            {/* Interactive Workspace Canvas */}
            <div 
              ref={canvasRef}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onMouseLeave={handleCanvasMouseUp}
              style={{ 
                height: isFullScreen ? 'calc(100vh - 62px)' : 580, 
                width: '100%', 
                position: 'relative', 
                background: '#121824', 
                backgroundImage: 'radial-gradient(rgba(255,255,255,0.06) 1.2px, transparent 1.2px)',
                backgroundSize: '24px 24px',
                overflow: 'auto',
                cursor: draggedNodeId ? 'grabbing' : drawingConnectionFromId ? 'crosshair' : 'default'
              }}
            >
              {/* Connecting Edges (SVG Overlay) */}
              <svg style={{ position: 'absolute', top: 0, left: 0, width: 1500, height: 1000, pointerEvents: 'none', zIndex: 1 }}>
                <defs>
                  <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#d97706" />
                  </marker>
                </defs>

                {/* Drawing lines from managers to reportees */}
                {employees.map(emp => {
                  if (!emp.reportsTo || emp.reportsTo.length === 0) return null;
                  
                  return emp.reportsTo.map(managerId => {
                    const manager = employees.find(m => m.id === managerId);
                    if (!manager) return null;

                    const startX = manager.x + 100;
                    const startY = manager.y + 70; 
                    const endX = emp.x + 100;
                    const endY = emp.y; 

                    const midY = startY + (endY - startY) / 2;

                    return (
                      <g key={`${manager.id}-to-${emp.id}`}>
                        <path 
                          d={`M ${startX} ${startY} L ${startX} ${midY} L ${endX} ${midY} L ${endX} ${endY}`}
                          fill="none" 
                          stroke="var(--brand-color)" 
                          strokeWidth="2"
                          strokeDasharray={emp.status === 'On Leave' ? '5,5' : '0'} 
                          markerEnd="url(#arrow)"
                          opacity="0.85"
                        />
                        <circle cx={endX} cy={midY} r="3" fill="#d97706" />
                      </g>
                    );
                  });
                })}

                {/* Drawing dynamic temporary connection line */}
                {drawingConnectionFromId && (() => {
                  const sourceNode = employees.find(e => e.id === drawingConnectionFromId);
                  if (!sourceNode) return null;
                  const startX = sourceNode.x + 100;
                  const startY = sourceNode.y + 70;
                  return (
                    <line 
                      x1={startX} 
                      y1={startY} 
                      x2={drawingLineEnd.x} 
                      y2={drawingLineEnd.y} 
                      stroke="var(--brand-color)" 
                      strokeWidth="2.5" 
                      strokeDasharray="5,5" 
                    />
                  );
                })()}
              </svg>

              {/* Employee Node Blocks */}
              {employees.map(emp => {
                const isSelected = selectedEmpId === emp.id;
                
                return (
                  <div 
                    key={emp.id}
                    onMouseDown={(e) => handleNodeMouseDown(e, emp.id)}
                    onMouseUp={(e) => handleNodeMouseUp(e, emp.id)}
                    style={{ 
                      position: 'absolute',
                      left: emp.x,
                      top: emp.y,
                      width: 200,
                      background: 'rgba(30, 41, 59, 0.85)',
                      backdropFilter: 'blur(8px)',
                      border: isSelected ? '2px solid var(--brand-color)' : '1px solid #334155',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      color: '#f8fafc',
                      boxShadow: isSelected ? '0 0 14px rgba(217,119,6,0.3)' : 'var(--shadow-md)',
                      cursor: draggedNodeId === emp.id ? 'grabbing' : 'grab',
                      userSelect: 'none',
                      zIndex: 10
                    }}
                  >
                    {/* Header bar of node */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <div style={{ 
                        width: 28, 
                        height: 28, 
                        borderRadius: '50%', 
                        background: 'var(--brand-color)', 
                        color: '#fff', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        fontSize: 10, 
                        fontWeight: 700,
                        overflow: 'hidden'
                      }}>
                        {emp.image ? (
                          <>
                            <img 
                              src={getImageUrl(emp.image)} 
                              alt={emp.name} 
                              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                              onError={(e) => {
                                e.target.style.display = 'none';
                                if (e.target.nextSibling) {
                                  e.target.nextSibling.style.display = 'flex';
                                }
                              }}
                            />
                            <div style={{ 
                              display: 'none',
                              width: '100%', 
                              height: '100%', 
                              alignItems: 'center', 
                              justifyContent: 'center'
                            }}>
                              {emp.avatar}
                            </div>
                          </>
                        ) : (
                          emp.avatar
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{emp.name}</div>
                        <div style={{ fontSize: 8, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textTransform: 'uppercase' }}>{emp.department}</div>
                      </div>
                    </div>

                    <div style={{ borderTop: '1px solid #334155', paddingTop: 6, fontSize: 9 }}>
                      <div style={{ color: '#94a3b8', display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                        <span>Role:</span>
                        <strong style={{ color: '#cbd5e1' }}>{emp.role || emp.designation}</strong>
                      </div>
                      <div style={{ color: '#94a3b8', display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                        <span>Roster:</span>
                        <strong style={{ color: 'var(--color-success)' }}>{emp.rosterShift.split(' ')[0]}</strong>
                      </div>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 4 }}>
                        {emp.tasks && emp.tasks.length > 0 ? (
                          <span className="badge badge-info" style={{ fontSize: 7, padding: '1px 4px' }}>
                            {emp.tasks.length} active tasks
                          </span>
                        ) : (
                          <span className="badge badge-secondary" style={{ fontSize: 7, padding: '1px 4px', background: '#334155', color: '#94a3b8' }}>
                            Idle
                          </span>
                        )}
                        <span className={`badge ${emp.status === 'Active' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: 7, padding: '1px 4px' }}>
                          {emp.status}
                        </span>
                      </div>
                    </div>

                    {/* Drag Handle to Draw Connections */}
                    <div 
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setDrawingConnectionFromId(emp.id);
                        setDrawingLineEnd({ x: emp.x + 100, y: emp.y + 70 });
                      }}
                      style={{
                        position: 'absolute',
                        bottom: -6,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 14,
                        height: 14,
                        borderRadius: '50%',
                        background: 'var(--brand-color)',
                        border: '2px solid #121824',
                        cursor: 'crosshair',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 9,
                        fontWeight: 700,
                        color: '#fff',
                        zIndex: 20
                      }}
                      title="Drag connection line from this port to child target node"
                    >
                      +
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sidebar Workspace Inspector (Only shown in standard mode) */}
          {!isFullScreen && (
            <div className="card-panel" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {selectedEmpId ? (() => {
                const emp = employees.find(e => e.id === selectedEmpId);
                if (!emp) return null;

                return (
                  <>
                    <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: 12, marginBottom: 4 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--brand-color)', textTransform: 'uppercase' }}>Node Inspector</span>
                        <span className="badge badge-info" style={{ fontSize: 9 }}>{emp.id}</span>
                      </div>
                      <h2 style={{ fontSize: '1.15rem', marginTop: 4 }}>{emp.name}</h2>
                      <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{emp.designation}</span>
                    </div>

                    {/* Section 1: Multi-Reporting Manager Structure */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)' }}>
                        Reports to Managers (Multi-select)
                      </label>
                      <div style={{ 
                        maxHeight: 120, 
                        overflowY: 'auto', 
                        border: '1px solid var(--border-color)', 
                        borderRadius: 'var(--radius-sm)', 
                        padding: 8,
                        background: 'var(--bg-tertiary)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 4
                      }}>
                        {employees.filter(e => e.id !== emp.id).map(mgr => {
                          const reportsToManager = emp.reportsTo.includes(mgr.id);
                          return (
                            <label key={mgr.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, cursor: 'pointer' }}>
                              <input 
                                type="checkbox"
                                checked={reportsToManager}
                                onChange={() => {
                                  const newReports = reportsToManager 
                                    ? emp.reportsTo.filter(id => id !== mgr.id) 
                                    : [...emp.reportsTo, mgr.id];
                                  
                                  setEmployees(employees.map(e => e.id === emp.id ? { ...e, reportsTo: newReports } : e));
                                }}
                              />
                              <span>{mgr.name}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    {/* Section 2: Specific Role & Shift Roster Assignments */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Specific Role</label>
                        <input 
                          type="text" 
                          className="form-input" 
                          value={editingRole} 
                          onChange={(e) => setEditingRole(e.target.value)} 
                          placeholder="e.g. Facilities Strategy Coordinator"
                          style={{ height: 34, fontSize: 11 }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Roster Shift</label>
                        <select 
                          className="form-select"
                          value={editingShift}
                          onChange={(e) => setEditingShift(e.target.value)}
                          style={{ height: 34, fontSize: 11 }}
                        >
                          <option value="Morning (08:00 - 16:00)">Morning (08:00 - 16:00)</option>
                          <option value="Afternoon (16:00 - 00:00)">Afternoon (16:00 - 00:00)</option>
                          <option value="Night (00:00 - 08:00)">Night (00:00 - 08:00)</option>
                          <option value="On Call (24 Hours)">On Call (24 Hours)</option>
                        </select>
                      </div>

                      <button 
                        className="btn btn-primary"
                        onClick={handleSaveRosterDetails}
                        style={{ fontSize: 11, padding: '6px 12px', width: '100%' }}
                      >
                        Apply Roster Updates
                      </button>
                    </div>

                    {/* Section 3: Active Task Checklist */}
                    <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 12 }}>
                      <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Roster Tasks & Duties</label>
                      
                      <form onSubmit={handleAddTask} style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                        <input 
                          type="text" 
                          className="form-input" 
                          placeholder="Add dynamic duty..." 
                          value={newTaskText} 
                          onChange={(e) => setNewTaskText(e.target.value)}
                          style={{ height: 30, fontSize: 11 }}
                        />
                        <button type="submit" className="btn btn-primary" style={{ padding: '0 10px', height: 30 }}><Plus size={14} /></button>
                      </form>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 150, overflowY: 'auto' }}>
                        {emp.tasks && emp.tasks.map((task, tIdx) => (
                          <div key={tIdx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-tertiary)', padding: '6px 10px', borderRadius: 4, fontSize: 11 }}>
                            <span style={{ color: 'var(--text-primary)', maxWidth: '85%', overflow: 'hidden', textOverflow: 'ellipsis' }}>{task}</span>
                            <button 
                              type="button" 
                              onClick={() => handleRemoveTask(tIdx)}
                              style={{ background: 'none', border: 'none', color: 'var(--color-danger)', cursor: 'pointer' }}
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        ))}
                        {(!emp.tasks || emp.tasks.length === 0) && (
                          <div style={{ textAlign: 'center', fontSize: 10, color: 'var(--text-muted)', padding: '10px 0' }}>No active duties.</div>
                        )}
                      </div>
                    </div>
                  </>
                );
              })() : (
                <div style={{ textAlign: 'center', padding: '50px 0', color: 'var(--text-muted)' }}>
                  <Network size={36} style={{ margin: '0 auto 12px auto', opacity: 0.3 }} />
                  <h4 style={{ fontSize: 12, fontWeight: 700 }}>No Node Selected</h4>
                  <p style={{ fontSize: 10, marginTop: 4 }}>Select an employee box on the flow chart grid to assign roles, managers, and tasks.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'employees' && (
        <div className="grid-2col" style={{ display: 'grid', gridTemplateColumns: selectedEmpId ? '65% calc(35% - 24px)' : '1fr', gap: 24, transition: 'all 0.3s ease' }}>
          {/* Main Table Directory Card */}
          <div className="card-panel" style={{ padding: 0, overflow: 'hidden' }}>
            {/* Directory toolbar with filter and searches */}
            <div style={{ padding: '16px 24px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)', display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 260 }}>
                <div style={{ position: 'relative', width: '100%' }}>
                  <Search size={16} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    type="text" 
                    placeholder="Search name, ID or role..." 
                    className="form-input" 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                    style={{ paddingLeft: 34, fontSize: 12, height: 36 }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Filter size={14} style={{ color: 'var(--text-secondary)' }} />
                  <select 
                    value={deptFilter} 
                    onChange={(e) => setDeptFilter(e.target.value)} 
                    className="form-select"
                    style={{ fontSize: 12, height: 36, padding: '0 28px 0 10px', minWidth: 120 }}
                  >
                    {filterDepts.map(d => (
                      <option key={d} value={d}>{d} Department</option>
                    ))}
                  </select>
                </div>

                <select 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value)} 
                  className="form-select"
                  style={{ fontSize: 12, height: 36, padding: '0 28px 0 10px', minWidth: 100 }}
                >
                  <option value="All">All Status</option>
                  <option value="Active">Active</option>
                  <option value="On Leave">On Leave</option>
                </select>
              </div>
            </div>

            {/* Employee Table */}
            <div className="table-container" style={{ border: 'none', marginTop: 0 }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Department</th>
                    <th>Role (Designation)</th>
                    <th>Shift</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map(emp => (
                    <tr 
                      key={emp.id} 
                      onClick={() => setSelectedEmpId(selectedEmpId === emp.id ? null : emp.id)}
                      style={{ 
                        cursor: 'pointer',
                        backgroundColor: selectedEmpId === emp.id ? 'var(--bg-accent-alpha)' : '',
                        borderLeft: selectedEmpId === emp.id ? '3px solid var(--brand-color)' : ''
                      }}
                    >
                      <td style={{ fontWeight: 600, color: 'var(--brand-color)' }}>{emp.id}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ 
                            width: 32, 
                            height: 32, 
                            borderRadius: '50%', 
                            background: 'var(--bg-accent-alpha)', 
                            color: 'var(--brand-color)', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            fontSize: 11, 
                            fontWeight: 700,
                            overflow: 'hidden'
                          }}>
                            {emp.image ? (
                              <>
                                <img 
                                  src={getImageUrl(emp.image)} 
                                  alt={emp.name} 
                                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    if (e.target.nextSibling) {
                                      e.target.nextSibling.style.display = 'flex';
                                    }
                                  }}
                                />
                                <div style={{ 
                                  display: 'none',
                                  width: '100%', 
                                  height: '100%', 
                                  alignItems: 'center', 
                                  justifyContent: 'center'
                                }}>
                                  {emp.avatar}
                                </div>
                              </>
                            ) : (
                              emp.avatar
                            )}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600 }}>{emp.name}</div>
                            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{emp.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>{emp.department}</td>
                      <td>{emp.role || emp.designation}</td>
                      <td>
                        <span className="badge badge-info" style={{ textTransform: 'none', fontSize: 10 }}>
                          {emp.rosterShift.split(' ')[0]}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${emp.status === 'Active' ? 'badge-success' : 'badge-warning'}`}>
                          {emp.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button 
                          className="btn btn-secondary btn-danger" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteEmployee(emp.id);
                          }}
                          style={{ padding: '4px 8px', fontSize: 10, color: 'var(--color-danger)' }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredEmployees.length === 0 && (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)' }}>
                        No employee records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Detailed Inspector Panel */}
          {selectedEmpId && (() => {
            const emp = employees.find(e => e.id === selectedEmpId);
            if (!emp) return null;
            const reportingManagers = emp.reportsTo.map(id => employees.find(m => m.id === id)).filter(Boolean);

            return (
              <div className="card-panel" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: 14 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--brand-color)' }}>{emp.id} Profile</span>
                  <button onClick={() => setSelectedEmpId(null)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>×</button>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <div style={{ 
                    width: 144, 
                    height: 144, 
                    borderRadius: '50%', 
                    background: 'var(--brand-color)', 
                    color: '#fff', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontSize: 48, 
                    fontWeight: 700,
                    margin: '0 auto 12px auto',
                    boxShadow: 'var(--shadow-md)',
                    overflow: 'hidden'
                  }}>
                    {emp.image ? (
                      <>
                        <img 
                          src={getImageUrl(emp.image)} 
                          alt={emp.name} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            if (e.target.nextSibling) {
                              e.target.nextSibling.style.display = 'flex';
                            }
                          }}
                        />
                        <div style={{ 
                          display: 'none',
                          width: '100%', 
                          height: '100%', 
                          alignItems: 'center', 
                          justifyContent: 'center'
                        }}>
                          {emp.avatar}
                        </div>
                      </>
                    ) : (
                      emp.avatar
                    )}
                  </div>
                  <h2 style={{ fontSize: '1.25rem', marginBottom: 4 }}>{emp.name}</h2>
                  <span className="badge badge-info" style={{ textTransform: 'uppercase', fontSize: 9, padding: '2px 8px' }}>
                    {emp.role || emp.designation}
                  </span>
                </div>

                <div style={{ background: 'var(--bg-tertiary)', padding: 16, borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 12, fontSize: 11 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Briefcase size={14} style={{ color: 'var(--text-muted)' }} />
                    <span style={{ color: 'var(--text-secondary)', width: 90 }}>Department:</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{emp.department}</strong>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Mail size={14} style={{ color: 'var(--text-muted)' }} />
                    <span style={{ color: 'var(--text-secondary)', width: 90 }}>Email Addr:</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{emp.email}</strong>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Phone size={14} style={{ color: 'var(--text-muted)' }} />
                    <span style={{ color: 'var(--text-secondary)', width: 90 }}>Direct Phone:</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{emp.phone}</strong>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Calendar size={14} style={{ color: 'var(--text-muted)' }} />
                    <span style={{ color: 'var(--text-secondary)', width: 90 }}>Date Joined:</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{emp.joiningDate}</strong>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Clock size={14} style={{ color: 'var(--text-muted)' }} />
                    <span style={{ color: 'var(--text-secondary)', width: 90 }}>Roster Shift:</span>
                    <strong style={{ color: 'var(--brand-color)' }}>{emp.rosterShift}</strong>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Network size={14} style={{ color: 'var(--text-muted)' }} />
                      <span style={{ color: 'var(--text-secondary)' }}>Reports to Managers:</span>
                    </div>
                    <div style={{ paddingLeft: 22 }}>
                      {reportingManagers.length > 0 ? reportingManagers.map(m => (
                        <div key={m.id} style={{ fontWeight: 600, color: 'var(--text-primary)', margin: '2px 0' }}>• {m.name}</div>
                      )) : <div style={{ color: 'var(--text-muted)', fontSize: 10 }}>Independent (No Managers)</div>}
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 'auto', display: 'flex', gap: 10 }}>
                  <button 
                    className="btn btn-secondary" 
                    onClick={() => {
                      const newStatus = emp.status === 'Active' ? 'On Leave' : 'Active';
                      setEmployees(employees.map(e => e.id === emp.id ? { ...e, status: newStatus } : e));
                    }}
                    style={{ width: '100%', fontSize: 11 }}
                  >
                    Change Status to {emp.status === 'Active' ? 'On Leave' : 'Active'}
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {activeTab === 'dashboard' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* KPI Widget Cards Grid */}
          <div className="grid-4col" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
            <div className="card-panel" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ background: 'var(--bg-accent-alpha)', color: 'var(--brand-color)', padding: 12, borderRadius: 'var(--radius-md)' }}>
                <Users size={24} />
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Total Employees</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{employees.length}</div>
              </div>
            </div>

            <div className="card-panel" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-success)', padding: 12, borderRadius: 'var(--radius-md)' }}>
                <UserCheck size={24} />
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Present Today</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                  {employees.filter(e => e.status === 'Active').length}
                </div>
              </div>
            </div>

            <div className="card-panel" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-danger)', padding: 12, borderRadius: 'var(--radius-md)' }}>
                <UserMinus size={24} />
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>On Leave / Out</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                  {employees.filter(e => e.status === 'On Leave').length}
                </div>
              </div>
            </div>

            <div className="card-panel" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--color-info)', padding: 12, borderRadius: 'var(--radius-md)' }}>
                <Briefcase size={24} />
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Active Roles</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                  {new Set(employees.map(e => e.role || e.designation)).size}
                </div>
              </div>
            </div>
          </div>

          {/* Grid for Leaves Approval & Roster Schedules */}
          <div className="grid-2col" style={{ display: 'grid', gridTemplateColumns: '1.25fr 0.75fr', gap: 24 }}>
            {/* Leave Requests */}
            <div className="card-panel" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Leave Requests Inbox</h3>
                <span className="badge badge-info" style={{ fontSize: 10 }}>Action Required</span>
              </div>

              <div className="table-container" style={{ border: 'none', marginTop: 0 }}>
                <table className="custom-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Leave Type</th>
                      <th>Dates</th>
                      <th>Reason</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaveRequests.map(lr => (
                      <tr key={lr.id}>
                        <td>
                          <div style={{ fontWeight: 600 }}>{lr.name}</div>
                          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{lr.department}</div>
                        </td>
                        <td>{lr.type}</td>
                        <td style={{ fontSize: 11 }}>
                          {lr.start} to {lr.end}
                        </td>
                        <td style={{ fontSize: 11, color: 'var(--text-secondary)', maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {lr.reason}
                        </td>
                        <td>
                          <span className={`badge ${lr.status === 'Approved' ? 'badge-success' : lr.status === 'Pending' ? 'badge-warning' : 'badge-danger'}`}>
                            {lr.status}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          {lr.status === 'Pending' && (
                            <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                              <button 
                                className="btn btn-primary" 
                                onClick={() => handleApproveLeave(lr.id)} 
                                style={{ padding: '4px 8px', fontSize: 10, background: 'var(--color-success)', borderColor: 'var(--color-success)' }}
                              >
                                <Check size={11} /> Approve
                              </button>
                              <button 
                                className="btn btn-secondary btn-danger" 
                                onClick={() => handleRejectLeave(lr.id)} 
                                style={{ padding: '4px 8px', fontSize: 10, color: 'var(--color-danger)' }}
                              >
                                <X size={11} /> Reject
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Roster Shift Roster compliance list */}
            <div className="card-panel" style={{ padding: 20 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16 }}>Roster Shift Distribution</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {['Morning (08:00 - 16:00)', 'Afternoon (16:00 - 00:00)', 'Night (00:00 - 08:00)', 'On Call (24 Hours)'].map(shift => {
                  const assignedCount = employees.filter(e => e.rosterShift === shift).length;
                  return (
                    <div key={shift} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Clock size={16} style={{ color: 'var(--brand-color)' }} />
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 700 }}>{shift.split(' ')[0]} Shift</div>
                          <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>{shift.match(/\(([^)]+)\)/)?.[1] || ''}</div>
                        </div>
                      </div>
                      <span className="badge badge-info" style={{ fontSize: 10, padding: '4px 8px' }}>
                        {assignedCount} Assigned
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REGISTER NEW EMPLOYEE MODAL */}
      {showAddModal && (
        <div className="modal-overlay" style={{ display: 'flex', position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-content" style={{ width: '100%', maxWidth: 500, maxHeight: '90vh', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div className="modal-header" style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Register New Employee</h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', fontSize: 20 }}>×</button>
            </div>
            
            <form onSubmit={handleAddEmployeeSubmit} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1 }}>
              <div className="modal-body" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto', flex: 1 }}>
                {message.text && (
                  <div style={{
                    padding: '10px 14px',
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    background: message.type === 'error' ? 'var(--color-danger-bg)' : message.type === 'success' ? 'var(--color-success-bg)' : 'rgba(59, 130, 246, 0.1)',
                    color: message.type === 'error' ? 'var(--color-danger)' : message.type === 'success' ? 'var(--color-success)' : 'var(--color-info)',
                    border: `1px solid ${message.type === 'error' ? 'rgba(239, 68, 68, 0.3)' : message.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`
                  }}>
                    {message.text}
                  </div>
                )}

                <div className="grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>First Name (Mandatory)</label>
                    <input type="text" className="form-input" value={empFirstName} onChange={(e) => setEmpFirstName(e.target.value)} placeholder="e.g. Mereani" required disabled={isLoading} />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Last Name (Mandatory)</label>
                    <input type="text" className="form-input" value={empLastName} onChange={(e) => setEmpLastName(e.target.value)} placeholder="e.g. Waqanivalu" required disabled={isLoading} />
                  </div>
                </div>

                <div className="grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Email Address</label>
                    <input type="email" className="form-input" value={empEmail} onChange={(e) => setEmpEmail(e.target.value)} placeholder="name@carpenters.com.fj" required disabled={isLoading} />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Phone Number</label>
                    <input type="text" className="form-input" value={empPhone} onChange={(e) => setEmpPhone(e.target.value)} placeholder="+679 999 1234" disabled={isLoading} />
                  </div>
                </div>

                <div className="grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Department</label>
                    <select className="form-select" value={empDept} onChange={(e) => setEmpDept(e.target.value)} disabled={isLoading}>
                      {departments.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Designation</label>
                    <select className="form-select" value={empDesg} onChange={(e) => setEmpDesg(e.target.value)} disabled={isLoading} required>
                      {designations.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Gender (Mandatory)</label>
                    <select className="form-select" value={empGender} onChange={(e) => setEmpGender(e.target.value)} required disabled={isLoading}>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Date of Birth (Mandatory)</label>
                    <input type="date" className="form-input" value={empDob} onChange={(e) => setEmpDob(e.target.value)} required disabled={isLoading} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Company (Mandatory)</label>
                  <input type="text" className="form-input" value={empCompany} onChange={(e) => setEmpCompany(e.target.value)} placeholder="CARPENTERS PROPERTIES PTE LIMITED" required disabled={isLoading} />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Reports to Manager</label>
                  <select className="form-select" value={empReportsTo} onChange={(e) => setEmpReportsTo(e.target.value)} disabled={isLoading}>
                    <option value="">No Direct Manager (Independent)</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name} ({emp.designation})</option>
                    ))}
                  </select>
                </div>

                <div className="grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Status</label>
                    <select className="form-select" value={empStatus} onChange={(e) => setEmpStatus(e.target.value)} disabled={isLoading}>
                      <option value="Active">Active</option>
                      <option value="On Leave">On Leave</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Date of Joining</label>
                    <input type="date" className="form-input" value={empJoinDate} onChange={(e) => setEmpJoinDate(e.target.value)} disabled={isLoading} />
                  </div>
                </div>
              </div>

              <div className="modal-footer" style={{ padding: '16px 24px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: 12, flexShrink: 0 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)} disabled={isLoading}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isLoading}>
                  {isLoading ? 'Syncing with ERPNext...' : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
