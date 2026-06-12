import React, { useState } from 'react';
import { UserCheck, ShieldCheck, Mail, Phone, Briefcase, DollarSign, X, CheckCircle, TrendingUp } from 'lucide-react';

export default function Owners({ owners }) {
  const [selectedOwner, setSelectedOwner] = useState(null);

  // Pagination states & calculations
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const totalPages = Math.ceil(owners.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = owners.slice(indexOfFirstItem, indexOfLastItem);

  const renderPaginationControls = () => {
    if (totalPages <= 1) return null;
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 24px', borderTop: '1px solid var(--border-color)', fontSize: 13, color: 'var(--text-secondary)', background: 'var(--bg-card)' }}>
        <div>
          Showing <strong>{indexOfFirstItem + 1}</strong> to <strong>{Math.min(indexOfLastItem, owners.length)}</strong> of <strong>{owners.length}</strong> entries
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

  return (
    <div>
      <div className="view-header">
        <div>
          <h1 className="view-title">Property Owners & Asset Partners</h1>
          <p className="view-subtitle">Monitor portfolios, percentage shareholdings, and commission payout metrics.</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <span>Total Asset Partners</span>
            <UserCheck size={18} />
          </div>
          <div className="stat-value">{owners.length}</div>
          <div className="stat-indicator indicator-up">100% Verified Partners</div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <span>Total Properties Owned</span>
            <Briefcase size={18} />
          </div>
          <div className="stat-value">12</div>
          <div className="stat-indicator text-muted">Spread across 3 divisions</div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <span>Aggregated Owner Equity</span>
            <DollarSign size={18} />
          </div>
          <div className="stat-value">$4.2M</div>
          <div className="stat-indicator indicator-up">+8.4% YoY appreciation</div>
        </div>
      </div>

      {/* Split Details Layout */}
      <div className="grid-2col" style={{ gridTemplateColumns: selectedOwner ? '60% calc(40% - 24px)' : '1fr', gap: 24, transition: 'all 0.3s ease' }}>
        
        {/* Owners List */}
        <div className="card-panel" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Owner ID</th>
                  <th>Owner Details</th>
                  <th>Equity Share</th>
                  <th>Last Payout Log</th>
                  <th>Verification</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map(owner => (
                  <tr 
                    key={owner.id}
                    onClick={() => setSelectedOwner(owner)}
                    style={{ 
                      cursor: 'pointer',
                      backgroundColor: selectedOwner?.id === owner.id ? 'var(--bg-accent-alpha)' : '',
                      borderLeft: selectedOwner?.id === owner.id ? '3px solid var(--brand-color)' : ''
                    }}
                  >
                    <td style={{ fontWeight: 600, color: 'var(--brand-color)' }}>{owner.id}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{owner.name}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
                        <Mail size={11} /> {owner.email}
                      </div>
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--brand-color)' }}>{owner.share}%</td>
                    <td>
                      <span style={{ fontWeight: 600, color: 'var(--color-success)' }}>${owner.lastPayout.toLocaleString()}</span>
                    </td>
                    <td>
                      <span className="badge badge-success" style={{ gap: 6 }}>
                        <ShieldCheck size={12} /> Verified
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {renderPaginationControls()}
        </div>

        {/* Selected Owner Detail Panel */}
        {selectedOwner && (
          <div className="card-panel" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20, animation: 'fadeIn 0.2s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShieldCheck size={18} style={{ color: 'var(--brand-color)' }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--brand-color)' }}>{selectedOwner.id}</span>
              </div>
              <button 
                onClick={() => setSelectedOwner(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex' }}
              >
                <X size={18} />
              </button>
            </div>

            <div>
              <h2 style={{ fontSize: '1.25rem', marginBottom: 4 }}>{selectedOwner.name}</h2>
              <span className="badge badge-success" style={{ gap: 4, fontSize: 9 }}>
                <CheckCircle size={10} /> Active Syndicate Partner
              </span>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 8 }}>Primary Contact: <strong>{selectedOwner.email}</strong></p>
            </div>

             {/* Asset Shares progress */}
            <div style={{ background: 'var(--bg-tertiary)', padding: 14, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 6 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Portfolio Share holding</span>
                <span style={{ fontWeight: 600, color: 'var(--brand-color)' }}>{selectedOwner.share}%</span>
              </div>
              <div style={{ width: '100%', height: 6, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: `${selectedOwner.share}%`, height: '100%', backgroundColor: 'var(--brand-color)', borderRadius: 3 }} />
              </div>
            </div>

            {/* Contact & Address Card */}
            <div style={{ background: 'var(--bg-tertiary)', padding: 16, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <h3 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 2 }}>Contact & Address</h3>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
                <Mail size={16} style={{ color: 'var(--text-secondary)' }} />
                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{selectedOwner.email}</span>
              </div>

              {selectedOwner.phone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
                  <Phone size={16} style={{ color: 'var(--text-secondary)' }} />
                  <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{selectedOwner.phone}</span>
                </div>
              )}

              {selectedOwner.address && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13, borderTop: '1px solid var(--border-color)', paddingTop: 10 }}>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Office Address</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{selectedOwner.address}</span>
                </div>
              )}
            </div>

            {/* Equity Payout cards */}
            <div style={{ background: 'rgba(255,255,255,0.01)', padding: 16, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <span style={{ color: 'var(--text-muted)', fontSize: 10, textTransform: 'uppercase' }}>Financial Payout Logs</span>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Last Payout:</span>
                <strong style={{ color: 'var(--color-success)' }}>${selectedOwner.lastPayout.toLocaleString()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Log Date:</span>
                <span style={{ color: 'var(--text-primary)' }}>2026-05-30</span>
              </div>
            </div>

            {/* Portfolio Assets list */}
            <div>
              <h3 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Assigned Holdings</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {selectedOwner.properties.map((pName, index) => (
                  <div key={index} style={{ background: 'var(--bg-tertiary)', padding: '10px 14px', borderRadius: 6, border: '1px solid var(--border-color)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Briefcase size={14} style={{ color: 'var(--text-secondary)' }} />
                    <span style={{ fontWeight: 500 }}>{pName}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border-color)', paddingTop: 14 }}>
              <button className="btn btn-secondary" style={{ width: '100%', fontSize: 12, gap: 8 }}>
                <TrendingUp size={14} /> View Equity Performance
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
