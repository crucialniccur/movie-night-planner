# Movie Night Planner

Movie Night Planner is a full-stack web application that allows users to discover trending movies, favorite them, leave reviews, and plan movie nights with friends. The app uses React for the frontend and Flask (with SQLAlchemy and PostgreSQL) for the backend.

## Features
- User authentication (login, logout, register)
- Browse trending movies (from TMDB API)
- Favorite movies and manage your favorites
- Leave and view reviews for movies
- Responsive, modern UI

## Tech Stack
- **Frontend:** React, CSS
- **Backend:** Flask, Flask-RESTful, SQLAlchemy, Flask-Migrate
- **Database:** PostgreSQL

## Getting Started

### Prerequisites
- Python 3.8+
- Node.js & npm
- PostgreSQL

### Backend Setup
1. **Clone the repository:**
   ```sh
   git clone <repo-url>
   cd movie-night-planner
   ```
2. **Create and activate a virtual environment:**
   ```sh
   python3 -m venv .venv
   source .venv/bin/activate
   ```
3. **Install Python dependencies:**
   ```sh
   pip install -r requirements.txt
   # or if using pipenv:
   pipenv install
   ```
4. **Configure environment variables:**
   - Create a `.env` file in the `server/` directory (optional, if using env vars):
     ```
     SECRET_KEY=your_secret_key
     DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/movienightdb
     ```
5. **Set up the database:**
   - Ensure PostgreSQL is running and a database is created:
     ```sh
     createdb movienightdb
     ```
   - Run migrations:
     ```sh
     cd server
     flask db upgrade
     ```
   - Seed the database (optional):
     ```sh
     python seed.py
     ```
6. **Run the backend server:**
   ```sh
   python app.py
   # or
   flask run
   ```

### Frontend Setup
1. **Install dependencies:**
   ```sh
   cd client
   npm install
   ```
2. **Configure TMDB API Key:**
   - Create a `.env` file in the `client/` directory:
     ```
     REACT_APP_TMDB_API_KEY=your_tmdb_api_key
     ```
3. **Run the frontend:**
   ```sh
   npm start
   ```
   The app will be available at `http://localhost:3000`.

## Environment Variables
- `SECRET_KEY`: Flask secret key for sessions
- `DATABASE_URL`: PostgreSQL connection string
- `REACT_APP_TMDB_API_KEY`: TMDB API key for fetching movies (frontend)

## Deployment
- Set all environment variables in your deployment platform (do not commit secrets to git)
- Ensure your production database is set up and migrated
- Use `pip install -r requirements.txt` and `npm install` on your server

## Troubleshooting
- If you see `relation "users" does not exist`, run migrations with `flask db upgrade`.
- If you get 500 errors on favorite/review endpoints, check your database connection and tables.
- For CORS or session issues, ensure frontend fetches use `credentials: 'include'` and backend CORS is enabled.

## License
This project is licensed under the MIT License.
