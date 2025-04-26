# app/routes/stardog_routes.py
"""Flask blueprint exposing helper endpoints that bridge Stardog ontologies
and the relational warehouse.  *All executable statements are unchanged –
only comments/docstrings were translated to professional English.*"""

from flask import Blueprint, request, jsonify
import stardog
from app.db_utils import get_connection

# ---------------------------------------------------------------------------
# Stardog connection details
# ---------------------------------------------------------------------------
conn_details = {
    "endpoint": "https://sd-5073f34b.stardog.cloud:5820",
    "username": "z5493057@ad.unsw.edu.au",
    "password": "fengyun128129",
}

database = "ESG-new"

stardog_bp = Blueprint("stardog", __name__)


@stardog_bp.route("/getAllCategories", methods=["GET"])
def get_all_categories():
    """Return all Category URIs and human‑readable labels for the requested
    *industry*.

    **Example**::

        GET /stardog/getAllCategories?industry=Semiconductors
    """
    # Industry is sent from the front‑end; default to *Semiconductors*
    industry = request.args.get("industry", "Semiconductors")

    # Derive a filter clause based on the industry’s URI prefix
    if industry == "Semiconductors":
        filter_clause = 'FILTER(contains(str(?category), "TC-SC-"))'
    elif industry == "Biotechnology & Pharmaceuticals":
        filter_clause = 'FILTER(contains(str(?category), "HC-BP-"))'
    elif industry == "Internet Media & Services":
        filter_clause = 'FILTER(contains(str(?category), "TC-IM-"))'
    elif industry == "Drug Retailers":
        filter_clause = 'FILTER(contains(str(?category), "HC-DR-"))'
    else:
        filter_clause = ""

    # Issue the SPARQL query
    query = f"""
    PREFIX esg: <tag:stardog:designer:ESG4:model:>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    SELECT ?category ?label
    WHERE {{
      ?category a esg:category3.0 .
      OPTIONAL {{ ?category rdfs:label ?label }}
      {filter_clause}
    }}
    """
    with stardog.Connection(database, **conn_details) as conn:
        results = conn.select(query)

    categories = [
        {
            "categories_uri": b["category"]["value"],
            "categories_label": b.get("label", {}).get("value", ""),
        }
        for b in results["results"]["bindings"]
    ]

    return jsonify(categories)


@stardog_bp.route("/getCategoryDescriptions", methods=["GET"])
def get_category_descriptions():
    """Fetch category names and descriptions from *public.category* (PostgreSQL).

    **Example**::

        GET /stardog/getCategoryDescriptions
    """
    try:
        conn_pg = get_connection()
        with conn_pg.cursor() as cur:
            sql = "SELECT category_name, category_description FROM public.category ORDER BY category_name;"
            cur.execute(sql)
            rows = cur.fetchall()
            categories = [
                {"category_name": row[0], "description": row[1]} for row in rows
            ]
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if "conn_pg" in locals():
            conn_pg.close()

    return jsonify(categories), 200


@stardog_bp.route("/getAllMetrics", methods=["GET"])
def get_all_metrics():
    """Return all metric URIs + labels for a given *industry* (or all if omitted).

    **Example**::

        GET /getAllMetrics?industry=Semiconductors
    """

    industry = request.args.get("industry", "Semiconductors")

    if industry == "Semiconductors":
        filter_clause = 'FILTER(contains(str(?metric), "TC-SC-"))'
    elif industry == "Biotechnology & Pharmaceuticals":
        filter_clause = 'FILTER(contains(str(?metric), "HC-BP-"))'
    elif industry == "Internet Media & Services":
        filter_clause = 'FILTER(contains(str(?metric), "TC-IM-"))'
    elif industry == "Drug Retailers":
        filter_clause = 'FILTER(contains(str(?metric), "HC-DR-"))'
    else:
        filter_clause = ""

    query = f"""
    PREFIX esg: <tag:stardog:designer:ESG4:model:>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    SELECT ?metric ?label
    WHERE {{
      ?metric a esg:metric_SC3.0 .
      OPTIONAL {{ ?metric rdfs:label ?label }}
      {filter_clause}
    }}
    """

    with stardog.Connection(database, **conn_details) as conn:
        results = conn.select(query)

    metrics = [
        {
            "metric_uri": b["metric"]["value"],
            "metric_label": b.get("label", {}).get("value", ""),
        }
        for b in results["results"]["bindings"]
    ]

    return jsonify(metrics)


