import { useEffect, useState } from 'react';

function Movies() {
  const [movies, setMovies] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewsByMovie, setReviewsByMovie] = useState({});
  const [reviewContent, setReviewContent] = useState({});
  const [reviewRating, setReviewRating] = useState({});
  const [reviewError, setReviewError] = useState({});
  const apiKey = "a4cd64db16ded6df2896cccfb552989a";
  const userId = sessionStorage.getItem('user_id');

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&sort_by=popularity.desc&page=1`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch movies');
        return res.json();
      })
      .then(data => {
        if (data.results) setMovies(data.results);
        else setError('No movie data found');
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));

    if (userId) {
      fetch('/favorites')
        .then(res => res.json())
        .then(data => setFavorites(data.map(f => f.movie_id)))
        .catch(err => console.error('Error fetching favorites:', err));
    }
  }, [apiKey, userId]);

  useEffect(() => {
    // Fetch reviews for all movies
    async function fetchReviews() {
      let reviewsObj = {};
      for (let movie of movies) {
        const res = await fetch(`/reviews?movie_id=${movie.id}`);
        if (res.ok) {
          const reviews = await res.json();
          reviewsObj[movie.id] = reviews;
        } else {
          reviewsObj[movie.id] = [];
        }
      }
      setReviewsByMovie(reviewsObj);
    }
    if (movies.length > 0) {
      fetchReviews();
    }
  }, [movies]);

  const handleFavorite = (movieId) => {
    fetch(`/favorite/${movieId}`, {
      method: favorites.includes(movieId) ? 'DELETE' : 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
      .then(res => res.json())
      .then(data => {
        if (data.message === 'Movie favorited') {
          setFavorites([...favorites, movieId]);
        } else if (data.message === 'Movie removed from favorites') {
          setFavorites(favorites.filter(id => id !== movieId));
        }
      })
      .catch(err => console.error('Favorite error:', err));
  };

  const handleReviewChange = (movieId, field, value) => {
    if (field === 'content') {
      setReviewContent({ ...reviewContent, [movieId]: value });
    } else if (field === 'rating') {
      setReviewRating({ ...reviewRating, [movieId]: value });
    }
  };

  const handleReviewSubmit = (e, movieId) => {
    e.preventDefault();
    setReviewError({ ...reviewError, [movieId]: null });
    fetch('/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: reviewContent[movieId] || '',
        rating: reviewRating[movieId] || 1,
        movie_id: movieId
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setReviewError({ ...reviewError, [movieId]: data.error });
        } else {
          setReviewContent({ ...reviewContent, [movieId]: '' });
          setReviewRating({ ...reviewRating, [movieId]: 1 });
          setReviewError({ ...reviewError, [movieId]: null });
          // Refresh reviews for this movie
          fetch(`/reviews?movie_id=${movieId}`)
            .then(res => res.json())
            .then(reviews => setReviewsByMovie({ ...reviewsByMovie, [movieId]: reviews }));
        }
      })
      .catch(() => setReviewError({ ...reviewError, [movieId]: 'Failed to submit review' }));
  };

  if (loading) return <div className="container">Loading movies...</div>;
  if (error) return <div className="container">Error: {error}</div>;

  return (
    <div className="container">
      <h1>Movies</h1>
      <ul>
        {movies.map(movie => (
          <li key={movie.id} className="event-card">
            <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt={movie.title} className="event-poster" />
            <div>
              <h3>{movie.title}</h3>
              <p>{movie.release_date}</p>
              {userId && (
                <button onClick={() => handleFavorite(movie.id)}>
                  {favorites.includes(movie.id) ? 'Remove Favorite' : 'Favorite'}
                </button>
              )}
              <div>
                <h4>Reviews:</h4>
                {reviewsByMovie[movie.id] && reviewsByMovie[movie.id].length > 0 ? (
                  <ul>
                    {reviewsByMovie[movie.id].map(review => (
                      <li key={review.id}>
                        <strong>User {review.user_id}:</strong> {review.content} (Rating: {review.rating})
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No reviews yet.</p>
                )}
              </div>
              {userId && favorites.includes(movie.id) && (
                <form onSubmit={e => handleReviewSubmit(e, movie.id)} className="review-form">
                  <h4>Leave a Review</h4>
                  <textarea
                    value={reviewContent[movie.id] || ''}
                    onChange={e => handleReviewChange(movie.id, 'content', e.target.value)}
                    placeholder="Write your review"
                    required
                  />
                  <input
                    type="number"
                    value={reviewRating[movie.id] || 1}
                    onChange={e => handleReviewChange(movie.id, 'rating', Math.max(1, Math.min(5, e.target.value)))}
                    min="1"
                    max="5"
                    required
                  />
                  <button type="submit">Submit Review</button>
                  {reviewError[movie.id] && <p style={{ color: 'red' }}>{reviewError[movie.id]}</p>}
                </form>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Movies;
