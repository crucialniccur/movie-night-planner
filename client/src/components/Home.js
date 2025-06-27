import { useEffect, useState } from "react";

function Home() {
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favoritedIds, setFavoritedIds] = useState([]);
  const [reviewsByMovie, setReviewsByMovie] = useState({});
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
    // Fetch all reviews and group by movie_id
    fetch("/all-reviews")
      .then((res) => res.json())
      .then((allReviews) => {
        const grouped = {};
        allReviews.forEach((review) => {
          if (!grouped[review.movie_id]) grouped[review.movie_id] = [];
          grouped[review.movie_id].push(review);
        });
        setReviewsByMovie(grouped);
      })
      .catch(() => {});
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
                {/* Show reviews for this movie */}
                {reviewsByMovie[movie.id] && reviewsByMovie[movie.id].length > 0 && (
                  <div className="movie-reviews" style={{ marginTop: "1em" }}>
                    <h4>Reviews:</h4>
                    <ul>
                      {reviewsByMovie[movie.id].map((review) => (
                        <li key={review.id}>
                          <strong>{review.username}:</strong> <strong>Rating:</strong> {review.rating} <br />
                          <span>{review.content}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
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
