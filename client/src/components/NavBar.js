import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

const API_URL = process.env.REACT_APP_API_URL || "";

function NavBar() {
  const [username, setUsername] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    // Fetch session info on mount and when login/logout events happen
    const fetchSession = () => {
      fetch(`${API_URL}/check-session`, { credentials: "include" })
        .then((res) => res.json())
        .then((data) => {
          if (data.user_id) {
            setUsername(data.username);
            sessionStorage.setItem("user_id", data.user_id);
          } else {
            setUsername(null);
            sessionStorage.removeItem("user_id");
          }
        })
        .catch(() => setUsername(null));
    };
    fetchSession();
    window.addEventListener("login", fetchSession);
    window.addEventListener("logout", fetchSession);
    return () => {
      window.removeEventListener("login", fetchSession);
      window.removeEventListener("logout", fetchSession);
    };
  }, []);

  // Close menu on route change (optional, for better UX)
  useEffect(() => {
    const closeMenu = () => setMenuOpen(false);
    window.addEventListener("popstate", closeMenu);
    return () => window.removeEventListener("popstate", closeMenu);
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span role="img" aria-label="movie">🎬</span> Movie Night
      </div>
      <button
        className="hamburger"
        aria-label="Toggle menu"
        onClick={() => setMenuOpen((open) => !open)}
      >
        <span className="bar"></span>
        <span className="bar"></span>
        <span className="bar"></span>
      </button>
      <ul className={`nav-links${menuOpen ? " open" : ""}`}>
        <li>
          <Link to="/" onClick={() => setMenuOpen(false)} className="nav-link">Home</Link>
        </li>
        <li>
          <Link to="/movies" onClick={() => setMenuOpen(false)} className="nav-link">Movies</Link>
        </li>
        {username ? (
          <>
            <li className="nav-user">Hi, {username}!</li>
            <li>
              <Link to="/favorites" onClick={() => setMenuOpen(false)} className="nav-link">Favorites</Link>
            </li>
            <li>
              <Link to="/logout" onClick={() => setMenuOpen(false)} className="nav-link">Logout</Link>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link to="/login" onClick={() => setMenuOpen(false)} className="nav-link">Login</Link>
            </li>
            <li>
              <Link to="/signup" onClick={() => setMenuOpen(false)} className="nav-link">Sign Up</Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default NavBar;
