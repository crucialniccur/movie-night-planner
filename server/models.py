from sqlalchemy_serializer import SerializerMixin
from sqlalchemy.ext.associationproxy import association_proxy

from config import db

# Models go here!


class User(db.Model, SerializerMixin):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    reviews = db.relationship('Review', backref='user', lazy=True)
    events = db.relationship('UserEvent', backref='user', lazy=True)

    serialize_rules = ('-reviews.user', '-events.user')
