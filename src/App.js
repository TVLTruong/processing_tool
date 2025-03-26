import React from "react";
// import { BrowserRouter, Routes, Route } from "react-router-dom";
import FileUploader from "./components/FileUploader";
import { HashRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <Router>
      <div className="App">
        <h1>Processing tool</h1>
        <Routes>
          <Route path="/" element={<FileUploader />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
