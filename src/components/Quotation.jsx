import React, { useState, useEffect } from 'react';
import { FileText, Plus, X, Search, CheckCircle2, AlertCircle, Edit, Trash2, Calendar, User, Building, Trash, Printer, ArrowUpRight } from 'lucide-react';

const getCsrfToken = () => {
  if (typeof window !== 'undefined' && window.csrf_token) {
    return window.csrf_token;
  }
  if (typeof window !== 'undefined' && window.frappe && window.frappe.csrf_token) {
    return window.frappe.csrf_token;
  }
  const value = `; ${document.cookie}`;
  const parts = value.split(`; csrf_token=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return '';
};

export default function Quotation({ erpnextConfig, properties = [] }) {
  const [quotations, setQuotations] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [propertyGroups, setPropertyGroups] = useState([]); // Linked to Property Group doctype in ERPNext
  const [spaceUnits, setSpaceUnits] = useState([]); // Linked to Item doctype representing individual units
  const [templates, setTemplates] = useState([]); // Quotation templates filtered by reference_type: Quotation
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [selectedQuotationDetail, setSelectedQuotationDetail] = useState(null);
  
  // Form states
  const [quoteCustomer, setQuoteCustomer] = useState('');
  const [quoteProperty, setQuoteProperty] = useState(''); // Parent property group
  const [quoteDate, setQuoteDate] = useState('');
  const [quoteValidTill, setQuoteValidTill] = useState('');
  const [quoteEstBookingStart, setQuoteEstBookingStart] = useState(''); // Estimated Booking Start Date
  const [quoteEstBookingEnd, setQuoteEstBookingEnd] = useState('');     // Estimated Booking End Date
  const [quoteTemplate, setQuoteTemplate] = useState('');             // Quotation Template
  const [quoteStatus, setQuoteStatus] = useState('Draft');
  const [quoteCompany, setQuoteCompany] = useState('CARPENTERS PROPERTIES PTE LIMITED');
  const [quoteItems, setQuoteItems] = useState([{ unitId: '', qty: 1, uom: 'Month', standardRate: '', offeredRate: '' }]);

  // Company Details (matching Invoice format)
  const [companyDetails, setCompanyDetails] = useState({
    name: 'CARPENTERS PROPERTIES PTE LTD',
    address: '123 Cecil Street, #08-01, Singapore 069537',
    phone: '+65 6123 4567',
    email: 'info@carpentersproperties.com',
    website: 'www.carpentersproperties.com',
    currency: 'SGD'
  });

  // Selected Customer Address and Contact for current print view
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerContact, setCustomerContact] = useState('');

  // Fetch company details from ERPNext
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

          // Fetch Address
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

  // Fetch customers from ERPNext Doctype Customer
  const fetchCustomersList = async () => {
    if (!erpnextConfig || !erpnextConfig.url) return;
    try {
      const res = await fetch(`${erpnextConfig.url}/api/resource/Customer?fields=["name","customer_name"]&limit_page_length=200`, {
        credentials: 'include',
      headers: {
          'Content-Type': 'application/json'
        }
      });
      if (res.ok) {
        const json = await res.json();
        setCustomers(json.data || []);
      }
    } catch (e) {
      console.warn('Failed fetching Customer list:', e);
    }
  };

  // Fetch Property Groups from ERPNext Doctype Property Group
  const fetchPropertyGroups = async () => {
    if (!erpnextConfig || !erpnextConfig.url) return;
    try {
      const res = await fetch(`${erpnextConfig.url}/api/resource/Property%20Group?fields=["name"]&limit_page_length=200`, {
        credentials: 'include',
      headers: {
          'Content-Type': 'application/json'
        }
      });
      if (res.ok) {
        const json = await res.json();
        setPropertyGroups(json.data || []);
      }
    } catch (e) {
      console.warn('Failed fetching Property Groups:', e);
    }
  };

  // Fetch templates from ERPNext Doctype Template filtered by reference_type = "Quotation"
  const fetchTemplatesList = async () => {
    if (!erpnextConfig || !erpnextConfig.url) return;
    try {
      const res = await fetch(`${erpnextConfig.url}/api/resource/Quotation%20Template?fields=["name"]&limit_page_length=200`, {
        credentials: 'include',
      headers: {
          'Content-Type': 'application/json'
        }
      });
      if (res.ok) {
        const json = await res.json();
        setTemplates(json.data || []);
      }
    } catch (e) {
      console.warn('Failed fetching Templates list:', e);
    }
  };

  // Fetch individual unit space / items from ERPNext Doctype Item
  const fetchSpaceUnits = async (propertyGroupId) => {
    if (!erpnextConfig || !erpnextConfig.url) return;
    try {
      let url = `${erpnextConfig.url}/api/resource/Item?fields=["name","item_name","standard_rate","valuation_rate","custom_property_reference"]&limit_page_length=300`;
      if (propertyGroupId) {
        url += `&filters=[["Item","custom_property_reference","=","${propertyGroupId}"]]`;
      }
      const res = await fetch(url, {
        credentials: 'include',
      headers: {
          'Content-Type': 'application/json'
        }
      });
      if (res.ok) {
        const json = await res.json();
        setSpaceUnits(json.data || []);
      }
    } catch (e) {
      console.warn('Failed fetching Space Units (Items):', e);
    }
  };

  // Fetch quotations from ERPNext
  const fetchQuotations = async () => {
    if (!erpnextConfig || !erpnextConfig.url) {
      setQuotations([
        { name: 'QTN-2026-00001', customer_name: 'Sarah Jenkins', transaction_date: '2026-06-01', valid_till: '2026-06-30', grand_total: 6200, status: 'Submitted' },
        { name: 'QTN-2026-00002', customer_name: 'John Doe', transaction_date: '2026-06-05', valid_till: '2026-07-05', grand_total: 4500, status: 'Draft' }
      ]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${erpnextConfig.url}/api/resource/Quotation?fields=["name","customer_name","party_name","transaction_date","valid_till","grand_total","status"]&limit_page_length=100`, {
        credentials: 'include',
      headers: {
          'Content-Type': 'application/json'
        }
      });
      if (res.ok) {
        const json = await res.json();
        setQuotations(json.data || []);
      }
    } catch (e) {
      console.warn('Failed fetching quotations:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
    fetchCustomersList();
    fetchPropertyGroups();
    fetchSpaceUnits();
    fetchTemplatesList();
  }, [erpnextConfig]);

  // Load space units when parent Property selection changes
  useEffect(() => {
    if (quoteProperty) {
      fetchSpaceUnits(quoteProperty);
    } else {
      fetchSpaceUnits();
    }
  }, [quoteProperty]);

  // Handle detailed Quotation view & retrieve client CRM metadata
  const fetchQuotationDetail = async (qName, customerId) => {
    if (!erpnextConfig || !erpnextConfig.url) return;
    try {
      const res = await fetch(`${erpnextConfig.url}/api/resource/Quotation/${qName}`, {
        credentials: 'include',
      headers: {
          'Content-Type': 'application/json'
        }
      });
      if (res.ok) {
        const json = await res.json();
        const doc = json.data || json;
        setSelectedQuotationDetail(doc);

        // Fetch Customer Address & Contact
        const actualCustomer = customerId || doc.party_name || doc.customer;
        if (actualCustomer) {
          // Fetch Address linked to customer
          const addrRes = await fetch(`${erpnextConfig.url}/api/resource/Address?filters=[["Dynamic Link", "link_doctype", "=", "Customer"], ["Dynamic Link", "link_name", "=", "${actualCustomer}"]]&fields=["address_line1","address_line2","city","state","country","pincode"]`, {
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
              setCustomerAddress([addr.address_line1, addr.address_line2, addr.city, addr.state, addr.country, addr.pincode].filter(Boolean).join(', '));
            } else {
              setCustomerAddress('Registered Address not specified');
            }
          }

          // Fetch Contact linked to customer
          const contactRes = await fetch(`${erpnextConfig.url}/api/resource/Contact?filters=[["Dynamic Link", "link_doctype", "=", "Customer"], ["Dynamic Link", "link_name", "=", "${actualCustomer}"]]&fields=["email_id","phone"]`, {
            credentials: 'include',
      headers: {
              'Content-Type': 'application/json'
            }
          });
          if (contactRes.ok) {
            const contactJson = await contactRes.json();
            const contactList = contactJson.data || [];
            if (contactList.length > 0) {
              const ct = contactList[0];
              setCustomerContact([ct.email_id, ct.phone].filter(Boolean).join(' | '));
            } else {
              setCustomerContact('Contact info not specified');
            }
          }
        }
      }
    } catch (e) {
      console.warn('Failed fetching quotation detail:', e);
    }
  };

  const handleRowClick = (quote) => {
    setSelectedQuotation(quote);
    fetchQuotationDetail(quote.name, quote.party_name || quote.customer);
  };

  // Form helpers
  const addQuoteItem = () => {
    setQuoteItems([...quoteItems, { unitId: '', qty: 1, uom: 'Month', standardRate: '', offeredRate: '' }]);
  };

  const removeQuoteItem = (index) => {
    const updated = [...quoteItems];
    updated.splice(index, 1);
    setQuoteItems(updated);
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...quoteItems];
    updated[index][field] = value;
    
    // Auto-populate rate if unit / item matches
    if (field === 'unitId') {
      const matched = spaceUnits.find(u => u.name === value);
      if (matched) {
        // Valuation rate is mapped as the Standard Rate
        const valRate = matched.valuation_rate || matched.standard_rate || 0;
        updated[index].standardRate = valRate;
        updated[index].offeredRate = valRate;
      }
    }
    setQuoteItems(updated);
  };

  // Submit new Quotation
  const handleCreateQuotation = async (e) => {
    e.preventDefault();
    if (!quoteCustomer || !quoteDate || !quoteValidTill) return;
    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    const matchedCust = customers.find(c => c.name === quoteCustomer);

    const erpItems = quoteItems.map(item => {
      const matched = spaceUnits.find(u => u.name === item.unitId);
      const standardRateNum = parseFloat(item.standardRate) || 0;
      const offeredRateNum = parseFloat(item.offeredRate) || 0;

      return {
        item_code: item.unitId,
        qty: parseFloat(item.qty) || 1,
        rate: offeredRateNum,
        price_list_rate: standardRateNum,
        amount: (parseFloat(item.qty) || 1) * offeredRateNum, // Offered Rate mapped to Amount column
        uom: item.uom || 'Month',
        item_name: matched ? matched.item_name : item.unitId
      };
    });

    const payload = {
      customer: quoteCustomer,
      party_name: quoteCustomer,
      customer_name: matchedCust ? matchedCust.customer_name : quoteCustomer,
      quotation_to: 'Customer',
      transaction_date: quoteDate,
      valid_till: quoteValidTill,
      company: quoteCompany,
      status: quoteStatus,
      custom_property: quoteProperty || null, 
      // Link fields matching exact custom field names in erpnext
      custom_start_date: quoteEstBookingStart || null,
      custom_end_date: quoteEstBookingEnd || null,
      custom_template: quoteTemplate || null,
      items: erpItems
    };

    try {
      if (erpnextConfig && erpnextConfig.url) {
        const res = await fetch(`${erpnextConfig.url}/api/resource/Quotation`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'X-Frappe-CSRF-Token': getCsrfToken()
          },
          body: JSON.stringify(payload)
        });
        if (!res.ok) {
          const errData = await res.json();
          let rawMsg = 'Failed to create quotation on server.';
          if (errData._server_messages) {
            try {
              const msgs = JSON.parse(errData._server_messages);
              const firstMsgObj = JSON.parse(msgs[0]);
              rawMsg = firstMsgObj.message || rawMsg;
            } catch (e) {
              try {
                const msgs = JSON.parse(errData._server_messages);
                rawMsg = msgs[0] || rawMsg;
              } catch (inner) {
                rawMsg = errData._server_messages;
              }
            }
          } else if (errData.message) {
            rawMsg = errData.message;
          }
          throw new Error(rawMsg);
        }
      }
      
      setSuccessMsg('Quotation created successfully!');
      fetchQuotations();
      setShowAddModal(false);
      // Reset form
      setQuoteCustomer('');
      setQuoteProperty('');
      setQuoteDate('');
      setQuoteValidTill('');
      setQuoteEstBookingStart('');
      setQuoteEstBookingEnd('');
      setQuoteTemplate('');
      setQuoteItems([{ unitId: '', qty: 1, uom: 'Month', standardRate: '', offeredRate: '' }]);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Cancel Quotation Workflow (Sets status to 'Cancelled')
  const handleCancelQuotation = async (qName) => {
    if (!confirm(`Are you sure you want to cancel quotation ${qName}?`)) return;
    setLoading(true);
    try {
      if (erpnextConfig && erpnextConfig.url) {
        const res = await fetch(`${erpnextConfig.url}/api/resource/Quotation/${qName}`, {
          method: 'PUT',
          credentials: 'include',
      headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status: 'Cancelled' })
        });
        if (!res.ok) {
          throw new Error('Failed to cancel quotation.');
        }
      }
      setSelectedQuotation(null);
      setSelectedQuotationDetail(null);
      fetchQuotations();
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Amend Quotation Workflow (Revision logic)
  const handleAmendQuotation = async () => {
    if (!selectedQuotationDetail) return;
    if (!confirm(`This action will Cancel the current quotation revision ${selectedQuotationDetail.name} and create a new editable draft. Proceed?`)) return;

    setLoading(true);
    setErrorMsg('');

    try {
      // 1. Cancel current revision
      if (erpnextConfig && erpnextConfig.url) {
        const cancelRes = await fetch(`${erpnextConfig.url}/api/resource/Quotation/${selectedQuotationDetail.name}`, {
          method: 'PUT',
          credentials: 'include',
      headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status: 'Cancelled' })
        });
        if (!cancelRes.ok) {
          throw new Error('Failed to cancel the current version during amendment.');
        }
      }

      // 2. Parse revision details & increment name revision tag
      let currentRevisionCode = selectedQuotationDetail.name;
      let nextRevisionCode = '';
      const revParts = currentRevisionCode.split('-');
      const lastPart = revParts[revParts.length - 1];

      // Check if it already has an amendment number (e.g. QTN-2026-00001-1)
      if (!isNaN(parseInt(lastPart, 10)) && revParts.length > 3) {
        const nextRevNum = parseInt(lastPart, 10) + 1;
        revParts[revParts.length - 1] = nextRevNum.toString();
        nextRevisionCode = revParts.join('-');
      } else {
        nextRevisionCode = `${currentRevisionCode}-1`;
      }

      // 3. Construct new payload draft
      const newItems = (selectedQuotationDetail.items || []).map(item => ({
        item_code: item.item_code,
        qty: item.qty || 1,
        rate: item.rate || 0,
        price_list_rate: item.price_list_rate || item.rate || 0,
        uom: item.uom || 'Month',
        item_name: item.item_name
      }));

      const payload = {
        name: nextRevisionCode,
        customer: selectedQuotationDetail.party_name || selectedQuotationDetail.customer,
        party_name: selectedQuotationDetail.party_name || selectedQuotationDetail.customer,
        customer_name: selectedQuotationDetail.customer_name,
        quotation_to: 'Customer',
        transaction_date: new Date().toISOString().split('T')[0],
        valid_till: selectedQuotationDetail.valid_till,
        company: selectedQuotationDetail.company || 'CARPENTERS PROPERTIES PTE LIMITED',
        status: 'Draft',
        custom_property: selectedQuotationDetail.custom_property || null,
        custom_start_date: selectedQuotationDetail.custom_start_date || null,
        custom_end_date: selectedQuotationDetail.custom_end_date || null,
        custom_template: selectedQuotationDetail.custom_template || null,
        items: newItems
      };

      if (erpnextConfig && erpnextConfig.url) {
        const createRes = await fetch(`${erpnextConfig.url}/api/resource/Quotation`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'X-Frappe-CSRF-Token': getCsrfToken()
          },
          body: JSON.stringify(payload)
        });
        if (!createRes.ok) {
          const errData = await createRes.json();
          let rawMsg = 'Failed to create amendment draft on server.';
          if (errData._server_messages) {
            try {
              const msgs = JSON.parse(errData._server_messages);
              const firstMsgObj = JSON.parse(msgs[0]);
              rawMsg = firstMsgObj.message || rawMsg;
            } catch (e) {
              try {
                const msgs = JSON.parse(errData._server_messages);
                rawMsg = msgs[0] || rawMsg;
              } catch (inner) {
                rawMsg = errData._server_messages;
              }
            }
          } else if (errData.message) {
            rawMsg = errData.message;
          }
          throw new Error(rawMsg);
        }
      }

      alert(`Quotation ${selectedQuotationDetail.name} amended successfully. New revision draft ${nextRevisionCode} created!`);
      setSelectedQuotation(null);
      setSelectedQuotationDetail(null);
      fetchQuotations();
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="view-header">
        <div>
          <h1 className="view-title">Quotation & Proposal Management</h1>
          <p className="view-subtitle">Generate dynamic leasing proposals with multiple property units and track customer quotations.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={16} /> Create Quotation
        </button>
      </div>

      <div className="grid-2col" style={{ gridTemplateColumns: selectedQuotation ? '50% calc(50% - 24px)' : '1fr', gap: 24, transition: 'all 0.3s ease' }}>
        
        {/* Quotations List Table */}
        <div className="card-panel" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Quotation ID</th>
                  <th>Customer Name</th>
                  <th>Quote Date</th>
                  <th>Valid Till</th>
                  <th>Grand Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {quotations.map(q => (
                  <tr 
                    key={q.name}
                    onClick={() => handleRowClick(q)}
                    style={{ 
                      cursor: 'pointer',
                      backgroundColor: selectedQuotation?.name === q.name ? 'var(--bg-accent-alpha)' : '',
                      borderLeft: selectedQuotation?.name === q.name ? '3px solid var(--brand-color)' : ''
                    }}
                  >
                    <td style={{ fontWeight: 600, color: 'var(--brand-color)' }}>{q.name}</td>
                    <td style={{ fontWeight: 600 }}>{q.customer_name}</td>
                    <td>{q.transaction_date}</td>
                    <td>{q.valid_till}</td>
                    <td style={{ fontWeight: 600 }}>${(q.grand_total || 0).toLocaleString()}</td>
                    <td>
                      <span className={`badge ${q.status === 'Submitted' ? 'badge-success' : q.status === 'Cancelled' ? 'badge-danger' : 'badge-warning'}`}>
                        {q.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {quotations.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)' }}>
                      No quotations found. Click "Create Quotation" to add one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detailed Quotation TAX INVOICE styled Print View */}
        {selectedQuotation && selectedQuotationDetail && (
          <div className="card-panel" style={{ padding: 24, background: '#ffffff', color: '#111827', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: 16, animation: 'fadeIn 0.2s ease-out', position: 'relative' }}>
            
            {/* Close details button */}
            <button 
              onClick={() => { setSelectedQuotation(null); setSelectedQuotationDetail(null); }}
              style={{ position: 'absolute', top: 12, right: 12, background: '#f3f4f6', border: 'none', borderRadius: '50%', color: '#374151', cursor: 'pointer', width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              ×
            </button>

            {/* TOP HEADER SECTION */}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e5e7eb', paddingBottom: 14 }}>
              {/* Logo & Company info */}
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <svg viewBox="0 0 100 100" style={{ width: 42, height: 42, borderRadius: 6, display: 'inline-block' }}>
                  <rect width="100" height="100" fill="#000000" rx="12"/>
                  <circle cx="50" cy="50" r="36" fill="#FFDD00"/>
                  <polygon points="50,50 86,14 100,14 100,86 86,86" fill="#000000"/>
                  <line x1="24" y1="76" x2="50" y2="50" stroke="#000000" strokeWidth="5.5" strokeLinecap="round"/>
                </svg>
                <div style={{ fontSize: 10, color: '#4b5563', lineHeight: 1.3 }}>
                  <h4 style={{ color: '#111827', fontWeight: 800, fontSize: 13, marginBottom: 4, letterSpacing: '0.02em' }}>{companyDetails.name}</h4>
                  <p>{companyDetails.address}</p>
                  <p>Tel: {companyDetails.phone}</p>
                  <p>Email: {companyDetails.email}</p>
                  <p>{companyDetails.website}</p>
                </div>
              </div>

              {/* Quotation Identity details */}
              <div style={{ textAlign: 'right', fontSize: 11, color: '#4b5563', lineHeight: 1.4 }}>
                <h3 style={{ color: '#111827', fontWeight: 800, fontSize: 14, margin: '0 0 6px 0', letterSpacing: '0.03em' }}>PROPOSAL / QUOTATION</h3>
                <p><span style={{ color: '#6b7280' }}>Reference Code</span> &nbsp;&nbsp; {selectedQuotationDetail.name}</p>
                <p><span style={{ color: '#6b7280' }}>Date Issued</span> &nbsp;&nbsp; {selectedQuotationDetail.transaction_date}</p>
                <p><span style={{ color: '#6b7280' }}>Valid Until</span> &nbsp;&nbsp; {selectedQuotationDetail.valid_till}</p>
                {selectedQuotationDetail.custom_property && (
                  <p><span style={{ color: '#6b7280' }}>Property Linked</span> &nbsp;&nbsp; {selectedQuotationDetail.custom_property}</p>
                )}
                {selectedQuotationDetail.custom_template && (
                  <p><span style={{ color: '#6b7280' }}>Template Used</span> &nbsp;&nbsp; {selectedQuotationDetail.custom_template}</p>
                )}
                <p style={{ marginTop: 6 }}>
                  <span style={{ 
                    padding: '2px 8px', 
                    borderRadius: 10, 
                    fontSize: 9, 
                    fontWeight: 700, 
                    backgroundColor: selectedQuotationDetail.status === 'Submitted' ? '#d1fae5' : selectedQuotationDetail.status === 'Cancelled' ? '#fee2e2' : '#fef3c7', 
                    color: selectedQuotationDetail.status === 'Submitted' ? '#065f46' : selectedQuotationDetail.status === 'Cancelled' ? '#991b1b' : '#92400e' 
                  }}>
                    {selectedQuotationDetail.status.toUpperCase()}
                  </span>
                </p>
              </div>
            </div>

            {/* BILL TO / CUSTOMER INFO */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, fontSize: 10, paddingBottom: 6 }}>
              <div>
                <span style={{ color: '#6b7280', textTransform: 'uppercase', display: 'block', fontWeight: 700, fontSize: 9, marginBottom: 4 }}>PROPOSED TO</span>
                <strong style={{ fontSize: 11, color: '#111827', display: 'block' }}>{selectedQuotationDetail.customer_name}</strong>
                <p style={{ color: '#4b5563', lineHeight: 1.3, marginTop: 2 }}>{customerAddress}</p>
                <p style={{ color: '#4b5563', fontSize: 9, marginTop: 4 }}>Contact: {customerContact}</p>
              </div>
              <div style={{ background: '#f9fafb', padding: '10px 12px', borderRadius: 6, border: '1px solid #e5e7eb', fontSize: 9, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ color: '#6b7280', fontWeight: 700 }}>ESTIMATED BOOKING PERIOD</span>
                <div>Start: <strong style={{ color: '#111827' }}>{selectedQuotationDetail.custom_start_date || 'N/A'}</strong></div>
                <div>End: <strong style={{ color: '#111827' }}>{selectedQuotationDetail.custom_end_date || 'N/A'}</strong></div>
              </div>
            </div>

            {/* QUOTATION ITEMS TABLE */}
            <div style={{ border: '1px solid #e5e7eb', borderRadius: 4, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10, textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#1f2937', color: '#ffffff', borderBottom: '1px solid #374151' }}>
                    <th style={{ padding: '8px 10px', color: '#ffffff' }}>Item Name</th>
                    <th style={{ padding: '8px 10px', color: '#ffffff' }}>Qty</th>
                    <th style={{ padding: '8px 10px', color: '#ffffff' }}>UOM</th>
                    <th style={{ padding: '8px 10px', textAlign: 'right', color: '#ffffff' }}>Standard Rate ({companyDetails.currency})</th>
                    <th style={{ padding: '8px 10px', textAlign: 'right', color: '#ffffff' }}>Offered Rate ({companyDetails.currency})</th>
                    <th style={{ padding: '8px 10px', textAlign: 'right', color: '#ffffff' }}>Amount ({companyDetails.currency})</th>
                  </tr>
                </thead>
                <tbody>
                  {(selectedQuotationDetail.items || []).map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '8px 10px', color: '#374151', fontWeight: 600 }}>{item.item_name || item.item_code}</td>
                      <td style={{ padding: '8px 10px', color: '#4b5563' }}>{item.qty}</td>
                      <td style={{ padding: '8px 10px', color: '#4b5563' }}>{item.uom || 'Month'}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', color: '#4b5563' }}>${(item.price_list_rate || item.rate || 0).toLocaleString()}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', color: '#111827', fontWeight: 600 }}>${(item.rate || 0).toLocaleString()}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', color: '#111827', fontWeight: 600 }}>
                        ${((item.qty || 1) * (item.rate || 0)).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* TOTALS & SUMMARY */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #e5e7eb', paddingTop: 10 }}>
              <div style={{ width: '50%', fontSize: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4b5563' }}>
                  <span>Subtotal</span>
                  <span>${(selectedQuotationDetail.grand_total || 0).toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#111827', fontWeight: 700, fontSize: 12, borderTop: '1px solid #e5e7eb', paddingTop: 6 }}>
                  <span>Grand Total ({companyDetails.currency})</span>
                  <span>${(selectedQuotationDetail.grand_total || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* DYNAMIC ACTION BUTTONS (CANCEL AND AMEND - NO SIMPLE DELETE) */}
            <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                style={{ flex: 1, borderColor: '#ef4444', color: '#ef4444', background: 'transparent' }}
                disabled={selectedQuotationDetail.status === 'Cancelled'}
                onClick={() => handleCancelQuotation(selectedQuotationDetail.name)}
              >
                Cancel Quotation
              </button>
              <button 
                type="button" 
                className="btn btn-primary" 
                style={{ flex: 1 }}
                onClick={handleAmendQuotation}
              >
                Amend & Revise
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Quotation Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 720 }}>
            <div className="modal-header">
              <h3>Create New Quotation</h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 20 }}>×</button>
            </div>
            <form onSubmit={handleCreateQuotation}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {errorMsg && <div style={{ color: 'var(--color-danger)', background: 'rgba(239,68,68,0.1)', padding: 10, borderRadius: 6, fontSize: 12 }}>{errorMsg}</div>}
                
                {/* Horizontal row for Customer & Property Group */}
                <div className="grid-2col" style={{ gap: 16, gridTemplateColumns: '1fr 1fr' }}>
                  <div className="form-group">
                    <label className="form-label">Customer Name</label>
                    <select 
                      value={quoteCustomer} 
                      onChange={(e) => setQuoteCustomer(e.target.value)} 
                      className="form-select"
                      required
                      disabled={submitting}
                    >
                      <option value="">-- Choose Customer --</option>
                      {customers.map(c => (
                        <option key={c.name} value={c.name}>{c.customer_name || c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Property Group</label>
                    <select 
                      value={quoteProperty} 
                      onChange={(e) => setQuoteProperty(e.target.value)} 
                      className="form-select"
                      required
                      disabled={submitting}
                    >
                      <option value="">-- Choose Property --</option>
                      {propertyGroups.map(pg => (
                        <option key={pg.name} value={pg.name}>{pg.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid-2col" style={{ gap: 16, gridTemplateColumns: '1fr 1fr' }}>
                  <div className="form-group">
                    <label className="form-label">Quotation Date</label>
                    <input 
                      type="date" 
                      value={quoteDate} 
                      onChange={(e) => setQuoteDate(e.target.value)} 
                      className="form-input" 
                      required 
                      disabled={submitting} 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Valid Till</label>
                    <input 
                      type="date" 
                      value={quoteValidTill} 
                      onChange={(e) => setQuoteValidTill(e.target.value)} 
                      className="form-input" 
                      required 
                      disabled={submitting} 
                    />
                  </div>
                </div>

                {/* Date range for Booking Start & End */}
                <div className="grid-2col" style={{ gap: 16, gridTemplateColumns: '1fr 1fr' }}>
                  <div className="form-group">
                    <label className="form-label">Est. Booking Start Date</label>
                    <input 
                      type="date" 
                      value={quoteEstBookingStart} 
                      onChange={(e) => setQuoteEstBookingStart(e.target.value)} 
                      className="form-input" 
                      disabled={submitting} 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Est. Booking End Date</label>
                    <input 
                      type="date" 
                      value={quoteEstBookingEnd} 
                      onChange={(e) => setQuoteEstBookingEnd(e.target.value)} 
                      className="form-input" 
                      disabled={submitting} 
                    />
                  </div>
                </div>

                {/* Quotation template filter dropdown */}
                <div className="form-group">
                  <label className="form-label">Quotation Template</label>
                  <select 
                    value={quoteTemplate} 
                    onChange={(e) => setQuoteTemplate(e.target.value)} 
                    className="form-select"
                    disabled={submitting}
                  >
                    <option value="">-- Choose Template --</option>
                    {templates.map(t => (
                      <option key={t.name} value={t.name}>{t.template_name || t.name}</option>
                    ))}
                  </select>
                </div>

                {/* Multiple Quotation Items list editor */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <label className="form-label" style={{ margin: 0 }}>Quotation Items</label>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={addQuoteItem} style={{ padding: '4px 8px', fontSize: 10 }}>
                      + Add Item
                    </button>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 200, overflowY: 'auto', paddingRight: 4 }}>
                    {quoteItems.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: 10, alignItems: 'center', background: 'var(--bg-tertiary)', padding: 10, borderRadius: 6 }}>
                        <div style={{ flex: 1.8 }} className="form-group">
                          <label style={{ fontSize: 9, color: 'var(--text-muted)' }}>Unit / Item</label>
                          <select 
                            value={item.unitId} 
                            onChange={(e) => handleItemChange(idx, 'unitId', e.target.value)}
                            className="form-select"
                            required
                          >
                            <option value="">-- Choose Unit --</option>
                            {spaceUnits.map(unit => (
                              <option key={unit.name} value={unit.name}>{unit.item_name || unit.name}</option>
                            ))}
                          </select>
                        </div>
                        <div style={{ flex: 0.6 }} className="form-group">
                          <label style={{ fontSize: 9, color: 'var(--text-muted)' }}>Qty</label>
                          <input 
                            type="number" 
                            min="1"
                            value={item.qty} 
                            onChange={(e) => handleItemChange(idx, 'qty', e.target.value)}
                            className="form-input" 
                            required
                          />
                        </div>
                        <div style={{ flex: 0.8 }} className="form-group">
                          <label style={{ fontSize: 9, color: 'var(--text-muted)' }}>UOM</label>
                          <select 
                            value={item.uom} 
                            onChange={(e) => handleItemChange(idx, 'uom', e.target.value)}
                            className="form-select"
                          >
                            <option value="Month">Month</option>
                            <option value="Unit">Unit</option>
                            <option value="Year">Year</option>
                          </select>
                        </div>
                        <div style={{ flex: 0.8 }} className="form-group">
                          <label style={{ fontSize: 9, color: 'var(--text-muted)' }}>Standard Rate</label>
                          <input 
                            type="number" 
                            placeholder="Std Rate" 
                            value={item.standardRate} 
                            onChange={(e) => handleItemChange(idx, 'standardRate', e.target.value)}
                            className="form-input" 
                            required
                          />
                        </div>
                        <div style={{ flex: 0.8 }} className="form-group">
                          <label style={{ fontSize: 9, color: 'var(--text-muted)' }}>Offered Rate</label>
                          <input 
                            type="number" 
                            placeholder="Offered Rate" 
                            value={item.offeredRate} 
                            onChange={(e) => handleItemChange(idx, 'offeredRate', e.target.value)}
                            className="form-input" 
                            required
                          />
                        </div>
                        {quoteItems.length > 1 && (
                          <button type="button" onClick={() => removeQuoteItem(idx)} style={{ background: 'none', border: 'none', color: 'var(--color-danger)', cursor: 'pointer', marginTop: 14 }}>
                            <Trash size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)} disabled={submitting}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Submit Quotation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
