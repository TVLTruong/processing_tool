import React from 'react';

const FileDropZone = ({ file, handleFileChange, handleDrop, handleDragOver, fileInputRef }) => {
  return (
    <div 
      className="upload-container"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        style={{ display: 'none' }}
        id="fileInput"
        ref={fileInputRef} // Gắn ref vào input
      />
      <label htmlFor="fileInput">
        {file ? file.name : 'Kéo thả file CSV vào đây hoặc nhấn để chọn file'}
      </label>
    </div>
  );
};

export default FileDropZone;