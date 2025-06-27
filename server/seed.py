#!/usr/bin/env python3
from random import randint, choice as rc
from faker import Faker
from config import app, db
from models import User, Event, Review, UserMovie
from datetime import datetime, timedelta

if __name__ == '__main__':
    fake = Faker()
    with app.app_context():
        print("Starting seed...")
        db.drop_all()
        db.create_all()

        # Create users
        users = [User(username=name) for name in ["alice", "bob", "charlie"]]
        for user in users:
            user.set_password('password123')
        db.session.add_all(users)
        db.session.commit()

        # Create events with random TMDB poster images
        image_urls = [
            'https://image.tmdb.org/t/p/w500/8cdWjvZNUix8Z86vR7l8Qqr2HYT.jpg',
            'https://image.tmdb.org/t/p/w500/9yBVqNruk6Ykrwc32qrK2TIE5xw.jpg',
            'https://image.tmdb.org/t/p/w500/kb4s0ML0iVZlG6wAKbbs9NAm6X.jpg'
        ]
        events = [Event(
            title=f"Movie Night: {fake.catch_phrase()}",
            date=fake.date_time_between(start_date="now", end_date="+30d"),
            image_url=image_urls[i % len(image_urls)]
        ) for i in range(3)]
        db.session.add_all(events)
        db.session.commit()

        # Create user favorite movies
        movie_ids = [11111, 22222, 33333]  # TMDB-like IDs
        user_movies = [UserMovie(user_id=user.id, movie_id=movie_ids[i % len(
            movie_ids)]) for i, user in enumerate(users)]
        db.session.add_all(user_movies)
        db.session.commit()

        # Create reviews for favorited movies
        reviews = []
        for user in users:
            for movie in user_movies:
                if movie.user_id == user.id:
                    reviews.append(Review(
                        content=fake.sentence(nb_words=10),
                        rating=randint(1, 5),
                        user_id=user.id,
                        movie_id=movie.movie_id
                    ))
        db.session.add_all(reviews)
        db.session.commit()

        print("Database seeded successfully!")
