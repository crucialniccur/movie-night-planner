te # Movie Night Planner

[Live Demo on Netlify](https://matis-movie-planner.netlify.app/)

## Overview

Movie Night Planner is a full-stack web application that helps users discover trending movies, save their favorites, and share reviews. The app features user authentication, favorites management, and a modern, responsive UI built with React and Bootstrap.

**Now featuring a clean, light, Apple-inspired theme and improved user experience!**

---

## Features

- User signup, login, and logout
- Browse trending and popular movies (powered by TMDB API)
- Favorite/unfavorite movies
- Leave, edit, and delete reviews for favorited movies
- Responsive, mobile-friendly design using Bootstrap
- Session-based authentication (secure, cross-origin)
- Modern, visually appealing UI with a light theme
- Deployed frontend (Netlify) and backend (Render)

---

## API Endpoints & CRUD Operations

### Reviews
- **Create:** `POST /api/reviews` — Add a new review for a movie
- **Read:** `GET /api/reviews/movie/<movie_id>` — Get all reviews for a movie
- **Update:** `PATCH /api/reviews/<review_id>` — Edit a review
- **Delete:** `DELETE /api/reviews/<review_id>` — Delete a review

### Favorites
- **Create:** `POST /api/favorites/<movie_id>` — Add a movie to favorites
- **Read:** `GET /api/favorites` — List user favorites
- **Delete:** `DELETE /api/favorites/<movie_id>` — Remove a movie from favorites

### Users
- **Create:** `POST /api/signup` — Register a new user
- **Read:** `GET /check-session` — Get current user info

### Movies
- **Read:** Movies are fetched from the TMDB API (external)

---

## Tech Stack

- **Frontend:** React, Bootstrap, Create React App
- **Backend:** Flask, Flask-RESTful, SQLAlchemy, Flask-Migrate, Flask-Bcrypt, Flask-CORS
- **Database:** PostgreSQL
- **Deployment:** Netlify (frontend), Render (backend)

---

## Live Demo

- 🌐 [Movie Night Planner (Netlify)](https://matis-movie-planner.netlify.app/)

---

## Getting Started

### Prerequisites

- Node.js & npm (for frontend)
- Python 3.9+ & pip (for backend)
- PostgreSQL (local or cloud)

### 1. Clone the Repository

```bash
git clone https://github.com/crucialniccur/movie-night-planner
cd movie-night-planner
```

### 2. Backend Setup

```bash
cd server
pip install -r requirements.txt
```

#### Environment Variables

Create a `.env` file in `server/` with:

```
DATABASE_URL=postgresql://<user>:<password>@localhost:5432/<dbname>
SECRET_KEY=your_secret_key
```

#### Database Migration & Seed

```bash
flask db upgrade
python seed.py
```

#### Run the Backend

```bash
flask run
```

### 3. Frontend Setup

```bash
cd ../client
npm install
```

#### Environment Variables

Create a `.env` file in `client/` with:

```
REACT_APP_API_URL=https://<your-backend-url>
```

#### Run the Frontend

```bash
npm start
```

---

## Deployment

- **Frontend:** Deployed to Netlify ([Live Link](https://matis-movie-planner.netlify.app/))
- **Backend:** Deployed to Render (update `REACT_APP_API_URL` in Netlify settings to point to your Render backend)

---

## Environment Variables

| Location | Variable          | Example/Value                      |
| -------- | ----------------- | ---------------------------------- |
| server   | DATABASE_URL      | postgresql://user:pass@host/dbname |
| server   | SECRET_KEY        | your_secret_key                    |
| client   | REACT_APP_API_URL | https://your-backend.onrender.com  |

---

## Screenshots

> Add screenshots of the Home, Movies, and Favorites pages here for a visual overview.

---

## Credits

- Movie data from [TMDB API](https://www.themoviedb.org/documentation/api)
- UI powered by [Bootstrap](https://getbootstrap.com/)

---

## License

This project is licensed under the MIT License.

## Database Schema & Backend Relationships

### Entity-Relationship Overview

- **User**: Can have many reviews, many favorited movies, and can participate in many events.
- **Review**: Belongs to a user and references a movie (by TMDB ID).
- **UserMovie**: Join table for user favorites (many-to-many between users and movies).
- **Event**: (Optional, for future) Users can join events (movie nights) via UserEvent.
- **UserEvent**: Join table for users and events (many-to-many).

### Database Tables

#### User

| Field        | Type         | Description     |
| ------------ | ------------ | --------------- |
| id           | Integer (PK) | Unique user ID  |
| username     | String       | Unique username |
| \_\_password | String       | Hashed password |

- Relationships:
  - `reviews`: One-to-many with Review
  - `movies`: One-to-many with UserMovie (favorites)
  - `events`: One-to-many with UserEvent

#### Review

| Field    | Type         | Description           |
| -------- | ------------ | --------------------- |
| id       | Integer (PK) | Review ID             |
| content  | String       | Review text           |
| rating   | Integer      | Rating (1-5, checked) |
| user_id  | Integer (FK) | References User       |
| movie_id | Integer      | TMDB Movie ID         |

#### UserMovie (Favorites)

| Field         | Type         | Description     |
| ------------- | ------------ | --------------- |
| id            | Integer (PK) | Join table ID   |
| user_id       | Integer (FK) | References User |
| movie_id      | Integer      | TMDB Movie ID   |
| favorite_date | DateTime     | When favorited  |

#### Event (optional/future)

| Field     | Type         | Description            |
| --------- | ------------ | ---------------------- |
| id        | Integer (PK) | Event ID               |
| title     | String       | Event title            |
| date      | DateTime     | Event date             |
| image_url | String       | Event image (optional) |

#### UserEvent (optional/future)

| Field    | Type         | Description          |
| -------- | ------------ | -------------------- |
| id       | Integer (PK) | Join table ID        |
| user_id  | Integer (FK) | References User      |
| event_id | Integer (FK) | References Event     |
| role     | String       | User's role in event |

### Entity-Relationship Diagram (Markdown)

```mermaid
erDiagram
    User ||--o{ Review : writes
    User ||--o{ UserMovie : favorites
    User ||--o{ UserEvent : attends
    Event ||--o{ UserEvent : has
    Review }o--|| User : "belongs to"
    Review }o--|| Movie : "references (by TMDB ID)"
    UserMovie }o--|| User : "belongs to"
    UserMovie }o--|| Movie : "references (by TMDB ID)"
    UserEvent }o--|| User : "belongs to"
    UserEvent }o--|| Event : "belongs to"
```

### Notes

- **Movies** are not stored as full records in the database; only their TMDB IDs are referenced in `UserMovie` and `Review`.
- **Password** is securely hashed using bcrypt.
- **All relationships** are managed via SQLAlchemy ORM.
- **Events** and `UserEvent` are included for future group movie night features.
