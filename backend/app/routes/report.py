import json
from flask import Blueprint, request, jsonify, make_response
import stardog
from app.db_utils import get_connection

# ---------------------------------------------
# Stardog connection configuration
# ---------------------------------------------
conn_details = {
    'endpoint': "https://sd-5073f34b.stardog.cloud:5820",
    'username': "z5493057@ad.unsw.edu.au",
    'password': "fengyun128129"
}

# The Stardog database that stores the ontology‑driven ESG model
database = "ESG-new"

# Blueprint that groups all routes related to report generation
report_bp = Blueprint('report', __name__)


def insert_report_history(report_name, parameters, result_summary=None, notes=None):
    """Insert a record into the **report_history** table.

    Args:
        report_name (str): Logical name of the report action being logged.
        parameters (dict): The full parameter set received from the front‑end.
        result_summary (dict | None): Computed metrics to be persisted for quick
            inspection/debugging.  *Must be JSON‑serialisable.*
        notes (str | None): Free‑form text notes (e.g. caller, version).

    Returns:
        dict | None: ``{"id": <int>, "generated_at": <ISO‑timestamp>}`` on
        success; *None* if the insert failed for any reason.
    """
    conn = None
    try:
        conn = get_connection()
        with conn.cursor() as cur:
            sql = (
                """
                INSERT INTO report_history (report_name, parameters, result_summary, notes)
                VALUES (%s, %s, %s, %s)
                RETURNING id, generated_at;
                """
            )
            cur.execute(sql, (
                report_name,
                json.dumps(parameters),
                json.dumps(result_summary) if result_summary else None,
                notes,
            ))
            record = cur.fetchone()
            conn.commit()
            return {"id": record[0], "generated_at": record[1].isoformat()}
    except Exception as e:
        print("Error inserting report history:", e)
        return None
    finally:
        if conn:
            conn.close()


