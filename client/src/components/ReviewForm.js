import { useState } from 'react';

function ReviewForm({ movieId, onReviewAdded }) {
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(1);
  const [error, setError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch('/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, rating, movie_id: movieId }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) setError(data.error);
        else {
          setContent('');
          setRating(1);
          setError(null);
          if (onReviewAdded) onReviewAdded();
        }
      })
      .catch(err => setError('Failed to submit review'));
  };

  return (
    <div className="container">
      <h2>Leave a Review</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your review"
          required
        />
        <input
          type="number"
          value={rating}
          onChange={(e) => setRating(Math.max(1, Math.min(5, e.target.value)))}
          min="1"
          max="5"
          required
        />
        <button type="submit">Submit Review</button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </div>
  );
}

export default ReviewForm;
