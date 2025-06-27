import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function MovieList() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetch("/events")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch events");
        return res.json();
      })
      .then((data) => {
        console.log("Events:", data);
        setEvents(data);
      })
      .catch((error) => console.error("Error:", error));
  }, []);

  return (
    <div className="container">
      <h1>Movie Events</h1>
      <ul>
        {events.map((event) => (
          <li
            key={event.id}
            className="event-card"
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "20px",
              background: "var(--secondary-bg)",
              borderRadius: "8px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
              padding: "15px",
            }}
          >
            <img
              src={event.image_url}
              alt={event.title}
              className="event-poster"
              style={{
                width: "100px",
                height: "150px",
                objectFit: "cover",
                borderRadius: "6px",
                marginRight: "20px",
              }}
            />
            <div>
              <h3
                style={{
                  margin: "0 0 10px 0",
                  color: "var(--highlight)",
                }}
              >
                {event.title}
              </h3>
              <p style={{ margin: "0 0 10px 0" }}>
                {new Date(event.date).toLocaleDateString()}
              </p>
              <Link
                to={`/reviews?event_id=${event.id}`}
                style={{ marginRight: "10px" }}
              >
                Submit Review
              </Link>
              <Link to={`/reviews/list?event_id=${event.id}`}>
                View Reviews
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default MovieList;
