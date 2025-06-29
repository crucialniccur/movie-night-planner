import { useEffect, useState } from "react";

const API_URL = process.env.REACT_APP_API_URL || "";

function Home() {
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState({});
  const apiKey = "a4cd64db16ded6df2896cccfb552989a";
  const userId = sessionStorage.getItem("user_id");

  const toggleReadMore = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`https://api.themoviedb.org/3/trending/movie/day?api_key=${apiKey}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch trending movies");
        return res.json();
      })
      .then((data) => {
        if (data.results) setTrendingMovies(data.results);
        else setError("No trending movies found");
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
    if (userId) {
      fetch(`${API_URL}/api/favorites`, { headers: { "Content-Type": "application/json" }, credentials: "include" })
        .then((res) => res.json())
        .catch(() => {});
    }
  }, [apiKey, userId]);

  if (loading)
    return <div className="container">Loading trending movies...</div>;
  if (error) return <div className="container">Error: {error}</div>;

  return (
    <div className="container">
      <div className="home-hero" style={{
        textAlign: "center",
        padding: "2em 0 2em 0",
        background: "#222",
        color: "#FFD700",
        borderRadius: "10px",
        marginBottom: "2em"
      }}>
        <h1 style={{ fontSize: "2.5em", marginBottom: "0.5em" }}>
          🎬 Welcome to Movie Night Planner!
        </h1>
        <p style={{ fontSize: "1.3em", color: "#fff", marginBottom: "1em" }}>
          Discover trending movies, save your favorites, and share your thoughts with reviews.<br/>
          Plan your perfect movie night with friends and never miss a blockbuster!
        </p>
        {userId ? (
          <p style={{ color: "#FFD700", fontWeight: "bold" }}>
            Glad to have you back! Explore what's trending and add your favorites.
          </p>
        ) : (
          <p style={{ color: "#FFD700", fontWeight: "bold" }}>
            <a href="/login" style={{ color: "#FFD700", textDecoration: "underline" }}>Login</a> or <a href="/users" style={{ color: "#FFD700", textDecoration: "underline" }}>Sign up</a> to start your movie journey!
          </p>
        )}
      </div>
      <div className="trending-section">
        <h2>Trending Today</h2>
        <ul>
          {trendingMovies.map((movie) => {
            const isLong = movie.overview && movie.overview.length > 120;
            const showFull = expanded[movie.id];
            return (
              <li key={movie.id} className="event-card">
                <img
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                  alt={movie.title}
                  className="event-poster"
                />
                <div>
                  <h3>{movie.title}</h3>
                  <p><strong>Release Date:</strong> {movie.release_date}</p>
                  <p style={{ color: '#FFD700' }}>
                    {movie.overview
                      ? showFull
                        ? movie.overview
                        : movie.overview.slice(0, 120) + (isLong ? '...' : '')
                      : 'No description available.'}
                    {isLong && (
                      <span
                        onClick={() => toggleReadMore(movie.id)}
                        style={{ color: '#00BFFF', cursor: 'pointer', marginLeft: 8, fontWeight: 'bold', fontSize: '0.98em' }}
                      >
                        {showFull ? ' Show less' : ' Read more'}
                      </span>
                    )}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

export default Home;
