import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ModuleCard } from '../components/Cards';
import '../styles/ModuleSelectionPage.css';

export const ModuleSelectionPage = () => {
  const navigate = useNavigate();

  const modules = [
    {
      id: 'kyc',
      title: 'KYC Verification',
      description: 'Verify identity using PAN, Aadhaar, and Bank Statement',
      icon: 'KYC',
      path: '/kyc',
    },
    {
      id: 'rekyc',
      title: 'Re-KYC Registration',
      description: 'Update and re-verify customer KYC details',
      icon: 'RE',
      path: '/rekyc',
    },
  ];

  return (
    <div className="module-selection-page">
      <div className="module-container">
        <div className="module-header">
          <h1>Select KYC Module</h1>
          <p>Choose the verification process you want to proceed with</p>
        </div>

        <div className="module-grid">
          {modules.map((module) => (
            <ModuleCard
              key={module.id}
              title={module.title}
              description={module.description}
              icon={module.icon}
              onClick={() => navigate(module.path)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
