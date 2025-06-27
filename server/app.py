#!/usr/bin/env python3

# Standard library imports
from datetime import datetime

# Remote library imports
from flask import request, session
from flask_restful import Resource

# Local imports
from config import app, db, api
from models import User, Event, Review, UserEvent, UserMovie

# Middleware to check authentication


def login_required(func):
    def wrapper(*args, **kwargs):
        if 'user_id' not in session:
            return {'error': 'Unauthorized'}, 401
        return func(*args, **kwargs)
    wrapper.__name__ = func.__name__
    return wrapper

# Index route


@app.route('/')
def index():
    return '<h1>Movie Night Planner Innit</h1>'


@app.route('/check-session')
def check_session():
    return {'user_id': session.get('user_id', None)}, 200

# Authentication routes


class Login(Resource):
    def post(self):
        data = request.get_json()
        if not data or 'username' not in data or 'password' not in data:
            return {'error': 'Missing username or password'}, 400
        user = User.query.filter_by(username=data.get('username')).first()
        if user and user.check_password(data.get('password')):
            session['user_id'] = user.id  # Ensure this sets the session
            return user.to_dict(only=('id', 'username')), 200
        return {'error': 'Invalid credentials'}, 401


class Logout(Resource):
    def post(self):
        session.clear()
        return {'message': 'Logged out successfully'}, 200

# Resource routes


class UserList(Resource):
    def get(self):
        users = [user.to_dict(only=('id', 'username'))
                 for user in User.query.all()]
        return users, 200

    def post(self):
        data = request.get_json()
        if not data:
            return {'error': 'Missing or invalid JSON body'}, 400
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
        if not data:
            return {'error': 'Missing or invalid JSON body'}, 400
        try:
            event = Event(title=data['title'], date=datetime.strptime(
                data['date'], '%Y-%m-%d %H:%M:%S'))
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
        if not data:
            return {'error': 'Missing or invalid JSON body'}, 400
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
    @login_required
    def get(self):
        user_id = session.get('user_id')
        reviews = Review.query.filter_by(user_id=user_id).all()
        return [r.to_dict(only=('id', 'content', 'rating', 'movie_id')) for r in reviews], 200

    @login_required
    def post(self):
        data = request.get_json()
        if not all(key in data for key in ['content', 'rating', 'movie_id']):
            return {'error': 'Missing required fields'}, 400
        user_id = session.get('user_id')
        if not 1 <= data['rating'] <= 5:
            return {'error': 'Rating must be between 1 and 5'}, 400
        if not UserMovie.query.filter_by(user_id=user_id, movie_id=data['movie_id']).first():
            return {'error': 'You can only review movies you have favorited.'}, 403
        new_review = Review(
            content=data['content'],
            rating=data['rating'],
            user_id=user_id,
            movie_id=data['movie_id']
        )
        try:
            db.session.add(new_review)
            db.session.commit()
            return new_review.to_dict(), 201
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500

    @login_required
    def delete(self, review_id):
        review = Review.query.get_or_404(review_id)
        if review.user_id != session.get('user_id'):
            return {'error': 'Unauthorized'}, 403
        db.session.delete(review)
        db.session.commit()
        return {'message': 'Review deleted'}, 200


class ReviewByMovie(Resource):
    @login_required
    def get(self, movie_id):
        reviews = Review.query.filter_by(movie_id=movie_id).all()
        return [r.to_dict(only=('id', 'content', 'rating', 'user_id', 'movie_id')) for r in reviews], 200


class UserEventList(Resource):
    def get(self):
        user_events = [ue.to_dict(
            only=('id', 'user_id', 'event_id', 'role')) for ue in UserEvent.query.all()]
        return user_events, 200

    @login_required
    def post(self):
        data = request.get_json()
        if not data:
            return {'error': 'Missing or invalid JSON body'}, 400
        try:
            user_event = UserEvent(
                user_id=session['user_id'], event_id=data['event_id'], role=data['role'])
            db.session.add(user_event)
            db.session.commit()
            return user_event.to_dict(only=('id', 'user_id', 'event_id', 'role')), 201
        except ValueError as e:
            return {'error': str(e)}, 400


class UserMovieResource(Resource):
    @login_required
    def post(self, movie_id):
        user_id = session.get('user_id')
        if UserMovie.query.filter_by(user_id=user_id, movie_id=movie_id).first():
            return {'message': 'Already favorited'}, 400
        new_favorite = UserMovie(user_id=user_id, movie_id=movie_id)
        db.session.add(new_favorite)
        db.session.commit()
        return {'message': 'Movie favorited'}, 201

    @login_required
    def delete(self, movie_id):
        user_id = session.get('user_id')
        favorite = UserMovie.query.filter_by(
            user_id=user_id, movie_id=movie_id).first()
        if not favorite:
            return {'message': 'Not favorited'}, 404
        db.session.delete(favorite)
        db.session.commit()
        return {'message': 'Movie removed from favorites'}, 200


class UserFavoritesResource(Resource):
    @login_required
    def get(self):
        user_id = session.get('user_id')
        favorites = UserMovie.query.filter_by(user_id=user_id).all()
        return [{'id': f.id, 'movie_id': f.movie_id, 'favorite_date': f.favorite_date.isoformat()} for f in favorites], 200


# Register resources
api.add_resource(Login, '/login')
api.add_resource(Logout, '/logout')
api.add_resource(UserList, '/users')
api.add_resource(EventList, '/events')
api.add_resource(EventByID, '/events/<int:id>')
api.add_resource(ReviewList, '/reviews',
                 '/reviews/<int:review_id>', endpoint='reviews')
api.add_resource(ReviewByMovie, '/reviews/<int:movie_id>',
                 endpoint='reviews_by_movie')
api.add_resource(UserEventList, '/user_events')
api.add_resource(UserMovieResource,
                 '/favorite/<int:movie_id>', endpoint='favorite')
api.add_resource(UserFavoritesResource, '/favorites', endpoint='favorites')

if __name__ == '__main__':
    app.run(port=5555, debug=True)
