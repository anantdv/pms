import React from 'react';
import { BadgeHelp, Compass, DollarSign, Home, CheckCircle2 } from 'lucide-react';

export default function Listings({ properties }) {
  const onlineListings = properties.filter(p => p.listedOnline);

  return (
    <div>
      <div className="view-header">
        <div>
          <h1 className="view-title">Public Online Marketplace</h1>
          <p className="view-subtitle">Simulation of what external prospective tenants see when searching properties online.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
        {onlineListings.map(listing => (
          <div key={listing.id} className="card-panel" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {/* Visual Header / Mock Image */}
            <div style={{ 
              height: 140, 
              background: `linear-gradient(135deg, #f1f5f9 0%, #cbd5e1 100%)`, 
              padding: 20, 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'space-between',
              borderBottom: '1px solid var(--border-color)'
            }}>
              <span className="badge badge-success" style={{ alignSelf: 'flex-start' }}>Available Now</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Home size={22} className="text-yellow" style={{ color: 'var(--brand-color)' }} />
                <h3 style={{ fontSize: '1.1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{listing.name}</h3>
              </div>
            </div>

            {/* Details */}
            <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div style={{ marginBottom: 16 }}>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>{listing.address}</p>
                <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-secondary)' }}>
                  <span>Area: <strong>{listing.area} sq ft</strong></span>
                  <span>Units: <strong>{listing.unitsCount} Available</strong></span>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Monthly Asking</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--brand-color)' }}>${listing.rent.toLocaleString()}</span>
                </div>
                <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: 12, gap: 4 }}>
                  <CheckCircle2 size={13} /> Apply Space
                </button>
              </div>
            </div>
          </div>
        ))}

        {onlineListings.length === 0 && (
          <div className="card-panel" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', borderStyle: 'dashed' }}>
            <BadgeHelp size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 12px' }} />
            <h3>No Active Online Listings</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>
              Go to the <strong>Properties</strong> module and click "List Online" to syndicate portfolio properties to the marketplace.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
