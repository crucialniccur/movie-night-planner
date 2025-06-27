#!/usr/bin/env python3
from random import randint, choice as rc
from faker import Faker
from config import app, db
from models import User, Event, Review, UserEvent
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
        db.session.commit()  # Commit so users get IDs

        # Sample image URLs for events
        image_urls = [
            'https://image.tmdb.org/t/p/w500/8cdWjvZNUix8Z86vR7l8Qqr2HYT.jpg',  # Dune
            'https://image.tmdb.org/t/p/w500/9yBVqNruk6Ykrwc32qrK2TIE5xw.jpg',  # No Time to Die
            'https://image.tmdb.org/t/p/w500/kb4s0ML0iVZlG6wAKbbs9NAm6X.jpg'   # Spider-Man
        ]

        # Create events
        events = [
            Event(
                title=f"Movie Night: {fake.catch_phrase()}",
                date=fake.date_time_between(start_date="now", end_date="+30d"),
                image_url=image_urls[i % len(image_urls)]
            )
            for i in range(3)
        ]
        db.session.add_all(events)
        db.session.commit()  # Commit so events get IDs

        # Create reviews (each user reviews the first two events)
        reviews = [Review(
            content=fake.sentence(nb_words=10),
            rating=randint(1, 5),
            user_id=user.id,
            event_id=event.id
        ) for user in users for event in events[:2]]
        db.session.add_all(reviews)

        roles = ["host", "guest"]
        user_events = [UserEvent(
            user_id=user.id,
            event_id=event.id,
            role=rc(roles)
        ) for user in users for event in events]
        db.session.add_all(user_events)

        db.session.commit()
        print("Database seeded successfully!")
