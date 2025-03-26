import React from 'react';

const ActionButtons = ({ 
  file, 
  csvData, 
  handleReadFile, 
  handleResetFile, 
  handleDeleteColumns, 
  handleTransformData, 
  handleDownload,
  handleSplitSets // Đảm bảo prop này được truyền
}) => {
  return (
    <>
      <div style={{ marginTop: '10px' }}>
        <button 
          className="read-file" 
          onClick={handleReadFile} 
          disabled={!file}
        >
          Read File
        </button>
        {csvData.length > 0 && (
          <button 
            className="change-file" 
            onClick={handleResetFile} 
            style={{ marginLeft: '10px' }}
          >
            Reset
          </button>
        )}
      </div>

      {csvData.length > 0 && (
        <div style={{ marginTop: '20px', marginBottom: '10px', textAlign: 'right', marginRight: '5%' }}>
          <button 
            className="delete-columns" 
            onClick={handleDeleteColumns} 
            style={{ marginRight: '10px' }}
          >
            Xoá cột
          </button>
          <button 
            className="transform-data" 
            onClick={handleTransformData} 
            style={{ marginRight: '10px' }}
          >
            Chuyển đổi dữ liệu
          </button>
          <button 
            className="split-sets" 
            onClick={handleSplitSets} 
            style={{ marginRight: '10px' }}
          >
            Chia set
          </button>
          <button 
            className="download" 
            onClick={handleDownload}
          >
            Download
          </button>
        </div>
      )}
    </>
  );
};

export default ActionButtons;