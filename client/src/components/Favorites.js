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
    <div className="container py-4">
      <h1 className="mb-4 text-warning fw-bold">My Favorites</h1>
      <div className="row g-4 justify-content-start">
        {movies.map((movie) => (
          <div key={movie.id} className="col-12 col-sm-6 col-lg-4 d-flex">
            <div className="card shadow-lg flex-fill h-100">
              <img
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                alt={movie.title}
                className="card-img-top rounded-top"
                style={{ objectFit: 'cover', height: '260px' }}
              />
              <div className="card-body d-flex flex-column">
                <h5 className="card-title text-warning fw-bold">{movie.title}</h5>
                <p className="card-text mb-1"><span className="fw-semibold text-warning">Release:</span> {movie.release_date}</p>
                <p className="card-text mb-2"><span className="fw-semibold text-warning">Favorited:</span> {movie.favorite_date ? new Date(movie.favorite_date).toLocaleDateString() : "Not favorited"}</p>
                <button className="btn btn-warning fw-bold mb-3" onClick={() => handleRemoveFavorite(movie.id)}>
                  Remove from Favorites
                </button>
                <div className="mt-auto">
                  <h6 className="fw-bold text-warning">Leave a Review</h6>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    placeholder="Rating (1-5)"
                    value={reviewInputs[movie.id]?.rating || ""}
                    onChange={e => handleReviewChange(movie.id, "rating", e.target.value)}
                    className="form-control mb-2"
                  />
                  <input
                    type="text"
                    placeholder="Your review"
                    value={reviewInputs[movie.id]?.content || ""}
                    onChange={e => handleReviewChange(movie.id, "content", e.target.value)}
                    className="form-control mb-2"
                  />
                  <button className="btn btn-outline-warning fw-bold" onClick={() => handleReviewSubmit(movie.id)}>
                    Submit Review
                  </button>
                  {reviewStatus[movie.id] && (
                    <div className={reviewStatus[movie.id] === "Review submitted!" ? "text-success fw-bold mt-2" : "text-danger fw-bold mt-2"}>
                      {reviewStatus[movie.id]}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Favorites;
