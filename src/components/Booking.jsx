import React, { useState, useEffect } from 'react';
import { Calendar, User, Building, DollarSign, Plus, X, Search, Filter, Loader, Eye, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function Booking({ erpnextConfig }) {
  const [bookings, setBookings] = useState([]);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [selectedBookingDetails, setSelectedBookingDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [loadingList, setLoadingList] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // Dynamic fields state from DocType metadata
  const [bookingFields, setBookingFields] = useState([]);
  const [loadingFields, setLoadingFields] = useState(false);
  
  // Search & filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [customerFilter, setCustomerFilter] = useState('');

  // New booking form modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [syncStatus, setSyncStatus] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Initial mock data if connection fails or starts empty
  const mockBookings = [
    {
      name: 'BOOK-0001',
      booking_date: '2026-06-10',
      customer: 'CUST-0001',
      customer_name: 'Biswajit Maity',
      customer_email: 'biswajit@example.com',
      customer_phone_no: '+679 999 1234',
      property: 'Suva Retail Complex - Suite 102',
      booking_type: 'Rent',
      status: 'Confirmed',
      payment_status: 'Paid',
      booking_amount: 1500.00,
      paid_amount: 1500.00,
      pending_amount: 0.00,
      starting_date: '2026-07-01',
      ending_date: '2027-06-30',
      total_days: '365',
      advance_amount: 500.00,
      payment_method: 'Bank Transfer'
    },
    {
      name: 'BOOK-0002',
      booking_date: '2026-06-11',
      customer: 'CUST-0002',
      customer_name: 'Jane Doe',
      customer_email: 'jane.doe@example.com',
      customer_phone_no: '+679 888 5678',
      property: 'Nadi Residential Villa - Unit A',
      booking_type: 'Lease',
      status: 'Pending',
      payment_status: 'Partially Paid',
      booking_amount: 2500.00,
      paid_amount: 1000.00,
      pending_amount: 1500.00,
      starting_date: '2026-08-01',
      ending_date: '2028-07-31',
      total_days: '730',
      advance_amount: 1000.00,
      payment_method: 'Credit Card'
    }
  ];

  // Fetch DocType fields metadata to construct dynamic form
  const fetchDocTypeFields = async () => {
    if (!erpnextConfig || !erpnextConfig.url) return;
    setLoadingFields(true);
    try {
      const res = await fetch(`${erpnextConfig.url}/api/resource/DocType/Booking`, {
        credentials: 'include',
      headers: {
          'Content-Type': 'application/json'
        }
      });
      if (res.ok) {
        const json = await res.json();
        const rawFields = json.data?.fields || [];
        // Filter relevant writable fields
        const filtered = rawFields.filter(f => 
          f.fieldname && 
          f.label && 
          f.fieldtype !== 'Section Break' && 
          f.fieldtype !== 'Column Break' && 
          f.fieldtype !== 'Table' &&
          f.fieldtype !== 'Heading' &&
          !f.read_only &&
          f.fieldname !== 'amended_from' &&
          f.fieldname !== 'workflow_state'
        );
        setBookingFields(filtered);
        
        // Initialize default form data
        const defaults = {};
        filtered.forEach(f => {
          defaults[f.fieldname] = f.default || '';
        });
        setFormData(defaults);
      }
    } catch (err) {
      console.warn('Failed to fetch Booking DocType fields:', err);
    } finally {
      setLoadingFields(false);
    }
  };

  // Fetch bookings list using custom API, falling back to resource endpoint or mock data
  const fetchBookings = async (cust = '') => {
    setLoadingList(true);
    setErrorMsg('');
    try {
      let dataList = [];
      if (erpnextConfig && erpnextConfig.url) {
        // Build url based on filter
        const apiPath = cust 
          ? `/api/method/erpnext.api.booking.get_bookings?customer=${encodeURIComponent(cust)}` 
          : `/api/method/erpnext.api.booking.get_bookings`;

        setSyncStatus('Fetching from ERPNext custom API...');
        try {
          const res = await fetch(`${erpnextConfig.url}${apiPath}`, {
            credentials: 'include',
      headers: {
              'Content-Type': 'application/json'
            }
          });
          if (res.ok) {
            const json = await res.json();
            dataList = json.message || json.data || [];
          } else {
            throw new Error('Method not found or error response');
          }
        } catch (methodErr) {
          console.warn('Custom API method failed, trying standard resource API...', methodErr);
          setSyncStatus('Syncing via ERPNext REST Resource API...');
          
          // Standard resource fallback
          let resourceUrl = `${erpnextConfig.url}/api/resource/Booking?fields=["name","booking_date","customer","customer_name","booking_type","status","payment_status","booking_amount","paid_amount","pending_amount","starting_date","ending_date","property"]&limit_page_length=200`;
          if (cust) {
            resourceUrl += `&filters=[["Booking","customer","=","${cust}"]]`;
          }
          const res = await fetch(resourceUrl, {
            credentials: 'include',
      headers: {
              'Content-Type': 'application/json'
            }
          });
          if (res.ok) {
            const json = await res.json();
            dataList = json.data || [];
          } else {
            throw new Error('Standard resource API request failed');
          }
        }
      }

      if (Array.isArray(dataList) && dataList.length > 0) {
        setBookings(dataList);
        setSyncStatus('Synchronized');
      } else {
        setBookings(mockBookings);
        setSyncStatus('Offline Mode (Showing Mocks)');
      }
    } catch (err) {
      console.warn('Booking fetch failed, falling back to mock data:', err);
      setBookings(mockBookings);
      setSyncStatus('Offline Mode (Showing Mocks)');
    } finally {
      setLoadingList(false);
    }
  };

  // Fetch detailed booking record
  const fetchBookingDetails = async (id) => {
    setLoadingDetails(true);
    setSelectedBookingDetails(null);
    try {
      let details = null;
      if (erpnextConfig && erpnextConfig.url) {
        try {
          // Attempt custom method 1: get_booking_details
          const res = await fetch(`${erpnextConfig.url}/api/method/erpnext.api.booking.get_booking_details?booking_id=${id}`, {
            credentials: 'include',
      headers: {
              'Content-Type': 'application/json'
            }
          });
          if (res.ok) {
            const json = await res.json();
            details = json.message || json.data;
          } else {
            // Attempt custom method 2: get_booking
            const res2 = await fetch(`${erpnextConfig.url}/api/method/erpnext.api.booking.get_booking?booking_id=${id}`, {
              credentials: 'include',
      headers: {
                'Content-Type': 'application/json'
              }
            });
            if (res2.ok) {
              const json2 = await res2.json();
              details = json2.message || json2.data;
            } else {
              throw new Error('Details methods failed');
            }
          }
        } catch (detailErr) {
          console.warn('Custom details APIs failed, loading via resource detail...', detailErr);
          // Standard resource detail fallback
          const res = await fetch(`${erpnextConfig.url}/api/resource/Booking/${id}`, {
            credentials: 'include',
      headers: {
              'Content-Type': 'application/json'
            }
          });
          if (res.ok) {
            const json = await res.json();
            details = json.data;
          }
        }
      }

      if (details) {
        setSelectedBookingDetails(details);
      } else {
        // Mock detail fallback
        const mockDetail = bookings.find(b => b.name === id || b.id === id);
        setSelectedBookingDetails(mockDetail || null);
      }
    } catch (err) {
      console.warn('Failed to load booking details:', err);
      const mockDetail = bookings.find(b => b.name === id || b.id === id);
      setSelectedBookingDetails(mockDetail || null);
    } finally {
      setLoadingDetails(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    fetchDocTypeFields();
  }, [erpnextConfig]);

  // Handle Form Input Changes
  const handleInputChange = (fieldname, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldname]: value
    }));
  };

  // Submit new booking
  const handleCreateBooking = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setSubmitting(true);

    // Validate mandatory fields
    const missing = bookingFields.filter(f => f.reqd && !formData[f.fieldname]);
    if (missing.length > 0) {
      setErrorMsg(`Required fields missing: ${missing.map(f => f.label).join(', ')}`);
      setSubmitting(false);
      return;
    }

    try {
      let savedDoc = null;
      if (erpnextConfig && erpnextConfig.url) {
        // Try custom API first
        try {
          const res = await fetch(`${erpnextConfig.url}/api/method/erpnext.api.booking.create_booking`, {
            method: 'POST',
            credentials: 'include',
      headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
          });
          if (res.ok) {
            const json = await res.json();
            savedDoc = json.message || json.data;
          } else {
            throw new Error('Custom creation method failed');
          }
        } catch (createErr) {
          console.warn('Custom create method failed, posting to resource Booking API...', createErr);
          // Standard resource fallback
          const res = await fetch(`${erpnextConfig.url}/api/resource/Booking`, {
            method: 'POST',
            credentials: 'include',
      headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
          });
          if (res.ok) {
            const json = await res.json();
            savedDoc = json.data;
          } else {
            let errorDetail = 'Failed to create booking document on ERPNext';
            try {
              const errJson = await res.json();
              if (errJson._server_messages) {
                const messages = JSON.parse(errJson._server_messages);
                errorDetail = messages.map(m => {
                  try {
                    const parsed = JSON.parse(m);
                    return parsed.message || parsed;
                  } catch {
                    return String(m);
                  }
                }).join(', ');
              }
            } catch {}
            throw new Error(errorDetail);
          }
        }
      }

      if (savedDoc) {
        setSuccessMsg(`Booking ${savedDoc.name || 'created'} synced successfully with ERPNext!`);
        fetchBookings();
        setShowAddModal(false);
      } else {
        // Mock save if not connected to ERPNext
        const generatedId = `BOOK-${Math.floor(1000 + Math.random() * 9000)}`;
        const localDoc = {
          name: generatedId,
          ...formData,
          booking_date: formData.booking_date || new Date().toISOString().split('T')[0],
          status: formData.status || 'Pending',
          payment_status: formData.payment_status || 'Unpaid'
        };
        setBookings([localDoc, ...bookings]);
        setSuccessMsg('Booking saved locally (Offline mode)');
        setShowAddModal(false);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error creating booking document.');
    } finally {
      setSubmitting(false);
    }
  };

  // Quick Customer Filter trigger
  const handleCustomerFilterSubmit = (e) => {
    e.preventDefault();
    fetchBookings(customerFilter);
  };

  // Filtering on local state
  const filteredBookings = bookings.filter(b => {
    const term = searchTerm.toLowerCase();
    const matchSearch = 
      (b.name && b.name.toLowerCase().includes(term)) ||
      (b.customer && b.customer.toLowerCase().includes(term)) ||
      (b.customer_name && b.customer_name.toLowerCase().includes(term)) ||
      (b.property && b.property.toLowerCase().includes(term));
      
    const matchStatus = statusFilter === 'All' || b.status === statusFilter || b.payment_status === statusFilter;
    const matchType = typeFilter === 'All' || b.booking_type === typeFilter;

    return matchSearch && matchStatus && matchType;
  });

  // Pagination slice
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredBookings.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div style={{ padding: '4px 0' }}>
      {/* Header section */}
      <div className="view-header" style={{ marginBottom: 20 }}>
        <div>
          <h1 className="view-title">Property Bookings</h1>
          <p className="view-subtitle">Manage lease/rent reservations, track customer deposits, and view contract workflows.</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button 
            className="btn btn-secondary" 
            onClick={() => fetchBookings()} 
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <RefreshCw size={14} className={loadingList ? 'spin' : ''} />
            Reload
          </button>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={16} /> New Booking
          </button>
        </div>
      </div>

      {/* Sync Status Banner */}
      {syncStatus && syncStatus !== 'Synchronized' && (
        <div style={{ 
          background: 'var(--bg-accent-alpha)', 
          border: '1px solid var(--border-color)', 
          borderRadius: 8, 
          padding: '8px 16px', 
          marginBottom: 16, 
          fontSize: 12, 
          color: 'var(--text-secondary)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: syncStatus.includes('Offline') ? 'var(--color-warning)' : 'var(--color-success)' }} />
            <span>Connection Status: <strong>{syncStatus}</strong></span>
          </div>
          {successMsg && <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>{successMsg}</span>}
        </div>
      )}

      {/* Control panel filters */}
      <div className="card-panel" style={{ padding: 16, marginBottom: 20, display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search by ID, customer name, unit..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-control"
            style={{ paddingLeft: 34, fontSize: 13 }}
          />
        </div>
        
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Filter size={14} style={{ color: 'var(--text-muted)' }} />
          
          <select 
            value={typeFilter} 
            onChange={(e) => setTypeFilter(e.target.value)}
            className="form-control" 
            style={{ width: 120, fontSize: 13, padding: '4px 8px' }}
          >
            <option value="All">All Types</option>
            <option value="Rent">Rent</option>
            <option value="Sale">Sale</option>
            <option value="Lease">Lease</option>
          </select>

          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="form-control" 
            style={{ width: 140, fontSize: 13, padding: '4px 8px' }}
          >
            <option value="All">All Statuses</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Pending">Pending</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Paid">Payment: Paid</option>
            <option value="Partially Paid">Payment: Partial</option>
            <option value="Unpaid">Payment: Unpaid</option>
          </select>
        </div>

        {/* Customer Sync API Filter Form */}
        <form onSubmit={handleCustomerFilterSubmit} style={{ display: 'flex', gap: 6, alignItems: 'center', borderLeft: '1px solid var(--border-color)', paddingLeft: 14 }}>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>Filter Customer ID:</span>
          <input 
            type="text" 
            placeholder="e.g. CUST-0001" 
            value={customerFilter} 
            onChange={(e) => setCustomerFilter(e.target.value)}
            className="form-control"
            style={{ width: 120, padding: '4px 8px', fontSize: 12 }}
          />
          <button type="submit" className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: 12 }}>Search</button>
        </form>
      </div>

      {/* Grid view containing list & inspector */}
      <div className="grid-2col" style={{ gridTemplateColumns: selectedBookingId ? '60% calc(40% - 24px)' : '1fr', gap: 24, transition: 'all 0.3s ease' }}>
        
        {/* Booking Table Card */}
        <div className="card-panel" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Booking Date</th>
                  <th>Customer Info</th>
                  <th>Property Unit</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Amount</th>
                  <th>Payment Status</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map(b => (
                  <tr 
                    key={b.name || b.id}
                    onClick={() => {
                      setSelectedBookingId(b.name || b.id);
                      fetchBookingDetails(b.name || b.id);
                    }}
                    style={{ 
                      cursor: 'pointer',
                      backgroundColor: selectedBookingId === (b.name || b.id) ? 'var(--bg-accent-alpha)' : '',
                      borderLeft: selectedBookingId === (b.name || b.id) ? '3px solid var(--brand-color)' : ''
                    }}
                  >
                    <td style={{ fontWeight: 600, color: 'var(--brand-color)' }}>{b.name || b.id}</td>
                    <td>{b.booking_date}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{b.customer_name || b.customer}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{b.customer_email || 'No email'}</div>
                    </td>
                    <td style={{ fontSize: 12, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {b.property || 'Not specified'}
                    </td>
                    <td>
                      <span className={`badge ${b.booking_type === 'Sale' ? 'badge-info' : b.booking_type === 'Lease' ? 'badge-primary' : 'badge-secondary'}`}>
                        {b.booking_type || 'Rent'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${b.status === 'Confirmed' ? 'badge-success' : b.status === 'Cancelled' ? 'badge-danger' : b.status === 'Pending'}`}>
                        {b.status || 'Pending'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>
                      ${parseFloat(b.booking_amount || b.amount_to_pay || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td>
                      <span className={`badge ${b.payment_status === 'Paid' ? 'badge-success' : b.payment_status === 'Partially Paid' ? 'badge-warning' : 'badge-danger'}`}>
                        {b.payment_status || 'Unpaid'}
                      </span>
                    </td>
                  </tr>
                ))}

                {filteredBookings.length === 0 && (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                      {loadingList ? 'Syncing with ERPNext Booking server...' : 'No booking records found.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination controls */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 24px', borderTop: '1px solid var(--border-color)', fontSize: 13, color: 'var(--text-secondary)' }}>
              <div>
                Showing <strong>{indexOfFirstItem + 1}</strong> to <strong>{Math.min(indexOfLastItem, filteredBookings.length)}</strong> of <strong>{filteredBookings.length}</strong> bookings
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  className="btn btn-secondary"
                  style={{ padding: '4px 10px', fontSize: 12 }}
                >
                  Prev
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`btn ${currentPage === i + 1 ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '4px 10px', fontSize: 12 }}
                  >
                    {i + 1}
                  </button>
                ))}
                <button 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                  className="btn btn-secondary"
                  style={{ padding: '4px 10px', fontSize: 12 }}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Detailed Inspector Side Panel */}
        {selectedBookingId && (
          <div className="card-panel" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--brand-color)' }}>{selectedBookingId} Details</span>
              <button onClick={() => setSelectedBookingId(null)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 16 }}>×</button>
            </div>

            {loadingDetails ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                <Loader size={24} className="spin" style={{ margin: '0 auto 10px auto' }} />
                <span>Loading details from ERPNext...</span>
              </div>
            ) : selectedBookingDetails ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                
                {/* Visual Header */}
                <div style={{ background: 'var(--bg-tertiary)', padding: 16, borderRadius: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <Calendar size={18} style={{ color: 'var(--brand-color)' }} />
                    <strong style={{ fontSize: 15, color: 'var(--text-primary)' }}>{selectedBookingDetails.property || 'Property Unit'}</strong>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    Type: <strong style={{ color: 'var(--text-secondary)' }}>{selectedBookingDetails.booking_type}</strong> | Status: <strong style={{ color: 'var(--color-success)' }}>{selectedBookingDetails.status}</strong>
                  </div>
                </div>

                {/* Details list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--bg-tertiary)', paddingBottom: 6 }}>
                    <span style={{ color: 'var(--text-muted)' }}>Booking Date:</span>
                    <strong style={{ color: 'var(--text-secondary)' }}>{selectedBookingDetails.booking_date}</strong>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--bg-tertiary)', paddingBottom: 6 }}>
                    <span style={{ color: 'var(--text-muted)' }}>Customer ID:</span>
                    <strong style={{ color: 'var(--text-secondary)' }}>{selectedBookingDetails.customer}</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--bg-tertiary)', paddingBottom: 6 }}>
                    <span style={{ color: 'var(--text-muted)' }}>Customer Name:</span>
                    <strong style={{ color: 'var(--text-secondary)' }}>{selectedBookingDetails.customer_name}</strong>
                  </div>

                  {selectedBookingDetails.customer_email && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--bg-tertiary)', paddingBottom: 6 }}>
                      <span style={{ color: 'var(--text-muted)' }}>Customer Email:</span>
                      <strong style={{ color: 'var(--text-secondary)' }}>{selectedBookingDetails.customer_email}</strong>
                    </div>
                  )}

                  {selectedBookingDetails.customer_phone_no && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--bg-tertiary)', paddingBottom: 6 }}>
                      <span style={{ color: 'var(--text-muted)' }}>Phone Number:</span>
                      <strong style={{ color: 'var(--text-secondary)' }}>{selectedBookingDetails.customer_phone_no}</strong>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--bg-tertiary)', paddingBottom: 6 }}>
                    <span style={{ color: 'var(--text-muted)' }}>Start Date:</span>
                    <strong style={{ color: 'var(--text-secondary)' }}>{selectedBookingDetails.starting_date || selectedBookingDetails.start_date || 'N/A'}</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--bg-tertiary)', paddingBottom: 6 }}>
                    <span style={{ color: 'var(--text-muted)' }}>End Date:</span>
                    <strong style={{ color: 'var(--text-secondary)' }}>{selectedBookingDetails.ending_date || selectedBookingDetails.end_date || 'N/A'}</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--bg-tertiary)', paddingBottom: 6 }}>
                    <span style={{ color: 'var(--text-muted)' }}>Total Days:</span>
                    <strong style={{ color: 'var(--text-secondary)' }}>{selectedBookingDetails.total_days || 'N/A'}</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--bg-tertiary)', paddingBottom: 6 }}>
                    <span style={{ color: 'var(--text-muted)' }}>Billing Cycle Date:</span>
                    <strong style={{ color: 'var(--text-secondary)' }}>{selectedBookingDetails.billing_cycle || 'Monthly'}</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--bg-tertiary)', paddingBottom: 6 }}>
                    <span style={{ color: 'var(--text-muted)' }}>Payment Method:</span>
                    <strong style={{ color: 'var(--text-secondary)' }}>{selectedBookingDetails.payment_method || 'N/A'}</strong>
                  </div>
                </div>

                {/* Account Balances Section */}
                <div style={{ background: 'var(--bg-tertiary)', padding: 14, borderRadius: 8, marginTop: 4 }}>
                  <h4 style={{ fontSize: 12, margin: '0 0 10px 0', borderBottom: '1px solid var(--border-color)', paddingBottom: 4, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Ledger summary</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 11 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Total Booking Amt:</span>
                      <strong style={{ color: 'var(--text-primary)' }}>${parseFloat(selectedBookingDetails.booking_amount || selectedBookingDetails.amount_to_pay || 0).toFixed(2)}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Deposit Received:</span>
                      <strong style={{ color: 'var(--text-primary)' }}>${parseFloat(selectedBookingDetails.advance_amount || 0).toFixed(2)}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Paid Amount:</span>
                      <strong style={{ color: 'var(--color-success)' }}>${parseFloat(selectedBookingDetails.paid_amount || 0).toFixed(2)}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: 6, marginTop: 4 }}>
                      <span style={{ color: 'var(--text-secondary)', fontWeight: 'bold' }}>Pending Balance:</span>
                      <strong style={{ color: 'var(--color-danger)', fontWeight: 'bold' }}>${parseFloat(selectedBookingDetails.pending_amount || 0).toFixed(2)}</strong>
                    </div>
                  </div>
                </div>

                {/* Workflow / System notes */}
                {selectedBookingDetails.workflow_state && (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', background: 'rgba(59, 130, 246, 0.1)', padding: 10, borderRadius: 6, fontSize: 11, color: '#60a5fa' }}>
                    <CheckCircle2 size={14} />
                    <span>Current Document State: <strong>{selectedBookingDetails.workflow_state}</strong></span>
                  </div>
                )}

              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                <span>No details available for this record.</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Dynamic Creation Modal Form */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 560 }}>
            
            {/* Modal Header */}
            <div className="modal-header">
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>Register New Booking</h3>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '2px 0 0 0' }}>Form layout generated dynamically from ERPNext schema metadata.</p>
              </div>
              <button 
                type="button" 
                onClick={() => setShowAddModal(false)} 
                style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 20 }}
                disabled={submitting}
              >
                ×
              </button>
            </div>

            {/* Modal Body / Dynamic Fields */}
            <form onSubmit={handleCreateBooking}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                
                {errorMsg && (
                  <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--color-danger)', borderRadius: 6, padding: '10px 14px', color: 'var(--color-danger)', fontSize: 12 }}>
                    {errorMsg}
                  </div>
                )}

                {loadingFields ? (
                  <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)' }}>
                    <Loader size={20} className="spin" style={{ margin: '0 auto 8px auto' }} />
                    <span>Querying ERPNext DocType fields schema...</span>
                  </div>
                ) : (
                  bookingFields.map(field => {
                    const isRequired = !!field.reqd;
                    const val = formData[field.fieldname] || '';
                    
                    return (
                      <div key={field.fieldname} className="form-group">
                        <label className="form-label">
                          {field.label} {isRequired && <span style={{ color: 'var(--color-danger)' }}>*</span>}
                        </label>

                        {field.fieldtype === 'Select' ? (
                          <select
                            value={val}
                            onChange={(e) => handleInputChange(field.fieldname, e.target.value)}
                            required={isRequired}
                            className="form-select"
                            disabled={submitting}
                          >
                            <option value="">-- Choose Option --</option>
                            {(field.options || '').split('\n').filter(Boolean).map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        ) : field.fieldtype === 'Date' ? (
                          <input
                            type="date"
                            value={val}
                            onChange={(e) => handleInputChange(field.fieldname, e.target.value)}
                            required={isRequired}
                            className="form-input"
                            disabled={submitting}
                          />
                        ) : field.fieldtype === 'Datetime' ? (
                          <input
                            type="datetime-local"
                            value={val}
                            onChange={(e) => handleInputChange(field.fieldname, e.target.value)}
                            required={isRequired}
                            className="form-input"
                            disabled={submitting}
                          />
                        ) : field.fieldtype === 'Small Text' || field.fieldtype === 'Text' ? (
                          <textarea
                            value={val}
                            onChange={(e) => handleInputChange(field.fieldname, e.target.value)}
                            required={isRequired}
                            className="form-textarea"
                            rows={3}
                            disabled={submitting}
                            style={{ resize: 'vertical' }}
                          />
                        ) : field.fieldtype === 'Currency' || field.fieldtype === 'Float' || field.fieldtype === 'Int' ? (
                          <input
                            type="number"
                            step="any"
                            value={val}
                            onChange={(e) => handleInputChange(field.fieldname, e.target.value)}
                            required={isRequired}
                            className="form-input"
                            disabled={submitting}
                          />
                        ) : (
                          <input
                            type="text"
                            value={val}
                            onChange={(e) => handleInputChange(field.fieldname, e.target.value)}
                            required={isRequired}
                            className="form-input"
                            disabled={submitting}
                            placeholder={`Enter ${field.label.toLowerCase()}`}
                          />
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Modal Footer */}
              <div className="modal-footer">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)} 
                  className="btn btn-secondary" 
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  disabled={submitting}
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  {submitting ? (
                    <>
                      <Loader size={14} className="spin" />
                      Syncing...
                    </>
                  ) : (
                    'Submit to ERPNext'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
