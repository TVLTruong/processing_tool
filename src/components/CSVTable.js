import React from 'react';

const CSVTable = ({ csvData, columns }) => {
  if (!csvData.length) return null;

  return (
    <>
      <div className="csv-table-container">
        <table className="csv-table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column}>{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {csvData.map((row, index) => (
              <tr key={index}>
                {columns.map((column) => (
                  <td key={column}>{row[column]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default CSVTable;