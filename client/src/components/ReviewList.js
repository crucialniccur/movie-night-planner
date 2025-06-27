import { useEffect, useState } from "react";

function ReviewList() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userId = sessionStorage.getItem('user_id');

  useEffect(() => {
    if (!userId) {
      setError('You must be logged in to view your reviews.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    fetch('/reviews')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch reviews');
        return res.json();
      })
      .then(data => setReviews(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [userId]);

  const handleDelete = (reviewId) => {
    fetch(`/reviews/${reviewId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    })
      .then(res => res.json())
      .then(data => {
        if (data.message === 'Review deleted') {
          setReviews(reviews.filter(r => r.id !== reviewId));
        } else {
          setError(data.error || 'Failed to delete review');
        }
      })
      .catch(err => setError('Failed to delete review'));
  };

  if (loading) return <div className="container">Loading reviews...</div>;
  if (error) return <div className="container">Error: {error}</div>;

  return (
    <div className="container">
      <h1>My Reviews</h1>
      {reviews.length === 0 ? (
        <p>You have not left any reviews yet.</p>
      ) : (
        <ul>
          {reviews.map(review => (
            <li key={review.id} className="event-card">
              <p><strong>Movie ID:</strong> {review.movie_id}</p>
              <p><strong>Rating:</strong> {review.rating}</p>
              <p><strong>Review:</strong> {review.content}</p>
              <button onClick={() => handleDelete(review.id)}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ReviewList;
