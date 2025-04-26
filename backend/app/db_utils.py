import os
import psycopg2

def get_connection():
    """返回一个连接到 Aiven 云端 PostgreSQL 的连接"""
    return psycopg2.connect(
        host=os.getenv("DB_HOST"),
        port=os.getenv("DB_PORT"),  # 加上端口
        database=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        sslmode=os.getenv("DB_SSLMODE", "require"),  # Aiven 要求使用 SSL
        options="-c client_encoding=UTF8"
    )