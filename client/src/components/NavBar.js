import { Link } from "react-router-dom";

function NavBar() {
  const userId = sessionStorage.getItem("user_id");

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
        {userId ? (
          <>
            <li>
              <Link to="/favorites" style={{ color: "#FFD700", textDecoration: "none", fontWeight: "bold" }}>Favorites</Link>
            </li>
            <li>
              <Link to="/logout" style={{ color: "#FFD700", textDecoration: "none", fontWeight: "bold" }}>Logout</Link>
            </li>
          </>
        ) : (
          <li>
            <Link to="/login" style={{ color: "#FFD700", textDecoration: "none", fontWeight: "bold" }}>Login</Link>
          </li>
        )}
      </ul>
    </nav>
  );
}

export default NavBar;
