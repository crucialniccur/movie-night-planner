import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

const API_URL = process.env.REACT_APP_API_URL || "";

function NavBar() {
  const [username, setUsername] = useState(null);

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

  return (
    <nav className="navbar navbar-expand-lg">
      <div className="container-fluid" style={{ display: 'flex', alignItems: 'center', padding: '0.5rem 2.5rem' }}>
        <div className="navbar-brand" style={{ marginRight: '2.5rem' }}>
          <span role="img" aria-label="movie">🎬</span> Movie Night
        </div>
        <ul className="navbar-nav" style={{ display: 'flex', flexDirection: 'row', gap: '2.2em', marginBottom: 0 }}>
          <li className="nav-item">
            <Link to="/" className="nav-link">Home</Link>
          </li>
          <li className="nav-item">
            <Link to="/movies" className="nav-link">Movies</Link>
          </li>
          <li className="nav-item">
            <Link to="/favorites" className="nav-link">Favorites</Link>
          </li>
        </ul>
        {username && (
          <div style={{ display: 'flex', alignItems: 'center', marginLeft: 'auto', gap: '1.5em' }}>
            <span className="nav-link" style={{ padding: 0, fontWeight: 600 }}>Hi, {username}!</span>
            <Link to="/logout" className="nav-link">Logout</Link>
          </div>
        )}
        {!username && (
          <div style={{ display: 'flex', alignItems: 'center', marginLeft: 'auto', gap: '1.5em' }}>
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/signup" className="nav-link">Sign Up</Link>
          </div>
        )}
      </div>
    </nav>
  );
}

export default NavBar;
