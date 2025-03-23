import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import FileUploader from "./FileUploader";

function App() {
  return (
    <BrowserRouter basename="/pressing_tool">
      <div className="App">
        <h1>Upload và Đọc File CSV</h1>
        <Routes>
          <Route path="/" element={<FileUploader />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
