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
  Filter 
} from 'lucide-react';

export default function Reports() {
  const [activeReport, setActiveReport] = useState('occupancy');
  const [filterProperty, setFilterProperty] = useState('ALL');

  const reportList = [
    { id: 'occupancy', name: 'Occupancy Report', icon: Users, description: 'Space utilization, vacancy logs, and occupancy rates.' },
    { id: 'rent-collection', name: 'Rent Collection Report', icon: DollarSign, description: 'Collected rent vs targets and efficiency tracking.' },
    { id: 'rent-arrears', name: 'Rent Arrears Report', icon: AlertTriangle, description: 'Overdue rent logs, tenant aging, and collection progress.' },
    { id: 'lease-expiry', name: 'Lease Expiry Report', icon: Calendar, description: 'Lease duration tracking and upcoming renewal timelines.' },
    { id: 'maintenance-cost', name: 'Maintenance Cost Report', icon: Hammer, description: 'Expenditures by task category and property allocation.' },
    { id: 'owner-statement', name: 'Owner Statement', icon: User, description: 'Owner share summaries, fees deducted, and net payouts.' },
    { id: 'property-pl', name: 'Property P&L', icon: Receipt, description: 'Revenues, operational deductions, and net operating income.' },
    { id: 'security-deposit', name: 'Security Deposit Register', icon: ShieldAlert, description: 'Escrow deposits held, security values, and refund status.' },
    { id: 'utility-billing', name: 'Utility Billing Report', icon: Flame, description: 'Meter readings, water, gas, power bills, and status.' },
    { id: 'property-performance', name: 'Property Performance Dashboard', icon: Activity, description: 'ROI analysis, yield metrics, and cap rate performance.' }
  ];

  // Dummy mock dataset for reporting engine
  const propertiesData = [
    { id: 'PROP-2041', name: 'Stratford Court Apartments', occupied: 21, vacant: 3, total: 24, rentCollected: 38850, rentTarget: 44400, depositHeld: 24000, utilities: 4200, maintenance: 1500, expenses: 3200, yield: 8.2 },
    { id: 'PROP-8032', name: 'Carpenters Row Commercial', occupied: 6, vacant: 2, total: 8, rentCollected: 28800, rentTarget: 38400, depositHeld: 32000, utilities: 6800, maintenance: 4500, expenses: 5400, yield: 7.5 },
    { id: 'PROP-9910', name: 'Estate Galleria Mall', occupied: 11, vacant: 6, total: 17, rentCollected: 60500, rentTarget: 93500, depositHeld: 55000, utilities: 12500, maintenance: 8800, expenses: 14200, yield: 9.1 },
    { id: 'PROP-3091', name: 'E15 Plaza complex', occupied: 13, vacant: 2, total: 15, rentCollected: 50700, rentTarget: 58500, depositHeld: 39000, utilities: 5400, maintenance: 3200, expenses: 4800, yield: 8.8 }
  ];

  const arrearsData = [
    { tenant: 'David Smith', property: 'Stratford Court Apartments', unit: 'Unit 4B', amount: 1850, daysOverdue: 12, contact: 'dsmith@gmail.com' },
    { tenant: 'Sarah Jenkins', property: 'Carpenters Row Commercial', unit: 'Bay 3', amount: 4800, daysOverdue: 8, contact: 'sjenkins@techglow.co.uk' },
    { tenant: 'John Doe', property: 'Stratford Court Apartments', unit: 'Unit 1C', amount: 925, daysOverdue: 4, contact: 'john.doe@gmail.com' }
  ];

  const leaseExpiryData = [
    { tenant: 'John Doe', property: 'Stratford Court Apartments', unit: 'Unit 1C', end: '2026-06-30', daysRemaining: 19 },
    { tenant: 'Sarah Jenkins', property: 'Carpenters Row Commercial', unit: 'Bay 3', end: '2026-08-15', daysRemaining: 65 },
    { tenant: 'David Smith', property: 'Stratford Court Apartments', unit: 'Unit 4B', end: '2026-09-01', daysRemaining: 82 }
  ];

  const filteredProperties = filterProperty === 'ALL' 
    ? propertiesData 
    : propertiesData.filter(p => p.id === filterProperty);

  const handlePrint = () => {
    window.print();
  };

  const renderReportContent = () => {
    switch (activeReport) {
      case 'occupancy':
        return (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: '1.1rem' }}>Occupancy Status Summary</h3>
              <span className="badge badge-info">Active Portfolio</span>
            </div>
            
            <div className="table-container" style={{ border: 'none' }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Property</th>
                    <th>Total Units</th>
                    <th>Occupied</th>
                    <th>Vacant</th>
                    <th>Occupancy Rate</th>
                    <th>Trend Indicator</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProperties.map(p => {
                    const pct = Math.round((p.occupied / p.total) * 100);
                    return (
                      <tr key={p.id}>
                        <td style={{ fontWeight: 600 }}>{p.name}</td>
                        <td>{p.total}</td>
                        <td style={{ color: 'var(--color-success)', fontWeight: 600 }}>{p.occupied}</td>
                        <td style={{ color: 'var(--color-danger)', fontWeight: 600 }}>{p.vacant}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ flex: 1, minWidth: 60, height: 6, background: 'var(--bg-tertiary)', borderRadius: 3, overflow: 'hidden' }}>
                              <div style={{ width: `${pct}%`, height: '100%', background: 'var(--brand-color)' }} />
                            </div>
                            <span>{pct}%</span>
                          </div>
                        </td>
                        <td><span className="badge badge-success">Stable</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'rent-collection':
        return (
          <div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: 16 }}>Rent Collection Efficiency</h3>
            <div className="table-container" style={{ border: 'none' }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Property</th>
                    <th>Target Rent</th>
                    <th>Collected Rent</th>
                    <th>Outstanding Rent</th>
                    <th>Collection Efficiency</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProperties.map(p => {
                    const outstanding = p.rentTarget - p.rentCollected;
                    const pct = Math.round((p.rentCollected / p.rentTarget) * 100);
                    return (
                      <tr key={p.id}>
                        <td style={{ fontWeight: 600 }}>{p.name}</td>
                        <td>${p.rentTarget.toLocaleString()}</td>
                        <td style={{ color: 'var(--color-success)' }}>${p.rentCollected.toLocaleString()}</td>
                        <td style={{ color: 'var(--color-danger)' }}>${outstanding.toLocaleString()}</td>
                        <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{pct}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'rent-arrears':
        return (
          <div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: 16 }}>Aged Receivables (Arrears Ledger)</h3>
            <div className="table-container" style={{ border: 'none' }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Tenant</th>
                    <th>Property</th>
                    <th>Unit</th>
                    <th>Arrears Amount</th>
                    <th>Days Overdue</th>
                    <th>Contact Email</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {arrearsData.map((a, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600 }}>{a.tenant}</td>
                      <td>{a.property}</td>
                      <td>{a.unit}</td>
                      <td style={{ color: 'var(--color-danger)', fontWeight: 700 }}>${a.amount.toLocaleString()}</td>
                      <td>
                        <span className={`badge ${a.daysOverdue > 10 ? 'badge-danger' : 'badge-warning'}`}>
                          {a.daysOverdue} Days
                        </span>
                      </td>
                      <td>{a.contact}</td>
                      <td>
                        <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: 10 }}>Dunning Letter</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'lease-expiry':
        return (
          <div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: 16 }}>Upcoming Lease Expirations</h3>
            <div className="table-container" style={{ border: 'none' }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Tenant</th>
                    <th>Property</th>
                    <th>Unit</th>
                    <th>Expiration Date</th>
                    <th>Days Remaining</th>
                    <th>Risk Factor</th>
                  </tr>
                </thead>
                <tbody>
                  {leaseExpiryData.map((l, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600 }}>{l.tenant}</td>
                      <td>{l.property}</td>
                      <td>{l.unit}</td>
                      <td>{l.end}</td>
                      <td>
                        <span style={{ fontWeight: 700, color: l.daysRemaining < 30 ? 'var(--color-danger)' : 'var(--text-primary)' }}>
                          {l.daysRemaining} days
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${l.daysRemaining < 30 ? 'badge-danger' : 'badge-warning'}`}>
                          {l.daysRemaining < 30 ? 'High Expiry Risk' : 'Medium'}
                        </span>
                      </td>
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
            <h3 style={{ fontSize: '1.1rem', marginBottom: 16 }}>Maintenance Expenditure Report</h3>
            <div className="table-container" style={{ border: 'none' }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Property</th>
                    <th>Routine Operations</th>
                    <th>Emergency Tasks</th>
                    <th>Total Expenses Allocated</th>
                    <th>Allocation Efficiency</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProperties.map(p => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 600 }}>{p.name}</td>
                      <td>${(p.maintenance * 0.4).toLocaleString()}</td>
                      <td>${(p.maintenance * 0.6).toLocaleString()}</td>
                      <td style={{ fontWeight: 700 }}>${p.maintenance.toLocaleString()}</td>
                      <td><span className="badge badge-success">Under Budget</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'owner-statement':
        return (
          <div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: 16 }}>Syndicate Owner Payout Statements</h3>
            <div className="table-container" style={{ border: 'none' }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Owner / Trust Entity</th>
                    <th>Gross Share Base</th>
                    <th>Management Fee Deductions</th>
                    <th>Net Payout</th>
                    <th>Payout Schedule</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ fontWeight: 600 }}>Carpenters Trust Group (60% Share)</td>
                    <td>$40,560</td>
                    <td>$2,430 (6%)</td>
                    <td style={{ color: 'var(--brand-color)', fontWeight: 700 }}>$38,130</td>
                    <td><span className="badge badge-success">Paid</span></td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600 }}>Stratford Holdings Ltd (40% Share)</td>
                    <td>$27,040</td>
                    <td>$1,890 (7%)</td>
                    <td style={{ color: 'var(--brand-color)', fontWeight: 700 }}>$25,150</td>
                    <td><span className="badge badge-success">Paid</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'property-pl':
        return (
          <div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: 16 }}>Profit & Loss Ledger (P&L)</h3>
            <div className="table-container" style={{ border: 'none' }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Property Portfolio</th>
                    <th>Gross Rental Income</th>
                    <th>Operational Expenses</th>
                    <th>Maintenance Allocations</th>
                    <th>Net Operating Income (NOI)</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProperties.map(p => {
                    const noi = p.rentCollected - p.expenses - p.maintenance;
                    return (
                      <tr key={p.id}>
                        <td style={{ fontWeight: 600 }}>{p.name}</td>
                        <td style={{ color: 'var(--color-success)' }}>${p.rentCollected.toLocaleString()}</td>
                        <td style={{ color: 'var(--color-danger)' }}>-${p.expenses.toLocaleString()}</td>
                        <td style={{ color: 'var(--color-danger)' }}>-${p.maintenance.toLocaleString()}</td>
                        <td style={{ fontWeight: 700, color: noi > 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                          ${noi.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'security-deposit':
        return (
          <div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: 16 }}>Escrow Security Deposit Register</h3>
            <div className="table-container" style={{ border: 'none' }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Property Portfolio</th>
                    <th>Escrow Cash Balances</th>
                    <th>Refund Status</th>
                    <th>Audit Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProperties.map(p => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 600 }}>{p.name}</td>
                      <td style={{ fontWeight: 700 }}>${p.depositHeld.toLocaleString()}</td>
                      <td><span className="badge badge-info">Held in Trust</span></td>
                      <td><span className="badge badge-success">Audited & Certified</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'utility-billing':
        return (
          <div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: 16 }}>Utility Meter Billing Logs</h3>
            <div className="table-container" style={{ border: 'none' }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Property Portfolio</th>
                    <th>HVAC Grid Allocation</th>
                    <th>Water Grid Billing</th>
                    <th>Total Utility Expense</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProperties.map(p => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 600 }}>{p.name}</td>
                      <td>${(p.utilities * 0.7).toLocaleString()}</td>
                      <td>${(p.utilities * 0.3).toLocaleString()}</td>
                      <td style={{ fontWeight: 700 }}>${p.utilities.toLocaleString()}</td>
                      <td><span className="badge badge-success">Settled</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'property-performance':
        return (
          <div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: 16 }}>Property Performance Dashboard</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 20 }}>
              {filteredProperties.map(p => (
                <div key={p.id} style={{ background: 'var(--bg-tertiary)', padding: 16, borderRadius: 10, border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>{p.name}</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--brand-color)', margin: '8px 0' }}>{p.yield}%</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Net Rental ROI Yield</div>
                </div>
              ))}
            </div>
            
            <div style={{ padding: 16, border: '1px dashed var(--border-color)', borderRadius: 10, textAlign: 'center', background: 'var(--bg-secondary)' }}>
              <h4 style={{ fontSize: 13, marginBottom: 6 }}>Aggregation cap rate calculations</h4>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                Average Portfolio Cap Rate yield is currently performing at <strong>8.4% Net Yield</strong>, exceeding the Greater London Q2 benchmark by 1.2%.
              </p>
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
          <button className="btn btn-primary" style={{ gap: 6, fontSize: 12 }}>
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      <div className="grid-2col" style={{ gridTemplateColumns: '260px 1fr', gap: 24 }}>
        {/* Left selector menu list */}
        <div className="card-panel" style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', borderBottom: '1px solid var(--border-color)', marginBottom: 6 }}>
            <Filter size={14} style={{ color: 'var(--brand-color)' }} />
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Filter Property</span>
          </div>
          
          <select 
            value={filterProperty} 
            onChange={(e) => setFilterProperty(e.target.value)} 
            className="form-select"
            style={{ padding: '6px 10px', fontSize: 12, marginBottom: 14 }}
          >
            <option value="ALL">All Portfolio Assets</option>
            {propertiesData.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

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
                  fontSize: 12.5, 
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
