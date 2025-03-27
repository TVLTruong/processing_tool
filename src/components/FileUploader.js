import React, { useState, useRef } from 'react';
import axios from 'axios';
import FileDropZone from './FileDropZone';
import MessageDisplay from './MessageDisplay';
import ActionButtons from './ActionButtons';
import CSVTable from './CSVTable';
import DeleteColumnPopup from './DeleteColumnPopup';
import SplitSetsPopup from './SplitSetsPopup';
import './FileUploader.css'; 

const FileUploader = () => {
    const [file, setFile] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [csvData, setCsvData] = useState([]);
    const [columns, setColumns] = useState([]);
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [selectedColumns, setSelectedColumns] = useState([]);
    const [showSplitPopup, setShowSplitPopup] = useState(false);
    const [isReading, setIsReading] = useState(false); 
    const [readProgress, setReadProgress] = useState(0); 
    const [rowCount, setRowCount] = useState(0);
    const fileInputRef = useRef(null);

    // File handling functions
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

    const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    };

    // Data processing functions
    const handleReadFile = async () => {
        if (!file) {
          setError("Vui lòng chọn file trước khi đọc.");
          return;
        }
    
        setIsReading(true);
        setReadProgress(0);
    
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
              onUploadProgress: (progressEvent) => {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                setReadProgress(percentCompleted);
              },
            }
          );
          const data = response.data.data;
          setCsvData(data);
          setColumns(response.data.columns);
          setRowCount(data.length); // Cập nhật số dòng từ dữ liệu trả về
          setSuccess(`File đã được đọc thành công.`);
        } catch (err) {
          setError("Đã xảy ra lỗi khi đọc file: " + err.message);
        } finally {
          setIsReading(false);
        }
    };

    const handleTransformData = () => {
    try {
        // Kiểm tra cấu trúc dữ liệu
        if (!csvData.length || !columns.includes('Review') || 
            !columns.includes('attribute') || !columns.includes('entity') || 
            !columns.includes('sentiment')) {
            setError("Định dạng dữ liệu không hợp lệ. Cần có các cột Review, attribute, entity và sentiment.");
            return;
        }

        // Các cột cần thiết cho định dạng mới (đã loại bỏ *)
        const newColumns = [
            'Review',
            'FACILITIES#CLEANLINESS', 'FACILITIES#COMFORT', 'FACILITIES#DESIGN&FEATURES', 
            'FACILITIES#GENERAL', 'FACILITIES#MISCELLANEOUS', 'FACILITIES#PRICES', 
            'FACILITIES#QUALITY', 'FOOD&DRINKS#MISCELLANEOUS', 'FOOD&DRINKS#PRICES', 
            'FOOD&DRINKS#QUALITY', 'FOOD&DRINKS#STYLE&OPTIONS', 'HOTEL#CLEANLINESS', 
            'HOTEL#COMFORT', 'HOTEL#DESIGN&FEATURES', 'HOTEL#GENERAL', 'HOTEL#MISCELLANEOUS', 
            'HOTEL#PRICES', 'HOTEL#QUALITY', 'LOCATION#GENERAL', 'ROOMS#CLEANLINESS', 
            'ROOMS#COMFORT', 'ROOMS#DESIGN&FEATURES', 'ROOMS#GENERAL', 'ROOMS#MISCELLANEOUS', 
            'ROOMS#PRICES', 'ROOMS#QUALITY', 'ROOM_AMENITIES#CLEANLINESS', 
            'ROOM_AMENITIES#COMFORT', 'ROOM_AMENITIES#DESIGN&FEATURES', 
            'ROOM_AMENITIES#GENERAL', 'ROOM_AMENITIES#MISCELLANEOUS', 'ROOM_AMENITIES#PRICES', 
            'ROOM_AMENITIES#QUALITY', 'SERVICE#GENERAL'
        ];

        // Tạo dữ liệu mới
        const newData = csvData.map(row => {
            // Khởi tạo đối tượng mới với tất cả các cột được đặt thành giá trị 0
            const newRow = { Review: row.Review };
            newColumns.forEach(col => {
            if (col !== 'Review') {
                newRow[col] = 0; // Điền giá trị 0 cho các cột không có dữ liệu
            }
            });

            try {
            // Phân tích chuỗi JSON từ các cột
            const attributes = JSON.parse(row.attribute);
            const entities = JSON.parse(row.entity);  
            const sentiments = JSON.parse(row.sentiment);

            // Xử lý từng attribute
            for (let i = 0; i < attributes.length; i++) {
                const attr = attributes[i];
                const entity = entities[i];
                const sentiment = sentiments[i];

                if (attr && entity && sentiment) {
                const entityLabel = entity.labels[0]; // Lấy entity đầu tiên (HOTEL, ROOMS, etc.)
                const attrLabel = attr.labels[0];    // Lấy attribute đầu tiên (COMFORT, DESIGN&FEATURES, etc.)
                const sentimentLabel = sentiment.labels[0]; // Lấy sentiment (positive, negative)
                
                // Tạo key cho cột mới
                const columnKey = `${entityLabel}#${attrLabel}`;
                
                // Nếu cột tồn tại trong định dạng mới
                if (newColumns.includes(columnKey)) {
                    // Chuyển đổi sentiment thành 1 hoặc 2
                    const sentimentValue = sentimentLabel === 'positive' ? 1 : sentimentLabel === 'negative' ? 2 : 3; 
                    newRow[columnKey] = sentimentValue;
                }
                }
            }
            } catch (e) {
            console.error("Lỗi khi xử lý hàng:", row, e);
            }

            return newRow;
        });

        // Cập nhật state với dữ liệu và cột mới
        setColumns(newColumns);
        setCsvData(newData);
        setSuccess("Dữ liệu đã được chuyển đổi thành công.");
        } catch (err) {
        setError("Đã xảy ra lỗi khi chuyển đổi dữ liệu: " + err.message);
        }
    };

    const handleDownload = () => {
      const header = columns.join(",") + "\n"; // Tiêu đề với ký tự xuống dòng
      const rows = csvData
          .map((row) =>
              columns
                  .map((col) => {
                      const value = row[col];
                      // Kiểm tra nếu giá trị là chuỗi thì bọc trong dấu ngoặc kép
                      if (typeof value === "string") {
                          return `"${value.replace(/"/g, '""')}"`; // Thoát dấu ngoặc kép nếu có
                      }
                      return value; // Giữ nguyên nếu không phải chuỗi
                  })
                  .join(",")
          )
          .join("\n"); // Phân tách các dòng bằng ký tự xuống dòng
  
      const csvContent =
          "data:text/csv;charset=utf-8," + encodeURIComponent(header + rows);
      const link = document.createElement("a");
      link.setAttribute("href", csvContent);
      link.setAttribute("download", "data.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

    // Column deletion functions
    const handleDeleteColumns = () => setShowDeletePopup(true);
    const handleClosePopup = () => {
    setShowDeletePopup(false);
    setSelectedColumns([]);
    };
    const handleColumnSelect = (column) => {
    let newSelectedColumns = selectedColumns.includes(column)
        ? selectedColumns.filter(col => col !== column)
        : [...selectedColumns, column];
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
    setRowCount(newData.length);
    setShowDeletePopup(false);
    setSelectedColumns([]);
    };
    const handleSelectAll = () => {
    setSelectedColumns(selectedColumns.length === columns.length ? [] : [...columns]);
    };

    const handleResetFile = () => {
    setFile(null);
    setCsvData([]);
    setColumns([]);
    setError('');
    setSuccess('');
    setShowDeletePopup(false);
    setSelectedColumns([]);
    setRowCount(0);
    if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Reset giá trị input file
    }
    };

    const handleSplitSets = () => {
    setShowSplitPopup(true);
    };

    const handleCloseSplitPopup = () => {
    setShowSplitPopup(false);
    };
    
    const handleSplitAndZip = async (data, numSets, itemsPerSet, setProgress) => {
        console.log('Sending request to split-and-zip:', { data, numSets, itemsPerSet, columns });
        try {
          const response = await axios.post(
            'https://tvltruong1594-processing-tool.hf.space/split-and-zip',
            {
              data,
              numSets: parseInt(numSets),
              itemsPerSet: parseInt(itemsPerSet),
              columns // Thêm columns vào payload
            },
            {
              onUploadProgress: (progressEvent) => {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                setProgress(percentCompleted);
              },
            }
          );
          console.log('Response from split-and-zip:', response.data);
          return response.data;
        } catch (error) {
          console.error('Request failed:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
          });
          throw error;
        }
    };
    
    return (
        <div>
          <FileDropZone 
            file={file}
            handleFileChange={handleFileChange}
            handleDrop={handleDrop}
            handleDragOver={handleDragOver}
            fileInputRef={fileInputRef}
          />
          <MessageDisplay error={error} success={success} />
          
          {/* Hiển thị thanh tiến trình khi đang đọc */}
          {isReading && (
            <div className="progress-container" style={{ marginTop: '10px', textAlign: 'center' }}>
              <progress value={readProgress} max="100" />
              <p>{readProgress}%</p>
            </div>
          )}
          {/* Hiển thị số dòng khi đọc thành công */}
            {success && rowCount > 0 && (
                <p style={{ color: 'green', marginTop: '10px', textAlign: 'center' }}>
                Số dòng đọc được: {rowCount}
                </p>
            )}
    
          <ActionButtons 
            file={file}
            csvData={csvData}
            handleReadFile={handleReadFile}
            handleResetFile={handleResetFile}
            handleDeleteColumns={handleDeleteColumns}
            handleTransformData={handleTransformData}
            handleDownload={handleDownload}
            handleSplitSets={handleSplitSets}
          />
          <CSVTable csvData={csvData} columns={columns} />
          <DeleteColumnPopup 
            showDeletePopup={showDeletePopup}
            columns={columns}
            selectedColumns={selectedColumns}
            handleClosePopup={handleClosePopup}
            handleColumSelect={handleColumnSelect}
            handleDeleteSelectedColumns={handleDeleteSelectedColumns}
            handleSelectAll={handleSelectAll}
          />
          <SplitSetsPopup 
            showSplitPopup={showSplitPopup}
            csvData={csvData}
            columns={columns}
            handleCloseSplitPopup={handleCloseSplitPopup}
            handleSplitAndZip={handleSplitAndZip}
          />
        </div>
    );
};
    
    export default FileUploader;