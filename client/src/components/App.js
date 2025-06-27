import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavBar from "./NavBar";
import Home from "./Home";
import Login from "./Login";
import Logout from "./Logout";
import Favorites from "./Favorites";
import Movies from "./Movies"; // Re-import Movies

function ErrorPage({ children }) {
  return <div className="error">{children}</div>;
}

function App() {
  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/movies" element={<Movies />} /> {/* Re-add this route */}
      </Routes>
    </Router>
  );
}

export default App;
