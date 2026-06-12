import React, { useState, useEffect, useRef } from 'react';
import { RotateCw, Maximize2, Layers, HelpCircle, Merge, Trash2, Plus, Sparkles, Building } from 'lucide-react';
import { ERPNEXT_CONFIG } from '../config';

// Modern Architectural Building Units Data (Resembling the attached image)
const INITIAL_UNITS = [
  { id: 'GF-L', floor: 0, name: 'Ground Floor Glass Retail', x: 0, y: 0, width: 3.4, height: 3.5, rent: 8500, area: 1800, status: 'occupied', tenant: 'Alpha Glass Cafe', category: 'Retail', expiry: '2028-12-31' },
  { id: 'GF-R', floor: 0, name: 'Ground Floor Wood Lounge', x: 3.8, y: 0, width: 3.2, height: 3.5, rent: 6200, area: 1400, status: 'vacant', tenant: null, category: 'Lounge', expiry: null },
  { id: 'L1-L', floor: 1, name: 'Upper Glass Balcony Suite', x: 0, y: 0, width: 3.4, height: 3.5, rent: 9500, area: 1800, status: 'occupied', tenant: 'Aura Design Group', category: 'Premium Office', expiry: '2027-06-30' },
  { id: 'L1-R', floor: 1, name: 'Upper Mezzanine Loft', x: 3.8, y: 0, width: 3.2, height: 3.5, rent: 7800, area: 1400, status: 'maintenance', tenant: null, category: 'Loft Suite', expiry: '2026-09-01' }
];

