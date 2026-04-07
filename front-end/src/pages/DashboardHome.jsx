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
    </div>
  );
};
