import React from 'react';
import '../styles/Table.css';

export const Table = ({ headers, rows, title }) => {
  return (
    <div className="table-container">
      {title && <h3 className="table-title">{title}</h3>}
      <table className="activity-table">
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length > 0 ? (
            rows.map((row, idx) => (
              <tr key={idx}>
                {Object.values(row).map((cell, cellIdx) => (
                  <td key={cellIdx}>{cell}</td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={headers.length} className="empty-row">
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
