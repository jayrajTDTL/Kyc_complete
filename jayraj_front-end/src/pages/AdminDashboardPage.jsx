import React, { useMemo, useState } from 'react';
import '../styles/AdminDashboardPage.css';

const kycCasesData = [
  {
    caseId: 'KYC-10421',
    name: 'Rohit Sharma',
    pan: 'AYCPR5421F',
    riskScore: 91,
    status: 'Rejected',
    fraudFlags: 'PAN mismatch, IP anomaly',
    date: '26 Mar 2026',
  },
  {
    caseId: 'KYC-10422',
    name: 'Priya Mehta',
    pan: 'BHGPM8741R',
    riskScore: 22,
    status: 'Approved',
    fraudFlags: 'None',
    date: '26 Mar 2026',
  },
  {
    caseId: 'KYC-10423',
    name: 'Aditya Nair',
    pan: 'CNBPA1211D',
    riskScore: 67,
    status: 'Pending',
    fraudFlags: 'Aadhaar OCR mismatch',
    date: '25 Mar 2026',
  },
  {
    caseId: 'KYC-10424',
    name: 'Nisha Kamat',
    pan: 'DLTPK9090P',
    riskScore: 83,
    status: 'Fraud',
    fraudFlags: 'Face mismatch, device fingerprint',
    date: '25 Mar 2026',
  },
  {
    caseId: 'KYC-10425',
    name: 'Sameer Jain',
    pan: 'EUPSJ4591K',
    riskScore: 39,
    status: 'Approved',
    fraudFlags: 'None',
    date: '24 Mar 2026',
  },
  {
    caseId: 'KYC-10426',
    name: 'Kavita Rao',
    pan: 'FOMPR4182M',
    riskScore: 74,
    status: 'Pending',
    fraudFlags: 'Address mismatch',
    date: '24 Mar 2026',
  },
];

const usersData = [
  { id: 'USR-901', name: 'Rohit Sharma', email: 'rohit@nhfs.com', role: 'Member', status: 'Active' },
  { id: 'USR-902', name: 'Priya Mehta', email: 'priya@nhfs.com', role: 'Member', status: 'Blocked' },
  { id: 'USR-903', name: 'Aditya Nair', email: 'aditya@nhfs.com', role: 'Analyst', status: 'Active' },
  { id: 'USR-904', name: 'Kavita Rao', email: 'kavita@nhfs.com', role: 'Member', status: 'Active' },
];

const activityLogs = [
  { time: '10:42 AM', text: 'KYC-10424 marked as Fraud by Risk Engine', tone: 'danger' },
  { time: '10:16 AM', text: 'User USR-902 blocked by Admin (Manual Review)', tone: 'warning' },
  { time: '09:58 AM', text: 'KYC-10422 approved after document verification', tone: 'success' },
  { time: '09:25 AM', text: 'Address mismatch rule triggered for KYC-10426', tone: 'warning' },
];

