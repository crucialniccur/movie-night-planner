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

  return (
    <nav
      className="navbar"
      style={{
        background: "#222",
        color: "#FFD700",
        padding: "0.7em 2em",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        marginBottom: "2em",
      }}
    >
      <div style={{ fontWeight: "bold", fontSize: "1.5em", color: "#FFD700", letterSpacing: "1px" }}>
        <span role="img" aria-label="movie">🎬</span> Movie Night
      </div>
      <ul
        style={{
          listStyle: "none",
          display: "flex",
          gap: "1.5em",
          margin: 0,
          padding: 0,
          alignItems: "center",
        }}
      >
        <li>
          <Link to="/" style={{ color: "#FFD700", textDecoration: "none", fontWeight: "bold" }}>Home</Link>
        </li>
        <li>
          <Link to="/movies" style={{ color: "#FFD700", textDecoration: "none", fontWeight: "bold" }}>Movies</Link>
        </li>
        {username ? (
          <>
            <li style={{ color: "#FFD700", fontWeight: "bold" }}>Hi, {username}!</li>
            <li>
              <Link to="/favorites" style={{ color: "#FFD700", textDecoration: "none", fontWeight: "bold" }}>Favorites</Link>
            </li>
            <li>
              <Link to="/logout" style={{ color: "#FFD700", textDecoration: "none", fontWeight: "bold" }}>Logout</Link>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link to="/login" style={{ color: "#FFD700", textDecoration: "none", fontWeight: "bold" }}>Login</Link>
            </li>
            <li>
              <Link to="/signup" style={{ color: "#FFD700", textDecoration: "none", fontWeight: "bold" }}>Sign Up</Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default NavBar;
