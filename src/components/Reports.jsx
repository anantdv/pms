import React, { useState } from 'react';
import { 
  Building, 
  TrendingUp, 
  Users, 
  DollarSign, 
  AlertTriangle, 
  Calendar, 
  Hammer, 
  Receipt, 
  User, 
  Activity, 
  Flame, 
  ShieldAlert, 
  Printer, 
  Download, 
  Filter,
  FileText,
  UserCheck,
  CheckCircle,
  Briefcase
} from 'lucide-react';

export default function Reports() {
  const [activeReport, setActiveReport] = useState('ticket-summary');
  const [filterProperty, setFilterProperty] = useState('ALL');
  const [startDate, setStartDate] = useState('2026-06-01');
  const [endDate, setEndDate] = useState('2026-06-30');

  const reportList = [
    { id: 'ticket-summary', name: '1. Ticket Summary Report', icon: FileText, description: 'Aggregated list of support tickets by status, category, and severity.' },
    { id: 'maintenance-cost', name: '2. Maintenance Cost Report', icon: DollarSign, description: 'Detailed variance logs between estimated and actual costings.' },
    { id: 'property-wise', name: '3. Property-wise Maintenance', icon: Building, description: 'Operational overview of maintenance tickets segmented by estate.' },
    { id: 'tech-performance', name: '4. Technician Performance', icon: UserCheck, description: 'Jobs resolved, active workload, rating, and SLA completion rates.' },
    { id: 'vendor-performance', name: '5. Vendor Performance Report', icon: Briefcase, description: 'Active supplier contracts, quotations, payouts, and service ratings.' },
    { id: 'sla-compliance', name: '6. SLA Compliance Report', icon: Activity, description: 'Analysis of response and resolution times against configured SLAs.' },
    { id: 'asset-breakdown', name: '7. Asset Breakdown Report', icon: AlertTriangle, description: 'warranty details, active AMC contracts, and historical breakdown logs.' },
    { id: 'preventive-maint', name: '8. Preventive Maintenance', icon: Calendar, description: 'Chronological list of PM iterations, due dates, and recurrence logs.' }
  ];

  // Dummy mock dataset for reporting engine
  const ticketSummaryData = [
    { id: 'SUP-728', subject: 'Grinding noise in Lift B', category: 'Electrical', tenant: 'Jane Doe', priority: 'High', status: 'In Progress', date: '2026-06-12' },
    { id: 'SUP-729', subject: 'Water leakage in public lobby', category: 'Plumbing', tenant: 'Biswajit Maity', priority: 'Critical', status: 'Resolved', date: '2026-06-15' },
    { id: 'SUP-730', subject: 'Smoke detector beeping', category: 'Security', tenant: 'John Doe', priority: 'Medium', status: 'Open', date: '2026-06-16' }
  ];

  const maintenanceCostData = [
    { id: 'WO-2026-0001', category: 'Plumbing', property: 'Stratford Court Apartments', est: 6500, actual: 6500, variance: 0, status: 'Completed' },
    { id: 'WO-2026-0002', category: 'Electrical', property: 'Estate Galleria Mall', est: 1200, actual: 1500, variance: 300, status: 'Completed' },
    { id: 'WO-2026-0003', category: 'HVAC', property: 'Carpenters Row Commercial', est: 800, actual: 0, variance: -800, status: 'In Progress' }
  ];

  const propertyWiseData = [
    { property: 'Stratford Court Apartments', totalTickets: 12, open: 3, resolved: 9, cost: 7400 },
    { property: 'Carpenters Row Commercial', totalTickets: 8, open: 2, resolved: 6, cost: 11200 },
    { property: 'Estate Galleria Mall', totalTickets: 15, open: 5, resolved: 10, cost: 19800 }
  ];

  const techPerformanceData = [
    { name: 'Michael Chang', skill: 'Plumbing', resolvedJobs: 14, activeJobs: 1, slaRate: '98%', rating: 4.8 },
    { name: 'Sarah Connor', skill: 'Electrical', resolvedJobs: 11, activeJobs: 2, slaRate: '95%', rating: 4.6 },
    { name: 'John Miller', skill: 'HVAC', resolvedJobs: 9, activeJobs: 0, slaRate: '90%', rating: 4.4 }
  ];

  const vendorPerformanceData = [
    { name: 'Pacific Elevators Ltd', category: 'Technical Services', activeWO: 2, ytdCost: 28000, rating: 4.8 },
    { name: 'Suva Cleaning Services', category: 'Cleaning', activeWO: 0, ytdCost: 12500, rating: 4.5 },
    { name: 'Fiji Security Solutions', category: 'Security', activeWO: 1, ytdCost: 19000, rating: 4.7 }
  ];

  const slaComplianceData = [
    { id: 'SUP-728', priority: 'High', responseSLA: 'Met', resolutionSLA: 'Met', responseTime: '15 Min', resolutionTime: '18 Hours' },
    { id: 'SUP-729', priority: 'Critical', responseSLA: 'Met', resolutionSLA: 'Met', responseTime: '8 Min', resolutionTime: '3.5 Hours' },
    { id: 'SUP-730', priority: 'Medium', responseSLA: 'Breached', resolutionSLA: 'Pending', responseTime: '12 Hours', resolutionTime: 'Pending' }
  ];

  const assetBreakdownData = [
    { name: 'Emergency Power Generator 80KVA', status: 'Operational', lastBreakdown: '2026-04-12', amcContract: 'Cummins Fiji', warranty: '2028-12-31' },
    { name: 'Passenger Elevator Block B', status: 'Under Maintenance', lastBreakdown: '2026-06-10', amcContract: 'Otis Elevators', warranty: 'Expired' }
  ];

  const preventiveData = [
    { id: 'PM-001', asset: 'Passenger Elevator Block B', freq: 'Monthly', nextDue: '2026-06-15', status: 'Overdue' },
    { id: 'PM-002', asset: 'Emergency Power Generator 80KVA', freq: 'Quarterly', nextDue: '2026-07-10', status: 'Active' }
  ];

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    if (activeReport === 'ticket-summary') {
      csvContent += "ID,Subject,Category,Tenant,Priority,Status,Date\n";
      ticketSummaryData.forEach(row => {
        csvContent += `${row.id},"${row.subject}",${row.category},${row.tenant},${row.priority},${row.status},${row.date}\n`;
      });
    } else if (activeReport === 'maintenance-cost') {
      csvContent += "ID,Category,Property,Estimated Cost,Actual Cost,Variance,Status\n";
      maintenanceCostData.forEach(row => {
        csvContent += `${row.id},${row.category},"${row.property}",${row.est},${row.actual},${row.variance},${row.status}\n`;
      });
    } else {
      csvContent += "Report,Generated,Status\nMock Report Export,2026-06-16,Success\n";
    }
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${activeReport}_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderReportContent = () => {
    switch (activeReport) {
      case 'ticket-summary':
        return (
          <div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: 16 }}>1. Ticket Summary Report</h3>
            <div className="table-container" style={{ border: 'none' }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Subject</th>
                    <th>Category</th>
                    <th>Tenant</th>
                    <th>Priority</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {ticketSummaryData.map(t => (
                    <tr key={t.id}>
                      <td style={{ fontWeight: 600, color: 'var(--brand-color)' }}>{t.id}</td>
                      <td>{t.subject}</td>
                      <td>{t.category}</td>
                      <td>{t.tenant}</td>
                      <td><span className={`badge ${t.priority === 'Critical' ? 'badge-danger' : 'badge-warning'}`}>{t.priority}</span></td>
                      <td><span className="badge badge-info">{t.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'maintenance-cost':
        return (
          <div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: 16 }}>2. Maintenance Cost & Variance Report</h3>
            <div className="table-container" style={{ border: 'none' }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>WO ID</th>
                    <th>Property</th>
                    <th>Category</th>
                    <th>Est. Cost</th>
                    <th>Actual Cost</th>
                    <th>Variance</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {maintenanceCostData.map(c => (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 600, color: 'var(--brand-color)' }}>{c.id}</td>
                      <td>{c.property}</td>
                      <td>{c.category}</td>
                      <td>${c.est.toLocaleString()}</td>
                      <td>${c.actual.toLocaleString()}</td>
                      <td style={{ color: c.variance > 0 ? 'var(--color-danger)' : 'var(--color-success)', fontWeight: 600 }}>
                        {c.variance > 0 ? `+$${c.variance}` : `$${c.variance}`}
                      </td>
                      <td><span className="badge badge-success">{c.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'property-wise':
        return (
          <div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: 16 }}>3. Property-wise Maintenance Summary</h3>
            <div className="table-container" style={{ border: 'none' }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Property Portfolio</th>
                    <th>Total Tickets</th>
                    <th>Open</th>
                    <th>Resolved</th>
                    <th>Aggregated Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {propertyWiseData.map((p, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 600 }}>{p.property}</td>
                      <td>{p.totalTickets}</td>
                      <td>{p.open}</td>
                      <td style={{ color: 'var(--color-success)', fontWeight: 600 }}>{p.resolved}</td>
                      <td style={{ fontWeight: 700 }}>${p.cost.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'tech-performance':
        return (
          <div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: 16 }}>4. Technician Performance Metrics</h3>
            <div className="table-container" style={{ border: 'none' }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Technician</th>
                    <th>Skill</th>
                    <th>Resolved Jobs</th>
                    <th>Active Load</th>
                    <th>SLA Met Rate</th>
                    <th>Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {techPerformanceData.map((tech, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 600 }}>{tech.name}</td>
                      <td>{tech.skill}</td>
                      <td>{tech.resolvedJobs}</td>
                      <td>{tech.activeJobs}</td>
                      <td>{tech.slaRate}</td>
                      <td>⭐ {tech.rating}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'vendor-performance':
        return (
          <div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: 16 }}>5. Vendor SLA & Cost Performance</h3>
            <div className="table-container" style={{ border: 'none' }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Vendor</th>
                    <th>Service Category</th>
                    <th>Active WOs</th>
                    <th>YTD Cost</th>
                    <th>Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {vendorPerformanceData.map((v, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 600 }}>{v.name}</td>
                      <td>{v.category}</td>
                      <td>{v.activeWO}</td>
                      <td style={{ fontWeight: 700 }}>${v.ytdCost.toLocaleString()}</td>
                      <td>⭐ {v.rating}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'sla-compliance':
        return (
          <div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: 16 }}>6. SLA Compliance Audit Log</h3>
            <div className="table-container" style={{ border: 'none' }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Ticket ID</th>
                    <th>Priority</th>
                    <th>Response Status</th>
                    <th>Avg. Response</th>
                    <th>Resolution Status</th>
                    <th>Avg. Resolution</th>
                  </tr>
                </thead>
                <tbody>
                  {slaComplianceData.map(s => (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 600, color: 'var(--brand-color)' }}>{s.id}</td>
                      <td>{s.priority}</td>
                      <td>
                        <span className={`badge ${s.responseSLA === 'Met' ? 'badge-success' : 'badge-danger'}`}>
                          {s.responseSLA}
                        </span>
                      </td>
                      <td>{s.responseTime}</td>
                      <td>
                        <span className={`badge ${s.resolutionSLA === 'Met' ? 'badge-success' : s.resolutionSLA === 'Pending' ? 'badge-warning' : 'badge-danger'}`}>
                          {s.resolutionSLA}
                        </span>
                      </td>
                      <td>{s.resolutionTime}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'asset-breakdown':
        return (
          <div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: 16 }}>7. Asset Health & Breakdown History</h3>
            <div className="table-container" style={{ border: 'none' }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Asset Name</th>
                    <th>Warranty Expiry</th>
                    <th>AMC Contract Partner</th>
                    <th>Breakdown Logs</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {assetBreakdownData.map((a, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 600 }}>{a.name}</td>
                      <td>{a.warranty}</td>
                      <td>{a.amcContract}</td>
                      <td>{a.lastBreakdown}</td>
                      <td>
                        <span className={`badge ${a.status === 'Operational' ? 'badge-success' : 'badge-warning'}`}>
                          {a.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'preventive-maint':
        return (
          <div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: 16 }}>8. Preventive Maintenance Logs</h3>
            <div className="table-container" style={{ border: 'none' }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>PM ID</th>
                    <th>Asset Name</th>
                    <th>Frequency</th>
                    <th>Next Due Date</th>
                    <th>Recurrence Status</th>
                  </tr>
                </thead>
                <tbody>
                  {preventiveData.map(p => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 600 }}>{p.id}</td>
                      <td>{p.asset}</td>
                      <td>{p.freq}</td>
                      <td>{p.nextDue}</td>
                      <td>
                        <span className={`badge ${p.status === 'Overdue' ? 'badge-danger' : 'badge-success'}`}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div>
      <div className="view-header" style={{ marginBottom: 20 }}>
        <div>
          <h1 className="view-title">System Reports Engine</h1>
          <p className="view-subtitle">Generate, audit, and print official portfolio spreadsheets and statements.</p>
        </div>
        
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={handlePrint} style={{ gap: 6, fontSize: 12 }}>
            <Printer size={14} /> Print Report
          </button>
          <button className="btn btn-primary" onClick={handleExportCSV} style={{ gap: 6, fontSize: 12 }}>
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      <div className="grid-2col" style={{ gridTemplateColumns: '280px 1fr', gap: 24 }}>
        {/* Left selector menu list */}
        <div className="card-panel" style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
          
          {/* Date range filters */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 8, borderBottom: '1px solid var(--border-color)', marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Date Filter Range</span>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="form-input" style={{ padding: 4, fontSize: 11 }} />
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="form-input" style={{ padding: 4, fontSize: 11 }} />
          </div>

          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', padding: '0 8px 6px' }}>Select Ledger View</div>
          
          {reportList.map(rep => {
            const IconComponent = rep.icon;
            const isActive = activeReport === rep.id;
            return (
              <div 
                key={rep.id} 
                className={`menu-item ${isActive ? 'active' : ''}`}
                onClick={() => setActiveReport(rep.id)}
                style={{ 
                  padding: '10px 12px', 
                  fontSize: 12, 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 10,
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  backgroundColor: isActive ? '#0f172a' : 'transparent',
                  color: isActive ? '#ffffff' : 'var(--text-secondary)'
                }}
              >
                <IconComponent size={15} style={{ color: isActive ? 'var(--brand-color)' : 'inherit' }} />
                <span style={{ fontWeight: isActive ? 600 : 500 }}>{rep.name}</span>
              </div>
            );
          })}
        </div>

        {/* Right reporting workspace board */}
        <div className="card-panel" style={{ minHeight: 460 }}>
          {renderReportContent()}
        </div>
      </div>
    </div>
  );
}
