import React, { useState } from 'react';
import { User, Phone, Mail, Calendar, Key, Plus, X, Award, FileText } from 'lucide-react';

export default function Tenants({ tenants, properties, onAddTenant }) {
  const [showModal, setShowModal] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);

  // Pagination states & calculations
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const totalPages = Math.ceil(tenants.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = tenants.slice(indexOfFirstItem, indexOfLastItem);

  const renderPaginationControls = () => {
    if (totalPages <= 1) return null;
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 24px', borderTop: '1px solid var(--border-color)', fontSize: 13, color: 'var(--text-secondary)', background: 'var(--bg-card)' }}>
        <div>
          Showing <strong>{indexOfFirstItem + 1}</strong> to <strong>{Math.min(indexOfLastItem, tenants.length)}</strong> of <strong>{tenants.length}</strong> entries
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

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [propertyId, setPropertyId] = useState('');
  const [leaseStart, setLeaseStart] = useState('');
  const [leaseEnd, setLeaseEnd] = useState('');
  const [rentStatus, setRentStatus] = useState('paid');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email || !phone || !propertyId || !leaseStart || !leaseEnd) return;

    const matchedProp = properties.find(p => p.id === propertyId);
    
    onAddTenant({
      id: `TEN-${Math.floor(100 + Math.random() * 900)}`,
      name,
      email,
      phone,
      propertyName: matchedProp ? matchedProp.name : 'Unknown Property',
      propertyId,
      leaseStart,
      leaseEnd,
      rentStatus
    });

    setName('');
    setEmail('');
    setPhone('');
    setPropertyId('');
    setLeaseStart('');
    setLeaseEnd('');
    setRentStatus('paid');
    setShowModal(false);
  };

  return (
    <div>
      <div className="view-header">
        <div>
          <h1 className="view-title">Tenants Directory</h1>
          <p className="view-subtitle">Monitor profiles, active lease contracts, contact information, and rent records.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Register Tenant
        </button>
      </div>

      {/* Split Details Layout */}
      <div className="grid-2col" style={{ gridTemplateColumns: selectedTenant ? '60% calc(40% - 24px)' : '1fr', gap: 24, transition: 'all 0.3s ease' }}>
        
        {/* Tenants List */}
        <div className="card-panel" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Tenant ID</th>
                  <th>Full Name</th>
                  <th>Contact</th>
                  <th>Assigned Property</th>
                  <th>Rent Status</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map(tenant => (
                  <tr 
                    key={tenant.id}
                    onClick={() => setSelectedTenant(tenant)}
                    style={{ 
                      cursor: 'pointer',
                      backgroundColor: selectedTenant?.id === tenant.id ? 'var(--bg-accent-alpha)' : '',
                      borderLeft: selectedTenant?.id === tenant.id ? '3px solid var(--brand-color)' : ''
                    }}
                  >
                    <td style={{ fontWeight: 600, color: 'var(--brand-color)' }}>{tenant.id}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="user-avatar" style={{ margin: 0, width: 32, height: 32, fontSize: 12 }}>
                          {tenant.name.split(' ').map(n=>n[0]).join('')}
                        </div>
                        <div style={{ fontWeight: 600 }}>{tenant.name}</div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.85rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)' }}>
                          <Mail size={12} /> {tenant.email}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 500 }}>{tenant.propertyName}</span>
                    </td>
                    <td>
                      <span className={`badge ${tenant.rentStatus === 'paid' ? 'badge-success' : tenant.rentStatus === 'pending' ? 'badge-warning' : 'badge-danger'}`}>
                        {tenant.rentStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {renderPaginationControls()}
        </div>

        {/* Selected Tenant Detail Panel */}
        {selectedTenant && (
          <div className="card-panel" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20, animation: 'fadeIn 0.2s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <User size={18} style={{ color: 'var(--brand-color)' }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--brand-color)' }}>{selectedTenant.id}</span>
              </div>
              <button 
                onClick={() => setSelectedTenant(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <div className="user-avatar" style={{ margin: '0 auto 12px', width: 64, height: 64, fontSize: 22, borderRadius: '50%' }}>
                {selectedTenant.name.split(' ').map(n=>n[0]).join('')}
              </div>
              <h2 style={{ fontSize: '1.3rem', marginBottom: 4 }}>{selectedTenant.name}</h2>
              <span className={`badge ${selectedTenant.rentStatus === 'paid' ? 'badge-success' : 'badge-warning'}`}>Account {selectedTenant.rentStatus}</span>
            </div>

            {/* Contact Details Card */}
            <div style={{ background: 'var(--bg-tertiary)', padding: 16, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <h3 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 2 }}>Contact Verification</h3>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
                  <Mail size={16} style={{ color: 'var(--text-secondary)' }} />
                  <span style={{ color: 'var(--text-primary)' }}>{selectedTenant.email}</span>
                </div>
                <a href={`mailto:${selectedTenant.email}`} className="btn btn-secondary" style={{ padding: 6, display: 'flex', borderRadius: 6, borderColor: 'rgba(255,255,255,0.1)' }} title="Send Email">
                  <Mail size={13} style={{ color: 'var(--brand-color)' }} />
                </a>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
                  <Phone size={16} style={{ color: 'var(--text-secondary)' }} />
                  <span style={{ color: 'var(--text-primary)' }}>{selectedTenant.phone}</span>
                </div>
                <a href={`tel:${selectedTenant.phone}`} className="btn btn-secondary" style={{ padding: 6, display: 'flex', borderRadius: 6, borderColor: 'rgba(255,255,255,0.1)' }} title="Call Tenant">
                  <Phone size={13} style={{ color: 'var(--brand-color)' }} />
                </a>
              </div>

              {selectedTenant.address && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13, borderTop: '1px solid var(--border-color)', paddingTop: 10 }}>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Registered Address</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{selectedTenant.address}</span>
                </div>
              )}
            </div>

            {/* Lease Metadata */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div style={{ background: 'rgba(255,255,255,0.01)', padding: 12, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontSize: 12 }}>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: 10, textTransform: 'uppercase', marginBottom: 2 }}>Lease Start</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{selectedTenant.leaseStart}</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.01)', padding: 12, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontSize: 12 }}>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: 10, textTransform: 'uppercase', marginBottom: 2 }}>Lease Expiry</span>
                <span style={{ fontWeight: 600, color: 'var(--brand-color)' }}>{selectedTenant.leaseEnd}</span>
              </div>
            </div>

            {/* Assigned Unit Space */}
            <div style={{ background: 'var(--bg-tertiary)', padding: 16, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <h3 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Assigned Lease Space</h3>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{selectedTenant.propertyName}</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Asset Space ID: <strong>{selectedTenant.propertyId}</strong></div>
            </div>

            <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border-color)', paddingTop: 14 }}>
              <button className="btn btn-secondary" style={{ width: '100%', fontSize: 12, gap: 8 }}>
                <FileText size={14} /> View Complete Lease Agreement
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Tenant Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Register New Tenant</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 20 }}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Johnathan Doe" className="form-input" required />
                </div>
                
                <div className="grid-2col" style={{ gap: 16, gridTemplateColumns: '1fr 1fr' }}>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="e.g. john@example.com" className="form-input" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. +44 7911 123456" className="form-input" required />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Assign Asset / Property Space</label>
                  <select value={propertyId} onChange={(e) => setPropertyId(e.target.value)} className="form-select" required>
                    <option value="">-- Choose space --</option>
                    {properties.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.id}) - Rent: ${p.rent}/mo</option>
                    ))}
                  </select>
                </div>

                <div className="grid-2col" style={{ gap: 16, gridTemplateColumns: '1fr 1fr' }}>
                  <div className="form-group">
                    <label className="form-label">Lease Start Date</label>
                    <input type="date" value={leaseStart} onChange={(e) => setLeaseStart(e.target.value)} className="form-input" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Lease Expiry Date</label>
                    <input type="date" value={leaseEnd} onChange={(e) => setLeaseEnd(e.target.value)} className="form-input" required />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Rent Status</label>
                  <select value={rentStatus} onChange={(e) => setRentStatus(e.target.value)} className="form-select">
                    <option value="paid">Paid</option>
                    <option value="pending">Pending Invoice</option>
                    <option value="overdue">Overdue / Default</option>
                  </select>
                </div>
              </div>
              
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add Tenant</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
