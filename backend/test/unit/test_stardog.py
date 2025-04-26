# ✅ Unit Test (纯函数逻辑、异常路径、非HTTP)
import pytest
from unittest.mock import patch, MagicMock
from app.routes.stardog_routes import match_categories_metrics

# Add these additional tests to increase coverage

# Test for an empty dataset response in getModelsFromMetric
@patch("app.routes.stardog_routes.stardog.Connection")
def test_get_models_from_metric_empty_results(mock_stardog_conn_class, client):
    mock_stardog = MagicMock()
    mock_stardog.select.return_value = {
        "results": {"bindings": []}  # Empty result
    }
    mock_stardog_conn_class.return_value.__enter__.return_value = mock_stardog
    
    res = client.get("/stardog/getModelsFromMetric?metricUri=esg:TC-SC-110a")
    assert res.status_code == 200
    assert res.get_json() == []  # Should return empty list, not error

# Test matching categories and metrics with edge cases
def test_match_categories_metrics_edge_cases():
    # Test with empty inputs
    assert match_categories_metrics([], []) == {}
    
    # Test with categories but no metrics
    categories = [{"categories_uri": "TC-SC-110"}]
    assert match_categories_metrics(categories, []) == {
        "TC-SC-110": {"category": {"categories_uri": "TC-SC-110"}, "metrics": []}
    }
    
    # Test with non-matching metrics (no suffix letter)
    categories = [{"categories_uri": "TC-SC-110"}]
    metrics = [{"metric_uri": "TC-SC-111"}]  # Different number, not a match
    result = match_categories_metrics(categories, metrics)
    assert len(result["TC-SC-110"]["metrics"]) == 0

# Test for the getDatasetsAndValues endpoint
@patch("app.routes.stardog_routes.get_connection")
@patch("app.routes.stardog_routes.stardog.Connection")
def test_get_datasets_and_values_basic(mock_stardog_conn_class, mock_get_conn, client):
    # Mock Stardog connection
    mock_stardog = MagicMock()
    mock_stardog.select.return_value = {
        "results": {"bindings": [{"dataset": {"value": "tag:stardog:designer:ESG4:model:CO2DIRECTSCOPE1"}}]}
    }
    mock_stardog_conn_class.return_value.__enter__.return_value = mock_stardog
    
    # Mock PostgreSQL connection
    mock_pg = MagicMock()
    mock_cur = MagicMock()
    mock_pg.cursor.return_value.__enter__.return_value = mock_cur
    mock_get_conn.return_value = mock_pg
    
    # Mock fetchall result with sample data
    mock_cur.fetchall.return_value = [("CO2DIRECTSCOPE1", 123.45, "tonnes")]
    
    # Make the request
    res = client.get("/stardog/getDatasetsAndValues?modelUri=esg:TC-SC-110a.1&industry=Semiconductors&metric_year=2022-12-31&company=Soitec%20SA")
    
    # Verify response
    assert res.status_code == 200
    data = res.get_json()
    assert len(data["datasets"]) == 1
    assert data["datasets"][0]["dataset_local"] == "CO2DIRECTSCOPE1"
    assert len(data["datasets"][0]["db_records"]) == 1

# Test for the getDatasetsAndValuesPCA endpoint
@patch("app.routes.stardog_routes.get_connection")
@patch("app.routes.stardog_routes.stardog.Connection")
def test_get_datasets_and_values_pca_basic(mock_stardog_conn_class, mock_get_conn, client):
    # Mock Stardog connection
    mock_stardog = MagicMock()
    mock_stardog.select.return_value = {
        "results": {"bindings": [{"dataset": {"value": "tag:stardog:designer:ESG4:model:SOXEMISSIONS"}}]}
    }
    mock_stardog_conn_class.return_value.__enter__.return_value = mock_stardog
    
    # Mock PostgreSQL connection
    mock_pg = MagicMock()
    mock_cur = MagicMock()
    mock_pg.cursor.return_value.__enter__.return_value = mock_cur
    mock_get_conn.return_value = mock_pg
    
    # Mock fetchall result with sample data
    mock_cur.fetchall.return_value = [("SOXEMISSIONS", 67.89, "kg")]
    
    # Make the request
    res = client.get("/stardog/getDatasetsAndValuesPCA?modelUri=esg:TC-SC-110a.1&industry=Semiconductors&metric_year=2022-12-31&company=Soitec%20SA")
    
    # Verify response
    assert res.status_code == 200
    data = res.get_json()
    assert len(data["datasets"]) == 1
    assert data["datasets"][0]["dataset_local"] == "SOXEMISSIONS"
    assert len(data["datasets"][0]["db_records"]) == 1