import React, { useState, useEffect } from 'react';
import { Home, Building2, Plus, Globe, Search, ArrowRight, ShieldCheck, X, Grid, Info } from 'lucide-react';

const fallbackImages = {
  residential: [
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'
  ],
  commercial: [
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80'
  ],
  mall: [
    'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1582037928769-181f2644ecb7?auto=format&fit=crop&w=800&q=80'
  ]
};

const unitFallbackImages = {
  residential: [
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80'
  ],
  commercial: [
    'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&q=80'
  ],
  mall: [
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=800&q=80'
  ]
};

function SecureImage({ src, alt, style, className, erpnextConfig }) {
  const [imgSrc, setImgSrc] = useState(null);

  useEffect(() => {
    if (!src) return;
    if (src.startsWith('data:') || !src.includes('/private/')) {
      setImgSrc(src);
      return;
    }

    const controller = new AbortController();
    const headers = {};
    

    async function fetchImage() {
      try {
        const res = await fetch(src, {
          credentials: 'include',
          headers,
          signal: controller.signal
        });
        if (res.ok) {
          const blob = await res.blob();
          const objectUrl = URL.createObjectURL(blob);
          setImgSrc(objectUrl);
        } else {
          setImgSrc(src);
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          setImgSrc(src);
        }
      }
    }

    fetchImage();

    return () => {
      controller.abort();
    };
  }, [src, erpnextConfig]);

  return <img src={imgSrc || src} alt={alt} style={style} className={className} />;
}

