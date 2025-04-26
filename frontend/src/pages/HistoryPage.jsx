/**
 * HistoryPage.jsx
 * 
 * Component responsible for displaying and managing report history.
 * This page allows users to view, access details, and manage previously generated ESG reports.
 * The component includes functionality for displaying report metadata, accessing detailed information,
 * deleting records, and navigating to full report views.
 * 
 * @module HistoryPage
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Divider,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Chip,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import VisibilityIcon from '@mui/icons-material/Visibility';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import Sidebar from '../components/Sidebar';

export default function HistoryPage() {
  const navigate = useNavigate();

  // State declarations for managing report history and UI state
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [detailDialog, setDetailDialog] = useState({
    open: false,
    data: null
  });
  const [expandedCategories, setExpandedCategories] = useState(false);
  const currentUser = localStorage.getItem("currentUser") || "guest";

  /**
   * Effect hook to fetch report history when component mounts
   */
  useEffect(() => {
    fetchReportHistory();
  }, []);

  /**
   * Fetches report history from localStorage for the current user
   * Sets loading and error states appropriately during the process
   */
  const fetchReportHistory = () => {
    setLoading(true);
    setError(null);

    try {
      // Get history data from localStorage
      const savedHistory = localStorage.getItem(`report_history_${currentUser}`);

      if (savedHistory) {
        setHistoryData(JSON.parse(savedHistory));
      } else {
        // If no data in localStorage, set empty array
        setHistoryData([]);
      }
    } catch (err) {
      console.error("Error fetching history:", err);
      setError("Failed to load report history. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Utility function to safely convert input/PCA metrics into arrays
   * Handles different input formats (string, array) and returns a consistent array output
   * 
   * @param {string|Array} input - The input metrics either as comma-separated string or array
   * @returns {Array} Normalized array of metrics
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
   * Opens the details dialog for a specific report record
   * 
   * @param {Object} record - The report record to display details for
   */
  const handleViewDetails = (record) => {
    setDetailDialog({
      open: true,
      data: record
    });
    setExpandedCategories(false);
  };

  /**
   * Toggles the expanded state of categories section in the detail dialog
   */
  const handleToggleCategories = () => {
    setExpandedCategories(!expandedCategories);
  };

  /**
   * Handles the deletion of a report record
   * Prompts for confirmation before removing from state and localStorage
   * 
   * @param {string} id - ID of the record to delete
   */
  const handleDeleteRecord = (id) => {
    if (window.confirm('Are you sure you want to delete this report history?')) {
      const updatedHistory = historyData.filter(item => item.id !== id);
      setHistoryData(updatedHistory);
      localStorage.setItem(`report_history_${currentUser}`, JSON.stringify(updatedHistory));
    }
  };

  /**
   * Navigates to the report view page with the selected report data
   * Handles both individual and combined reports with appropriate data structure
   * 
   * @param {Object} record - The report record to view
   */
  const handleViewReport = (record) => {
    // Check if this is a combined report with individual reports data
    const hasCombinedData = record.parameters.individual_reports_data &&
      record.parameters.individual_reports_data.length > 0;

    // Build report data format
    let reportData;

    if (hasCombinedData) {
      // For combined reports, include all the individual reports data
      reportData = {
        reports: [
          {
            metric: record.report_name,
            data: {
              ...record.parameters,
              ...record.result_summary,
              included_reports: record.parameters.included_reports || [],
              categories: record.parameters.categories || "",
              individual_reports_data: record.parameters.individual_reports_data,
              // Include raw metric data
              raw_input: record.result_summary.raw_input || {},
              raw_pca: record.result_summary.raw_pca || {}
            }
          }
        ]
      };
    } else {
      // For individual reports, use the standard format
      reportData = {
        reports: [
          {
            metric: record.report_name,
            data: {
              ...record.parameters,
              ...record.result_summary,
              // Include raw metric data
              raw_input: record.result_summary.raw_input || {},
              raw_pca: record.result_summary.raw_pca || {}
            }
          }
        ]
      };
    }

    // Navigate to report page with data
    navigate('/report', { state: reportData });
  };

  /**
   * Closes the detail dialog
   */
  const handleCloseDialog = () => {
    setDetailDialog({
      open: false,
      data: null
    });
  };

  /**
   * Determines if a report record is a combined report based on its structure
   * Checks multiple possible indicators for combined reports
   * 
   * @param {Object} record - The report record to evaluate
   * @returns {boolean} True if the record is a combined report
   */
  const isCombinedReport = (record) => {
    return (
      record.parameters.individual_reports_data &&
      record.parameters.individual_reports_data.length > 0
    ) || (
        record.parameters.categories &&
        record.parameters.categories !== record.report_name
      ) || (
        record.parameters.included_reports &&
        record.parameters.included_reports.length > 0
      );
  };

  /**
   * Extracts categories array from record based on different possible data structures
   * Handles multiple formats of category information with precedence order
   * 
   * @param {Object} record - The report record to extract categories from
   * @returns {Array} Array of category names
   */
  const getCategoriesArray = (record) => {
    // First check for individual_reports_data
    if (record.parameters.individual_reports_data && record.parameters.individual_reports_data.length > 0) {
      return record.parameters.individual_reports_data.map(r => r.metric);
    }

    // Then check for included_reports array
    if (record.parameters.included_reports && record.parameters.included_reports.length > 0) {
      return record.parameters.included_reports;
    }

    // Finally try to parse categories string
    if (record.parameters.categories && typeof record.parameters.categories === 'string') {
      return record.parameters.categories.split(',').map(item => item.trim()).filter(Boolean);
    }

    return [];
  };

  /**
   * Extracts and formats a readable model name from URI
   * Transforms model URI format to human-readable display format
   * 
   * @param {string} uri - The model URI to parse
   * @returns {string} Formatted model name
   */
  const getModelNameFromUri = (uri) => {
    if (!uri) return "N/A";

    // Attempt to extract the model name from the URI
    try {
      // First remove the esg: prefix
      let modelName = uri.replace(/^esg:/, '');

      // Remove model_ prefix if it exists
      modelName = modelName.replace(/^model_/, '');

      // Convert underscores to spaces and capitalize first letter of each word
      modelName = modelName.split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      // If the model name is empty, return the original URI
      return modelName || uri;
    } catch (error) {
      // If an error occurs during processing, return the original URI
      return uri;
    }
  };

  /**
   * Formats a date string to localized date-time format
   * 
   * @param {string} dateString - The date string to format
   * @returns {string} Formatted date string
   */
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  /**
   * Navigates back to the dashboard page
   */
  const handleBackToDashboard = () => {
    navigate('/dashboard');
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
        }}
      >
        {/* Header section with back button and title */}
        <Paper
          elevation={3}
          sx={{
            mb: 3,
            p: 2,
            borderRadius: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={handleBackToDashboard}
              sx={{ mr: 2 }}
            >
              Back
            </Button>
            <Typography variant="h5" fontWeight="600">Report History</Typography>
          </Box>
          <Divider />

          {/* Conditional rendering based on loading and data states */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>
          ) : historyData.length === 0 ? (
            <Alert severity="info" sx={{ mt: 3 }}>
              No report history found. Generate reports from the dashboard to see them here.
            </Alert>
          ) : (
            <Box sx={{ mt: 3 }}>
              {/* Report history data table */}
              <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Report Name</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Company</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Industry</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Generated At</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>ESG Score</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {historyData.map((record) => {
                      const combined = isCombinedReport(record);
                      return (
                        <TableRow
                          key={record.id}
                          hover
                          sx={{
                            '&:hover': {
                              backgroundColor: 'rgba(0, 0, 0, 0.04)'
                            },
                            ...(combined && {
                              backgroundColor: 'rgba(79, 70, 229, 0.03)'
                            })
                          }}
                        >
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              {record.report_name}
                              {combined && (
                                <Chip
                                  label="Combined"
                                  size="small"
                                  sx={{ ml: 1, backgroundColor: '#e0e7ff', color: '#4f46e5', height: 20 }}
                                />
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>{record.parameters.company}</TableCell>
                          <TableCell>{record.parameters.industry}</TableCell>
                          <TableCell>{formatDate(record.generated_at)}</TableCell>
                          <TableCell>
                            <Chip
                              label={record.result_summary.final_adjusted.toFixed(5)}
                              color="primary"
                              size="small"
                              sx={{
                                backgroundColor: combined ? '#4f46e5' : '#10b981',
                                color: 'white',
                                fontWeight: 'bold'
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex' }}>
                              <Tooltip title="View Details">
                                <IconButton
                                  size="small"
                                  onClick={() => handleViewDetails(record)}
                                  sx={{ color: '#0891b2' }}
                                >
                                  <InfoOutlinedIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="View Report">
                                <IconButton
                                  size="small"
                                  onClick={() => handleViewReport(record)}
                                  sx={{ color: '#2563eb' }}
                                >
                                  <VisibilityIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete">
                                <IconButton
                                  size="small"
                                  onClick={() => handleDeleteRecord(record.id)}
                                  sx={{ color: '#ef4444' }}
                                >
                                  <DeleteOutlineIcon />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </Paper>
      </Box>

      {/* Details dialog for displaying comprehensive report information */}
      <Dialog
        open={detailDialog.open}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        {detailDialog.data && (
          <>
            <DialogTitle>
              <Typography variant="h6" fontWeight="600">
                {detailDialog.data.report_name} Details
              </Typography>
            </DialogTitle>
            <DialogContent dividers>
              {/* Report Information Section */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                  Report Information
                </Typography>
                <Box sx={{
                  p: 2,
                  backgroundColor: 'rgba(0,0,0,0.02)',
                  borderRadius: 1.5,
                  border: '1px solid rgba(0,0,0,0.05)'
                }}>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        <strong>ID:</strong> {detailDialog.data.id}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Generated At:</strong> {formatDate(detailDialog.data.generated_at)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Company:</strong> {detailDialog.data.parameters.company}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Industry:</strong> {detailDialog.data.parameters.industry}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Year:</strong> {detailDialog.data.parameters.metric_year}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      {/* <Typography variant="body2" color="text.secondary">
                        <strong>Model:</strong> {getModelNameFromUri(detailDialog.data.parameters.modelUri)}
                      </Typography> */}
                      <Typography variant="body2" color="text.secondary">
                        <strong>Model:</strong> {
                          detailDialog.data.parameters.modelUri === "Combined Models" ?
                            "Combined Models" :
                            (detailDialog.data.parameters.models_for_metrics &&
                              detailDialog.data.parameters.models_for_metrics.length > 0
                              ? detailDialog.data.parameters.models_for_metrics.map(m => m.model_label).join(", ")
                              : getModelNameFromUri(detailDialog.data.parameters.modelUri))
                        }
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Box>

              {/* Included Categories Section - only for combined reports */}
              {isCombinedReport(detailDialog.data) && (
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, cursor: 'pointer' }} onClick={handleToggleCategories}>
                    <Typography variant="subtitle1" fontWeight="600" sx={{ mr: 1 }}>
                      Included Categories
                    </Typography>
                    <IconButton size="small">
                      {expandedCategories ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                  </Box>

                  <Collapse in={expandedCategories}>
                    <Box sx={{
                      p: 2,
                      backgroundColor: 'rgba(0,0,0,0.02)',
                      borderRadius: 1.5,
                      border: '1px solid rgba(0,0,0,0.05)'
                    }}>
                      <List dense>
                        {getCategoriesArray(detailDialog.data).map((category, index) => (
                          <ListItem key={index} dense>
                            <ListItemIcon sx={{ minWidth: 30 }}>
                              <CheckCircleOutlineIcon fontSize="small" color="primary" />
                            </ListItemIcon>
                            <ListItemText primary={category} />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  </Collapse>
                </Box>
              )}

              {/* Parameters Section - displays metrics used in the report */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                  Parameters
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Input Metrics:</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {detailDialog.data.parameters.selected_input ? (
                      getMetricsArray(detailDialog.data.parameters.selected_input).map((input, i) => (
                        <Chip
                          key={i}
                          label={input}
                          size="small"
                          sx={{ backgroundColor: '#e0f2fe', color: '#0369a1' }}
                        />
                      ))
                    ) : (
                      <Typography variant="caption" color="text.secondary">No Selected Metrics</Typography>
                    )}
                  </Box>
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>PCA Metrics:</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {detailDialog.data.parameters.selected_pca ? (
                      getMetricsArray(detailDialog.data.parameters.selected_pca).map((pca, i) => (
                        <Chip
                          key={i}
                          label={pca}
                          size="small"
                          sx={{ backgroundColor: '#dcfce7', color: '#166534' }}
                        />
                      ))
                    ) : (
                      <Typography variant="caption" color="text.secondary">No Selected Metrics</Typography>
                    )}
                  </Box>
                </Box>
              </Box>

              {/* Results Section - displays report results and calculations */}
              <Box>
                <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                  Results
                </Typography>
                <Card sx={{
                  borderRadius: 2,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  backgroundColor: 'rgba(0,0,0,0.01)'
                }}>
                  <CardContent>
                    <Box sx={{
                      p: 3,
                      textAlign: 'center',
                      backgroundColor: 'white',
                      borderRadius: 2,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                      mb: 3
                    }}>
                      <Typography variant="body2" color="text.secondary">
                        ESG Score
                      </Typography>
                      <Typography variant="h4" fontWeight="600" color={isCombinedReport(detailDialog.data) ? "#4f46e5" : "#10b981"}>
                        {detailDialog.data.result_summary.final_adjusted.toFixed(5)}
                      </Typography>
                    </Box>

                    <Box sx={{ mt: 3 }}>
                      <Grid container spacing={2}>
                        <Grid item xs={6} sm={3}>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Input Sum
                          </Typography>
                          <Typography variant="body1" fontWeight="500">
                            {detailDialog.data.result_summary.total_input_sum.toFixed(2)}
                          </Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Typography variant="caption" color="text.secondary" display="block">
                            PCA Sum
                          </Typography>
                          <Typography variant="body1" fontWeight="500">
                            {detailDialog.data.result_summary.total_pca_sum.toFixed(2)}
                          </Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Input Count
                          </Typography>
                          <Typography variant="body1" fontWeight="500">
                            {detailDialog.data.result_summary.count_input}
                          </Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Typography variant="caption" color="text.secondary" display="block">
                            PCA Count
                          </Typography>
                          <Typography variant="body1" fontWeight="500">
                            {detailDialog.data.result_summary.count_pca}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Close</Button>
              <Button
                variant="outlined"
                onClick={() => {
                  handleCloseDialog();
                  handleViewReport(detailDialog.data);
                }}
                sx={{
                  borderColor: "#000",
                  color: "#000",
                  '&:hover': {
                    backgroundColor: "#f5f5f5",
                    borderColor: "#000"
                  }
                }}
              >
                View Full Report
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}

/**
 * Custom Grid component implementation
 * Provides grid functionality similar to Material-UI Grid without direct dependency
 * Uses Box component with CSS Flexbox for layouts
 * 
 * @param {Object} props - Component properties including grid configuration
 * @param {boolean} props.container - If true, acts as a container for grid items
 * @param {boolean} props.item - If true, acts as a grid item 
 * @param {number} props.xs - Grid size for extra-small screens (1-12)
 * @param {number} props.sm - Grid size for small screens (1-12)
 * @param {number} props.md - Grid size for medium screens (1-12)
 * @param {number} props.lg - Grid size for large screens (1-12)
 * @param {number} props.spacing - Spacing between grid items
 * @returns {JSX.Element} Configured Box component with grid behavior
 */
const Grid = ({ container, item, xs, sm, md, lg, spacing, children, ...props }) => {
  return (
    <Box
      sx={{
        display: container ? 'flex' : 'block',
        flexWrap: container ? 'wrap' : 'nowrap',
        width: item ? (xs === 12 ? '100%' : `${(xs / 12) * 100}%`) : '100%',
        ...(container && spacing && { margin: -spacing / 2 }),
        ...(item && spacing && { padding: spacing / 2 }),
        ...(sm && {
          '@media (min-width: 600px)': {
            width: sm === 12 ? '100%' : `${(sm / 12) * 100}%`
          }
        }),
        ...(md && {
          '@media (min-width: 900px)': {
            width: md === 12 ? '100%' : `${(md / 12) * 100}%`
          }
        }),
        ...(lg && {
          '@media (min-width: 1200px)': {
            width: lg === 12 ? '100%' : `${(lg / 12) * 100}%`
          }
        }),
        ...props
      }}
    >
      {children}
    </Box>
  );
};