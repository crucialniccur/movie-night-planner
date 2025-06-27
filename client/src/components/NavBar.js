import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function NavBar() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!sessionStorage.getItem("user_id")
  );

  useEffect(() => {
    const checkSession = () => {
      setIsLoggedIn(!!sessionStorage.getItem("user_id"));
    };
    window.addEventListener("storage", checkSession); // Update on storage change
    return () => window.removeEventListener("storage", checkSession);
  }, []);

  return (
    <nav>
      <Link to="/">Home</Link> |<Link to="/movies">Movies</Link> |
      <Link to="/reviews">Submit Review</Link> |
      <Link to="/reviews/list">View Reviews</Link> |
      {isLoggedIn ? (
        <>
          <Link to="/favorites">Favorites</Link> |
          <Link to="/logout">Logout</Link>
        </>
      ) : (
        <Link to="/login">Login</Link>
      )}
    </nav>
  );
}

export default NavBar;
