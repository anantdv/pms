import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Building, 
  Users, 
  Award, 
  ShoppingBag, 
  Hammer, 
  Receipt, 
  HelpCircle, 
  Globe,
  TrendingUp,
  Map,
  FileText,
  Briefcase,
  Bookmark,
  Calendar
} from 'lucide-react';

// Import Components
import Properties from './components/Properties';
import Tenants from './components/Tenants';
import Owners from './components/Owners';
import Listings from './components/Listings';
import Booking from './components/Booking';
import Maintenance from './components/Maintenance';
import Invoices from './components/Invoices';
import Support from './components/Support';
import Mall3DView from './components/Mall3DView';
import HRMS, { INITIAL_EMPLOYEES } from './components/HRMS';
import Reports from './components/Reports';
import { ERPNEXT_CONFIG } from './config';

// Sample INITIAL MOCK DATA
const INITIAL_PROPERTIES = [
  { id: 'PROP-2041', name: 'Stratford Court Apartments', type: 'residential', land_and_building_type: 'residential', address: '12 Carpenters Road, London E15', unitsCount: 24, rent: 1850, area: 18000, listedOnline: true, occupancy: 85, land_description: 'Residential building with 24 premium apartments', lease_end_date: '2026-12-31' },
  { id: 'PROP-8032', name: 'Carpenters Row Commercial', type: 'commercial', land_and_building_type: 'commercial', address: '44 Stratford High St, London E15', unitsCount: 8, rent: 4800, area: 12000, listedOnline: true, occupancy: 75, land_description: 'Carpenters office complex, double-front showroom', lease_end_date: '2027-06-30' },
  { id: 'PROP-9910', name: 'Estate Galleria Mall', type: 'mall', land_and_building_type: 'mall', address: 'Golden Loop Blvd, London E15', unitsCount: 17, rent: 5500, area: 32000, listedOnline: false, occupancy: 65, land_description: 'Three-story retail plaza, central courtyard', lease_end_date: '2029-03-01' },
  { id: 'PROP-3091', name: 'E15 Plaza complex', type: 'commercial', land_and_building_type: 'commercial', address: '78 Jebb Ln, London E15', unitsCount: 15, rent: 3900, area: 14500, listedOnline: false, occupancy: 90, land_description: 'Mixed industrial depot, rear loading bay access', lease_end_date: '2028-11-15' }
];

const INITIAL_TENANTS = [
  { id: 'TEN-801', name: 'John Doe', email: 'john.doe@gmail.com', phone: '+44 7911 884723', address: 'Flat 4B, Stratford Court, 12 Carpenters Road, London E15', propertyName: 'Stratford Court Apartments', propertyId: 'PROP-2041', leaseStart: '2025-01-01', leaseEnd: '2026-01-01', rentStatus: 'paid' },
  { id: 'TEN-802', name: 'Sarah Jenkins', email: 'sjenkins@techglow.co.uk', phone: '+44 7822 990145', address: 'Unit C, Carpenters Row, 44 Stratford High St, London E15', propertyName: 'Carpenters Row Commercial', propertyId: 'PROP-8032', leaseStart: '2024-06-15', leaseEnd: '2027-06-15', rentStatus: 'pending' },
  { id: 'TEN-803', name: 'Aroma Brews Co. (Fiona)', email: 'fiona@aromabrews.com', phone: '+44 7733 112233', address: 'Shop G-101, Galleria Mall, Golden Loop Blvd, London E15', propertyName: 'Estate Galleria Mall (G-101)', propertyId: 'PROP-9910', leaseStart: '2024-03-01', leaseEnd: '2029-03-01', rentStatus: 'paid' },
  { id: 'TEN-804', name: 'David Smith', email: 'dsmith@gmail.com', phone: '+44 7911 556677', address: 'Flat 12A, Stratford Court, 12 Carpenters Road, London E15', propertyName: 'Stratford Court Apartments', propertyId: 'PROP-2041', leaseStart: '2025-03-01', leaseEnd: '2026-03-01', rentStatus: 'overdue' }
];

const INITIAL_OWNERS = [
  { id: 'OWN-101', name: 'Carpenters Trust Group', email: 'trust@carpenterestate.org', phone: '+44 20 7123 4567', address: 'Suite 101, Carpenters House, Rodwell Rd, Suva, Fiji', properties: ['Stratford Court Apartments', 'Carpenters Row Commercial'], share: 60, lastPayout: 45000 },
  { id: 'OWN-102', name: 'Stratford Holdings Ltd', email: 'billing@stratfordholdings.co.uk', phone: '+44 20 7987 6543', address: 'Level 12, Stratford High Tower, London E15', properties: ['Estate Galleria Mall'], share: 40, lastPayout: 32000 }
];

const INITIAL_SCHEDULES = [
  {
    name: 'SCH-2026-00001',
    customer: 'TEN-801',
    customer_name: 'John Doe',
    transaction_date: '2026-06-02',
    status: 'Submitted',
    company: 'CARPENTERS PROPERTIES PTE LIMITED',
    schedules: [
      { name: 'sch-s1', item_code: '31AD', scheduled_date: '2026-06-02', completion_status: 'Pending' },
      { name: 'sch-s2', item_code: '31AD', scheduled_date: '2026-06-09', completion_status: 'Pending' },
      { name: 'sch-s3', item_code: '31AD', scheduled_date: '2026-06-16', completion_status: 'Pending' },
      { name: 'sch-s4', item_code: '31AD', scheduled_date: '2026-06-23', completion_status: 'Pending' }
    ],
    items: [
      { item_code: '31AD', start_date: '2026-06-02', end_date: '2026-06-30', periodicity: 'Weekly', description: 'Weekly carpentry inspection' }
    ]
  },
  {
    name: 'SCH-2026-00002',
    customer: 'TEN-802',
    customer_name: 'Sarah Jenkins',
    transaction_date: '2026-06-01',
    status: 'Draft',
    company: 'CARPENTERS PROPERTIES PTE LIMITED',
    schedules: [
      { name: 'sch-s5', item_code: '31CT12', scheduled_date: '2026-06-01', completion_status: 'Pending' },
      { name: 'sch-s6', item_code: '31CT12', scheduled_date: '2026-07-01', completion_status: 'Pending' }
    ],
    items: [
      { item_code: '31CT12', start_date: '2026-06-01', end_date: '2026-08-01', periodicity: 'Monthly', description: 'Monthly HVAC check' }
    ]
  }
];

const INITIAL_VISITS = [
  { name: 'MAT-MVS-2026-00001', customer: 'TEN-801', customer_name: 'John Doe', mntc_date: '2026-06-11', mntc_time: '22:57:31', completion_status: 'Partially Completed', maintenance_type: 'Unscheduled', company: 'CARPENTERS PROPERTIES PTE LIMITED' },
  { name: 'MAT-MVS-2026-00002', customer: 'TEN-802', customer_name: 'Sarah Jenkins', mntc_date: '2026-06-02', mntc_time: '10:00 AM', completion_status: 'Fully Completed', maintenance_type: 'Preventive', company: 'CARPENTERS PROPERTIES PTE LIMITED' }
];

const INITIAL_INVOICES = [
  { id: 'INV-3011', tenantName: 'Aroma Brews Co.', propertyId: 'G-101', amount: 3200, issuedDate: '2026-05-01', dueDate: '2026-05-10', status: 'paid' },
  { id: 'INV-3012', tenantName: 'John Doe', propertyId: 'PROP-2041', amount: 1850, issuedDate: '2026-05-01', dueDate: '2026-05-10', status: 'paid' },
  { id: 'INV-3013', tenantName: 'Sarah Jenkins', propertyId: 'PROP-8032', amount: 4800, issuedDate: '2026-06-01', dueDate: '2026-06-10', status: 'pending' },
  { id: 'INV-3014', tenantName: 'David Smith', propertyId: 'PROP-2041', amount: 1850, issuedDate: '2026-05-01', dueDate: '2026-05-10', status: 'pending' }
];

