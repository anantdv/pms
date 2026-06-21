import React, { useState, useEffect } from 'react';
import { Hammer, User, Clock, CheckCircle, AlertTriangle, Plus, X, Calendar as CalendarIcon, List, BarChart3, ClipboardList, Building, Search, Activity, Settings, DollarSign, PenTool, Archive, Check, ArrowRight, UserCheck, ShieldCheck, Mail, Phone, MapPin, Award } from 'lucide-react';

export default function Maintenance({ 
  schedules = [], 
  visits = [], 
  tenants = [], 
  properties = [], 
  preSelectedProperty = null, 
  clearPreSelectedProperty, 
  preSelectedIssue = null,
  clearPreSelectedIssue,
  onCreateSchedule, 
  onUpdateScheduleDate, 
  onUpdateScheduleStatus,
  onUpdateVisitStatus, 
  erpnextConfig,
  employees = [],
  vendors = [],
  onAssignResource,
  onCreateVisit
}) {
  const [activeSection, setActiveSection] = useState('schedule'); // 'schedule', 'visit', 'work_order', 'technician', 'vendor', 'asset'
  const [viewMode, setViewMode] = useState('list'); // 'list', 'kanban', 'calendar' for Maintenance Schedule
  const [maintenanceSearch, setMaintenanceSearch] = useState('');
  
  // Selection states
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [selectedTechnician, setSelectedTechnician] = useState(null);

  // Calendar states
  const [calendarYear, setCalendarYear] = useState(2026);
  const [calendarMonth, setCalendarMonth] = useState(5); // June 2026
  const [selectedDateStr, setSelectedDateStr] = useState('2026-06-17');

  // Reassignment states
  const [reassignWOId, setReassignWOId] = useState(null);
  const [reassignTech, setReassignTech] = useState('');
  const [reassignVendor, setReassignVendor] = useState('');

  // Modals
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showWOModal, setShowWOModal] = useState(false);
  const [showConsumeModal, setShowConsumeModal] = useState(false);

  // Schedule Creation Form States
  const [schedType, setSchedType] = useState('PM Schedule'); // PM Schedule, On-demand, Breakdown
  const [schedIssueNumber, setSchedIssueNumber] = useState('');
  const [schedCustomer, setSchedCustomer] = useState('');
  const [schedPropertyId, setSchedPropertyId] = useState('');
  const [schedUnitSpec, setSchedUnitSpec] = useState('');
  const [schedStartDate, setSchedStartDate] = useState('2026-06-16');
  const [schedEndDate, setSchedEndDate] = useState('2026-07-16');
  const [schedPeriodicity, setSchedPeriodicity] = useState('Weekly');
  const [schedDescription, setSchedDescription] = useState('');
  const [schedVisitDate, setSchedVisitDate] = useState('2026-06-16');
  const [schedVisitTime, setSchedVisitTime] = useState('10:00 AM');
  const [schedAssignedTech, setSchedAssignedTech] = useState('');
  const [schedVisitStatus, setSchedVisitStatus] = useState('Pending');

  const [submittingSchedule, setSubmittingSchedule] = useState(false);
  const [scheduleStatusMessage, setScheduleStatusMessage] = useState(null);

  // Work Order Creation Form States
  const [woPriority, setWoPriority] = useState('Medium');
  const [woCategory, setWoCategory] = useState('Plumbing');
  const [woTechnician, setWoTechnician] = useState('');
  const [woVendor, setWoVendor] = useState('');
  const [woEstCost, setWoEstCost] = useState(0);
  const [woDescription, setWoDescription] = useState('');
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [woScheduleId, setWoScheduleId] = useState('');
  const [woProperty, setWoProperty] = useState('');
  const [woAssetId, setWoAssetId] = useState('');

  // Task DocType Specific Form States
  const [woSubject, setWoSubject] = useState('');
  const [woExpStartDate, setWoExpStartDate] = useState('');
  const [woExpEndDate, setWoExpEndDate] = useState('');
  const [woStatus, setWoStatus] = useState('Open');

  // Sched extra state
  const [schedAssetId, setSchedAssetId] = useState('');
  const [schedUnits, setSchedUnits] = useState([]);
  const [loadingSchedUnits, setLoadingSchedUnits] = useState(false);

  const getCsrfToken = () => {
    const cookieValue = document.cookie
      .split('; ')
      .find(row => row.startsWith('sid='))
      ?.split('=')[1];
    return cookieValue || '';
  };

  // Consume parts form states
  const [consumeItemCode, setConsumeItemCode] = useState('');
  const [consumeItemQty, setConsumeItemQty] = useState(1);

  // Database stores
  const [localSchedules, setLocalSchedules] = useState([]);
  
  const [workOrders, setWorkOrders] = useState([]);

  const [techProfiles, setTechProfiles] = useState([]);

  const [vendorDir, setVendorDir] = useState([]);

  const [assetsList, setAssetsList] = useState([]);

  const [stockItems, setStockItems] = useState([]);

  // Estimate list and form states
  const [woEstimates, setWoEstimates] = useState({}); // { [woId]: [ { id, type, itemCode, name, qty, cost, comment } ] }
  const [showEstimateModal, setShowEstimateModal] = useState(false);
  const [estType, setEstType] = useState('Material'); // Material or Labour
  const [estItemCode, setEstItemCode] = useState('');
  const [estName, setEstName] = useState('');
  const [estQty, setEstQty] = useState(1);
  const [estCost, setEstCost] = useState(0);
  const [estComment, setEstComment] = useState('');

  // Consume material list form states (Multiple items)
  const [consumeItemsList, setConsumeItemsList] = useState([
    { itemCode: '', qty: 1, comment: '' }
  ]);

  // Fetch active items from ERPNext DocType Item
  useEffect(() => {
    const fetchItems = async () => {
      if (!erpnextConfig || !erpnextConfig.url) {
        setStockItems([
          { code: 'ITEM-001', name: 'Copper Pipe 1/2 inch', qty: 50, unitCost: 15 },
          { code: 'ITEM-002', name: 'LED Ceiling Lamp 12W', qty: 30, unitCost: 25 },
          { code: 'ITEM-003', name: 'Water Tap Ceramic Valve', qty: 20, unitCost: 40 },
          { code: 'ITEM-004', name: 'Plywood Board 8x4', qty: 15, unitCost: 35 },
          { code: 'ITEM-005', name: 'Wall paint White 5L', qty: 10, unitCost: 60 }
        ]);
        return;
      }
      try {
        const res = await fetch(`${erpnextConfig.url}/api/resource/Item?fields=%5B%22name%22%2C%22item_name%22%2C%22val_rate%22%5D&limit_page_length=200`, {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        if (res.ok) {
          const json = await res.json();
          const list = json.data || json;
          if (Array.isArray(list)) {
            setStockItems(list.map(item => ({
              code: item.name,
              name: item.item_name || item.name,
              qty: 100, // mock inventory quantity
              unitCost: Number(item.val_rate) || 20
            })));
          }
        }
      } catch (err) {
        console.warn('Failed to fetch ERPNext items:', err);
      }
    };
    fetchItems();
  }, [erpnextConfig]);

  // Fetch active assets from ERPNext
  useEffect(() => {
    if (!erpnextConfig || !erpnextConfig.url) return;
    const fetchAssets = async () => {
      try {
        const res = await fetch(`${erpnextConfig.url}/api/resource/Asset?fields=%5B%22name%22%2C%22asset_name%22%2C%22item_code%22%2C%22status%22%2C%22location%22%5D&limit_page_length=200`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        if (res.ok) {
          const json = await res.json();
          const list = json.data || json;
          if (Array.isArray(list)) {
            setAssetsList(list.map(a => ({
              id: a.name,
              name: a.asset_name || a.name,
              item: a.item_code || 'HVAC System',
              status: a.status || 'Submitted',
              location: a.location || 'Stratford Apartments'
            })));
          }
        }
      } catch (err) {
        console.warn('Failed to fetch ERPNext Assets:', err);
      }
    };
    fetchAssets();
  }, [erpnextConfig]);

  // Fetch units for current selected property group in schedule form
  useEffect(() => {
    if (!schedPropertyId || !erpnextConfig || !erpnextConfig.url) {
      setSchedUnits([]);
      return;
    }
    let isMounted = true;
    const fetchUnits = async () => {
      setLoadingSchedUnits(true);
      try {
        const res = await fetch(`${erpnextConfig.url}/api/method/erpnext.api.get_units?property_group=${encodeURIComponent(schedPropertyId)}`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        if (res.ok && isMounted) {
          const json = await res.json();
          const list = json.message || json.data || [];
          setSchedUnits(list);
        }
      } catch (err) {
        console.warn('Failed to fetch units for Maintenance Schedule:', err);
      } finally {
        if (isMounted) setLoadingSchedUnits(false);
      }
    };
    fetchUnits();
    return () => {
      isMounted = false;
    };
  }, [schedPropertyId, erpnextConfig]);

  // Fetch Tasks from ERPNext (Linked to App Work Orders)
  useEffect(() => {
    if (!erpnextConfig || !erpnextConfig.url) return;
    const fetchWorkOrders = async () => {
      try {
        const res = await fetch(`${erpnextConfig.url}/api/resource/Task?fields=%5B%22name%22%2C%22subject%22%2C%22status%22%2C%22description%22%2C%22priority%22%2C%22exp_start_date%22%2C%22exp_end_date%22%5D&limit_page_length=200`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        if (res.ok) {
          const json = await res.json();
          const list = json.data || json;
          if (Array.isArray(list)) {
            setWorkOrders(list.map(t => ({
              id: t.name,
              property: getPropertyNameById(t.custom_property) || t.custom_property || "Stratford Court Apartments",
              unit: t.custom_asset || "Flat 1A",
              category: t.subject ? t.subject.split(' ')[0] : "General",
              technician: t.custom_technician || "None",
              vendor: t.custom_vendor || "None",
              estHours: 4,
              estCost: Number(t.custom_estimated_cost) || 150,
              actualCost: 0,
              status: t.status || "Open",
              description: t.description || t.subject || "",
              consumedItems: [],
              expStartDate: t.exp_start_date,
              expEndDate: t.exp_end_date,
              priority: t.priority,
              scheduleId: t.custom_maintenance_schedule
            })));
          }
        }
      } catch (err) {
        console.warn('ERPNext Task fetch failed, using fallback mock data:', err);
      }
    };
    fetchWorkOrders();
  }, [erpnextConfig, localSchedules]);

  useEffect(() => {
    if (schedules && schedules.length > 0) {
      setLocalSchedules(schedules);
    } else {
      setLocalSchedules([]);
    }
  }, [schedules]);

  useEffect(() => {
    if (employees && employees.length > 0) {
      setTechProfiles(employees.map(emp => ({
        id: emp.id || emp.name,
        name: emp.name,
        skill: emp.department || 'General Maintenance',
        certs: emp.designation || 'Technician',
        availability: emp.status === 'Active' ? 'Available' : 'On Leave',
        activeJobs: 0,
        phone: emp.phone || '+679 000 0000',
        email: emp.email || 'tech@carpenterestate.org',
        img: emp.image || ''
      })));
    } else {
      setTechProfiles([]);
    }
  }, [employees]);

  useEffect(() => {
    if (vendors && vendors.length > 0) {
      setVendorDir(vendors.map(v => ({
        id: v.id,
        name: v.name,
        group: v.supplier_group || 'Local',
        type: v.supplier_type || 'Services',
        rating: 4.5,
        quotesCount: 0,
        phone: v.phone || '+679 000 0000',
        email: v.email || 'vendor@carpenterestate.org',
        address: v.address || 'Fiji'
      })));
    } else {
      setVendorDir([]);
    }
  }, [vendors]);

  useEffect(() => {
    if (preSelectedProperty) {
      setSchedPropertyId(preSelectedProperty.id);
      const tenantForProp = tenants.find(t => t.propertyId === preSelectedProperty.id);
      if (tenantForProp) {
        setSchedCustomer(tenantForProp.id);
      }
      setShowScheduleModal(true);
      clearPreSelectedProperty();
    }
  }, [preSelectedProperty, tenants, clearPreSelectedProperty]);

  useEffect(() => {
    if (preSelectedIssue) {
      setSchedIssueNumber(preSelectedIssue.id || '');
      setSchedDescription(preSelectedIssue.subject || '');
      
      const matchedTenant = tenants.find(t => t.name === preSelectedIssue.tenantName || t.id === preSelectedIssue.customerId || t.name === preSelectedIssue.customerId);
      if (matchedTenant) {
        setSchedCustomer(matchedTenant.id);
        if (matchedTenant.propertyId) {
          setSchedPropertyId(matchedTenant.propertyId);
        }
        if (matchedTenant.unitSpec) {
          setSchedUnitSpec(matchedTenant.unitSpec);
        }
      }
      setShowScheduleModal(true);
      if (clearPreSelectedIssue) {
        clearPreSelectedIssue();
      }
    }
  }, [preSelectedIssue, tenants, clearPreSelectedIssue]);

  const getPropertyByUnit = (unitId) => {
    const tenant = (tenants || []).find(t => t.unitSpec === unitId || t.id === unitId || t.name === unitId);
    if (tenant) {
      return tenant.propertyGroup || tenant.propertyName;
    }
    const prop = (properties || []).find(p => p.id === unitId || p.name === unitId);
    if (prop) return prop.name;
    return 'N/A';
  };

  const getPropertyNameById = (propId) => {
    const prop = (properties || []).find(p => p.id === propId || p.name === propId);
    return prop ? prop.name : "Stratford Court Apartments";
  };

  // Reassign handler
  const handleReassignSubmit = async (woId) => {
    const targetTech = reassignTech;
    const targetVendor = reassignVendor;

    setWorkOrders(prev => prev.map(wo => {
      if (wo.id === woId) {
        return { 
          ...wo, 
          technician: targetTech || wo.technician, 
          vendor: targetVendor || wo.vendor 
        };
      }
      return wo;
    }));

    setSelectedWorkOrder(prev => {
      if (prev && prev.id === woId) {
        return { 
          ...prev, 
          technician: targetTech || prev.technician, 
          vendor: targetVendor || prev.vendor 
        };
      }
      return prev;
    });

    setReassignWOId(null);
    setReassignTech('');
    setReassignVendor('');

    if (erpnextConfig && erpnextConfig.url && !woId.startsWith('TASK-')) {
      try {
        const assignee = targetTech || targetVendor;
        const assigneeEmail = (employees.find(e => e.name === targetTech)?.email) || 
                              (vendors.find(v => v.name === targetVendor)?.email) || 
                              (vendors.find(v => v.id === targetVendor)?.email) ||
                              assignee;

        if (assigneeEmail) {
          const csrfToken = getCsrfToken();
          const res = await fetch(`${erpnextConfig.url}/api/method/frappe.desk.form.assign_to.add`, {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              ...(csrfToken ? { 'X-Frappe-CSRF-Token': csrfToken } : {})
            },
            body: new URLSearchParams({
              doctype: 'Task',
              name: woId,
              assign_to: JSON.stringify([assigneeEmail])
            })
          });
          if (res.ok) {
            alert(`Task successfully assigned to ${assigneeEmail} in ERPNext!`);
          } else {
            console.warn('Assignment API returned status:', res.status, await res.text());
          }
        }
      } catch (err) {
        console.warn('Failed to assign task in ERPNext:', err);
      }
    }
  };

  // Drag & drop logic
  const handleDragStart = (e, scheduleName) => {
    e.dataTransfer.setData('text/plain', scheduleName);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetStatus) => {
    e.preventDefault();
    const scheduleName = e.dataTransfer.getData('text/plain');
    if (scheduleName) {
      setLocalSchedules(prev => prev.map(s => s.name === scheduleName ? { ...s, status: targetStatus } : s));
      if (onUpdateScheduleStatus) {
        onUpdateScheduleStatus(scheduleName, targetStatus);
      }
    }
  };

  // Create Maintenance Schedule Submit
  const handleCreateScheduleSubmit = async (e) => {
    e.preventDefault();
    setSubmittingSchedule(true);
    setScheduleStatusMessage(null);

    const tenantObj = tenants.find(t => t.id === schedCustomer);
    const customerName = tenantObj ? tenantObj.name : schedCustomer;
    const propName = getPropertyNameById(schedPropertyId);

    const payload = {
      customer: schedCustomer,
      customer_name: customerName,
      transaction_date: schedStartDate,
      transaction_time: schedVisitTime,
      type: schedType,
      custom_property: schedPropertyId,
      propertyName: propName,
      custom_asset: schedAssetId,
      custom_issue: schedIssueNumber,
      status: schedVisitStatus === 'Pending' ? 'Draft' : (schedVisitStatus === 'Completed' || schedVisitStatus === 'In Progress' ? 'Submitted' : 'Draft'),
      items: [
        {
          item_code: schedUnitSpec || 'General Item',
          start_date: schedStartDate,
          end_date: schedEndDate,
          periodicity: schedPeriodicity,
          description: schedDescription,
          asset: schedAssetId
        }
      ],
      schedules: [
        {
          item_code: schedUnitSpec || 'General Item',
          scheduled_date: schedStartDate,
          completion_status: schedVisitStatus
        }
      ],
      // Visit Details logic fields
      visit_date: schedVisitDate,
      visit_time: schedVisitTime,
      assigned_technician: schedAssignedTech,
      visit_status: schedVisitStatus
    };

    try {
      if (onCreateSchedule) {
        await onCreateSchedule(payload);
      }

      // Add to local state
      const newSched = {
        name: `MS-000${localSchedules.length + 1}`,
        customer: schedCustomer,
        customer_name: customerName,
        transaction_date: schedStartDate,
        custom_property: schedPropertyId,
        type: schedType,
        status: schedVisitStatus,
        items: [
          {
            item_code: schedUnitSpec,
            start_date: schedStartDate,
            end_date: schedEndDate,
            periodicity: schedPeriodicity,
            description: schedDescription
          }
        ]
      };
      setLocalSchedules([newSched, ...localSchedules]);

      setScheduleStatusMessage({ type: 'success', text: 'Maintenance Schedule created & Visit scheduled successfully!' });
      setTimeout(() => {
        setShowScheduleModal(false);
        setScheduleStatusMessage(null);
      }, 1200);
    } catch (err) {
      setScheduleStatusMessage({ type: 'error', text: err.message || 'Failed to sync with ERPNext' });
    } finally {
      setSubmittingSchedule(false);
    }
  };

  const handleWOStatusChange = async (woId, newStatus) => {
    let erpStatus = newStatus;
    if (newStatus === 'In Progress') erpStatus = 'Working';
    else if (newStatus === 'Completed') erpStatus = 'Completed';
    else if (newStatus === 'Open' || newStatus === 'Assigned') erpStatus = 'Open';

    setWorkOrders(prev => prev.map(wo => {
      if (wo.id === woId) {
        let actual = wo.actualCost;
        if (newStatus === 'Completed' && wo.actualCost === 0) {
          actual = wo.estCost;
        }
        return { ...wo, status: newStatus, actualCost: actual };
      }
      return wo;
    }));

    setSelectedWorkOrder(prev => {
      if (prev && prev.id === woId) {
        let actual = prev.actualCost;
        if (newStatus === 'Completed' && prev.actualCost === 0) {
          actual = prev.estCost;
        }
        return { ...prev, status: newStatus, actualCost: actual };
      }
      return prev;
    });

    if (erpnextConfig && erpnextConfig.url && !woId.startsWith('TASK-')) {
      try {
        const csrfToken = getCsrfToken();
        await fetch(`${erpnextConfig.url}/api/resource/Task/${woId}`, {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            ...(csrfToken ? { 'X-Frappe-CSRF-Token': csrfToken } : {})
          },
          body: JSON.stringify({ status: erpStatus })
        });
      } catch (err) {
        console.warn('Failed to update Task status in ERPNext:', err);
      }
    }
  };

  const handleCreateWO = async (e) => {
    e.preventDefault();
    const payload = {
      subject: woSubject || `Maint: ${woCategory} - ${woScheduleId}`,
      description: woDescription || `Work Order for maintenance schedule: ${woScheduleId}`,
      status: woStatus,
      priority: woPriority === 'Critical' ? 'Urgent' : woPriority,
      exp_start_date: woExpStartDate || new Date().toISOString().split('T')[0],
      exp_end_date: woExpEndDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      custom_property: woProperty || selectedPropertyId,
      custom_technician: woTechnician,
      custom_vendor: woVendor,
      custom_estimated_cost: Number(woEstCost),
      custom_maintenance_schedule: woScheduleId,
      custom_asset: woAssetId
    };

    if (erpnextConfig && erpnextConfig.url) {
      try {
        const csrfToken = getCsrfToken();
        const res = await fetch(`${erpnextConfig.url}/api/resource/Task`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            ...(csrfToken ? { 'X-Frappe-CSRF-Token': csrfToken } : {})
          },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const json = await res.json();
          const doc = json.data || json;
          const newWO = {
            id: doc.name,
            relatedTicket: woScheduleId || "Manual Request",
            property: getPropertyNameById(payload.custom_property) || payload.custom_property || "Stratford Court Apartments",
            unit: payload.custom_asset || "Flat 1A",
            category: woCategory,
            technician: woTechnician || "None",
            vendor: woVendor || "None",
            estHours: 4,
            estCost: Number(woEstCost),
            actualCost: 0,
            status: payload.status,
            description: payload.description,
            consumedItems: [],
            expStartDate: payload.exp_start_date,
            expEndDate: payload.exp_end_date,
            priority: payload.priority
          };
          setWorkOrders([newWO, ...workOrders]);
          setShowWOModal(false);
        } else {
          const errMsg = await res.text();
          alert(`Failed to create Task in ERPNext: ${errMsg}`);
        }
      } catch (err) {
        console.error(err);
        alert(`Error creating Task: ${err.message}`);
      }
    } else {
      const newWO = {
        id: `TASK-2026-000${workOrders.length + 1}`,
        relatedTicket: woScheduleId || "Manual Request",
        property: getPropertyNameById(payload.custom_property) || payload.custom_property || "Stratford Court Apartments",
        unit: payload.custom_asset || "Flat 1A",
        category: woCategory,
        technician: woTechnician || "None",
        vendor: woVendor || "None",
        estHours: 4,
        estCost: Number(woEstCost),
        actualCost: 0,
        status: payload.status,
        description: payload.description,
        consumedItems: [],
        expStartDate: payload.exp_start_date,
        expEndDate: payload.exp_end_date,
        priority: payload.priority
      };
      setWorkOrders([newWO, ...workOrders]);
      setShowWOModal(false);
    }
  };

  const handleConsumeItemSubmit = (e) => {
    e.preventDefault();
    if (!selectedWorkOrder) return;

    let totalCost = 0;
    const newConsumedItems = [];

    for (const entry of consumeItemsList) {
      if (!entry.itemCode) continue;
      const item = stockItems.find(s => s.code === entry.itemCode);
      if (!item) continue;

      if (item.qty < entry.qty) {
        alert(`Insufficient stock for item: ${item.name}. Available: ${item.qty}, Requested: ${entry.qty}`);
        return;
      }

      setStockItems(prev => prev.map(s => s.code === entry.itemCode ? { ...s, qty: s.qty - entry.qty } : s));

      const cost = item.unitCost * entry.qty;
      totalCost += cost;

      newConsumedItems.push({
        item: item.name,
        itemCode: entry.itemCode,
        qty: entry.qty,
        cost: cost,
        comment: entry.comment || ''
      });
    }

    if (newConsumedItems.length === 0) return;

    setWorkOrders(prev => prev.map(wo => {
      if (wo.id === selectedWorkOrder.id) {
        const updatedItems = [...(wo.consumedItems || []), ...newConsumedItems];
        return { ...wo, consumedItems: updatedItems, actualCost: wo.actualCost + totalCost };
      }
      return wo;
    }));

    setSelectedWorkOrder(prev => {
      if (prev && prev.id === selectedWorkOrder.id) {
        return {
          ...prev,
          consumedItems: [...(prev.consumedItems || []), ...newConsumedItems],
          actualCost: prev.actualCost + totalCost
        };
      }
      return prev;
    });

    setConsumeItemsList([{ itemCode: '', qty: 1, comment: '' }]);
    setShowConsumeModal(false);
  };

  const handleAddEstimateSubmit = (e) => {
    e.preventDefault();
    if (!selectedWorkOrder) return;

    let finalName = estName;
    let finalCost = Number(estCost);

    if (estType === 'Material' && estItemCode) {
      const matchedItem = stockItems.find(s => s.code === estItemCode);
      if (matchedItem) {
        finalName = matchedItem.name;
        finalCost = matchedItem.unitCost * estQty;
      }
    }

    const newEstItem = {
      id: `EST-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      type: estType,
      itemCode: estType === 'Material' ? estItemCode : '',
      name: finalName || (estType === 'Labour' ? 'General Labour' : 'Material Item'),
      qty: Number(estQty) || 1,
      cost: finalCost,
      comment: estComment || ''
    };

    setWoEstimates(prev => {
      const listForWO = prev[selectedWorkOrder.id] || [];
      return {
        ...prev,
        [selectedWorkOrder.id]: [...listForWO, newEstItem]
      };
    });

    setEstType('Material');
    setEstItemCode('');
    setEstName('');
    setEstQty(1);
    setEstCost(0);
    setEstComment('');
    setShowEstimateModal(false);
  };

  const handleGenerateQuotation = async (woId) => {
    const estimates = woEstimates[woId] || [];
    if (estimates.length === 0) {
      alert("No estimate items to generate quotation!");
      return;
    }
    
    const customerId = selectedWorkOrder.customerId || (tenants && tenants.length > 0 ? tenants[0].id : 'Customer-N/A');

    const payload = {
      quotation_to: 'Customer',
      party_name: customerId,
      transaction_date: new Date().toISOString().split('T')[0],
      company: 'CARPENTERS PROPERTIES PTE LIMITED',
      valid_till: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      items: estimates.map(e => ({
        item_code: e.itemCode || 'General Item',
        qty: Number(e.qty) || 1,
        rate: Number(e.cost) / (Number(e.qty) || 1),
        description: e.comment || e.name || 'Estimate Item'
      }))
    };

    if (erpnextConfig && erpnextConfig.url) {
      try {
        const csrfToken = getCsrfToken();
        const res = await fetch(`${erpnextConfig.url}/api/resource/Quotation`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            ...(csrfToken ? { 'X-Frappe-CSRF-Token': csrfToken } : {})
          },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const json = await res.json();
          alert(`Quotation ${json.data?.name || 'created'} generated successfully in ERPNext!`);
        } else {
          const errMsg = await res.text();
          console.warn('Failed to generate Quotation in ERPNext:', errMsg);
          alert(`Failed to generate Quotation: ${errMsg}`);
        }
      } catch (err) {
        console.error('Error generating quotation:', err);
        alert(`Error: ${err.message}`);
      }
    } else {
      alert(`Simulation Mode: Quotation created for customer ${customerId} with ${estimates.length} items!`);
    }
  };

  const filteredSchedules = localSchedules.filter(sch => {
    const term = maintenanceSearch.toLowerCase();
    const firstItemCode = sch.items && sch.items.length > 0 ? sch.items[0].item_code : '';
    const propName = getPropertyNameById(sch.custom_property) || '';
    return (
      sch.name.toLowerCase().includes(term) ||
      (sch.customer_name || sch.customer || '').toLowerCase().includes(term) ||
      propName.toLowerCase().includes(term) ||
      (sch.type || '').toLowerCase().includes(term)
    );
  });

  return (
    <div>
      <div className="view-header" style={{ flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className="view-title">Maintenance Ops & Facility management</h1>
          <p className="view-subtitle">Roster preventative maintenance visits, manage work orders, assign tasks, and track logs.</p>
        </div>

        {/* Navigation Selector */}
        <div style={{ display: 'flex', background: 'var(--bg-secondary)', padding: 4, borderRadius: 8, border: '1px solid var(--border-color)', flexWrap: 'wrap' }}>
          <button className={`btn btn-sm ${activeSection === 'schedule' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveSection('schedule')}>
            Maintenance Schedule
          </button>
          <button className={`btn btn-sm ${activeSection === 'work_order' ? 'btn-primary' : 'btn-secondary'}`} style={{ marginLeft: 4 }} onClick={() => setActiveSection('work_order')}>
            Work Orders
          </button>
          <button className={`btn btn-sm ${activeSection === 'technician' ? 'btn-primary' : 'btn-secondary'}`} style={{ marginLeft: 4 }} onClick={() => setActiveSection('technician')}>
            Technicians
          </button>
          <button className={`btn btn-sm ${activeSection === 'vendor' ? 'btn-primary' : 'btn-secondary'}`} style={{ marginLeft: 4 }} onClick={() => setActiveSection('vendor')}>
            Vendors
          </button>
          <button className={`btn btn-sm ${activeSection === 'asset' ? 'btn-primary' : 'btn-secondary'}`} style={{ marginLeft: 4 }} onClick={() => setActiveSection('asset')}>
            Assets
          </button>
        </div>
      </div>

      {/* SECTION 1: MAINTENANCE SCHEDULES */}
      {activeSection === 'schedule' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', flexWrap: 'wrap', gap: 10 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <Search size={16} />
                <input 
                  type="text" 
                  placeholder="Search schedules..." 
                  className="form-input" 
                  style={{ width: 200, padding: '4px 10px' }}
                  value={maintenanceSearch}
                  onChange={(e) => setMaintenanceSearch(e.target.value)}
                />
              </div>

              {/* View mode toggle */}
              <div style={{ display: 'flex', background: 'var(--bg-tertiary)', padding: 2, borderRadius: 6 }}>
                {['list', 'kanban', 'calendar'].map(mode => (
                  <button 
                    key={mode} 
                    className={`btn btn-sm ${viewMode === mode ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '3px 8px', fontSize: 10, textTransform: 'capitalize' }}
                    onClick={() => setViewMode(mode)}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
            
            <button className="btn btn-primary btn-sm" onClick={() => setShowScheduleModal(true)}>
              <Plus size={14} /> New Schedule
            </button>
          </div>

          {/* Rendering based on viewMode */}
          <div className="grid-2col" style={{ gridTemplateColumns: selectedSchedule ? '60% calc(40% - 24px)' : '1fr', gap: 24 }}>
            
            {viewMode === 'list' && (
              <div className="card-panel" style={{ padding: 0 }}>
                <div className="table-container">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Schedule ID</th>
                        <th>Type</th>
                        <th>Tenant / Partner</th>
                        <th>Property Group</th>
                        <th>Periodicity</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSchedules.map(sch => {
                        const firstItem = sch.items && sch.items.length > 0 ? sch.items[0] : null;
                        return (
                          <tr key={sch.name} onClick={() => setSelectedSchedule(sch)} style={{ cursor: 'pointer', backgroundColor: selectedSchedule?.name === sch.name ? 'var(--bg-accent-alpha)' : '' }}>
                            <td style={{ fontWeight: 600, color: 'var(--brand-color)' }}>{sch.name}</td>
                            <td><span className="badge badge-secondary" style={{ textTransform: 'none' }}>{sch.type || 'PM Schedule'}</span></td>
                            <td>{sch.customer_name || sch.customer}</td>
                            <td>{getPropertyNameById(sch.custom_property)}</td>
                            <td>{firstItem ? firstItem.periodicity : 'Weekly'}</td>
                            <td>
                              <span className={`badge ${sch.status === 'Completed' ? 'badge-success' : 'badge-warning'}`}>
                                {sch.status || 'Pending'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {viewMode === 'kanban' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                {['Pending', 'In Progress', 'Completed'].map(status => {
                  const statusSchedules = filteredSchedules.filter(s => {
                    const rawStatus = (s.status || '').toLowerCase();
                    let norm = 'Pending';
                    if (rawStatus === 'completed' || rawStatus === 'closed') {
                      norm = 'Completed';
                    } else if (rawStatus === 'in progress' || rawStatus === 'submitted') {
                      norm = 'In Progress';
                    }
                    return norm === status;
                  });
                  return (
                    <div 
                      key={status} 
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, status)}
                      style={{ background: 'var(--bg-tertiary)', padding: 14, borderRadius: 8, minHeight: 300 }}
                    >
                      <h3 style={{ fontSize: 13, marginBottom: 10, borderBottom: '2px solid var(--border-color)', paddingBottom: 6 }}>
                        {status} ({statusSchedules.length})
                      </h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {statusSchedules.map(sch => (
                          <div 
                            key={sch.name} 
                            draggable 
                            onDragStart={(e) => handleDragStart(e, sch.name)}
                            onClick={() => setSelectedSchedule(sch)}
                            style={{ background: 'var(--bg-secondary)', padding: 10, borderRadius: 6, border: '1px solid var(--border-color)', cursor: 'grab' }}
                          >
                            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--brand-color)' }}>{sch.name}</div>
                            <div style={{ fontSize: 12, fontWeight: 600 }}>{sch.customer_name || sch.customer}</div>
                            <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>Property: {getPropertyNameById(sch.custom_property)}</div>
                            <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>Type: {sch.type}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {viewMode === 'calendar' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: '100%' }}>
                <div className="card-panel" style={{ padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h3 style={{ fontSize: 14, margin: 0 }}>
                      {new Date(calendarYear, calendarMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </h3>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button 
                        className="btn btn-secondary btn-xs"
                        onClick={() => {
                          if (calendarMonth === 0) {
                            setCalendarMonth(11);
                            setCalendarYear(y => y - 1);
                          } else {
                            setCalendarMonth(m => m - 1);
                          }
                        }}
                      >
                        Prev
                      </button>
                      <button 
                        className="btn btn-secondary btn-xs"
                        onClick={() => {
                          if (calendarMonth === 11) {
                            setCalendarMonth(0);
                            setCalendarYear(y => y + 1);
                          } else {
                            setCalendarMonth(m => m + 1);
                          }
                        }}
                      >
                        Next
                      </button>
                    </div>
                  </div>

                  {/* Days of week header */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, textAlign: 'center', fontWeight: 600, fontSize: 11, marginBottom: 8, color: 'var(--text-secondary)' }}>
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d}>{d}</div>)}
                  </div>

                  {/* Calendar cells grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
                    {(() => {
                      const firstDay = new Date(calendarYear, calendarMonth, 1).getDay();
                      const totalDays = new Date(calendarYear, calendarMonth + 1, 0).getDate();
                      const cells = [];
                      
                      // Empty cells before first day
                      for (let i = 0; i < firstDay; i++) {
                        cells.push(<div key={`empty-${i}`} style={{ height: 50, border: '1px solid transparent' }}></div>);
                      }

                      // Month days
                      for (let day = 1; day <= totalDays; day++) {
                        const dateStr = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                        const daySchedules = filteredSchedules.filter(s => s.transaction_date === dateStr);
                        const isSelected = selectedDateStr === dateStr;
                        const isToday = calendarYear === 2026 && calendarMonth === 5 && day === 17; // June 17, 2026

                        cells.push(
                          <div 
                            key={`day-${day}`}
                            onClick={() => setSelectedDateStr(dateStr)}
                            style={{ 
                              height: 50, 
                              border: `1px solid ${isSelected ? 'var(--brand-color)' : 'var(--border-color)'}`,
                              borderRadius: 4,
                              background: isSelected ? 'var(--bg-accent-alpha)' : isToday ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
                              padding: 4,
                              cursor: 'pointer',
                              position: 'relative',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'space-between',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <span style={{ fontSize: 10, fontWeight: isToday || isSelected ? 700 : 400 }}>{day}</span>
                            {daySchedules.length > 0 && (
                              <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                {daySchedules.map((s, idx) => (
                                  <span 
                                    key={s.name} 
                                    style={{ 
                                      width: 6, 
                                      height: 6, 
                                      borderRadius: '50%', 
                                      background: s.status === 'Completed' ? '#10b981' : '#f59e0b',
                                      display: 'inline-block' 
                                    }}
                                    title={`${s.name}: ${s.type}`}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      }
                      return cells;
                    })()}
                  </div>
                </div>

                {/* Selected day schedules details */}
                <div className="card-panel" style={{ padding: 16 }}>
                  <h4 style={{ fontSize: 12, marginBottom: 10, color: 'var(--text-secondary)' }}>
                    Schedules for: <strong>{selectedDateStr}</strong>
                  </h4>
                  {(() => {
                    const daySchedules = filteredSchedules.filter(s => s.transaction_date === selectedDateStr);
                    if (daySchedules.length === 0) {
                      return <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>No schedules planned for this day.</div>;
                    }
                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {daySchedules.map(sch => (
                          <div 
                            key={sch.name} 
                            onClick={() => setSelectedSchedule(sch)}
                            style={{ 
                              padding: 10, 
                              background: 'var(--bg-tertiary)', 
                              borderLeft: '4px solid var(--brand-color)', 
                              borderRadius: 4, 
                              cursor: 'pointer',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}
                          >
                            <div>
                              <strong style={{ fontSize: 12 }}>{sch.name} ({sch.type})</strong>
                              <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>
                                Tenant: {sch.customer_name || sch.customer} | Prop: {getPropertyNameById(sch.custom_property)}
                              </div>
                            </div>
                            <span className={`badge ${sch.status === 'Completed' ? 'badge-success' : 'badge-warning'}`}>
                              {sch.status || 'Pending'}
                            </span>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}


            {selectedSchedule && (
              <div className="card-panel" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: 10 }}>
                  <strong>{selectedSchedule.name}</strong>
                  <button onClick={() => setSelectedSchedule(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={16} /></button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12 }}>
                  <div>Type: <strong>{selectedSchedule.type}</strong></div>
                  <div>Property: <strong>{getPropertyNameById(selectedSchedule.custom_property)}</strong></div>
                  <div>Tenant Name: <strong>{selectedSchedule.customer_name}</strong></div>
                  <div>Start Date: <strong>{selectedSchedule.transaction_date}</strong></div>
                  <div>Status: <strong>{selectedSchedule.status || 'Pending'}</strong></div>
                </div>
                <button 
                  className="btn btn-primary btn-sm" 
                  style={{ marginTop: 10, width: '100%', background: '#ffdd00', color: '#000000', fontWeight: 600 }}
                  onClick={() => {
                    setWoProperty(selectedSchedule.custom_property);
                    setSelectedPropertyId(selectedSchedule.custom_property);
                    setWoDescription(`Preventative maintenance for schedule: ${selectedSchedule.name}. Tenant: ${selectedSchedule.customer_name || 'N/A'}`);
                    setWoCategory(selectedSchedule.type || 'General');
                    setWoScheduleId(selectedSchedule.name);
                    setWoAssetId(selectedSchedule.custom_asset || '');
                    setWoSubject(`Maint: ${selectedSchedule.type || 'General'} - ${selectedSchedule.name}`);
                    setWoExpStartDate(new Date().toISOString().split('T')[0]);
                    setWoExpEndDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
                    setWoStatus('Open');
                    setShowWOModal(true);
                  }}
                >
                  Convert to Work Order
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 2: WORK ORDERS */}
      {activeSection === 'work_order' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px' }}>
            <span style={{ fontSize: 14, fontWeight: 700 }}>Maintenance Work Orders</span>
          </div>

          <div className="grid-2col" style={{ gridTemplateColumns: selectedWorkOrder ? '60% calc(40% - 24px)' : '1fr', gap: 24 }}>
            <div className="card-panel" style={{ padding: 0 }}>
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>WO ID</th>
                      <th>Property</th>
                      <th>Category</th>
                      <th>Estimated Cost</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workOrders.map(wo => (
                      <tr key={wo.id} onClick={() => setSelectedWorkOrder(wo)} style={{ cursor: 'pointer', backgroundColor: selectedWorkOrder?.id === wo.id ? 'var(--bg-accent-alpha)' : '' }}>
                        <td style={{ fontWeight: 600, color: 'var(--brand-color)' }}>{wo.id}</td>
                        <td>{wo.property}</td>
                        <td>{wo.category}</td>
                        <td>${wo.estCost.toLocaleString()}</td>
                        <td>
                          <span className={`badge ${wo.status === 'Completed' ? 'badge-success' : wo.status === 'Pending Approval' ? 'badge-warning' : 'badge-info'}`}>
                            {wo.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {selectedWorkOrder && (
              <div className="card-panel" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: 10 }}>
                  <strong>{selectedWorkOrder.id} Details</strong>
                  <button onClick={() => setSelectedWorkOrder(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={16} /></button>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12 }}>
                  <div>Status: <strong style={{ color: 'var(--brand-color)' }}>{selectedWorkOrder.status}</strong></div>
                  <div>Estimated Cost: <strong>${selectedWorkOrder.estCost.toLocaleString()}</strong></div>
                  <div>Actual Cost: <strong>${selectedWorkOrder.actualCost.toLocaleString()}</strong></div>
                  <div>Assigned Vendor: <strong>{selectedWorkOrder.vendor}</strong></div>
                  <div>Assigned Technician: <strong>{selectedWorkOrder.technician}</strong></div>
                </div>

                {/* Technician & Vendor Reassign Interface */}
                <div style={{ border: '1px solid var(--border-color)', padding: 12, borderRadius: 6, background: 'var(--bg-tertiary)' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 8 }}>Reassign Resource Settings</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div>
                      <label style={{ fontSize: 10, display: 'block', color: 'var(--text-secondary)' }}>New Technician</label>
                      <select value={reassignTech} onChange={(e) => setReassignTech(e.target.value)} className="form-select" style={{ padding: 4, fontSize: 11 }}>
                        <option value="">-- Reassign Tech --</option>
                        {techProfiles.map(t => (
                          <option key={t.id} value={t.name}>{t.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: 10, display: 'block', color: 'var(--text-secondary)' }}>New Vendor</label>
                      <select value={reassignVendor} onChange={(e) => setReassignVendor(e.target.value)} className="form-select" style={{ padding: 4, fontSize: 11 }}>
                        <option value="">-- Reassign Vendor --</option>
                        {vendorDir.map(v => (
                          <option key={v.id} value={v.name}>{v.name}</option>
                        ))}
                      </select>
                    </div>
                    <button className="btn btn-primary btn-sm" style={{ marginTop: 4 }} onClick={() => handleReassignSubmit(selectedWorkOrder.id)}>Save Assignment</button>
                  </div>
                </div>

                {/* Approvals button */}
                {selectedWorkOrder.status === 'Pending Approval' && (
                  <button className="btn btn-primary" onClick={() => handleWOStatusChange(selectedWorkOrder.id, 'Assigned')}>
                    <Check size={14} style={{ marginRight: 6 }} /> Approve Work Order
                  </button>
                )}

                 {/* Estimates Section */}
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)' }}>Estimates (Material & Labour)</span>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn btn-secondary btn-sm" style={{ padding: '2px 6px', fontSize: 10 }} onClick={() => setShowEstimateModal(true)}>+ Add Estimate</button>
                      {(woEstimates[selectedWorkOrder.id] || []).length > 0 && (
                        <button className="btn btn-primary btn-sm" style={{ padding: '2px 6px', fontSize: 10, background: '#10b981' }} onClick={() => handleGenerateQuotation(selectedWorkOrder.id)}>Gen Quotation</button>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {(woEstimates[selectedWorkOrder.id] || []).map((e, idx) => (
                      <div key={idx} style={{ display: 'flex', flexDirection: 'column', fontSize: 11, background: 'var(--bg-tertiary)', padding: 6, borderRadius: 4, gap: 2 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span><strong>[{e.type}]</strong> {e.name} (x{e.qty})</span>
                          <strong>${e.cost}</strong>
                        </div>
                        {e.comment && <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>Comment: {e.comment}</div>}
                      </div>
                    ))}
                    {(woEstimates[selectedWorkOrder.id] || []).length === 0 && (
                      <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>No estimates added yet.</span>
                    )}
                  </div>
                </div>

                {/* Stock consumption */}
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)' }}>Material Consumed</span>
                    <button className="btn btn-secondary btn-sm" style={{ padding: '2px 6px', fontSize: 10 }} onClick={() => setShowConsumeModal(true)}>+ Consume Part</button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {(selectedWorkOrder.consumedItems || []).map((c, i) => (
                      <div key={i} style={{ display: 'flex', flexDirection: 'column', fontSize: 11, background: 'var(--bg-tertiary)', padding: 6, borderRadius: 4, gap: 2 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>{c.item} (x{c.qty})</span>
                          <strong>${c.cost}</strong>
                        </div>
                        {c.comment && <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>Comment: {c.comment}</div>}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Lifecycle status updates */}
                {selectedWorkOrder.status !== 'Pending Approval' && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                    <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => handleWOStatusChange(selectedWorkOrder.id, 'In Progress')}>Start Job</button>
                    <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => handleWOStatusChange(selectedWorkOrder.id, 'Completed')}>Complete Job</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 3: TECHNICIANS */}
      {activeSection === 'technician' && (
        <div className="grid-2col" style={{ gridTemplateColumns: selectedTechnician ? '60% calc(40% - 24px)' : '1fr', gap: 24 }}>
          <div className="card-panel">
            <h3 style={{ fontSize: 15, marginBottom: 14 }}>Active Technicians Directory</h3>
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Tech Name</th>
                    <th>Skill Category</th>
                    <th>Certifications</th>
                    <th>Availability</th>
                  </tr>
                </thead>
                <tbody>
                  {techProfiles.map(tech => (
                    <tr key={tech.id} onClick={() => setSelectedTechnician(tech)} style={{ cursor: 'pointer', backgroundColor: selectedTechnician?.id === tech.id ? 'var(--bg-accent-alpha)' : '' }}>
                      <td><strong>{tech.name}</strong></td>
                      <td>{tech.skill}</td>
                      <td>{tech.certs}</td>
                      <td><span className={`badge ${tech.availability === 'Available' ? 'badge-success' : 'badge-warning'}`}>{tech.availability}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {selectedTechnician && (
            <div className="card-panel" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: 10 }}>
                <strong>{selectedTechnician.name} Details</strong>
                <button onClick={() => setSelectedTechnician(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={16} /></button>
              </div>

              <div style={{ display: 'flex', gap: 14, alignItems: 'center', background: 'var(--bg-tertiary)', padding: 12, borderRadius: 8 }}>
                <img 
                  src={selectedTechnician.img} 
                  alt={selectedTechnician.name} 
                  style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--brand-color)' }}
                />
                <div>
                  <h4 style={{ fontSize: 14, margin: 0 }}>{selectedTechnician.name}</h4>
                  <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Skill: {selectedTechnician.skill}</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Award size={14} /> Certs: {selectedTechnician.certs}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Phone size={14} /> Phone: {selectedTechnician.phone}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Mail size={14} /> Email: {selectedTechnician.email}</div>
                <div>Status: <span className="badge badge-success">{selectedTechnician.availability}</span></div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SECTION 4: VENDORS */}
      {activeSection === 'vendor' && (
        <div className="grid-2col" style={{ gridTemplateColumns: selectedVendor ? '60% calc(40% - 24px)' : '1fr', gap: 24 }}>
          <div className="card-panel">
            <h3 style={{ fontSize: 15, marginBottom: 14 }}>Vendor Directory & Quotations Log</h3>
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Vendor ID</th>
                    <th>Vendor Name</th>
                    <th>Service Category</th>
                    <th>Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {vendorDir.map(v => (
                    <tr key={v.id} onClick={() => setSelectedVendor(v)} style={{ cursor: 'pointer', backgroundColor: selectedVendor?.id === v.id ? 'var(--bg-accent-alpha)' : '' }}>
                      <td style={{ fontWeight: 600, color: 'var(--brand-color)' }}>{v.id}</td>
                      <td>{v.name}</td>
                      <td>{v.type}</td>
                      <td>⭐ {v.rating}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {selectedVendor && (
            <div className="card-panel" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: 10 }}>
                <strong>{selectedVendor.name} Details</strong>
                <button onClick={() => setSelectedVendor(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={16} /></button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12 }}>
                <div>Vendor Group: <strong>{selectedVendor.group}</strong></div>
                <div>Category Type: <strong>{selectedVendor.type}</strong></div>
                <div>Phone: <strong>{selectedVendor.phone}</strong></div>
                <div>Email: <strong>{selectedVendor.email}</strong></div>
                <div>Address: <strong>{selectedVendor.address}</strong></div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SECTION 5: ASSETS */}
      {activeSection === 'asset' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card-panel">
            <h3 style={{ fontSize: 15, marginBottom: 14 }}>Assets Warranty & AMC Management</h3>
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Asset ID</th>
                    <th>Asset Name</th>
                    <th>Property Name</th>
                    <th>Warranty Expiry</th>
                    <th>AMC status</th>
                    <th>Breakdowns YTD</th>
                  </tr>
                </thead>
                <tbody>
                  {assetsList.map(a => (
                    <tr key={a.id}>
                      <td style={{ fontWeight: 600 }}>{a.id}</td>
                      <td>{a.name}</td>
                      <td><strong>{getPropertyNameById(a.propertyId)}</strong></td>
                      <td>{a.warranty}</td>
                      <td>Active Contract ({a.amc})</td>
                      <td><span className="badge badge-success">{a.breakdownCount} breakdowns</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CREATE MAINTENANCE SCHEDULE MODAL */}
      {showScheduleModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 550 }}>
            <div className="modal-header">
              <h3>Create Maintenance Schedule</h3>
              <button onClick={() => setShowScheduleModal(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 20 }}>×</button>
            </div>
            <form onSubmit={handleCreateScheduleSubmit}>
              <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                {scheduleStatusMessage && (
                  <div style={{ background: scheduleStatusMessage.type === 'success' ? 'rgba(6,95,70,0.1)' : 'rgba(239,68,68,0.1)', padding: 10, borderRadius: 6, fontSize: 12, marginBottom: 14 }}>
                    {scheduleStatusMessage.text}
                  </div>
                )}
                
                <div className="grid-2col" style={{ gap: 16, gridTemplateColumns: '1fr 1fr' }}>
                  <div className="form-group">
                    <label className="form-label">Schedule Type</label>
                    <select value={schedType} onChange={(e) => setSchedType(e.target.value)} className="form-select">
                      <option value="PM Schedule">PM Schedule</option>
                      <option value="On-demand">On-demand</option>
                      <option value="Breakdown">Breakdown</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Issue Number (Optional)</label>
                    <input 
                      type="text" 
                      value={schedIssueNumber} 
                      onChange={(e) => setSchedIssueNumber(e.target.value)} 
                      className="form-input" 
                      placeholder="e.g. SUP-00123"
                    />
                  </div>
                </div>

                <div className="grid-2col" style={{ gap: 16, gridTemplateColumns: '1fr 1fr' }}>
                  <div className="form-group">
                    <label className="form-label">Assign Property Group</label>
                    <select value={schedPropertyId} onChange={(e) => setSchedPropertyId(e.target.value)} className="form-select" required>
                      <option value="">-- Choose Property --</option>
                      {(properties || []).map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Customer (Tenant)</label>
                    <select value={schedCustomer} onChange={(e) => setSchedCustomer(e.target.value)} className="form-select">
                      <option value="">-- Choose Tenant --</option>
                      {(tenants || []).map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid-2col" style={{ gap: 16, gridTemplateColumns: '1fr 1fr' }}>
                  <div className="form-group">
                    <label className="form-label">Unit Specification</label>
                    <select value={schedUnitSpec} onChange={(e) => setSchedUnitSpec(e.target.value)} className="form-select" required>
                      <option value="">-- Choose Unit --</option>
                      {loadingSchedUnits ? (
                        <option disabled>Loading units...</option>
                      ) : (
                        (schedUnits || []).map(u => (
                          <option key={u.name} value={u.name}>{u.item_name || u.name}</option>
                        ))
                      )}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Asset (Optional)</label>
                    <select value={schedAssetId} onChange={(e) => setSchedAssetId(e.target.value)} className="form-select">
                      <option value="">-- Choose Asset --</option>
                      {assetsList.filter(a => {
                        if (!schedPropertyId) return true;
                        const prop = (properties || []).find(p => p.id === schedPropertyId);
                        const propName = prop ? prop.name : '';
                        return (a.location || '').toLowerCase().includes(schedPropertyId.toLowerCase()) || 
                               (a.location || '').toLowerCase().includes(propName.toLowerCase());
                      }).map(a => (
                        <option key={a.id} value={a.id}>{a.name} ({a.location || 'No Location'})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid-2col" style={{ gap: 16, gridTemplateColumns: '1fr 1fr' }}>
                  <div className="form-group">
                    <label className="form-label">Periodicity</label>
                    <select value={schedPeriodicity} onChange={(e) => setSchedPeriodicity(e.target.value)} className="form-select">
                      <option value="Weekly">Weekly</option>
                      <option value="Monthly">Monthly</option>
                      <option value="Quarterly">Quarterly</option>
                      <option value="Yearly">Yearly</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Start Date</label>
                    <input type="date" value={schedStartDate} onChange={(e) => setSchedStartDate(e.target.value)} className="form-input" />
                  </div>
                </div>

                {/* Additional fields to create maintenance visit in ERPNext */}
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 12, marginTop: 12 }}>
                  <h4 style={{ fontSize: 12, fontWeight: 700, marginBottom: 8, color: 'var(--text-secondary)' }}>ERPNext Maintenance Visit Dispatch Fields</h4>
                  <div className="grid-2col" style={{ gap: 16, gridTemplateColumns: '1fr 1fr' }}>
                    <div className="form-group">
                      <label className="form-label">Visit Scheduled Date</label>
                      <input type="date" value={schedVisitDate} onChange={(e) => setSchedVisitDate(e.target.value)} className="form-input" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Visit Scheduled Time</label>
                      <input type="text" value={schedVisitTime} onChange={(e) => setSchedVisitTime(e.target.value)} placeholder="e.g. 10:00 AM" className="form-input" />
                    </div>
                  </div>
                  <div className="grid-2col" style={{ gap: 16, gridTemplateColumns: '1fr 1fr' }}>
                    <div className="form-group">
                      <label className="form-label">Assigned Technician</label>
                      <select value={schedAssignedTech} onChange={(e) => setSchedAssignedTech(e.target.value)} className="form-select">
                        <option value="">-- Choose Tech --</option>
                        {techProfiles.map(t => (
                          <option key={t.id} value={t.name}>{t.name} ({t.skill})</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Completion Status</label>
                      <select value={schedVisitStatus} onChange={(e) => setSchedVisitStatus(e.target.value)} className="form-select">
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Scope Description</label>
                  <textarea value={schedDescription} onChange={(e) => setSchedDescription(e.target.value)} className="form-input" rows="2" />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowScheduleModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submittingSchedule}>Create Maintenance Schedule</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* WORK ORDER CREATION MODAL */}
      {showWOModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <h3>Create Work Order</h3>
              <button onClick={() => setShowWOModal(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 20 }}>×</button>
            </div>
             <form onSubmit={handleCreateWO}>
              <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                <div className="form-group">
                  <label className="form-label">Task Subject (Required)</label>
                  <input type="text" value={woSubject} onChange={(e) => setWoSubject(e.target.value)} className="form-input" required />
                </div>

                <div className="form-group">
                  <label className="form-label">Property group</label>
                  <select value={selectedPropertyId} onChange={(e) => setSelectedPropertyId(e.target.value)} className="form-select" required disabled={!!woScheduleId}>
                    <option value="">-- Choose Property --</option>
                    {(properties || []).map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid-2col" style={{ gap: 16, gridTemplateColumns: '1fr 1fr' }}>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select value={woCategory} onChange={(e) => setWoCategory(e.target.value)} className="form-select">
                      <option value="Plumbing">Plumbing</option>
                      <option value="Electrical">Electrical</option>
                      <option value="HVAC">HVAC</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Priority</label>
                    <select value={woPriority} onChange={(e) => setWoPriority(e.target.value)} className="form-select">
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                </div>

                <div className="grid-2col" style={{ gap: 16, gridTemplateColumns: '1fr 1fr' }}>
                  <div className="form-group">
                    <label className="form-label">Task Status</label>
                    <select value={woStatus} onChange={(e) => setWoStatus(e.target.value)} className="form-select">
                      <option value="Open">Open</option>
                      <option value="Working">Working</option>
                      <option value="Pending Review">Pending Review</option>
                      <option value="Overdue">Overdue</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Estimated Cost ($)</label>
                    <input type="number" value={woEstCost} onChange={(e) => setWoEstCost(e.target.value)} className="form-input" required />
                  </div>
                </div>

                <div className="grid-2col" style={{ gap: 16, gridTemplateColumns: '1fr 1fr' }}>
                  <div className="form-group">
                    <label className="form-label">Expected Start Date</label>
                    <input type="date" value={woExpStartDate} onChange={(e) => setWoExpStartDate(e.target.value)} className="form-input" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Expected End Date</label>
                    <input type="date" value={woExpEndDate} onChange={(e) => setWoExpEndDate(e.target.value)} className="form-input" required />
                  </div>
                </div>

                <div className="grid-2col" style={{ gap: 16, gridTemplateColumns: '1fr 1fr' }}>
                  <div className="form-group">
                    <label className="form-label">Assign Technician</label>
                    <select value={woTechnician} onChange={(e) => setWoTechnician(e.target.value)} className="form-select">
                      <option value="">-- Choose Tech --</option>
                      {techProfiles.map(t => (
                        <option key={t.id} value={t.name}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Assign Vendor</label>
                    <select value={woVendor} onChange={(e) => setWoVendor(e.target.value)} className="form-select">
                      <option value="">-- Choose Vendor --</option>
                      {vendorDir.map(v => (
                        <option key={v.id} value={v.name}>{v.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Asset (Optional)</label>
                  <select value={woAssetId} onChange={(e) => setWoAssetId(e.target.value)} className="form-select">
                    <option value="">-- Choose Asset --</option>
                    {assetsList.filter(a => {
                      const propId = selectedPropertyId || woProperty;
                      if (!propId) return true;
                      const prop = (properties || []).find(p => p.id === propId);
                      const propName = prop ? prop.name : '';
                      return (a.location || '').toLowerCase().includes(propId.toLowerCase()) || 
                             (a.location || '').toLowerCase().includes(propName.toLowerCase());
                    }).map(a => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Task Description</label>
                  <textarea value={woDescription} onChange={(e) => setWoDescription(e.target.value)} className="form-input" rows="3" />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowWOModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Work Order</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ITEM CONSUMPTION MODAL */}
      {showConsumeModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 500, width: '90%' }}>
            <div className="modal-header">
              <h3>Deduct Stock & Consume Part</h3>
              <button onClick={() => setShowConsumeModal(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 20 }}>×</button>
            </div>
            <form onSubmit={handleConsumeItemSubmit}>
              <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {consumeItemsList.map((entry, idx) => (
                  <div key={idx} style={{ border: '1px solid var(--border-color)', padding: 10, borderRadius: 6, position: 'relative', background: 'var(--bg-tertiary)' }}>
                    {consumeItemsList.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => setConsumeItemsList(prev => prev.filter((_, i) => i !== idx))} 
                        style={{ position: 'absolute', top: 6, right: 6, background: 'none', border: 'none', color: 'var(--text-danger)', fontSize: 14, cursor: 'pointer' }}
                      >
                        Remove
                      </button>
                    )}
                    <div className="form-group" style={{ marginBottom: 8 }}>
                      <label className="form-label" style={{ fontSize: 11 }}>Select Stock Item</label>
                      <select 
                        value={entry.itemCode} 
                        onChange={(e) => setConsumeItemsList(prev => prev.map((item, i) => i === idx ? { ...item, itemCode: e.target.value } : item))} 
                        className="form-select" 
                        required
                      >
                        <option value="">-- Select Item --</option>
                        {stockItems.map(s => (
                          <option key={s.code} value={s.code}>{s.name} (Qty: {s.qty} - ${s.unitCost}/ea)</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid-2col" style={{ gap: 8, gridTemplateColumns: '1fr 2fr' }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" style={{ fontSize: 11 }}>Qty</label>
                        <input 
                          type="number" 
                          value={entry.qty} 
                          onChange={(e) => setConsumeItemsList(prev => prev.map((item, i) => i === idx ? { ...item, qty: Number(e.target.value) } : item))} 
                          className="form-input" 
                          min="1" 
                          required 
                        />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" style={{ fontSize: 11 }}>Comment</label>
                        <input 
                          type="text" 
                          value={entry.comment} 
                          onChange={(e) => setConsumeItemsList(prev => prev.map((item, i) => i === idx ? { ...item, comment: e.target.value } : item))} 
                          className="form-input" 
                          placeholder="Note on usage"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <button 
                  type="button" 
                  className="btn btn-secondary btn-sm" 
                  onClick={() => setConsumeItemsList(prev => [...prev, { itemCode: '', qty: 1, comment: '' }])}
                  style={{ alignSelf: 'flex-start' }}
                >
                  + Add Another Item
                </button>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowConsumeModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Deduct & Record</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ESTIMATE CREATION MODAL */}
      {showEstimateModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 450 }}>
            <div className="modal-header">
              <h3>Create Estimate Item</h3>
              <button onClick={() => setShowEstimateModal(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 20 }}>×</button>
            </div>
            <form onSubmit={handleAddEstimateSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Estimate Type</label>
                  <select value={estType} onChange={(e) => setEstType(e.target.value)} className="form-select">
                    <option value="Material">Material</option>
                    <option value="Labour">Labour</option>
                  </select>
                </div>

                {estType === 'Material' ? (
                  <div className="form-group">
                    <label className="form-label">Select Item (DocType Linked)</label>
                    <select value={estItemCode} onChange={(e) => setEstItemCode(e.target.value)} className="form-select" required>
                      <option value="">-- Choose Item --</option>
                      {stockItems.map(s => (
                        <option key={s.code} value={s.code}>{s.name} (${s.unitCost}/ea)</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="form-group">
                    <label className="form-label">Labour Description</label>
                    <input 
                      type="text" 
                      value={estName} 
                      onChange={(e) => setEstName(e.target.value)} 
                      className="form-input" 
                      placeholder="e.g. Technician Labour" 
                      required 
                    />
                  </div>
                )}

                <div className="grid-2col" style={{ gap: 12, gridTemplateColumns: '1fr 1fr' }}>
                  <div className="form-group">
                    <label className="form-label">{estType === 'Material' ? 'Quantity' : 'Hours'}</label>
                    <input 
                      type="number" 
                      value={estQty} 
                      onChange={(e) => setEstQty(Number(e.target.value))} 
                      className="form-input" 
                      min="1" 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{estType === 'Material' ? 'Estimated Unit Cost' : 'Hourly Rate'}</label>
                    <input 
                      type="number" 
                      value={estCost} 
                      onChange={(e) => setEstCost(Number(e.target.value))} 
                      className="form-input" 
                      disabled={estType === 'Material'}
                      placeholder={estType === 'Material' ? 'Auto-calculated' : 'e.g. 50'}
                      required 
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Comments / Notes</label>
                  <input 
                    type="text" 
                    value={estComment} 
                    onChange={(e) => setEstComment(e.target.value)} 
                    className="form-input" 
                    placeholder="Specific notes on this estimate item" 
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowEstimateModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add Item</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
