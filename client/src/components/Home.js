import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Home() {
  const [movies, setMovies] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const apiKey = "a4cd64db16ded6df2896cccfb552989a"; // Replace with your TMDB API key
  const userId = sessionStorage.getItem("user_id");

  useEffect(() => {
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

    if (userId) {
      fetch("/favorites")
        .then((res) => res.json())
        .then((data) => setFavorites(data.map((f) => f.movie_id)))
        .catch((err) => console.error("Error fetching favorites:", err));
    }
  }, [apiKey, userId]);

  const handleFavorite = (movieId) => {
    fetch(`/favorite/${movieId}`, {
      method: favorites.includes(movieId) ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        if (data.message === "Movie favorited") {
          setFavorites([...favorites, movieId]);
        } else if (data.message === "Movie removed from favorites") {
          setFavorites(favorites.filter((id) => id !== movieId));
        }
      })
      .catch((err) => console.error("Favorite error:", err));
  };

  if (loading) return <div className="container">Loading movies...</div>;
  if (error) return <div className="container">Error: {error}</div>;

  return (
    <div className="container">
      <h1>Popular Movies</h1>
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
              <p>{movie.release_date}</p>
              {userId && (
                <button onClick={() => handleFavorite(movie.id)}>
                  {favorites.includes(movie.id) ? "Remove Favorite" : "Favorite"}
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
      <Link to="/favorites">View Favorites</Link>
    </div>
  );
}

export default Home;
