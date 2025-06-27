import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavBar from "./NavBar";
import MovieList from "./MovieList";
import ReviewForm from "./ReviewForm";
import Home from "./Home";
import Login from "./Login";
import ReviewList from "./ReviewList";

function App() {
  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movies" element={<MovieList />} />
        <Route path="/reviews" element={<ReviewForm />} />
        <Route path="/reviews/list" element={<ReviewList />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;