@stardog_bp.route("/getModelsFromMetric", methods=["GET"])
def get_models_from_metric():
    """Return all models obtained via *ObtainUsing* for a specific metric.

    **Example**::

        GET /stardog/getModelsFromMetric?metricUri=esg:TC-SC-110a
    """
    metric_uri = request.args.get("metricUri")
    if not metric_uri:
        return jsonify({"error": "missing metricUri"}), 400

    query = f"""
    PREFIX esg: <tag:stardog:designer:ESG4:model:>
    SELECT ?model ?modelLabel
    WHERE {{
      {metric_uri} esg:ObtainUsing ?model .
      ?model a esg:model_SC3.0 .
      OPTIONAL {{ ?model rdfs:label ?modelLabel }}
    }}
    """
    with stardog.Connection(database, **conn_details) as conn:
        results = conn.select(query)

    models = [
        {
            "model_uri": b["model"]["value"],
            "model_label": b.get("modelLabel", {}).get("value", ""),
        }
        for b in results["results"]["bindings"]
    ]
    return jsonify(models)


@stardog_bp.route("/getDatasetsAndValues", methods=["GET"])
def get_datasets_and_values():
    """Resolve *InputFrom* datasets for a model and enrich with DB values.

    Steps
    -----
    1. Fetch all datasets via ``esg:InputFrom``
    2. Extract the local name (e.g. *CO2DIRECTSCOPE1*)
    3. Query *public.combined* with dynamic filters (*industry*, *metric_year*,
       *company*) to retrieve metric values.
    """

    model_uri = request.args.get("modelUri", "esg:TC-SC-110a.1")
    industry = request.args.get("industry", "Semiconductors")
    metric_year = request.args.get("metric_year", "2022-12-31")
    company = request.args.get("company", "Soitec SA")

    sparql_query = f"""
    PREFIX esg: <tag:stardog:designer:ESG4:model:>
    SELECT ?dataset
    WHERE {{
      {model_uri} esg:InputFrom ?dataset .
    }}
    """
    with stardog.Connection(database, **conn_details) as s_conn:
        results = s_conn.select(sparql_query)

    dataset_bindings = results["results"]["bindings"]
    if not dataset_bindings:
        return jsonify({"message": "No Dataset found."}), 404

    combined_list = []
    for b in dataset_bindings:
        dataset_uri = b["dataset"]["value"]
        local_name = dataset_uri.split(":")[-1]

        metrics_data = []
        try:
            conn_pg = get_connection()
            with conn_pg.cursor() as cur:
                sql = (
                    """
                    SELECT metric_name, metric_value, metric_unit
                    FROM public.combined
                    WHERE metric_name = %s
                      AND industry = %s
                      AND metric_year = %s
                      AND company_name = %s
                    """
                )
                cur.execute(sql, (local_name, industry, metric_year, company))
                rows = cur.fetchall()
                for row in rows:
                    metrics_data.append(
                        {
                            "metric_name": row[0],
                            "metric_value": row[1],
                            "metric_unit": row[2],
                        }
                    )
        except Exception:
            metrics_data = []
        finally:
            if "conn_pg" in locals():
                conn_pg.close()

        combined_list.append(
            {
                "dataset_uri": dataset_uri,
                "dataset_local": local_name,
                "db_records": metrics_data,
            }
        )

    return (
        jsonify(
            {
                "model_uri": model_uri,
                "industry": industry,
                "metric_year": metric_year,
                "company": company,
                "datasets": combined_list,
            }
        ),
        200,
    )


