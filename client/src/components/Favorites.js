import { useEffect, useState } from "react";

const API_URL = process.env.REACT_APP_API_URL || "";

function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewInputs, setReviewInputs] = useState({});
  const [reviewStatus, setReviewStatus] = useState({});
  const apiKey = "a4cd64db16ded6df2896cccfb552989a";
  const userId = sessionStorage.getItem("user_id");

  const fetchFavorites = () => {
    if (userId) {
      setLoading(true);
      fetch(`${API_URL}/api/favorites`, { headers: { "Content-Type": "application/json" } })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch favorites");
          return res.json();
        })
        .then((data) => {
          setFavorites(data);
          return data.map((fav) => fav.movie_id);
        })
        .then((movieIds) => {
          if (movieIds.length > 0) {
            return Promise.all(
              movieIds.map((id) =>
                fetch(
                  `https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}`
                )
                  .then((res) => res.json())
                  .then((movie) => ({
                    ...movie,
                    favorite_date: favorites.find(
                      (f) => f.movie_id === movie.id
                    )?.favorite_date,
                  }))
              )
            );
          }
          return [];
        })
        .then((fetchedMovies) => setMovies(fetchedMovies))
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }
  };

  useEffect(() => {
    fetchFavorites();
    const handler = () => fetchFavorites();
    window.addEventListener("favorites-updated", handler);
    return () => window.removeEventListener("favorites-updated", handler);
  }, [userId]);

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
      <ul>
        {movies.map((movie) => (
          <li key={movie.id} className="event-card">
            <img
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
              alt={movie.title}
              className="event-poster"
            />
            <div>
              <h3>{movie.title}</h3>
              <p>Release Date: {movie.release_date}</p>
              <p>
                Favorited: {new Date(movie.favorite_date).toLocaleDateString()}
              </p>
              <button onClick={() => handleRemoveFavorite(movie.id)}>
                Remove from Favorites
              </button>
              <div style={{ marginTop: "1em" }}>
                <h4>Leave a Review</h4>
                <input
                  type="number"
                  min="1"
                  max="5"
                  placeholder="Rating (1-5)"
                  value={reviewInputs[movie.id]?.rating || ""}
                  onChange={e => handleReviewChange(movie.id, "rating", e.target.value)}
                  style={{ width: "100px", marginRight: "0.5em" }}
                />
                <input
                  type="text"
                  placeholder="Your review"
                  value={reviewInputs[movie.id]?.content || ""}
                  onChange={e => handleReviewChange(movie.id, "content", e.target.value)}
                  style={{ width: "200px", marginRight: "0.5em" }}
                />
                <button onClick={() => handleReviewSubmit(movie.id)}>
                  Submit Review
                </button>
                {reviewStatus[movie.id] && (
                  <span style={{ marginLeft: "1em", color: reviewStatus[movie.id] === "Review submitted!" ? "green" : "red" }}>
                    {reviewStatus[movie.id]}
                  </span>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Favorites;
