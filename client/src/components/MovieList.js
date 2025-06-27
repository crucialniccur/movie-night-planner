import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function MovieList() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetch("/events")
      .then((res) => res.json())
      .then((data) => setEvents(data))
      .catch((error) => console.error("Error fetching events:", error));
  }, []);

  return (
    <div>
      <h1>Movie Night Events</h1>
      <ul>
        {events.map((event) => (
          <li key={event.id}>
            {event.title} - {new Date(event.date).toLocaleString()}
            <Link to={`/reviews?event_id=${event.id}`}>View Reviews</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default MovieList;