@stardog_bp.route("/getDatasetsAndValuesPCA", methods=["GET"])
def get_datasets_and_values_pca():
    """Same as :pyfunc:`get_datasets_and_values` but follows *PCAInputFrom*."""

    model_uri = request.args.get("modelUri", "esg:TC-SC-110a.1")
    industry = request.args.get("industry", "Semiconductors")
    metric_year = request.args.get("metric_year", "2022-12-31")
    company = request.args.get("company", "Soitec SA")

    sparql_query = f"""
    PREFIX esg: <tag:stardog:designer:ESG4:model:>
    SELECT ?dataset
    WHERE {{
      {model_uri} esg:PCAInputFrom ?dataset .
    }}
    """
    with stardog.Connection(database, **conn_details) as s_conn:
        results = s_conn.select(sparql_query)

    dataset_bindings = results["results"]["bindings"]
    if not dataset_bindings:
        return jsonify({"message": "No Dataset found."}), 404

    combined_list = []
    for b in dataset_bindings:
        dataset_uri = b["dataset"]["value"]
        local_name = dataset_uri.split(":")[-1]

        metrics_data = []
        try:
            conn_pg = get_connection()
            with conn_pg.cursor() as cur:
                sql = (
                    """
                    SELECT metric_name, metric_value, metric_unit
                    FROM public.combined
                    WHERE metric_name = %s
                      AND industry = %s
                      AND metric_year = %s
                      AND company_name = %s
                    """
                )
                cur.execute(sql, (local_name, industry, metric_year, company))
                rows = cur.fetchall()
                for row in rows:
                    metrics_data.append(
                        {
                            "metric_name": row[0],
                            "metric_value": row[1],
                            "metric_unit": row[2],
                        }
                    )
        except Exception:
            metrics_data = []
        finally:
            if "conn_pg" in locals():
                conn_pg.close()

        combined_list.append(
            {
                "dataset_uri": dataset_uri,
                "dataset_local": local_name,
                "db_records": metrics_data,
            }
        )

    return (
        jsonify(
            {
                "model_uri": model_uri,
                "industry": industry,
                "metric_year": metric_year,
                "company": company,
                "datasets": combined_list,
            }
        ),
        200,
    )


