import React from 'react';
import '../../../styles/KycDashPage.css';

const FraudDetectedDetail = ({ data, onBack }) => {
  const checks = [
    { label: 'Potential edits in PAN image layers', dot: 'fail',  result: 'Detected'  },
    { label: 'Face Match & Liveness',               dot: 'pass',  result: 'Passed (92%)' },
    { label: 'Document Tampering Check',            dot: 'fail',  result: 'Failed'    },
    { label: 'Database Duplicity Check',            dot: 'pass',  result: 'Passed'    },
  ];

  return (
    <div className="kycdash-detail-wrap">
      <button type="button" className="kycdash-back-btn" onClick={onBack}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        Back to Dashboard
      </button>

      <div className="kycdash-alert-banner danger">
        <div className="kycdash-alert-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        </div>
        <div className="kycdash-alert-body">
          <h3>High-Risk Case Detected</h3>
          <p>Our AI system flagged this application due to <strong>{data.reason}</strong>. The verification process has been automatically halted pending compliance review.</p>
        </div>
      </div>

      <div className="kycdash-grid">
        <div className="kycdash-detail-card">
          <div className="kycdash-detail-card-head"><h3>Applicant Information</h3></div>
          <div className="kycdash-detail-card-body">
            <div className="kycdash-info-row"><span className="kycdash-info-label">Case ID</span><span className="kycdash-info-value">{data.id}</span></div>
            <div className="kycdash-info-row"><span className="kycdash-info-label">Full Name</span><span className="kycdash-info-value">{data.name}</span></div>
            <div className="kycdash-info-row">
              <span className="kycdash-info-label">Risk Score</span>
              <span className="kycdash-info-value kycdash-risk-score high">{data.riskScore}/100</span>
            </div>
            {data.identityScore != null && (
              <div className="kycdash-info-row"><span className="kycdash-info-label">Identity Score</span><span className="kycdash-info-value kycdash-risk-score mid">{data.identityScore}/100</span></div>
            )}
            {data.fraudScore != null && (
              <div className="kycdash-info-row"><span className="kycdash-info-label">Fraud Score</span><span className="kycdash-info-value kycdash-risk-score high">{data.fraudScore}/100</span></div>
            )}
            {data.message && (
              <div className="kycdash-info-row"><span className="kycdash-info-label">Remarks</span><span className="kycdash-info-value" style={{ fontSize:'0.8rem', color:'#4a5568' }}>{data.message}</span></div>
            )}
            <div className="kycdash-info-row"><span className="kycdash-info-label">Status</span><span className="kycdash-status bad">Fraud Detected</span></div>
            <div className="kycdash-action-row">
              <button type="button" className="kycdash-view-btn primary">Escalate to Compliance</button>
              <button type="button" className="kycdash-view-btn danger">Block Applicant</button>
            </div>
          </div>
        </div>

        <div className="kycdash-detail-card">
          <div className="kycdash-detail-card-head"><h3>AI Fraud Analysis</h3></div>
          <div className="kycdash-detail-card-body">
            {data.fraudSignals && data.fraudSignals.length > 0 ? (
              <ul className="kycdash-check-list">
                {data.fraudSignals.map((signal, i) => (
                  <li key={i} className="kycdash-check-item">
                    <span className="dot fail"/>
                    <span style={{ flex:1 }}>{signal}</span>
                    <span style={{ fontWeight:600, fontSize:'0.78rem', color:'var(--danger)' }}>Flagged</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ margin:0, fontSize:'0.85rem', color:'var(--g600)' }}>No specific fraud signals recorded.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FraudDetectedDetail;
