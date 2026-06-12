import React, { useState } from 'react';
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

export default function Invoices({ invoices, accounts = [], glEntries = [], onAddInvoice, onRecordPayment }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showGLModal, setShowGLModal] = useState(false); // General Ledger & Trial Balance modal
  const [selectedInvoice, setSelectedInvoice] = useState(invoices[0] || null); // Default select first invoice

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

  // Form states
  const [tenantName, setTenantName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [propertyId, setPropertyId] = useState('');

  const [activeReceipt, setActiveReceipt] = useState(null);

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
          <p className="view-subtitle">Generate rent invoices, record payments, and view accounting double-entries.</p>
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
                  <th>Space</th>
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
                    <td style={{ color: 'var(--text-secondary)' }}>{inv.propertyId}</td>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #e5e7eb', paddingBottom: 14 }}>
              {/* Top Left: Owner Details */}
              <div style={{ fontSize: 11, color: '#4b5563', lineHeight: 1.4 }}>
                <h4 style={{ color: '#111827', fontWeight: 800, fontSize: 12, textTransform: 'uppercase', marginBottom: 4 }}>Carpenters Trust Group</h4>
                <p>Carpenters Estate Management Office</p>
                <p>Stratford, London E15</p>
                <p>Email: trust@carpenterestate.org</p>
                <p>Tel: +44 20 7123 4567</p>
              </div>
              
              {/* Top Right: Invoice Details */}
              <div style={{ textAlign: 'right', fontSize: 11, color: '#4b5563', lineHeight: 1.4 }}>
                <h3 style={{ color: '#ffdd00', fontWeight: 800, fontSize: 16, textShadow: '0px 0px 1px #000', margin: 0 }}>INVOICE</h3>
                <p style={{ fontWeight: 700, color: '#111827' }}>REF: {selectedInvoice.id}</p>
                <p>Date: {selectedInvoice.issuedDate}</p>
                <p>Due Date: {selectedInvoice.dueDate}</p>
                <p style={{ marginTop: 4 }}>
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

            {/* BILL TO */}
            <div style={{ fontSize: 11 }}>
              <span style={{ color: '#9ca3af', textTransform: 'uppercase', display: 'block', fontWeight: 700, fontSize: 9 }}>Billed To (Tenant):</span>
              <strong style={{ fontSize: 13, color: '#111827' }}>{selectedInvoice.tenantName}</strong>
              <p style={{ color: '#4b5563' }}>Leased Space reference: <strong>{selectedInvoice.propertyId}</strong></p>
            </div>

            {/* MIDDLE: LINE ITEMS TABLE */}
            <div style={{ border: '1px solid #e5e7eb', borderRadius: 4, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                    <th style={{ padding: '8px 10px', color: '#374151' }}>Item Description</th>
                    <th style={{ padding: '8px 10px', textAlign: 'right', color: '#374151' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '8px 10px', color: '#4b5563' }}>Base Rental Charge (85% share)</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 600 }}>${Math.round(selectedInvoice.amount * 0.85).toLocaleString()}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '8px 10px', color: '#4b5563' }}>Common Area Maintenance fee (10% CAM)</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 600 }}>${Math.round(selectedInvoice.amount * 0.1).toLocaleString()}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '8px 10px', color: '#4b5563' }}>Utility & Grid Surcharges (5%)</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 600 }}>${Math.round(selectedInvoice.amount * 0.05).toLocaleString()}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
                    <td style={{ padding: '8px 10px', color: '#374151', fontWeight: 600 }}>Subtotal:</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, color: '#374151' }}>${selectedInvoice.amount.toLocaleString()}.00</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '8px 10px', color: '#4b5563', fontWeight: 600 }}>12.5% VAT Surcharge:</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 600, color: '#dc2626' }}>${Math.round(selectedInvoice.amount * 0.125).toLocaleString()}.00</td>
                  </tr>
                  <tr style={{ background: '#ffdd00' }}>
                    <td style={{ padding: '8px 10px', fontWeight: 800, color: '#000000' }}>Grand Total (incl. VAT):</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 900, color: '#000000', fontSize: 12 }}>${Math.round(selectedInvoice.amount * 1.125).toLocaleString()}.00</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* AMOUNT IN WORDS */}
            <div style={{ background: '#f3f4f6', padding: '10px 12px', borderRadius: 4, fontSize: 10, color: '#374151', borderLeft: '3px solid #ffdd00' }}>
              <span style={{ fontWeight: 700, textTransform: 'uppercase', display: 'block', fontSize: 8, color: '#6b7280', marginBottom: 2 }}>Amount in Words:</span>
              <strong>{numberToWords(Math.round(selectedInvoice.amount * 1.125))}</strong>
            </div>

            {/* BOTTOM SECTION: BANK & TERMS & QR */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr 1fr', gap: 14, borderTop: '2px solid #e5e7eb', paddingTop: 14, fontSize: 9, color: '#4b5563', lineHeight: 1.4 }}>
              {/* Bank Details */}
              <div>
                <strong style={{ color: '#111827', textTransform: 'uppercase', display: 'block', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}><Landmark size={11} /> Bank Remittance</strong>
                <p>Bank: <strong>Bank of Baroda Suva</strong></p>
                <p>A/C Name: <strong>Carpenters Trust Est.</strong></p>
                <p>A/C Number: <strong>98120200004567</strong></p>
                <p>IFSC / BSB: <strong>BARB0DTSUVA</strong></p>
              </div>
              
              {/* QR Code SVG */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <svg viewBox="0 0 100 100" style={{ width: 52, height: 52 }}>
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
                  <rect x="50" y="70" width="5" height="15" fill="#000000" />
                  <rect x="80" y="70" width="10" height="15" fill="#000000" />
                </svg>
                <span style={{ fontSize: 6, color: '#6b7280', marginTop: 2, textTransform: 'uppercase', fontWeight: 600 }}>Scan & Pay</span>
              </div>

              {/* Terms and Conditions */}
              <div>
                <strong style={{ color: '#111827', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Terms & Conditions</strong>
                <p>1. Settle within 10 days of issue.</p>
                <p>2. Overdue interest at 1.5%.</p>
                <p>3. Subject to Carpenters Mall rules.</p>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 14, display: 'flex', gap: 10 }}>
              {selectedInvoice.status === 'pending' && (
                <button 
                  className="btn btn-primary" 
                  style={{ width: '100%', fontSize: 11, gap: 6, background: '#ffdd00', color: '#000' }}
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
                style={{ width: '100%', fontSize: 11, gap: 6, borderColor: '#d1d5db', color: '#374151', background: '#f9fafb' }}
                onClick={() => handlePrint(selectedInvoice)}
              >
                <Printer size={13} /> Print Official PDF
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
            
            {/* Header branding */}
            <div style={{ textAlign: 'center', borderBottom: '2px dashed #e5e7eb', paddingBottom: 16, marginBottom: 16 }}>
              <div style={{ width: 42, height: 42, background: '#000', borderRadius: 6, margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg viewBox="0 0 100 100" style={{ width: 32, height: 32 }}>
                  <circle cx="50" cy="50" r="36" fill="#FFDD00"/>
                  <polygon points="50,50 86,14 100,14 100,86 86,86" fill="#000000"/>
                  <line x1="24" y1="76" x2="50" y2="50" stroke="#000000" strokeWidth="5.5" strokeLinecap="round"/>
                </svg>
              </div>
              <h2 style={{ color: '#111827', fontSize: '1.2rem', fontWeight: 800 }}>CARPENTERS ESTATE</h2>
              <span style={{ fontSize: 10, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Official Tax Invoice</span>
            </div>

            {/* TOP HEADER SECTION */}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e5e7eb', paddingBottom: 12, marginBottom: 14 }}>
              {/* Top Left: Owner Details */}
              <div style={{ fontSize: 10, color: '#4b5563', lineHeight: 1.4 }}>
                <h4 style={{ color: '#111827', fontWeight: 800, fontSize: 11, textTransform: 'uppercase', marginBottom: 2 }}>Carpenters Trust Group</h4>
                <p>Carpenters Estate Management Office</p>
                <p>Stratford, London E15</p>
                <p>Email: trust@carpenterestate.org</p>
                <p>Tel: +44 20 7123 4567</p>
              </div>
              
              {/* Top Right: Invoice Details */}
              <div style={{ textAlign: 'right', fontSize: 10, color: '#4b5563', lineHeight: 1.4 }}>
                <h3 style={{ color: '#92400e', fontWeight: 800, fontSize: 14, margin: 0 }}>INVOICE RECORD</h3>
                <p style={{ fontWeight: 700, color: '#111827' }}>REF: {activeReceipt.id}</p>
                <p>Date: {activeReceipt.issuedDate}</p>
                <p>Due Date: {activeReceipt.dueDate}</p>
                <p style={{ marginTop: 2 }}>
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

            {/* BILL TO */}
            <div style={{ fontSize: 10, marginBottom: 14 }}>
              <span style={{ color: '#9ca3af', textTransform: 'uppercase', display: 'block', fontWeight: 700, fontSize: 8 }}>Billed To (Tenant):</span>
              <strong style={{ fontSize: 12, color: '#111827' }}>{activeReceipt.tenantName}</strong>
              <p style={{ color: '#4b5563' }}>Leased Space reference: <strong>{activeReceipt.propertyId}</strong></p>
            </div>

            {/* MIDDLE: LINE ITEMS TABLE */}
            <div style={{ border: '1px solid #e5e7eb', borderRadius: 4, overflow: 'hidden', marginBottom: 14 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10, textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                    <th style={{ padding: '6px 8px', color: '#374151' }}>Item Description</th>
                    <th style={{ padding: '6px 8px', textAlign: 'right', color: '#374151' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '6px 8px', color: '#4b5563' }}>Base Rental Charge (85% share)</td>
                    <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 600 }}>${Math.round(activeReceipt.amount * 0.85).toLocaleString()}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '6px 8px', color: '#4b5563' }}>Common Area Maintenance fee (10% CAM)</td>
                    <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 600 }}>${Math.round(activeReceipt.amount * 0.1).toLocaleString()}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '6px 8px', color: '#4b5563' }}>Utility & Grid Surcharges (5%)</td>
                    <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 600 }}>${Math.round(activeReceipt.amount * 0.05).toLocaleString()}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
                    <td style={{ padding: '6px 8px', color: '#374151', fontWeight: 600 }}>Subtotal:</td>
                    <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 700, color: '#374151' }}>${activeReceipt.amount.toLocaleString()}.00</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '6px 8px', color: '#4b5563', fontWeight: 600 }}>12.5% VAT Surcharge:</td>
                    <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 600, color: '#dc2626' }}>${Math.round(activeReceipt.amount * 0.125).toLocaleString()}.00</td>
                  </tr>
                  <tr style={{ background: '#ffdd00' }}>
                    <td style={{ padding: '6px 8px', fontWeight: 800, color: '#000000' }}>Grand Total (incl. VAT):</td>
                    <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 900, color: '#000000', fontSize: 11 }}>${Math.round(activeReceipt.amount * 1.125).toLocaleString()}.00</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* AMOUNT IN WORDS */}
            <div style={{ background: '#f3f4f6', padding: '8px 10px', borderRadius: 4, fontSize: 9, color: '#374151', borderLeft: '3px solid #ffdd00', marginBottom: 14 }}>
              <span style={{ fontWeight: 700, textTransform: 'uppercase', display: 'block', fontSize: 7, color: '#6b7280', marginBottom: 1 }}>Amount in Words:</span>
              <strong>{numberToWords(Math.round(activeReceipt.amount * 1.125))}</strong>
            </div>

            {/* BOTTOM SECTION: BANK & TERMS & QR */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr 1fr', gap: 12, borderTop: '1px solid #e5e7eb', paddingTop: 12, fontSize: 8, color: '#4b5563', lineHeight: 1.4, marginBottom: 16 }}>
              {/* Bank Details */}
              <div>
                <strong style={{ color: '#111827', textTransform: 'uppercase', display: 'block', marginBottom: 2, display: 'flex', alignItems: 'center', gap: 4 }}><Landmark size={10} /> Bank Remittance</strong>
                <p>Bank: <strong>Bank of Baroda Suva</strong></p>
                <p>A/C Name: <strong>Carpenters Trust Est.</strong></p>
                <p>A/C Number: <strong>98120200004567</strong></p>
                <p>IFSC / BSB: <strong>BARB0DTSUVA</strong></p>
              </div>

              {/* QR Code SVG */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <svg viewBox="0 0 100 100" style={{ width: 48, height: 48 }}>
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
                  <rect x="50" y="70" width="5" height="15" fill="#000000" />
                  <rect x="80" y="70" width="10" height="15" fill="#000000" />
                </svg>
                <span style={{ fontSize: 5, color: '#6b7280', marginTop: 1, textTransform: 'uppercase', fontWeight: 600 }}>Scan & Pay</span>
              </div>

              {/* Terms and Conditions */}
              <div>
                <strong style={{ color: '#111827', textTransform: 'uppercase', display: 'block', marginBottom: 2 }}>Terms & Conditions</strong>
                <p>1. Settle within 10 days of issue.</p>
                <p>2. Overdue interest at 1.5%.</p>
                <p>3. Subject to Carpenters Mall rules.</p>
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
