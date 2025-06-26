#!/usr/bin/env python3

# Standard library imports

# Remote library imports
from flask import request
from flask_restful import Resource

# Local imports
from config import app, db, api
# Add your model imports
from models import User, Event, Review, UserEvent


# Views go here!

@app.route('/')
def index():
    return '<h1>Project Server</h1>'


class EventList(Resource):
    def get(self):
        events = [event.to_dict() for event in Event.query.all()]
        return events, 200

    def post(self):
        data = request.get_json()
        try:
            event = Event(
                title=data['title'],
                date=datetime.strptime(data['date'], '%Y-%m-%d %H:%M:%S')
            )
            db.session.add(event)
            db.session.commit()
            return event.to_dict(), 201
        except ValueError as e:
            return {'error': str(e)}, 400


class EventByID(Resource):
    def get(self, id):
        event = Event.query.get_or_404(id)
        return event.to_dict(), 200

    def patch(self, id):
        event = Event.query.get_or_404(id)
        data = request.get_json()
        try:
            for key, value in data.items():
                if key == 'date':
                    value = datetime.strptime(value, '%Y-%m-%d %H:%M:%S')
                setattr(event, key, value)
            db.session.commit()
            return event.to_dict(), 200
        except ValueError as e:
            return {'error': str(e)}, 400

    def delete(self, id):
        event = Event.query.get_or_404(id)
        db.session.delete(event)
        db.session.commit()
        return {'message': 'Event deleted'}, 200


class UserList(Resource):
    def get(self):
        users = [user.to_dict() for user in User.query.all()]
        return users, 200

    def post(self):
        data = request.get_json()
        try:
            user = User(username=data['username'])
            db.session.add(user)
            db.session.commit()
            return user.to_dict(), 201
        except ValueError as e:
            return {'error': str(e)}, 400


class ReviewList(Resource):
    def get(self):
        reviews = [review.to_dict() for review in Review.query.all()]
        return reviews, 200

    def post(self):
        data = request.get_json()
        try:
            review = Review(
                content=data['content'],
                rating=data['rating'],
                user_id=data['user_id'],
                event_id=data['event_id']
            )
            db.session.add(review)
            db.session.commit()
            return review.to_dict(), 201
        except ValueError as e:
            return {'error': str(e)}, 400


class UserEventList(Resource):
    def get(self):
        user_events = [ue.to_dict() for ue in UserEvent.query.all()]
        return user_events, 200

    def post(self):
        data = request.get_json()
        try:
            user_event = UserEvent(
                user_id=data['user_id'],
                event_id=data['event_id'],
                role=data['role']
            )
            db.session.add(user_event)
            db.session.commit()
            return user_event.to_dict(), 201
        except ValueError as e:
            return {'error': str(e)}, 400


if __name__ == '__main__':
    app.run(port=5555, debug=True)
