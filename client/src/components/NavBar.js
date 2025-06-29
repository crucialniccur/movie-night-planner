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
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm mb-4">
      <div className="container-fluid">
        <div className="navbar-brand d-flex align-items-center gap-2 fw-bold fs-4 text-warning">
          <span role="img" aria-label="movie">🎬</span> Movie Night
        </div>
        <ul className="navbar-nav ms-auto d-flex flex-row gap-2 align-items-center">
          <li className="nav-item">
            <Link to="/" className="nav-link fw-bold text-warning">Home</Link>
          </li>
          <li className="nav-item">
            <Link to="/movies" className="nav-link fw-bold text-warning">Movies</Link>
          </li>
          {username ? (
            <>
              <li className="nav-item">
                <span className="nav-link fw-bold text-warning">Hi, {username}!</span>
              </li>
              <li className="nav-item">
                <Link to="/favorites" className="nav-link fw-bold text-warning">Favorites</Link>
              </li>
              <li className="nav-item">
                <Link to="/logout" className="nav-link fw-bold text-warning">Logout</Link>
              </li>
            </>
          ) : (
            <>
              <li className="nav-item">
                <Link to="/login" className="nav-link fw-bold text-warning">Login</Link>
              </li>
              <li className="nav-item">
                <Link to="/signup" className="nav-link fw-bold text-warning">Sign Up</Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default NavBar;
