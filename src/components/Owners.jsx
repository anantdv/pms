import React, { useState, useEffect } from 'react';
import { UserCheck, ShieldCheck, Mail, Phone, Briefcase, DollarSign, X, CheckCircle, Clock } from 'lucide-react';

export default function Owners({ owners, erpnextConfig }) {
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [vendorDetails, setVendorDetails] = useState(null);

  // Pagination states & calculations
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const totalPages = Math.ceil(owners.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = owners.slice(indexOfFirstItem, indexOfLastItem);

  // Load detailed information on demand
  useEffect(() => {
    if (!selectedOwner) {
      setVendorDetails(null);
      return;
    }

    // Set fallback initial details from listing data
    setVendorDetails({
      id: selectedOwner.id,
      name: selectedOwner.name,
      supplier_type: selectedOwner.supplier_type,
      supplier_group: selectedOwner.supplier_group,
      email: selectedOwner.email,
      phone: selectedOwner.phone,
      address: selectedOwner.address || '',
      properties: selectedOwner.properties || [],
      addresses: [],
      contacts: []
    });

    if (!erpnextConfig || !erpnextConfig.url || selectedOwner.id.startsWith('OWN-')) {
      return;
    }

    const fetchDetails = async () => {
      setDetailsLoading(true);
      try {
        const idEnc = encodeURIComponent(selectedOwner.id);

        // 1. Fetch Supplier Doc
        const supPromise = fetch(`${erpnextConfig.url}/api/resource/Supplier/${idEnc}`, { credentials: 'include' })
          .then(res => res.ok ? res.json() : null)
          .catch(() => null);

        // 2. Fetch Addresses
        const addrPromise = fetch(`${erpnextConfig.url}/api/resource/Address?filters=[["Dynamic Link", "link_doctype", "=", "Supplier"], ["Dynamic Link", "link_name", "=", "${selectedOwner.id}"]]&fields=["address_line1","address_line2","city","state","country","pincode"]`, { credentials: 'include' })
          .then(res => res.ok ? res.json() : null)
          .catch(() => null);

        // 3. Fetch Contacts
        const contactPromise = fetch(`${erpnextConfig.url}/api/resource/Contact?filters=[["Dynamic Link", "link_doctype", "=", "Supplier"], ["Dynamic Link", "link_name", "=", "${selectedOwner.id}"]]&fields=["email_id","phone","first_name","last_name"]`, { credentials: 'include' })
          .then(res => res.ok ? res.json() : null)
          .catch(() => null);

        const [supJson, addrJson, contactJson] = await Promise.all([supPromise, addrPromise, contactPromise]);

        const supplierData = supJson?.data || supJson || {};
        const addressList = addrJson?.data || addrJson || [];
        const contactList = contactJson?.data || contactJson || [];

        // Compile display Address
        let addressStr = '';
        if (addressList.length > 0) {
          const addr = addressList[0];
          addressStr = [addr.address_line1, addr.address_line2, addr.city, addr.state, addr.country, addr.pincode].filter(Boolean).join(', ');
        }

        let contactPhone = selectedOwner.phone || '';
        let contactEmail = selectedOwner.email || '';
        if (contactList.length > 0) {
          contactEmail = contactList[0].email_id || contactEmail;
          contactPhone = contactList[0].phone || contactPhone;
        }

        setVendorDetails(prev => ({
          ...prev,
          supplier_type: supplierData.supplier_type || prev.supplier_type,
          supplier_group: supplierData.supplier_group || prev.supplier_group,
          address: addressStr || prev.address,
          email: contactEmail || prev.email,
          phone: contactPhone || prev.phone,
          addresses: addressList,
          contacts: contactList
        }));
      } catch (err) {
        console.warn('Failed fetching supplier details:', err);
      } finally {
        setDetailsLoading(false);
      }
    };

    fetchDetails();
  }, [selectedOwner, erpnextConfig]);

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

            {detailsLoading ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                Loading details from ERPNext Supplier...
              </div>
            ) : (
              <>
                <div>
                  <h2 style={{ fontSize: '1.25rem', marginBottom: 4 }}>{vendorDetails?.name || selectedOwner.name}</h2>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <span className="badge badge-success" style={{ gap: 4, fontSize: 9 }}>
                      <CheckCircle size={10} /> Verified Vendor
                    </span>
                    <span className="badge badge-info" style={{ fontSize: 9 }}>
                      {vendorDetails?.supplier_type || selectedOwner.supplier_type || 'Services'}
                    </span>
                  </div>
                </div>

                {/* Vendor Details */}
                <div style={{ background: 'var(--bg-tertiary)', padding: 16, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <h3 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 2 }}>Vendor Properties</h3>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Vendor Type:</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{vendorDetails?.supplier_type || selectedOwner.supplier_type || 'Services'}</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Vendor Group:</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{vendorDetails?.supplier_group || selectedOwner.supplier_group || 'Local'}</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Email:</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{vendorDetails?.email || selectedOwner.email}</strong>
                  </div>

                  {(vendorDetails?.phone || selectedOwner.phone) && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Phone:</span>
                      <strong style={{ color: 'var(--text-primary)' }}>{vendorDetails?.phone || selectedOwner.phone}</strong>
                    </div>
                  )}

                  {(vendorDetails?.address || selectedOwner.address) && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13, borderTop: '1px solid var(--border-color)', paddingTop: 10 }}>
                      <span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Primary Address</span>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{vendorDetails?.address || selectedOwner.address}</span>
                    </div>
                  )}
                </div>

                {/* Additional Addresses */}
                {vendorDetails?.addresses && vendorDetails.addresses.length > 1 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>All Linked Addresses ({vendorDetails.addresses.length})</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {vendorDetails.addresses.map((addr, idx) => (
                        <div key={idx} style={{ background: 'var(--bg-tertiary)', padding: 10, borderRadius: 6, border: '1px solid var(--border-color)', fontSize: 12, color: 'var(--text-primary)' }}>
                          {[addr.address_line1, addr.address_line2, addr.city, addr.state, addr.country, addr.pincode].filter(Boolean).join(', ')}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Linked Contacts */}
                {vendorDetails?.contacts && vendorDetails.contacts.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Linked Contacts</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {vendorDetails.contacts.map((c, idx) => (
                        <div key={idx} style={{ background: 'var(--bg-tertiary)', padding: 10, borderRadius: 6, border: '1px solid var(--border-color)', fontSize: 12, color: 'var(--text-primary)' }}>
                          <div style={{ fontWeight: 600 }}>{[c.first_name, c.last_name].filter(Boolean).join(' ') || 'Contact'}</div>
                          {c.email_id && <div style={{ color: 'var(--text-secondary)' }}>Email: {c.email_id}</div>}
                          {c.phone && <div style={{ color: 'var(--text-secondary)' }}>Phone: {c.phone}</div>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

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
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
