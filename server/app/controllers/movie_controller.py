from flask import Blueprint, request, session, jsonify
from flask_restful import Api, Resource
from ..models import db, User, Review, UserMovie
from datetime import datetime
import traceback

movie_bp = Blueprint('movie_bp', __name__)
api = Api(movie_bp)

def login_required(func):
    def wrapper(*args, **kwargs):
        if 'user_id' not in session:
            return {'error': 'Unauthorized'}, 401
        return func(*args, **kwargs)
    wrapper.__name__ = func.__name__
    return wrapper

class UserMovieResource(Resource):
    @login_required
    def post(self, movie_id):
        user_id = session.get('user_id')
        if not UserMovie.query.filter_by(user_id=user_id, movie_id=movie_id).first():
            user_movie = UserMovie(user_id=user_id, movie_id=movie_id)
            db.session.add(user_movie)
            db.session.commit()
            return user_movie.to_dict(), 201
        return {'error': 'Already favorited'}, 400

    @login_required
    def delete(self, movie_id):
        user_id = session.get('user_id')
        user_movie = UserMovie.query.filter_by(user_id=user_id, movie_id=movie_id).first()
        if user_movie:
            db.session.delete(user_movie)
            db.session.commit()
            return {'message': 'Removed from favorites'}, 200
        return {'error': 'Favorite not found'}, 404

class UserFavoritesResource(Resource):
    @login_required
    def get(self):
        user_id = session.get('user_id')
        favorites = UserMovie.query.filter_by(user_id=user_id).all()
        return [fav.to_dict() for fav in favorites], 200

class ReviewList(Resource):
    @login_required
    def get(self):
        user_id = session.get('user_id')
        reviews = Review.query.filter_by(user_id=user_id).all()
        return [r.to_dict(only=('id', 'content', 'rating', 'movie_id')) for r in reviews], 200

    @login_required
    def post(self):
        data = request.get_json()
        if not data or not all(key in data for key in ['content', 'rating', 'movie_id']):
            return {'error': 'Missing required fields'}, 400
        user_id = session.get('user_id')
        rating = data.get('rating')
        movie_id = data.get('movie_id')
        content = data.get('content')
        if rating is None or not 1 <= rating <= 5:
            return {'error': 'Rating must be between 1 and 5'}, 400
        user_movie = UserMovie.query.filter_by(user_id=user_id, movie_id=movie_id).first()
        if not user_movie:
            return {'error': 'You can only review movies you have favorited.'}, 403
        try:
            new_review = Review(
                content=content,
                rating=rating,
                user_id=user_id,
                movie_id=movie_id
            )
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

api.add_resource(UserMovieResource, '/api/favorites/<int:movie_id>')
api.add_resource(UserFavoritesResource, '/api/favorites')
api.add_resource(ReviewList, '/api/reviews', '/api/reviews/<int:review_id>')
api.add_resource(ReviewByMovie, '/api/reviews/movie/<int:movie_id>')
