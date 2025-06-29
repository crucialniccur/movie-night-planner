import { useEffect, useState } from "react";

const API_URL = process.env.REACT_APP_API_URL || "";

function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [movies, setMovies] = useState([]);
  const [rawMovies, setRawMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewInputs, setReviewInputs] = useState({});
  const [reviewStatus, setReviewStatus] = useState({});
  const apiKey = "a4cd64db16ded6df2896cccfb552989a";
  const userId = sessionStorage.getItem("user_id");

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    fetch(`${API_URL}/api/favorites`, { headers: { "Content-Type": "application/json" }, credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch favorites");
        return res.json();
      })
      .then((data) => setFavorites(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
    const handler = () => {
      setLoading(true);
      fetch(`${API_URL}/api/favorites`, { headers: { "Content-Type": "application/json" }, credentials: "include" })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch favorites");
          return res.json();
        })
        .then((data) => setFavorites(data))
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    };
    window.addEventListener("favorites-updated", handler);
    return () => window.removeEventListener("favorites-updated", handler);
  }, [userId]);

  useEffect(() => {
    if (!favorites.length) {
      setRawMovies([]);
      return;
    }
    const movieIds = favorites.map((fav) => fav.movie_id);
    Promise.all(
      movieIds.map((id) =>
        fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}`)
          .then((res) => res.json())
      )
    )
      .then((moviesArr) => setRawMovies(moviesArr))
      .catch((err) => setError(err.message));
  }, [favorites, apiKey]);

  useEffect(() => {
    if (!rawMovies.length) {
      setMovies([]);
      return;
    }
    const merged = rawMovies.map((movie) => {
      const fav = favorites.find((f) => f.movie_id === movie.id);
      return { ...movie, favorite_date: fav ? fav.favorite_date : null };
    });
    setMovies(merged);
  }, [rawMovies, favorites]);

  const handleRemoveFavorite = (movieId) => {
    fetch(`${API_URL}/api/favorites/${movieId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include"
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to remove favorite");
        return res.json();
      })
      .then(() => {
        window.dispatchEvent(new Event("favorites-updated"));
      })
      .catch((err) => alert(err.message));
  };

  const handleReviewChange = (movieId, field, value) => {
    setReviewInputs((prev) => ({
      ...prev,
      [movieId]: {
        ...prev[movieId],
        [field]: value,
      },
    }));
  };

  const handleReviewSubmit = (movieId) => {
    const input = reviewInputs[movieId] || {};
    if (!input.rating || !input.content) {
      setReviewStatus((prev) => ({ ...prev, [movieId]: "Please fill all fields." }));
      return;
    }
    fetch(`${API_URL}/api/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        movie_id: movieId,
        rating: Number(input.rating),
        content: input.content,
      }),
    })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) throw new Error(data.error || "Failed to submit review");
        setReviewStatus((prev) => ({ ...prev, [movieId]: "Review submitted!" }));
        setReviewInputs((prev) => ({ ...prev, [movieId]: { rating: "", content: "" } }));
      })
      .catch((err) => setReviewStatus((prev) => ({ ...prev, [movieId]: err.message })));
  };

  if (loading) return <div className="container">Loading favorites...</div>;
  if (error) return <div className="container">Error: {error}</div>;
  if (!favorites.length)
    return <div className="container">No favorites yet.</div>;

  return (
    <div className="container">
      <h1>My Favorites</h1>
      <div className="favorites-flex-row">
        {movies.map((movie) => (
          <div key={movie.id} className="favorite-card">
            <img
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
              alt={movie.title}
              className="favorite-poster"
            />
            <div className="favorite-card-content">
              <h3>{movie.title}</h3>
              <p className="favorite-release"><span>Release:</span> {movie.release_date}</p>
              <p className="favorite-date"><span>Favorited:</span> {movie.favorite_date ? new Date(movie.favorite_date).toLocaleDateString() : "Not favorited"}</p>
              <button className="favorite-remove" onClick={() => handleRemoveFavorite(movie.id)}>
                Remove from Favorites
              </button>
              <div className="favorite-review-section">
                <h4>Leave a Review</h4>
                <input
                  type="number"
                  min="1"
                  max="5"
                  placeholder="Rating (1-5)"
                  value={reviewInputs[movie.id]?.rating || ""}
                  onChange={e => handleReviewChange(movie.id, "rating", e.target.value)}
                  className="favorite-review-rating"
                />
                <input
                  type="text"
                  placeholder="Your review"
                  value={reviewInputs[movie.id]?.content || ""}
                  onChange={e => handleReviewChange(movie.id, "content", e.target.value)}
                  className="favorite-review-input"
                />
                <button className="favorite-review-submit" onClick={() => handleReviewSubmit(movie.id)}>
                  Submit Review
                </button>
                {reviewStatus[movie.id] && (
                  <span className={reviewStatus[movie.id] === "Review submitted!" ? "favorite-review-success" : "favorite-review-error"}>
                    {reviewStatus[movie.id]}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Favorites;
