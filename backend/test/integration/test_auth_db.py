# tests/integration/test_auth_db.py
"""
用户认证与数据库交互的集成测试
"""
import pytest
from unittest.mock import patch, MagicMock
import json

def test_register_with_duplicate_username(client, mock_db):
    """测试注册已存在用户名的情况"""
    # 模拟数据库错误 - 假设是因为重复用户名
    mock_db['cursor'].execute.side_effect = Exception("duplicate key value violates unique constraint")
    
    # 发送注册请求
    response = client.post(
        '/auth/register',
        json={
            "username": "existing_user",
            "password": "test_password"
        }
    )
    
    # 验证响应
    assert response.status_code == 500
    data = json.loads(response.data)
    assert "error" in data

def test_register_with_invalid_data(client):
    """测试传递无效数据的注册情况"""
    # 测试无用户名
    response = client.post(
        '/auth/register',
        json={
            "password": "test_password"
        }
    )
    assert response.status_code == 400
    
    # 测试无密码
    response = client.post(
        '/auth/register',
        json={
            "username": "test_user"
        }
    )
    assert response.status_code == 400
    
    # 测试空JSON
    response = client.post(
        '/auth/register',
        json={}
    )
    assert response.status_code == 400

def test_login_with_invalid_data(client):
    """测试传递无效数据的登录情况"""
    # 测试无用户名
    response = client.post(
        '/auth/login',
        json={
            "password": "test_password"
        }
    )
    assert response.status_code == 400
    
    # 测试无密码
    response = client.post(
        '/auth/login',
        json={
            "username": "test_user"
        }
    )
    assert response.status_code == 400
    
    # 测试空JSON
    response = client.post(
        '/auth/login',
        json={}
    )
    assert response.status_code == 400