// Updated MetricCard.jsx with corrected No Records logic
/**
 * MetricCard Component
 * 
 * This component displays and manages ESG (Environmental, Social, and Governance) metrics
 * for a company in a specified industry and reporting year. It allows users to:
 * - Select models for metric calculation
 * - Load and select framework and PCA data
 * - Calculate metric scores
 * - Add/remove metrics from reports
 */
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Box,
  Checkbox,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Snackbar,
  Alert
} from "@mui/material";

/**
 * MatchedMetricsSelect Component
 * 
 * Renders a dropdown list of matched metrics.
 * 
 * @param {Object} props - Component props
 * @param {Array} props.matchedMetrics - Array of matched metrics
 * @param {string} props.selectedValue - Currently selected metric URI
 * @param {Function} props.onChange - Handler for selection change
 */
function MatchedMetricsSelect({ matchedMetrics, selectedValue, onChange }) {
  return (
    <FormControl fullWidth size="small" sx={{ mt: 1, mb: 2 }}>
      <InputLabel sx={{ fontFamily: "inherit", fontWeight: 400 }}>Matched Metrics</InputLabel>
      <Select
        value={selectedValue}
        label="Matched Metrics"
        onChange={onChange}
        sx={{ fontFamily: "inherit", fontWeight: 400 }}
      >
        {matchedMetrics && matchedMetrics.length > 0 ? (
          matchedMetrics.map((m) => (
            <MenuItem
              key={m.metric_uri}
              value={m.metric_uri}
              sx={{ fontFamily: "inherit", fontWeight: 400 }}
            >
              {m.metric_label || "(No Label)"}
            </MenuItem>
          ))
        ) : (
          <MenuItem disabled sx={{ fontFamily: "inherit", fontWeight: 400 }}>
            No matched metrics
          </MenuItem>
        )}
      </Select>
    </FormControl>
  );
}

/**
 * ModelSelect Component
 * 
 * Renders a dropdown list of models applicable to the selected metric.
 * 
 * @param {Object} props - Component props
 * @param {string} props.modelUri - Currently selected model URI
 * @param {Function} props.onSelectModel - Handler for model selection
 * @param {Function} props.onOpenModels - Handler for dropdown open event (fetches models)
 * @param {Array} props.modelsList - List of available models
 * @param {boolean} props.loadingModels - Indicates if models are being loaded
 * @param {string|null} props.errorModels - Error message if models failed to load
 */