export default function Mall3DView({ compact = false, properties = [] }) {
  const [selectedPropertyId, setSelectedPropertyId] = useState('PROP-9910');
  const [units, setUnits] = useState(INITIAL_UNITS);
  const [activeFloor, setActiveFloor] = useState(0); // 0 = Ground, 1 = First
  const [showAllFloors, setShowAllFloors] = useState(true); // Stacked 3D View vs Single Floor Focus
  const [selectedUnitIds, setSelectedUnitIds] = useState([]);
  const [hoveredUnit, setHoveredUnit] = useState(null);

  // Dynamic layout generation effect for other properties from ERPNext API
  useEffect(() => {
    async function fetchUnits() {
      if (selectedPropertyId === 'PROP-9910') {
        setUnits(INITIAL_UNITS);
        return;
      }

      try {
        const res = await fetch(`${ERPNEXT_CONFIG.url}/api/method/erpnext.api.get_units?property_group=${selectedPropertyId}`, {
          headers: {
            'Authorization': `token ${ERPNEXT_CONFIG.apiKey}:${ERPNEXT_CONFIG.apiSecret}`,
            'Content-Type': 'application/json'
          }
        });
        if (res.ok) {
          const data = await res.json();
          const list = data.message || data;
          if (Array.isArray(list) && list.length > 0) {
            setUnits(list.map((u, idx) => ({
              id: u.name || u.id || `UNIT-${idx}`,
              floor: u.floor || (idx % 2),
              name: u.unit_name || u.name || `Unit ${idx}`,
              x: u.x !== undefined ? u.x : (idx % 2 === 0 ? 0 : 3.8),
              y: u.y !== undefined ? u.y : 0,
              width: u.width || 3.2,
              height: u.height || 3.5,
              rent: u.rent || 5000,
              area: u.area || 1500,
              status: u.status || (idx % 3 === 0 ? 'vacant' : idx % 3 === 1 ? 'occupied' : 'maintenance'),
              tenant: u.tenant || null,
              category: u.category || 'Retail',
              expiry: u.expiry || null
            })));
            return;
          }
        }
      } catch (err) {
        console.warn('ERPNext API get_units fetch failed, using fallback mock data:', err);
      }

      const currentProp = properties.find(p => p.id === selectedPropertyId) || {
        name: 'Carpenters Asset',
        unitsCount: 4,
        type: 'commercial',
        rent: 8000,
        area: 3200
      };

      const generated = [
        { id: 'GF-L', floor: 0, name: `${currentProp.name} GF Left`, x: 0, y: 0, width: 3.4, height: 3.5, rent: Math.round(currentProp.rent * 0.3), area: Math.round(currentProp.area * 0.3), status: 'occupied', tenant: 'Premier Tenant', category: 'Commercial', expiry: '2027-12-31' },
        { id: 'GF-R', floor: 0, name: `${currentProp.name} GF Right`, x: 3.8, y: 0, width: 3.2, height: 3.5, rent: Math.round(currentProp.rent * 0.2), area: Math.round(currentProp.area * 0.2), status: 'vacant', tenant: null, category: 'Commercial', expiry: null },
        { id: 'L1-L', floor: 1, name: `${currentProp.name} L1 Left`, x: 0, y: 0, width: 3.4, height: 3.5, rent: Math.round(currentProp.rent * 0.3), area: Math.round(currentProp.area * 0.3), status: 'occupied', tenant: 'Nexus Agency', category: 'Office', expiry: '2028-06-30' },
        { id: 'L1-R', floor: 1, name: `${currentProp.name} L1 Right`, x: 3.8, y: 0, width: 3.2, height: 3.5, rent: Math.round(currentProp.rent * 0.2), area: Math.round(currentProp.area * 0.2), status: 'maintenance', tenant: null, category: 'Office', expiry: '2026-11-30' }
      ];
      setUnits(generated);
    }

    fetchUnits();
  }, [selectedPropertyId, properties]);
  
  // 3D View Transformations (optimized angles matching the attached photo)
  const [rotation, setRotation] = useState(32); // angle in degrees
  const [tilt, setTilt] = useState(0.42); // tilt ratio
  const [zoom, setZoom] = useState(compact ? 46 : 58); // scale sizing

  const canvasRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Drag interaction controls
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const dragStartRotation = useRef(32);
  const dragStartTilt = useRef(0.42);
  const dragMoved = useRef(false);

  // Aggregation state
  const [aggregatedSpaces, setAggregatedSpaces] = useState([]);

  // Sync aggregated statuses
  useEffect(() => {
    const updatedUnits = units.map(u => {
      const isAgg = aggregatedSpaces.some(agg => agg.units.includes(u.id));
      if (isAgg) {
        return { ...u, status: 'aggregated' };
      } else if (u.status === 'aggregated') {
        return { ...u, status: 'vacant' };
      }
      return u;
    });

    const hasChanged = JSON.stringify(updatedUnits) !== JSON.stringify(units);
    if (hasChanged) {
      setUnits(updatedUnits);
    }
  }, [aggregatedSpaces]);

  // Main Canvas Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Dark slate gray background for the 3D space viewport to make glass & lighting POP!
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, rect.width, rect.height);
    
    // Project coordinates
    const cx = rect.width / 2;
    const cy = rect.height / 2 + (showAllFloors ? (compact ? 70 : 100) : (compact ? 20 : 35));
    const angleRad = (rotation * Math.PI) / 180;
    
    const project = (gx, gy, floorLevel) => {
      // Offset center coordinate system
      const x = (gx - 3.5) * zoom;
      const y = (gy - 3) * zoom;
      
      const floorSpacingHeight = compact ? 130 : 160;
      let z = 0;
      
      if (showAllFloors) {
        z = floorLevel * floorSpacingHeight;
      } else {
        z = activeFloor === floorLevel ? 30 : -9999; 
      }
      
      const screenX = cx + (x - y) * Math.cos(angleRad);
      const screenY = cy + (x + y) * Math.sin(angleRad) * tilt - z;
      
      return { x: screenX, y: screenY };
    };

    // Draw Concrete Back/Side Walls (Image Backdrop)
    const drawBackdropWall = () => {
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      
      // Ground concrete back wall polygon
      const w0 = project(0, 3.5, 0);
      const w1 = project(0, 3.5, 2); // extend to top level
      const w2 = project(7, 3.5, 2);
      const w3 = project(7, 3.5, 0);

      // Draw horizontal mortar lines / texture on back concrete wall
      ctx.beginPath();
      ctx.moveTo(w0.x, w0.y);
      ctx.lineTo(w1.x, w1.y);
      ctx.lineTo(w2.x, w2.y);
      ctx.lineTo(w3.x, w3.y);
      ctx.closePath();
      ctx.fillStyle = '#1e293b';
      ctx.fill();
      ctx.stroke();

      // Concrete wall shadows & seams
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      for (let i = 0.5; i < 2; i += 0.5) {
        const pS = project(0, 3.5, i);
        const pE = project(7, 3.5, i);
        ctx.beginPath();
        ctx.moveTo(pS.x, pS.y);
        ctx.lineTo(pE.x, pE.y);
        ctx.stroke();
      }
    };

    // Draw Stairs (Center Connecting Staircase)
    const drawStairs = () => {
      const stairsX = 3.6;
      const stairsY = 1.8;
      const steps = 14;
      
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;

      for (let i = 0; i < steps; i++) {
        const t = i / steps;
        const nextT = (i + 1) / steps;
        
        // stair position interpolating from Z=0 to Z=1
        const sx = stairsX - t * 0.8;
        const sy = stairsY;
        const sz = t;

        const nextSx = stairsX - nextT * 0.8;
        const nextSz = nextT;

        const p0 = project(sx, sy, sz);
        const p1 = project(sx, sy + 0.6, sz);
        const p2 = project(nextSx, sy + 0.6, nextSz);
        const p3 = project(nextSx, sy, nextSz);

        // Draw individual steps
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.lineTo(p3.x, p3.y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }

      // Draw Staircase handrails
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1.5;
      const rS = project(stairsX, stairsY + 0.6, 0.2);
      const rE = project(stairsX - 0.8, stairsY + 0.6, 1.2);
      ctx.beginPath();
      ctx.moveTo(rS.x, rS.y);
      ctx.lineTo(rE.x, rE.y);
      ctx.stroke();
    };

    // Draw architectural block (glass facade or warm wood room)
    const drawIsoBlock = (unit, isHovered, isSelected) => {
      const { x: gx, y: gy, width: gw, height: gh, floor: f, status, id } = unit;
      
      const c0 = project(gx, gy, f);
      const c1 = project(gx + gw, gy, f);
      const c2 = project(gx + gw, gy + gh, f);
      const c3 = project(gx, gy + gh, f);

      // Floor height
      const wallH = compact ? 50 : 64;
      
      const t0 = { x: c0.x, y: c0.y - wallH };
      const t1 = { x: c1.x, y: c1.y - wallH };
      const t2 = { x: c2.x, y: c2.y - wallH };
      const t3 = { x: c3.x, y: c3.y - wallH };

      // Styling based on architectural class: Left glass frame vs right warm wood box
      const isLeft = id.includes('-L');
      
      // Glass colors
      let glassFill = isSelected ? 'rgba(217, 119, 6, 0.4)' : (isHovered ? 'rgba(56, 189, 248, 0.35)' : 'rgba(56, 189, 248, 0.12)');
      let glassStroke = isSelected ? '#d97706' : (isHovered ? '#38bdf8' : 'rgba(56, 189, 248, 0.4)');
      
      // Wood colors
      let woodFloorFill = '#854d0e';
      let woodWallLeft = '#713f12';
      let woodWallRight = '#451a03';
      
      if (isSelected) {
        woodFloorFill = '#b45309';
        woodWallLeft = '#d97706';
        woodWallRight = '#b45309';
      } else if (isHovered) {
        woodFloorFill = '#a16207';
      }

      if (isLeft) {
        // --- GLASS BOX ARCHITECTURE ---
        // Floor plate
        ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
        ctx.beginPath();
        ctx.moveTo(c0.x, c0.y);
        ctx.lineTo(c1.x, c1.y);
        ctx.lineTo(c2.x, c2.y);
        ctx.lineTo(c3.x, c3.y);
        ctx.closePath();
        ctx.fill();

        // Left glass panel
        ctx.fillStyle = glassFill;
        ctx.beginPath();
        ctx.moveTo(c0.x, c0.y);
        ctx.lineTo(c3.x, c3.y);
        ctx.lineTo(t3.x, t3.y);
        ctx.lineTo(t0.x, t0.y);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = glassStroke;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Right glass panel
        ctx.beginPath();
        ctx.moveTo(c3.x, c3.y);
        ctx.lineTo(c2.x, c2.y);
        ctx.lineTo(t2.x, t2.y);
        ctx.lineTo(t3.x, t3.y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Structural metal frame beams
        ctx.strokeStyle = '#020617';
        ctx.lineWidth = 2.5;
        
        ctx.beginPath();
        ctx.moveTo(c0.x, c0.y);
        ctx.lineTo(t0.x, t0.y);
        ctx.moveTo(c3.x, c3.y);
        ctx.lineTo(t3.x, t3.y);
        ctx.moveTo(c2.x, c2.y);
        ctx.lineTo(t2.x, t2.y);
        ctx.stroke();

        // Top metal border
        ctx.beginPath();
        ctx.moveTo(t0.x, t0.y);
        ctx.lineTo(t1.x, t1.y);
        ctx.lineTo(t2.x, t2.y);
        ctx.lineTo(t3.x, t3.y);
        ctx.closePath();
        ctx.stroke();

        // Thin horizontal mullion lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 1;
        const midYLeft_c = (c0.y + c3.y) / 2;
        const midYLeft_t = (t0.y + t3.y) / 2;
        const midXLeft = (c0.x + c3.x) / 2;
        
        ctx.beginPath();
        ctx.moveTo(midXLeft, midYLeft_c);
        ctx.lineTo(midXLeft, midYLeft_t);
        ctx.stroke();

      } else {
        // --- WOOD LOUNGE & MEZZANINE ARCHITECTURE ---
        // Floor plate (Warm wood floor texture)
        ctx.fillStyle = woodFloorFill;
        ctx.beginPath();
        ctx.moveTo(c0.x, c0.y);
        ctx.lineTo(c1.x, c1.y);
        ctx.lineTo(c2.x, c2.y);
        ctx.lineTo(c3.x, c3.y);
        ctx.closePath();
        ctx.fill();

        // Left solid wooden wall paneling
        ctx.fillStyle = woodWallLeft;
        ctx.beginPath();
        ctx.moveTo(c0.x, c0.y);
        ctx.lineTo(c3.x, c3.y);
        ctx.lineTo(t3.x, t3.y);
        ctx.lineTo(t0.x, t0.y);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.08)';
        ctx.stroke();

        // Back solid wooden wall paneling
        ctx.fillStyle = woodWallRight;
        ctx.beginPath();
        ctx.moveTo(c3.x, c3.y);
        ctx.lineTo(c2.x, c2.y);
        ctx.lineTo(t2.x, t2.y);
        ctx.lineTo(t3.x, t3.y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Structural accents: horizontal warm lighting lines on right wood walls (Mezzanine shelves)
        if (f === 1) {
          ctx.strokeStyle = '#f59e0b'; // glowing shelf lights
          ctx.shadowColor = '#f59e0b';
          ctx.shadowBlur = 4;
          ctx.lineWidth = 2;

          for (let s = 1; s <= 3; s++) {
            const hShift = wallH * (s / 4);
            const wS = { x: c3.x, y: c3.y - hShift };
            const wE = { x: c2.x, y: c2.y - hShift };
            ctx.beginPath();
            ctx.moveTo(wS.x, wS.y);
            ctx.lineTo(wE.x, wE.y);
            ctx.stroke();
          }
          // Reset shadow
          ctx.shadowBlur = 0;
        }

        // Draw simple wooden bench mockup on GF-R
        if (f === 0) {
          ctx.fillStyle = '#1e1b4b'; // dark wood bench seat
          const b0 = project(gx + 0.8, gy + 1, f);
          const b1 = project(gx + 2.4, gy + 1, f);
          const b2 = project(gx + 2.4, gy + 1.6, f);
          const b3 = project(gx + 0.8, gy + 1.6, f);
          
          ctx.beginPath();
          ctx.moveTo(b0.x, b0.y - 4);
          ctx.lineTo(b1.x, b1.y - 4);
          ctx.lineTo(b2.x, b2.y - 4);
          ctx.lineTo(b3.x, b3.y - 4);
          ctx.closePath();
          ctx.fill();

          // Bench legs
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(b0.x, b0.y); ctx.lineTo(b0.x, b0.y - 4);
          ctx.moveTo(b1.x, b1.y); ctx.lineTo(b1.x, b1.y - 4);
          ctx.moveTo(b2.x, b2.y); ctx.lineTo(b2.x, b2.y - 4);
          ctx.stroke();
        }

        // Frame borders
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(t0.x, t0.y);
        ctx.lineTo(t1.x, t1.y);
        ctx.lineTo(t2.x, t2.y);
        ctx.lineTo(t3.x, t3.y);
        ctx.closePath();
        ctx.stroke();
      }

      // Draw Glowing status indicators on the floor
      const statusColors = {
        vacant: '#10b981',      // Neon Green
        occupied: '#ef4444',    // Coral Red
        maintenance: '#f59e0b', // Amber Orange
        aggregated: '#3b82f6'   // Electric Blue
      };
      
      const glowColor = statusColors[status] || '#10b981';
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = 6;
      ctx.fillStyle = glowColor;
      ctx.beginPath();
      
      // Draw a center indicator dot
      const dotX = (c0.x + c2.x) / 2;
      const dotY = (c0.y + c2.y) / 2;
      ctx.arc(dotX, dotY, 4, 0, 2 * Math.PI);
      ctx.fill();
      ctx.shadowBlur = 0; // reset

      // ID Labels
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 10px var(--font-sans)';
      ctx.textAlign = 'center';
      ctx.fillText(id, dotX, dotY - 10);
    };

    // Draw base platforms
    drawBackdropWall();
    
    // Draw staircase connector in the middle
    if (showAllFloors) {
      drawStairs();
    }

    // Sort units back-to-front for rendering
    const sortedUnits = [...units].sort((a, b) => {
      // Z-order layering
      if (a.floor !== b.floor) {
        return a.floor - b.floor;
      }
      return (a.x + a.y) - (b.x + b.y);
    });

    sortedUnits.forEach(unit => {
      if (showAllFloors || activeFloor === unit.floor) {
        const isSelected = selectedUnitIds.includes(unit.id);
        const isHovered = hoveredUnit && hoveredUnit.id === unit.id;
        drawIsoBlock(unit, isHovered, isSelected);
      }
    });

  }, [units, activeFloor, showAllFloors, rotation, tilt, zoom, mousePos, selectedUnitIds, hoveredUnit, compact]);

  // Ray-casting collision hit-test
  function pointInPolygon(point, polygon) {
    const { x, y } = point;
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].x, yi = polygon[i].y;
      const xj = polygon[j].x, yj = polygon[j].y;
      const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  }

  const handleCanvasClick = () => {
    if (dragMoved.current) return;
    if (hoveredUnit) {
      if (hoveredUnit.status !== 'vacant' && !selectedUnitIds.includes(hoveredUnit.id)) {
        return; 
      }
      if (selectedUnitIds.includes(hoveredUnit.id)) {
        setSelectedUnitIds(selectedUnitIds.filter(id => id !== hoveredUnit.id));
      } else {
        setSelectedUnitIds([...selectedUnitIds, hoveredUnit.id]);
      }
    } else {
      setSelectedUnitIds([]);
    }
  };

  const handleMouseDown = (e) => {
    isDragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY };
    dragStartRotation.current = rotation;
    dragStartTilt.current = tilt;
    dragMoved.current = false;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleMouseLeave = () => {
    isDragging.current = false;
    setHoveredUnit(null);
  };

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });

    if (isDragging.current) {
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
        dragMoved.current = true;
      }
      
      const newRotation = Math.max(0, Math.min(90, dragStartRotation.current + dx * 0.45));
      const newTilt = Math.max(0.2, Math.min(0.7, dragStartTilt.current - dy * 0.005));
      
      setRotation(newRotation);
      setTilt(newTilt);
      setHoveredUnit(null);
    } else {
      const cx = rect.width / 2;
      const cy = rect.height / 2 + (showAllFloors ? (compact ? 70 : 100) : (compact ? 20 : 35));
      const angleRad = (rotation * Math.PI) / 180;

      const localProject = (gx, gy, floorLevel) => {
        const px = (gx - 3.5) * zoom;
        const py = (gy - 3) * zoom;
        const floorSpacingHeight = compact ? 130 : 160;
        let pz = 0;
        if (showAllFloors) {
          pz = floorLevel * floorSpacingHeight;
        } else {
          pz = activeFloor === floorLevel ? 30 : -9999; 
        }
        const screenX = cx + (px - py) * Math.cos(angleRad);
        const screenY = cy + (px + py) * Math.sin(angleRad) * tilt - pz;
        return { x: screenX, y: screenY };
      };

      let foundUnit = null;
      // Search top/front units first
      const sortedUnits = [...units].sort((a, b) => {
        if (a.floor !== b.floor) return b.floor - a.floor;
        return (b.x + b.y) - (a.x - a.y);
      });
      
      for (const unit of sortedUnits) {
        if (!showAllFloors && activeFloor !== unit.floor) continue;

        const { x: gx, y: gy, width: gw, height: gh, floor: f } = unit;
        const c0 = localProject(gx, gy, f);
        const c1 = localProject(gx + gw, gy, f);
        const c2 = localProject(gx + gw, gy + gh, f);
        const c3 = localProject(gx, gy + gh, f);

        const wallH = compact ? 50 : 64;
        const t0 = { x: c0.x, y: c0.y - wallH };
        const t1 = { x: c1.x, y: c1.y - wallH };
        const t2 = { x: c2.x, y: c2.y - wallH };
        const t3 = { x: c3.x, y: c3.y - wallH };

        // Raycast bounding box
        if (pointInPolygon({ x, y }, [t0, t1, t2, t3])) {
          foundUnit = unit;
          break;
        }
      }
      setHoveredUnit(foundUnit);
    }
  };

  const handleCreateAggregation = (e) => {
    e.preventDefault();
    if (selectedUnitIds.length < 2) return;

    const selectedUnits = units.filter(u => selectedUnitIds.includes(u.id));
    const totalArea = selectedUnits.reduce((acc, u) => acc + u.area, 0);
    const baseRent = selectedUnits.reduce((acc, u) => acc + u.rent, 0);
    const aggregatedRent = Math.round(baseRent * 0.9);

    const newAgg = {
      id: `AGG-${Math.floor(100 + Math.random() * 900)}`,
      name: `Merged Unit (${selectedUnitIds.join(' + ')})`,
      units: [...selectedUnitIds],
      area: totalArea,
      rent: aggregatedRent
    };

    setAggregatedSpaces([...aggregatedSpaces, newAgg]);
    setSelectedUnitIds([]);
  };

  const handleDeleteAggregation = (aggId) => {
    setAggregatedSpaces(aggregatedSpaces.filter(a => a.id !== aggId));
  };

  return (
    <div className="card-panel" style={{ position: 'relative' }}>
      <div className="view-header" style={{ marginBottom: 20 }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Building size={22} className="text-yellow" style={{ color: 'var(--brand-color)' }} />
            Premium 3D Architecture Tracker
          </h2>
          <p className="view-subtitle">High-fidelity glass & wood duplex layout visualizer. Click and drag to orbit model.</p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Property Portfolio:</span>
            <select 
              value={selectedPropertyId} 
              onChange={(e) => setSelectedPropertyId(e.target.value)}
              className="form-select"
              style={{ minWidth: 220, padding: '6px 12px', fontSize: 12 }}
            >
              <option value="PROP-9910">Stratford 3D Architectural Mockup</option>
              {properties.filter(p => p.id !== 'PROP-9910').map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
              ))}
            </select>
          </div>
          <button 
            className={`btn ${showAllFloors ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setShowAllFloors(!showAllFloors)}
            style={{ padding: '6px 12px', fontSize: 12 }}
          >
            <Layers size={14} /> {showAllFloors ? 'Stack Layout' : 'Focus Level'}
          </button>
        </div>
      </div>

      <div className="grid-2col" style={{ gridTemplateColumns: compact ? '2fr 1fr' : '78% calc(22% - 24px)', gap: compact ? 16 : 24 }}>
        <div style={{ position: 'relative', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          {!showAllFloors && (
            <div style={{ position: 'absolute', top: 16, left: 16, display: 'flex', flexDirection: 'column', gap: 6, zIndex: 10 }}>
              <button className={`btn btn-sm ${activeFloor === 1 ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveFloor(1)} style={{ padding: '4px 8px', fontSize: 11 }}>L1: Mezzanine & Balcony</button>
              <button className={`btn btn-sm ${activeFloor === 0 ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveFloor(0)} style={{ padding: '4px 8px', fontSize: 11 }}>GF: Glass Cafe & Wood Lounge</button>
            </div>
          )}

          <canvas 
            ref={canvasRef}
            style={{ width: '100%', height: compact ? 420 : 560, display: 'block', cursor: isDragging.current ? 'grabbing' : hoveredUnit ? 'pointer' : 'default', borderRadius: 'var(--radius-lg)' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onClick={handleCanvasClick}
          />

          <div style={{ position: 'absolute', bottom: 16, left: 16, right: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(15, 23, 42, 0.9)', padding: '10px 16px', borderRadius: 'var(--radius-md)', border: '1px solid #334155', color: '#f8fafc', zIndex: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
              <span style={{ fontSize: 11, color: '#94a3b8' }}>Orbit Yaw</span>
              <input type="range" min="5" max="85" value={rotation} onChange={(e) => setRotation(Number(e.target.value))} style={{ accentColor: 'var(--brand-color)', width: 80 }} />
              
              <span style={{ fontSize: 11, color: '#94a3b8', marginLeft: 10 }}>Pitch</span>
              <input type="range" min="20" max="70" value={Math.round(tilt * 100)} onChange={(e) => setTilt(Number(e.target.value) / 100)} style={{ accentColor: 'var(--brand-color)', width: 80 }} />
              
              <span style={{ fontSize: 11, color: '#94a3b8', marginLeft: 10 }}>Scale</span>
              <input type="range" min="30" max="75" value={zoom} onChange={(e) => setZoom(Number(e.target.value))} style={{ accentColor: 'var(--brand-color)', width: 80 }} />
            </div>
            
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981' }} />
                <span style={{ fontSize: 10, color: '#cbd5e1' }}>Vacant</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }} />
                <span style={{ fontSize: 10, color: '#cbd5e1' }}>Occupied</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }} />
                <span style={{ fontSize: 10, color: '#cbd5e1' }}>Service</span>
              </div>
            </div>
          </div>

          {hoveredUnit && (showAllFloors || activeFloor === hoveredUnit.floor) && (
            <div style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(15, 23, 42, 0.95)', border: '1px solid #334155', borderRadius: 'var(--radius-md)', padding: 14, width: 230, pointerEvents: 'none', boxShadow: 'var(--shadow-lg)', backdropFilter: 'blur(10px)', color: '#f8fafc', zIndex: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 10, color: 'var(--brand-color)', fontWeight: 600 }}>{hoveredUnit.id}</span>
                <span className={`badge ${hoveredUnit.status === 'vacant' ? 'badge-success' : hoveredUnit.status === 'occupied' ? 'badge-danger' : hoveredUnit.status === 'maintenance' ? 'badge-warning' : 'badge-info'}`} style={{ color: '#fff' }}>
                  {hoveredUnit.status}
                </span>
              </div>
              <h4 style={{ fontSize: 13, marginBottom: 8, color: '#ffffff' }}>{hoveredUnit.name}</h4>
              
              <div style={{ borderTop: '1px solid #334155', paddingTop: 6, display: 'flex', flexDirection: 'column', gap: 4, fontSize: 11, color: '#94a3b8' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Area:</span>
                  <span style={{ color: '#ffffff', fontWeight: 500 }}>{hoveredUnit.area} sq ft</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Base Rent:</span>
                  <span style={{ color: '#ffffff', fontWeight: 500 }}>${hoveredUnit.rent}/mo</span>
                </div>
                {hoveredUnit.tenant && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                      <span>Tenant:</span>
                      <span style={{ color: 'var(--brand-color)', fontWeight: 600 }}>{hoveredUnit.tenant}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Category:</span>
                      <span style={{ color: '#ffffff' }}>{hoveredUnit.category}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Space Aggregator Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card-panel" style={{ padding: 18, background: 'var(--bg-secondary)', borderStyle: 'dashed' }}>
            <h3 style={{ fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              Space Aggregator
            </h3>
            <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 14 }}>
              Select multiple vacant structures on the 3D model to merge them.
            </p>

            {selectedUnitIds.length > 0 ? (
              <div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                  {selectedUnitIds.map(id => (
                    <span key={id} className="badge badge-success" style={{ gap: 4 }}>
                      {id}
                      <span style={{ cursor: 'pointer', fontWeight: 900 }} onClick={() => setSelectedUnitIds(selectedUnitIds.filter(x => x !== id))}>×</span>
                    </span>
                  ))}
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 10, marginBottom: 14, fontSize: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Combined Area:</span>
                    <span style={{ fontWeight: 600 }}>
                      {units.filter(u => selectedUnitIds.includes(u.id)).reduce((acc, u) => acc + u.area, 0)} sq ft
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Merge Rent (10% off):</span>
                    <span style={{ color: 'var(--brand-color)', fontWeight: 600 }}>
                      ${Math.round(units.filter(u => selectedUnitIds.includes(u.id)).reduce((acc, u) => acc + u.rent, 0) * 0.9)}/mo
                    </span>
                  </div>
                </div>

                <button 
                  className="btn btn-primary" 
                  disabled={selectedUnitIds.length < 2} 
                  style={{ width: '100%', fontSize: 12 }}
                  onClick={handleCreateAggregation}
                >
                  <Plus size={13} /> Merge Selected Units
                </button>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--text-muted)', fontSize: 12 }}>
                Click vacant nodes on the building layout map.
              </div>
            )}
          </div>

          <div>
            <h3 style={{ fontSize: '0.9rem', marginBottom: 10 }}>
              Active Merged Spaces ({aggregatedSpaces.length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {aggregatedSpaces.map(space => (
                <div key={space.id} style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--brand-color)' }}>{space.name}</span>
                    <button 
                      onClick={() => handleDeleteAggregation(space.id)}
                      style={{ background: 'none', border: 'none', color: 'var(--color-danger)', cursor: 'pointer', display: 'flex', padding: 2 }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
                    {space.units.map(uId => (
                      <span key={uId} className="badge badge-info" style={{ fontSize: 9, padding: '2px 6px' }}>{uId}</span>
                    ))}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-secondary)' }}>
                    <span>Area: <strong>{space.area} sq ft</strong></span>
                    <span>Rent: <strong>${space.rent}/mo</strong></span>
                  </div>
                </div>
              ))}
              {aggregatedSpaces.length === 0 && (
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', padding: '10px 0' }}>
                  No aggregated structures.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
