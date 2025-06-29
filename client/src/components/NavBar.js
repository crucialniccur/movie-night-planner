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
          if (data.user_id && data.username) {
            setUsername(data.username);
            sessionStorage.setItem("user_id", data.user_id);
          } else {
            setUsername(null);
            sessionStorage.removeItem("user_id");
          }
        })
        .catch(() => {
          setUsername(null);
          sessionStorage.removeItem("user_id");
        });
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
    <nav className="navbar horizontal-navbar">
      <div className="navbar-brand">
        <span role="img" aria-label="movie">🎬</span> Movie Night
      </div>
      <ul className="nav-links-horizontal">
        <li>
          <Link to="/" className="nav-link">Home</Link>
        </li>
        <li>
          <Link to="/movies" className="nav-link">Movies</Link>
        </li>
        {username ? (
          <>
            <li className="nav-user">Hi, {username}!</li>
            <li>
              <Link to="/favorites" className="nav-link">Favorites</Link>
            </li>
            <li>
              <Link to="/logout" className="nav-link">Logout</Link>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link to="/login" className="nav-link">Login</Link>
            </li>
            <li>
              <Link to="/signup" className="nav-link">Sign Up</Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default NavBar;
