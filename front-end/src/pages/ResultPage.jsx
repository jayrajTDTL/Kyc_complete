import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import '../styles/ResultPage.css';

export const ResultPage = () => {
  const navigate = useNavigate();
  const [result] = useState({
    name: 'Rajesh Kumar',
    pan: 'ABCDE1234F',
    aadhaar: 'XXXX XXXX XXXX 1234',
    riskScore: 15,
    status: 'APPROVED',
    fraudFlags: [],
    verifiedDocuments: ['PAN', 'Aadhaar', 'Bank Statement'],
  });

  return (
    <div className="result-page">
      <div className="result-container">
        <div className="result-header">
          <div className={`result-status ${result.status.toLowerCase()}`}>
            {result.status === 'APPROVED' ? '✓' : result.status === 'REJECTED' ? '✗' : '⏳'}
          </div>
          <h1>{result.status}</h1>
          <p>KYC Verification Complete</p>
        </div>

        <div className="result-card">
          <div className="result-section">
            <h3>Verification Details</h3>
            <div className="detail-row">
              <label>Name:</label>
              <span>{result.name}</span>
            </div>
            <div className="detail-row">
              <label>PAN:</label>
              <span>{result.pan}</span>
            </div>
            <div className="detail-row">
              <label>Aadhaar:</label>
              <span>{result.aadhaar}</span>
            </div>
          </div>

          <div className="result-section">
            <h3>Risk Assessment</h3>
            <div className="risk-score">
              <div className="score-value">{result.riskScore}%</div>
              <div className="score-label">Risk Score</div>
              <div className="score-bar">
                <div 
                  className="score-fill"
                  style={{
                    width: `${result.riskScore}%`,
                    backgroundColor: result.riskScore < 30 ? '#169b5d' : result.riskScore < 70 ? '#ff9a45' : '#d82b4e'
                  }}
                ></div>
              </div>
            </div>
          </div>

          <div className="result-section">
            <h3>Verified Documents</h3>
            <div className="documents-list">
              {result.verifiedDocuments.map((doc) => (
                <div key={doc} className="document-item">
                  <span className="check-mark">✓</span>
                  <span>{doc}</span>
                </div>
              ))}
            </div>
          </div>

          {result.fraudFlags.length > 0 && (
            <div className="result-section warning">
              <h3>⚠ Fraud Flags</h3>
              <ul>
                {result.fraudFlags.map((flag, idx) => (
                  <li key={idx}>{flag}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="result-actions">
          <Button 
            onClick={() => navigate('/dashboard')}
            variant="primary"
          >
            Back to Dashboard
          </Button>
          <Button 
            onClick={() => navigate('/modules')}
            variant="secondary"
          >
            Start New Verification
          </Button>
        </div>
      </div>
    </div>
  );
};
