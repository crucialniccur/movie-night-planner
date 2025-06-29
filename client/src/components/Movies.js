import { useEffect, useState } from "react";
// import { Link } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL || "";

function Movies() {
  const [movies, setMovies] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewsByMovie, setReviewsByMovie] = useState({});
  const [reviewContent, setReviewContent] = useState({});
  const [reviewRating, setReviewRating] = useState({});
  const [reviewError, setReviewError] = useState({});
  const [favLoading, setFavLoading] = useState({});
  const apiKey = "a4cd64db16ded6df2896cccfb552989a";
  const userId = sessionStorage.getItem("user_id");

  useEffect(() => {
    const fetchFavorites = () => {
      if (userId) {
        fetch(`${API_URL}/api/favorites`, { credentials: "include" })
          .then((res) => res.json())
          .then((data) => {
            if (!Array.isArray(data)) return [];
            return data.map((f) => f.movie_id);
          })
          .then((ids) => setFavorites(ids))
          .catch((err) => {
            setFavorites([]);
            console.error("Error fetching favorites:", err);
          });
      }
    };
    setLoading(true);
    setError(null);
    fetch(
      `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&sort_by=popularity.desc&page=1`
    )
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch movies");
        return res.json();
      })
      .then((data) => {
        if (data.results) setMovies(data.results);
        else setError("No movie data found");
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
    fetchFavorites();
  }, [apiKey, userId]);

  useEffect(() => {
    async function fetchReviews() {
      const reviewsObj = {};
      for (let movie of movies) {
        const res = await fetch(`${API_URL}/api/reviews/movie/${movie.id}`);
        reviewsObj[movie.id] = res.ok ? await res.json() : [];
      }
      setReviewsByMovie(reviewsObj);
    }
    if (movies.length > 0) fetchReviews();
  }, [movies]);

  const notifyFavoritesUpdate = () =>
    window.dispatchEvent(new Event("favorites-updated"));

  const handleFavorite = (movieId) => {
    if (favLoading[movieId]) return;
    const isFav = favorites.includes(movieId);
    if (isFav) return;
    setFavLoading({ ...favLoading, [movieId]: true });
    fetch(`${API_URL}/api/favorites/${movieId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include"
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.id || data.message === "Movie favorited") {
          setFavorites((prev) => [...prev, movieId]);
          notifyFavoritesUpdate();
        }
      })
      .catch((err) => console.error("Favorite error:", err))
      .finally(() => setFavLoading((prev) => ({ ...prev, [movieId]: false })));
  };

  const handleReviewChange = (movieId, field, value) => {
    if (field === "content")
      setReviewContent({ ...reviewContent, [movieId]: value });
    else if (field === "rating")
      setReviewRating({ ...reviewRating, [movieId]: value });
  };

  const handleReviewSubmit = (e, movieId) => {
    e.preventDefault();
    if (!favorites.includes(movieId)) {
      setReviewError({
        ...reviewError,
        [movieId]: "You must favorite this movie to review it",
      });
      return;
    }
    setReviewError({ ...reviewError, [movieId]: null });
    fetch(`${API_URL}/api/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        content: reviewContent[movieId] || "",
        rating: reviewRating[movieId] || 1,
        movie_id: movieId,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error)
          setReviewError({ ...reviewError, [movieId]: data.error });
        else {
          setReviewContent({ ...reviewContent, [movieId]: "" });
          setReviewRating({ ...reviewRating, [movieId]: 1 });
          fetch(`${API_URL}/api/reviews/movie/${movieId}`)
            .then((res) => res.json())
            .then((reviews) =>
              setReviewsByMovie({ ...reviewsByMovie, [movieId]: reviews })
            );
        }
      })
      .catch(() =>
        setReviewError({ ...reviewError, [movieId]: "Failed to submit review" })
      );
  };

  if (loading) return <div className="container">Loading movies...</div>;
  if (error) return <div className="container">Error: {error}</div>;

  return (
    <div className="container py-4">
      <h1 className="mb-4">Movies</h1>
      <div className="row g-4 justify-content-start">
        {movies.map((movie) => {
          const isFav = favorites.includes(movie.id);
          return (
            <div key={movie.id} className="col-12 col-md-6 d-flex">
              <div className="card shadow-lg flex-fill h-100">
                <img
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                  alt={movie.title}
                  className="card-img-top rounded-top"
                  style={{ objectFit: 'cover', height: '260px' }}
                />
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title text-warning fw-bold">{movie.title}</h5>
                  <p className="card-text mb-1">{movie.release_date}</p>
                  {userId && (
                    <button
                      onClick={() => handleFavorite(movie.id)}
                      disabled={isFav || favLoading[movie.id]}
                      className={`btn fw-bold mb-3 ${isFav ? 'btn-secondary' : 'btn-warning'}`}
                    >
                      {isFav ? "Favorited ✓" : "Favorite"}
                    </button>
                  )}
                  <div className="reviews-section card bg-dark text-light p-3 mt-auto">
                    <h6 className="fw-bold text-warning">Reviews:</h6>
                    {reviewsByMovie[movie.id] &&
                    reviewsByMovie[movie.id].length > 0 ? (
                      <ul className="mb-0">
                        {reviewsByMovie[movie.id].map((review) => (
                          <li key={review.id}>
                            <strong>User {review.user_id}:</strong>{" "}
                            {review.content} (Rating: {review.rating})
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mb-0">No reviews yet.</p>
                    )}
                  </div>
                  {userId && isFav && (
                    <form
                      onSubmit={(e) => handleReviewSubmit(e, movie.id)}
                      className="review-form mt-3"
                    >
                      <h6 className="fw-bold text-warning">Leave a Review</h6>
                      <textarea
                        value={reviewContent[movie.id] || ""}
                        onChange={(e) => handleReviewChange(movie.id, "content", e.target.value)}
                        placeholder="Write your review"
                        required
                        className="form-control mb-2"
                      />
                      <input
                        type="number"
                        value={reviewRating[movie.id] || 1}
                        onChange={(e) =>
                          handleReviewChange(
                            movie.id,
                            "rating",
                            Math.max(1, Math.min(5, e.target.value))
                          )
                        }
                        min="1"
                        max="5"
                        required
                        className="form-control mb-2"
                      />
                      <button type="submit" className="btn btn-outline-warning fw-bold">
                        Submit Review
                      </button>
                      {reviewError[movie.id] && (
                        <p className="text-danger fw-bold mt-2">{reviewError[movie.id]}</p>
                      )}
                    </form>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Movies;
