from flask import Blueprint, request, session
from flask_restful import Api, Resource
from ..models import db, User

user_bp = Blueprint('user_bp', __name__)
api = Api(user_bp)

class Login(Resource):
    def post(self):
        data = request.get_json()
        if not data or 'username' not in data or 'password' not in data:
            return {'error': 'Missing username or password'}, 400
        user = User.query.filter_by(username=data.get('username')).first()
        if user and user.check_password(data.get('password')):
            session['user_id'] = user.id
            return user.to_dict(only=('id', 'username')), 200
        return {'error': 'Invalid credentials'}, 401

class Logout(Resource):
    def post(self):
        session.clear()
        return {'message': 'Logged out successfully'}, 200

class UserList(Resource):
    def get(self):
        users = [user.to_dict(only=('id', 'username')) for user in User.query.all()]
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
        except Exception as e:
            return {'error': str(e)}, 400

@user_bp.route('/check-session')
def check_session():
    user_id = session.get('user_id', None)
    if user_id:
        user = User.query.get(user_id)
        if user:
            return {'user_id': user_id, 'username': user.username}, 200
    return {'user_id': None, 'username': None}, 200

@user_bp.route('/api/debug-session')
def debug_session():
    return {'user_id': session.get('user_id', None)}, 200

api.add_resource(Login, '/api/login')
api.add_resource(Logout, '/api/logout')
api.add_resource(UserList, '/api/users')
