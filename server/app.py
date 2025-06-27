#!/usr/bin/env python3

# Standard library imports
from datetime import datetime

# Remote library imports
from flask import request, session
from flask_restful import Resource

# Local imports
from config import app, db, api
from models import User, Event, Review, UserEvent


# Middleware to check authentication
def login_required(func):
    def wrapper(*args, **kwargs):
        if 'user_id' not in session:
            return {'error': 'Unauthorized'}, 401
        return func(*args, **kwargs)
    wrapper.__name__ = func.__name__
    return wrapper


# Views go here!

# Index route
@app.route('/')
def index():
    return '<h1>Movie night Planner Innit</h1>'


@app.route('/check-session')
def check_session():
    return {'user_id': session.get('user_id', None)}, 200


# Authentication routes
class Login(Resource):
    def post(self):
        data = request.get_json()
        user = User.query.filter_by(username=data.get('username')).first()
        if user and user.check_password(data.get('password')):
            session['user_id'] = user.id
            return user.to_dict(only=('id', 'username')), 200
        return {'error': 'Invalid credentials'}, 401


class Logout(Resource):
    def delete(self):
        session.pop('user_id', None)
        return {'message': 'Logged out'}, 200


# Resource routes
class UserList(Resource):
    def get(self):
        users = [user.to_dict(only=('id', 'username'))
                 for user in User.query.all()]
        return users, 200

    def post(self):
        data = request.get_json()
        try:
            user = User(username=data['username'])
            user.set_password(data['password'])
            db.session.add(user)
            db.session.commit()
            session['user_id'] = user.id
            return user.to_dict(only=('id', 'username')), 201
        except ValueError as e:
            return {'error': str(e)}, 400


class EventList(Resource):
    def get(self):
        events = [event.to_dict(only=('id', 'title', 'date'))
                  for event in Event.query.all()]
        return events, 200

    @login_required
    def post(self):
        data = request.get_json()
        try:
            event = Event(
                title=data['title'],
                date=datetime.strptime(data['date'], '%Y-%m-%d %H:%M:%S')
            )
            db.session.add(event)
            db.session.commit()
            return event.to_dict(only=('id', 'title', 'date')), 201
        except ValueError as e:
            return {'error': str(e)}, 400


class EventByID(Resource):
    def get(self, id):
        event = Event.query.get_or_404(id)
        return event.to_dict(only=('id', 'title', 'date')), 200

    @login_required
    def patch(self, id):
        event = Event.query.get_or_404(id)
        data = request.get_json()
        try:
            for key, value in data.items():
                if key == 'date':
                    value = datetime.strptime(value, '%Y-%m-%d %H:%M:%S')
                setattr(event, key, value)
            db.session.commit()
            return event.to_dict(only=('id', 'title', 'date')), 200
        except ValueError as e:
            return {'error': str(e)}, 400

    @login_required
    def delete(self, id):
        event = Event.query.get_or_404(id)
        db.session.delete(event)
        db.session.commit()
        return {'message': 'Event deleted'}, 200


class ReviewList(Resource):
    def get(self):
        reviews = [review.to_dict(only=(
            'id', 'content', 'rating', 'user_id', 'event_id')) for review in Review.query.all()]
        return reviews, 200

    @login_required
    def post(self):
        data = request.get_json()
        try:
            review = Review(
                content=data['content'],
                rating=data['rating'],
                user_id=session['user_id'],
                event_id=data['event_id']
            )
            db.session.add(review)
            db.session.commit()
            return review.to_dict(only=('id', 'content', 'rating', 'user_id', 'event_id')), 201
        except ValueError as e:
            return {'error': str(e)}, 400


class UserEventList(Resource):
    def get(self):
        user_events = [ue.to_dict(
            only=('id', 'user_id', 'event_id', 'role')) for ue in UserEvent.query.all()]
        return user_events, 200

    @login_required
    def post(self):
        data = request.get_json()
        try:
            user_event = UserEvent(
                user_id=session['user_id'],
                event_id=data['event_id'],
                role=data['role']
            )
            db.session.add(user_event)
            db.session.commit()
            return user_event.to_dict(only=('id', 'user_id', 'event_id', 'role')), 201
        except ValueError as e:
            return {'error': str(e)}, 400


# Register resources
api.add_resource(Login, '/login')
api.add_resource(Logout, '/logout')
api.add_resource(UserList, '/users')
api.add_resource(EventList, '/events')
api.add_resource(EventByID, '/events/<int:id>')
api.add_resource(ReviewList, '/reviews')
api.add_resource(UserEventList, '/user_events')


# Run the Flask server
if __name__ == '__main__':
    app.run(port=5555, debug=True)
