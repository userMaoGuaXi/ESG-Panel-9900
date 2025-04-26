# ✅ Unit Test: insert_report_history 函数逻辑
import json
import pytest
from unittest.mock import patch, MagicMock
from app.routes.report import insert_report_history


@patch("app.routes.report.get_connection")
def test_insert_report_history_success(mock_get_conn):
    mock_conn = MagicMock()
    mock_cur = MagicMock()
    mock_get_conn.return_value = mock_conn
    mock_conn.cursor.return_value.__enter__.return_value = mock_cur
    mock_cur.fetchone.return_value = (123, MagicMock(isoformat=lambda: "2024-01-01T00:00:00"))

    result = insert_report_history("TestReport", {"k": 1}, {"v": 2}, "notes")
    assert result["id"] == 123
    assert result["generated_at"] == "2024-01-01T00:00:00"

@patch("app.routes.report.get_connection")
def test_insert_report_history_error(mock_get_conn):
    mock_get_conn.side_effect = Exception("DB down")
    result = insert_report_history("FailReport", {}, {})
    assert result is None