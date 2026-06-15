import React, { useState, useEffect } from 'react';
import { DollarSign, Printer, ArrowDownRight, ArrowUpRight, Plus, X, FileText, CheckCircle2, Calculator, Landmark } from 'lucide-react';

const numberToWords = (num) => {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  if (num === 0) return 'Zero';
  
  const convertLessThanThousand = (n) => {
    if (n < 20) return ones[n];
    const tempTen = Math.floor(n / 10);
    const tempOne = n % 10;
    return tens[tempTen] + (tempOne ? ' ' + ones[tempOne] : '');
  };

  const convert = (n) => {
    if (n >= 1000) {
      return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + convert(n % 1000) : '');
    }
    if (n >= 100) {
      return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' and ' + convertLessThanThousand(n % 100) : '');
    }
    return convertLessThanThousand(n);
  };

  return convert(num) + ' Dollars Only';
};

export default function Invoices({ invoices, accounts = [], glEntries = [], onAddInvoice, onRecordPayment, erpnextConfig }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showGLModal, setShowGLModal] = useState(false); // General Ledger & Trial Balance modal
  const [selectedInvoice, setSelectedInvoice] = useState(invoices[0] || null); // Default select first invoice
  const [showTerms, setShowTerms] = useState(false);
  const [companyDetails, setCompanyDetails] = useState({
    name: 'CARPENTERS PROPERTIES PTE LTD',
    address: '123 Cecil Street, #08-01, Singapore 069537',
    phone: '+65 6123 4567',
    email: 'info@carpentersproperties.com',
    website: 'www.carpentersproperties.com',
    currency: 'SGD'
  });
  const [invoiceDetailsExtra, setInvoiceDetailsExtra] = useState(null);
  const [loadingExtra, setLoadingExtra] = useState(false);
  
  // Form states
  const [tenantName, setTenantName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [propertyId, setPropertyId] = useState('');
  const [activeReceipt, setActiveReceipt] = useState(null);

  // Fetch Company details from ERPNext
  useEffect(() => {
    if (!erpnextConfig || !erpnextConfig.url) return;
    const fetchCompany = async () => {
      try {
        const res = await fetch(`${erpnextConfig.url}/api/resource/Company/CARPENTERS PROPERTIES PTE LIMITED`, {
          credentials: 'include',
      headers: {
            'Content-Type': 'application/json'
          }
        });
        if (res.ok) {
          const json = await res.json();
          const doc = json.data || json;
          setCompanyDetails(prev => ({
            ...prev,
            name: doc.name || prev.name,
            currency: doc.default_currency || prev.currency,
          }));

          // Try fetching linked Address
          const addrRes = await fetch(`${erpnextConfig.url}/api/resource/Address?filters=[["Dynamic Link", "link_doctype", "=", "Company"], ["Dynamic Link", "link_name", "=", "${doc.name}"]]&fields=["address_line1","address_line2","city","state","country","pincode","phone","email_id"]`, {
            credentials: 'include',
      headers: {
              'Content-Type': 'application/json'
            }
          });
          if (addrRes.ok) {
            const addrJson = await addrRes.json();
            const addrList = addrJson.data || [];
            if (addrList.length > 0) {
              const addr = addrList[0];
              const addrParts = [addr.address_line1, addr.address_line2, addr.city, addr.state, addr.country, addr.pincode].filter(Boolean);
              setCompanyDetails(prev => ({
                ...prev,
                address: addrParts.join(', ') || prev.address,
                phone: addr.phone || prev.phone,
                email: addr.email_id || prev.email
              }));
            }
          }
        }
      } catch (err) {
        console.warn('Failed fetching company details:', err);
      }
    };
    fetchCompany();
  }, [erpnextConfig]);

  // Fetch Sales Invoice detail & Unit details & Customer details dynamically
  useEffect(() => {
    const targetInvoice = activeReceipt || selectedInvoice;
    if (!targetInvoice || !erpnextConfig || !erpnextConfig.url) {
      setInvoiceDetailsExtra(null);
      return;
    }
    
    let isMounted = true;
    const fetchExtra = async () => {
      setLoadingExtra(true);
      try {
        const res = await fetch(`${erpnextConfig.url}/api/resource/Sales%20Invoice/${targetInvoice.id}`, {
          credentials: 'include',
      headers: {
            'Content-Type': 'application/json'
          }
        });
        if (res.ok && isMounted) {
          const json = await res.json();
          const doc = json.data || json;
          const itemCode = (doc.items && doc.items.length > 0) ? doc.items[0].item_code : null;
          
          let unitAddressStr = '10 Anson Road, #15-02, International Plaza, Singapore 079903';
          let unitNameStr = targetInvoice.propertyId || 'Unit-N/A';
          let customerAddressStr = '10 Anson Road, #15-02, International Plaza, Singapore 079903';

          // 1. Fetch Customer address
          const customerId = doc.customer || targetInvoice.tenantName;
          if (customerId) {
            try {
              const custRes = await fetch(`${erpnextConfig.url}/api/resource/Address?filters=[["Dynamic Link", "link_doctype", "=", "Customer"], ["Dynamic Link", "link_name", "=", "${customerId}"]]&fields=["address_line1","address_line2","city","state","country","pincode"]`, {
                credentials: 'include',
      headers: {
                  'Content-Type': 'application/json'
                }
              });
              if (custRes.ok) {
                const custData = await custRes.json();
                const custAddrs = custData.data || [];
                if (custAddrs.length > 0) {
                  const addr = custAddrs[0];
                  customerAddressStr = [addr.address_line1, addr.address_line2, addr.city, addr.state, addr.country, addr.pincode].filter(Boolean).join(', ');
                }
              }
            } catch (err) {
              console.warn('Failed fetching customer address:', err);
            }
          }

          // 2. Fetch Unit details from unit doctype
          if (itemCode) {
            try {
              const uRes = await fetch(`${erpnextConfig.url}/api/method/erpnext.api.get_unit?item_code=${encodeURIComponent(itemCode)}`, {
                credentials: 'include',
      headers: {
                  'Content-Type': 'application/json'
                }
              });
              if (uRes.ok) {
                const uData = await uRes.json();
                const uDoc = uData.message || uData;
                unitNameStr = uDoc.item_name || itemCode;
                const addrParts = [uDoc.custom_locality, uDoc.custom_district, uDoc.custom_country].filter(Boolean);
                unitAddressStr = addrParts.join(', ') || unitAddressStr;
              }
            } catch (err) {
              console.warn('Failed fetching unit spec address:', err);
            }
          }

          if (isMounted) {
            setInvoiceDetailsExtra({
              unitName: unitNameStr,
              unitAddress: unitAddressStr,
              customerAddress: customerAddressStr,
              currency: doc.currency || 'SGD',
              billingItems: doc.items || []
            });
          }
        }
      } catch (err) {
        console.warn('Failed fetching invoice extra details:', err);
      } finally {
        if (isMounted) setLoadingExtra(false);
      }
    };
    fetchExtra();
    return () => {
      isMounted = false;
    };
  }, [selectedInvoice, activeReceipt, erpnextConfig]);

  // Pagination states & calculations
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const totalPages = Math.ceil(invoices.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = invoices.slice(indexOfFirstItem, indexOfLastItem);

  const renderPaginationControls = () => {
    if (totalPages <= 1) return null;
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 24px', borderTop: '1px solid var(--border-color)', fontSize: 13, color: 'var(--text-secondary)', background: 'var(--bg-card)' }}>
        <div>
          Showing <strong>{indexOfFirstItem + 1}</strong> to <strong>{Math.min(indexOfLastItem, invoices.length)}</strong> of <strong>{invoices.length}</strong> entries
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!tenantName || !amount || !dueDate || !propertyId) return;

    const newInv = {
      id: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
      tenantName,
      propertyId,
      amount: Number(amount),
      dueDate,
      status: 'pending',
      issuedDate: new Date().toISOString().split('T')[0]
    };

    onAddInvoice(newInv);
    setSelectedInvoice(newInv);

    setTenantName('');
    setAmount('');
    setDueDate('');
    setPropertyId('');
    setShowAddModal(false);
  };

  const handlePrint = (invoice) => {
    setActiveReceipt(invoice);
  };

  // GL and Trial Balance Calculation from existing invoices
  const totalInvoicesValue = invoices.reduce((acc, i) => acc + i.amount, 0);
  const totalPaid = invoices.filter(i => i.status === 'paid').reduce((acc, i) => acc + i.amount, 0);
  const totalPending = invoices.filter(i => i.status === 'pending').reduce((acc, i) => acc + i.amount, 0);

  return (
    <div>
      <div className="view-header">
        <div>
          <h1 className="view-title">Billing Ledger & Invoicing</h1>
          <p className="view-subtitle">Generate rent invoices and record payments.</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={() => setShowGLModal(true)}>
            <Calculator size={16} /> GL & TB Ledger View
          </button>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={16} /> Generate Invoice
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <span>Outstanding Receivables</span>
            <ArrowDownRight size={18} className="indicator-down" />
          </div>
          <div className="stat-value">${totalPending.toLocaleString()}</div>
          <div className="stat-indicator indicator-down">{invoices.filter(i => i.status === 'pending').length} Unpaid Invoices</div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <span>Total Collected (MDT)</span>
            <ArrowUpRight size={18} className="indicator-up" />
          </div>
          <div className="stat-value">${totalPaid.toLocaleString()}</div>
          <div className="stat-indicator indicator-up">+12% vs last month</div>
        </div>
      </div>

      {/* Split Details Layout */}
      <div className="grid-2col" style={{ gridTemplateColumns: selectedInvoice ? '55% calc(45% - 24px)' : '1fr', gap: 24, transition: 'all 0.3s ease' }}>
        
        {/* Invoices List */}
        <div className="card-panel" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Invoice ID</th>
                  <th>Tenant</th>
                  <th>Unit Name</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map(inv => (
                  <tr 
                    key={inv.id}
                    onClick={() => setSelectedInvoice(inv)}
                    style={{ 
                      cursor: 'pointer',
                      backgroundColor: selectedInvoice?.id === inv.id ? 'var(--bg-accent-alpha)' : '',
                      borderLeft: selectedInvoice?.id === inv.id ? '3px solid var(--brand-color)' : ''
                    }}
                  >
                    <td style={{ fontWeight: 600, color: 'var(--brand-color)' }}>{inv.id}</td>
                    <td style={{ fontWeight: 600 }}>{inv.tenantName}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>
                      {selectedInvoice?.id === inv.id && invoiceDetailsExtra?.unitName 
                        ? invoiceDetailsExtra.unitName 
                        : (inv.propertyId || 'Unit-N/A')}
                    </td>
                    <td style={{ fontWeight: 600 }}>${inv.amount.toLocaleString()}</td>
                    <td>
                      <span className={`badge ${inv.status === 'paid' ? 'badge-success' : 'badge-warning'}`}>
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {renderPaginationControls()}
        </div>

        {/* Selected Invoice PRINT FORMAT Panel (at right side) */}
        {selectedInvoice && (
          <div className="card-panel" style={{ padding: 24, background: '#ffffff', color: '#111827', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: 16, animation: 'fadeIn 0.2s ease-out', position: 'relative' }}>
            
            {/* Close details button */}
            <button 
              onClick={() => setSelectedInvoice(null)}
              style={{ position: 'absolute', top: 12, right: 12, background: '#f3f4f6', border: 'none', borderRadius: '50%', color: '#374151', cursor: 'pointer', width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              ×
            </button>
            {/* TOP HEADER SECTION */}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e5e7eb', paddingBottom: 14 }}>
              {/* Top Left: Logo & Owner Details */}
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <img src="/logo.svg" style={{ width: 42, height: 42, borderRadius: 6, display: 'inline-block' }} alt="Logo" />
                <div style={{ fontSize: 10, color: '#4b5563', lineHeight: 1.3 }}>
                  <h4 style={{ color: '#111827', fontWeight: 800, fontSize: 13, marginBottom: 4, letterSpacing: '0.02em' }}>{companyDetails.name}</h4>
                  <p>{companyDetails.address}</p>
                  <p>Tel: {companyDetails.phone || '+65 6123 4567'}</p>
                  <p>Email: {companyDetails.email || 'info@carpentersproperties.com'}</p>
                  <p>{companyDetails.website}</p>
                </div>
              </div>
              
              {/* Top Right: Invoice Details */}
              <div style={{ textAlign: 'right', fontSize: 11, color: '#4b5563', lineHeight: 1.4 }}>
                <h3 style={{ color: '#111827', fontWeight: 800, fontSize: 16, margin: '0 0 6px 0', letterSpacing: '0.03em' }}>TAX INVOICE</h3>
                <p><span style={{ color: '#6b7280' }}>Invoice Number</span> &nbsp;&nbsp; {selectedInvoice.id}</p>
                <p><span style={{ color: '#6b7280' }}>Date</span> &nbsp;&nbsp; {selectedInvoice.issuedDate}</p>
                <p style={{ marginTop: 6 }}>
                  <span style={{ 
                    padding: '2px 8px', 
                    borderRadius: 10, 
                    fontSize: 9, 
                    fontWeight: 700, 
                    backgroundColor: selectedInvoice.status === 'paid' ? '#d1fae5' : '#fef3c7', 
                    color: selectedInvoice.status === 'paid' ? '#065f46' : '#92400e' 
                  }}>
                    {selectedInvoice.status.toUpperCase()}
                  </span>
                </p>
              </div>
            </div>

            {/* BILL TO & PROPERTY ADDRESS */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, fontSize: 10, paddingBottom: 10 }}>
              <div>
                <span style={{ color: '#6b7280', textTransform: 'uppercase', display: 'block', fontWeight: 700, fontSize: 9, marginBottom: 4 }}>BILL TO</span>
                <strong style={{ fontSize: 11, color: '#111827', display: 'block' }}>Tenant Name</strong>
                <span style={{ display: 'block', color: '#111827', fontWeight: 600, marginBottom: 4 }}>{selectedInvoice.tenantName}</span>
                <p style={{ color: '#4b5563', lineHeight: 1.3 }}>{invoiceDetailsExtra?.customerAddress || '10 Anson Road, #15-02, International Plaza, Singapore 079903'}</p>
              </div>
              <div>
                <span style={{ color: '#6b7280', textTransform: 'uppercase', display: 'block', fontWeight: 700, fontSize: 9, marginBottom: 4 }}>PROPERTY ADDRESS</span>
                <strong style={{ fontSize: 11, color: '#111827', display: 'block', marginBottom: 2 }}>{invoiceDetailsExtra?.unitName || selectedInvoice.propertyId}</strong>
                <p style={{ color: '#4b5563', lineHeight: 1.3 }}>{invoiceDetailsExtra?.unitAddress || '10 Anson Road, #15-02, International Plaza, Singapore 079903'}</p>
              </div>
            </div>

            {/* MIDDLE: LINE ITEMS TABLE */}
            <div style={{ border: '1px solid #e5e7eb', borderRadius: 4, overflow: 'hidden' }}>
              {(() => {
                const getBillingPeriod = (dateStr) => {
                  if (!dateStr) return '01 Jun 2024 - 30 Jun 2024';
                  const d = new Date(dateStr);
                  if (isNaN(d.getTime())) return '01 Jun 2024 - 30 Jun 2024';
                  const year = d.getFullYear();
                  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                  const month = monthNames[d.getMonth()];
                  const lastDay = new Date(year, d.getMonth() + 1, 0).getDate();
                  return `01 ${month} ${year} - ${lastDay} ${month} ${year}`;
                };
                const activeCurrency = invoiceDetailsExtra?.currency || companyDetails.currency || 'SGD';
                const baseRent = Math.round(selectedInvoice.amount * 0.8);
                const serviceCharge = Math.round(selectedInvoice.amount * 0.12);
                const propertyTax = Math.round(selectedInvoice.amount * 0.08);
                const gstVal = Math.round(selectedInvoice.amount * 0.09);
                const periodStr = getBillingPeriod(selectedInvoice.issuedDate);

                return (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10, textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: '#1f2937', color: '#ffffff', borderBottom: '1px solid #374151' }}>
                        <th style={{ padding: '8px 10px', color: '#ffffff' }}>Description</th>
                        <th style={{ padding: '8px 10px', color: '#ffffff' }}>Period</th>
                        <th style={{ padding: '8px 10px', textAlign: 'right', color: '#ffffff' }}>Amount ({activeCurrency})</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '8px 10px', color: '#111827', fontWeight: 500 }}>Rent</td>
                        <td style={{ padding: '8px 10px', color: '#4b5563' }}>{periodStr}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 600 }}>{baseRent.toLocaleString()}.00</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '8px 10px', color: '#111827', fontWeight: 500 }}>Service Charge</td>
                        <td style={{ padding: '8px 10px', color: '#4b5563' }}>{periodStr}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 600 }}>{serviceCharge.toLocaleString()}.00</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '8px 10px', color: '#111827', fontWeight: 500 }}>Property Tax</td>
                        <td style={{ padding: '8px 10px', color: '#4b5563' }}>{periodStr}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 600 }}>{propertyTax.toLocaleString()}.00</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
                        <td colSpan="2" style={{ padding: '8px 10px', color: '#374151', fontWeight: 600, textAlign: 'right' }}>Subtotal</td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, color: '#374151' }}>{selectedInvoice.amount.toLocaleString()}.00</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td colSpan="2" style={{ padding: '8px 10px', color: '#4b5563', fontWeight: 600, textAlign: 'right' }}>GST (9%)</td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 600 }}>{gstVal.toLocaleString()}.00</td>
                      </tr>
                      <tr style={{ background: '#f3f4f6', borderTop: '2px solid #e5e7eb' }}>
                        <td colSpan="2" style={{ padding: '8px 10px', fontWeight: 800, color: '#111827', textAlign: 'right' }}>Total Amount Due ({activeCurrency})</td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 800, color: '#111827', fontSize: 11 }}>{(selectedInvoice.amount + gstVal).toLocaleString()}.00</td>
                      </tr>
                    </tbody>
                  </table>
                );
              })()}
            </div>

            {/* AMOUNT IN WORDS */}
            <div style={{ background: '#f9fafb', padding: '10px 12px', borderRadius: 4, fontSize: 10, color: '#374151', borderLeft: '3px solid #1f2937' }}>
              <span style={{ fontWeight: 700, textTransform: 'uppercase', display: 'block', fontSize: 8, color: '#6b7280', marginBottom: 2 }}>Amount in Words:</span>
              <strong>{numberToWords(Math.round(selectedInvoice.amount * 1.09))}</strong>
            </div>

            {/* BOTTOM SECTION: BANK & TERMS & QR */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20, borderTop: '1px solid #e5e7eb', paddingTop: 14, fontSize: 9, color: '#4b5563', lineHeight: 1.4 }}>
              {/* Payment Info & Bank Details */}
              <div>
                <strong style={{ color: '#111827', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>PAYMENT INFORMATION</strong>
                <p style={{ marginBottom: 6 }}>Please make payment by {selectedInvoice.dueDate} to the following account:</p>
                <p><span style={{ color: '#6b7280' }}>Bank Name:</span> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <strong>DBS Bank Ltd</strong></p>
                <p><span style={{ color: '#6b7280' }}>Account Name:</span> &nbsp;&nbsp; <strong>{companyDetails.name}</strong></p>
                <p><span style={{ color: '#6b7280' }}>Account Number:</span> <strong>123-456789-0</strong></p>
                <p><span style={{ color: '#6b7280' }}>Swift Code:</span> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <strong>DBSSGSGXXX</strong></p>
                
                <p style={{ marginTop: 12, fontStyle: 'italic', fontSize: 8, color: '#6b7280' }}>
                  Thank you for your business.<br />
                  This is a computer-generated invoice. No signature is required.
                </p>
              </div>
              
              {/* Scan to Pay QR */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderLeft: '1px solid #e5e7eb', paddingLeft: 20 }}>
                <span style={{ fontSize: 9, color: '#111827', marginBottom: 6, textTransform: 'uppercase', fontWeight: 700 }}>SCAN TO PAY</span>
                <svg viewBox="0 0 100 100" style={{ width: 64, height: 64 }}>
                  <rect width="100" height="100" fill="#ffffff" />
                  <rect x="5" y="5" width="25" height="25" fill="#000000" />
                  <rect x="8" y="8" width="19" height="19" fill="#ffffff" />
                  <rect x="11" y="11" width="13" height="13" fill="#000000" />
                  <rect x="70" y="5" width="25" height="25" fill="#000000" />
                  <rect x="73" y="8" width="19" height="19" fill="#ffffff" />
                  <rect x="76" y="11" width="13" height="13" fill="#000000" />
                  <rect x="5" y="70" width="25" height="25" fill="#000000" />
                  <rect x="8" y="73" width="19" height="19" fill="#ffffff" />
                  <rect x="11" y="76" width="13" height="13" fill="#000000" />
                  <rect x="35" y="10" width="5" height="5" fill="#000000" />
                  <rect x="45" y="15" width="10" height="5" fill="#000000" />
                  <rect x="35" y="25" width="15" height="5" fill="#000000" />
                  <rect x="55" y="25" width="5" height="10" fill="#000000" />
                  <rect x="25" y="35" width="10" height="10" fill="#000000" />
                  <rect x="50" y="35" width="10" height="5" fill="#000000" />
                  <rect x="15" y="45" width="5" height="15" fill="#000000" />
                  <rect x="35" y="50" width="15" height="5" fill="#000000" />
                  <rect x="65" y="40" width="15" height="10" fill="#000000" />
                  <rect x="45" y="65" width="10" height="5" fill="#000000" />
                  <rect x="60" y="60" width="20" height="5" fill="#000000" />
                  <rect x="80" y="70" width="10" height="15" fill="#000000" />
                </svg>
              </div>
            </div>

            {/* Terms and Conditions Collapsible */}
            {showTerms && (
              <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 'var(--radius-md)', padding: 12, fontSize: 9, color: '#4b5563', animation: 'slideDown 0.2s ease-out' }}>
                <strong style={{ color: '#111827', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Terms & Conditions</strong>
                <p>1. Settle all invoice amounts within 10 days of the date of issue.</p>
                <p>2. Overdue payments will be charged interest at a rate of 1.5% per month.</p>
                <p>3. Payments are subject to standard Singapore Carpenters commercial tenant policies.</p>
                <p>4. Billing disputes must be raised in writing within 5 business days of receipt.</p>
              </div>
            )}

            {/* Action buttons */}
            <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 14, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {selectedInvoice.status === 'pending' && (
                <button 
                  className="btn btn-primary" 
                  style={{ flex: 1, minWidth: 140, fontSize: 11, gap: 6, background: '#ffdd00', color: '#000' }}
                  onClick={() => {
                    onRecordPayment(selectedInvoice.id);
                    setSelectedInvoice({ ...selectedInvoice, status: 'paid' });
                  }}
                >
                  <CheckCircle2 size={13} /> Record Payment Received
                </button>
              )}
              <button 
                className="btn btn-secondary" 
                style={{ flex: 1, minWidth: 100, fontSize: 11, gap: 6, borderColor: '#d1d5db', color: '#374151', background: '#f9fafb' }}
                onClick={() => handlePrint(selectedInvoice)}
              >
                <Printer size={13} /> Print Official PDF
              </button>
              <button 
                className="btn btn-secondary" 
                style={{ flex: 1, minWidth: 120, fontSize: 11, gap: 6, borderColor: '#d1d5db', color: '#374151', background: '#f9fafb' }}
                onClick={() => setShowTerms(!showTerms)}
              >
                Terms & Conditions
              </button>
            </div>
          </div>
        )}
      </div>

      {/* GENERAL LEDGER & TRIAL BALANCE MODAL */}
      {showGLModal && (() => {
        // Group GL Entry debits and credits by account name
        const accountBalances = {};
        glEntries.forEach(entry => {
          const accName = entry.account;
          if (!accountBalances[accName]) {
            accountBalances[accName] = { debit: 0, credit: 0 };
          }
          accountBalances[accName].debit += Number(entry.debit || 0);
          accountBalances[accName].credit += Number(entry.credit || 0);
        });

        // Map accounts to display format including accumulated balances
        const displayAccounts = accounts.map(acc => {
          const balances = accountBalances[acc.name] || { debit: 0, credit: 0 };
          return {
            name: acc.name,
            account_name: acc.account_name || acc.name,
            root_type: acc.root_type || 'Asset',
            parent_account: acc.parent_account || 'N/A',
            debit: balances.debit,
            credit: balances.credit
          };
        });

        // Compute total Debit and Credit sums for the Trial Balance check
        const totalDebitSum = displayAccounts.reduce((sum, acc) => sum + acc.debit, 0);
        const totalCreditSum = displayAccounts.reduce((sum, acc) => sum + acc.credit, 0);
        const isBalanced = Math.abs(totalDebitSum - totalCreditSum) < 0.05;

        return (
          <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: 850 }}>
              <div className="modal-header">
                <h3>General Ledger & Trial Balance Chart</h3>
                <button onClick={() => setShowGLModal(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 20 }}>×</button>
              </div>
              
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                
                {/* 1. General Ledger Entries */}
                <div>
                  <h4 style={{ fontSize: '0.9rem', color: 'var(--brand-color)', marginBottom: 8 }}>ERPNext Chart of Accounts & Balances</h4>
                  <div className="table-container" style={{ maxHeight: 250, overflowY: 'auto' }}>
                    <table className="custom-table" style={{ fontSize: '0.8rem' }}>
                      <thead>
                        <tr style={{ background: 'var(--bg-tertiary)' }}>
                          <th>Account ID / Code</th>
                          <th>Account Name</th>
                          <th>Parent Account</th>
                          <th>Type</th>
                          <th style={{ textAlign: 'right' }}>Debit ($)</th>
                          <th style={{ textAlign: 'right' }}>Credit ($)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {displayAccounts.map((acc, index) => (
                          <tr key={index}>
                            <td style={{ fontWeight: 600, color: 'var(--brand-color)' }}>{acc.name}</td>
                            <td>{acc.account_name}</td>
                            <td>{acc.parent_account}</td>
                            <td><span className="badge" style={{ fontSize: 9, padding: '2px 6px', textTransform: 'capitalize' }}>{acc.root_type}</span></td>
                            <td style={{ textAlign: 'right', color: acc.debit > 0 ? 'var(--color-success)' : 'var(--text-muted)', fontWeight: acc.debit > 0 ? 600 : 400 }}>
                              {acc.debit > 0 ? `$${acc.debit.toLocaleString()}` : '-'}
                            </td>
                            <td style={{ textAlign: 'right', color: acc.credit > 0 ? 'var(--color-warning)' : 'var(--text-muted)', fontWeight: acc.credit > 0 ? 600 : 400 }}>
                              {acc.credit > 0 ? `$${acc.credit.toLocaleString()}` : '-'}
                            </td>
                          </tr>
                        ))}
                        {displayAccounts.length === 0 && (
                          <tr>
                            <td colSpan="6" style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>No accounts found.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 2. Trial Balance Check */}
                <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: 18 }}>
                  <h4 style={{ fontSize: '0.9rem', color: 'var(--brand-color)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Landmark size={16} /> Trial Balance Equation Check
                  </h4>
                  <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 14 }}>
                    Calculated dynamically from live ERPNext Chart of Accounts & GL Entries. Proves that total Debit matches total Credit.
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, textAlign: 'center', fontSize: 12 }}>
                    <div style={{ background: 'var(--bg-tertiary)', padding: 12, borderRadius: 6 }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: 10, textTransform: 'uppercase' }}>Sum of Debits</span>
                      <strong style={{ display: 'block', fontSize: '1.2rem', color: 'var(--color-success)', marginTop: 4 }}>
                        ${totalDebitSum.toLocaleString()}.00
                      </strong>
                    </div>
                    <div style={{ background: 'var(--bg-tertiary)', padding: 12, borderRadius: 6 }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: 10, textTransform: 'uppercase' }}>Sum of Credits</span>
                      <strong style={{ display: 'block', fontSize: '1.2rem', color: 'var(--color-success)', marginTop: 4 }}>
                        ${totalCreditSum.toLocaleString()}.00
                      </strong>
                    </div>
                    <div style={{ background: 'var(--bg-accent-alpha)', border: isBalanced ? '1px solid var(--brand-color)' : '1px solid var(--color-danger)', padding: 12, borderRadius: 6 }}>
                      <span style={{ color: isBalanced ? 'var(--brand-color)' : 'var(--color-danger)', fontSize: 10, textTransform: 'uppercase' }}>Balance Check status</span>
                      <strong style={{ display: 'block', fontSize: '1.2rem', color: isBalanced ? 'var(--brand-color)' : 'var(--color-danger)', marginTop: 4 }}>
                        {isBalanced ? 'BALANCED ✓' : 'UNBALANCED ✗'}
                      </strong>
                    </div>
                  </div>
                </div>

              </div>
              
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowGLModal(false)}>Close Ledger</button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Add Invoice Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Issue New Rent Invoice</h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 20 }}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Tenant Name</label>
                  <input type="text" value={tenantName} onChange={(e) => setTenantName(e.target.value)} placeholder="e.g. Aroma Brews Co." className="form-input" required />
                </div>

                <div className="grid-2col" style={{ gap: 16, gridTemplateColumns: '1fr 1fr' }}>
                  <div className="form-group">
                    <label className="form-label">Asset Space ID</label>
                    <input type="text" value={propertyId} onChange={(e) => setPropertyId(e.target.value)} placeholder="e.g. G-101" className="form-input" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Billing Amount (USD)</label>
                    <input type="number" min="1" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g. 3200" className="form-input" required />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Due Date</label>
                  <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="form-input" required />
                </div>
              </div>
              
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Generate & Issue</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Print Receipt Modal */}
      {activeReceipt && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 650, padding: 30, background: '#ffffff', color: '#111827', borderRadius: 'var(--radius-lg)' }}>
            
            {/* TOP HEADER SECTION */}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e5e7eb', paddingBottom: 14, marginBottom: 16 }}>
              {/* Top Left: Logo & Owner Details */}
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <img src="/logo.svg" style={{ width: 42, height: 42, borderRadius: 6, display: 'inline-block' }} alt="Logo" />
                <div style={{ fontSize: 10, color: '#4b5563', lineHeight: 1.3 }}>
                  <h4 style={{ color: '#111827', fontWeight: 800, fontSize: 14, marginBottom: 4, letterSpacing: '0.02em' }}>{companyDetails.name}</h4>
                  <p>{companyDetails.address}</p>
                  <p>Tel: {companyDetails.phone || '+65 6123 4567'}</p>
                  <p>Email: {companyDetails.email || 'info@carpentersproperties.com'}</p>
                  <p>{companyDetails.website}</p>
                </div>
              </div>
              
              {/* Top Right: Invoice Details */}
              <div style={{ textAlign: 'right', fontSize: 11, color: '#4b5563', lineHeight: 1.4 }}>
                <h3 style={{ color: '#111827', fontWeight: 800, fontSize: 18, margin: '0 0 8px 0', letterSpacing: '0.03em' }}>TAX INVOICE</h3>
                <p><span style={{ color: '#6b7280' }}>Invoice Number</span> &nbsp;&nbsp; {activeReceipt.id}</p>
                <p><span style={{ color: '#6b7280' }}>Date</span> &nbsp;&nbsp; {activeReceipt.issuedDate}</p>
                <p style={{ marginTop: 6 }}>
                  <span style={{ 
                    padding: '2px 8px', 
                    borderRadius: 10, 
                    fontSize: 8, 
                    fontWeight: 700, 
                    backgroundColor: activeReceipt.status === 'paid' ? '#d1fae5' : '#fef3c7', 
                    color: activeReceipt.status === 'paid' ? '#065f46' : '#92400e' 
                  }}>
                    {activeReceipt.status.toUpperCase()}
                  </span>
                </p>
              </div>
            </div>

            {/* BILL TO & PROPERTY ADDRESS */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, fontSize: 10, paddingBottom: 14, marginBottom: 14 }}>
              <div>
                <span style={{ color: '#6b7280', textTransform: 'uppercase', display: 'block', fontWeight: 700, fontSize: 9, marginBottom: 4 }}>BILL TO</span>
                <strong style={{ fontSize: 11, color: '#111827', display: 'block' }}>Tenant Name</strong>
                <span style={{ display: 'block', color: '#111827', fontWeight: 600, marginBottom: 4 }}>{activeReceipt.tenantName}</span>
                <p style={{ color: '#4b5563', lineHeight: 1.3 }}>{invoiceDetailsExtra?.customerAddress || '10 Anson Road, #15-02, International Plaza, Singapore 079903'}</p>
              </div>
              <div>
                <span style={{ color: '#6b7280', textTransform: 'uppercase', display: 'block', fontWeight: 700, fontSize: 9, marginBottom: 4 }}>PROPERTY ADDRESS</span>
                <strong style={{ fontSize: 11, color: '#111827', display: 'block', marginBottom: 2 }}>{invoiceDetailsExtra?.unitName || activeReceipt.propertyId}</strong>
                <p style={{ color: '#4b5563', lineHeight: 1.3 }}>{invoiceDetailsExtra?.unitAddress || '10 Anson Road, #15-02, International Plaza, Singapore 079903'}</p>
              </div>
            </div>

            {/* MIDDLE: LINE ITEMS TABLE */}
            <div style={{ border: '1px solid #e5e7eb', borderRadius: 4, overflow: 'hidden', marginBottom: 16 }}>
              {(() => {
                const getBillingPeriod = (dateStr) => {
                  if (!dateStr) return '01 Jun 2024 - 30 Jun 2024';
                  const d = new Date(dateStr);
                  if (isNaN(d.getTime())) return '01 Jun 2024 - 30 Jun 2024';
                  const year = d.getFullYear();
                  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                  const month = monthNames[d.getMonth()];
                  const lastDay = new Date(year, d.getMonth() + 1, 0).getDate();
                  return `01 ${month} ${year} - ${lastDay} ${month} ${year}`;
                };
                const activeCurrency = invoiceDetailsExtra?.currency || companyDetails.currency || 'SGD';
                const baseRent = Math.round(activeReceipt.amount * 0.8);
                const serviceCharge = Math.round(activeReceipt.amount * 0.12);
                const propertyTax = Math.round(activeReceipt.amount * 0.08);
                const gstVal = Math.round(activeReceipt.amount * 0.09);
                const periodStr = getBillingPeriod(activeReceipt.issuedDate);

                return (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10, textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: '#1f2937', color: '#ffffff', borderBottom: '1px solid #374151' }}>
                        <th style={{ padding: '8px 10px', color: '#ffffff' }}>Description</th>
                        <th style={{ padding: '8px 10px', color: '#ffffff' }}>Period</th>
                        <th style={{ padding: '8px 10px', textAlign: 'right', color: '#ffffff' }}>Amount ({activeCurrency})</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '8px 10px', color: '#111827', fontWeight: 500 }}>Rent</td>
                        <td style={{ padding: '8px 10px', color: '#4b5563' }}>{periodStr}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 600 }}>{baseRent.toLocaleString()}.00</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '8px 10px', color: '#111827', fontWeight: 500 }}>Service Charge</td>
                        <td style={{ padding: '8px 10px', color: '#4b5563' }}>{periodStr}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 600 }}>{serviceCharge.toLocaleString()}.00</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '8px 10px', color: '#111827', fontWeight: 500 }}>Property Tax</td>
                        <td style={{ padding: '8px 10px', color: '#4b5563' }}>{periodStr}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 600 }}>{propertyTax.toLocaleString()}.00</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
                        <td colSpan="2" style={{ padding: '8px 10px', color: '#374151', fontWeight: 600, textAlign: 'right' }}>Subtotal</td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, color: '#374151' }}>{activeReceipt.amount.toLocaleString()}.00</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td colSpan="2" style={{ padding: '8px 10px', color: '#4b5563', fontWeight: 600, textAlign: 'right' }}>GST (9%)</td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 600 }}>{gstVal.toLocaleString()}.00</td>
                      </tr>
                      <tr style={{ background: '#f3f4f6', borderTop: '2px solid #e5e7eb' }}>
                        <td colSpan="2" style={{ padding: '8px 10px', fontWeight: 800, color: '#111827', textAlign: 'right' }}>Total Amount Due ({activeCurrency})</td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 800, color: '#111827', fontSize: 11 }}>{(activeReceipt.amount + gstVal).toLocaleString()}.00</td>
                      </tr>
                    </tbody>
                  </table>
                );
              })()}
            </div>

            {/* AMOUNT IN WORDS */}
            <div style={{ background: '#f9fafb', padding: '10px 12px', borderRadius: 4, fontSize: 10, color: '#374151', borderLeft: '3px solid #1f2937', marginBottom: 16 }}>
              <span style={{ fontWeight: 700, textTransform: 'uppercase', display: 'block', fontSize: 8, color: '#6b7280', marginBottom: 2 }}>Amount in Words:</span>
              <strong>{numberToWords(Math.round(activeReceipt.amount * 1.09))}</strong>
            </div>

            {/* BOTTOM SECTION: BANK & TERMS & QR */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20, borderTop: '1px solid #e5e7eb', paddingTop: 14, fontSize: 9, color: '#4b5563', lineHeight: 1.4, marginBottom: 20 }}>
              {/* Payment Info & Bank Details */}
              <div>
                <strong style={{ color: '#111827', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>PAYMENT INFORMATION</strong>
                <p style={{ marginBottom: 6 }}>Please make payment by {activeReceipt.dueDate} to the following account:</p>
                <p><span style={{ color: '#6b7280' }}>Bank Name:</span> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <strong>DBS Bank Ltd</strong></p>
                <p><span style={{ color: '#6b7280' }}>Account Name:</span> &nbsp;&nbsp; <strong>{companyDetails.name}</strong></p>
                <p><span style={{ color: '#6b7280' }}>Account Number:</span> <strong>123-456789-0</strong></p>
                <p><span style={{ color: '#6b7280' }}>Swift Code:</span> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <strong>DBSSGSGXXX</strong></p>
                
                <p style={{ marginTop: 12, fontStyle: 'italic', fontSize: 8, color: '#6b7280' }}>
                  Thank you for your business.<br />
                  This is a computer-generated invoice. No signature is required.
                </p>
              </div>
              
              {/* Scan to Pay QR */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderLeft: '1px solid #e5e7eb', paddingLeft: 20 }}>
                <span style={{ fontSize: 9, color: '#111827', marginBottom: 6, textTransform: 'uppercase', fontWeight: 700 }}>SCAN TO PAY</span>
                <svg viewBox="0 0 100 100" style={{ width: 64, height: 64 }}>
                  <rect width="100" height="100" fill="#ffffff" />
                  <rect x="5" y="5" width="25" height="25" fill="#000000" />
                  <rect x="8" y="8" width="19" height="19" fill="#ffffff" />
                  <rect x="11" y="11" width="13" height="13" fill="#000000" />
                  <rect x="70" y="5" width="25" height="25" fill="#000000" />
                  <rect x="73" y="8" width="19" height="19" fill="#ffffff" />
                  <rect x="76" y="11" width="13" height="13" fill="#000000" />
                  <rect x="5" y="70" width="25" height="25" fill="#000000" />
                  <rect x="8" y="73" width="19" height="19" fill="#ffffff" />
                  <rect x="11" y="76" width="13" height="13" fill="#000000" />
                  <rect x="35" y="10" width="5" height="5" fill="#000000" />
                  <rect x="45" y="15" width="10" height="5" fill="#000000" />
                  <rect x="35" y="25" width="15" height="5" fill="#000000" />
                  <rect x="55" y="25" width="5" height="10" fill="#000000" />
                  <rect x="25" y="35" width="10" height="10" fill="#000000" />
                  <rect x="50" y="35" width="10" height="5" fill="#000000" />
                  <rect x="15" y="45" width="5" height="15" fill="#000000" />
                  <rect x="35" y="50" width="15" height="5" fill="#000000" />
                  <rect x="65" y="40" width="15" height="10" fill="#000000" />
                  <rect x="45" y="65" width="10" height="5" fill="#000000" />
                  <rect x="60" y="60" width="20" height="5" fill="#000000" />
                  <rect x="80" y="70" width="10" height="15" fill="#000000" />
                </svg>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button 
                className="btn btn-secondary" 
                style={{ width: '100%', borderColor: '#d1d5db', color: '#374151', background: '#f9fafb', fontSize: 11 }}
                onClick={() => window.print()}
              >
                Download PDF / Print
              </button>
              <button 
                className="btn btn-primary" 
                style={{ width: '100%', background: '#ffdd00', color: '#000000', fontSize: 11 }}
                onClick={() => setActiveReceipt(null)}
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
