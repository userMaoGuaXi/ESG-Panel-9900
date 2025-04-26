// src/components/GenerateReportButton.jsx
/**
 * GenerateReportButton Component
 * 
 * This component provides functionality to generate ESG (Environmental, Social, and Governance) reports
 * based on metrics that users have previously selected and stored in localStorage.
 * It allows users to generate either individual reports for each metric or a combined report.
 */
import React, { useState } from "react";
import {
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Typography,
  Chip,
  Divider,
  Snackbar,
  Alert,
  Box,
  FormControlLabel,
  Checkbox,
  TextField
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function GenerateReportButton() {
  const navigate = useNavigate();
  const currentUser = localStorage.getItem("currentUser") || "guest";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMetrics, setSelectedMetrics] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("info");
  const [combineReports, setCombineReports] = useState(true);
  const [reportName, setReportName] = useState("Combined ESG Report");

  /**
   * Handles the initial button click to generate a report.
   * Loads saved metrics from localStorage and opens the confirmation dialog.
   * Displays a warning if no metrics have been added to the report.
   */
  const handleGenerateReport = () => {
    // Load saved metrics from localStorage
    const metrics = JSON.parse(localStorage.getItem(`report_metrics_${currentUser}`) || "[]");
    if (metrics.length === 0) {
      setSnackbarMessage("No metrics added to report yet. Please add metrics first.");
      setSnackbarSeverity("warning");
      setSnackbarOpen(true);
      return;
    }

    setSelectedMetrics(metrics);
    setDialogOpen(true);
  };

  /**
   * Closes the generate report confirmation dialog.
   */
  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  /**
   * Handles the confirmation to generate reports.
   * Creates API requests for each selected metric and processes the responses
   * to create either individual reports or a combined report.
   */
  const handleConfirmGenerate = () => {
    setLoading(true);
    setError(null);

    // Create an array of promises for each metric
    const promises = selectedMetrics.map(metric =>
      axios.get("http://127.0.0.1:5001/report/generateReport", {
        params: {
          modelUri: metric.modelUri,
          industry: decodeURIComponent(metric.industry),
          metric_year: metric.metric_year,
          company: metric.company,
          selected_input: metric.selected_input,
          selected_pca: metric.selected_pca
        }
      })
    );

    // Execute all promises
    Promise.all(promises)
      .then(responses => {
        // All responses are successful
        setLoading(false);
        setDialogOpen(false);

        // Process the responses - create individual reports with full data
        const individualReports = responses.map((res, index) => ({
          metric: selectedMetrics[index].categories_label || selectedMetrics[index].metric_label,
          data: {
            ...res.data,
            // Make sure raw data is passed for metrics values
            raw_input: res.data.raw_input || {},
            raw_pca: res.data.raw_pca || {},

            models_for_metrics: Object
              .values(res.data.models_for_metrics || {})
              .flat()
              .map(m => ({
                model_label: m.model_label,
                model_uri: m.model_uri
              }))
          },
          original_metric: {
            uniqueKey: selectedMetrics[index].uniqueKey,
            modelUri: selectedMetrics[index].modelUri,
            metric_label: selectedMetrics[index].metric_label,
            categories_label: selectedMetrics[index].categories_label,
            model_name: selectedMetrics[index].model_label || getModelNameFromUri(selectedMetrics[index].modelUri)
          }
        }));

        let reportData;

        // Combine reports if option is selected
        if (combineReports) {
          // Create the combined report object - now with raw metric data
          const combinedReport = {
            metric: reportName || "Combined ESG Report",
            data: {
              ...individualReports[0].data, // Base data from first report
              company: individualReports[0].data.company,
              industry: individualReports[0].data.industry,
              metric_year: individualReports[0].data.metric_year,
              model_uri: "Combined Models",
              categories: individualReports.map(r => r.metric).join(", "),
              // Combine all selected inputs and PCAs
              selected_input: individualReports.map(r => r.data.selected_input).filter(Boolean).join(", "),
              selected_pca: individualReports.map(r => r.data.selected_pca).filter(Boolean).join(", "),
              // Calculate average score
              final_adjusted: individualReports.reduce((sum, report) => sum + report.data.final_adjusted, 0) / individualReports.length,
              // Sum up all values
              total_input_sum: individualReports.reduce((sum, report) => sum + (report.data.total_input_sum || 0), 0),
              total_pca_sum: individualReports.reduce((sum, report) => sum + (report.data.total_pca_sum || 0), 0),
              count_input: individualReports.reduce((sum, report) => sum + (report.data.count_input || 0), 0),
              count_pca: individualReports.reduce((sum, report) => sum + (report.data.count_pca || 0), 0),
              included_reports: individualReports.map(r => r.metric),
              // Store complete individual reports data
              individual_reports_data: individualReports,
              // Merge raw metric data from all reports
              raw_input: individualReports.reduce((combinedData, report) => {
                return [{ ...combinedData, ...report.data.raw_input }];
              }, {}),
              raw_pca: individualReports.reduce((combinedData, report) => {
                return [{ ...combinedData, ...report.data.raw_pca }];
              }, {})
            }
          };

          reportData = { reports: [combinedReport] };
          saveToHistory([combinedReport]);
        } else {
          // Keep reports separate
          reportData = { reports: individualReports };
          saveToHistory(individualReports);
        }

        // Navigate to report page with all the data
        navigate("/report", { state: reportData });

        // Show success message
        setSnackbarMessage("Report generated successfully!");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
      })
      .catch(err => {
        console.error("Error generating report:", err);
        setLoading(false);
        setError("Failed to generate report. Please try again later.");
        setSnackbarMessage("Failed to generate report");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      });
  };

  /**
   * Extracts a human-readable model name from a model URI.
   * Removes prefixes like "esg:" and "model_", converts underscores to spaces,
   * and capitalizes the first letter of each word.
   * 
   * @param {string} uri - The model URI to process
   * @returns {string} - A formatted, human-readable model name
   */
  const getModelNameFromUri = (uri) => {
    if (!uri) return "N/A";

    try {
      // Remove esg: prefix
      let modelName = uri.replace(/^esg:/, '');

      // Remove model_ prefix if it exists
      modelName = modelName.replace(/^model_/, '');

      // Convert underscores to spaces and capitalize first letter of each word
      modelName = modelName.split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      return modelName || uri;
    } catch (error) {
      return uri;
    }
  };

  /**
   * Saves generated report data to localStorage history.
   * Creates history entries with timestamps and summary data for each report.
   * 
   * @param {Array} reportData - Array of report objects to save to history
   */
  const saveToHistory = (reportData) => {
    try {
      // Get current history
      const currentHistory = JSON.parse(localStorage.getItem(`report_history_${currentUser}`) || "[]");

      // Create history items for each report
      const newHistoryItems = reportData.map((report, index) => {
        // Create unique ID
        const id = Date.now() + index;

        return {
          id,
          report_name: report.metric,
          generated_at: new Date().toISOString(),
          parameters: {
            modelUri: report.data.model_uri,
            industry: report.data.industry,
            metric_year: report.data.metric_year,
            company: report.data.company,
            selected_input: report.data.selected_input,
            selected_pca: report.data.selected_pca,
            categories: report.data.categories || report.metric, // Store categories for combined reports
            included_reports: report.data.included_reports || [], // Store the list of included reports
            individual_reports_data: report.data.individual_reports_data || [], // Store the complete individual reports data
            models_for_metrics: report.data.models_for_metrics || []
          },
          result_summary: {
            final_value: report.data.final_value,
            final_adjusted: report.data.final_adjusted,
            total_input_sum: report.data.total_input_sum,
            total_pca_sum: report.data.total_pca_sum,
            count_input: report.data.count_input,
            count_pca: report.data.count_pca,
            raw_input: report.data.raw_input || {},  // Store raw input metrics data
            raw_pca: report.data.raw_pca || {}  // Store raw PCA metrics data
          }
        };
      });

      // Merge and save new history
      const updatedHistory = [...newHistoryItems, ...currentHistory];
      localStorage.setItem(`report_history_${currentUser}`, JSON.stringify(updatedHistory));

    } catch (error) {
      console.error("Error saving to history:", error);
    }
  };

  /**
   * Handles clearing all metrics from the report after user confirmation.
   * Removes metrics from localStorage and refreshes the page to update all UI components.
   */
  const handleClearMetrics = () => {
    // Confirm before clearing
    if (window.confirm("Are you sure you want to clear all metrics from the report?")) {
      localStorage.removeItem(`report_metrics_${currentUser}`);
      setSelectedMetrics([]);
      setDialogOpen(false);
      setSnackbarMessage("All metrics cleared from report");
      setSnackbarSeverity("info");
      setSnackbarOpen(true);

      // Refresh the page to update UI states in all cards
      window.location.reload();
    }
  };

  /**
   * Closes the snackbar notification.
   */
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  /**
   * Updates the report name state when the text field changes.
   * 
   * @param {Event} e - The change event from the text field
   */
  const handleReportNameChange = (e) => {
    setReportName(e.target.value);
  };

  return (
    <>
      <Button
        onClick={handleGenerateReport}
        variant="outlined"
        size="small"
        sx={{
          fontFamily: "inherit",
          height: "40px",
          minWidth: "150px",
          textTransform: "none",
          borderColor: "#000",
          color: "#000",
          fontWeight: 500,
          borderRadius: 1,
          fontSize: "0.95rem",
          boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.05)",
          "&:hover": {
            backgroundColor: "#f5f5f5",
            borderColor: "#000"
          },
        }}
      >
        Generate Report
      </Button>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md">
        <DialogTitle>
          <Typography variant="h6" fontWeight="600">Generate Report</Typography>
        </DialogTitle>
        <DialogContent>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Typography color="error">{error}</Typography>
          ) : (
            <>
              {/* Report option controls */}
              <Box sx={{ mb: 3, mt: 1 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={combineReports}
                      onChange={(e) => setCombineReports(e.target.checked)}
                    />
                  }
                  label="Combine all metrics into a single report"
                />

                {combineReports && (
                  <TextField
                    fullWidth
                    label="Report Name"
                    variant="outlined"
                    size="small"
                    value={reportName}
                    onChange={handleReportNameChange}
                    sx={{ mt: 2 }}
                  />
                )}
              </Box>

              <Typography variant="body1" sx={{ mb: 2 }}>
                The following metrics will be included in your report:
              </Typography>
              <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                {selectedMetrics.length > 0 ? (
                  selectedMetrics.map((metric, index) => (
                    <React.Fragment key={metric.uniqueKey}>
                      <ListItem alignItems="flex-start">
                        <ListItemText
                          primary={
                            <Typography variant="subtitle1" fontWeight="500">
                              {metric.categories_label || metric.metric_label}
                            </Typography>
                          }
                          secondary={
                            <>
                              <Typography component="span" variant="body2" color="text.primary">
                                {metric.company} • {decodeURIComponent(metric.industry)} • {metric.metric_year.split("-")[0]}
                              </Typography>
                              <Box sx={{ mt: 1 }}>
                                {metric.selected_input && (
                                  <Chip
                                    label={`Input: ${metric.selected_input}`}
                                    size="small"
                                    sx={{ mr: 1, mb: 1, backgroundColor: '#e0f2fe', color: '#0369a1' }}
                                  />
                                )}
                                {metric.selected_pca && (
                                  <Chip
                                    label={`PCA: ${metric.selected_pca}`}
                                    size="small"
                                    sx={{ mr: 1, mb: 1, backgroundColor: '#dcfce7', color: '#166534' }}
                                  />
                                )}
                              </Box>
                            </>
                          }
                        />
                      </ListItem>
                      {index < selectedMetrics.length - 1 && <Divider component="li" />}
                    </React.Fragment>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No metrics added to report yet.
                  </Typography>
                )}
              </List>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, display: 'flex', justifyContent: 'space-between' }}>
          <Button
            onClick={handleClearMetrics}
            disabled={selectedMetrics.length === 0 || loading}
            sx={{
              color: '#ef4444',
              '&:hover': { backgroundColor: '#fef2f2' }
            }}
          >
            Clear All
          </Button>
          <Box>
            <Button onClick={handleCloseDialog} disabled={loading}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmGenerate}
              variant="outlined"
              disabled={selectedMetrics.length === 0 || loading}
              sx={{
                ml: 1,
                borderColor: "#000",
                color: "#000",
                '&:hover': {
                  backgroundColor: "#f5f5f5",
                  borderColor: "#000"
                }
              }}
            >
              Generate
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={5000}
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
    </>
  );
}