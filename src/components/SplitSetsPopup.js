import React, { useState } from 'react';
import './SplitSetsPopup.css';

const SplitSetsPopup = ({ 
    showSplitPopup, 
    csvData, 
    columns, // Thêm prop columns
    handleCloseSplitPopup, 
    handleSplitAndZip 
  }) => {
    const [numSets, setNumSets] = useState('');
    const [itemsPerSet, setItemsPerSet] = useState('');
    const [progress, setProgress] = useState(0);
    const [zipBase64, setZipBase64] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
  
    if (!showSplitPopup) return null;
  
    const onSplit = async () => {
      if (!numSets || !itemsPerSet || numSets <= 0 || itemsPerSet <= 0) {
        alert('Vui lòng nhập số set và số lượng mỗi set hợp lệ.');
        return;
      }
      if (!csvData || csvData.length === 0) {
        alert('Không có dữ liệu để chia. Vui lòng load file CSV trước.');
        return;
      }
  
      console.log('Splitting with:', { csvData, numSets, itemsPerSet, columns }); // Debug
  
      setIsProcessing(true);
      setProgress(0);
  
      try {
        const response = await handleSplitAndZip(csvData, numSets, itemsPerSet, setProgress);
        setZipBase64(response.zipBase64);
      } catch (error) {
        console.error('Split error:', error.response?.data || error.message);
        alert('Đã xảy ra lỗi: ' + (error.response?.data?.error || error.message));
      } finally {
        setIsProcessing(false);
      }
    };
  
    const handleDownloadZip = () => {
      if (zipBase64) {
        const link = document.createElement('a');
        link.href = `data:application/zip;base64,${zipBase64}`;
        link.download = 'split_sets.zip';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    };

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <button className="close-button" onClick={handleCloseSplitPopup}>
          X
        </button>
        <h3>Chia dữ liệu thành các set</h3>
        
        {!zipBase64 && !isProcessing && (
          <div className="input-container">
          <label>
            <span>Số set:</span>
            <input
              type="number"
              value={numSets}
              onChange={(e) => setNumSets(e.target.value)}
              min="1"
              placeholder="Nhập số set"
            />
          </label>
          <label>
            <span>Số lượng mỗi set:</span>
            <input
              type="number"
              value={itemsPerSet}
              onChange={(e) => setItemsPerSet(e.target.value)}
              min="1"
              placeholder="Nhập số lượng"
            />
          </label>
          <button className="split-button" onClick={onSplit}>
            Chia set
          </button>
        </div>
        )}

        {isProcessing && (
          <div className="progress-container">
            <p>Đang xử lý...</p>
            <progress value={progress} max="100" />
            <p>{progress}%</p>
          </div>
        )}

        {zipBase64 && !isProcessing && (
          <div className="download-container">
            <p>Đã hoàn tất chia set!</p>
            <button className="download-zip" onClick={handleDownloadZip}>
              Download ZIP
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SplitSetsPopup;