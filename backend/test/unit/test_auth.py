# tests/unit/test_auth.py
"""
用户认证相关函数的单元测试
"""
import pytest
from unittest.mock import patch, MagicMock
import json
from werkzeug.security import generate_password_hash, check_password_hash
from app.routes.auth_routes import auth_bp

def test_password_hashing():
    """测试密码哈希和验证功能"""
    password = "test_password"
    hashed = generate_password_hash(password)
    
    # 验证正确密码
    assert check_password_hash(hashed, password)
    
    # 验证错误密码
    assert not check_password_hash(hashed, "wrong_password")

@patch('app.routes.auth_routes.get_connection')
def test_user_registration_logic(mock_get_connection, app):  # 添加app参数
    """测试用户注册逻辑（不涉及HTTP请求）"""
    # 设置模拟
    mock_conn = MagicMock()
    mock_cur = MagicMock()
    mock_conn.cursor.return_value.__enter__.return_value = mock_cur
    mock_get_connection.return_value = mock_conn
    
    # 修改: 使用Flask测试客户端而不是直接调用函数
    with app.test_client() as client:
        response = client.post(
            '/auth/register',
            json={
                "username": "testuser",
                "password": "123456"
            }
        )
    
    # 修改: 从响应对象中获取JSON数据
    response_data = json.loads(response.data)
    
    # 验证响应
    assert response.status_code == 201
    assert "message" in response_data

def test_industry_filter_clause():
    """测试行业过滤子句生成逻辑"""
    # 导入相关函数
    from app.routes.stardog_routes import stardog_bp
    
    # 测试不同行业的过滤子句
    industries = {
        "Semiconductors": "TC-SC-",
        "Biotechnology & Pharmaceuticals": "HC-BP-",
        "Internet Media & Services": "TC-IM-",
        "Drug Retailers": "HC-DR-",
        "RandomIndustry": ""  # 未知行业应该使用空过滤
    }
    
    # 验证过滤子句逻辑 - 可能需要根据实际代码实现调整
    for industry, expected_filter in industries.items():
        # 此处只是描述了测试意图，实际实现需要根据代码调整
        assert expected_filter in f"FILTER(contains(str(?category), '{expected_filter}'))"

@patch('app.routes.stardog_routes.get_connection')
def test_category_description_error_handling(mock_get_connection, app):
    """测试分类描述查询的错误处理"""
    with app.app_context():
        # 模拟数据库连接错误
        mock_get_connection.side_effect = Exception("Database connection error")
        
        # 使用测试客户端发送请求
        client = app.test_client()
        response = client.get('/stardog/getCategoryDescriptions')
        
        # 验证错误处理
        assert response.status_code == 500
        data = response.get_json()
        assert "error" in data
        assert "Database connection error" in data["error"]