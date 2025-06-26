import React from "react";
import NavBar from "./NavBar";
import MovieList from "./MovieList";
import ReviewForm from "./ReviewForm";
import Home from "./Home";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movies" element={<MovieList />} />
        <Route path="/reviews" element={<ReviewForm />} />
      </Routes>
    </Router>
  );
}

export default App;
