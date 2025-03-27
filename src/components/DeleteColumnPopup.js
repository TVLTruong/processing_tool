// DeleteColumnPopup.js
import React from 'react';
import './DeleteColumnPopup.css'; // Thêm import CSS

const DeleteColumnPopup = ({ 
  showDeletePopup, 
  columns, 
  selectedColumns, 
  handleClosePopup, 
  handleColumnSelect, 
  handleDeleteSelectedColumns,
  handleSelectAll 
}) => {
  if (!showDeletePopup) return null;

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <button className="close-button" onClick={handleClosePopup}>
          X
        </button>
        <h3>Chọn cột để xoá</h3>
        <table className="popup-table">
          <thead>
            <tr>
              <th className="checkbox-column">
                <label className="select-all-label">
                  <input 
                    type="checkbox" 
                    checked={selectedColumns.length === columns.length}
                    onChange={handleSelectAll}
                  />
                  Chọn tất cả
                </label>
              </th>
              <th className="name-column">Tên cột</th>
            </tr>
          </thead>
          <tbody>
            {columns.map((column) => (
              <tr key={column}>
                <td className="checkbox-column">
                  <input
                    type="checkbox"
                    checked={selectedColumns.includes(column)}
                    onChange={() => {
                      console.log("Checkbox clicked for column:", column); // Kiểm tra
                      handleColumnSelect(column);
                    }}
                  />
                </td>
                <td className="name-column">{column}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <button 
          className="delete-selected" 
          onClick={handleDeleteSelectedColumns}
        >
          Xoá
        </button>
      </div>
    </div>
  );
};

export default DeleteColumnPopup;