# routes/auth_routes.py
from flask import Blueprint, request, jsonify
import psycopg2
from werkzeug.security import generate_password_hash, check_password_hash
# 假设 db_utils.py 中有一个 get_connection 用来获取 psycopg2 的连接
from app.db_utils import get_connection

auth_bp = Blueprint("auth_bp", __name__)

@auth_bp.route("/register", methods=["POST"])
def register_user():
    """
    用户注册接口
    请求体(JSON)示例:
    {
        "username": "testuser",
        "password": "123456"
    }
    """
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"error": "Username and password are required."}), 400

    # 对密码进行哈希处理，保证安全
    hashed_password = generate_password_hash(password)

    try:
        conn = get_connection()
        cur = conn.cursor()
        # 你需要在数据库中提前建好用户表: 
        # CREATE TABLE users (id SERIAL PRIMARY KEY, username TEXT UNIQUE, password TEXT);
        
        cur.execute("INSERT INTO users (username, password) VALUES (%s, %s)", 
                    (username, hashed_password))
        conn.commit()
        cur.close()
        conn.close()
    except psycopg2.Error as e:
        return jsonify({"error": str(e)}), 500

    return jsonify({"message": "User registered successfully."}), 201


@auth_bp.route("/login", methods=["POST"])
def login_user():
    """
    用户登录接口
    请求体(JSON)示例:
    {
        "username": "testuser",
        "password": "123456"
    }
    """
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"error": "Username and password are required."}), 400

    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("SELECT password FROM users WHERE username = %s", (username,))
        result = cur.fetchone()
        cur.close()
        conn.close()

        if not result:
            return jsonify({"error": "User not found."}), 404

        stored_hashed_password = result[0]
        if check_password_hash(stored_hashed_password, password):
            return jsonify({"message": "Login successful."}), 200
        else:
            return jsonify({"error": "Invalid username or password."}), 401

    except psycopg2.Error as e:
        return jsonify({"error": str(e)}), 500
