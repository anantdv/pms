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
          <h1 className="view-title">Property Owner</h1>
          <p className="view-subtitle">Manage properties owners, estate syndicates, suppliers, and service providers.</p>
        </div>
      </div>

      {/* Split Details Layout */}
      <div className="grid-2col" style={{ gridTemplateColumns: selectedOwner ? '60% calc(40% - 24px)' : '1fr', gap: 24, transition: 'all 0.3s ease' }}>
        
        {/* Vendors/Suppliers List */}
        <div className="card-panel" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Vendor ID</th>
                  <th>Vendor Name</th>
                  <th>Type</th>
                  <th>Group</th>
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
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{owner.email}</div>
                    </td>
                    <td>
                      <span className="badge badge-secondary" style={{ textTransform: 'none' }}>
                        {owner.supplier_type || 'Services'}
                      </span>
                    </td>
                    <td>{owner.supplier_group || 'Local'}</td>
                  </tr>
                ))}
                {currentItems.length === 0 && (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                      No vendors found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {renderPaginationControls()}
        </div>

        {/* Selected Vendor Detail Panel */}
        {selectedOwner && (
          <div className="card-panel" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20, animation: 'fadeIn 0.2s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShieldCheck size={18} style={{ color: 'var(--brand-color)' }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--brand-color)' }}>{selectedOwner.id} Details</span>
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
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <span className="badge badge-success" style={{ gap: 4, fontSize: 9 }}>
                  <CheckCircle size={10} /> Verified Vendor
                </span>
                <span className="badge badge-info" style={{ fontSize: 9 }}>
                  {selectedOwner.supplier_type || 'Services'}
                </span>
              </div>
            </div>

            {/* Vendor Details */}
            <div style={{ background: 'var(--bg-tertiary)', padding: 16, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <h3 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 2 }}>Vendor Properties</h3>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Vendor Type:</span>
                <strong style={{ color: 'var(--text-primary)' }}>{selectedOwner.supplier_type || 'Services'}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Vendor Group:</span>
                <strong style={{ color: 'var(--text-primary)' }}>{selectedOwner.supplier_group || 'Local'}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Email:</span>
                <strong style={{ color: 'var(--text-primary)' }}>{selectedOwner.email}</strong>
              </div>

              {selectedOwner.phone && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Phone:</span>
                  <strong style={{ color: 'var(--text-primary)' }}>{selectedOwner.phone}</strong>
                </div>
              )}

              {selectedOwner.address && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13, borderTop: '1px solid var(--border-color)', paddingTop: 10 }}>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Vendor Address</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{selectedOwner.address}</span>
                </div>
              )}
            </div>

            {/* Portfolio Assets list if available */}
            {selectedOwner.properties && selectedOwner.properties.length > 0 && (
              <div>
                <h3 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Assigned Holdings/Contracts</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {selectedOwner.properties.map((pName, index) => (
                    <div key={index} style={{ background: 'var(--bg-tertiary)', padding: '10px 14px', borderRadius: 6, border: '1px solid var(--border-color)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Briefcase size={14} style={{ color: 'var(--text-secondary)' }} />
                      <span style={{ fontWeight: 500 }}>{pName}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
