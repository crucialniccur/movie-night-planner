#!/usr/bin/env python3

# Standard library imports
from random import randint, choice as rc
from datetime import datetime, timedelta

# Remote library imports
from faker import Faker

# Local imports
from config import app, db
from models import User, Event, Review, UserEvent

if __name__ == '__main__':
    fake = Faker()
    with app.app_context():
        print("Starting seed...")

        # Clear existing data
        db.drop_all()
        db.create_all()

        # Seed Users
        users = []
        for _ in range(5):
            user = User(username=fake.unique.user_name())
            users.append(user)
        db.session.add_all(users)

        # Seed Events
        events = []
        for _ in range(3):
            event = Event(
                title=f"Movie Night: {fake.catch_phrase()}",
                date=fake.date_time_between(start_date="now", end_date="+30d")
            )
            events.append(event)
        db.session.add_all(events)

        # Commit users and events to get IDs
        db.session.commit()

        # Seed Reviews (one-to-many: User -> Reviews, Event -> Reviews)
        reviews = []
        for user in users:
            for event in events[:2]:  # Each user reviews 2 events
                review = Review(
                    content=fake.sentence(nb_words=10),
                    rating=randint(1, 5),
                    user_id=user.id,
                    event_id=event.id
                )
                reviews.append(review)
        db.session.add_all(reviews)

        # Seed UserEvents (many-to-many: User <-> Event)
        user_events = []
        roles = ["host", "guest"]
        for user in users:
            for event in events:
                user_event = UserEvent(
                    user_id=user.id,
                    event_id=event.id,
                    role=rc(roles)  # Randomly assign host or guest
                )
                user_events.append(user_event)
        db.session.add_all(user_events)

        # Commit all changes
        db.session.commit()
        print("Database seeded successfully!")
