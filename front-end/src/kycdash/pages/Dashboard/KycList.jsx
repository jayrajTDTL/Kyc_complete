import React, { useEffect, useMemo, useState } from 'react';
import { URL } from '../../../environment';

/* ── status normalizer ── */
const normalizeStatus = (status, riskScore) => {
  const s = String(status || '').trim().toUpperCase();
  const statusMap = { APPROVE: 'APPROVED', REJECT: 'REJECTED' };
  const mapped = statusMap[s] || s;
  if (['APPROVED', 'PENDING', 'REJECTED', 'FRAUD_DETECTED', 'VALIDATION_FAILED', 'SYSTEM_ERROR'].includes(mapped))
    return mapped;
  if (Number(riskScore) >= 70) return 'FRAUD_DETECTED';
  if (Number(riskScore) >= 45) return 'VALIDATION_FAILED';
  return mapped || 'PENDING';
};

/* ── map API response row ── */
const mapApiRow = (item, index) => {
  const riskScore     = Number.isFinite(Number(item?.riskScore))     ? Math.round(Number(item.riskScore))     : 0;
  const identityScore = Number.isFinite(Number(item?.identityScore)) ? Math.round(Number(item.identityScore)) : null;
  const fraudScore    = Number.isFinite(Number(item?.fraudScore))    ? Math.round(Number(item.fraudScore))    : null;

  const rawSignals = item?.fraudSignals || item?.fraudFlags || [];
  const fraudSignals = Array.isArray(rawSignals)
    ? rawSignals.map(s => String(s).trim()).filter(Boolean)
    : [];

  return {
    rowKey:        `${item?.caseId || 'UNKNOWN'}-${index}`,
    id:            item?.caseId     || 'N/A',
    name:          item?.finalName  || item?.name || 'Unknown Applicant',
    status:        normalizeStatus(item?.status || item?.kycStatus, riskScore),
    riskScore,
    identityScore,
    fraudScore,
    fraudSignals,
    message:       item?.message   || '',
  };
};

const STATUS_META = {
  APPROVED:          { label: 'Approved',          cls: 'ok'      },
  PENDING:           { label: 'Pending',            cls: 'warn'    },
  REJECTED:          { label: 'Rejected',           cls: 'bad'     },
  FRAUD_DETECTED:    { label: 'Fraud Detected',     cls: 'bad'     },
  VALIDATION_FAILED: { label: 'Validation Failed',  cls: 'warn'    },
  SYSTEM_ERROR:      { label: 'System Error',       cls: 'neutral' },
};

const riskMeta = score => score > 70 ? 'high' : score > 40 ? 'mid' : 'low';

/* ── component ── */
const KycList = ({ filter, onViewDetail, onDataLoaded }) => {
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
        const list = (Array.isArray(data) ? data : [data]).map(mapApiRow);
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
              {filter !== 'exceptions' && <th>Action</th>}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr className="kycdash-state-row">
                <td colSpan={filter !== 'exceptions' ? 6 : 5}>Loading KYC applications…</td>
              </tr>
            )}
            {!loading && error && (
              <tr className="kycdash-state-row error">
                <td colSpan={filter !== 'exceptions' ? 6 : 5}>{error}</td>
              </tr>
            )}
            {!loading && !error && filtered.length === 0 && (
              <tr className="kycdash-state-row">
                <td colSpan={filter !== 'exceptions' ? 6 : 5}>No applications found for this filter.</td>
              </tr>
            )}
            {!loading && !error && filtered.map(row => {
              const sm = STATUS_META[row.status] || { label: row.status, cls: 'neutral' };
              const reason = row.message || (row.fraudSignals?.length > 0 ? row.fraudSignals.join('; ') : 'No remarks');
              return (
                <tr key={row.rowKey}>
                  <td><span className="kycdash-case-id">{row.id}</span></td>
                  <td><span className="kycdash-applicant-name">{row.name}</span></td>
                  <td><span className={`kycdash-status ${sm.cls}`}>{sm.label}</span></td>
                  <td>
                    <span className={`kycdash-risk-score ${riskMeta(row.riskScore)}`}>
                      {row.riskScore}<span style={{ fontWeight:400, fontSize:'0.72rem', opacity:0.7 }}>/100</span>
                    </span>
                  </td>
                  <td><span className="kycdash-reason">{reason}</span></td>
                  {filter !== 'exceptions' && (
                    <td>
                      <button
                        type="button"
                        className="kycdash-view-btn"
                        onClick={() => onViewDetail?.(row)}
                      >
                        View
                      </button>
                    </td>
                  )}
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
