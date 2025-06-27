import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Home() {
  const [movies, setMovies] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const apiKey = "YOUR_TMDB_API_KEY"; // Replace with your TMDB API key
  const userId = sessionStorage.getItem("user_id");

  useEffect(() => {
    fetch(
      `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&sort_by=popularity.desc&page=1`
    )
      .then((res) => res.json())
      .then((data) => setMovies(data.results))
      .catch((err) => console.error("Error fetching movies:", err));

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
