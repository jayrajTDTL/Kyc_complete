import React from 'react';
import '../../../styles/KycDashPage.css';

const checks = [
  { label: 'OCR Data Extraction',       result: 'Passed',       dot: 'pass' },
  { label: 'Face Match & Liveness',      result: 'Passed (98%)', dot: 'pass' },
  { label: 'Cross-Validation',           result: 'Matched',      dot: 'pass' },
  { label: 'Fraud & Tampering Check',    result: 'Passed',       dot: 'pass' },
];

const ApprovedDetail = ({ data, onBack }) => (
  <div className="kycdash-detail-wrap">
    <button type="button" className="kycdash-back-btn" onClick={onBack}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
      Back to Dashboard
    </button>

    <div className="kycdash-alert-banner success">
      <div className="kycdash-alert-icon">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
      <div className="kycdash-alert-body">
        <h3>KYC Approved Successfully</h3>
        <p>This application passed all automated checks. The identity of the applicant has been fully verified. No further action is required.</p>
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
            <span className="kycdash-info-value kycdash-risk-score low">{data.riskScore}/100</span>
          </div>
          {data.identityScore != null && (
            <div className="kycdash-info-row"><span className="kycdash-info-label">Identity Score</span><span className="kycdash-info-value kycdash-risk-score low">{data.identityScore}/100</span></div>
          )}
          {data.fraudScore != null && (
            <div className="kycdash-info-row"><span className="kycdash-info-label">Fraud Score</span><span className="kycdash-info-value kycdash-risk-score low">{data.fraudScore}/100</span></div>
          )}
          {data.message && (
            <div className="kycdash-info-row"><span className="kycdash-info-label">Remarks</span><span className="kycdash-info-value" style={{ fontSize:'0.8rem', color:'#4a5568' }}>{data.message}</span></div>
          )}
          <div className="kycdash-info-row"><span className="kycdash-info-label">Status</span><span className="kycdash-status ok">Approved</span></div>
          <div className="kycdash-action-row">
            <button type="button" className="kycdash-view-btn primary">Download KYC Report</button>
          </div>
        </div>
      </div>

      <div className="kycdash-detail-card">
        <div className="kycdash-detail-card-head"><h3>Verification Checks</h3></div>
        <div className="kycdash-detail-card-body">
          <ul className="kycdash-check-list">
            {checks.map(c => (
              <li key={c.label} className="kycdash-check-item">
                <span className={`dot ${c.dot}`}/>
                <span style={{ flex:1 }}>{c.label}</span>
                <span style={{ fontWeight:600, fontSize:'0.78rem', color: c.dot === 'pass' ? 'var(--success)' : 'var(--danger)' }}>{c.result}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  </div>
);

export default ApprovedDetail;