const INITIAL_SUPPORT = [
  { 
    id: 'SUP-701', 
    subject: 'Elevator sound query', 
    tenantName: 'John Doe', 
    propertyId: 'PROP-2041', 
    status: 'open', 
    lastUpdated: '2 hours ago',
    dateRaised: '2026-06-01',
    priority: 'high',
    category: 'maintenance',
    messages: [
      { sender: 'tenant', text: 'Hi, the lift at Tower A makes grinding noises when reaching 4th floor.', timestamp: '10:15 AM' },
      { sender: 'admin', text: 'Thanks for reporting. We have dispatched E15 elevator crew to review it today.', timestamp: '11:00 AM' },
      { sender: 'tenant', text: 'Great, thank you for the prompt reply.', timestamp: '11:30 AM' }
    ]
  },
  { 
    id: 'SUP-702', 
    subject: 'Signage Permit Approval', 
    tenantName: 'Fiona (Aroma Cafe)', 
    propertyId: 'G-101', 
    status: 'closed', 
    lastUpdated: 'Yesterday',
    dateRaised: '2026-05-30',
    priority: 'medium',
    category: 'billing',
    messages: [
      { sender: 'tenant', text: 'Hello, can we update our front logo awning to yellow color?', timestamp: 'Yesterday' },
      { sender: 'admin', text: 'Yes, yellow is approved as long as it adheres to the Carpenters Mall signage guide.', timestamp: 'Yesterday' }
    ]
  }
];

