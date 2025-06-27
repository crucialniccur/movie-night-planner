import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

function ReviewList() {
  const [reviews, setReviews] = useState([]);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const eventId = queryParams.get("event_id");

  useEffect(() => {
    fetch("/reviews")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch reviews");
        return res.json();
      })
      .then((data) =>
        setReviews(
          data.filter((review) => review.event_id === parseInt(eventId))
        )
      )
      .catch((error) => console.error("Error fetching reviews:", error));
  }, [eventId]);

  return (
    <div>
      <h1>Reviews for Event {eventId || "Unknown"}</h1>
      {reviews.length === 0 ? (
        <p>No reviews yet.</p>
      ) : (
        <ul>
          {reviews.map((review) => (
            <li key={review.id}>
              {review.content} - Rating: {review.rating} (User ID:{" "}
              {review.user_id})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ReviewList;
