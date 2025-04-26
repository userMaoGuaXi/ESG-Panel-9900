# ✅ System Test (测试 HTTP 接口行为 + 全路径)
from unittest.mock import patch, MagicMock

@patch("app.routes.stardog_routes.get_connection")
@patch("app.routes.stardog_routes.stardog.Connection")
def test_get_all_categories(mock_stardog_conn_class, mock_get_conn, client):
    mock_stardog = MagicMock()
    mock_stardog.select.return_value = {
        "results": {"bindings": [{"category": {"value": "cat1"}, "label": {"value": "Label1"}}]}
    }
    mock_stardog_conn_class.return_value.__enter__.return_value = mock_stardog
    res = client.get("/stardog/getAllCategories?industry=Semiconductors")
    assert res.status_code == 200
    data = res.get_json()
    assert data[0]["categories_uri"] == "cat1"

@patch("app.routes.stardog_routes.get_connection")
@patch("app.routes.stardog_routes.stardog.Connection")
def test_get_models_from_metric(mock_stardog_conn_class, mock_get_conn, client):
    mock_stardog = MagicMock()
    mock_stardog.select.return_value = {
        "results": {"bindings": [{"model": {"value": "mod1"}, "modelLabel": {"value": "MLabel"}}]}
    }
    mock_stardog_conn_class.return_value.__enter__.return_value = mock_stardog
    res = client.get("/stardog/getModelsFromMetric?metricUri=esg:TC-SC-110a")
    assert res.status_code == 200
    assert res.get_json()[0]["model_uri"] == "mod1"

def test_get_models_from_metric_missing_param(client):
    res = client.get("/stardog/getModelsFromMetric")
    assert res.status_code == 400
    assert "error" in res.get_json()

@patch("app.routes.stardog_routes.get_connection")
@patch("app.routes.stardog_routes.stardog.Connection")
def test_get_all_metrics_variants(mock_stardog_conn_class, mock_get_conn, client):
    mock_stardog = MagicMock()
    mock_stardog.select.return_value = {
        "results": {"bindings": [{"metric": {"value": "metric1"}, "label": {"value": "LabelM"}}]}
    }
    mock_stardog_conn_class.return_value.__enter__.return_value = mock_stardog

    for industry in ["Semiconductors", "Biotechnology & Pharmaceuticals", "Internet Media & Services", "Drug Retailers"]:
        res = client.get(f"/stardog/getAllMetrics?industry={industry}")
        assert res.status_code == 200
        assert "metric_uri" in res.get_json()[0]
