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
    <div className="container">
      <h1>Movies</h1>
      <ul>
        {movies.map((movie) => {
          const isFav = favorites.includes(movie.id);
          return (
            <li key={movie.id} className="event-card">
              <img
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                alt={movie.title}
                className="event-poster"
              />
              <div>
                <h3>{movie.title}</h3>
                <p>{movie.release_date}</p>
                {userId && (
                  <button
                    onClick={() => handleFavorite(movie.id)}
                    disabled={isFav || favLoading[movie.id]}
                    className={
                      isFav ? "favorite-button favorited" : "favorite-button"
                    }
                  >
                    {isFav ? "Favorited ✓" : "Favorite"}
                  </button>
                )}
                <div className="reviews-section">
                  <h4>Reviews:</h4>
                  {reviewsByMovie[movie.id] &&
                  reviewsByMovie[movie.id].length > 0 ? (
                    <ul>
                      {reviewsByMovie[movie.id].map((review) => (
                        <li key={review.id}>
                          <strong>User {review.user_id}:</strong>{" "}
                          {review.content} (Rating: {review.rating})
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No reviews yet.</p>
                  )}
                </div>
                {userId && isFav && (
                  <form
                    onSubmit={(e) => handleReviewSubmit(e, movie.id)}
                    className="review-form"
                  >
                    <h4>Leave a Review</h4>
                    <textarea
                      value={reviewContent[movie.id] || ""}
                      onChange={(e) =>
                        handleReviewChange(movie.id, "content", e.target.value)
                      }
                      placeholder="Write your review"
                      required
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
                    />
                    <button type="submit">Submit Review</button>
                    {reviewError[movie.id] && (
                      <p style={{ color: "red" }}>{reviewError[movie.id]}</p>
                    )}
                  </form>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default Movies;
