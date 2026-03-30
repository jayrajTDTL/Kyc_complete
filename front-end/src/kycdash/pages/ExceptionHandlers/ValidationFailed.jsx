import React from 'react';
import '../../../styles/KycDashPage.css';

const ValidationFailedDetail = ({ data, onBack }) => {
  const checks = [
    { label: 'OCR Data Extraction',  dot: 'pass', result: 'Success'  },
    { label: 'Data Cross-Validation',dot: 'fail', result: 'Failed'   },
    { label: 'Fraud Check',          dot: 'pend', result: 'Pending'  },
    { label: 'Risk Scoring',         dot: 'pend', result: 'Pending'  },
  ];

  return (
    <div className="kycdash-detail-wrap">
      <button type="button" className="kycdash-back-btn" onClick={onBack}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        Back to Dashboard
      </button>

      <div className="kycdash-alert-banner warning">
        <div className="kycdash-alert-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        </div>
        <div className="kycdash-alert-body">
          <h3>Document Validation Failed</h3>
          <p>The application was rejected due to <strong>{data.reason}</strong>. The applicant needs to verify their details and re-upload valid documents.</p>
        </div>
      </div>

      <div className="kycdash-grid">
        <div className="kycdash-detail-card">
          <div className="kycdash-detail-card-head"><h3>Applicant Information</h3></div>
          <div className="kycdash-detail-card-body">
            <div className="kycdash-info-row"><span className="kycdash-info-label">Case ID</span><span className="kycdash-info-value">{data.id}</span></div>
            <div className="kycdash-info-row"><span className="kycdash-info-label">Full Name</span><span className="kycdash-info-value">{data.name}</span></div>
            <div className="kycdash-info-row"><span className="kycdash-info-label">Date</span><span className="kycdash-info-value">{data.date}</span></div>
            <div className="kycdash-info-row">
              <span className="kycdash-info-label">Risk Score</span>
              <span className="kycdash-info-value kycdash-risk-score mid">{data.riskScore}/100</span>
            </div>
            <div className="kycdash-info-row"><span className="kycdash-info-label">Status</span><span className="kycdash-status warn">Validation Failed</span></div>
            <div className="kycdash-action-row">
              <button type="button" className="kycdash-view-btn primary">Request Re-Upload</button>
              <button type="button" className="kycdash-view-btn">Review Manually</button>
            </div>
          </div>
        </div>

        <div className="kycdash-detail-card">
          <div className="kycdash-detail-card-head"><h3>Validation Triggers</h3></div>
          <div className="kycdash-detail-card-body">
            <p style={{ margin:'0 0 1rem', fontSize:'0.85rem', color:'var(--g600)', lineHeight:1.55 }}>
              DOB mismatch found between Aadhaar and PAN. Manual validation recommended.
            </p>
            <ul className="kycdash-check-list">
              {checks.map(c => (
                <li key={c.label} className="kycdash-check-item">
                  <span className={`dot ${c.dot}`}/>
                  <span style={{ flex:1 }}>{c.label}</span>
                  <span style={{ fontWeight:600, fontSize:'0.78rem', color: c.dot === 'pass' ? 'var(--success)' : c.dot === 'fail' ? 'var(--danger)' : 'var(--g400)' }}>{c.result}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ValidationFailedDetail;
