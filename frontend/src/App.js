import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import MainPage from "./components/MainPage";
import SampleReader from "./components/SampleReader";
function App() {
  return (
    <Router>
      <nav style={{ display: "flex", justifyContent: "space-around", padding: "1rem", background: "#eee" }}>
        <ul style={{ display: "flex", listStyle: "none", margin: 0, padding: 0 }}>
          <li style={{ margin: "0 1rem" }}>
            <Link to="/" style={{ textDecoration: "none", padding: "0.5rem 1rem", background: "#dfa41a", borderRadius: "4px" }}>Speech Practice</Link>
          </li>
          <li style={{ margin: "0 1rem" }}>
            <Link to="/sample_reading" style={{ textDecoration: "none", padding: "0.5rem 1rem", background: "#dfa41a", borderRadius: "4px" }}>Sample Reading</Link>
          </li>
        </ul>
      </nav>

      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/sample_reading" element={<SampleReader />} />
      </Routes>
    </Router>
  );
}

export default App;
