/**
 * ReportPage.jsx
 * 
 * Component responsible for displaying detailed ESG reports generated from metrics data.
 * Handles both individual and combined reports, displaying relevant metrics, values, 
 * and calculated ESG scores in a structured card layout.
 * 
 * @module ReportPage
 */

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Divider,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  Alert,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CircleIcon from '@mui/icons-material/Circle';
import Sidebar from '../components/Sidebar';

export default function ReportPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // State for report data and display configuration
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState(null);
  const [splitReports, setSplitReports] = useState([]);
  const [modelNameMapping, setModelNameMapping] = useState({})

  /**
   * Load model name mappings from local storage on component mount
   */
  useEffect(() => {
    const storedMapping = localStorage.getItem('model_name_mapping');
    if (storedMapping) {
      setModelNameMapping(JSON.parse(storedMapping));
    }
  }, []);

  /**
   * Process report data from location state
   * Splits combined reports into individual components for display
   */
  useEffect(() => {
    if (location.state && (location.state.reports || location.state.report_history)) {
      setReportData(location.state);

      // Process reports to split combined reports if needed
      if (location.state.reports) {
        const processedReports = [];

        location.state.reports.forEach(report => {
          // Check if this is a combined report with individual reports data stored
          const isCombined = report.data?.individual_reports_data &&
            report.data.individual_reports_data.length > 0;

          if (isCombined) {
            // We have stored individual reports data, so use those
            report.data.individual_reports_data.forEach(individualReport => {
              processedReports.push({
                metric: individualReport.metric,
                data: individualReport.data,
                isPartOfCombined: true,
                combinedName: report.metric,
                combinedScore: report.data.final_adjusted
              });
            });
          } else {
            // This is a regular individual report, keep as is
            processedReports.push(report);
          }
        });

        setSplitReports(processedReports);
      }
    } else {
      console.log("No report data available");
      setError("No report data available. Please generate a report from the dashboard.");
    }
  }, [location]);

  /**
   * Gets a human-readable model name from the model URI using the mapping
   * 
   * @param {string} uri - The model URI to convert to a readable name
   * @returns {string} The readable model name
   */
  const getModelName = (uri) => {
    if (!uri) return "N/A";
    return modelNameMapping[uri] || getModelNameFromUri(uri);
  };

  /**
   * Navigates back to the history page
   */
  const handleBack = () => {
    navigate('/history');
  };

  /**
   * Utility function to safely convert metric strings or arrays to arrays
   * Handles different possible input formats
   * 
   * @param {string|Array} input - The metrics data to process
   * @returns {Array} Array of metric names
   */
  const getMetricsArray = (input) => {
    if (!input) return [];
    if (typeof input === 'string') {
      return input.trim() ? input.split(',').map(item => item.trim()).filter(Boolean) : [];
    }
    if (Array.isArray(input)) return input;
    return [];
  };

  /**
   * Formats numeric values for display
   * 
   * @param {number} num - The number to format
   * @returns {string} Formatted number string with fixed decimal places
   */
  const formatNumber = (num) => {
    if (num === undefined || num === null) return "N/A";
    if (typeof num !== 'number') return num;
    return num.toFixed(5);
  };

  /**
   * Extracts a readable model name from a model URI
   * Processes the URI by removing prefixes and formatting
   * 
   * @param {string} uri - The model URI to process
   * @returns {string} Human-readable model name
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
   * Determines if the current view is a combined report
   * 
   * @returns {boolean} True if the report is a combined report
   */
  const isCombinedReportView = () => {
    return (
      reportData?.reports &&
      reportData.reports.length === 1 &&
      reportData.reports[0].data?.individual_reports_data &&
      reportData.reports[0].data.individual_reports_data.length > 0
    );
  };

  /**
   * Retrieves raw metric values from report data
   * 
   * @param {Object} reportData - The report data object
   * @param {string} metricType - Type of metric ('input' or 'pca')
   * @param {string} metricName - Name of the specific metric
   * @returns {Array} Array of metric values
   */
  const getMetricValues = (reportData, metricType, metricName) => {
    if (!reportData || !reportData.data) return [];

    // Access the raw data from the result summary
    const rawData =
      metricType === 'input'
        ? reportData.data.raw_input
        : reportData.data.raw_pca;

    if (!rawData || !rawData[metricName]) return [];

    // Return the array of values
    return rawData[metricName];
  };



  return (
    <Box sx={{ display: "flex", backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      {/* Navigation sidebar */}
      <Sidebar />

      {/* Main content container */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          backgroundColor: "#f5f5f5",
          minHeight: "100vh",
          maxWidth: "1000px",  // 限制最大宽度

        }}
      >
        {/* Main paper container */}
        <Paper
          elevation={3}
          sx={{
            mb: 3,
            p: 2,
            borderRadius: 2,
          }}
        >
          {/* Header with navigation button */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={handleBack}
              sx={{ mr: 2 }}
            >
              Back
            </Button>
            <Typography variant="h5" fontWeight="600">ESG Report</Typography>
          </Box>
          <Divider />

          {/* Conditional rendering based on data availability and loading state */}
          {error ? (
            <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
          ) : !reportData ? (
            <Box sx={{ mt: 2, p: 2, textAlign: 'center' }}>
              <Typography>Loading report data...</Typography>
            </Box>
          ) : (
            <Box sx={{ mt: 2 }}>
              {/* Header for combined report - shown only for combined reports */}
              {isCombinedReportView() && (
                <Box
                  sx={{
                    p: 2,
                    mb: 3,
                    borderRadius: 2,
                    backgroundColor: '#f0f9ff',
                    border: '1px solid #bfdbfe',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <Box>
                    <Typography variant="h6" fontWeight="600" color="#0369a1">
                      {reportData.reports[0].metric}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Combined ESG Score: {formatNumber(reportData.reports[0].data.final_adjusted)}
                    </Typography>
                  </Box>
                  <Chip label="Combined Report" color="primary" sx={{ backgroundColor: '#4f46e5' }} />
                </Box>
              )}

              {/* Grid of report cards */}
              {splitReports.length > 0 ? (
                <Grid container spacing={3}>
                  {splitReports.map((report, index) => (
                    <Grid item xs={12} md={6} key={index}>
                      <Card sx={{
                        borderRadius: 2,
                        boxShadow: 2,
                        ...(report.isPartOfCombined && {
                          border: '1px solid #e0e7ff'
                        })
                      }}>
                        <CardContent>
                          {/* Report header with name and combined indicator */}
                          <Box sx={{
                            mb: 2,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',

                          }}>
                            <Typography variant="h6" gutterBottom color="primary">
                              {report.metric || "Category"}
                            </Typography>

                            {report.isPartOfCombined && (
                              <Tooltip title={`Part of ${report.combinedName}`}>
                                <Chip
                                  label="Combined"
                                  size="small"
                                  sx={{ backgroundColor: '#e0e7ff', color: '#4f46e5' }}
                                />
                              </Tooltip>
                            )}
                          </Box>

                          <Divider sx={{ mb: 2 }} />

                          {/* Report metadata display */}
                          <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                            <Box sx={{ minWidth: 200, flex: 1 }}>
                              <Typography variant="body2" color="text.secondary">
                                <strong>Company:</strong> {report.data?.company || "N/A"}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                <strong>Industry:</strong> {report.data?.industry || "N/A"}
                              </Typography>
                            </Box>
                            <Box sx={{ minWidth: 200, flex: 1 }}>
                              <Typography variant="body2" color="text.secondary">
                                <strong>Year:</strong>{" "}
                                {report.data?.metric_year
                                  ? report.data.metric_year.split("-")[0]
                                  : "N/A"}
                              </Typography>
                              {/* <Typography variant="body2" color="text.secondary">
                                <strong>Model:</strong>{" "}
                                {report.data.models_for_metrics && report.data.models_for_metrics.length > 0
                                  ? report.data.models_for_metrics.map(m => m.model_label).join(", ")
                                  : getModelName(report.data.modelUri || report.data.model_uri)
                                }
                              </Typography> */}
                              <Typography variant="body2" color="text.secondary">
                                <strong>Model:</strong>{" "}

                                {report.data && report.data.models_for_metrics && report.data.models_for_metrics.length > 0
                                  ? report.data.models_for_metrics.map(m => m.model_label).join(", ")
                                  :
                                  (report.data && report.data.modelUri
                                    ? getModelNameFromUri(report.data.modelUri)
                                    : "N/A")
                                }
                              </Typography>


                            </Box>
                          </Box>

                          {/* ESG Score display */}
                          <Box sx={{
                            py: 2,
                            px: 3,
                            backgroundColor: report.isPartOfCombined ? '#f5f3ff' : '#f8f9fa',
                            borderRadius: 2,
                            mb: 3,
                            textAlign: 'center',
                            ...(report.isPartOfCombined && {
                              border: '1px solid #e9d5ff'
                            })
                          }}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                              ESG Score
                            </Typography>
                            <Typography
                              variant="h5"
                              fontWeight="600"
                              color={report.isPartOfCombined ? "#7c3aed" : "#10b981"}
                            >
                              {formatNumber(report.data?.final_adjusted)}
                            </Typography>
                          </Box>

                          {/* Input Metrics Accordion Section */}
                          <Accordion
                            sx={{
                              mb: 2,
                              boxShadow: 'none',
                              '&:before': { display: 'none' },
                              backgroundColor: '#f8fafc'
                            }}
                          >
                            <AccordionSummary
                              expandIcon={<ExpandMoreIcon />}
                              aria-controls="panel1a-content"
                              id="panel1a-header"
                              sx={{ py: 0 }}
                            >
                              <Typography variant="subtitle2">Input Metrics</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                              {report.data?.selected_input && getMetricsArray(report.data.selected_input).length > 0 ? (
                                <Box>
                                  {getMetricsArray(report.data.selected_input).map((input, i) => {
                                    const metricValues = getMetricValues(report, 'input', input);

                                    return (
                                      <Box key={i} sx={{ mb: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                          <CircleIcon sx={{ fontSize: 10, mr: 1, color: '#0369a1' }} />
                                          <Typography variant="body2" fontWeight="500">
                                            {input}
                                          </Typography>
                                        </Box>

                                        {/* Table of metric values */}
                                        {metricValues && metricValues.length > 0 ? (
                                          <TableContainer sx={{ backgroundColor: 'transparent', ml: 2 }}>
                                            <Table size="small">
                                              <TableHead>
                                                <TableRow>
                                                  <TableCell align="left" sx={{ fontWeight: 500, fontSize: '0.75rem', p: 1 }}>
                                                    Value
                                                  </TableCell>
                                                  <TableCell align="center" sx={{ fontWeight: 500, fontSize: '0.75rem', p: 1 }}>
                                                    Unit
                                                  </TableCell>
                                                </TableRow>
                                              </TableHead>
                                              <TableBody>
                                                {metricValues.map((val, idx) => (
                                                  <TableRow key={idx}>
                                                    <TableCell align="left" sx={{ fontSize: '0.75rem', p: 1 }}>
                                                      {val.metric_value !== undefined
                                                        ? val.metric_value
                                                        : (val.standardized_value !== undefined
                                                          ? 'Standardized: ' + val.standardized_value.toFixed(6)
                                                          : 'N/A')}
                                                    </TableCell>
                                                    <TableCell align="center" sx={{ fontSize: '0.75rem', p: 1 }}>
                                                      {val.metric_unit || '-'}
                                                    </TableCell>
                                                  </TableRow>
                                                ))}
                                              </TableBody>
                                            </Table>
                                          </TableContainer>



                                        ) : (
                                          <Typography variant="caption" color="text.secondary" sx={{ ml: 3 }}>
                                            No values available
                                          </Typography>
                                        )}
                                      </Box>
                                    );
                                  })}
                                </Box>
                              ) : (
                                <Typography variant="caption" color="text.secondary">No Selected Metrics</Typography>
                              )}
                            </AccordionDetails>
                          </Accordion>

                          {/* PCA Metrics Accordion Section */}
                          <Accordion
                            sx={{
                              boxShadow: 'none',
                              '&:before': { display: 'none' },
                              backgroundColor: '#f8fafc'
                            }}
                          >
                            <AccordionSummary
                              expandIcon={<ExpandMoreIcon />}
                              aria-controls="panel2a-content"
                              id="panel2a-header"
                              sx={{ py: 0 }}
                            >
                              <Typography variant="subtitle2">PCA Metrics</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                              {report.data?.selected_pca && getMetricsArray(report.data.selected_pca).length > 0 ? (
                                <Box>
                                  {getMetricsArray(report.data.selected_pca).map((pca, i) => {
                                    const metricValues = getMetricValues(report, 'pca', pca);

                                    return (
                                      <Box key={i} sx={{ mb: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                          <CircleIcon sx={{ fontSize: 10, mr: 1, color: '#166534' }} />
                                          <Typography variant="body2" fontWeight="500">
                                            {pca}
                                          </Typography>
                                        </Box>

                                        {/* Table of PCA metric values */}
                                        {metricValues && metricValues.length > 0 ? (
                                          <TableContainer sx={{ backgroundColor: 'transparent', ml: 2 }}>
                                            <Table size="small">
                                              <TableHead>
                                                <TableRow>
                                                  <TableCell align="left" sx={{ fontWeight: 500, fontSize: '0.75rem', p: 1 }}>
                                                    Value
                                                  </TableCell>
                                                  <TableCell align="center" sx={{ fontWeight: 500, fontSize: '0.75rem', p: 1 }}>
                                                    Unit
                                                  </TableCell>
                                                </TableRow>
                                              </TableHead>
                                              <TableBody>
                                                {metricValues.map((val, idx) => (
                                                  <TableRow key={idx}>
                                                    <TableCell align="left" sx={{ fontSize: '0.75rem', p: 1 }}>
                                                      {val.metric_value !== undefined
                                                        ? val.metric_value
                                                        : (val.standardized_value !== undefined
                                                          ? 'Standardized: ' + val.standardized_value.toFixed(6)
                                                          : 'N/A')}
                                                    </TableCell>
                                                    <TableCell align="center" sx={{ fontSize: '0.75rem', p: 1 }}>
                                                      {val.metric_unit || '-'}
                                                    </TableCell>
                                                  </TableRow>
                                                ))}
                                              </TableBody>
                                            </Table>
                                          </TableContainer>

                                        ) : (
                                          <Typography variant="caption" color="text.secondary" sx={{ ml: 3 }}>
                                            No values available
                                          </Typography>
                                        )}
                                      </Box>
                                    );
                                  })}
                                </Box>
                              ) : (
                                <Typography variant="caption" color="text.secondary">No Selected Metrics</Typography>
                              )}
                            </AccordionDetails>
                          </Accordion>
                        </CardContent>
                        {/* <CardActions>
                          <Button 
                            size="small"
                            sx={{
                              color: '#0891b2'
                            }}
                          >
                            View Details
                          </Button>
                        </CardActions> */}
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Alert severity="info">No reports were generated. Please try adding some metrics and generating a report.</Alert>
              )}
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  );
}