import { useEffect, useState } from "react";

function Home() {
  const [movies, setMovies] = useState([]);
  const apiKey = "a4cd64db16ded6df2896cccfb552989a"; //   My key

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
            <img
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
              alt={movie.title}
              className="event-poster"
            />
            <div>
              <h3>{movie.title}</h3>
              <p>{movie.release_date}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Home;
