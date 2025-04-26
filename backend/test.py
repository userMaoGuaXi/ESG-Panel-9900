# 文件名: run.py
"""
Flask应用程序入口文件
"""

from app import create_app

app = create_app()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002, debug=True)