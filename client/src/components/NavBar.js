import React from "react";
import { Link } from "react-router-dom";

function NavBar() {
  return (
    <nav>
      <Link to="/">Home</Link>
      <Link to="/movies">Movies</Link>
      <Link to="/reviews">Reviews</Link>
      <Link to="/reviews/list">View Reviews</Link> |
      <Link to="/login">Login</Link>
    </nav>
  );
}

export default NavBar;
