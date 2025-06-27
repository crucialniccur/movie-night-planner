from sqlalchemy_serializer import SerializerMixin
from config import db, bcrypt
from sqlalchemy import CheckConstraint


class User(db.Model, SerializerMixin):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    __password = db.Column(db.String(128), nullable=False)
    reviews = db.relationship('Review', backref='user', lazy=True)
    events = db.relationship('UserEvent', backref='user', lazy=True)
    movies = db.relationship('UserMovie', backref='user_favorite', lazy=True)
    serialize_rules = ('-reviews.user', '-events.user', '-movies.user_favorite', '-__password')

    def set_password(self, password):
        self.__password = bcrypt.generate_password_hash(
            password).decode('utf-8')

    def check_password(self, password):
        return bcrypt.check_password_hash(self.__password, password)


class Event(db.Model, SerializerMixin):
    __tablename__ = 'events'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    date = db.Column(db.DateTime, nullable=False)
    image_url = db.Column(db.String(255))
    users = db.relationship('UserEvent', backref='event', lazy=True)
    serialize_rules = ('-users.event')


class Review(db.Model, SerializerMixin):
    __tablename__ = 'reviews'
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.String(500), nullable=False)
    rating = db.Column(db.Integer, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    movie_id = db.Column(db.Integer, nullable=False)
    __table_args__ = (CheckConstraint(
        'rating >= 1 AND rating <= 5', name='rating_range'),)
    serialize_rules = ('-user.reviews',)


class UserEvent(db.Model, SerializerMixin):
    __tablename__ = 'user_events'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    event_id = db.Column(db.Integer, db.ForeignKey(
        'events.id'), nullable=False)
    role = db.Column(db.String(20), nullable=False)
    serialize_rules = ('-user.events', '-event.users')


class UserMovie(db.Model, SerializerMixin):
    __tablename__ = 'user_movies'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    movie_id = db.Column(db.Integer, nullable=False)
    favorite_date = db.Column(
        db.DateTime, nullable=False, default=db.func.now())
    serialize_rules = ('-user_favorite.movies',)
