import { useEffect, useState } from "react";

function Home() {
  const [movies, setMovies] = useState([]);
  const apiKey = "a4cd64db16ded6df2896cccfb552989a"; //   Your TMDB key

  const handleFavorite = (movieId) => {
    fetch(`/favorite/${movieId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
      })
      .catch((err) => console.error("Favorite error:", err));
  };

  useEffect(() => {
    fetch(
      `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&sort_by=popularity.desc&page=1`
    )
      .then((res) => res.json())
      .then((data) => setMovies(data.results))
      .catch((err) => console.error("Error fetching movies:", err));
  }, [apiKey]);

  return (
    <div className="container">
      <h1>Popular Movies</h1>
      <ul>
        {movies.map((movie) => (
          <li key={movie.id} className="event-card">
            {movie.poster_path ? (
              <img
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                alt={movie.title}
                className="event-poster"
              />
            ) : (
              <div className="no-poster">No Poster</div>
            )}
            <div>
              <h3>{movie.title}</h3>
              <p>{movie.release_date}</p>
              {sessionStorage.getItem("user_id") && (
                <button onClick={() => handleFavorite(movie.id)}>
                  Favorite
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Home;