export const AdminDashboardPage = () => {
  const [riskFilter, setRiskFilter] = useState('all');
  const [users, setUsers] = useState(usersData);

  const stats = useMemo(() => {
    const totalUsers = users.length;
    const totalCases = kycCasesData.length;
    const pending = kycCasesData.filter((c) => c.status === 'Pending').length;
    const approved = kycCasesData.filter((c) => c.status === 'Approved').length;
    const rejected = kycCasesData.filter((c) => c.status === 'Rejected').length;
    const fraud = kycCasesData.filter((c) => c.status === 'Fraud' || c.riskScore >= 80).length;

    return [
      { label: 'Total Users', value: totalUsers, tone: 'blue' },
      { label: 'Total KYC Cases', value: totalCases, tone: 'indigo' },
      { label: 'Pending', value: pending, tone: 'amber' },
      { label: 'Approved', value: approved, tone: 'teal' },
      { label: 'Rejected', value: rejected, tone: 'rose' },
      { label: 'Fraud Cases', value: fraud, tone: 'danger' },
    ];
  }, [users]);

  const filteredCases = useMemo(() => {
    if (riskFilter === 'high') {
      return kycCasesData.filter((item) => item.riskScore >= 70);
    }
    return kycCasesData;
  }, [riskFilter]);

  const flaggedCases = useMemo(
    () => kycCasesData.filter((item) => item.fraudFlags !== 'None' || item.status === 'Fraud'),
    []
  );

  const toggleUserStatus = (id) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === id
          ? { ...user, status: user.status === 'Active' ? 'Blocked' : 'Active' }
          : user
      )
    );
  };

  const getRiskClass = (score) => {
    if (score >= 80) return 'high';
    if (score >= 50) return 'medium';
    return 'low';
  };

  const getStatusClass = (status) => {
    if (status === 'Approved') return 'approved';
    if (status === 'Pending') return 'pending';
    if (status === 'Rejected') return 'rejected';
    return 'fraud';
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Central control for KYC operations, user management, fraud monitoring, and activity tracking.</p>
      </div>

      <section className="admin-stat-grid">
        {stats.map((item) => (
          <article key={item.label} className={`admin-stat-card ${item.tone}`}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </article>
        ))}
      </section>

      <section className="admin-grid">
        <article className="panel-card kyc-cases-card">
          <div className="panel-head">
            <h3>KYC Cases</h3>
            <div className="risk-filter-wrap">
              <label htmlFor="riskFilter">Risk Filter</label>
              <select
                id="riskFilter"
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
              >
                <option value="all">All Cases</option>
                <option value="high">High Risk Only</option>
              </select>
            </div>
          </div>

          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Case ID</th>
                  <th>Name</th>
                  <th>PAN</th>
                  <th>Risk Score</th>
                  <th>Status</th>
                  <th>Fraud Flags</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredCases.map((row) => (
                  <tr key={row.caseId} className={row.riskScore >= 70 ? 'high-risk-row' : ''}>
                    <td data-label="Case ID" className="case-id">{row.caseId}</td>
                    <td data-label="Name">{row.name}</td>
                    <td data-label="PAN">{row.pan}</td>
                    <td data-label="Risk Score">
                      <span className={`risk-badge ${getRiskClass(row.riskScore)}`}>{row.riskScore}</span>
                    </td>
                    <td data-label="Status">
                      <span className={`status-badge ${getStatusClass(row.status)}`}>{row.status}</span>
                    </td>
                    <td data-label="Fraud Flags" className="flags-cell">{row.fraudFlags}</td>
                    <td data-label="Date">{row.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="panel-card fraud-alerts-card">
          <div className="panel-head">
            <h3>Fraud Alerts</h3>
            <span>{flaggedCases.length} flagged</span>
          </div>

          <div className="fraud-alert-list">
            {flaggedCases.map((item) => (
              <div key={item.caseId} className="fraud-alert-item">
                <div>
                  <strong>{item.caseId} • {item.name}</strong>
                  <p>{item.fraudFlags}</p>
                </div>
                <span className="alert-score">Risk {item.riskScore}</span>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="admin-grid secondary-grid">
        <article className="panel-card user-management-card">
          <div className="panel-head">
            <h3>User Management</h3>
            <span>Block or activate users</span>
          </div>

          <div className="user-list">
            {users.map((user) => (
              <div key={user.id} className="user-row">
                <div>
                  <strong>{user.name}</strong>
                  <p>{user.email} • {user.role}</p>
                </div>
                <button
                  type="button"
                  className={`user-action-btn ${user.status === 'Active' ? 'block' : 'activate'}`}
                  onClick={() => toggleUserStatus(user.id)}
                >
                  {user.status === 'Active' ? 'Block' : 'Activate'}
                </button>
              </div>
            ))}
          </div>
        </article>

        <article className="panel-card recent-activity-card">
          <div className="panel-head">
            <h3>Recent Activity Logs</h3>
            <span>Live operational trail</span>
          </div>

          <ul className="activity-list">
            {activityLogs.map((log) => (
              <li key={`${log.time}-${log.text}`} className={`activity-item ${log.tone}`}>
                <span>{log.time}</span>
                <p>{log.text}</p>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </div>
  );
};
