import { useEffect, useState } from "react";

function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userId = sessionStorage.getItem("user_id");

  const fetchFavorites = () => {
    if (userId) {
      setLoading(true);
      fetch("/favorites", { headers: { "Content-Type": "application/json" } })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch favorites");
          return res.json();
        })
        .then((data) => setFavorites(data))
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
        {favorites.map((fav) => (
          <li key={fav.id} className="event-card">
            <p>
              Movie ID: {fav.movie_id} (Favorited:{" "}
              {new Date(fav.favorite_date).toLocaleDateString()})
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Favorites;
