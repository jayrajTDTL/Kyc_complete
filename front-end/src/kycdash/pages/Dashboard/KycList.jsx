import React, { useEffect, useMemo, useState } from 'react';
import { URL } from '../../../environment';

/* ── map kycStatus → display status ── */
const normalizeStatus = (kycStatus) => {
  const s = String(kycStatus || '').trim().toUpperCase();
  if (s === 'APPROVE' || s === 'APPROVED') return 'APPROVED';
  if (s === 'REJECT'  || s === 'REJECTED') return 'REJECTED';
  if (s === 'REVIEW')                      return 'REVIEW';
  if (s === 'PENDING' || s === 'IN_PROGRESS') return 'PENDING';
  if (s === 'FRAUD_DETECTED')              return 'FRAUD_DETECTED';
  if (s === 'VALIDATION_FAILED')           return 'VALIDATION_FAILED';
  return s || 'PENDING';
};

/* ── map one API row ── */
const mapRow = (item, index) => ({
  rowKey:    `${item?.caseId || 'UNKNOWN'}-${index}`,
  id:        item?.caseId   || 'N/A',
  name:      item?.finalName || 'Unknown Applicant',
  status:    normalizeStatus(item?.kycStatus),
  riskScore: Number.isFinite(Number(item?.riskScore)) ? Math.round(Number(item.riskScore)) : 0,
  reason:    item?.message  || 'No remarks available',
});

const STATUS_META = {
  APPROVED:          { label: 'Approved',          cls: 'ok'      },
  REVIEW:            { label: 'Under Review',       cls: 'warn'    },
  PENDING:           { label: 'Pending',            cls: 'warn'    },
  REJECTED:          { label: 'Rejected',           cls: 'bad'     },
  FRAUD_DETECTED:    { label: 'Fraud Detected',     cls: 'bad'     },
  VALIDATION_FAILED: { label: 'Validation Failed',  cls: 'warn'    },
  SYSTEM_ERROR:      { label: 'System Error',       cls: 'neutral' },
};

const riskClass = score => score > 70 ? 'high' : score > 40 ? 'mid' : 'low';

const KycList = ({ filter, onDataLoaded }) => {
  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      setLoading(true); setError('');
      try {
        const token = localStorage.getItem('authToken') || '';
        const res = await fetch(`${URL}api/kyc/fraud-summary`, {
          signal:  ctrl.signal,
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const list = (Array.isArray(data) ? data : []).map(mapRow);
        setRows(list);
        onDataLoaded?.(list);
      } catch (err) {
        if (err.name === 'AbortError') return;
        setRows([]);
        setError('Unable to fetch KYC data. Please try again.');
        onDataLoaded?.([]);
      } finally { setLoading(false); }
    })();
    return () => ctrl.abort();
  }, []);

  const filtered = useMemo(() => rows.filter(r => {
    if (filter === 'approved')   return r.status === 'APPROVED';
    if (filter === 'exceptions') return r.status !== 'APPROVED';
    return true;
  }), [rows, filter]);

  const headTitle = filter === 'approved' ? 'Approved Applications'
    : filter === 'exceptions' ? 'Exceptions & Failures'
    : 'All KYC Cases';

  return (
    <div className="kycdash-table-card">
      <div className="kycdash-table-head">
        <h3>{headTitle}</h3>
        <span className="kycdash-table-head-meta">
          {loading ? 'Loading…' : `${filtered.length} record${filtered.length !== 1 ? 's' : ''}`}
        </span>
      </div>

      <div className="kycdash-table-scroll">
        <table className="kycdash-table">
          <thead>
            <tr>
              <th>Case ID</th>
              <th>Applicant Name</th>
              <th>Status</th>
              <th>Risk Score</th>
              <th>Reason / Remarks</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr className="kycdash-state-row">
                <td colSpan={5}>Loading KYC applications…</td>
              </tr>
            )}
            {!loading && error && (
              <tr className="kycdash-state-row error">
                <td colSpan={5}>{error}</td>
              </tr>
            )}
            {!loading && !error && filtered.length === 0 && (
              <tr className="kycdash-state-row">
                <td colSpan={5}>No applications found for this filter.</td>
              </tr>
            )}
            {!loading && !error && filtered.map(row => {
              const sm = STATUS_META[row.status] || { label: row.status, cls: 'neutral' };
              return (
                <tr key={row.rowKey}>
                  <td><span className="kycdash-case-id">{row.id}</span></td>
                  <td><span className="kycdash-applicant-name">{row.name}</span></td>
                  <td><span className={`kycdash-status ${sm.cls}`}>{sm.label}</span></td>
                  <td>
                    <span className={`kycdash-risk-score ${riskClass(row.riskScore)}`}>
                      {row.riskScore}
                      <span style={{ fontWeight:400, fontSize:'0.72rem', opacity:0.7 }}>/100</span>
                    </span>
                  </td>
                  <td><span className="kycdash-reason">{row.reason}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default KycList;