function ModelSelect({ modelUri, onSelectModel, onOpenModels, modelsList, loadingModels, errorModels }) {
  return (
    <FormControl fullWidth size="small" disabled={loadingModels && !errorModels}>
      <InputLabel sx={{ fontFamily: "inherit", fontWeight: 400 }}>Models</InputLabel>
      <Select
        label="Models"
        onOpen={onOpenModels}
        value={modelUri}
        onChange={onSelectModel}
        sx={{ fontFamily: "inherit", fontWeight: 400 }}
      >
        {loadingModels && (
          <MenuItem disabled sx={{ fontFamily: "inherit", fontWeight: 400 }}>
            Loading models...
          </MenuItem>
        )}
        {errorModels && (
          <MenuItem disabled sx={{ fontFamily: "inherit", fontWeight: 400 }}>
            Error: {errorModels}
          </MenuItem>
        )}
        {modelsList.map((m) => (
          <MenuItem
            key={m.model_uri}
            value={m.model_uri}
            sx={{ fontFamily: "inherit", fontWeight: 400 }}
          >
            {m.model_label || "(No Label)"}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

/**
 * DataBox Component
 * 
 * Displays a table of dataset records that can be selected by the user.
 * Handles display of loading states, errors, and "No records" conditions.
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - Title of the data box (e.g., "Framework Data" or "PCA Data")
 * @param {boolean} props.loading - Indicates if data is being loaded
 * @param {string|null} props.error - Error message if data failed to load
 * @param {Object|null} props.datasetResult - Dataset results containing records
 * @param {Array} props.selectedRecords - Currently selected records
 * @param {Function} props.onToggleRecord - Handler for record selection/deselection
 * @param {Function} props.onLoadData - Handler for load button click
 */
function DataBox({ title, loading, error, datasetResult, selectedRecords, onToggleRecord, onLoadData }) {
  // Check if any dataset contains records
  const hasAnyRecords = datasetResult && datasetResult.datasets.some(ds => ds.db_records.length > 0);
  // Check if all datasets are empty
  const allEmpty = datasetResult && datasetResult.datasets.length > 0 && datasetResult.datasets.every(ds => ds.db_records.length === 0);

  return (
    <Box sx={{ border: "1px solid #ccc", borderRadius: 1, p: 1, mb: 2, backgroundColor: "#fafafa", fontFamily: "inherit" }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
        <Button
          variant="outlined"
          size="small"
          onClick={onLoadData}
          sx={{
            textTransform: "none",
            fontFamily: "inherit",
            fontWeight: 500,
            borderColor: "#000",
            color: "#000",
            borderRadius: 1,
            boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.05)",
            "&:hover": {
              backgroundColor: "#f5f5f5",
              borderColor: "#000"
            }
          }}
        >
          Load {title}
        </Button>
      </Box>
      {loading && <Typography sx={{ fontFamily: "inherit" }}>Loading {title.toLowerCase()}...</Typography>}
      {error && (
        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, fontFamily: "inherit", display: "block" }}>
          No records
        </Typography>
      )}
      {datasetResult && (
        <TableContainer sx={{ backgroundColor: "#fafafa", mt: 1 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox" />
                <TableCell sx={{ fontWeight: 400, color: "#6b7280", fontFamily: "inherit" }}>
                  Dataset
                </TableCell>
                <TableCell sx={{ fontWeight: 400, color: "#6b7280", fontFamily: "inherit" }}>
                  Value
                </TableCell>
                <TableCell sx={{ fontWeight: 400, color: "#6b7280", fontFamily: "inherit" }}>
                  Unit
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {hasAnyRecords ? (
                // If there are records, only show datasets with records
                datasetResult.datasets
                  .filter(ds => ds.db_records.length > 0)
                  .map((ds, dsIdx) => (
                    ds.db_records.map((r, idx2) => {
                      const recordKey = `${ds.dataset_local}-${idx2}`;
                      const isChecked = selectedRecords.some((item) => item.key === recordKey);
                      return (
                        <TableRow key={recordKey} hover>
                          <TableCell padding="checkbox">
                            <Checkbox
                              size="small"
                              checked={isChecked}
                              onChange={() => onToggleRecord(ds.dataset_local, idx2, r.metric_value)}
                              sx={{
                                color: "#acacac",
                                "&.Mui-checked": {
                                  color: "#1D4ED8",
                                  "& .MuiSvgIcon-root": {
                                    boxShadow: "0 0 4px #1D4ED8"
                                  }
                                }
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ fontFamily: "inherit" }}>{ds.dataset_local}</TableCell>
                          <TableCell>
                            <Typography variant="caption" sx={{ fontFamily: "inherit" }}>{r.metric_value}</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption" sx={{ fontFamily: "inherit", color: "#6b7280" }}>{r.metric_unit || '-'}</Typography>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ))
              ) : allEmpty ? (
                // If all datasets are empty, show a "No records" row
                <TableRow>
                  <TableCell />
                  <TableCell colSpan={3}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontFamily: "inherit" }}>
                      No records
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}

/**
 * MetricCard Component
 * 
 * Main component that provides a UI for working with individual ESG metrics.
 * 
 * @param {Object} props - Component props
 * @param {Object} props.metric - Metric information (URI, label, categories)
 * @param {Array} props.matchedMetrics - Array of metrics that match the current metric
 * @param {string} props.industry - Industry context for the metric
 * @param {string} props.reportingYear - Year for which to fetch and calculate metrics
 * @param {string} props.company - Company name for which to fetch metrics
 * @param {string} props.uniqueId - Unique identifier for the metric (optional)
 */
export default function MetricCard({
  metric,
  matchedMetrics = [],
  industry,
  reportingYear,
  company,
  uniqueId
}) {
  const { metric_label, metric_uri, categories_label, categories_uri } = metric;
  const uniqueKey = uniqueId || metric_uri;
  const currentUser = localStorage.getItem("currentUser") || "guest";

  const [selectedMatchedMetric, setSelectedMatchedMetric] = useState("");
  const activeMetricUri = selectedMatchedMetric || metric_uri;

  const [modelUri, setModelUri] = useState("");
  const [modelsList, setModelsList] = useState([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [errorModels, setErrorModels] = useState(null);

  const [inputDatasetResult, setInputDatasetResult] = useState(null);
  const [loadingInputData, setLoadingInputData] = useState(false);
  const [errorInputData, setErrorInputData] = useState(null);
  const [selectedInputRecords, setSelectedInputRecords] = useState([]);

  const [pcaDatasetResult, setPcaDatasetResult] = useState(null);
  const [loadingPcaData, setLoadingPcaData] = useState(false);
  const [errorPcaData, setErrorPcaData] = useState(null);
  const [selectedPcaRecords, setSelectedPcaRecords] = useState([]);

  const [calcValue, setCalcValue] = useState(null);
  const [loadingCalc, setLoadingCalc] = useState(false);
  const [errorCalc, setErrorCalc] = useState(null);

  const [addedToReport, setAddedToReport] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  /**
   * Effect hook to check if the current metric is already in the report collection
   * Updates the addedToReport state accordingly
   */
  useEffect(() => {
    // Check if this metric is already in report collection
    const reportMetrics = JSON.parse(localStorage.getItem(`report_metrics_${currentUser}`) || "[]");
    const isAdded = reportMetrics.some(item => item.uniqueKey === uniqueKey);
    setAddedToReport(isAdded);
  }, [uniqueKey, currentUser]);

  /**
   * Handler for matched metrics dropdown change
   * @param {Object} e - Event object
   */
  const handleMatchedMetricsChange = (e) => setSelectedMatchedMetric(e.target.value);

  /**
   * Handler for model selection
   * Resets all data states when model changes
   * @param {Object} e - Event object
   */
  const handleSelectModel = (e) => {
    setModelUri(e.target.value);
    setInputDatasetResult(null);
    setErrorInputData(null);
    setSelectedInputRecords([]);
    setPcaDatasetResult(null);
    setErrorPcaData(null);
    setSelectedPcaRecords([]);
    setCalcValue(null);
  };

  /**
   * Handler for models dropdown open event
   * Fetches models list if not already loaded
   * Stores model name mapping in localStorage for future reference
   */
  const handleOpenModels = () => {
    if (modelsList.length === 0) {
      setLoadingModels(true);
      const match = activeMetricUri.match(/ESG4:model:(.+)/);
      const shortUri = match ? match[1] : activeMetricUri;
      axios
        .get(`http://127.0.0.1:5001/stardog/getModelsFromMetric?metricUri=esg:${shortUri}`)
        .then((res) => {
          if (res.status !== 200) throw new Error(`Status code: ${res.status}`);
          setModelsList(res.data);
          // Store model URI to name mapping
          const modelMapping = {};
          res.data.forEach(model => {
            modelMapping[model.model_uri] = model.model_label;
          });

          // Get existing mapping
          const existingMapping = JSON.parse(localStorage.getItem('model_name_mapping') || '{}');

          // Merge and store
          localStorage.setItem('model_name_mapping', JSON.stringify({
            ...existingMapping,
            ...modelMapping
          }));
        })
        .catch(() => setErrorModels("Failed to load model list"))
        .finally(() => setLoadingModels(false));
    }
  };

  /**
   * Helper function to extract short URI from full URI
   * @param {string} uri - The full URI
   * @returns {string} - The short URI
   */
  const getShortUri = (uri) => {
    const match = uri.match(/ESG4:model:(.+)/);
    return match ? match[1] : uri;
  };

  /**
   * Handler for selecting/deselecting an input record
   * @param {string} datasetName - Name of the dataset
   * @param {number} idx - Index of the record
   * @param {number} value - Value of the record
   */
  const handleSelectInputRecord = (datasetName, idx, value) => {
    const key = `${datasetName}-${idx}`;
    setSelectedInputRecords((prev) => {
      const exists = prev.find((item) => item.key === key);
      return exists ? prev.filter((i) => i.key !== key) : [...prev, { key, datasetName, value }];
    });
  };

  /**
   * Handler for selecting/deselecting a PCA record
   * @param {string} datasetName - Name of the dataset
   * @param {number} idx - Index of the record
   * @param {number} value - Value of the record
   */
  const handleSelectPcaRecord = (datasetName, idx, value) => {
    const key = `${datasetName}-${idx}`;
    setSelectedPcaRecords((prev) => {
      const exists = prev.find((item) => item.key === key);
      return exists ? prev.filter((i) => i.key !== key) : [...prev, { key, datasetName, value }];
    });
  };

  /**
   * Handler for fetching input data
   * Requires a model to be selected first
   */
  const handleFetchInputData = () => {
    if (!modelUri) return alert("Please select a model first!");
    setLoadingInputData(true);
    axios
      .get(
        `http://127.0.0.1:5001/stardog/getDatasetsAndValues?modelUri=esg:${getShortUri(
          modelUri
        )}&industry=${industry}&metric_year=${reportingYear}&company=${encodeURIComponent(company)}`
      )
      .then((res) => {
        if (res.status !== 200) throw new Error();
        setInputDatasetResult(res.data);
        setSelectedInputRecords([]);
      })
      .catch(() => setErrorInputData("no input data"))
      .finally(() => setLoadingInputData(false));
  };

  /**
   * Handler for fetching PCA data
   * Requires a model to be selected first
   */
  const handleFetchPcaData = () => {
    if (!modelUri) return alert("Please select a model first!");
    setLoadingPcaData(true);
    axios
      .get(
        `http://127.0.0.1:5001/stardog/getDatasetsAndValuesPCA?modelUri=esg:${getShortUri(
          modelUri
        )}&industry=${industry}&metric_year=${reportingYear}&company=${encodeURIComponent(company)}`
      )
      .then((res) => {
        if (res.status !== 200) throw new Error();
        setPcaDatasetResult(res.data);
        setSelectedPcaRecords([]);
      })
      .catch(() => setErrorPcaData("no pca data"))
      .finally(() => setLoadingPcaData(false));
  };

  /**
   * Handler for calculating the metric score based on selected input and PCA records
   * Requires a model to be selected and at least one record to be selected
   */
  const handleCalculateSum = () => {
    if (!modelUri) return alert("Please select a model first!");
    const inputs = selectedInputRecords.map((r) => r.datasetName).join(",");
    const pcas = selectedPcaRecords.map((r) => r.datasetName).join(",");
    if (!inputs && !pcas) return alert("Please select at least one record to calculate!");
    setLoadingCalc(true);
    setErrorCalc(null);
    setCalcValue(null);
    axios
      .get(
        `http://127.0.0.1:5001/stardog/calculateSum?modelUri=esg:${getShortUri(
          modelUri
        )}&industry=${industry}&metric_year=${reportingYear}&company=${encodeURIComponent(company)}&selected_input=${encodeURIComponent(
          inputs
        )}&selected_pca=${encodeURIComponent(pcas)}`
      )
      .then((res) => {
        if (res.status !== 200) throw new Error();
        setCalcValue(res.data.final_adjusted);
      })
      .catch(() => setErrorCalc("Failed to calculate score"))
      .finally(() => setLoadingCalc(false));
  };

  /**
   * Handler for adding the current metric to the report
   * Includes both metric_label and categories_label properties
   * Updates local storage and shows confirmation message
   */
  const handleAddToReport = () => {
    if (!modelUri) return alert("Please select a model first!");
    const inputs = selectedInputRecords.map((r) => r.datasetName).join(",");
    const pcas = selectedPcaRecords.map((r) => r.datasetName).join(",");
    if (!inputs && !pcas) return alert("Please select at least one record to add to report!");

    // Create metric object with BOTH metric_label AND categories_label
    const metricToAdd = {
      uniqueKey,
      metric_label: metric_label || "Unnamed Metric",
      categories_label: categories_label || metric_label || "Unnamed Category", // Add the categories_label
      categories_uri: categories_uri || "",  // Add categories_uri for reference
      modelUri: `esg:${getShortUri(modelUri)}`,
      industry,
      metric_year: reportingYear,
      company,
      selected_input: inputs,
      selected_pca: pcas
    };

    // Get existing metrics from localStorage
    const existingMetrics = JSON.parse(localStorage.getItem(`report_metrics_${currentUser}`) || "[]");

    // Check if this metric is already in the list
    const metricExists = existingMetrics.some(m => m.uniqueKey === uniqueKey);

    if (metricExists) {
      // Update the existing metric
      const updatedMetrics = existingMetrics.map(m =>
        m.uniqueKey === uniqueKey ? metricToAdd : m
      );
      localStorage.setItem(`report_metrics_${currentUser}`, JSON.stringify(updatedMetrics));
      setSnackbarMessage("Metric updated in report");
    } else {
      // Add new metric
      const newMetrics = [...existingMetrics, metricToAdd];
      localStorage.setItem(`report_metrics_${currentUser}`, JSON.stringify(newMetrics));
      setSnackbarMessage("Metric added to report");
    }

    setAddedToReport(true);
    setSnackbarSeverity("success");
    setSnackbarOpen(true);
  };

  /**
   * Handler for removing the current metric from the report
   * Updates local storage and shows confirmation message
   */
  const handleRemoveFromReport = () => {
    // Get existing metrics
    const existingMetrics = JSON.parse(localStorage.getItem(`report_metrics_${currentUser}`) || "[]");

    // Filter out this metric
    const filteredMetrics = existingMetrics.filter(m => m.uniqueKey !== uniqueKey);

    // Save back to localStorage
    localStorage.setItem(`report_metrics_${currentUser}`, JSON.stringify(filteredMetrics));

    setAddedToReport(false);
    setSnackbarMessage("Removed from report");
    setSnackbarSeverity("info");
    setSnackbarOpen(true);
  };

  /**
   * Handler for closing the snackbar notification
   */
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <Card
      sx={{
        minHeight: 420,
        display: "flex",
        flexDirection: "column",
        borderRadius: 3,
        boxShadow: 3,
        backgroundColor: "#fafafa"
      }}
    >
      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        <Typography variant="h6" align="center" fontWeight="bold" gutterBottom>
          {metric_label}
        </Typography>
        {addedToReport && (
          <Typography variant="caption" color="success.main" align="center" display="block" fontFamily="inherit" >
            ✅ Added to Report
          </Typography>
        )}

        <MatchedMetricsSelect
          matchedMetrics={matchedMetrics}
          selectedValue={selectedMatchedMetric}
          onChange={handleMatchedMetricsChange}
        />
        <ModelSelect
          modelUri={modelUri}
          onSelectModel={handleSelectModel}
          onOpenModels={handleOpenModels}
          modelsList={modelsList}
          loadingModels={loadingModels}
          errorModels={errorModels}
        />

        <Divider sx={{ my: 2 }} />

        <DataBox
          title="Framework Data"
          loading={loadingInputData}
          error={errorInputData}
          datasetResult={inputDatasetResult}
          selectedRecords={selectedInputRecords}
          onToggleRecord={handleSelectInputRecord}
          onLoadData={handleFetchInputData}
        />

        <DataBox
          title="PCA Data"
          loading={loadingPcaData}
          error={errorPcaData}
          datasetResult={pcaDatasetResult}
          selectedRecords={selectedPcaRecords}
          onToggleRecord={handleSelectPcaRecord}
          onLoadData={handleFetchPcaData}
        />

        <Divider sx={{ my: 2 }} />

        {loadingCalc && <Typography>Calculating score...</Typography>}
        {errorCalc && <Typography color="error">{errorCalc}</Typography>}
        {calcValue !== null && (
          <Typography sx={{ fontFamily: "inherit", fontWeight: "bold" }}>
            Score: {calcValue}
          </Typography>
        )}
      </CardContent>

      <CardActions sx={{ justifyContent: "center", pb: 2 }}>
        <Button
          variant="outlined"
          size="small"
          onClick={handleCalculateSum}
          sx={{
            fontFamily: "inherit",
            textTransform: "none",
            borderColor: "#000",
            color: "#000",
            fontWeight: 500,
            fontSize: "1rem",
            borderRadius: 1,
            boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.05)",
            "&:hover": {
              backgroundColor: "#f5f5f5",
              borderColor: "#000"
            }
          }}
        >
          Calculate Score
        </Button>

        {addedToReport ? (
          <Button
            variant="outlined"
            size="small"
            onClick={handleRemoveFromReport}
            sx={{
              fontFamily: "inherit",
              ml: 2,
              textTransform: "none",
              borderColor: "#ef4444",
              color: "#ef4444",
              fontWeight: 500,
              fontSize: "1em",
              borderRadius: 1,
              boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.05)",
              "&:hover": {
                backgroundColor: "#fef2f2",
                borderColor: "#dc2626",
                color: "#dc2626"
              }
            }}
          >
            Remove from Report
          </Button>
        ) : (
          <Button
            variant="outlined"
            size="small"
            onClick={handleAddToReport}
            sx={{
              fontFamily: "inherit",
              ml: 2,
              textTransform: "none",
              borderColor: "#000",
              color: "#000",
              fontWeight: 500,
              fontSize: "1em",
              borderRadius: 1,
              boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.05)",
              "&:hover": {
                backgroundColor: "#f0f9ff",
                borderColor: "#3b82f6",
                color: "#3b82f6"
              }
            }}
          >
            Add to Report
          </Button>
        )}
      </CardActions>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Card>
  );
}