@report_bp.route("/generateReport", methods=["GET"])
def generateReport():
    """Generate a single composite metric value for the requested model.

    **Front‑end example**::

        GET /report/generateReport?modelUri=esg:TC-SC-110a.1&industry=Semiconductors&metric_year=2022-12-31&company=Soitec%20SA&selected_input=CO2DIRECTSCOPE1&selected_pca=SOXEMISSIONS,CO2INDIRECTSCOPE2

    Computational steps
    -------------------
    1. **InputFrom metrics** – for every element in *selected_input*:
       • Query ``esg:InputFrom`` datasets matching the metric name.
       • Pull raw metric values from *public.combined*.
       • Store the *standardised* values; the average of these contributes to
         ``total_input_sum`` and increments ``count_input``.

    2. **PCAInputFrom metrics** – for every element in *selected_pca*:
       • Query ``esg:PCAInputFrom`` datasets matching the metric name.
       • Join *public.combined* with *public.metric_weights* to obtain metric
         values + PCA weights.
       • Accumulate ``metric_value_standardized * weight`` into
         ``total_pca_sum``; track the running ``weight_sum_pca`` and
         ``count_pca``.

    3. **Unweighted aggregation**::

           total_count = count_input + count_pca
           final_value = (total_input_sum * count_input / total_count) + \
                         (total_pca_sum  * count_pca  / total_count)

    4. **Weight re‑normalisation**::

           overall_weight = (count_input / total_count) + \
                            ((count_pca / total_count) * weight_sum_pca)
           final_adjusted = final_value / overall_weight

    5. Persist a **report_history** entry and return a rich JSON payload that
       echoes all request parameters plus intermediate raw data for debugging.
    """

    # ------------------------------------------------------------------
    # Retrieve comma‑separated lists from the query string
    # ------------------------------------------------------------------
    selected_input_str = request.args.get("selected_input", "")
    selected_pca_str   = request.args.get("selected_pca", "")
    selected_input = [s.strip() for s in selected_input_str.split(",") if s.strip()]
    selected_pca   = [s.strip() for s in selected_pca_str.split(",") if s.strip()]

    # General filters / defaults
    model_uri   = request.args.get("modelUri",   "esg:TC-SC-110a.1")
    industry    = request.args.get("industry",   "Semiconductors")
    metric_year = request.args.get("metric_year", "2022-12-31")
    company     = request.args.get("company",    "Soitec SA")

    # Running totals for aggregation
    total_input_sum = 0.0
    total_pca_sum   = 0.0
    count_input     = 0
    count_pca       = 0
    weight_sum_pca  = 0.0  # cumulative PCA weight

    # Store full raw query results for transparency/debugging
    raw_input_data = {}
    raw_pca_data   = {}

    # --------------------------------------------------------------
    # Phase 1 – process InputFrom metrics
    # --------------------------------------------------------------
    for metric in selected_input:
        sparql_query_input = f"""
        PREFIX esg: <tag:stardog:designer:ESG4:model:>
        SELECT ?dataset
        WHERE {{
          {model_uri} esg:InputFrom ?dataset .
          FILTER(CONTAINS(STR(?dataset), "{metric}"))
        }}
        """
        try:
            with stardog.Connection(database, **conn_details) as s_conn:
                results_input = s_conn.select(sparql_query_input)
        except Exception as e:
            print(f"Stardog query error (InputFrom) for {metric}: {e}")
            results_input = {"results": {"bindings": []}}

        if results_input["results"]["bindings"]:
            metrics_data = []
            try:
                conn_pg = get_connection()
                with conn_pg.cursor() as cur:
                    sql = (
                        """
                        SELECT DISTINCT
                          metric_value_standardized,
                          metric_value,
                          metric_unit
                        FROM public.combined
                        WHERE metric_name  = %s
                          AND industry     = %s
                          AND metric_year  = %s
                          AND company_name = %s
                        """
                    )
                    cur.execute(sql, (metric, industry, metric_year, company))
                    rows = cur.fetchall()
                    for std_val, orig_val, unit in rows:
                        metrics_data.append({
                            "standardized_value": std_val,
                            "metric_value":       orig_val,
                            "metric_unit":        unit,
                        })
            except Exception as e:
                print(f"Database query error (InputFrom) for {metric}: {e}")
            finally:
                if "conn_pg" in locals():
                    conn_pg.close()

            raw_input_data[metric] = metrics_data

            if metrics_data:
                vals = [d["standardized_value"] for d in metrics_data if d["standardized_value"] is not None]
                if vals:
                    total_input_sum += sum(vals) / len(vals)
                    count_input += 1

    # --------------------------------------------------------------
    # Phase 2 – process PCAInputFrom metrics
    # --------------------------------------------------------------
    for metric in selected_pca:
        sparql_query_pca = f"""
        PREFIX esg: <tag:stardog:designer:ESG4:model:>
        SELECT ?dataset
        WHERE {{
          {model_uri} esg:PCAInputFrom ?dataset .
          FILTER(CONTAINS(STR(?dataset), "{metric}"))
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
            metrics_data = []
            try:
                conn_pg = get_connection()
                with conn_pg.cursor() as cur:
                    sql = (
                        """
                        SELECT DISTINCT
                          c.metric_value_standardized,
                          c.metric_value,
                          c.metric_unit,
                          m.weight
                        FROM public.combined c
                        JOIN public.metric_weights m ON c.metric_name = m.metric_name
                        WHERE c.metric_name  = %s
                          AND c.industry     = %s
                          AND c.metric_year  = %s
                          AND c.company_name = %s
                        """
                    )
                    cur.execute(sql, (metric, industry, metric_year, company))
                    rows = cur.fetchall()

                    seen = set()
                    for std_val, orig_val, unit, weight in rows:
                        # Accumulate the weighted contribution for PCA
                        if std_val is not None and weight is not None:
                            pca_metric_value += float(std_val) * float(weight)
                            weight_sum_pca  += float(weight)
                        # Deduplicate identical (value, unit) pairs when returning raw data
                        key = (orig_val, unit)
                        if key not in seen:
                            metrics_data.append({
                                "metric_value":              orig_val,
                                "metric_unit":               unit,
                                "metric_value_standardized": std_val,
                            })
                            seen.add(key)
            except Exception as e:
                print(f"Database query error (PCAInputFrom) for {metric}: {e}")
            finally:
                if "conn_pg" in locals():
                    conn_pg.close()

            raw_pca_data[metric] = metrics_data
            total_pca_sum += pca_metric_value
            count_pca += 1

    # --------------------------------------------------------------
    # Phase 3 – final aggregation & normalisation
    # --------------------------------------------------------------
    total_count = count_input + count_pca
    if total_count > 0:
        final_value = (
            total_input_sum * (count_input / total_count)
            + total_pca_sum * (count_pca / total_count)
        )
        overall_weight = (
            (count_input / total_count)
            + ((count_pca / total_count) * weight_sum_pca)
        )
        final_adjusted = final_value / overall_weight if overall_weight else 0.0
    else:
        final_value = 0.0
        final_adjusted = 0.0

    # --------------------------------------------------------------
    # Determine the parent metric URI for the *ObtainUsing* lookup
    # --------------------------------------------------------------
    metric_uri_for_models = request.args.get("metricUri")
    if not metric_uri_for_models:
        metric_uri_for_models = model_uri.rsplit(".", 1)[0] if "." in model_uri else model_uri

    # Convert the front‑end shorthand model URI into the full namespaced form
    selected_model_uri = model_uri
    namespace = "tag:stardog:designer:ESG4:model:"
    suffix    = selected_model_uri.split(":", 1)[1]
    full_uri  = namespace + suffix

    # --------------------------------------------------------------
    # Fetch *ObtainUsing* models for the parent metric – filtered to the
    # model that was actually selected by the user
    # --------------------------------------------------------------
    sparql_models = f"""
    PREFIX esg: <tag:stardog:designer:ESG4:model:>
    SELECT ?model ?modelLabel
    WHERE {{
      {metric_uri_for_models} esg:ObtainUsing ?model .
      ?model a esg:model_SC3.0 .
      OPTIONAL {{ ?model rdfs:label ?modelLabel }}
    }}
    """
    try:
        with stardog.Connection(database, **conn_details) as s_conn:
            res = s_conn.select(sparql_models)
        models_for_metric = [
            {
                "model_uri":   b["model"]["value"],
                "model_label": b.get("modelLabel", {}).get("value", ""),
            }
            for b in res["results"]["bindings"]
        ]
    except Exception as e:
        print(f"ObtainUsing query failed, metricUri={metric_uri_for_models}: {e}")
        models_for_metric = []

    # Retain only the entry that exactly matches the user‑selected model URI
    models_for_metric = [m for m in models_for_metric if m["model_uri"] == full_uri]

    # --------------------------------------------------------------
    # Persist the generated report to *report_history*
    # --------------------------------------------------------------
    report_parameters = {
        "modelUri":       model_uri,
        "industry":       industry,
        "metric_year":   metric_year,
        "company":        company,
        "selected_input": selected_input,
        "selected_pca":   selected_pca,
    }
    result_summary = {
        "total_input_sum": total_input_sum,
        "total_pca_sum":  total_pca_sum,
        "count_input":    count_input,
        "count_pca":      count_pca,
        "final_value":    final_value,
        "final_adjusted": final_adjusted,
        "raw_input":      raw_input_data,
        "raw_pca":        raw_pca_data,
    }
    report_record = insert_report_history(
        "Report_Generation",
        report_parameters,
        result_summary,
        notes="Generated via generateReport API",
    )

    # Comprehensive JSON response – mirrors all inputs plus detailed outputs
    return (
        jsonify(
            {
                "model_uri":          model_uri,
                "industry":           industry,
                "metric_year":        metric_year,
                "company":            company,
                "selected_input":     selected_input,
                "selected_pca":       selected_pca,
                "total_input_sum":    total_input_sum,
                "total_pca_sum":      total_pca_sum,
                "count_input":        count_input,
                "count_pca":          count_pca,
                "final_value":        final_value,
                "final_adjusted":     final_adjusted,
                "report_history":     report_record,
                "all_parameters":     report_parameters,
                "raw_input":          raw_input_data,
                "raw_pca":            raw_pca_data,
                "models_for_metrics": models_for_metric,  # newly added
            }
        ),
        200,
    )


@report_bp.route("/downloadReports", methods=["GET"])
def download_reports():
    """Return multiple *report_history* records merged into a styled HTML page.

    **Front‑end example**::

        GET /report/downloadReports?ids=1,2,3

    The current implementation renders an HTML document directly (no PDF
    conversion).  A future enhancement could pipe this through a PDF engine if
    required.
    """

    ids_str = request.args.get("ids", "")
    if not ids_str:
        return jsonify({"error": "At least one comma‑separated report_history id is required."}), 400

    id_list = [s.strip() for s in ids_str.split(",") if s.strip()]

    conn = None
    rows = []
    try:
        conn = get_connection()
        with conn.cursor() as cur:
            sql = (
                """
                SELECT id, report_name, parameters, result_summary, generated_at, notes
                FROM report_history
                WHERE id = ANY(%s)
                ORDER BY id;
                """
            )
            int_ids = [int(_id) for _id in id_list]
            cur.execute(sql, (int_ids,))
            rows = cur.fetchall()
            if not rows:
                return jsonify({"error": "No matching records found."}), 404
    except Exception as e:
        return jsonify({"error": "Database error: " + str(e)}), 500
    finally:
        if conn:
            conn.close()

    # Build the HTML body
    records_html = ""
    for row in rows:
        rec = {
            "id":             row[0],
            "report_name":    row[1],
            "parameters":     row[2],
            "result_summary": row[3],
            "generated_at":   row[4],
            "notes":          row[5] or "",
        }

        rec_html = f"""
        <div class="record">
          <div class="record-header">
            <h2>Report: {rec['report_name']}</h2>
            <p>ID: {rec['id']} | <strong>Generated At:</strong> {rec['generated_at']}</p>
          </div>
          <div class="record-body">
            <p><strong>Notes:</strong> {rec['notes']}</p>
            <h3>Parameters</h3>
            <div class="parameters">{rec['parameters']}</div>
            <h3>Result Summary</h3>
            <div class="result-summary">{rec['result_summary']}</div>
          </div>
        </div>
        """
        records_html += rec_html

    html_content = f"""
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Combined Report History</title>
      <style>
        body {{
          font-family: 'Helvetica Neue', Arial, sans-serif;
          margin: 20px;
          color: #2c3e50;
        }}
        h1 {{
          text-align: center;
          margin-bottom: 40px;
        }}
        .record {{
          background: #f9f9f9;
          border: 1px solid #ccc;
          border-radius: 6px;
          padding: 20px;
          margin-bottom: 30px;
        }}
        .record-header h2 {{
          margin-top: 0;
          color: #34495e;
        }}
        .record-body {{
          margin-top: 10px;
        }}
        .parameters, .result-summary {{
          background-color: #fff;
          border: 1px solid #eee;
          padding: 10px;
          margin: 10px 0;
          font-family: Menlo, Consolas, 'Courier New', monospace;
          white-space: pre-wrap;
        }}
      </style>
    </head>
    <body>
      <h1>Combined Report History</h1>
      {records_html}
    </body>
    </html>
    """

    # Inline HTML response – the client can choose to save or convert this if required
    return html_content, 200, {"Content-Type": "text/html"}
