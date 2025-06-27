import { useEffect, useState } from "react";

function Home() {
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favoritedIds, setFavoritedIds] = useState([]);
  const apiKey = "a4cd64db16ded6df2896cccfb552989a";
  const userId = sessionStorage.getItem("user_id");
  const username = userId
    ? fetch("/check-session", { credentials: "include" })
        .then((res) => res.json())
        .then((data) => (data.user_id ? "User" : null))
        .catch(() => null)
    : null;

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
      fetch("/favorites", { headers: { "Content-Type": "application/json" }, credentials: "include" })
        .then((res) => res.json())
        .then((data) => setFavoritedIds(data.map((fav) => fav.movie_id)))
        .catch(() => {});
    }
  }, [apiKey, userId]);

  const handleFavorite = (movieId) => {
    fetch(`/favorite/${movieId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include"
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to favorite movie");
        return res.json();
      })
      .then(() => {
        setFavoritedIds((prev) => [...prev, movieId]);
        window.dispatchEvent(new Event("favorites-updated"));
      })
      .catch((err) => alert(err.message));
  };

  if (loading)
    return <div className="container">Loading trending movies...</div>;
  if (error) return <div className="container">Error: {error}</div>;

  return (
    <div className="container">
      <h1>Welcome{userId ? `, ${username}` : ""} to Movie Night Planner</h1>
      <p>Discover the latest trending movies and plan your night!</p>
      <div className="trending-section">
        <h2>Trending Today</h2>
        <ul>
          {trendingMovies.map((movie) => (
            <li key={movie.id} className="event-card">
              <img
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                alt={movie.title}
                className="event-poster"
              />
              <div>
                <h3>{movie.title}</h3>
                <p>Release Date: {movie.release_date}</p>
                {userId && (
                  <button
                    onClick={() => handleFavorite(movie.id)}
                    disabled={favoritedIds.includes(movie.id)}
                  >
                    {favoritedIds.includes(movie.id) ? "Favorited" : "Favorite"}
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="quick-links">
        {userId ? (
          <>
            <a href="/favorites" className="quick-link">
              Go to Favorites
            </a>
            <a href="/logout" className="quick-link">
              Logout
            </a>
          </>
        ) : (
          <a href="/login" className="quick-link">
            Login
          </a>
        )}
      </div>
    </div>
  );
}

export default Home;