@stardog_bp.route("/calculateSum", methods=["GET"])
def calculate_sum():
    """Compute a composite score using both *InputFrom* and *PCAInputFrom* metrics.

    Weighting scheme – high‑level overview
    --------------------------------------
    * The average of each selected *InputFrom* metric contributes equally.
    * Each *PCAInputFrom* metric contributes ``standardised_value × weight``.
    * The contributions are re‑scaled so that the sum of weights equals 1, then
      the final score is re‑normalised (``final_adjusted``).
    """

    selected_input_str = request.args.get("selected_input", "")
    selected_pca_str = request.args.get("selected_pca", "")
    selected_input = [s.strip() for s in selected_input_str.split(",") if s.strip()]
    selected_pca = [s.strip() for s in selected_pca_str.split(",") if s.strip()]

    model_uri = request.args.get("modelUri", "esg:TC-SC-110a.1")
    industry = request.args.get("industry", "Semiconductors")
    metric_year = request.args.get("metric_year", "2022-12-31")
    company = request.args.get("company", "Soitec SA")

    total_input_sum = 0.0
    total_pca_sum = 0.0
    count_input = 0
    count_pca = 0
    weight_sum = 0.0

    # ------------------------------------------------------------------
    # Aggregate *InputFrom*
    # ------------------------------------------------------------------
    for metric in selected_input:
        sparql_query_input = f"""
        PREFIX esg: <tag:stardog:designer:ESG4:model:>
        SELECT ?dataset
        WHERE {{
          {model_uri} esg:InputFrom ?dataset .
          FILTER(CONTAINS(STR(?dataset), \"{metric}\"))
        }}
        """
        try:
            with stardog.Connection(database, **conn_details) as s_conn:
                results_input = s_conn.select(sparql_query_input)
        except Exception as e:
            print(f"Stardog query error (InputFrom) for {metric}: {e}")
            results_input = {"results": {"bindings": []}}

        if results_input["results"]["bindings"]:
            values = []
            try:
                conn_pg = get_connection()
                with conn_pg.cursor() as cur:
                    sql_input = (
                        """
                        SELECT metric_value_standardized
                        FROM public.combined
                        WHERE metric_name = %s
                          AND industry = %s
                          AND metric_year = %s
                          AND company_name = %s
                        """
                    )
                    cur.execute(sql_input, (metric, industry, metric_year, company))
                    rows = cur.fetchall()
                    values.extend(float(row[0]) for row in rows if row[0] is not None)
            except Exception as e:
                print(f"Database query error (InputFrom) for {metric}: {e}")
            finally:
                if "conn_pg" in locals():
                    conn_pg.close()

            if values:
                total_input_sum += sum(values) / len(values)
                count_input += 1

    # ------------------------------------------------------------------
    # Aggregate *PCAInputFrom*
    # ------------------------------------------------------------------
    for metric in selected_pca:
        sparql_query_pca = f"""
        PREFIX esg: <tag:stardog:designer:ESG4:model:>
        SELECT ?dataset
        WHERE {{
          {model_uri} esg:PCAInputFrom ?dataset .
          FILTER(CONTAINS(STR(?dataset), \"{metric}\"))
        }}
        """
        try:
            with stardog.Connection(database, **conn_details) as s_conn:
                results_pca = s_conn.select(sparql_query_pca)
        except Exception as e:
            print(f"Stardog query error (PCAInputFrom) for {metric}: {e}")
            results_pca = {"results": {"bindings": []}}

        if results_pca["results"]["bindings"]:
            pca_metric_value = 0.0
            try:
                conn_pg = get_connection()
                with conn_pg.cursor() as cur:
                    sql_pca = (
                        """
                        SELECT c.metric_value_standardized, m.weight
                        FROM public.combined c
                        JOIN public.metric_weights m ON c.metric_name = m.metric_name
                        AND c.industry = m.industry
                        WHERE c.metric_name = %s
                          AND c.industry = %s
                          AND c.metric_year = %s
                          AND c.company_name = %s
                        """
                    )
                    cur.execute(sql_pca, (metric, industry, metric_year, company))
                    rows = cur.fetchall()
                    for row in rows:
                        if row[0] is not None and row[1] is not None:
                            pca_metric_value += float(row[0]) * float(row[1])
                            weight_sum += float(row[1])
            except Exception as e:
                print(f"Database query error (PCAInputFrom) for {metric}: {e}")
            finally:
                if "conn_pg" in locals():
                    conn_pg.close()

            total_pca_sum += pca_metric_value
            count_pca += 1

    # ------------------------------------------------------------------
    # Final computation + re‑normalisation
    # ------------------------------------------------------------------
    total_count = count_input + count_pca
    weight_sum = count_input / total_count + weight_sum * count_pca / total_count if total_count else 0.0

    if total_count:
        final_value = (
            total_input_sum * (count_input / total_count)
            + total_pca_sum * (count_pca / total_count)
        )
        final_adjusted = final_value / weight_sum if weight_sum else 0.0
    else:
        final_value = 0.0
        final_adjusted = 0.0

    return (
        jsonify(
            {
                "model_uri": model_uri,
                "industry": industry,
                "metric_year": metric_year,
                "company": company,
                "selected_input": selected_input,
                "selected_pca": selected_pca,
                "total_input_sum": total_input_sum,
                "total_pca_sum": total_pca_sum,
                "count_input": count_input,
                "count_pca": count_pca,
                "final_value": final_value,
                "final_adjusted": final_adjusted,
            }
        ),
        200,
    )


def match_categories_metrics(categories, metrics):
    """Associate metrics with their parent category via simple URI prefix match.

    The heuristic assumes that a metric URI ending with a trailing letter shares
    the same stem as its category URI.  A hash map keyed by *category_uri* is
    populated to enable O(1) look‑ups while iterating over metrics.
    """

    mapping = {cat["categories_uri"]: {"category": cat, "metrics": []} for cat in categories}

    for metric in metrics:
        metric_uri = metric["metric_uri"]
        if metric_uri and metric_uri[-1].isalpha():
            possible_cat_uri = metric_uri[:-1]
            if possible_cat_uri in mapping:
                mapping[possible_cat_uri]["metrics"].append(metric)

    return mapping