function ImageCarousel({ images, height = 180, erpnextConfig }) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!images || images.length === 0) return null;

  const handlePrev = (e) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div style={{ position: 'relative', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-color)', background: '#1e293b', height }}>
      <div style={{ display: 'flex', width: `${images.length * 100}%`, height: '100%', transform: `translateX(-${(activeIndex * 100) / images.length}%)`, transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }}>
        {images.map((img, i) => (
          <div key={i} style={{ width: `${100 / images.length}%`, height: '100%', flexShrink: 0 }}>
            <SecureImage 
              src={img} 
              alt={`slide-${i}`} 
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              erpnextConfig={erpnextConfig}
            />
          </div>
        ))}
      </div>
      
      {images.length > 1 && (
        <>
          <button 
            type="button"
            onClick={handlePrev}
            style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10, backdropFilter: 'blur(4px)' }}
          >
            ‹
          </button>
          <button 
            type="button"
            onClick={handleNext}
            style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10, backdropFilter: 'blur(4px)' }}
          >
            ›
          </button>
          
          <div style={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6, zIndex: 10 }}>
            {images.map((_, i) => (
              <div 
                key={i} 
                onClick={(e) => { e.stopPropagation(); setActiveIndex(i); }}
                style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: i === activeIndex ? 'var(--brand-color)' : 'rgba(255,255,255,0.5)', cursor: 'pointer', transition: 'all 0.2s' }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function Properties({ properties, onAddProperty, onToggleListOnline, erpnextConfig, onScheduleMaintenance }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProp, setSelectedProp] = useState(null);
  const [expandedUnit, setExpandedUnit] = useState(null);

  // Pagination & Layout States
  const [viewLayout, setViewLayout] = useState('standard'); // 'standard' | 'three-column'
  const [selectedUnitId, setSelectedUnitId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // ERPNext Integration States
  const [detailedProp, setDetailedProp] = useState(null);
  const [propertyUnits, setPropertyUnits] = useState([]);
  const [loadedUnitDetails, setLoadedUnitDetails] = useState({});
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [loadingUnits, setLoadingUnits] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [type, setType] = useState('residential');
  const [address, setAddress] = useState('');
  const [unitsCount, setUnitsCount] = useState(1);
  const [rent, setRent] = useState('');
  const [area, setArea] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !address || !rent || !area) return;

    onAddProperty({
      id: `PROP-${Math.floor(1000 + Math.random() * 9000)}`,
      name,
      type,
      address,
      unitsCount: Number(unitsCount),
      rent: Number(rent),
      area: Number(area),
      listedOnline: false,
      occupancy: 0
    });

    setName('');
    setType('residential');
    setAddress('');
    setUnitsCount(1);
    setRent('');
    setArea('');
    setShowAddModal(false);
  };

  // Fetch details and units from ERPNext API
  useEffect(() => {
    if (!selectedProp || !erpnextConfig) {
      setDetailedProp(null);
      setPropertyUnits([]);
      setLoadedUnitDetails({});
      return;
    }

    async function fetchDetailsAndUnits() {
      setLoadingDetails(true);
      setLoadingUnits(true);
      setLoadedUnitDetails({});
      
      // 1. Fetch Property Group Details
      try {
        const res = await fetch(`${erpnextConfig.url}/api/method/erpnext.api.get_property_group?name=${selectedProp.id}`, {
          credentials: 'include',
      headers: {
            'Content-Type': 'application/json'
          }
        });
        if (res.ok) {
          const data = await res.json();
          setDetailedProp(data.message || data);
        } else {
          setDetailedProp(selectedProp); // fallback
        }
      } catch (err) {
        console.warn('Failed to fetch detailed property group:', err);
        setDetailedProp(selectedProp);
      } finally {
        setLoadingDetails(false);
      }

      // 2. Fetch Units List
      try {
        const res = await fetch(`${erpnextConfig.url}/api/method/erpnext.api.get_units?property_group=${selectedProp.id}`, {
          credentials: 'include',
      headers: {
            'Content-Type': 'application/json'
          }
        });
        if (res.ok) {
          const data = await res.json();
          const list = data.message || data;
          if (Array.isArray(list)) {
            setPropertyUnits(list);
          } else {
            setPropertyUnits([]);
          }
        } else {
          // Generate fallback unit list
          setPropertyUnits([...Array(selectedProp.unitsCount || 4)].map((_, i) => ({
            name: `${selectedProp.id}-UNIT-${100 + i + 1}`,
            unit_name: `Space Unit #${100 + i + 1}`,
            status: 'Vacant',
            rent: Math.round(selectedProp.rent / (selectedProp.unitsCount || 4)),
            area: Math.round(selectedProp.area / (selectedProp.unitsCount || 4))
          })));
        }
      } catch (err) {
        console.warn('Failed to fetch units list, falling back:', err);
        setPropertyUnits([...Array(selectedProp.unitsCount || 4)].map((_, i) => ({
          name: `${selectedProp.id}-UNIT-${100 + i + 1}`,
          unit_name: `Space Unit #${100 + i + 1}`,
          status: 'Vacant',
          rent: Math.round(selectedProp.rent / (selectedProp.unitsCount || 4)),
          area: Math.round(selectedProp.area / (selectedProp.unitsCount || 4))
        })));
      } finally {
        setLoadingUnits(false);
      }
    }

    fetchDetailsAndUnits();
  }, [selectedProp?.id, erpnextConfig]);

  // Click handler to expand unit and fetch its individual detail via get_unit API
  const handleUnitToggle = async (unitId) => {
    const isExpanded = expandedUnit === unitId;
    if (isExpanded) {
      setExpandedUnit(null);
      return;
    }

    setExpandedUnit(unitId);

    // If details are already cached, do not refetch
    if (loadedUnitDetails[unitId]) return;

    try {
      const res = await fetch(`${erpnextConfig.url}/api/method/erpnext.api.get_unit?item_code=${unitId}`, {
        credentials: 'include',
      headers: {
          'Content-Type': 'application/json'
        }
      });
      if (res.ok) {
        const data = await res.json();
        setLoadedUnitDetails(prev => ({
          ...prev,
          [unitId]: data.message || data
        }));
      } else {
        // Mock fallback details
        const matchedUnit = propertyUnits.find(u => u.name === unitId) || {};
        setLoadedUnitDetails(prev => ({
          ...prev,
          [unitId]: {
            rent: matchedUnit.rent || 800,
            area: matchedUnit.area || 1000,
            power_reading: '4,120 kWh',
            water_reading: '890 m³',
            status: matchedUnit.status || 'Vacant'
          }
        }));
      }
    } catch (err) {
      console.warn('Failed to fetch single unit details:', err);
      const matchedUnit = propertyUnits.find(u => u.name === unitId) || {};
      setLoadedUnitDetails(prev => ({
        ...prev,
        [unitId]: {
          rent: matchedUnit.rent || 800,
          area: matchedUnit.area || 1000,
          power_reading: '4,120 kWh (Local Fallback)',
          water_reading: '890 m³ (Local Fallback)',
          status: matchedUnit.status || 'Vacant'
        }
      }));
    }
  };

  const handlePropertyRowClick = (prop) => {
    setSelectedProp(prop);
    setViewLayout('three-column');
    setSelectedUnitId(null);
  };

  const uniqueTypes = Array.from(new Set(properties.map(p => p.land_and_building_type || p.type).filter(Boolean)));

  const filteredProperties = properties.filter(prop => {
    const propType = prop.land_and_building_type || prop.type;
    const matchesFilter = filterType === 'all' || propType === filterType || prop.type === filterType;
    const matchesSearch = prop.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          prop.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProperties.slice(indexOfFirstItem, indexOfLastItem);

  const renderPaginationControls = () => {
    if (totalPages <= 1) return null;
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 24px', borderTop: '1px solid var(--border-color)', fontSize: 13, color: 'var(--text-secondary)', background: 'var(--bg-card)' }}>
        <div>
          Showing <strong>{indexOfFirstItem + 1}</strong> to <strong>{Math.min(indexOfLastItem, filteredProperties.length)}</strong> of <strong>{filteredProperties.length}</strong> entries
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
          <h1 className="view-title">Properties Portfolio</h1>
          <p className="view-subtitle">Manage residential buildings, commercial spaces, and mall facilities for Carpenters Estate.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={16} /> Add Property
        </button>
      </div>

      {/* Controls panel */}
      <div className="card-panel" style={{ padding: '16px 24px', marginBottom: 24, display: 'flex', gap: 16, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 10, flex: 1, minWidth: 260 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search by name or location..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input" 
              style={{ paddingLeft: 38 }}
            />
          </div>
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="form-select" 
            style={{ width: 160 }}
          >
            <option value="all">All Types</option>
            {uniqueTypes.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', gap: 20, fontSize: 13, color: 'var(--text-secondary)' }}>
          <span>Total: <strong>{filteredProperties.length}</strong></span>
          <span>Residential: <strong>{filteredProperties.filter(p => p.type === 'residential').length}</strong></span>
          <span>Commercial: <strong>{filteredProperties.filter(p => p.type === 'commercial').length}</strong></span>
          <span>Mall: <strong>{filteredProperties.filter(p => p.type === 'mall').length}</strong></span>
        </div>
      </div>

      {/* Dynamic layout render engine */}
      {viewLayout === 'three-column' && selectedProp ? (
        <div style={{ display: 'grid', gridTemplateColumns: '26% 34% 40%', gap: 20 }}>
          {/* Column 1: Shrunk property list */}
          <div className="card-panel" style={{ padding: 12, overflow: 'hidden' }}>
            <h3 style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', padding: '0 8px 10px', borderBottom: '1px solid var(--border-color)', marginBottom: 8 }}>Assets</h3>
            <div className="table-container" style={{ border: 'none', marginTop: 0 }}>
              <table className="custom-table" style={{ width: '100%', fontSize: 11 }}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Land Description</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map(prop => (
                    <tr 
                      key={prop.id} 
                      onClick={() => {
                        setSelectedProp(prop);
                        setSelectedUnitId(null);
                      }}
                      style={{ 
                        cursor: 'pointer',
                        backgroundColor: selectedProp?.id === prop.id ? 'var(--bg-accent-alpha)' : ''
                      }}
                    >
                      <td 
                        style={{ fontWeight: 600, color: 'var(--brand-color)', textDecoration: 'underline' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProp(prop);
                          setViewLayout('standard');
                        }}
                      >
                        {prop.name}
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>
                        {prop.land_description || `Area: ${prop.area} sq ft`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {renderPaginationControls()}
          </div>

          {/* Column 2: Space Units list */}
          <div className="card-panel" style={{ padding: 16 }}>
            <h3 style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', paddingBottom: 10, borderBottom: '1px solid var(--border-color)', marginBottom: 14 }}>Space Units Breakdown</h3>
            {loadingUnits ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 11, padding: '16px 0' }}>Loading space units...</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {propertyUnits.map((unit, idx) => {
                  const isActive = selectedUnitId === unit.name;
                  return (
                    <div 
                      key={unit.name || idx}
                      onClick={() => {
                        setSelectedUnitId(unit.name);
                        handleUnitToggle(unit.name);
                      }}
                      style={{ 
                        padding: '10px 12px', 
                        background: isActive ? 'var(--bg-accent-alpha)' : 'var(--bg-tertiary)', 
                        border: isActive ? '1px solid var(--brand-color)' : '1px solid var(--border-color)',
                        borderRadius: 6,
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: 11
                      }}
                    >
                      <span style={{ fontWeight: 600 }}>{unit.unit_name || unit.name}</span>
                      <span className={`badge ${unit.status === 'occupied' ? 'badge-danger' : 'badge-success'}`} style={{ fontSize: 9 }}>
                        {unit.status || 'Vacant'}
                      </span>
                    </div>
                  );
                })}
                {propertyUnits.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--text-muted)', fontSize: 11 }}>No units configured.</div>
                )}
              </div>
            )}
          </div>

          {/* Column 3: Active Unit detailed inspection sheet */}
          <div className="card-panel" style={{ padding: 18 }}>
            <h3 style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', paddingBottom: 10, borderBottom: '1px solid var(--border-color)', marginBottom: 14 }}>Selected Unit Spec</h3>
            {selectedUnitId ? (() => {
              const details = loadedUnitDetails[selectedUnitId];
              const matchedUnit = propertyUnits.find(u => u.name === selectedUnitId);
              
              if (!details) {
                return <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 11, padding: '16px 0' }}>Loading specs...</div>;
              }

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {/* Unit Space Image Viewer (Top) */}
                  {(() => {
                    const unitFallbackImages = {
                      residential: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
                      commercial: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
                      mall: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80'
                    };
                    const imgs = (details.custom_unit_images && details.custom_unit_images.length > 0)
                      ? details.custom_unit_images.map(item => item.image.startsWith('http') ? item.image : `${erpnextConfig?.url || ''}${item.image}`)
                      : (details.image ? [details.image.startsWith('http') ? details.image : `${erpnextConfig?.url || ''}${details.image}`] : [unitFallbackImages[selectedProp.type] || unitFallbackImages.commercial]);
                    return <ImageCarousel images={imgs} height={160} erpnextConfig={erpnextConfig} />;
                  })()}

                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>{matchedUnit?.unit_name || selectedUnitId}</h4>
                    <span className={`badge ${details.status === 'occupied' ? 'badge-danger' : 'badge-success'}`} style={{ marginTop: 4 }}>
                      {details.status}
                    </span>
                  </div>

                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 6, fontSize: 11, color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Standard Rent:</span>
                      <strong style={{ color: 'var(--brand-color)' }}>${(details.rent || matchedUnit?.rent || 0).toLocaleString()}/mo</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Estimated Size:</span>
                      <strong style={{ color: 'var(--text-primary)' }}>{(details.area || matchedUnit?.area || 0).toLocaleString()} sq ft</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Power Grid reading:</span>
                      <strong style={{ color: 'var(--color-success)' }}>{details.power_reading || 'Active'}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Water reading:</span>
                      <strong style={{ color: 'var(--color-success)' }}>{details.water_reading || 'Active'}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Unit Ownership:</span>
                      <strong style={{ color: 'var(--text-primary)' }}>{details.unit_owner || details.owner || 'N/A'}</strong>
                    </div>
                    {Object.keys(details).filter(key => {
                      const keysToHide = [
                        'rent', 'area', 'power_reading', 'water_reading', 'status',
                        'brand', 'shelf_life_in_days', 'end_of_life', 'default_material_request_type',
                        'valuation_method', 'warranty_period', 'weight_per_unit', 'weight_uom',
                        'allow_negative_stock', 'has_batch_no', 'create_new_batch', 'batch_number_series',
                        'has_expiry_date', 'retain_sample', 'sample_quantity', 'has_serial_no',
                        'serial_no_series', 'variant_of', 'variant_based_on', 'enable_deferred_expense',
                        'no_of_months_exp', 'enable_deferred_revenue', 'no_of_months', 'purchase_uom',
                        'min_order_qty', 'safety_stock', 'is_purchase_item', 'lead_time_days',
                        'last_purchase_rate', 'is_customer_provided_item', 'customer', 'delivered_by_supplier',
                        'country_of_origin', 'customs_tariff_number', 'sales_uom', 'grant_commission',
                        'is_sales_item', 'max_discount', 'inspection_required_before_purchase',
                        'quality_inspection_template', 'inspection_required_before_delivery',
                        'include_item_in_manufacturing', 'is_sub_contracted_item', 'default_bom',
                        'customer_code', 'default_item_manufacturer', 'default_manufacturer_part_no',
                        'total_projected_qty', 'doctype', 'barcodes', 'custom_property_reference',
                        'taxes', 'item_defaults', 'uoms', 'images', 'custom_unit_images',
                        'custom_booking_reference', 'attributes', 'customer_items', 'supplier_items',
                        'custom_booking_history', 'reorder_levels', 'name', 'owner', 'creation', 'modified',
                        'modified_by', 'docstatus', 'idx', 'naming_series', 'item_group', 'item_name', 'description',
                        'disabled', 'allow_alternative_item', 'is_stock_item', 'has_variants', 'opening_stock',
                        'standard_rate', 'is_fixed_asset', 'auto_create_assets', 'is_grouped_asset', 'asset_category',
                        'asset_naming_series', 'over_delivery_receipt_allowance', 'over_billing_allowance', 'image',
                        'item_code', 'stock_uom', 'average', 'total_floor', 'total_bundle', 'category', 'property_owned_by',
                        'bundle_price', 'total_service_price', 'item_code/stock_uom', 'unit_owner'
                      ];
                      return !keysToHide.includes(key.toLowerCase());
                    }).map(key => (
                      <div key={key} style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ textTransform: 'capitalize' }}>{key.replace(/^custom_/, '').replace(/_custom_/gi, '_').replace(/custom/gi, '').replace(/_/g, ' ').trim()}:</span>
                        <strong style={{ color: 'var(--text-primary)' }}>{String(details[key])}</strong>
                      </div>
                    ))}

                  </div>
                </div>
              );
            })() : (
              <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)', fontSize: 11 }}>
                Select a Space Unit in the middle column to inspect details.
              </div>
            )}
          </div>
        </div>
      ) : (
        /* STANDARD SPLIT VIEW */
        <div className="grid-2col" style={{ gridTemplateColumns: selectedProp ? '60% calc(40% - 24px)' : '1fr', gap: 24, transition: 'all 0.3s ease' }}>
          {/* Properties Table */}
          <div className="card-panel" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-container" style={{ border: 'none', marginTop: 0 }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Land Description</th>
                    <th>Lease End</th>
                    <th style={{ textAlign: 'right' }}>Picture</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map(prop => (
                    <tr 
                      key={prop.id} 
                      onClick={() => handlePropertyRowClick(prop)}
                      style={{ 
                        cursor: 'pointer',
                        backgroundColor: selectedProp?.id === prop.id ? 'var(--bg-accent-alpha)' : '',
                        borderLeft: selectedProp?.id === prop.id ? '3px solid var(--brand-color)' : ''
                      }}
                    >
                      <td style={{ fontWeight: 600, color: 'var(--brand-color)' }}>{prop.id}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <SecureImage 
                            src={prop.image || fallbackImages[prop.type]?.[0] || fallbackImages.commercial[0]} 
                            alt="" 
                            style={{ width: 26, height: 26, objectFit: 'cover', borderRadius: '50%', border: '1px solid var(--border-color)' }} 
                            erpnextConfig={erpnextConfig}
                          />
                          <div>
                            <div style={{ fontWeight: 600 }}>{prop.name}</div>
                            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{prop.address}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${(prop.land_and_building_type || prop.type) === 'residential' ? 'badge-success' : (prop.land_and_building_type || prop.type) === 'commercial' ? 'badge-info' : 'badge-warning'}`}>
                          {prop.land_and_building_type || prop.type}
                        </span>
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                        {prop.land_description || `Plot size: ${prop.area.toLocaleString()} sq ft`}
                      </td>
                      <td>
                        <span className="badge badge-warning" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--brand-color)' }}>
                          {prop.lease_end_date || '2026-12-31'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <SecureImage 
                          src={prop.image || fallbackImages[prop.type]?.[0] || fallbackImages.commercial[0]} 
                          alt={prop.name} 
                          style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', display: 'inline-block' }} 
                          erpnextConfig={erpnextConfig}
                        />
                      </td>
                    </tr>
                  ))}
                  {filteredProperties.length === 0 && (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)' }}>
                        No properties match your filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {renderPaginationControls()}
          </div>

          {/* Selected Property Detail Panel */}
          {selectedProp && (() => {
            const p = detailedProp || selectedProp;
            return (
              <div className="card-panel" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20, animation: 'fadeIn 0.2s ease-out' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Info size={18} style={{ color: 'var(--brand-color)' }} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--brand-color)' }}>{p.id}</span>
                  </div>
                  <button 
                    onClick={() => setSelectedProp(null)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex' }}
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Property Group Image at top */}
                {(() => {
                  const imgs = (p.gallery && p.gallery.length > 0)
                    ? p.gallery.map(item => item.image.startsWith('http') ? item.image : `${erpnextConfig?.url || ''}${item.image}`)
                    : (p.image ? [p.image] : (fallbackImages[p.type] || fallbackImages.commercial));
                  return <ImageCarousel images={imgs} height={180} erpnextConfig={erpnextConfig} />;
                })()}

                <div>
                  <h2 style={{ fontSize: '1.25rem', marginBottom: 4 }}>{p.name}</h2>
                  <span className="badge badge-info" style={{ textTransform: 'uppercase', fontSize: 9, padding: '2px 8px' }}>
                    {p.land_and_building_type || p.type}
                  </span>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 8 }}>{p.address}</p>

                  <div style={{ background: 'var(--bg-tertiary)', padding: 12, borderRadius: 6, marginTop: 12, fontSize: 11, border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Land ID:</span>
                      <span style={{ fontWeight: 600 }}>{p.id}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Description:</span>
                      <span style={{ fontWeight: 600, textAlign: 'right', maxWidth: '70%' }}>{p.land_description || 'N/A'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Lease Expiry:</span>
                      <span style={{ fontWeight: 600 }}>{p.lease_end_date || 'N/A'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Property Owner:</span>
                      <span style={{ fontWeight: 600 }}>{p.property_owner || p.owner || 'N/A'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Occupied Units:</span>
                      <span style={{ fontWeight: 600, color: 'var(--color-danger)' }}>
                        {propertyUnits.filter(u => (u.status || '').toLowerCase() === 'occupied').length}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Vacant Units:</span>
                      <span style={{ fontWeight: 600, color: 'var(--color-success)' }}>
                        {propertyUnits.filter(u => (u.status || '').toLowerCase() !== 'occupied').length}
                      </span>
                    </div>
                    {Object.keys(p).filter(key => ![
                      'id', 'name', 'type', 'land_and_building_type', 'address', 'land_description', 
                      'lease_end_date', 'rent', 'area', 'unitsCount', 'listedOnline', 'occupancy',
                      'created_by', 'modified', 'docstatus', 'doctype', 'gallery', 'image', 'owner',
                      'creation', 'modified_by', 'property_owner', 'internal', 'external'
                    ].includes(key.toLowerCase())).map(key => (
                      <div key={key} style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)', textTransform: 'capitalize' }}>{key.replace(/_/g, ' ')}:</span>
                        <span style={{ fontWeight: 600 }}>{String(p[key])}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ background: 'var(--bg-tertiary)', padding: 14, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 6 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Occupancy Progress</span>
                    <span style={{ fontWeight: 600 }}>{p.occupancy || 0}%</span>
                  </div>
                  <div style={{ width: '100%', height: 6, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${p.occupancy || 0}%`, height: '100%', backgroundColor: (p.occupancy || 0) > 50 ? 'var(--color-success)' : 'var(--brand-color)', borderRadius: 3 }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, fontSize: 12 }}>
                  <div style={{ background: 'rgba(255,255,255,0.01)', padding: 12, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: 10, textTransform: 'uppercase', marginBottom: 2 }}>Contract Rent</span>
                    <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--brand-color)' }}>${(p.rent || 0).toLocaleString()}/mo</span>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.01)', padding: 12, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: 10, textTransform: 'uppercase', marginBottom: 2 }}>Floor Area</span>
                    <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{(p.area || 0).toLocaleString()} sq ft</span>
                  </div>
                </div>

                <div>
                  <h3 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Unit Space Breakdown</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {loadingUnits ? (
                      <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 11, padding: '12px 0' }}>Loading units list...</div>
                    ) : (
                      propertyUnits.map((unit, idx) => {
                        const isExpanded = expandedUnit === unit.name;
                        const details = loadedUnitDetails[unit.name];
                        return (
                          <div key={unit.name || idx} style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg-tertiary)', borderRadius: 6, border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                            <div 
                              onClick={() => handleUnitToggle(unit.name)}
                              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, padding: '8px 12px', cursor: 'pointer', transition: 'background-color var(--transition-fast)' }}
                              className="menu-item-hover"
                            >
                              <span style={{ fontWeight: 600 }}>{unit.unit_name || unit.name}</span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span className={`badge ${unit.status === 'occupied' ? 'badge-danger' : 'badge-success'}`} style={{ fontSize: 9 }}>
                                  {unit.status || 'Vacant'}
                                </span>
                                <span style={{ fontSize: 10, color: 'var(--brand-color)', fontWeight: 600 }}>{isExpanded ? 'Collapse' : 'Expand'}</span>
                              </div>
                            </div>
                            {isExpanded && (
                              <div style={{ padding: '10px 12px', borderTop: '1px solid var(--border-color)', background: 'rgba(255, 255, 255, 0.01)', fontSize: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                                {details ? (
                                  <>
                                    {/* Unit Space Image Carousel (Top) */}
                                    {(() => {
                                      const imgs = (details.custom_unit_images && details.custom_unit_images.length > 0)
                                        ? details.custom_unit_images.map(item => item.image.startsWith('http') ? item.image : `${erpnextConfig?.url || ''}${item.image}`)
                                        : (details.image ? [details.image.startsWith('http') ? details.image : `${erpnextConfig?.url || ''}${details.image}`] : (unitFallbackImages[p.type] || unitFallbackImages.commercial));
                                      return (
                                        <div style={{ marginBottom: 8 }}>
                                          <ImageCarousel images={imgs} height={120} erpnextConfig={erpnextConfig} />
                                        </div>
                                      );
                                    })()}
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                      <span style={{ color: 'var(--text-secondary)' }}>Standard Rent:</span>
                                      <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>${(details.rent || unit.rent || 0).toLocaleString()}/mo</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                      <span style={{ color: 'var(--text-secondary)' }}>Est. Area Size:</span>
                                      <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{(details.area || unit.area || 0).toLocaleString()} sq ft</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                      <span style={{ color: 'var(--text-secondary)' }}>Power Grid:</span>
                                      <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>{details.power_reading || 'Active'}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                      <span style={{ color: 'var(--text-secondary)' }}>Water Connection:</span>
                                      <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>{details.water_reading || 'Active'}</span>
                                    </div>
                                    {Object.keys(details).filter(key => {
                                      const keysToHide = [
                                        'rent', 'area', 'power_reading', 'water_reading', 'status',
                                        'brand', 'shelf_life_in_days', 'end_of_life', 'default_material_request_type',
                                        'valuation_method', 'warranty_period', 'weight_per_unit', 'weight_uom',
                                        'allow_negative_stock', 'has_batch_no', 'create_new_batch', 'batch_number_series',
                                        'has_expiry_date', 'retain_sample', 'sample_quantity', 'has_serial_no',
                                        'serial_no_series', 'variant_of', 'variant_based_on', 'enable_deferred_expense',
                                        'no_of_months_exp', 'enable_deferred_revenue', 'no_of_months', 'purchase_uom',
                                        'min_order_qty', 'safety_stock', 'is_purchase_item', 'lead_time_days',
                                        'last_purchase_rate', 'is_customer_provided_item', 'customer', 'delivered_by_supplier',
                                        'country_of_origin', 'customs_tariff_number', 'sales_uom', 'grant_commission',
                                        'is_sales_item', 'max_discount', 'inspection_required_before_purchase',
                                        'quality_inspection_template', 'inspection_required_before_delivery',
                                        'include_item_in_manufacturing', 'is_sub_contracted_item', 'default_bom',
                                        'customer_code', 'default_item_manufacturer', 'default_manufacturer_part_no',
                                        'total_projected_qty', 'doctype', 'barcodes', 'custom_property_reference',
                                        'taxes', 'item_defaults', 'uoms', 'images', 'custom_unit_images',
                                        'custom_booking_reference', 'attributes', 'customer_items', 'supplier_items',
                                        'custom_booking_history', 'reorder_levels', 'name', 'owner', 'creation', 'modified',
                                        'modified_by', 'docstatus', 'idx', 'naming_series', 'item_group', 'item_name', 'description',
                                        'disabled', 'allow_alternative_item', 'is_stock_item', 'has_variants', 'opening_stock',
                                        'standard_rate', 'is_fixed_asset', 'auto_create_assets', 'is_grouped_asset', 'asset_category',
                                        'asset_naming_series', 'over_delivery_receipt_allowance', 'over_billing_allowance', 'image'
                                      ];
                                      return !keysToHide.includes(key.toLowerCase());
                                    }).map(key => (
                                      <div key={key} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{key.replace(/^custom_/, '').replace(/_custom_/gi, '_').replace(/custom/gi, '').replace(/_/g, ' ').trim()}:</span>
                                        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{String(details[key])}</span>
                                      </div>
                                    ))}

                                  </>
                                ) : (
                                  <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '6px 0' }}>Loading unit details...</div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                    {!loadingUnits && propertyUnits.length === 0 && (
                      <div style={{ textAlign: 'center', padding: '12px 0', color: 'var(--text-muted)', fontSize: 11 }}>No space units configured.</div>
                    )}
                  </div>
                </div>
                
                <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border-color)', paddingTop: 14, display: 'flex', gap: 10 }}>
                  <button 
                    className={`btn ${p.listedOnline ? 'btn-danger' : 'btn-primary'}`}
                    style={{ flex: 1, fontSize: 12 }}
                    onClick={() => {
                      onToggleListOnline(p.id);
                      setSelectedProp({ ...p, listedOnline: !p.listedOnline });
                    }}
                  >
                    <Globe size={13} /> {p.listedOnline ? 'Delist' : 'List Online'}
                  </button>
                  <button 
                    className="btn btn-secondary"
                    style={{ flex: 1, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                    onClick={() => onScheduleMaintenance(p)}
                  >
                    Schedule Maintenance
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Add Property Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Create New Portfolio Asset</h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 20 }}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Asset Name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Carpenters Row Tower A" className="form-input" required />
                </div>
                
                <div className="grid-2col" style={{ gap: 16, gridTemplateColumns: '1fr 1fr' }}>
                  <div className="form-group">
                    <label className="form-label">Asset Class Type</label>
                    <select value={type} onChange={(e) => setType(e.target.value)} className="form-select">
                      <option value="residential">Residential Complex</option>
                      <option value="commercial">Commercial Office</option>
                      <option value="mall">Mall space unit</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Total Sub-Units</label>
                    <input type="number" min="1" value={unitsCount} onChange={(e) => setUnitsCount(e.target.value)} className="form-input" required />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Address</label>
                  <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Carpenters Estate, Stratford, London" className="form-input" required />
                </div>

                <div className="grid-2col" style={{ gap: 16, gridTemplateColumns: '1fr 1fr' }}>
                  <div className="form-group">
                    <label className="form-label">Base Monthly Rent (USD)</label>
                    <input type="number" min="1" value={rent} onChange={(e) => setRent(e.target.value)} placeholder="e.g. 2400" className="form-input" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Total Area (Sq Ft)</label>
                    <input type="number" min="1" value={area} onChange={(e) => setArea(e.target.value)} placeholder="e.g. 1500" className="form-input" required />
                  </div>
                </div>
              </div>
              
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Property</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
