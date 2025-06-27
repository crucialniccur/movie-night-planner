import { useEffect, useState } from 'react';

function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const userId = sessionStorage.getItem('user_id');

  const fetchFavorites = () => {
    if (userId) {
      fetch(`/favorites`, {
        headers: { 'Content-Type': 'application/json' },
      })
        .then(res => res.json())
        .then(data => setFavorites(data))
        .catch(err => console.error('Error fetching favorites:', err));
    }
  };

  useEffect(() => {
    fetchFavorites();
    // Listen for updates from Movies page
    const handler = () => fetchFavorites();
    window.addEventListener('favorites-updated', handler);
    return () => window.removeEventListener('favorites-updated', handler);
  }, [userId]);

  return (
    <div className="container">
      <h1>My Favorites</h1>
      <ul>
        {favorites.map(fav => (
          <li key={fav.id} className="event-card">
            <p>Movie ID: {fav.movie_id} (Favorited: {fav.favorite_date})</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Favorites;
