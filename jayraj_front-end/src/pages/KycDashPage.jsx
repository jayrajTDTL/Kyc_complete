import React, { useMemo, useState } from 'react';
import KycList from '../kycdash/pages/Dashboard/KycList';
import ApprovedDetail from '../kycdash/pages/ExceptionHandlers/ApprovedDetail';
import FraudDetectedDetail from '../kycdash/pages/ExceptionHandlers/FraudDetected';
import ValidationFailedDetail from '../kycdash/pages/ExceptionHandlers/ValidationFailed';
import KycFailedDetail from '../kycdash/pages/ExceptionHandlers/KycFailed';
import '../styles/KycDashPage.css';

const ShieldIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/>
  </svg>
);
const CheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const ClockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const AlertIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

export const KycDashPage = () => {
  const [filter, setFilter] = useState('all');
  const [selectedCase, setSelectedCase] = useState(null);
  const [allRows, setAllRows] = useState([]);

  const stats = useMemo(() => {
    const total     = allRows.length;
    const approved  = allRows.filter(r => r.status === 'APPROVED').length;
    const pending   = allRows.filter(r => r.status === 'PENDING').length;
    const exceptions = allRows.filter(r => !['APPROVED','PENDING'].includes(r.status)).length;
    return [
      { label: 'Total Cases',  value: total,      icon: <ShieldIcon />, tone: 'blue'  },
      { label: 'Approved',     value: approved,   icon: <CheckIcon />,  tone: 'green' },
      { label: 'Pending',      value: pending,    icon: <ClockIcon />,  tone: 'amber' },
      { label: 'Exceptions',   value: exceptions, icon: <AlertIcon />,  tone: 'red'   },
    ];
  }, [allRows]);

  const DetailComponent = useMemo(() => {
    if (!selectedCase) return null;
    if (selectedCase.status === 'APPROVED')          return ApprovedDetail;
    if (selectedCase.status === 'FRAUD_DETECTED')    return FraudDetectedDetail;
    if (selectedCase.status === 'VALIDATION_FAILED') return ValidationFailedDetail;
    return KycFailedDetail;
  }, [selectedCase]);

  const filters = [
    { key: 'all',        label: 'All Cases'  },
    { key: 'approved',   label: 'Approved'   },
    { key: 'exceptions', label: 'Exceptions' },
  ];

  return (
    <div className="kycdash-page">
      {!selectedCase && (
        <>
          <div className="kycdash-page-header">
            <h2>Compliance Dashboard</h2>
            <p>Monitor and review automated KYC verifications in real time.</p>
          </div>

          <div className="kycdash-stats">
            {stats.map(s => (
              <div key={s.label} className="kycdash-stat-card">
                <div className={`kycdash-stat-icon ${s.tone}`}>{s.icon}</div>
                <div className="kycdash-stat-body">
                  <strong>{s.value}</strong>
                  <span>{s.label}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="kycdash-toolbar">
            <span className="kycdash-toolbar-label">Filter:</span>
            {filters.map(f => (
              <button
                key={f.key}
                type="button"
                className={`kycdash-filter-btn${filter === f.key ? ' active' : ''}`}
                onClick={() => setFilter(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>

          <KycList
            filter={filter}
            onViewDetail={row => setSelectedCase(row)}
            onDataLoaded={setAllRows}
          />
        </>
      )}

      {selectedCase && DetailComponent && (
        <DetailComponent data={selectedCase} onBack={() => setSelectedCase(null)} />
      )}
    </div>
  );
};
