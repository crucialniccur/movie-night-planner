import { useEffect, useState } from "react";

const API_URL = process.env.REACT_APP_API_URL || "";

function Home() {
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState("0"); // "0" means All
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState({});
  const [reviewsByMovie, setReviewsByMovie] = useState({});
  const [favorites, setFavorites] = useState([]);
  const [favLoading, setFavLoading] = useState({});
  const apiKey = "a4cd64db16ded6df2896cccfb552989a";
  const userId = sessionStorage.getItem("user_id");

  // Fetch genres on mount
  useEffect(() => {
    fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}`)
      .then((res) => res.json())
      .then((data) => setGenres(data.genres || []))
      .catch(() => setGenres([]));
  }, [apiKey]);

  // Fetch trending or genre-filtered movies
  useEffect(() => {
    setLoading(true);
    setError(null);
    let url = "";
    if (selectedGenre === "0") {
      url = `https://api.themoviedb.org/3/trending/movie/day?api_key=${apiKey}`;
    } else {
      url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_genres=${selectedGenre}&sort_by=popularity.desc`;
    }
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch movies");
        return res.json();
      })
      .then((data) => {
        if (data.results) setTrendingMovies(data.results);
        else setError("No movies found");
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
    if (userId) {
      fetch(`${API_URL}/api/favorites`, { credentials: "include" })
        .then((res) => res.json())
        .then((data) => {
          if (!Array.isArray(data)) return [];
          return data.map((f) => f.movie_id);
        })
        .then((ids) => setFavorites(ids))
        .catch(() => setFavorites([]));
    }
  }, [apiKey, userId, selectedGenre]);

  // Fetch reviews for all movies
  useEffect(() => {
    async function fetchReviews() {
      const reviewsObj = {};
      for (let movie of trendingMovies) {
        try {
          const res = await fetch(`${API_URL}/api/reviews/movie/${movie.id}`);
          reviewsObj[movie.id] = res.ok ? await res.json() : [];
        } catch {
          reviewsObj[movie.id] = [];
        }
      }
      setReviewsByMovie(reviewsObj);
    }
    if (trendingMovies.length > 0) fetchReviews();
  }, [trendingMovies]);

  const toggleReadMore = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getGenreNames = (genreIds) => {
    return genres.filter((g) => genreIds.includes(g.id)).map((g) => g.name);
  };

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
        }
      })
      .catch(() => {})
      .finally(() => setFavLoading((prev) => ({ ...prev, [movieId]: false })));
  };

  if (loading)
    return <div className="container">Loading movies...</div>;
  if (error) return <div className="container">Error: {error}</div>;

  return (
    <div className="container">
      <div
        className="home-hero"
        style={{
          textAlign: "center",
          padding: "2.5em 0 2.5em 0",
          background: "linear-gradient(120deg, #23272f 60%, #0d6efd 100%)",
          color: "#FFD700",
          borderRadius: "16px",
          marginBottom: "2.5em",
          boxShadow: "0 4px 24px rgba(13,110,253,0.12)",
          backgroundImage:
            'url(https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=1200&q=80)',
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(35,39,47,0.82)",
            zIndex: 1,
          }}
        ></div>
        <div style={{ position: "relative", zIndex: 2 }}>
          <h1 style={{ fontSize: "2.7em", marginBottom: "0.5em", color: "#FFD700", textShadow: "0 2px 8px #000" }}>
            🎬 Welcome to Movie Night Planner!
          </h1>
          <p style={{ fontSize: "1.3em", color: "#fff", marginBottom: "1em", textShadow: "0 2px 8px #000" }}>
            Discover trending movies, filter by your favorite genres, save your favorites, and share your thoughts with reviews.<br />
            Plan your perfect movie night with friends and never miss a blockbuster!
          </p>
          {userId ? (
            <p style={{ color: "#FFD700", fontWeight: "bold", textShadow: "0 2px 8px #000" }}>
              Glad to have you back! Explore what's trending and add your favorites.
            </p>
          ) : (
            <p style={{ color: "#FFD700", fontWeight: "bold", textShadow: "0 2px 8px #000" }}>
              <a href="/login" style={{ color: "#FFD700", textDecoration: "underline" }}>Login</a> or <a href="/signup" style={{ color: "#FFD700", textDecoration: "underline" }}>Sign up</a> to start your movie journey!
            </p>
          )}
        </div>
      </div>
      <div className="trending-section">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap" }}>
          <h2 style={{ margin: 0 }}>Trending {selectedGenre !== "0" && genres.find(g => g.id === Number(selectedGenre)) ? `- ${genres.find(g => g.id === Number(selectedGenre)).name}` : "Today"}</h2>
          <div style={{ minWidth: 200 }}>
            <select
              className="form-control"
              value={selectedGenre}
              onChange={e => setSelectedGenre(e.target.value)}
              style={{ fontWeight: 600, border: "2px solid #FFD700", color: "#23272f", background: "#FFD700" }}
            >
              <option value="0">All Genres</option>
              {genres.map((genre) => (
                <option key={genre.id} value={genre.id}>{genre.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="row g-4 justify-content-start">
          {trendingMovies.map((movie) => {
            const isLong = movie.overview && movie.overview.length > 120;
            const showFull = expanded[movie.id];
            const genreNames = getGenreNames(movie.genre_ids || []);
            const isFav = favorites.includes(movie.id);
            return (
              <div key={movie.id} className="col-12 col-sm-6 col-lg-4 d-flex">
                <div className="card shadow-lg flex-fill h-100" style={{ position: "relative", overflow: "hidden" }}>
                  <img
                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                    alt={movie.title}
                    className="card-img-top rounded-top"
                    style={{ objectFit: 'cover', height: '320px', borderTopLeftRadius: 16, borderTopRightRadius: 16 }}
                  />
                  <button
                    onClick={() => handleFavorite(movie.id)}
                    disabled={isFav || favLoading[movie.id]}
                    title={isFav ? "Favorited" : "Add to Favorites"}
                    style={{
                      position: "absolute",
                      top: 12,
                      right: 16,
                      zIndex: 3,
                      background: isFav ? '#FFD700' : '#23272f',
                      color: isFav ? '#23272f' : '#FFD700',
                      border: '2px solid #FFD700',
                      borderRadius: '50%',
                      width: 36,
                      height: 36,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 20,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
                      cursor: isFav ? 'not-allowed' : 'pointer',
                      transition: 'background 0.2s, color 0.2s',
                    }}
                  >
                    {isFav ? '★' : '☆'}
                  </button>
                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title text-warning fw-bold" style={{ fontSize: "1.25em" }}>{movie.title}</h5>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
                      {genreNames.map((name) => (
                        <span key={name} style={{ background: "#FFD700", color: "#23272f", borderRadius: 6, padding: "2px 10px", fontWeight: 600, fontSize: "0.95em" }}>{name}</span>
                      ))}
                    </div>
                    <p className="card-text mb-1" style={{ color: '#FFD700', fontWeight: 500 }}><span style={{ color: '#fff' }}>Release:</span> {movie.release_date}</p>
                    <p style={{ color: '#FFD700', fontSize: '0.98em' }}>
                      {movie.overview
                        ? showFull
                          ? movie.overview
                          : movie.overview.slice(0, 120) + (isLong ? '...' : '')
                        : 'No description available.'}
                      {isLong && (
                        <span
                          onClick={() => toggleReadMore(movie.id)}
                          style={{ color: '#0d6efd', cursor: 'pointer', marginLeft: 8, fontWeight: 'bold', fontSize: '0.98em' }}
                        >
                          {showFull ? ' Show less' : ' Read more'}
                        </span>
                      )}
                    </p>
                    <div className="reviews-section">
                      <h6 className="fw-bold" style={{ color: '#007aff' }}>Reviews:</h6>
                      {reviewsByMovie[movie.id] && reviewsByMovie[movie.id].length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          {reviewsByMovie[movie.id].map((review, idx, arr) => (
                            <>
                              <div key={review.id} className="review-pill">
                                <span style={{ fontWeight: 600 }}>User {review.user_id}</span>
                                <span className="review-rating">{review.rating}★</span>
                                <span style={{ marginLeft: 8 }}>{review.content}</span>
                              </div>
                              {idx < arr.length - 1 && (
                                <div style={{ height: 1, background: '#e5e5ea', margin: '2px 0 4px 0', width: '90%', alignSelf: 'center', borderRadius: 1 }} />
                              )}
                            </>
                          ))}
                        </div>
                      ) : (
                        <p className="mb-0">No reviews yet.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Home;
