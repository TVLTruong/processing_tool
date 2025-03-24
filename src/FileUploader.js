import React, { useState } from "react";
import axios from "axios";
import "./App.css"; // Import file CSS

const FileUploader = () => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [csvData, setCsvData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState([]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === "text/csv") {
      setFile(selectedFile);
      setError("");
    } else {
      setFile(null);
      setError("Vui lòng chọn file CSV.");
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      processFile(droppedFile);
    }
  };
  
  const processFile = (selectedFile) => {
    if (selectedFile && selectedFile.type === "text/csv") {
      setFile(selectedFile);
      setError("");
      setSuccess("File đã được chọn thành công.");
    } else {
      setFile(null);
      setError("Vui lòng chọn file CSV.");
      setSuccess("");
    }
  };

  // Chặn hành vi mặc định của trình duyệt khi kéo file
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };


  const handleReadFile = async () => {
    if (!file) {
      setError("Vui lòng chọn file trước khi đọc.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        "https://tvltruong1594-processing-tool.hf.space/read-csv",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setSuccess("File đã được đọc thành công.");
      setCsvData(response.data.data);
      setColumns(response.data.columns);
    } catch (err) {
      setError("Đã xảy ra lỗi khi đọc file: " + err.message);
    }
  };

  const handleDeleteColumns = () => {
    setShowDeletePopup(true);
  };

  const handleDownload = () => {
    const header = columns.join(",") + "\n";
    const rows = csvData
      .map((row) =>
        columns
          .map((col) => {
            const value = row[col];
            return typeof value === "string" ? `"${value}"` : value;
          })
          .join(",")
      )
      .join("\n");

    const csvContent =
      "data:text/csv;charset=utf-8," + encodeURIComponent(header + rows);
    const link = document.createElement("a");
    link.setAttribute("href", csvContent);
    link.setAttribute("download", "data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClosePopup = () => {
    setShowDeletePopup(false);
    setSelectedColumns([]);
  };

  const handleColumnSelect = (column) => {
    let newSelectedColumns;
    
    if (selectedColumns.includes(column)) {
      newSelectedColumns = selectedColumns.filter(col => col !== column);
    } else {
      newSelectedColumns = [...selectedColumns, column];
    }
    
    setSelectedColumns(newSelectedColumns);
  };
  

  const handleDeleteSelectedColumns = () => {
    const newColumns = columns.filter(col => !selectedColumns.includes(col));
    const newData = csvData.map(row => {
      const newRow = { ...row };
      selectedColumns.forEach(col => delete newRow[col]);
      return newRow;
    });

    setColumns(newColumns);
    setCsvData(newData);
    setShowDeletePopup(false);
    setSelectedColumns([]);
  };

  const handleResetFile = () => {
    setFile(null); // Reset file
    setCsvData([]); // Xóa dữ liệu CSV
    setColumns([]); // Xóa danh sách cột
    setError(''); // Xóa thông báo lỗi
    setSuccess(''); // Xóa thông báo thành công
    handleFileChange({ target: { files: [] } }); // Reset input file
  };

  const handleSelectAll = () => {
    setSelectedColumns(selectedColumns.length === columns.length ? [] : [...columns]);
  };
  

  return (
    <div>
      {/* Khung upload file */}
      <div className="upload-container"
          onDragOver={handleDragOver}
          onDrop={handleDrop}>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          style={{ display: 'none' }}
          id="fileInput"
        />
        <label htmlFor="fileInput">
          {file ? file.name : 'Kéo thả file CSV vào đây hoặc nhấn để chọn file'}
        </label>
      </div>
  
      {/* Thông báo lỗi và thành công */}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
  
      {/* Nút đọc file và đổi file */}
      <div style={{ marginTop: '10px' }}>
        <button className="read-file" onClick={handleReadFile} disabled={!file}>
          Read File
        </button>
        {csvData.length > 0 && (
          <button className="change-file" onClick={handleResetFile} style={{ marginLeft: '10px' }}>
            Reset
          </button>
        )}
      </div>
  
      {/* Hiển thị tiêu đề bảng */}
      {csvData.length > 0 && <h2>Nội dung file CSV</h2>}

      {/* Nút Xoá cột và Download (chỉ hiện khi có dữ liệu) */}
      {csvData.length > 0 && (
        <div style={{ marginTop: '20px', marginBottom: '10px', textAlign: 'right', marginRight: '5%' }}>
          <button className="delete-columns" onClick={handleDeleteColumns} style={{ marginRight: '10px' }}>
            Xoá cột
          </button>
          <button className="download" onClick={handleDownload}>
            Download
          </button>
        </div>
      )}
  
      {/* Hiển thị bảng dữ liệu CSV */}
      {csvData.length > 0 && (
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
      )}
  
      {/* Popup xoá cột */}
      {showDeletePopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <button className="close-button" onClick={handleClosePopup}>
              X
            </button>
            <h3>Chọn cột để xoá</h3>
            <table className="popup-table">
              <thead>
                <tr>
                  <th>
                  <label style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                  <input 
                      type="checkbox" 
                      checked={selectedColumns.length === columns.length} // Kiểm tra nếu tất cả cột đã được chọn
                      onChange={handleSelectAll} 
                      style={{ marginRight: '5px' }}
                    />

                    Chọn tất cả
                  </label>

                  </th>
                  <th>Tên cột</th>
                </tr>
              </thead>
              <tbody>
                {columns.map((column) => (
                  <tr key={column}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedColumns.includes(column)}
                        onChange={() => handleColumnSelect(column)}
                      />
                    </td>
                    <td>{column}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="delete-selected" onClick={handleDeleteSelectedColumns} style={{ marginTop: '10px' }}>
              Xoá
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
