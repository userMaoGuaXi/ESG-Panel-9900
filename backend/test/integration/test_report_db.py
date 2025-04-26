import json
import pytest
from unittest.mock import patch, MagicMock
from app.routes.report import insert_report_history


@patch("app.routes.report.get_connection")
@patch("app.routes.report.stardog.Connection")
def test_generate_report_empty_inputs(mock_stardog_class, mock_get_conn, client):
    mock_stardog = MagicMock()
    mock_stardog.select.side_effect = [
        {"results": {"bindings": []}},
        {"results": {"bindings": []}},
        {"results": {"bindings": []}}
    ]
    mock_stardog_class.return_value.__enter__.return_value = mock_stardog

    mock_pg = MagicMock()
    mock_cur = MagicMock()
    mock_pg.cursor.return_value.__enter__.return_value = mock_cur
    mock_get_conn.return_value = mock_pg
    mock_cur.fetchall.side_effect = [[], []]
    mock_cur.fetchone.return_value = (1, MagicMock(isoformat=lambda: "2023-01-01T00:00:00"))

    res = client.get("/report/generateReport?modelUri=esg:TC-SC-110a.1&industry=Semiconductors&metric_year=2022-12-31&company=Soitec SA")
    assert res.status_code == 200
    assert res.get_json()["final_adjusted"] == 0.0