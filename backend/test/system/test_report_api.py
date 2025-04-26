# ✅ Unit Test: insert_report_history 函数逻辑
import json
import pytest
from unittest.mock import patch, MagicMock
from app.routes.report import insert_report_history


@patch("app.routes.report.get_connection")
@patch("app.routes.report.stardog.Connection")
def test_generate_report_success(mock_stardog_class, mock_get_conn, client):
    # mock stardog select responses
    mock_stardog = MagicMock()
    mock_stardog.select.side_effect = [
        {"results": {"bindings": [{"dataset": {"value": "...input"}}]}},
        {"results": {"bindings": [{"dataset": {"value": "...pca"}}]}},
        {"results": {"bindings": [{"model": {"value": "tag:stardog:designer:ESG4:model:TC-SC-110a.1"}}]}},
    ]
    mock_stardog_class.return_value.__enter__.return_value = mock_stardog

    # mock db response
    mock_pg = MagicMock()
    mock_cur = MagicMock()
    mock_pg.cursor.return_value.__enter__.return_value = mock_cur
    mock_get_conn.return_value = mock_pg
    mock_cur.fetchall.side_effect = [
        [(1.0, 10, "t")],  # input metric
        [(2.0, 20, "x", 0.5)],  # pca metric
    ]
    mock_cur.fetchone.return_value = (123, MagicMock(isoformat=lambda: "2023-01-01T00:00:00"))

    res = client.get("""/report/generateReport?modelUri=esg:TC-SC-110a.1&industry=Semiconductors&metric_year=2022-12-31&company=Soitec SA&selected_input=CO2DIRECTSCOPE1&selected_pca=SOXEMISSIONS""".replace("\n", "").strip())
    assert res.status_code == 200
    data = res.get_json()
    assert "final_adjusted" in data
    assert "report_history" in data
    assert data["report_history"]["id"] == 123

@patch("app.routes.report.get_connection")
@patch("app.routes.report.stardog.Connection")
def test_generate_report_fallback_to_metric_prefix(mock_stardog_class, mock_get_conn, client):
    mock_stardog = MagicMock()
    mock_stardog.select.side_effect = [
        {"results": {"bindings": []}},  # input
        {"results": {"bindings": []}},  # pca
        {"results": {"bindings": []}}   # models
    ]
    mock_stardog_class.return_value.__enter__.return_value = mock_stardog

    mock_pg = MagicMock()
    mock_cur = MagicMock()
    mock_pg.cursor.return_value.__enter__.return_value = mock_cur
    mock_get_conn.return_value = mock_pg
    mock_cur.fetchall.side_effect = [[], []]
    mock_cur.fetchone.return_value = (9, MagicMock(isoformat=lambda: "2023-05-01T00:00:00"))

    # no metricUri param passed
    res = client.get("/report/generateReport?modelUri=esg:TC-SC-110a.1")
    assert res.status_code == 200
    assert res.get_json()["final_adjusted"] == 0.0

@patch("app.routes.report.get_connection")
def test_download_reports_empty(mock_get_conn, client):
    res = client.get("/report/downloadReports")
    assert res.status_code == 400
    assert "error" in res.get_json()

@patch("app.routes.report.get_connection")
def test_download_reports_invalid(mock_get_conn, client):
    mock_pg = MagicMock()
    mock_cur = MagicMock()
    mock_pg.cursor.return_value.__enter__.return_value = mock_cur
    mock_get_conn.return_value = mock_pg
    mock_cur.fetchall.return_value = []

    res = client.get("/report/downloadReports?ids=999")
    assert res.status_code == 404
    assert "error" in res.get_json()