export default function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  
  // App Global State
  const [properties, setProperties] = useState(INITIAL_PROPERTIES);
  const [tenants, setTenants] = useState(INITIAL_TENANTS);
  const [owners, setOwners] = useState(INITIAL_OWNERS);
  const [schedules, setSchedules] = useState(INITIAL_SCHEDULES);
  const [visits, setVisits] = useState(INITIAL_VISITS);
  const [invoices, setInvoices] = useState(INITIAL_INVOICES);
  const [accounts, setAccounts] = useState([
    { name: '1001 - Cash / Bank (Asset) - CFPL', account_name: 'Cash / Bank (Asset)', root_type: 'Asset', parent_account: 'Current Assets' },
    { name: '1200 - Accounts Receivable (Asset) - CFPL', account_name: 'Accounts Receivable (Asset)', root_type: 'Asset', parent_account: 'Current Assets' },
    { name: '4000 - Rental Revenue (Income) - CFPL', account_name: 'Rental Revenue (Income)', root_type: 'Income', parent_account: 'Revenue' }
  ]);
  const [glEntries, setGlEntries] = useState([
    { account: '1001 - Cash / Bank (Asset) - CFPL', debit: 9850, credit: 0 },
    { account: '1200 - Accounts Receivable (Asset) - CFPL', debit: 6650, credit: 0 },
    { account: '4000 - Rental Revenue (Income) - CFPL', debit: 0, credit: 16500 }
  ]);
  const [supportTickets, setSupportTickets] = useState(INITIAL_SUPPORT);
  const [employees, setEmployees] = useState(INITIAL_EMPLOYEES);
  const [bookings, setBookings] = useState([]);
  const [erpnextDepts, setErpnextDepts] = useState(['Executive', 'Technology', 'Human Resources', 'Operations', 'Finance']);
  const [erpnextDesgs, setErpnextDesgs] = useState(['Chief Executive Officer', 'Chief Technology Officer', 'HR Director', 'Operations Manager', 'Chief Financial Officer', 'Lead Systems Architect', 'HR Officer', 'Facility Supervisor', 'Senior Accountant', 'Support Engineer']);
  const [dashboardStats, setDashboardStats] = useState({
    totalProperties: 412,
    occupancyRate: 94.2,
    monthlyRevenue: 285.5,
    pendingMaintenance: 28
  });

  // Calendar states
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [systemDateTime, setSystemDateTime] = useState(new Date());

  // Keep system date time updated
  useEffect(() => {
    const timer = setInterval(() => {
      setSystemDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Sync with ERPNext server API
  useEffect(() => {
    async function fetchERPNextData() {
      let finalProps = INITIAL_PROPERTIES;
      let finalBookings = [];

      // 1. Fetch Property Groups
      try {
        const res = await fetch(`${ERPNEXT_CONFIG.url}/api/method/erpnext.api.get_property_groups`, {
          headers: {
            'Authorization': `token ${ERPNEXT_CONFIG.apiKey}:${ERPNEXT_CONFIG.apiSecret}`,
            'Content-Type': 'application/json'
          }
        });
        if (res.ok) {
          const data = await res.json();
          const list = data.message || data;
          if (Array.isArray(list) && list.length > 0) {
            finalProps = list.map(p => {
              const addressParts = [p.locality, p.district, p.country].filter(Boolean);
              const address = addressParts.join(', ') || 'Fiji';
              
              const idDigits = p.name ? p.name.replace(/\D/g, '') : '';
              const idNum = idDigits ? parseInt(idDigits, 10) : NaN;
              let type = 'commercial';
              if (!isNaN(idNum)) {
                if (idNum % 3 === 0) {
                  type = 'residential';
                } else if (idNum % 3 === 1) {
                  type = 'commercial';
                } else {
                  type = 'mall';
                }
              } else {
                type = p.name && p.name.toLowerCase().includes('service') ? 'commercial' : 'residential';
              }
              
              let area = 8000;
              if (p.property_area) {
                area = parseFloat(p.property_area) || 8000;
              } else if (p.land_description) {
                const match = p.land_description.match(/(\d+)\s*(?:sqm|sq\s*ft|sq\s*m)/i);
                if (match) {
                  area = parseInt(match[1], 10);
                  if (p.land_description.toLowerCase().includes('sqm') || p.land_description.toLowerCase().includes('sq m')) {
                    area = Math.round(area * 10.7639);
                  }
                }
              }

              const rent = Math.round(area * 0.5) || 3000;
              const unitsCount = p.no_of_floors ? parseInt(p.no_of_floors, 10) * 4 : 8;
              const occupancy = Math.floor(65 + Math.random() * 31);

              return {
                id: p.name || 'PROP-9999',
                name: p.name || 'ERPNext Asset',
                type,
                land_and_building_type: p.land_and_building_type || 'Land and Structure',
                address,
                unitsCount,
                rent,
                area,
                listedOnline: p.listed_online || false,
                occupancy,
                land_description: p.land_description || 'Standard Land Plot',
                lease_end_date: p.lease_end_date || '2026-12-31'
              };
            });
            setProperties(finalProps);
          }
        }
      } catch (err) {
        console.warn('ERPNext API get_property_groups fetch failed, trying standard resource:', err);
        try {
          const res = await fetch(`${ERPNEXT_CONFIG.url}/api/resource/Property%20Group?fields=["name","land_and_building_type","locality","district","country","land_description","lease_start_date","lease_end_date","no_of_floors"]&limit_page_length=200`, {
            headers: {
              'Authorization': `token ${ERPNEXT_CONFIG.apiKey}:${ERPNEXT_CONFIG.apiSecret}`,
              'Content-Type': 'application/json'
            }
          });
          if (res.ok) {
            const data = await res.json();
            const list = data.data || [];
            if (list.length > 0) {
              finalProps = list.map(p => {
                const addressParts = [p.locality, p.district, p.country].filter(Boolean);
                const address = addressParts.join(', ') || 'Fiji';
                let type = 'commercial';
                if (p.land_and_building_type) {
                  const tLower = p.land_and_building_type.toLowerCase();
                  if (tLower.includes('residential') || tLower.includes('home') || tLower.includes('flat')) {
                    type = 'residential';
                  } else if (tLower.includes('mall') || tLower.includes('retail') || tLower.includes('plaza')) {
                    type = 'mall';
                  }
                } else {
                  const idDigits = p.name ? p.name.replace(/\D/g, '') : '';
                  const idNum = idDigits ? parseInt(idDigits, 10) : NaN;
                  if (!isNaN(idNum)) {
                    if (idNum % 3 === 0) {
                      type = 'residential';
                    } else if (idNum % 3 === 1) {
                      type = 'commercial';
                    } else {
                      type = 'mall';
                    }
                  }
                }
                let area = 8000;
                if (p.property_area) {
                  area = parseFloat(p.property_area) || 8000;
                }
                const rent = Math.round(area * 0.5) || 3000;
                const unitsCount = p.no_of_floors ? parseInt(p.no_of_floors, 10) * 4 : 8;
                return {
                  id: p.name || 'PROP-9999',
                  name: p.name || 'ERPNext Asset',
                  type,
                  land_and_building_type: p.land_and_building_type || 'Land and Structure',
                  address,
                  unitsCount,
                  rent,
                  area,
                  listedOnline: p.listed_online || false,
                  occupancy: Math.floor(65 + Math.random() * 31),
                  land_description: p.land_description || 'Standard Land Plot',
                  lease_end_date: p.lease_end_date || '2026-12-31'
                };
              });
              setProperties(finalProps);
            }
          }
        } catch (resErr) {
          console.warn('Standard property group resource failed:', resErr);
        }
      }

      // 1b. Fetch Bookings for statistics
      try {
        const res = await fetch(`${ERPNEXT_CONFIG.url}/api/resource/Booking?fields=["name","property","booking_date","booking_amount","status","starting_date","ending_date"]&limit_page_length=500`, {
          headers: {
            'Authorization': `token ${ERPNEXT_CONFIG.apiKey}:${ERPNEXT_CONFIG.apiSecret}`,
            'Content-Type': 'application/json'
          }
        });
        if (res.ok) {
          const json = await res.json();
          finalBookings = json.data || [];
          setBookings(finalBookings);
        }
      } catch (err) {
        console.warn('Failed to fetch bookings for stats:', err);
      }

      // 3. Fetch Customers for Tenants
      try {
        const res = await fetch(`${ERPNEXT_CONFIG.url}/api/resource/Customer?fields=%5B%22name%22%2C%22customer_name%22%2C%22owner%22%5D`, {
          headers: {
            'Authorization': `token ${ERPNEXT_CONFIG.apiKey}:${ERPNEXT_CONFIG.apiSecret}`,
            'Content-Type': 'application/json'
          }
        });
        if (res.ok) {
          const data = await res.json();
          const list = data.data || data;
          if (Array.isArray(list) && list.length > 0) {
            setTenants(list.map((c, index) => {
              const leaseStartYear = 2024 + (index % 2);
              const leaseEndYear = leaseStartYear + 1;
              return {
                id: c.name || `TEN-${Math.floor(800 + Math.random() * 200)}`,
                name: c.customer_name || c.name || 'ERPNext Customer',
                email: c.owner || 'customer@carpenterestate.org',
                phone: `+44 7911 6${Math.floor(10000 + Math.random() * 90000)}`,
                address: 'Stratford, London E15, United Kingdom',
                propertyName: 'Stratford Court Apartments',
                propertyId: 'PROP-2041',
                leaseStart: `${leaseStartYear}-01-01`,
                leaseEnd: `${leaseEndYear}-01-01`,
                rentStatus: ['paid', 'pending', 'overdue'][index % 3]
              };
            }));
          }
        }
      } catch (err) {
        console.warn('ERPNext Customer fetch failed, using fallback mock data:', err);
      }

      // 4. Fetch Suppliers for Owners
      try {
        const res = await fetch(`${ERPNEXT_CONFIG.url}/api/resource/Supplier?fields=%5B%22name%22%2C%22supplier_name%22%2C%22owner%22%5D`, {
          headers: {
            'Authorization': `token ${ERPNEXT_CONFIG.apiKey}:${ERPNEXT_CONFIG.apiSecret}`,
            'Content-Type': 'application/json'
          }
        });
        if (res.ok) {
          const data = await res.json();
          const list = data.data || data;
          if (Array.isArray(list) && list.length > 0) {
            const totalSuppliers = list.length;
            const fairShare = Math.round(100 / totalSuppliers);
            setOwners(list.map((s, index) => {
              return {
                id: s.name || `OWN-${Math.floor(100 + Math.random() * 900)}`,
                name: s.supplier_name || s.name || 'ERPNext Supplier',
                email: s.owner || 'supplier@carpenterestate.org',
                phone: '+679 330 1450',
                address: 'Level 3, Carpenters House, Rodwell Road, Suva, Fiji',
                properties: index === 0 ? ['Stratford Court Apartments', 'Carpenters Row Commercial'] : ['Estate Galleria Mall'],
                share: index === totalSuppliers - 1 ? 100 - (fairShare * (totalSuppliers - 1)) : fairShare,
                lastPayout: Math.round(20000 + (Math.random() * 25000))
              };
            }));
          }
        }
      } catch (err) {
        console.warn('ERPNext Supplier fetch failed, using fallback mock data:', err);
      }

      // 5. Fetch Issues for Helpdesk Support
      try {
        const res = await fetch(`${ERPNEXT_CONFIG.url}/api/resource/Issue?fields=%5B%22name%22%2C%22subject%22%2C%22customer_name1%22%2C%22customer_email%22%2C%22status%22%2C%22priority%22%2C%22date%22%5D`, {
          headers: {
            'Authorization': `token ${ERPNEXT_CONFIG.apiKey}:${ERPNEXT_CONFIG.apiSecret}`,
            'Content-Type': 'application/json'
          }
        });
        if (res.ok) {
          const data = await res.json();
          const list = data.data || data;
          if (Array.isArray(list) && list.length > 0) {
            setSupportTickets(list.map((issue, index) => {
              const statusLower = (issue.status || 'open').toLowerCase();
              const finalStatus = ['open', 'closed', 'in-progress', 'resolved'].includes(statusLower) ? statusLower : 'open';
              const priorityLower = (issue.priority || 'medium').toLowerCase();
              const finalPriority = ['low', 'medium', 'high'].includes(priorityLower) ? priorityLower : 'medium';
              const categoriesList = ['maintenance', 'billing', 'permit'];
              return {
                id: issue.name || `SUP-${Math.floor(700 + Math.random() * 200)}`,
                subject: issue.subject || 'Support Request',
                tenantName: issue.customer_name1 || 'Anonymous Tenant',
                propertyId: 'PROP-2041',
                status: finalStatus,
                lastUpdated: 'Just now',
                dateRaised: issue.date || '2026-06-01',
                priority: finalPriority,
                category: categoriesList[index % categoriesList.length],
                messages: [
                  { sender: 'tenant', text: issue.subject || 'Please look into this issue.', timestamp: '10:00 AM' }
                ]
              };
            }));
          }
        }
      } catch (err) {
        console.warn('ERPNext Issue fetch failed, using fallback mock data:', err);
      }

      // 6. Fetch Maintenance Visit
      try {
        const res = await fetch(`${ERPNEXT_CONFIG.url}/api/resource/Maintenance%20Visit?fields=%5B%22name%22%2C%22mntc_date%22%2C%22mntc_time%22%2C%22completion_status%22%2C%22customer_name%22%2C%22maintenance_type%22%2C%22company%22%5D`, {
          headers: {
            'Authorization': `token ${ERPNEXT_CONFIG.apiKey}:${ERPNEXT_CONFIG.apiSecret}`,
            'Content-Type': 'application/json'
          }
        });
        if (res.ok) {
          const data = await res.json();
          const list = data.data || data;
          if (Array.isArray(list) && list.length > 0) {
            setVisits(list);
          }
        }
      } catch (err) {
        console.warn('ERPNext Maintenance Visit fetch failed, using fallback mock data:', err);
      }

      // 7. Fetch Maintenance Schedule
      try {
        const res = await fetch(`${ERPNEXT_CONFIG.url}/api/resource/Maintenance%20Schedule?fields=%5B%22name%22%2C%22customer%22%2C%22transaction_date%22%2C%22status%22%2C%22customer_name%22%2C%22company%22%5D`, {
          headers: {
            'Authorization': `token ${ERPNEXT_CONFIG.apiKey}:${ERPNEXT_CONFIG.apiSecret}`,
            'Content-Type': 'application/json'
          }
        });
        if (res.ok) {
          const data = await res.json();
          const list = data.data || data;
          if (Array.isArray(list) && list.length > 0) {
            const detailedSchedules = await Promise.all(list.map(async (sch) => {
              try {
                const detailRes = await fetch(`${ERPNEXT_CONFIG.url}/api/resource/Maintenance%20Schedule/${sch.name}`, {
                  headers: {
                    'Authorization': `token ${ERPNEXT_CONFIG.apiKey}:${ERPNEXT_CONFIG.apiSecret}`,
                    'Content-Type': 'application/json'
                  }
                });
                if (detailRes.ok) {
                  const detailData = await detailRes.json();
                  return detailData.data || detailData;
                }
              } catch (e) {
                console.warn(`Failed to fetch detail for schedule ${sch.name}:`, e);
              }
              return sch;
            }));
            setSchedules(detailedSchedules);
          }
        }
      } catch (err) {
        console.warn('ERPNext Maintenance Schedule fetch failed, using fallback mock data:', err);
      }

      // 8. Fetch Sales Invoice for Billing Ledger
      try {
        const res = await fetch(`${ERPNEXT_CONFIG.url}/api/resource/Sales%20Invoice?fields=%5B%22name%22%2C%22customer_name%22%2C%22posting_date%22%2C%22due_date%22%2C%22grand_total%22%2C%22status%22%5D`, {
          headers: {
            'Authorization': `token ${ERPNEXT_CONFIG.apiKey}:${ERPNEXT_CONFIG.apiSecret}`,
            'Content-Type': 'application/json'
          }
        });
        if (res.ok) {
          const data = await res.json();
          const list = data.data || data;
          if (Array.isArray(list) && list.length > 0) {
            setInvoices(list.map(inv => {
              const statusLower = (inv.status || 'pending').toLowerCase();
              let mappedStatus = 'pending';
              if (statusLower === 'paid') {
                mappedStatus = 'paid';
              } else if (statusLower === 'overdue') {
                mappedStatus = 'overdue';
              }
              return {
                id: inv.name,
                tenantName: inv.customer_name || 'ERPNext Tenant',
                propertyId: 'PROP-2041',
                amount: inv.grand_total || 2500,
                issuedDate: inv.posting_date || '2026-06-01',
                dueDate: inv.due_date || '2026-06-10',
                status: mappedStatus
              };
            }));
          }
        }
      } catch (err) {
        console.warn('ERPNext Sales Invoice fetch failed, using fallback mock data:', err);
      }

      // 9. Fetch Accounts
      try {
        const res = await fetch(`${ERPNEXT_CONFIG.url}/api/resource/Account?fields=%5B%22name%22%2C%22account_name%22%2C%22root_type%22%2C%22is_group%22%2C%22parent_account%22%5D&limit_page_length=200`, {
          headers: {
            'Authorization': `token ${ERPNEXT_CONFIG.apiKey}:${ERPNEXT_CONFIG.apiSecret}`,
            'Content-Type': 'application/json'
          }
        });
        if (res.ok) {
          const data = await res.json();
          const list = data.data || data;
          if (Array.isArray(list) && list.length > 0) {
            setAccounts(list);
          }
        }
      } catch (err) {
        console.warn('ERPNext Account fetch failed:', err);
      }

      // 10. Fetch GL Entries
      try {
        const res = await fetch(`${ERPNEXT_CONFIG.url}/api/resource/GL%20Entry?fields=%5B%22account%22%2C%22debit%22%2C%22credit%22%2C%22posting_date%22%5D&limit_page_length=200`, {
          headers: {
            'Authorization': `token ${ERPNEXT_CONFIG.apiKey}:${ERPNEXT_CONFIG.apiSecret}`,
            'Content-Type': 'application/json'
          }
        });
        if (res.ok) {
          const data = await res.json();
          const list = data.data || data;
          if (Array.isArray(list) && list.length > 0) {
            setGlEntries(list);
          }
        }
      } catch (err) {
        console.warn('ERPNext GL Entry fetch failed:', err);
      }

      // 11. Fetch Employees from ERPNext Employee Doctype
      try {
        const res = await fetch(`${ERPNEXT_CONFIG.url}/api/resource/Employee?fields=%5B%22name%22%2C%22employee_name%22%2C%22department%22%2C%22designation%22%2C%22status%22%2C%22date_of_joining%22%2C%22company_email%22%2C%22cell_number%22%2C%22reports_to%22%2C%22image%22%5D&limit_page_length=200`, {
          headers: {
            'Authorization': `token ${ERPNEXT_CONFIG.apiKey}:${ERPNEXT_CONFIG.apiSecret}`,
            'Content-Type': 'application/json'
          }
        });
        if (res.ok) {
          const data = await res.json();
          const list = data.data || data;
          if (Array.isArray(list) && list.length > 0) {
            setEmployees(list.map((emp, index) => {
              const initials = emp.employee_name ? emp.employee_name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'EM';
              const x = 100 + (index % 4) * 260;
              const y = 80 + Math.floor(index / 4) * 140;

              return {
                id: emp.name,
                name: emp.employee_name || 'Staff Member',
                email: emp.company_email || 'staff@carpenters.com.fj',
                phone: emp.cell_number || '+679 000 0000',
                department: emp.department || 'Operations',
                designation: emp.designation || 'Staff Associate',
                status: emp.status === 'Active' ? 'Active' : 'On Leave',
                joiningDate: emp.date_of_joining || '2023-01-01',
                reportsTo: emp.reports_to ? [emp.reports_to] : [],
                avatar: initials,
                role: emp.designation || 'Staff Associate',
                rosterShift: 'Morning (08:00 - 16:00)',
                tasks: [],
                image: emp.image || null,
                x,
                y
              };
            }));
          }
        }
      } catch (err) {
        console.warn('ERPNext Employee fetch failed:', err);
      }

      // 12. Fetch Departments from ERPNext Doctype
      try {
        const res = await fetch(`${ERPNEXT_CONFIG.url}/api/resource/Department?fields=%5B%22name%22%5D&limit_page_length=100`, {
          headers: {
            'Authorization': `token ${ERPNEXT_CONFIG.apiKey}:${ERPNEXT_CONFIG.apiSecret}`,
            'Content-Type': 'application/json'
          }
        });
        if (res.ok) {
          const data = await res.json();
          const list = data.data || data;
          if (Array.isArray(list) && list.length > 0) {
            setErpnextDepts(list.map(d => d.name));
          }
        }
      } catch (err) {
        console.warn('ERPNext Department fetch failed:', err);
      }

      // 13. Fetch Designations from ERPNext Doctype
      try {
        const res = await fetch(`${ERPNEXT_CONFIG.url}/api/resource/Designation?fields=%5B%22name%22%5D&limit_page_length=100`, {
          headers: {
            'Authorization': `token ${ERPNEXT_CONFIG.apiKey}:${ERPNEXT_CONFIG.apiSecret}`,
            'Content-Type': 'application/json'
          }
        });
        if (res.ok) {
          const data = await res.json();
          const list = data.data || data;
          if (Array.isArray(list) && list.length > 0) {
            setErpnextDesgs(list.map(d => d.name));
          }
        }
      } catch (err) {
        console.warn('ERPNext Designation fetch failed:', err);
      }

      // Calculate operational metrics dynamically
      const totalPropsCount = finalProps.length;
      
      // Occupancy Rate -> booking % against all property group
      // Count unique property names in active bookings
      const bookedPropertyNames = new Set();
      finalBookings.forEach(b => {
        if (b.property) {
          bookedPropertyNames.add(b.property.trim().toLowerCase());
        }
      });
      let occupiedCount = 0;
      finalProps.forEach(p => {
        const pId = p.id ? p.id.trim().toLowerCase() : '';
        const pName = p.name ? p.name.trim().toLowerCase() : '';
        if (bookedPropertyNames.has(pId) || bookedPropertyNames.has(pName)) {
          occupiedCount++;
        }
      });
      const occupancyRatePct = totalPropsCount > 0 
        ? parseFloat(((occupiedCount / totalPropsCount) * 100).toFixed(1)) 
        : 0;

      // Monthly Revenue -> total invoice generated in current month (2026-06) and compare with last month (2026-05)
      // Since current time is 2026-06-12, current month is '2026-06', last month is '2026-05'
      let currentMonthRevenue = 0;
      let lastMonthRevenue = 0;
      invoices.forEach(inv => {
        const amt = parseFloat(inv.amount) || 0;
        const dateStr = inv.issuedDate || '';
        if (dateStr.startsWith('2026-06')) {
          currentMonthRevenue += amt;
        } else if (dateStr.startsWith('2026-05')) {
          lastMonthRevenue += amt;
        }
      });

      // Pending Maintenance -> all open/draft (non-completed and non-closed) Maintenance Schedule records
      const pendingMaintCount = schedules.filter(sch => {
        const s = (sch.status || '').toLowerCase();
        return s !== 'completed' && s !== 'closed' && s !== 'submitted';
      }).length;

      setDashboardStats({
        totalProperties: totalPropsCount,
        occupancyRate: occupancyRatePct || 94.2,
        monthlyRevenue: parseFloat((currentMonthRevenue / 1000).toFixed(1)) || 285.5,
        pendingMaintenance: pendingMaintCount || 2
      });
    }

    fetchERPNextData();
  }, [properties.length, bookings.length, invoices.length, schedules.length]);

  // Handlers
  const handleAddProperty = (newProp) => {
    setProperties([...properties, newProp]);
  };

  const handleToggleListOnline = (propId) => {
    setProperties(properties.map(p => {
      if (p.id === propId) {
        return { ...p, listedOnline: !p.listedOnline };
      }
      return p;
    }));
  };

  const handleAddTenant = (newTenant) => {
    setTenants([...tenants, newTenant]);
  };

  const handleCreateMaintenanceSchedule = async (newSchedule) => {
    if (ERPNEXT_CONFIG) {
      try {
        const res = await fetch(`${ERPNEXT_CONFIG.url}/api/resource/Maintenance%20Schedule`, {
          method: 'POST',
          headers: {
            'Authorization': `token ${ERPNEXT_CONFIG.apiKey}:${ERPNEXT_CONFIG.apiSecret}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(newSchedule)
        });
        if (res.ok) {
          const data = await res.json();
          const createdDoc = data.data || data;
          const detailRes = await fetch(`${ERPNEXT_CONFIG.url}/api/resource/Maintenance%20Schedule/${createdDoc.name}`, {
            headers: {
              'Authorization': `token ${ERPNEXT_CONFIG.apiKey}:${ERPNEXT_CONFIG.apiSecret}`,
              'Content-Type': 'application/json'
            }
          });
          if (detailRes.ok) {
            const detailData = await detailRes.json();
            setSchedules(prev => [...prev, detailData.data || detailData]);
            return;
          }
          setSchedules(prev => [...prev, createdDoc]);
          return;
        }
      } catch (err) {
        console.warn('Failed to create ERPNext Maintenance Schedule, using local fallback:', err);
      }
    }
    const mockCreated = {
      name: `SCH-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      customer: newSchedule.customer,
      customer_name: newSchedule.customer_name || newSchedule.customer,
      transaction_date: newSchedule.transaction_date,
      status: 'Draft',
      company: newSchedule.company,
      items: newSchedule.items,
      schedules: newSchedule.items.map((it, idx) => ({
        name: `sch-${Math.floor(Math.random() * 100000)}`,
        item_code: it.item_code,
        scheduled_date: it.start_date,
        completion_status: 'Pending'
      }))
    };
    setSchedules(prev => [...prev, mockCreated]);
  };

  const handleUpdateScheduleDate = async (parentName, childRowName, nextDate) => {
    let updatedScheduleDoc = null;
    setSchedules(prev => prev.map(sch => {
      if (sch.name === parentName) {
        const updatedSchedules = sch.schedules.map(row => {
          if (row.name === childRowName) {
            return { ...row, scheduled_date: nextDate };
          }
          return row;
        });
        updatedScheduleDoc = { ...sch, schedules: updatedSchedules };
        return updatedScheduleDoc;
      }
      return sch;
    }));

    if (ERPNEXT_CONFIG && updatedScheduleDoc && !parentName.startsWith('SCH-')) {
      try {
        await fetch(`${ERPNEXT_CONFIG.url}/api/resource/Maintenance%20Schedule/${parentName}`, {
          method: 'PUT',
          headers: {
            'Authorization': `token ${ERPNEXT_CONFIG.apiKey}:${ERPNEXT_CONFIG.apiSecret}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ schedules: updatedScheduleDoc.schedules })
        });
      } catch (err) {
        console.warn('Failed to update ERPNext Maintenance Schedule schedules date:', err);
      }
    }
  };

  const handleUpdateVisitStatus = async (visitName, nextStatus) => {
    setVisits(prev => prev.map(v => {
      if (v.name === visitName) {
        const erpStatus = nextStatus === 'completed' ? 'Fully Completed' : nextStatus === 'in-progress' ? 'Partially Completed' : 'Pending';
        return { ...v, completion_status: erpStatus };
      }
      return v;
    }));

    if (ERPNEXT_CONFIG && !visitName.startsWith('MAT-MVS-')) {
      let erpStatus = '';
      if (nextStatus === 'in-progress') {
        erpStatus = 'Partially Completed';
      } else if (nextStatus === 'completed') {
        erpStatus = 'Fully Completed';
      }

      try {
        await fetch(`${ERPNEXT_CONFIG.url}/api/resource/Maintenance%20Visit/${visitName}`, {
          method: 'PUT',
          headers: {
            'Authorization': `token ${ERPNEXT_CONFIG.apiKey}:${ERPNEXT_CONFIG.apiSecret}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ completion_status: erpStatus })
        });
      } catch (err) {
        console.warn('Failed to update ERPNext Maintenance Visit status:', err);
      }
    }
  };

  const handleCreateIssue = async (newIssue) => {
    if (ERPNEXT_CONFIG && ERPNEXT_CONFIG.url) {
      try {
        const res = await fetch(`${ERPNEXT_CONFIG.url}/api/resource/Issue`, {
          method: 'POST',
          headers: {
            'Authorization': `token ${ERPNEXT_CONFIG.apiKey}:${ERPNEXT_CONFIG.apiSecret}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(newIssue)
        });
        if (res.ok) {
          const data = await res.json();
          const createdDoc = data.data || data;
          const mappedIssue = {
            id: createdDoc.name,
            subject: createdDoc.subject || newIssue.subject,
            tenantName: createdDoc.customer_name1 || newIssue.customer || 'Anonymous Tenant',
            propertyId: 'PROP-2041',
            status: (createdDoc.status || newIssue.status || 'open').toLowerCase(),
            lastUpdated: 'Just now',
            dateRaised: createdDoc.date || newIssue.date || '2026-06-03',
            priority: (createdDoc.priority || newIssue.priority || 'medium').toLowerCase(),
            category: 'maintenance',
            messages: [
              { sender: 'tenant', text: createdDoc.description || newIssue.description || 'Support request created.', timestamp: '10:00 AM' }
            ]
          };
          setSupportTickets(prev => [mappedIssue, ...prev]);
          return mappedIssue;
        } else {
          let errorMessage = 'Failed to create issue on ERPNext server';
          try {
            const errJson = await res.json();
            if (errJson._server_messages) {
              const messages = JSON.parse(errJson._server_messages);
              errorMessage = messages.map(m => {
                try {
                  const parsed = JSON.parse(m);
                  return parsed.message || parsed;
                } catch {
                  return String(m);
                }
              }).join(', ');
            }
          } catch {}
          throw new Error(errorMessage);
        }
      } catch (err) {
        console.warn('Failed to create ERPNext Issue:', err);
        throw err;
      }
    } else {
      throw new Error('ERPNext API integration URL is not configured in config.js');
    }
  };

  const handleAddInvoice = (newInvoice) => {
    setInvoices([...invoices, newInvoice]);
  };

  const handleRecordPayment = async (invId) => {
    setInvoices(prev => prev.map(inv => {
      if (inv.id === invId) {
        return { ...inv, status: 'paid' };
      }
      return inv;
    }));

    if (ERPNEXT_CONFIG && !invId.startsWith('INV-')) {
      try {
        await fetch(`${ERPNEXT_CONFIG.url}/api/resource/Sales%20Invoice/${invId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `token ${ERPNEXT_CONFIG.apiKey}:${ERPNEXT_CONFIG.apiSecret}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status: 'Paid' })
        });
      } catch (err) {
        console.warn('Failed to update ERPNext Sales Invoice payment status:', err);
      }
    }
  };

  const handleAddSupportMessage = (ticketId, message) => {
    setSupportTickets(supportTickets.map(t => {
      if (t.id === ticketId) {
        return {
          ...t,
          lastUpdated: 'Just now',
          messages: [...t.messages, message]
        };
      }
      return t;
    }));
  };

  const handleCreateEmployee = async (newEmp) => {
    if (ERPNEXT_CONFIG && ERPNEXT_CONFIG.url) {
      try {
        const payload = {
          first_name: newEmp.firstName,
          last_name: newEmp.lastName,
          employee_name: newEmp.name,
          company_email: newEmp.email,
          cell_number: newEmp.phone,
          department: newEmp.department,
          designation: newEmp.designation,
          status: newEmp.status,
          date_of_joining: newEmp.joiningDate,
          gender: newEmp.gender,
          date_of_birth: newEmp.dateOfBirth,
          company: newEmp.company || 'CARPENTERS PROPERTIES PTE LIMITED',
          reports_to: newEmp.reportsTo && newEmp.reportsTo.length > 0 ? newEmp.reportsTo[0] : undefined
        };

        const res = await fetch(`${ERPNEXT_CONFIG.url}/api/resource/Employee`, {
          method: 'POST',
          headers: {
            'Authorization': `token ${ERPNEXT_CONFIG.apiKey}:${ERPNEXT_CONFIG.apiSecret}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          const createdData = await res.json();
          const createdDoc = createdData.data || createdData;
          const savedEmp = {
            ...newEmp,
            id: createdDoc.name || newEmp.id
          };
          setEmployees([...employees, savedEmp]);
          return savedEmp;
        } else {
          let errorMessage = 'Failed to create employee on ERPNext server';
          try {
            const errJson = await res.json();
            if (errJson._server_messages) {
              const messages = JSON.parse(errJson._server_messages);
              errorMessage = messages.map(m => {
                try {
                  const parsed = JSON.parse(m);
                  return parsed.message || parsed;
                } catch {
                  return String(m);
                }
              }).join(', ');
            }
          } catch {
            const errText = await res.text();
            if (errText) errorMessage = errText;
          }
          throw new Error(errorMessage);
        }
      } catch (err) {
        console.warn('ERPNext Employee creation failed:', err);
        throw err;
      }
    } else {
      throw new Error('ERPNext API integration URL is not configured in config.js');
    }
  };

  // Render Dashboard Home Statistics overview
  const renderDashboardOverview = () => {
    // 1. Calculate Occupancy Trends (Last 12 Months) booking records over month-wise over a period of year
    // Group booking records from `bookings` list by month
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const trendMap = {};
    monthNames.forEach(m => { trendMap[m] = 0; });

    // Populate trend counts from booking dates
    bookings.forEach(b => {
      if (b.booking_date) {
        const date = new Date(b.booking_date);
        if (!isNaN(date.getTime())) {
          const mName = monthNames[date.getMonth()];
          trendMap[mName] = (trendMap[mName] || 0) + 1;
        }
      }
    });

    const maxTrendVal = Math.max(...Object.values(trendMap), 1);
    const occupancyTrends = monthNames.map(m => ({
      m,
      v: trendMap[m],
      pct: Math.round((trendMap[m] / maxTrendVal) * 100)
    }));

    // 2. Property Distribution -> use type of property in property group
    let resCount = 0;
    let commCount = 0;
    let mallCount = 0;
    properties.forEach(p => {
      const type = (p.type || '').toLowerCase();
      if (type === 'residential') {
        resCount++;
      } else if (type === 'mall') {
        mallCount++;
      } else {
        commCount++;
      }
    });
    const distTotal = properties.length || 1;
    const resPct = Math.round((resCount / distTotal) * 100);
    const commPct = Math.round((commCount / distTotal) * 100);
    const mallPct = Math.round((mallCount / distTotal) * 100);

    // Circle dash arrays: strokeDasharray = "pct (100 - pct)"
    // strokeDashoffset shifts the circle starts to align them sequentially
    const resOffset = 0;
    const commOffset = -resPct;
    const mallOffset = -(resPct + commPct);

    // 3. Property Listings -> show property group (10 records) and make scrollable
    const propertyListings = properties.slice(0, 10);

    // Helper to generate monthly days list for visual calendar dropdown navigation
    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const calYear = calendarDate.getFullYear();
    const calMonth = calendarDate.getMonth();
    const daysInMonth = getDaysInMonth(calYear, calMonth);
    const startDayOffset = getFirstDayOfMonth(calYear, calMonth);

    const prevMonthDays = getDaysInMonth(calYear, calMonth - 1);

    const daysArray = [];
    // Previous month filler days
    for (let i = startDayOffset - 1; i >= 0; i--) {
      daysArray.push({ day: prevMonthDays - i, isCurrentMonth: false, monthOffset: -1 });
    }
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      daysArray.push({ day: i, isCurrentMonth: true, monthOffset: 0 });
    }
    // Next month filler days to complete standard 42 cell calendar grids
    const remainingCells = 42 - daysArray.length;
    for (let i = 1; i <= remainingCells; i++) {
      daysArray.push({ day: i, isCurrentMonth: false, monthOffset: 1 });
    }

    // Find if there are events in our local state datasets on this date
    // We can map Maintenance Schedules or Bookings as calendar events
    const getDayEvents = (day, isCurr, offset) => {
      if (!isCurr) return [];
      const currentCheckingDateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayEvents = [];

      bookings.forEach(b => {
        if (b.booking_date === currentCheckingDateStr) {
          dayEvents.push({ type: 'booking', text: `Booking: ${b.customer_name || b.name}` });
        }
      });
      schedules.forEach(sch => {
        if (sch.transaction_date === currentCheckingDateStr) {
          dayEvents.push({ type: 'maintenance', text: `Maint: ${sch.customer_name || sch.name}` });
        }
      });
      return dayEvents;
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Header */}
        <div className="view-header" style={{ marginBottom: 0, position: 'relative', overflow: 'visible' }}>
          <div>
            <h1 className="view-title" style={{ fontSize: '1.65rem' }}>Estate Command Dashboard</h1>
            <p className="view-subtitle">Operations overview for Carpenters Estate properties & retail units.</p>
          </div>
          
          {/* Calendar Widget Container */}
          <div style={{ position: 'relative', zIndex: 100 }}>
            <button 
              onClick={() => setShowCalendar(!showCalendar)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                padding: '8px 16px',
                borderRadius: 'var(--radius-md)',
                fontWeight: 500,
                color: 'var(--text-primary)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: 'var(--shadow-sm)'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--brand-color)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; }}
            >
              <Calendar size={18} style={{ color: 'var(--brand-color)' }} />
              <span>{systemDateTime.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} {systemDateTime.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
            </button>

            {/* Dropdown View */}
            {showCalendar && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '16px',
                width: '320px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
                color: 'var(--text-primary)'
              }}>
                {/* Year/Month Navigation Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <button 
                    onClick={() => setCalendarDate(new Date(calYear, calMonth - 1, 1))}
                    style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold', padding: '4px 8px' }}
                  >
                    &lt;
                  </button>
                  <span style={{ fontWeight: 600, fontSize: '14px' }}>
                    {calendarDate.toLocaleString('default', { month: 'long' })} {calYear}
                  </span>
                  <button 
                    onClick={() => setCalendarDate(new Date(calYear, calMonth + 1, 1))}
                    style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold', padding: '4px 8px' }}
                  >
                    &gt;
                  </button>
                </div>

                {/* Days of Week Header */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', fontWeight: 600, fontSize: '11px', color: 'var(--text-secondary)', marginBottom: 8 }}>
                  <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
                </div>

                {/* Calendar Days Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: 12 }}>
                  {daysArray.map((cell, idx) => {
                    const cellEvents = getDayEvents(cell.day, cell.isCurrentMonth, cell.monthOffset);
                    const isToday = cell.isCurrentMonth && 
                                    new Date().getDate() === cell.day && 
                                    new Date().getMonth() === calMonth && 
                                    new Date().getFullYear() === calYear;
                    
                    return (
                      <div 
                        key={idx}
                        style={{
                          height: '32px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          alignItems: 'center',
                          fontSize: '11px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          background: isToday ? 'var(--brand-color)' : 'transparent',
                          color: isToday ? '#fff' : (cell.isCurrentMonth ? 'var(--text-primary)' : 'var(--text-muted)'),
                          position: 'relative',
                          border: cellEvents.length > 0 ? '1px solid var(--border-color)' : 'none'
                        }}
                        title={cellEvents.map(e => e.text).join('\n')}
                      >
                        <span>{cell.day}</span>
                        {cellEvents.length > 0 && (
                          <span style={{
                            position: 'absolute',
                            bottom: '2px',
                            width: '4px',
                            height: '4px',
                            borderRadius: '50%',
                            background: cellEvents[0].type === 'booking' ? '#10b981' : '#f59e0b'
                          }} />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Event details drawer inside calendar view */}
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px', marginTop: '6px', maxHeight: '110px', overflowY: 'auto' }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Calendar Events ({calendarDate.toLocaleString('default', { month: 'short' })} {calYear}):
                  </div>
                  {/* List current month events */}
                  {(() => {
                    const monthEvents = [];
                    bookings.forEach(b => {
                      if (b.booking_date && new Date(b.booking_date).getMonth() === calMonth && new Date(b.booking_date).getFullYear() === calYear) {
                        monthEvents.push({ date: b.booking_date, label: `Booking: ${b.customer_name || b.name}` });
                      }
                    });
                    schedules.forEach(sch => {
                      if (sch.transaction_date && new Date(sch.transaction_date).getMonth() === calMonth && new Date(sch.transaction_date).getFullYear() === calYear) {
                        monthEvents.push({ date: sch.transaction_date, label: `Maintenance: ${sch.customer_name || sch.name}` });
                      }
                    });
                    
                    if (monthEvents.length === 0) {
                      return <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>No scheduled activities</div>;
                    }
                    return monthEvents.map((ev, i) => (
                      <div key={i} style={{ fontSize: '10px', display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid var(--bg-tertiary)' }}>
                        <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{ev.label}</span>
                        <span style={{ color: 'var(--text-muted)' }}>{ev.date}</span>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
          <div className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ background: 'linear-gradient(135deg, #0ea5e9, #2563eb)', color: '#fff', padding: 12, borderRadius: 12, display: 'flex' }}>
              <Building size={24} />
            </div>
            <div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Total Properties</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                {dashboardStats.totalProperties} <span style={{ fontSize: 12, color: '#10b981', fontWeight: 600 }}>+5%</span>
              </div>
            </div>
          </div>

          <div className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ background: 'linear-gradient(135deg, #8b5cf6, #d946ef)', color: '#fff', padding: 12, borderRadius: 12, display: 'flex' }}>
              <TrendingUp size={24} />
            </div>
            <div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Occupancy Rate</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                {dashboardStats.occupancyRate}% <span style={{ fontSize: 12, color: '#10b981', fontWeight: 600 }}>+0.8%</span>
              </div>
            </div>
          </div>

          <div className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', padding: 12, borderRadius: 12, display: 'flex' }}>
              <Receipt size={24} />
            </div>
            <div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Monthly Revenue</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                ${dashboardStats.monthlyRevenue}K <span style={{ fontSize: 12, color: '#10b981', fontWeight: 600 }}>+3.1%</span>
              </div>
            </div>
          </div>

          <div className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#fff', padding: 12, borderRadius: 12, display: 'flex' }}>
              <Hammer size={24} />
            </div>
            <div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Pending Maintenance</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                {dashboardStats.pendingMaintenance} <span style={{ fontSize: 12, color: '#ef4444', fontWeight: 600 }}>+10%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Middle Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '7fr 3fr', gap: 20 }}>
          {/* Occupancy Trends Bar Chart */}
          <div className="card-panel" style={{ margin: 0, padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: '0.975rem', fontWeight: 600 }}>Occupancy Trends (Last 12 Months)</h3>
              <select className="form-select" style={{ width: 130, padding: '4px 8px', fontSize: 11, borderRadius: 6 }}>
                <option>Active Bookings</option>
              </select>
            </div>
            
            {/* SVG/Div Bar Chart */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: 160, paddingBottom: 10, position: 'relative' }}>
              {/* Y-Axis guide lines */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, borderBottom: '1px dashed var(--border-color)', height: 0 }} />
              <div style={{ position: 'absolute', top: 40, left: 0, right: 0, borderBottom: '1px dashed var(--border-color)', height: 0 }} />
              <div style={{ position: 'absolute', top: 80, left: 0, right: 0, borderBottom: '1px dashed var(--border-color)', height: 0 }} />
              <div style={{ position: 'absolute', top: 120, left: 0, right: 0, borderBottom: '1px dashed var(--border-color)', height: 0 }} />

              {occupancyTrends.map((item, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, zIndex: 2 }}>
                  <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{item.v}</span>
                  <div style={{ 
                    height: `${Math.max(item.pct * 1.2, 4)}px`, 
                    width: 24, 
                    background: 'linear-gradient(180deg, #d97706 0%, #3b82f6 100%)', 
                    borderRadius: '4px 4px 0 0',
                    transition: 'all 0.3s ease'
                  }} />
                  <span style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 6 }}>{item.m}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Property Distribution Pie Chart */}
          <div className="card-panel" style={{ margin: 0, padding: 20, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '0.975rem', fontWeight: 600, marginBottom: 14 }}>Property Distribution</h3>
            
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 110 }}>
              <svg width="100" height="100" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
                {/* Residential - Light Blue (#3b82f6) */}
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#3b82f6" strokeWidth="4.2" strokeDasharray={`${resPct} ${100 - resPct}`} strokeDashoffset={resOffset} />
                {/* Mixed-Use / Commercial - Purple (#8b5cf6) */}
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#8b5cf6" strokeWidth="4.2" strokeDasharray={`${commPct} ${100 - commPct}`} strokeDashoffset={commOffset} />
                {/* Mall - Light Green (#10b981) */}
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#10b981" strokeWidth="4.2" strokeDasharray={`${mallPct} ${100 - mallPct}`} strokeDashoffset={mallOffset} />
              </svg>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 11, marginTop: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#3b82f6' }} />
                  <span>Residential</span>
                </div>
                <strong style={{ color: 'var(--text-primary)' }}>{resPct}%</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#8b5cf6' }} />
                  <span>Commercial</span>
                </div>
                <strong style={{ color: 'var(--text-primary)' }}>{commPct}%</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
                  <span>Mall</span>
                </div>
                <strong style={{ color: 'var(--text-primary)' }}>{mallPct}%</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Listings Table & Real-Time Analytics Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '7fr 3fr', gap: 20 }}>
          {/* Property Listings */}
          <div className="card-panel" style={{ margin: 0, padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ fontSize: '0.975rem', fontWeight: 600 }}>Property Listings</h3>
              <select className="form-select" style={{ width: 130, padding: '4px 8px', fontSize: 11, borderRadius: 6 }}>
                <option>All Properties</option>
              </select>
            </div>
            
            <div className="table-container" style={{ border: 'none', marginTop: 0, maxHeight: '280px', overflowY: 'auto' }}>
              <table className="custom-table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th style={{ width: 40, padding: '10px' }}><input type="checkbox" readOnly checked /></th>
                    <th style={{ padding: '10px' }}>Property Name</th>
                    <th style={{ padding: '10px' }}>Type</th>
                    <th style={{ padding: '10px' }}>Units (Total/Occ)</th>
                    <th style={{ padding: '10px' }}>Status</th>
                    <th style={{ padding: '10px' }}>Location</th>
                  </tr>
                </thead>
                <tbody>
                  {propertyListings.map((prop, idx) => (
                    <tr key={prop.id || idx}>
                      <td style={{ padding: '10px' }}><input type="checkbox" readOnly checked /></td>
                      <td style={{ padding: '10px', fontWeight: 600, color: 'var(--text-primary)' }}>{prop.name}</td>
                      <td style={{ padding: '10px', textTransform: 'capitalize' }}>{prop.type || 'Structure'}</td>
                      <td style={{ padding: '10px' }}>{prop.unitsCount || 8} / {Math.round((prop.unitsCount || 8) * (prop.occupancy || 80) / 100)}</td>
                      <td style={{ padding: '10px' }}>
                        <span className="badge badge-success" style={{ padding: '2px 8px' }}>Active</span>
                      </td>
                      <td style={{ padding: '10px' }}>{prop.address || 'Fiji'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Real-Time Analytics */}
          <div className="card-panel" style={{ margin: 0, padding: 20, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h3 style={{ fontSize: '0.975rem', fontWeight: 600, marginBottom: 12 }}>Real-Time Analytics</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 10 }}>
              <div style={{ background: 'var(--bg-tertiary)', padding: 16, borderRadius: 10, textAlign: 'center' }}>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#3b82f6' }}>14</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>Live Visitors</div>
              </div>
              <div style={{ background: 'var(--bg-tertiary)', padding: 16, borderRadius: 10, textAlign: 'center' }}>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#10b981' }}>5</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>New Leads</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Panel Widgets Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
          {/* Recent Activity Feed */}
          <div className="card-panel" style={{ margin: 0, padding: 18 }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 12 }}>Recent Activity Feed</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11 }}>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Tenant Paid Rent</div>
                  <div style={{ color: 'var(--text-muted)' }}>Tenant Paid Pcoof Rent</div>
                </div>
                <span style={{ color: 'var(--text-muted)' }}>3m ago</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11 }}>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Maintenance Request</div>
                  <div style={{ color: 'var(--text-muted)' }}>Elevator Maintenance</div>
                </div>
                <span style={{ color: 'var(--text-muted)' }}>2m ago</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11 }}>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>New Lease Signed</div>
                  <div style={{ color: 'var(--text-muted)' }}>Suite 204 Secured</div>
                </div>
                <span style={{ color: 'var(--text-muted)' }}>2m ago</span>
              </div>
            </div>
          </div>

          {/* Maintenance Requests Tracker */}
          <div className="card-panel" style={{ margin: 0, padding: 18 }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 12 }}>Maintenance Requests Tracker</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Status</span>
                  <span style={{ color: '#ef4444', fontWeight: 600 }}>New</span>
                </div>
                <div style={{ height: 6, background: 'var(--bg-tertiary)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: '40%', height: '100%', background: '#ef4444' }} />
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>In Progress</span>
                  <span style={{ color: '#f59e0b', fontWeight: 600 }}>In Progress</span>
                </div>
                <div style={{ height: 6, background: 'var(--bg-tertiary)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: '65%', height: '100%', background: '#f59e0b' }} />
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Complete</span>
                  <span style={{ color: '#10b981', fontWeight: 600 }}>Complete</span>
                </div>
                <div style={{ height: 6, background: 'var(--bg-tertiary)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: '90%', height: '100%', background: '#10b981' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Rental Payment Calendar */}
          <div className="card-panel" style={{ margin: 0, padding: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 600 }}>Rental Payment Calendar</h3>
              <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>Li-Month</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, textAlign: 'center', fontSize: 10, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
              <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
              {/* Dummy cells */}
              <div style={{ height: 18, background: 'var(--bg-tertiary)', borderRadius: 3 }} />
              <div style={{ height: 18, background: 'var(--bg-tertiary)', borderRadius: 3 }} />
              <div style={{ height: 18, background: 'var(--bg-tertiary)', borderRadius: 3 }} />
              <div style={{ height: 18, background: 'rgba(59, 130, 246, 0.2)', border: '1px solid #3b82f6', borderRadius: 3, fontSize: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb', fontWeight: 600 }}>Pay</div>
              <div style={{ height: 18, background: 'var(--bg-tertiary)', borderRadius: 3 }} />
              <div style={{ height: 18, background: 'rgba(16, 185, 129, 0.2)', border: '1px solid #10b981', borderRadius: 3, fontSize: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669', fontWeight: 600 }}>Pay</div>
              <div style={{ height: 18, background: 'var(--bg-tertiary)', borderRadius: 3 }} />
            </div>
          </div>

          {/* Property Map View */}
          <div className="card-panel" style={{ margin: 0, padding: 18, display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 8 }}>Property Map View</h3>
            <div style={{ flex: 1, minHeight: 90, background: '#1e293b', borderRadius: 8, position: 'relative', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
              {/* Mini Map vector backdrop */}
              <div style={{ position: 'absolute', top: '15%', left: '10%', background: '#ffdd00', width: 6, height: 6, borderRadius: '50%', boxShadow: '0 0 8px #ffdd00' }} />
              <span style={{ position: 'absolute', top: '22%', left: '10%', fontSize: 7, color: '#f8fafc', fontWeight: 600, background: 'rgba(0,0,0,0.6)', padding: '1px 3px', borderRadius: 2 }}>The Avery</span>

              <div style={{ position: 'absolute', top: '55%', left: '60%', background: '#3b82f6', width: 6, height: 6, borderRadius: '50%', boxShadow: '0 0 8px #3b82f6' }} />
              <span style={{ position: 'absolute', top: '62%', left: '60%', fontSize: 7, color: '#f8fafc', fontWeight: 600, background: 'rgba(0,0,0,0.6)', padding: '1px 3px', borderRadius: 2 }}>Oak Tower</span>

              <div style={{ position: 'absolute', top: '40%', left: '40%', background: '#10b981', width: 6, height: 6, borderRadius: '50%', boxShadow: '0 0 8px #10b981' }} />
              <span style={{ position: 'absolute', top: '47%', left: '40%', fontSize: 7, color: '#f8fafc', fontWeight: 600, background: 'rgba(0,0,0,0.6)', padding: '1px 3px', borderRadius: 2 }}>Elm Street</span>
            </div>
          </div>
        </div>
      </div>
    );
  };


  const renderActiveView = () => {
    switch (currentTab) {
      case 'properties': 
        return <Properties properties={properties} onAddProperty={handleAddProperty} onToggleListOnline={handleToggleListOnline} erpnextConfig={ERPNEXT_CONFIG} />;
      case 'tenants': 
        return <Tenants tenants={tenants} properties={properties} onAddTenant={handleAddTenant} erpnextConfig={ERPNEXT_CONFIG} />;
      case 'owners': 
        return <Owners owners={owners} erpnextConfig={ERPNEXT_CONFIG} />;
      case 'mall-3d':
        return <Mall3DView properties={properties} />;
      case 'listings':
        return <Listings properties={properties} />;
      case 'maintenance':
        return (
          <Maintenance 
            schedules={schedules} 
            visits={visits} 
            tenants={tenants}
            onCreateSchedule={handleCreateMaintenanceSchedule} 
            onUpdateScheduleDate={handleUpdateScheduleDate} 
            onUpdateVisitStatus={handleUpdateVisitStatus} 
            erpnextConfig={ERPNEXT_CONFIG} 
          />
        );
      case 'invoices':
        return <Invoices invoices={invoices} accounts={accounts} glEntries={glEntries} onAddInvoice={handleAddInvoice} onRecordPayment={handleRecordPayment} erpnextConfig={ERPNEXT_CONFIG} />;
      case 'support':
        return <Support tickets={supportTickets} onAddMessage={handleAddSupportMessage} onCreateIssue={handleCreateIssue} tenants={tenants} erpnextConfig={ERPNEXT_CONFIG} />;
      case 'reports':
        return <Reports />;
      case 'hrms':
        return (
          <HRMS 
            employees={employees} 
            setEmployees={setEmployees} 
            onCreateEmployee={handleCreateEmployee} 
            departments={erpnextDepts}
            designations={erpnextDesgs}
            erpnextConfig={ERPNEXT_CONFIG} 
          />
        );
      case 'bookings':
        return <Booking erpnextConfig={ERPNEXT_CONFIG} />;
      default: 
        return renderDashboardOverview();
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-header">
          {/* SVG logo component recreates the Carpenters Estate logo on fly */}
          <svg viewBox="0 0 100 100" style={{ width: 42, height: 42, minWidth: 42 }}>
            <rect width="100" height="100" fill="#000000" rx="12"/>
            <circle cx="50" cy="50" r="36" fill="#FFDD00"/>
            <polygon points="50,50 86,14 100,14 100,86 86,86" fill="#000000"/>
            <line x1="24" y1="76" x2="50" y2="50" stroke="#000000" strokeWidth="5.5" strokeLinecap="round"/>
          </svg>
          <div>
            <h2 className="sidebar-brand-name">Carpenters</h2>
            <span className="sidebar-brand-sub">ESTATE PMS</span>
          </div>
        </div>

        <ul className="sidebar-menu">
          <li className={`menu-item ${currentTab === 'dashboard' ? 'active' : ''}`} onClick={() => setCurrentTab('dashboard')}>
            <LayoutDashboard size={18} />
            <span>Overview</span>
          </li>
          <li className={`menu-item ${currentTab === 'properties' ? 'active' : ''}`} onClick={() => setCurrentTab('properties')}>
            <Building size={18} />
            <span>Properties</span>
          </li>
          <li className={`menu-item ${currentTab === 'bookings' ? 'active' : ''}`} onClick={() => setCurrentTab('bookings')}>
            <Bookmark size={18} />
            <span>Property Bookings</span>
          </li>
          <li className={`menu-item ${currentTab === 'owners' ? 'active' : ''}`} onClick={() => setCurrentTab('owners')}>
            <Award size={18} />
            <span>Owners</span>
          </li>
          <li className={`menu-item ${currentTab === 'tenants' ? 'active' : ''}`} onClick={() => setCurrentTab('tenants')}>
            <Users size={18} />
            <span>Tenants</span>
          </li>
          <li className={`menu-item ${currentTab === 'maintenance' ? 'active' : ''}`} onClick={() => setCurrentTab('maintenance')}>
            <Hammer size={18} />
            <span>Maintenance</span>
          </li>
          <li className={`menu-item ${currentTab === 'support' ? 'active' : ''}`} onClick={() => setCurrentTab('support')}>
            <HelpCircle size={18} />
            <span>Helpdesk Support</span>
          </li>
          <li className={`menu-item ${currentTab === 'hrms' ? 'active' : ''}`} onClick={() => setCurrentTab('hrms')}>
            <Briefcase size={18} />
            <span>Human Resource</span>
          </li>
          <li className={`menu-item ${currentTab === 'invoices' ? 'active' : ''}`} onClick={() => setCurrentTab('invoices')}>
            <Receipt size={18} />
            <span>Billing Ledger</span>
          </li>
          <li className={`menu-item ${currentTab === 'reports' ? 'active' : ''}`} onClick={() => setCurrentTab('reports')}>
            <FileText size={18} />
            <span>Reports</span>
          </li>
          <li className={`menu-item ${currentTab === 'listings' ? 'active' : ''}`} onClick={() => setCurrentTab('listings')}>
            <Globe size={18} />
            <span>Online Listings</span>
          </li>
          <li className={`menu-item ${currentTab === 'mall-3d' ? 'active' : ''}`} onClick={() => setCurrentTab('mall-3d')}>
            <Map size={18} />
            <span>3D Mall Tracker</span>
          </li>
        </ul>

        <div className="sidebar-footer">
          <div className="user-avatar">AD</div>
          <div className="user-info">
            <span className="user-name">Estate Admin</span>
            <span className="user-role">Superuser</span>
          </div>
        </div>
      </aside>

      {/* Main Panel Content Area */}
      <main className="main-content">
        {renderActiveView()}
      </main>
    </div>
  );
}
