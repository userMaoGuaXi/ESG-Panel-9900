# app/__init__.py
from flask import Flask

from app.routes.stardog_routes import stardog_bp  # 导入stardog蓝图

from app.routes.report import report_bp
from app.routes.auth_routes import auth_bp
from flask_cors import CORS 


from dotenv import load_dotenv

def create_app():
    app = Flask(__name__)
    CORS(app)

    # 注册Stardog相关的蓝图，放在一个独立的前缀（或者也可放在/api下，根据需求）
    app.register_blueprint(stardog_bp, url_prefix='/stardog')

    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(report_bp, url_prefix="/report")



    return app
load_dotenv()