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
        console.log("Events:", data); // Debug
        setEvents(data);
      })
      .catch((error) => console.error("Error:", error));
  }, []);

  return (
    <div className="container">
      <h1>Movie Events</h1>
      {events.length === 0 ? (
        <p>No events available.</p>
      ) : (
        <ul>
          {events.map((event) => (
            <li key={event.id} className="event-card">
              {event.image_url ? (
                <img
                  src={event.image_url}
                  alt={event.title}
                  className="event-poster"
                />
              ) : (
                <div className="no-poster">No Poster</div>
              )}
              <div>
                <h3>{event.title}</h3>
                <p>{new Date(event.date).toLocaleDateString()}</p>
                <Link to={`/reviews?event_id=${event.id}`}>Submit Review</Link> |{" "}
                <Link to={`/reviews/list?event_id=${event.id}`}>
                  View Reviews
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default MovieList;
