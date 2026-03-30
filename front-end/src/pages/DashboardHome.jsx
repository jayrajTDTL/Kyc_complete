import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Table } from '../components/Table';
import '../styles/DashboardHome.css';

export const DashboardHome = () => {
  const navigate = useNavigate();
  const customerName = 'Rohan Sharma';
  const kycStatus = 'In Progress';
  const currentStep = 2;
  const statusSteps = ['Profile Details', 'Document Upload', 'Verification', 'Completed'];
  const completionPercent = Math.round(((currentStep + 1) / statusSteps.length) * 100);

  const quickStats = [
    { label: 'Profile Completion', value: `${completionPercent}%` },
    { label: 'Pending Tasks', value: '2' },
    { label: 'Last Updated', value: 'Today, 10:45 AM' },
  ];

  const activityRows = [
    {
      activity: 'PAN uploaded',
      date: '26 Mar 2026, 10:45 AM',
      status: <span className="status-chip approved">Completed</span>,
    },
    {
      activity: 'Aadhaar verification started',
      date: '26 Mar 2026, 09:20 AM',
      status: <span className="status-chip pending">In Progress</span>,
    },
    {
      activity: 'Profile details updated',
      date: '25 Mar 2026, 07:05 PM',
      status: <span className="status-chip approved">Completed</span>,
    },
  ];   

  return (
    <div className="dashboard-home">
      <section className="welcome-card">
        <h1>Welcome back, {customerName}</h1>
        <p>Track your KYC journey and complete pending steps from your dashboard.</p>
        <div className="welcome-stats">
          {quickStats.map((item) => (
            <article key={item.label} className="welcome-stat-item">
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </article>
          ))}
        </div>
      </section>

      <div className="dashboard-grid customer-grid">
        <section className="panel-card">
          <div className="panel-head">
            <h3>KYC Status</h3>
            <span className="panel-caption">Current application state</span>
          </div>
          <div className="kyc-status-wrap">
            <span className="status-chip pending">{kycStatus}</span>
            <p>Your documents are being validated. We will notify you once verification is complete.</p>
          </div>
        </section>

        <section className="panel-card start-kyc-card">
          <div className="panel-head">
            <h3>Start KYC</h3>
            <span className="panel-caption">Begin a new verification</span>
          </div>
          <p>Click below to start or continue your KYC process securely.</p>
          <button className="action-btn" onClick={() => navigate('/kyc')}>
            Start KYC
          </button>
        </section>
      </div>

      <div className="dashboard-insights-grid">
        <section className="panel-card">
          <div className="panel-head">
            <h3>KYC Status Tracker</h3>
            <span className="panel-caption">Step-by-step progress</span>
          </div>
          <div className="tracker-progress-meta">
            <span>Overall progress</span>
            <strong>{completionPercent}% Complete</strong>
          </div>
          <div className="tracker-progress-track">
            <div className="tracker-progress-fill" style={{ width: `${completionPercent}%` }} />
          </div>
          <div className="status-tracker">
            {statusSteps.map((step, idx) => (
              <div key={step} className="tracker-step">
                <div className={`step-dot ${idx <= currentStep ? 'active' : ''}`}>{idx + 1}</div>
                <div className="step-label">{step}</div>
                {idx < statusSteps.length - 1 && <div className="step-line" />}
              </div>
            ))}
          </div>
        </section>

        <section className="panel-card recent-card">
          <div className="panel-head">
            <h3>Recent Activity</h3>
            <span className="panel-caption">Latest customer actions</span>
          </div>
          <Table
            headers={['Activity', 'Date & Time', 'Status']}
            rows={activityRows}
          />
        </section>
      </div>
    </div>
  );
};
