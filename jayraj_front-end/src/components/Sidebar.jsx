import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const C = {
  navy: '#0d2b55',
  navyDark: '#051a35',
  navyMid: '#163d6e',
  gold: '#b8922a',
  goldLight: '#d4a843',
  cream: '#f8f4e8',
  slate: '#c7d6e8',
  white: '#ffffff',
};
const shadow = { sm:'0 1px 3px rgba(13,43,85,0.08)', md:'0 4px 12px rgba(13,43,85,0.1)', lg:'0 8px 24px rgba(13,43,85,0.15)' };

const DashboardIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="3" width="8" height="8" rx="1.8" />
    <rect x="13" y="3" width="8" height="5" rx="1.8" />
    <rect x="13" y="10" width="8" height="11" rx="1.8" />
    <rect x="3" y="13" width="8" height="8" rx="1.8" />
  </svg>
);

const VerificationIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M8 3h7l4 4v13a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
    <path d="M15 3v5h5" />
    <path d="m9 14 2 2 4-4" />
  </svg>
);

const ComplianceIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 2 4 5v6c0 5.4 3.5 9.9 8 11 4.5-1.1 8-5.6 8-11V5l-8-3Z" />
    <path d="M9 12h6" />
    <path d="M12 9v6" />
  </svg>
);

const AdminIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="8" r="3" />
    <path d="M5 20a7 7 0 0 1 14 0" />
    <path d="M19.5 7.5h2" />
    <path d="M20.5 6.5v2" />
  </svg>
);

export const Sidebar = ({ isOpen, onToggle, isMobile = false }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const { isAdmin, isComplianceOfficer } = useAuth();

  const menuItems = isAdmin
    ? [{ label: 'Admin Dashboard', icon: <AdminIcon />, path: '/admin-dashboard' }]
    : isComplianceOfficer
    ? [{ label: 'Compliance Dashboard', icon: <ComplianceIcon />, path: '/compliance-dashboard' }]
    : [
        { label: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
        { label: 'KYC Verification', icon: <VerificationIcon />, path: '/kyc' },
      ];

  const handleNavigate = (path) => {
    navigate(path);
    if (isMobile && isOpen) {
      onToggle();
    }
  };

  const sidebarWidth = isMobile ? (isOpen ? '280px' : '0px') : (isOpen ? '280px' : '84px');

  return (
    <>
      {isMobile && isOpen && (
        <div
          onClick={onToggle}
          style={{
            position: 'fixed',
            top: 'var(--navbar-height)',
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(5, 26, 53, 0.45)',
            zIndex: 109,
            backdropFilter: 'blur(2px)',
          }}
        />
      )}

      <aside
        style={{
          position: 'fixed',
          left: '0',
          top: 'var(--navbar-height)',
          height: 'calc(100vh - var(--navbar-height))',
          width: sidebarWidth,
          background: 'linear-gradient(180deg, #0a2345 0%, #123461 50%, #173d6c 100%)',
          boxShadow: shadow.md,
          transition: 'width 0.3s ease, transform 0.3s ease',
          zIndex: 120,
          display: 'flex',
          flexDirection: 'column',
          borderRight: '1px solid rgba(212, 168, 67, 0.35)',
          overflow: 'hidden',
          transform: isMobile && !isOpen ? 'translateX(-100%)' : 'translateX(0)',
          pointerEvents: isMobile && !isOpen ? 'none' : 'auto',
        }}
      >
        <nav style={{ flex:1, padding: isOpen ? '26px 10px 10px' : '26px 8px 10px', overflow:'hidden', display:'flex', flexDirection:'column', justifyContent:'flex-start' }}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(212, 168, 67, 0.14)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
                style={{ width:'calc(100% - 8px)', margin:'4px', padding:isOpen ? '14px 16px' : '14px 10px', border:'none', borderRadius:'10px', background:isActive?'linear-gradient(90deg, rgba(212, 168, 67, 0.3) 0%, rgba(212, 168, 67, 0.08) 100%)':'transparent', borderLeft:isActive?`3px solid ${C.goldLight}`:'3px solid transparent', cursor:'pointer', display:'flex', alignItems:'center', justifyContent: isOpen ? 'flex-start' : 'center', gap:'12px', fontSize:'0.95rem', color:isActive?C.cream:C.slate, fontWeight:isActive?700:500, transition:'all 0.25s ease', position:'relative' }}
                onClick={() => handleNavigate(item.path)}
              >
                <span
                  style={{
                    width:'30px',
                    height:'30px',
                    borderRadius:'9px',
                    border:'1px solid rgba(212, 168, 67, 0.45)',
                    background:isActive ? 'linear-gradient(145deg, rgba(212, 168, 67, 0.32), rgba(212, 168, 67, 0.18))' : 'rgba(212, 168, 67, 0.1)',
                    display:'flex',
                    alignItems:'center',
                    justifyContent:'center',
                    color:isActive?C.cream:C.goldLight,
                    boxShadow:isActive ? '0 8px 18px rgba(212, 168, 67, 0.22)' : 'none',
                    flexShrink: 0,
                  }}
                >
                  {item.icon}
                </span>
                <span
                  style={{
                    maxWidth: isOpen ? '170px' : '0px',
                    opacity: isOpen ? 1 : 0,
                    transform: isOpen ? 'translateX(0)' : 'translateX(-8px)',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    transition: 'max-width 0.3s ease, opacity 0.22s ease, transform 0.25s ease',
                  }}
                >
                  {item.label}
                </span>
                {isOpen && isActive && <div style={{position:'absolute',right:'0',top:'50%',transform:'translateY(-50%)',width:'3px',height:'24px',background:C.goldLight,borderRadius:'3px 0 0 3px'}}/>}
              </button>
            );
          })}
        </nav>

        <div style={{ marginTop:'auto', padding: isOpen ? '16px 14px' : '12px 8px', borderTop:'1px solid rgba(212, 168, 67, 0.35)', background:'linear-gradient(180deg, rgba(5, 26, 53, 0.45), rgba(5, 26, 53, 0.7))', display:'flex', flexDirection:'column', gap:'10px' }}>
          <button 
            onClick={onToggle}
            style={{ width:'100%', padding:'11px 10px', background:'rgba(212, 168, 67, 0.12)', color:C.goldLight, border:'1px solid rgba(212, 168, 67, 0.35)', borderRadius:'8px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', fontSize:'0.85rem', fontWeight:600, transition:'all 0.3s ease' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(212, 168, 67, 0.25)';
              e.currentTarget.style.boxShadow = shadow.sm;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(212, 168, 67, 0.12)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            title="Toggle Sidebar"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points={isOpen ? '15 18 9 12 15 6' : '9 18 15 12 9 6'} />
            </svg>
            <span
              style={{
                maxWidth: isOpen ? '140px' : '0px',
                opacity: isOpen ? 1 : 0,
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                transition: 'max-width 0.3s ease, opacity 0.22s ease',
              }}
            >
              {isMobile ? 'Close Menu' : 'Toggle Sidebar'}
            </span>
          </button>
        </div>
      </aside>
    </>
  );
};
