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

        users = [User(username=fake.unique.user_name()) for _ in range(5)]
        db.session.add_all(users)

        events = [Event(
            title=f"Movie Night: {fake.catch_phrase()}",
            date=fake.date_time_between(start_date="now", end_date="+30d")
        ) for _ in range(3)]
        db.session.add_all(events)

        db.session.commit()

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
