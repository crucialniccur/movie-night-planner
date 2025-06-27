import { useEffect, useState } from "react";

function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const apiKey = "a4cd64db16ded6df2896cccfb552989a";
  const userId = sessionStorage.getItem("user_id");

  const fetchFavorites = () => {
    if (userId) {
      setLoading(true);
      fetch("/favorites", { headers: { "Content-Type": "application/json" } })
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
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Favorites;
