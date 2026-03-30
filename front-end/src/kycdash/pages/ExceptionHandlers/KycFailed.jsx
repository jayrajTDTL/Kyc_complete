import React from 'react';
import '../../../styles/KycDashPage.css';

const KycFailedDetail = ({ data, onBack }) => (
  <div className="kycdash-detail-wrap">
    <button type="button" className="kycdash-back-btn" onClick={onBack}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
      Back to Dashboard
    </button>

    <div className="kycdash-alert-banner neutral">
      <div className="kycdash-alert-icon">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      </div>
      <div className="kycdash-alert-body">
        <h3>System Error / Process Halted</h3>
        <p>The KYC verification process failed due to a technical error: <strong>{data.reason}</strong>. The applicant's data is safely stored in our secure vault.</p>
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
            <span className="kycdash-info-value kycdash-risk-score neutral" style={{ color:'var(--g600)' }}>{data.riskScore}/100</span>
          </div>
          <div className="kycdash-info-row"><span className="kycdash-info-label">Status</span><span className="kycdash-status neutral">System Error</span></div>
          <div className="kycdash-action-row">
            <button type="button" className="kycdash-view-btn primary">Restart KYC Process</button>
            <button type="button" className="kycdash-view-btn">Contact Support</button>
          </div>
        </div>
      </div>

      <div className="kycdash-detail-card">
        <div className="kycdash-detail-card-head"><h3>Diagnostic Logs</h3></div>
        <div className="kycdash-detail-card-body">
          <div className="kycdash-log-block">
            <div className="log-info">[14:32:01] INFO: Starting KYC pipeline for {data.id}</div>
            <div className="log-info">[14:32:03] INFO: Extracting OCR data from identity document</div>
            <div className="log-info">[14:32:04] INFO: Forwarding UID to central registry</div>
            <div className="log-error">[14:32:34] ERROR: ReadTimeout (API gateway)</div>
            <div className="log-error">[14:32:34] FATAL: Pipeline halted, marked SYSTEM_ERROR</div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default KycFailedDetail;
